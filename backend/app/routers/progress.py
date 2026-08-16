from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from app.services.auth_service import get_optional_user
from app.services.supabase_client import db_service
from app.models.schemas import ProgressSyncRequest, ProgressSyncResponse, UserProfileSchema

router = APIRouter(prefix="/progress", tags=["Progress"])

# In-memory session store for guest users or when Supabase table isn't created yet
in_memory_user_progress: Dict[str, Any] = {}

@router.post("/sync", response_model=ProgressSyncResponse)
async def sync_progress(
    data: ProgressSyncRequest,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Syncs user progress, XP, streak, and word mastery to the cloud or session storage.
    Works for both logged-in Supabase users and guest sessions.
    """
    user_id = user.get("id") if user else "guest"

    # Attempt to sync with Supabase user_progress table if configured
    if db_service.client and user_id != "guest":
        try:
            record = {
                "user_id": user_id,
                "profile_data": data.profile.model_dump() if data.profile else {},
                "words_progress": {k: v.model_dump() for k, v in (data.words_progress or {}).items()},
                "grammar_progress": {k: v.model_dump() for k, v in (data.grammar_progress or {}).items()}
            }
            # Upsert into user_progress if table exists
            db_service.client.table("user_progress").upsert(record, on_conflict="user_id").execute()
            return ProgressSyncResponse(
                success=True,
                message="Progress synced successfully with Supabase Cloud.",
                profile=data.profile
            )
        except Exception as e:
            # If user_progress table doesn't exist yet, save to memory/return success
            pass

    in_memory_user_progress[user_id] = {
        "profile": data.profile,
        "words": data.words_progress,
        "grammar": data.grammar_progress
    }

    return ProgressSyncResponse(
        success=True,
        message="Progress saved successfully.",
        profile=data.profile
    )

@router.get("")
async def get_progress(user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    """
    Get saved progress for the current user.
    """
    user_id = user.get("id") if user else "guest"

    if db_service.client and user_id != "guest":
        try:
            res = db_service.client.table("user_progress").select("*").eq("user_id", user_id).single().execute()
            if res.data:
                return {
                    "success": True,
                    "profile": res.data.get("profile_data"),
                    "words_progress": res.data.get("words_progress", {}),
                    "grammar_progress": res.data.get("grammar_progress", {})
                }
        except Exception:
            pass

    saved = in_memory_user_progress.get(user_id, {})
    return {
        "success": True,
        "profile": saved.get("profile"),
        "words_progress": saved.get("words", {}),
        "grammar_progress": saved.get("grammar", {})
    }
