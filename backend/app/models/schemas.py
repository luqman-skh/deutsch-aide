from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict

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
    model_config = ConfigDict(populate_by_name=True)

    word_key: Optional[str] = Field(None, alias="wordKey")
    mastery: int = 0
    times_reviewed: int = Field(0, alias="timesReviewed")
    times_correct: int = Field(0, alias="timesCorrect")
    times_incorrect: int = Field(0, alias="timesIncorrect")
    last_reviewed_at: Optional[str] = Field(None, alias="lastReviewedAt")
    next_review_at: Optional[str] = Field(None, alias="nextReviewAt")
    starred: bool = False

class GrammarProgressItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    rule_id: Optional[str] = Field(None, alias="ruleId")
    learned: bool = False
    starred: bool = False
    last_studied_at: Optional[str] = Field(None, alias="lastStudiedAt")
    quiz_score: Optional[int] = Field(0, alias="quizScore")
    times_reviewed: int = Field(0, alias="timesReviewed")

class UserProfileSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: Optional[str] = Field(None, alias="userId")
    email: Optional[str] = None
    name: str = "Deutschlerner"
    target_level: str = Field("A1", alias="targetLevel")
    xp: int = 0
    level: int = 1
    level_title: str = Field("Anfänger (Novice)", alias="levelTitle")
    streak: int = 1
    last_active_date: Optional[str] = Field(None, alias="lastActiveDate")
    daily_goal: int = Field(15, alias="dailyGoal")
    today_words_practiced: int = Field(0, alias="todayWordsPracticed")
    today_date: Optional[str] = Field(None, alias="todayDate")
    rush_high_score: int = Field(0, alias="rushHighScore")
    theme: str = "dark"
    language: str = "de"
    sound_effects: bool = Field(True, alias="soundEffects")
    speech_speed: float = Field(1.0, alias="speechSpeed")
    activity_history: Dict[str, int] = Field(default_factory=dict, alias="activityHistory")

class ProgressSyncRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    profile: Optional[UserProfileSchema] = None
    words_progress: Optional[Dict[str, WordProgressItem]] = Field(None, alias="wordsProgress")
    grammar_progress: Optional[Dict[str, GrammarProgressItem]] = Field(None, alias="grammarProgress")

class ProgressSyncResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

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
