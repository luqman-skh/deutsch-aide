from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_user, get_optional_user
from app.models.schemas import UserProfileSchema

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns the currently authenticated Supabase user profile.
    """
    return {
        "authenticated": True,
        "user_id": user.get("id"),
        "email": user.get("email"),
        "metadata": user.get("user_metadata", {})
    }

@router.get("/status")
async def get_auth_status(user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    """
    Returns auth status for both guests and logged-in users.
    """
    if user and user.get("id"):
        return {
            "authenticated": True,
            "user_id": user.get("id"),
            "email": user.get("email"),
            "mode": "supabase_user"
        }
    return {
        "authenticated": False,
        "mode": "guest"
    }
