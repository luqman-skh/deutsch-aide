import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from app.config import settings

class SupabaseService:
    def __init__(self):
        self.client: Optional[Client] = None
        self.admin_client: Optional[Client] = None
        self._init_client()
        self._fallback_words: Optional[List[Dict[str, Any]]] = None
        self._fallback_grammar: Optional[List[Dict[str, Any]]] = None

    def _init_client(self):
        try:
            if settings.SUPABASE_URL and settings.SUPABASE_SECRET_KEY:
                self.client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SECRET_KEY
                )
            elif settings.SUPABASE_URL and settings.SUPABASE_PUBLISHABLE_KEY:
                self.client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_PUBLISHABLE_KEY
                )
        except Exception as e:
            print(f"[WARNING] Supabase client init warning: {e}")
            self.client = None

    def get_fallback_words(self) -> List[Dict[str, Any]]:
        if self._fallback_words is not None:
            return self._fallback_words

        candidates = [
            settings.DATA_DIR / "rep12_api" / "german_vocab_a1.json",
            settings.DATA_DIR / "goethe_vocab" / "goethe_A1.json",
            Path(__file__).resolve().parent.parent.parent.parent / "data" / "rep12_api" / "german_vocab_a1.json"
        ]

        for p in candidates:
            if p.exists():
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            self._fallback_words = data
                            return self._fallback_words
                except Exception as e:
                    print(f"Error loading {p}: {e}")

        self._fallback_words = []
        return self._fallback_words

    def get_fallback_grammar(self) -> List[Dict[str, Any]]:
        if self._fallback_grammar is not None:
            return self._fallback_grammar

        candidates = [
            settings.DATA_DIR / "rep12_api" / "grammar.json",
            Path(__file__).resolve().parent.parent.parent.parent / "data" / "rep12_api" / "grammar.json"
        ]

        for p in candidates:
            if p.exists():
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        rules = data.get("data", []) if isinstance(data, dict) else data
                        self._fallback_grammar = rules
                        return self._fallback_grammar
                except Exception as e:
                    print(f"Error loading {p}: {e}")

        self._fallback_grammar = []
        return self._fallback_grammar

    def get_words(
        self,
        search: Optional[str] = None,
        level: Optional[str] = None,
        pos: Optional[str] = None,
        gender: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        # Try Supabase live table first
        if self.client:
            try:
                query = self.client.table("german_words").select("*")
                if level and level.lower() != "all":
                    query = query.eq("cefr_level", level)
                if pos and pos.lower() != "all":
                    query = query.ilike("pos", f"%{pos}%")
                if gender and gender.lower() != "all":
                    query = query.eq("gender", gender)
                if search:
                    query = query.or_(f"german.ilike.%{search}%,english.ilike.%{search}%")

                response = query.order("frequency_rank", desc=False).range(offset, offset + limit - 1).execute()
                if response.data:
                    return {
                        "total": len(response.data),
                        "data": response.data,
                        "source": "supabase"
                    }
            except Exception as e:
                print(f"Supabase query failed, falling back to local dataset: {e}")

        # Fallback to local dataset
        raw = self.get_fallback_words()
        filtered = []

        for idx, item in enumerate(raw):
            w_german = str(item.get("german", ""))
            w_english = str(item.get("english", ""))
            w_pos = str(item.get("pos", "")).lower()
            w_gender = str(item.get("gender", "")).lower()
            w_level = str(item.get("cefr_level", "A1"))

            if search:
                s = search.lower()
                if s not in w_german.lower() and s not in w_english.lower():
                    continue

            if level and level.lower() != "all" and w_level.lower() != level.lower():
                continue

            if pos and pos.lower() != "all" and pos.lower() not in w_pos:
                continue

            if gender and gender.lower() != "all":
                if gender == "none" and w_gender != "":
                    continue
                if gender != "none" and w_gender != gender.lower():
                    continue

            filtered.append({
                "id": item.get("id") or f"word_{idx + 1}",
                "german": w_german,
                "english": w_english,
                "all_translations": item.get("all_translations", ""),
                "gender": item.get("gender", ""),
                "pos": w_pos or "other",
                "frequency_rank": item.get("frequency_rank", idx + 1),
                "example_de": item.get("example_de", ""),
                "example_en": item.get("example_en", ""),
                "cefr_level": w_level or "A1"
            })

        total = len(filtered)
        paginated = filtered[offset:offset + limit]

        return {
            "total": total,
            "data": paginated,
            "source": "local_fallback"
        }

    def get_grammar_rules(
        self,
        category: Optional[str] = None,
        level: Optional[str] = None,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        # Try Supabase live table
        if self.client:
            try:
                query = self.client.table("grammar_rules").select("*")
                if category and category.lower() != "all":
                    query = query.eq("category_name", category)
                if search:
                    query = query.or_(f"rule_german.ilike.%{search}%,rule_english.ilike.%{search}%")

                response = query.order("id", desc=False).limit(500).execute()
                if response.data and len(response.data) > 0:
                    categories = list(set([r.get("category_name", "") for r in response.data if r.get("category_name")]))
                    return {
                        "total": len(response.data),
                        "data": response.data,
                        "categories": sorted(categories),
                        "source": "supabase"
                    }
            except Exception as e:
                print(f"Supabase grammar query failed, using fallback: {e}")

        # Fallback to local dataset
        raw = self.get_fallback_grammar()
        filtered = []
        categories_set = set()

        for idx, item in enumerate(raw):
            r_cat = item.get("category_name", "General")
            categories_set.add(r_cat)

            r_german = item.get("rule_german", "")
            r_english = item.get("rule_english", "")
            r_levels = item.get("cefr_levels", ["A1"])
            r_notes = item.get("notes", "")

            if category and category.lower() != "all" and r_cat.lower() != category.lower():
                continue

            if level and level.lower() != "all" and level.upper() not in [l.upper() for l in r_levels]:
                continue

            if search:
                s = search.lower()
                if (s not in r_german.lower() and
                    s not in r_english.lower() and
                    s not in r_cat.lower() and
                    s not in r_notes.lower()):
                    continue

            filtered.append({
                "id": item.get("id") or f"gram_{idx + 1}",
                "category_code": item.get("category_code", ""),
                "category_name": r_cat,
                "subcategory": item.get("subcategory", ""),
                "rule_german": r_german,
                "rule_english": r_english,
                "example_de": item.get("example_de", ""),
                "example_en": item.get("example_en", ""),
                "notes": r_notes,
                "related_ids": item.get("related_ids", []),
                "cefr_levels": r_levels,
                "tags": item.get("tags", [])
            })

        return {
            "total": len(filtered),
            "data": filtered,
            "categories": sorted(list(categories_set)),
            "source": "local_fallback"
        }

db_service = SupabaseService()
