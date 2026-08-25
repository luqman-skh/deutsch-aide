import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  Flame,
  Zap,
  Target,
  Trophy,
  Star,
  Calendar,
  Settings,
  ArrowRight,
  Search,
  Filter,
  RotateCw,
  Database,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { UserProfile, Word, GrammarRule, WordProgress, CEFRLevel } from '../../types';
import { storageService } from '../../services/storageService';
import { dataService } from '../../services/dataService';
import { CefrBadge } from '../common/CefrBadge';
import { GenderBadge } from '../common/GenderBadge';
import { PosBadge } from '../common/PosBadge';
import { SpeakerButton } from '../common/SpeakerButton';
import { WordDetailModal } from '../lexicon/WordDetailModal';
import { useTranslation } from '../../i18n/LanguageContext';
import { playSfx } from '../../utils/audio';

interface Props {
  profile: UserProfile;
  words: Word[];
  grammarRules: GrammarRule[];
  onOpenSettings: () => void;
  onNavigateTab: (tab: 'vocab' | 'grammar' | 'lexicon') => void;
}

export const ProfileView: React.FC<Props> = ({
  profile,
  words,
  grammarRules,
  onOpenSettings,
  onNavigateTab,
}) => {
  const { t } = useTranslation();

  // Progress state (supports both direct Supabase user_word_progress fetch and local fallback)
  const [wordProgressMap, setWordProgressMap] = useState<Record<string, WordProgress>>(() =>
    storageService.getAllWordProgress()
  );
  const [progressSource, setProgressSource] = useState<'supabase' | 'local'>('local');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search for the Learned Words Table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [selectedMastery, setSelectedMastery] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'accuracy' | 'reviews' | 'alpha_de' | 'alpha_en'>('recent');

  // Pagination for the Learned Words Table
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Selected word for detail modal
  const [selectedWordForModal, setSelectedWordForModal] = useState<Word | null>(null);

  // Fetch from user_word_progress table
  const fetchLearnedWords = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await dataService.getUserWordProgress(profile.email);
      setWordProgressMap(res.data);
      setProgressSource(res.source);
    } catch (err) {
      console.warn('Could not fetch user_word_progress:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [profile.email]);

  useEffect(() => {
    fetchLearnedWords();
  }, [fetchLearnedWords]);

  const grammarProgressMap = useMemo(() => storageService.getAllGrammarProgress(), [profile]);

  // Compute Word Mastery stats
  const masteryStats = useMemo(() => {
    let mastered = 0; // Level 3+
    let familiar = 0; // Level 2
    let learning = 0; // Level 1
    let unlearned = 0; // Level 0

    words.forEach((w) => {
      const p = wordProgressMap[w.german.toLowerCase().trim()];
      const m = p?.mastery || 0;
      if (m >= 3) mastered++;
      else if (m === 2) familiar++;
      else if (m === 1) learning++;
      else unlearned++;
    });

    return { mastered, familiar, learning, unlearned, total: words.length };
  }, [words, wordProgressMap]);

  // Starred Words & Rules
  const starredWords = useMemo(() => {
    return words.filter((w) => wordProgressMap[w.german.toLowerCase().trim()]?.starred);
  }, [words, wordProgressMap]);

  const starredRules = useMemo(() => {
    return grammarRules.filter((r) => grammarProgressMap[r.id]?.starred);
  }, [grammarRules, grammarProgressMap]);

  const learnedRulesCount = useMemo(() => {
    return Object.values(grammarProgressMap).filter((p) => p.learned).length;
  }, [grammarProgressMap]);

  const xpIntoCurrentLevel = profile.xp % 100;
  const levelProgressPercent = Math.min(100, Math.round((xpIntoCurrentLevel / 100) * 100));

  // Activity History: past 7 days
  const past7Days = useMemo(() => {
    const days: { dateStr: string; label: string; count: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('de-DE', { weekday: 'short' });
      const count = profile.activityHistory?.[dateStr] || 0;
      days.push({ dateStr, label: dayName, count });
    }
    return days;
  }, [profile.activityHistory]);

  const maxActivity = Math.max(1, ...past7Days.map((d) => d.count));

  // Quick word map lookup by lowercase german string
  const wordsByGerman = useMemo(() => {
    const map = new Map<string, Word>();
    words.forEach((w) => {
      map.set(w.german.toLowerCase().trim(), w);
    });
    return map;
  }, [words]);

  // Build the complete list of Learned Words combining Word details + user_word_progress
  const learnedWordsList = useMemo(() => {
    const list: Array<{
      word: Word;
      progress: WordProgress;
      accuracy: number;
    }> = [];

    Object.entries(wordProgressMap).forEach(([rawKey, progress]) => {
      const key = rawKey.toLowerCase().trim();
      // Considered learned if user practiced or has mastery / reviews
      if (progress.timesReviewed > 0 || progress.mastery > 0 || progress.timesCorrect > 0 || progress.starred) {
        const foundWord = wordsByGerman.get(key) || {
          german: progress.wordKey || rawKey,
          english: 'Vocabulary item',
          gender: '',
          pos: 'other',
          cefr_level: 'A1',
        };

        const totalReviews = progress.timesReviewed || (progress.timesCorrect + progress.timesIncorrect);
        const accuracy = totalReviews > 0 ? Math.round((progress.timesCorrect / totalReviews) * 100) : 0;

        list.push({
          word: foundWord,
          progress: {
            ...progress,
            timesReviewed: totalReviews,
          },
          accuracy,
        });
      }
    });

    return list;
  }, [wordProgressMap, wordsByGerman]);

  // Filter & Sort Learned Words
  const filteredLearnedWords = useMemo(() => {
    let result = learnedWordsList;

    // Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.word.german.toLowerCase().includes(q) ||
          item.word.english.toLowerCase().includes(q) ||
          (item.word.all_translations && item.word.all_translations.toLowerCase().includes(q))
      );
    }

    // Level Filter
    if (selectedLevel !== 'all') {
      result = result.filter(
        (item) => (item.word.cefr_level || 'A1').toUpperCase() === selectedLevel.toUpperCase()
      );
    }

    // POS Filter
    if (selectedPos !== 'all') {
      result = result.filter((item) => (item.word.pos || 'other').toLowerCase() === selectedPos.toLowerCase());
    }

    // Mastery Filter
    if (selectedMastery !== 'all') {
      if (selectedMastery === 'starred') {
        result = result.filter((item) => item.progress.starred);
      } else {
        const targetMastery = Number(selectedMastery);
        result = result.filter((item) => item.progress.mastery === targetMastery);
      }
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = new Date(a.progress.lastReviewedAt || 0).getTime();
        const dateB = new Date(b.progress.lastReviewedAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'accuracy') {
        return b.accuracy - a.accuracy || b.progress.timesReviewed - a.progress.timesReviewed;
      }
      if (sortBy === 'reviews') {
        return b.progress.timesReviewed - a.progress.timesReviewed;
      }
      if (sortBy === 'alpha_de') {
        return a.word.german.localeCompare(b.word.german, 'de');
      }
      if (sortBy === 'alpha_en') {
        return a.word.english.localeCompare(b.word.english, 'en');
      }
      return 0;
    });
  }, [learnedWordsList, searchTerm, selectedLevel, selectedPos, selectedMastery, sortBy]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredLearnedWords.length / pageSize));
  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLearnedWords.slice(start, start + pageSize);
  }, [filteredLearnedWords, currentPage, pageSize]);

  // Toggle star
  const handleToggleStar = (germanWord: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newStarred = storageService.toggleStarWord(germanWord);
    const key = germanWord.toLowerCase().trim();
    setWordProgressMap((prev) => {
      const existing = prev[key] || {
        wordKey: germanWord,
        mastery: 0 as const,
        timesReviewed: 0,
        timesCorrect: 0,
        timesIncorrect: 0,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: new Date().toISOString(),
        starred: false,
      };
      return {
        ...prev,
        [key]: {
          ...existing,
          starred: newStarred,
        },
      };
    });
    playSfx('click', profile.soundEffects);
  };

  // Format relative date helper
  const formatReviewedDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '-';
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();
      if (isToday) return t('profile.today');

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return t('profile.yesterday');

      const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 2 && diffDays <= 7) {
        return t('profile.days_ago', { days: diffDays });
      }

      return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
    } catch {
      return '-';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Profile Overview Banner */}
      <div
        className="glass-panel glow-edge"
        style={{
          padding: '2.25rem 2rem',
          background: 'linear-gradient(135deg, rgba(16, 25, 44, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.75rem',
          }}
        >
          {/* User Info & Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div
              style={{
                width: '78px',
                height: '78px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(56, 189, 248, 0.35)',
                color: '#ffffff',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <User size={40} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                  {profile.name}
                </h1>
                <CefrBadge level={profile.targetLevel} size="md" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: 'var(--accent-primary)',
                    backgroundColor: 'var(--accent-primary-subtle)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  {t('profile.level')} {profile.level}: {profile.levelTitle}
                </span>
                {profile.email && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ({profile.email})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.75rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontWeight: 800,
              fontSize: '0.88rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Settings size={16} />
            <span>{t('profile.edit_btn')}</span>
          </button>
        </div>

        {/* Level XP Progress Bar */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.45rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {t('profile.level_progress')} (Stufe {profile.level})
            </span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {xpIntoCurrentLevel} / 100 XP
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '10px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              padding: '1px',
            }}
          >
            <div
              style={{
                width: `${levelProgressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
                transition: 'width 0.45s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {t('profile.xp_to_next', { xp: 100 - xpIntoCurrentLevel, lvl: profile.level + 1 })}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Streak */}
        <div
          className="glass-panel"
          style={{
            padding: '1.4rem',
            borderTop: '4px solid #f59e0b',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-gold)', marginBottom: '0.65rem' }}>
            <Flame size={20} fill="#f59e0b" />
            <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{t('profile.streak_title')}</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
            {profile.streak} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('profile.streak_days')}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
            {t('profile.streak_desc')}
          </p>
        </div>

        {/* Total XP */}
        <div
          className="glass-panel"
          style={{
            padding: '1.4rem',
            borderTop: '4px solid var(--accent-primary)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-primary)', marginBottom: '0.65rem' }}>
            <Zap size={20} fill="currentColor" />
            <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{t('profile.total_xp')}</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
            {profile.xp} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>XP</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
            {t('profile.total_xp_desc')}
          </p>
        </div>

        {/* Daily Goal */}
        <div
          className="glass-panel"
          style={{
            padding: '1.4rem',
            borderTop: '4px solid #10b981',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--color-success)', marginBottom: '0.65rem' }}>
            <Target size={20} />
            <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{t('profile.daily_goal')}</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
            {profile.todayWordsPracticed} / {profile.dailyGoal}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
            {Math.round((profile.todayWordsPracticed / profile.dailyGoal) * 100)}% {t('profile.daily_goal_desc')}
          </p>
        </div>

        {/* Rush High Score */}
        <div
          className="glass-panel"
          style={{
            padding: '1.4rem',
            borderTop: '4px solid #a855f7',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#a855f7', marginBottom: '0.65rem' }}>
            <Trophy size={20} />
            <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{t('profile.rush_record')}</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-mono)' }}>
            {profile.rushHighScore || 0} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pkt</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
            {t('profile.rush_record_desc')}
          </p>
        </div>
      </div>

      {/* 7-Day Activity Chart */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Calendar size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            {t('profile.activity_chart')}
          </h3>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '160px',
            gap: '0.75rem',
            paddingTop: '1rem',
          }}
        >
          {past7Days.map((day) => {
            const heightPct = Math.max(10, Math.round((day.count / maxActivity) * 100));
            const isToday = day.dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={day.dateStr}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: day.count > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {day.count}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${heightPct}%`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isToday
                      ? 'var(--accent-primary)'
                      : day.count > 0
                      ? 'var(--accent-primary-subtle)'
                      : 'var(--bg-tertiary)',
                    border: `1px solid ${isToday ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    boxShadow: isToday ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none',
                    transition: 'height 0.4s ease',
                  }}
                  title={`${day.dateStr}: ${day.count} Wörter geübt`}
                />
                <div
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: isToday ? 800 : 600,
                    color: isToday ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}
                >
                  {day.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📚 LEARNED WORDS SUBSECTION (Table with Filters & user_word_progress Sync) */}
      {/* ========================================================================= */}
      <div
        className="glass-panel"
        style={{
          padding: '1.85rem',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Subsection Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.2rem' }}>
              <BookOpen size={22} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                {t('profile.learned_words_title')}
              </h2>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {learnedWordsList.length}
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              {t('profile.learned_words_subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Database size={13} color={progressSource === 'supabase' ? 'var(--color-success)' : 'var(--text-muted)'} />
              <span>{progressSource === 'supabase' ? t('profile.source_cloud') : t('profile.source_local')}</span>
            </span>

            <button
              type="button"
              onClick={fetchLearnedWords}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
              title={t('profile.refresh_btn')}
            >
              <RotateCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{t('profile.refresh_btn')}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          {/* Search Input */}
          <div style={{ flex: '1 1 200px', position: 'relative', minWidth: '180px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('profile.search_learned_placeholder')}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card-solid)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />
          </div>

          {/* CEFR Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="all">{t('profile.filter_all_levels')}</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
          </select>

          {/* POS Filter */}
          <select
            value={selectedPos}
            onChange={(e) => {
              setSelectedPos(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="all">{t('profile.filter_all_pos')}</option>
            <option value="noun">Nomen (Substantiv)</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjektiv</option>
            <option value="adverb">Adverb</option>
            <option value="preposition">Präposition</option>
            <option value="other">Andere</option>
          </select>

          {/* Mastery / Starred Filter */}
          <select
            value={selectedMastery}
            onChange={(e) => {
              setSelectedMastery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="all">{t('profile.filter_mastery_all')}</option>
            <option value="3">{t('profile.filter_mastery_mastered')}</option>
            <option value="2">{t('profile.filter_mastery_familiar')}</option>
            <option value="1">{t('profile.filter_mastery_learning')}</option>
            <option value="starred">{t('profile.filter_starred_only')}</option>
          </select>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card-solid)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value="recent">{t('profile.sort_recent')}</option>
              <option value="accuracy">{t('profile.sort_accuracy')}</option>
              <option value="reviews">{t('profile.sort_reviews')}</option>
              <option value="alpha_de">{t('profile.sort_alpha_de')}</option>
              <option value="alpha_en">{t('profile.sort_alpha_en')}</option>
            </select>
          </div>
        </div>

        {/* Table Content or Empty State */}
        {filteredLearnedWords.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)',
            }}
          >
            <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {learnedWordsList.length === 0 ? t('profile.no_learned_words') : t('profile.no_matching_words')}
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 1.25rem auto' }}>
              {learnedWordsList.length === 0 ? t('profile.no_learned_words_desc') : t('profile.no_matching_words_desc')}
            </p>
            {learnedWordsList.length === 0 ? (
              <button
                type="button"
                onClick={() => onNavigateTab('vocab')}
                style={{
                  padding: '0.7rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#0b0f17',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                }}
              >
                {t('profile.practice_now')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLevel('all');
                  setSelectedPos('all');
                  setSelectedMastery('all');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                }}
              >
                {t('grammar.reset_filter')}
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.88rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderBottom: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '0.9rem 1rem', width: '36px' }}>★</th>
                  <th style={{ padding: '0.9rem 1rem' }}>{t('profile.col_word')}</th>
                  <th style={{ padding: '0.9rem 1rem' }}>{t('profile.col_meaning')}</th>
                  <th style={{ padding: '0.9rem 1rem' }}>{t('profile.col_level_pos')}</th>
                  <th style={{ padding: '0.9rem 1rem' }}>{t('profile.col_mastery')}</th>
                  <th style={{ padding: '0.9rem 1rem' }}>{t('profile.col_accuracy')}</th>
                  <th style={{ padding: '0.9rem 1rem' }}>{t('profile.col_last_reviewed')}</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>{t('profile.col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWords.map(({ word, progress, accuracy }) => {
                  const isStarred = Boolean(progress.starred);
                  const mastery = progress.mastery || 0;

                  return (
                    <tr
                      key={word.german}
                      onClick={() => setSelectedWordForModal(word)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card-solid)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-solid)')}
                    >
                      {/* Star Button */}
                      <td style={{ padding: '0.85rem 1rem' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(word.german, e)}
                          style={{
                            color: isStarred ? '#f59e0b' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={isStarred ? 'Gemerkt' : 'Zu Favoriten'}
                        >
                          <Star size={16} fill={isStarred ? '#f59e0b' : 'none'} />
                        </button>
                      </td>

                      {/* German Word + Pronunciation */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <GenderBadge gender={word.gender} size="sm" />
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.94rem' }}>
                            {word.german}
                          </span>
                          <span onClick={(e) => e.stopPropagation()}>
                            <SpeakerButton
                              text={`${word.gender ? word.gender + ' ' : ''}${word.german}`}
                              rate={profile.speechSpeed}
                              size={15}
                            />
                          </span>
                        </div>
                      </td>

                      {/* English Meaning */}
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {word.english}
                      </td>

                      {/* Level & POS Badges */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CefrBadge level={(word.cefr_level || 'A1') as CEFRLevel} size="sm" />
                          <PosBadge pos={word.pos} size="sm" />
                        </div>
                      </td>

                      {/* Mastery Badge */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor:
                              mastery >= 3
                                ? 'var(--color-success-bg)'
                                : mastery === 2
                                ? 'var(--accent-primary-subtle)'
                                : 'var(--accent-gold-subtle)',
                            color:
                              mastery >= 3
                                ? 'var(--color-success)'
                                : mastery === 2
                                ? 'var(--accent-primary)'
                                : 'var(--accent-gold)',
                            border: `1px solid ${
                              mastery >= 3
                                ? 'var(--color-success-border)'
                                : mastery === 2
                                ? 'rgba(56, 189, 248, 0.3)'
                                : 'rgba(245, 158, 11, 0.3)'
                            }`,
                          }}
                        >
                          {mastery >= 3 ? '🌟 Gemeistert' : mastery === 2 ? '🟢 Vertraut' : '🟡 Am Lernen'}
                        </span>
                      </td>

                      {/* Accuracy & Review Count */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                            <span
                              style={{
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono)',
                                color: accuracy >= 80 ? 'var(--color-success)' : accuracy >= 50 ? 'var(--accent-primary)' : 'var(--color-error)',
                              }}
                            >
                              {accuracy}%
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              ({progress.timesCorrect}/{progress.timesReviewed})
                            </span>
                          </div>
                          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${accuracy}%`,
                                height: '100%',
                                backgroundColor: accuracy >= 80 ? 'var(--color-success)' : accuracy >= 50 ? 'var(--accent-primary)' : 'var(--color-error)',
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Last Reviewed Timestamp */}
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {formatReviewedDate(progress.lastReviewedAt)}
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWordForModal(word);
                          }}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--accent-primary)',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                          }}
                        >
                          <Info size={13} style={{ display: 'inline', marginRight: '4px' }} />
                          {t('profile.word_details_btn')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredLearnedWords.length > pageSize && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              {t('profile.showing_count', {
                current: Math.min(filteredLearnedWords.length, (currentPage - 1) * pageSize + 1) + ' - ' + Math.min(filteredLearnedWords.length, currentPage * pageSize),
                total: filteredLearnedWords.length,
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                }}
              >
                <ChevronLeft size={16} />
                <span>{t('profile.page_prev')}</span>
              </button>

              <span style={{ fontWeight: 800, padding: '0 0.4rem', fontFamily: 'var(--font-mono)' }}>
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                }}
              >
                <span>{t('profile.page_next')}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mastery & Grammar Summary (2-Col Layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Vocabulary Mastery Breakdown */}
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              {t('profile.vocab_mastery')}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('vocab')}
              style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{t('profile.practice_btn')}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Level 3: Mastered */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                  {t('profile.mastery_level_3')}
                </span>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{masteryStats.mastered}</span>
              </div>
              <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: `${(masteryStats.mastered / masteryStats.total) * 100}%`, height: '100%', backgroundColor: 'var(--color-success)' }} />
              </div>
            </div>

            {/* Level 2: Familiar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {t('profile.mastery_level_2')}
                </span>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{masteryStats.familiar}</span>
              </div>
              <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: `${(masteryStats.familiar / masteryStats.total) * 100}%`, height: '100%', backgroundColor: 'var(--accent-primary)' }} />
              </div>
            </div>

            {/* Level 1: Learning */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                  {t('profile.mastery_level_1')}
                </span>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{masteryStats.learning}</span>
              </div>
              <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: `${(masteryStats.learning / masteryStats.total) * 100}%`, height: '100%', backgroundColor: 'var(--accent-gold)' }} />
              </div>
            </div>

            {/* Level 0: Unseen */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                  {t('profile.mastery_level_0')}
                </span>
                <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{masteryStats.unlearned}</span>
              </div>
              <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: `${(masteryStats.unlearned / masteryStats.total) * 100}%`, height: '100%', backgroundColor: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Grammar Mastery Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              {t('profile.grammar_status')}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('grammar')}
              style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{t('profile.view_rules')}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: 'var(--radius-full)',
                border: '6px solid var(--color-success)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {learnedRulesCount}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ {grammarRules.length}</span>
            </div>

            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {learnedRulesCount} {t('profile.rules_learned')}
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.45 }}>
                {t('profile.grammar_learned_desc')}
              </p>
            </div>
          </div>

          {/* Bookmarked rules notice */}
          {starredRules.length > 0 && (
            <div
              style={{
                padding: '0.95rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-gold-subtle)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.88rem' }}>
                <Star size={16} fill="#f59e0b" />
                <span>{starredRules.length} {t('profile.rules_bookmarked')}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {t('profile.rules_bookmarked_desc')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Starred Words Collection */}
      {starredWords.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Star size={20} fill="#f59e0b" color="#f59e0b" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                {t('profile.starred_vocab')} ({starredWords.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('vocab')}
              style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{t('profile.practice_now')}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {starredWords.slice(0, 20).map((word) => (
              <span
                key={word.german}
                onClick={() => setSelectedWordForModal(word)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                }}
              >
                <GenderBadge gender={word.gender} size="sm" />
                <strong style={{ color: 'var(--text-primary)' }}>{word.german}</strong>
                <span style={{ color: 'var(--text-muted)' }}>→ {word.english}</span>
              </span>
            ))}
            {starredWords.length > 20 && (
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>
                +{starredWords.length - 20} weitere
              </span>
            )}
          </div>
        </div>
      )}

      {/* Word Detail Modal (When a word is clicked in the table or starred collection) */}
      {selectedWordForModal && (
        <WordDetailModal
          word={selectedWordForModal}
          progress={wordProgressMap[selectedWordForModal.german.toLowerCase().trim()]}
          profile={profile}
          isStarred={Boolean(wordProgressMap[selectedWordForModal.german.toLowerCase().trim()]?.starred)}
          onToggleStar={(german) => handleToggleStar(german)}
          onClose={() => setSelectedWordForModal(null)}
        />
      )}
    </div>
  );
};
