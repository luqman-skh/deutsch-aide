from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.services.supabase_client import db_service
from app.models.schemas import HealthResponse
from app.routers import words, grammar, auth, progress, ai_placeholder

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Python FastAPI backend server for DeutschAide with Supabase auth and vocabulary/grammar APIs.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(words.router, prefix=settings.API_V1_PREFIX)
app.include_router(grammar.router, prefix=settings.API_V1_PREFIX)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(progress.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_placeholder.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs"
    }

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    words_res = db_service.get_words(limit=1)
    grammar_res = db_service.get_grammar_rules()
    is_connected = db_service.client is not None

    return HealthResponse(
        status="healthy",
        database_connected=is_connected,
        words_count=words_res["total"],
        rules_count=grammar_res["total"],
        version=settings.VERSION
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
