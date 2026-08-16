from fastapi import APIRouter, Depends
from typing import Optional, Dict, Any
from app.services.auth_service import get_optional_user
from app.models.schemas import (
    AIExplanationRequest,
    AIExplanationResponse,
    AICorrectionRequest,
    AICorrectionResponse
)

router = APIRouter(prefix="/ai", tags=["AI / LLM Integration (Future)"])

@router.post("/explain", response_model=AIExplanationResponse)
async def explain_term(
    req: AIExplanationRequest,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    [Future LLM Integration Endpoint]
    Generates rich pedagogical explanations, mnemonics, and CEFR-tailored examples.
    """
    return AIExplanationResponse(
        term=req.word_or_phrase,
        explanation=f"Placeholder explanation for '{req.word_or_phrase}'. LLM integration ready to be connected.",
        grammar_breakdown="Connect your OpenAI, Gemini, Anthropic, or Ollama provider in app/routers/ai_placeholder.py.",
        example_sentences=[
            {
                "german": f"Das Wort '{req.word_or_phrase}' ist sehr nützlich.",
                "english": f"The word '{req.word_or_phrase}' is very useful."
            }
        ],
        mnemonics=f"Memory hook for {req.word_or_phrase} (LLM placeholder)."
    )

@router.post("/correct", response_model=AICorrectionResponse)
async def correct_sentence(
    req: AICorrectionRequest,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    [Future LLM Integration Endpoint]
    Corrects German sentences, identifies grammatical errors (cases, declensions, word order), and provides feedback.
    """
    return AICorrectionResponse(
        original_sentence=req.german_sentence,
        corrected_sentence=req.german_sentence,
        is_correct=True,
        errors=[],
        grammar_rule_references=["gram_A_001"]
    )

@router.get("/status")
async def get_ai_status():
    """
    Checks status of LLM providers.
    """
    return {
        "llm_ready": False,
        "available_providers": ["gemini", "openai", "anthropic", "ollama"],
        "active_provider": None,
        "message": "AI backend router is registered and structured for future LLM integration."
    }
