import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in project root or current directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()

class Settings:
    PROJECT_NAME: str = "DeutschAide Backend API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://vgvtuhanrzuqnamtwsvr.supabase.co")
    SUPABASE_PUBLISHABLE_KEY: str = os.getenv(
        "SUPABASE_PUBLISHABLE_KEY",
    )
    SUPABASE_SECRET_KEY: str = os.getenv(
        "SUPABASE_SECRET_KEY",
    )
    SUPABASE_JWKS_URL: str = os.getenv(
        "SUPABASE_JWKS_URL",
        f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json" if SUPABASE_URL else ""
    )

    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    DATA_DIR: Path = BASE_DIR / "data"

settings = Settings()
