export type Gender = 'der' | 'die' | 'das' | '' | string;

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'pronoun'
  | 'phrase'
  | 'other';

export interface Word {
  id?: string | number;
  german: string;
  english: string;
  all_translations?: string;
  gender?: Gender;
  pos?: string;
  frequency_rank?: number;
  example_de?: string;
  example_en?: string;
  cefr_level?: CEFRLevel | string;
}

export interface GrammarRule {
  id: string;
  category_code: string;
  category_name: string;
  subcategory: string;
  rule_german: string;
  rule_english: string;
  example_de: string;
  example_en: string;
  notes: string;
  related_ids?: string[];
  cefr_levels: string[];
  tags: string[];
  source?: string;
  license_tag?: string;
}

export interface SentenceItem {
  id: number;
  sentence_de: string;
  sentence_en: string;
  cefr_level: string;
  grammar_features?: string[];
  topic?: string;
}

export type MasteryLevel = 0 | 1 | 2 | 3; // 0: New, 1: Learning, 2: Familiar, 3: Mastered

export interface WordProgress {
  wordKey: string; // german word
  mastery: MasteryLevel;
  timesReviewed: number;
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewedAt: string;
  nextReviewAt: string;
  starred: boolean;
}

export interface GrammarProgress {
  ruleId: string;
  learned: boolean;
  starred: boolean;
  lastStudiedAt: string;
  quizScore?: number;
}

export interface UserProfile {
  name: string;
  targetLevel: CEFRLevel;
  xp: number;
  level: number;
  levelTitle: string;
  streak: number;
  lastActiveDate: string;
  dailyGoal: number; // target words per day
  todayWordsPracticed: number;
  todayDate: string;
  soundEffects: boolean;
  speechSpeed: number; // 0.75 to 1.25
  theme: 'dark' | 'light';
  language?: 'de' | 'en';
  email?: string;
  activityHistory: Record<string, number>; // date 'YYYY-MM-DD' -> count
  rushHighScore: number;
}

export type TrainerMode =
  | 'menu'
  | 'flashcards'
  | 'quiz'
  | 'spelling'
  | 'article-rush'
  | 'weak-words';

export type ActiveTab = 'vocab' | 'grammar' | 'lexicon' | 'profile';
