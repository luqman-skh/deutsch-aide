from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException
from app.services.supabase_client import db_service
from app.models.schemas import GrammarListResponse, GrammarRuleResponse

router = APIRouter(prefix="/grammar", tags=["Grammar"])

@router.get("", response_model=GrammarListResponse)
async def list_grammar_rules(
    category: Optional[str] = Query(None, description="Category filter (e.g. Cases, Verbs)"),
    level: Optional[str] = Query(None, description="CEFR level (A1, A2, B1, etc.)"),
    search: Optional[str] = Query(None, description="Search term in rule or examples")
):
    """
    Retrieve German grammar rules with category, level, and keyword filtering.
    """
    res = db_service.get_grammar_rules(
        category=category,
        level=level,
        search=search
    )

    return {
        "total": res["total"],
        "data": res["data"],
        "categories": res["categories"]
    }

@router.get("/categories", response_model=List[str])
async def get_categories():
    """
    Get all available grammar rule categories.
    """
    res = db_service.get_grammar_rules()
    return res["categories"]

@router.get("/{rule_id}", response_model=GrammarRuleResponse)
async def get_grammar_rule(rule_id: str):
    """
    Get a single grammar rule by its ID.
    """
    res = db_service.get_grammar_rules()
    for rule in res["data"]:
        if rule.get("id") == rule_id:
            return rule
    raise HTTPException(status_code=404, detail="Grammar rule not found")
