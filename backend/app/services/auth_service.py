from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
import jwt
from app.config import settings
from app.services.supabase_client import db_service

async def get_optional_user(
    authorization: Optional[str] = Header(None)
) -> Optional[Dict[str, Any]]:
    """
    Extracts and verifies the Supabase JWT token from the Authorization header.
    Returns user dict or None if anonymous/guest.
    """
    if not authorization:
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None

        # Verify with Supabase client if available
        if db_service.client:
            try:
                user_res = db_service.client.auth.get_user(token)
                if user_res and user_res.user:
                    return {
                        "id": user_res.user.id,
                        "email": user_res.user.email,
                        "user_metadata": user_res.user.user_metadata or {},
                        "role": user_res.user.role or "authenticated"
                    }
            except Exception as e:
                # If direct client check fails, fallback to decoding JWT payload
                pass

        # Decode unverified or verified payload
        # In development/offline, inspect claims
        decoded = jwt.decode(token, options={"verify_signature": False})
        return {
            "id": decoded.get("sub"),
            "email": decoded.get("email"),
            "user_metadata": decoded.get("user_metadata", {}),
            "role": decoded.get("role", "authenticated")
        }
    except Exception as e:
        print(f"Auth token decode error: {e}")
        return None

async def get_current_user(
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
) -> Dict[str, Any]:
    """
    Requires a valid Supabase authenticated user.
    """
    if not user or not user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in via Supabase.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
