import type {
  UserProfile,
  WordProgress,
  GrammarProgress,
  MasteryLevel,
} from '../types';

const PROFILE_KEY = 'deutsch_helper_profile_v1';
const WORDS_PROGRESS_KEY = 'deutsch_helper_words_progress_v1';
const GRAMMAR_PROGRESS_KEY = 'deutsch_helper_grammar_progress_v1';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number; prevLevelXp: number } {
  // Level threshold: Level = Math.floor(sqrt(XP / 50)) + 1
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
  const titles = [
    'Anfänger (Novice)',
    'Wort-Entdecker (Word Explorer)',
    'Grammatik-Lehrling (Grammar Apprentice)',
    'Sprach-Abenteurer (Language Adventurer)',
    'Deutsch-Profi (German Pro)',
    'Wortschatz-Meister (Vocab Master)',
    'Grammatik-Gelehrter (Grammar Scholar)',
    'Fließend-Sprecher (Fluent Speaker)',
    'Polyglott-Legende (Polyglot Legend)',
    'Deutsch-Großmeister (German Grandmaster)',
  ];
  const title = titles[Math.min(level - 1, titles.length - 1)];
  const prevLevelXp = Math.pow(level - 1, 2) * 50;
  const nextLevelXp = Math.pow(level, 2) * 50;

  return { level, title, nextLevelXp, prevLevelXp };
}

class StorageService {
  getProfile(): UserProfile {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) {
      const defaultProfile: UserProfile = {
        name: 'Deutschlerner',
        targetLevel: 'A1',
        xp: 0,
        level: 1,
        levelTitle: 'Anfänger (Novice)',
        streak: 1,
        lastActiveDate: today,
        dailyGoal: 15,
        todayWordsPracticed: 0,
        todayDate: today,
        soundEffects: true,
        speechSpeed: 1.0,
        theme: 'dark',
        activityHistory: { [today]: 0 },
        rushHighScore: 0,
      };
      this.saveProfile(defaultProfile);
      return defaultProfile;
    }

    try {
      const profile: UserProfile = JSON.parse(stored);

      // Check daily reset
      if (profile.todayDate !== today) {
        if (profile.lastActiveDate === yesterday) {
          // Streak maintained
        } else if (profile.lastActiveDate !== today) {
          // Streak reset if missed more than 1 day
          profile.streak = profile.todayWordsPracticed > 0 ? 1 : 0;
        }
        profile.todayDate = today;
        profile.todayWordsPracticed = 0;
      }

      if (!profile.activityHistory) {
        profile.activityHistory = { [today]: 0 };
      }

      const { level, title } = calculateLevel(profile.xp);
      profile.level = level;
      profile.levelTitle = title;

      return profile;
    } catch {
      localStorage.removeItem(PROFILE_KEY);
      return this.getProfile();
    }
  }

  saveProfile(profile: UserProfile): void {
    const { level, title } = calculateLevel(profile.xp);
    profile.level = level;
    profile.levelTitle = title;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  getAllWordProgress(): Record<string, WordProgress> {
    try {
      const data = localStorage.getItem(WORDS_PROGRESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveAllWordProgress(progressMap: Record<string, WordProgress>): void {
    localStorage.setItem(WORDS_PROGRESS_KEY, JSON.stringify(progressMap));
  }

  getWordProgress(german: string): WordProgress | undefined {
    const all = this.getAllWordProgress();
    return all[german.toLowerCase().trim()];
  }

  recordWordPractice(
    german: string,
    isCorrect: boolean,
    rating?: 'again' | 'hard' | 'good' | 'easy'
  ): { xpGained: number; leveledUp: boolean; newStreak: number } {
    const today = getTodayString();
    const profile = this.getProfile();
    const oldLevel = profile.level;

    // XP calculation
    let xpGained = isCorrect ? 10 : 2;
    if (rating === 'easy') xpGained += 5;
    if (rating === 'good') xpGained += 2;

    profile.xp += xpGained;

    // Daily progress tracking
    profile.todayWordsPracticed += 1;
    profile.activityHistory[today] = (profile.activityHistory[today] || 0) + 1;

    // Streak update
    if (profile.lastActiveDate !== today) {
      const yesterday = getYesterdayString();
      if (profile.lastActiveDate === yesterday) {
        profile.streak += 1;
      } else {
        profile.streak = 1;
      }
      profile.lastActiveDate = today;
    }

    this.saveProfile(profile);

    // Update word progress record
    const key = german.toLowerCase().trim();
    const allProgress = this.getAllWordProgress();
    const existing = allProgress[key] || {
      wordKey: key,
      mastery: 0,
      timesReviewed: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: new Date().toISOString(),
      starred: false,
    };

    existing.timesReviewed += 1;
    if (isCorrect) {
      existing.timesCorrect += 1;
    } else {
      existing.timesIncorrect += 1;
    }
    existing.lastReviewedAt = new Date().toISOString();

    // Mastery calculation
    if (rating === 'again' || !isCorrect) {
      existing.mastery = Math.max(0, existing.mastery - 1) as MasteryLevel;
    } else if (rating === 'easy') {
      existing.mastery = Math.min(3, existing.mastery + 2) as MasteryLevel;
    } else if (isCorrect) {
      existing.mastery = Math.min(3, existing.mastery + 1) as MasteryLevel;
    }

    // Spaced repetition next interval
    const now = new Date();
    const daysToAdd =
      existing.mastery === 3 ? 7 : existing.mastery === 2 ? 3 : existing.mastery === 1 ? 1 : 0.5;
    now.setHours(now.getHours() + Math.round(daysToAdd * 24));
    existing.nextReviewAt = now.toISOString();

    allProgress[key] = existing;
    this.saveAllWordProgress(allProgress);

    const updatedProfile = this.getProfile();
    const leveledUp = updatedProfile.level > oldLevel;

    return {
      xpGained,
      leveledUp,
      newStreak: updatedProfile.streak,
    };
  }

  toggleStarWord(german: string): boolean {
    const key = german.toLowerCase().trim();
    const allProgress = this.getAllWordProgress();
    const existing = allProgress[key] || {
      wordKey: key,
      mastery: 0,
      timesReviewed: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: new Date().toISOString(),
      starred: false,
    };

    existing.starred = !existing.starred;
    allProgress[key] = existing;
    this.saveAllWordProgress(allProgress);
    return existing.starred;
  }

  getAllGrammarProgress(): Record<string, GrammarProgress> {
    try {
      const data = localStorage.getItem(GRAMMAR_PROGRESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveAllGrammarProgress(progressMap: Record<string, GrammarProgress>): void {
    localStorage.setItem(GRAMMAR_PROGRESS_KEY, JSON.stringify(progressMap));
  }

  toggleLearnedRule(ruleId: string): boolean {
    const all = this.getAllGrammarProgress();
    const existing = all[ruleId] || {
      ruleId,
      learned: false,
      starred: false,
      lastStudiedAt: new Date().toISOString(),
    };

    existing.learned = !existing.learned;
    existing.lastStudiedAt = new Date().toISOString();
    all[ruleId] = existing;
    this.saveAllGrammarProgress(all);

    if (existing.learned) {
      const profile = this.getProfile();
      profile.xp += 15; // XP for completing a grammar rule
      this.saveProfile(profile);
    }

    return existing.learned;
  }

  toggleLearnGrammar(ruleId: string): boolean {
    return this.toggleLearnedRule(ruleId);
  }

  toggleStarRule(ruleId: string): boolean {
    const all = this.getAllGrammarProgress();
    const existing = all[ruleId] || {
      ruleId,
      learned: false,
      starred: false,
      lastStudiedAt: new Date().toISOString(),
    };

    existing.starred = !existing.starred;
    all[ruleId] = existing;
    this.saveAllGrammarProgress(all);
    return existing.starred;
  }

  toggleStarGrammar(ruleId: string): boolean {
    return this.toggleStarRule(ruleId);
  }

  recordGrammarQuiz(ruleId: string, score: number): void {
    const all = this.getAllGrammarProgress();
    const existing = all[ruleId] || {
      ruleId,
      learned: false,
      starred: false,
      lastStudiedAt: new Date().toISOString(),
    };

    existing.quizScore = Math.max(existing.quizScore || 0, score);
    existing.lastStudiedAt = new Date().toISOString();
    if (score >= 80) existing.learned = true;
    all[ruleId] = existing;
    this.saveAllGrammarProgress(all);

    const profile = this.getProfile();
    profile.xp += Math.round(score / 5);
    this.saveProfile(profile);
  }

  recordRushHighScore(score: number): boolean {
    const profile = this.getProfile();
    if (score > (profile.rushHighScore || 0)) {
      profile.rushHighScore = score;
      profile.xp += Math.round(score * 2);
      this.saveProfile(profile);
      return true;
    }
    return false;
  }

  resetAllData(): void {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(WORDS_PROGRESS_KEY);
    localStorage.removeItem(GRAMMAR_PROGRESS_KEY);
  }
}

export const storageService = new StorageService();
