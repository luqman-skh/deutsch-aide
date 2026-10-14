from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from app.services.auth_service import get_optional_user
from app.services.supabase_client import db_service
from app.models.schemas import ProgressSyncRequest, ProgressSyncResponse, UserProfileSchema

router = APIRouter(prefix="/progress", tags=["Progress"])

# In-memory session store for guest users or offline fallback
in_memory_user_progress: Dict[str, Any] = {}

@router.post("/sync", response_model=ProgressSyncResponse)
async def sync_progress(
    data: ProgressSyncRequest,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Syncs user progress, XP, streak, and word mastery to Supabase database tables:
    - user_profiles
    - user_word_progress
    - user_grammar_progress
    - user_daily_activity
    Falls back to in-memory store for guest users or if database is unreachable.
    """
    user_id = user.get("id") if user else (
        data.profile.user_id if data.profile and data.profile.user_id else "guest"
    )

    if db_service.client and user_id != "guest":
        try:
            # 1. Upsert user_profiles
            if data.profile:
                profile_record = {
                    "user_id": user_id,
                    "email": user.get("email") or data.profile.email,
                    "display_name": data.profile.name,
                    "target_level": data.profile.target_level,
                    "xp": data.profile.xp,
                    "level": data.profile.level,
                    "level_title": data.profile.level_title,
                    "streak": data.profile.streak,
                    "last_active_date": data.profile.last_active_date or None,
                    "daily_goal": data.profile.daily_goal,
                    "today_words_practiced": data.profile.today_words_practiced,
                    "today_date": data.profile.today_date or None,
                    "rush_high_score": data.profile.rush_high_score,
                    "theme": data.profile.theme,
                    "language": data.profile.language,
                    "sound_effects": data.profile.sound_effects,
                    "speech_speed": data.profile.speech_speed,
                }
                db_service.client.table("user_profiles").upsert(profile_record, on_conflict="user_id").execute()

                # Sync user_daily_activity
                if data.profile.today_date:
                    try:
                        daily_rec = {
                            "user_id": user_id,
                            "activity_date": data.profile.today_date,
                            "words_practiced": data.profile.today_words_practiced,
                            "xp_earned": data.profile.xp,
                        }
                        db_service.client.table("user_daily_activity").upsert(
                            daily_rec, on_conflict="user_id,activity_date"
                        ).execute()
                    except Exception as daily_err:
                        print(f"[WARNING] user_daily_activity upsert warning: {daily_err}")

            # 2. Upsert user_word_progress
            if data.words_progress:
                word_map = db_service.get_word_id_map()
                word_records = []
                for k, v in data.words_progress.items():
                    word_key = (v.word_key or k).lower().strip()
                    word_id = word_map.get(word_key)
                    if not word_id:
                        continue

                    status = "known" if v.mastery >= 2 else "learning"
                    word_records.append({
                        "user_id": user_id,
                        "word_id": word_id,
                        "word_key": word_key,
                        "learning_status": status,
                        "mastery": v.mastery,
                        "times_reviewed": v.times_reviewed,
                        "times_correct": v.times_correct,
                        "times_incorrect": v.times_incorrect,
                        "last_reviewed_at": v.last_reviewed_at or None,
                        "next_review_at": v.next_review_at or None,
                        "starred": v.starred,
                    })

                for i in range(0, len(word_records), 100):
                    batch = word_records[i:i + 100]
                    db_service.client.table("user_word_progress").upsert(
                        batch, on_conflict="user_id,word_key"
                    ).execute()

            # 3. Upsert user_grammar_progress
            if data.grammar_progress:
                grammar_records = []
                for k, v in data.grammar_progress.items():
                    rule_id = v.rule_id or k
                    grammar_records.append({
                        "user_id": user_id,
                        "rule_id": rule_id,
                        "learned": v.learned,
                        "starred": v.starred,
                        "quiz_score": v.quiz_score or 0,
                        "times_reviewed": v.times_reviewed,
                        "last_studied_at": v.last_studied_at or None,
                    })

                for i in range(0, len(grammar_records), 100):
                    batch = grammar_records[i:i + 100]
                    db_service.client.table("user_grammar_progress").upsert(
                        batch, on_conflict="user_id,rule_id"
                    ).execute()

            # Keep in-memory cache in sync
            in_memory_user_progress[user_id] = {
                "profile": data.profile,
                "words": data.words_progress,
                "grammar": data.grammar_progress,
            }

            return ProgressSyncResponse(
                success=True,
                message="Progress synced successfully with Supabase Cloud.",
                profile=data.profile
            )
        except Exception as e:
            print(f"[ERROR] Supabase sync error: {e}")

    # Fallback to session memory for guests or on DB error
    in_memory_user_progress[user_id] = {
        "profile": data.profile,
        "words": data.words_progress,
        "grammar": data.grammar_progress
    }

    return ProgressSyncResponse(
        success=True,
        message="Progress saved to session memory.",
        profile=data.profile
    )

@router.get("")
async def get_progress(user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    """
    Get saved progress for the current user from Supabase tables or memory.
    """
    user_id = user.get("id") if user else "guest"

    if db_service.client and user_id != "guest":
        try:
            # 1. Fetch user_profiles
            p_res = db_service.client.table("user_profiles").select("*").eq("user_id", user_id).limit(1).execute()
            profile = None
            if p_res.data and len(p_res.data) > 0:
                p_row = p_res.data[0]
                profile = {
                    "name": p_row.get("display_name", "Deutschlerner"),
                    "email": p_row.get("email"),
                    "targetLevel": p_row.get("target_level", "A1"),
                    "xp": p_row.get("xp", 0),
                    "level": p_row.get("level", 1),
                    "levelTitle": p_row.get("level_title", "Anfänger (Novice)"),
                    "streak": p_row.get("streak", 0),
                    "lastActiveDate": p_row.get("last_active_date"),
                    "dailyGoal": p_row.get("daily_goal", 15),
                    "todayWordsPracticed": p_row.get("today_words_practiced", 0),
                    "todayDate": p_row.get("today_date"),
                    "rushHighScore": p_row.get("rush_high_score", 0),
                    "theme": p_row.get("theme", "dark"),
                    "language": p_row.get("language", "de"),
                    "soundEffects": p_row.get("sound_effects", True),
                    "speechSpeed": float(p_row.get("speech_speed", 1.0)),
                    "activityHistory": {},
                }

            # 2. Fetch user_word_progress
            w_res = db_service.client.table("user_word_progress").select("*").eq("user_id", user_id).limit(2000).execute()
            words_progress = {}
            if w_res.data:
                for row in w_res.data:
                    key = (row.get("word_key") or "").lower().strip()
                    if key:
                        words_progress[key] = {
                            "wordKey": key,
                            "mastery": row.get("mastery", 0),
                            "timesReviewed": row.get("times_reviewed", 0),
                            "timesCorrect": row.get("times_correct", 0),
                            "timesIncorrect": row.get("times_incorrect", 0),
                            "lastReviewedAt": row.get("last_reviewed_at"),
                            "nextReviewAt": row.get("next_review_at"),
                            "starred": row.get("starred", False),
                        }

            # 3. Fetch user_grammar_progress
            g_res = db_service.client.table("user_grammar_progress").select("*").eq("user_id", user_id).limit(1000).execute()
            grammar_progress = {}
            if g_res.data:
                for row in g_res.data:
                    rid = row.get("rule_id")
                    if rid:
                        grammar_progress[rid] = {
                            "ruleId": rid,
                            "learned": row.get("learned", False),
                            "starred": row.get("starred", False),
                            "quizScore": row.get("quiz_score", 0),
                            "lastStudiedAt": row.get("last_studied_at"),
                        }

            if profile or words_progress or grammar_progress:
                return {
                    "success": True,
                    "profile": profile,
                    "words_progress": words_progress,
                    "grammar_progress": grammar_progress
                }
        except Exception as e:
            print(f"[ERROR] Failed to fetch progress from Supabase: {e}")

    saved = in_memory_user_progress.get(user_id, {})
    return {
        "success": True,
        "profile": saved.get("profile"),
        "words_progress": saved.get("words", {}),
        "grammar_progress": saved.get("grammar", {})
    }
