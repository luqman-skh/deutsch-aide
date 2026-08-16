from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.services.supabase_client import db_service
from app.models.schemas import WordListResponse, WordResponse

router = APIRouter(prefix="/words", tags=["Words"])

@router.get("", response_model=WordListResponse)
async def list_words(
    search: Optional[str] = Query(None, description="Search term in German or English"),
    level: Optional[str] = Query(None, description="CEFR level (A1, A2, B1, etc.)"),
    pos: Optional[str] = Query(None, description="Part of speech (noun, verb, adjective, etc.)"),
    gender: Optional[str] = Query(None, description="Gender (der, die, das, none)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500)
):
    """
    Retrieve German vocabulary words with flexible search and filtering.
    """
    offset = (page - 1) * page_size
    res = db_service.get_words(
        search=search,
        level=level,
        pos=pos,
        gender=gender,
        limit=page_size,
        offset=offset
    )

    return {
        "total": res["total"],
        "data": res["data"],
        "page": page,
        "page_size": page_size
    }

@router.get("/random", response_model=WordListResponse)
async def get_random_words(
    count: int = Query(15, ge=1, le=100),
    level: Optional[str] = Query(None),
    pos: Optional[str] = Query(None),
    gender: Optional[str] = Query(None)
):
    """
    Get a randomized batch of words for flashcards or quiz sessions.
    """
    import random
    res = db_service.get_words(level=level, pos=pos, gender=gender, limit=1000, offset=0)
    data = res["data"]
    random.shuffle(data)
    sampled = data[:count]

    return {
        "total": len(sampled),
        "data": sampled,
        "page": 1,
        "page_size": count
    }

@router.get("/{word_id}", response_model=WordResponse)
async def get_word(word_id: str):
    """
    Get a single word by ID or German word key.
    """
    res = db_service.get_words(search=word_id, limit=5, offset=0)
    for item in res["data"]:
        if item.get("id") == word_id or item.get("german").lower() == word_id.lower():
            return item
    raise HTTPException(status_code=404, detail="Word not found")
