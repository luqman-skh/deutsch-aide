from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

# ============================================================
# Vocabulary Models
# ============================================================

class WordBase(BaseModel):
    german: str
    english: str
    all_translations: Optional[str] = ""
    gender: Optional[str] = ""
    pos: Optional[str] = "other"
    frequency_rank: Optional[int] = None
    example_de: Optional[str] = ""
    example_en: Optional[str] = ""
    cefr_level: Optional[str] = "A1"

class WordResponse(WordBase):
    id: Optional[Union[str, int]] = None

class WordListResponse(BaseModel):
    total: int
    data: List[WordResponse]
    page: int = 1
    page_size: int = 50

# ============================================================
# Grammar Models
# ============================================================

class GrammarRuleBase(BaseModel):
    category_code: Optional[str] = ""
    category_name: Optional[str] = "General"
    subcategory: Optional[str] = ""
    rule_german: str
    rule_english: str
    example_de: Optional[str] = ""
    example_en: Optional[str] = ""
    notes: Optional[str] = ""
    related_ids: Optional[List[str]] = Field(default_factory=list)
    cefr_levels: Optional[List[str]] = Field(default_factory=lambda: ["A1"])
    tags: Optional[List[str]] = Field(default_factory=list)

class GrammarRuleResponse(GrammarRuleBase):
    id: str

class GrammarListResponse(BaseModel):
    total: int
    data: List[GrammarRuleResponse]
    categories: List[str]

# ============================================================
# User Progress & Profile Models
# ============================================================

class WordProgressItem(BaseModel):
    word_key: str
    mastery: int = 0
    times_reviewed: int = 0
    times_correct: int = 0
    times_incorrect: int = 0
    last_reviewed_at: Optional[str] = None
    next_review_at: Optional[str] = None
    starred: bool = False

class GrammarProgressItem(BaseModel):
    rule_id: str
    learned: bool = False
    starred: bool = False
    last_studied_at: Optional[str] = None
    quiz_score: Optional[int] = None

class UserProfileSchema(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    name: str = "Deutschlerner"
    target_level: str = "A1"
    xp: int = 0
    level: int = 1
    level_title: str = "Anfänger (Novice)"
    streak: int = 1
    last_active_date: Optional[str] = None
    daily_goal: int = 15
    today_words_practiced: int = 0
    rush_high_score: int = 0
    theme: str = "dark"
    language: str = "de"
    sound_effects: bool = True
    speech_speed: float = 1.0
    activity_history: Dict[str, int] = Field(default_factory=dict)

class ProgressSyncRequest(BaseModel):
    profile: Optional[UserProfileSchema] = None
    words_progress: Optional[Dict[str, WordProgressItem]] = None
    grammar_progress: Optional[Dict[str, GrammarProgressItem]] = None

class ProgressSyncResponse(BaseModel):
    success: bool
    message: str
    profile: Optional[UserProfileSchema] = None

# ============================================================
# Health & Status
# ============================================================

class HealthResponse(BaseModel):
    status: str
    database_connected: bool
    words_count: int
    rules_count: int
    version: str

# ============================================================
# Future LLM Integration Placeholders
# ============================================================

class AIExplanationRequest(BaseModel):
    word_or_phrase: str
    context: Optional[str] = None
    target_language: Optional[str] = "en"
    user_level: Optional[str] = "A1"

class AIExplanationResponse(BaseModel):
    term: str
    explanation: str
    grammar_breakdown: Optional[str] = None
    example_sentences: List[Dict[str, str]] = Field(default_factory=list)
    mnemonics: Optional[str] = None

class AICorrectionRequest(BaseModel):
    german_sentence: str
    intended_meaning_en: Optional[str] = None

class AICorrectionResponse(BaseModel):
    original_sentence: str
    corrected_sentence: str
    is_correct: bool
    errors: List[Dict[str, Any]] = Field(default_factory=list)
    grammar_rule_references: List[str] = Field(default_factory=list)
