import React, { useState, useMemo } from 'react';
import {
  Layers,
  HelpCircle,
  Edit3,
  Zap,
  Star,
  Filter,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { Word, UserProfile, TrainerMode } from '../../types';
import { FlashcardTrainer } from './FlashcardTrainer';
import { QuizTrainer } from './QuizTrainer';
import { SpellingTrainer } from './SpellingTrainer';
import { ArticleRushTrainer } from './ArticleRushTrainer';
import { SessionSummary } from './SessionSummary';
import { storageService } from '../../services/storageService';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props {
  words: Word[];
  profile: UserProfile;
  onRefreshData?: () => void;
}

export const VocabHub: React.FC<Props> = ({ words, profile }) => {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<TrainerMode>('menu');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [sessionLimit, setSessionLimit] = useState<number>(15);
  const [onlyStarred, setOnlyStarred] = useState(false);

  // Summary state after completing a session
  const [summaryData, setSummaryData] = useState<{
    modeTitle: string;
    total: number;
    correct: number;
    xpGained: number;
    incorrectWords: Word[];
  } | null>(null);

  const wordProgressMap = useMemo(() => {
    return storageService.getAllWordProgress();
  }, [activeMode, summaryData]);

  // Compute dataset statistics
  const stats = useMemo(() => {
    let mastered = 0;
    let learning = 0;
    let starred = 0;

    words.forEach((w) => {
      const p = wordProgressMap[w.german.toLowerCase().trim()];
      if (p) {
        if (p.mastery >= 3) mastered++;
        else if (p.mastery > 0) learning++;
        if (p.starred) starred++;
      }
    });

    return { mastered, learning, starred, total: words.length };
  }, [words, wordProgressMap]);

  // Filtered list of words for the training session
  const filteredWords = useMemo(() => {
    let list = words.filter((w) => {
      if (selectedLevel !== 'all' && (w.cefr_level || 'A1') !== selectedLevel) return false;
      if (selectedPos !== 'all' && (w.pos || '').toLowerCase() !== selectedPos) return false;
      if (onlyStarred) {
        const p = wordProgressMap[w.german.toLowerCase().trim()];
        if (!p?.starred) return false;
      }
      return true;
    });

    if (activeMode === 'weak-words') {
      list = list.filter((w) => {
        const p = wordProgressMap[w.german.toLowerCase().trim()];
        return p && (p.timesIncorrect > p.timesCorrect || p.starred || p.mastery === 0);
      });
    }

    const shuffled = [...list].sort(() => 0.5 - Math.random());
    return sessionLimit === 0 ? shuffled : shuffled.slice(0, sessionLimit);
  }, [words, selectedLevel, selectedPos, sessionLimit, onlyStarred, activeMode, wordProgressMap]);

  const handleStartSession = (mode: TrainerMode) => {
    setActiveMode(mode);
    setSummaryData(null);
  };

  const handleSessionFinish = (modeTitle: string, data: {
    total: number;
    correct: number;
    xpGained: number;
    incorrectWords: Word[];
  }) => {
    setSummaryData({
      modeTitle,
      total: data.total,
      correct: data.correct,
      xpGained: data.xpGained,
      incorrectWords: data.incorrectWords,
    });
  };

  const handleRestart = () => {
    setSummaryData(null);
  };

  const handleRetryMistakes = () => {
    if (summaryData?.incorrectWords && summaryData.incorrectWords.length > 0) {
      setSummaryData(null);
    }
  };

  const handleExitToMenu = () => {
    setActiveMode('menu');
    setSummaryData(null);
  };

  // If a session finished, show summary
  if (summaryData) {
    return (
      <SessionSummary
        modeTitle={summaryData.modeTitle}
        totalAnswered={summaryData.total}
        correctCount={summaryData.correct}
        xpGained={summaryData.xpGained}
        incorrectWords={summaryData.incorrectWords}
        onRestart={handleRestart}
        onRetryMistakes={summaryData.incorrectWords.length > 0 ? handleRetryMistakes : undefined}
        onExit={handleExitToMenu}
      />
    );
  }

  // Active Session Views
  if (activeMode === 'flashcards') {
    return (
      <FlashcardTrainer
        words={filteredWords.length > 0 ? filteredWords : words.slice(0, 15)}
        profile={profile}
        onFinish={(data) => handleSessionFinish(t('mode.flashcards.title'), data)}
        onExit={handleExitToMenu}
      />
    );
  }

  if (activeMode === 'quiz') {
    return (
      <QuizTrainer
        words={filteredWords.length > 0 ? filteredWords : words.slice(0, 15)}
        allWordsPool={words}
        profile={profile}
        onFinish={(data) => handleSessionFinish(t('mode.quiz.title'), data)}
        onExit={handleExitToMenu}
      />
    );
  }

  if (activeMode === 'spelling') {
    return (
      <SpellingTrainer
        words={filteredWords.length > 0 ? filteredWords : words.slice(0, 15)}
        profile={profile}
        onFinish={(data) => handleSessionFinish(t('mode.spelling.title'), data)}
        onExit={handleExitToMenu}
      />
    );
  }

  if (activeMode === 'article-rush') {
    return (
      <ArticleRushTrainer
        words={words}
        profile={profile}
        onExit={handleExitToMenu}
      />
    );
  }

  if (activeMode === 'weak-words') {
    return (
      <FlashcardTrainer
        words={filteredWords.length > 0 ? filteredWords : words.slice(0, 15)}
        profile={profile}
        onFinish={(data) => handleSessionFinish(t('mode.weak.title'), data)}
        onExit={handleExitToMenu}
      />
    );
  }

  // Main Trainer Menu & Mode Picker
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner / Stats Overview */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {t('vocab.badge_trainer')}
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
              {t('vocab.title')}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              {t('vocab.subtitle')}
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('vocab.words_total')}</div>
            </div>

            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-success)' }}>
                {stats.mastered}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('vocab.mastered')}</div>
            </div>

            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-gold-subtle)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                ★ {stats.starred}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('vocab.favorites')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Filter size={16} />
            <span>{t('vocab.filter')}</span>
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">{t('vocab.all_levels')}</option>
            <option value="A1">Niveau A1</option>
            <option value="A2">Niveau A2</option>
            <option value="B1">Niveau B1</option>
          </select>

          {/* POS Filter */}
          <select
            value={selectedPos}
            onChange={(e) => setSelectedPos(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">{t('vocab.all_pos')}</option>
            <option value="noun">{t('vocab.pos_noun')}</option>
            <option value="verb">{t('vocab.pos_verb')}</option>
            <option value="adjective">{t('vocab.pos_adjective')}</option>
            <option value="adverb">{t('vocab.pos_adverb')}</option>
            <option value="preposition">{t('vocab.pos_preposition')}</option>
          </select>

          {/* Session Size */}
          <select
            value={sessionLimit}
            onChange={(e) => setSessionLimit(Number(e.target.value))}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value={10}>10 {t('vocab.words_per_round')}</option>
            <option value={15}>15 {t('vocab.words_per_round')}</option>
            <option value={25}>25 {t('vocab.words_per_round')}</option>
            <option value={50}>50 {t('vocab.words_per_round')}</option>
            <option value={0}>{t('vocab.all_words')}</option>
          </select>
        </div>

        {/* Starred Only Toggle */}
        <button
          type="button"
          onClick={() => setOnlyStarred(!onlyStarred)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: onlyStarred ? 'var(--accent-gold-subtle)' : 'var(--bg-tertiary)',
            border: `1px solid ${onlyStarred ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
            color: onlyStarred ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <Star size={15} fill={onlyStarred ? '#f59e0b' : 'none'} />
          <span>{t('vocab.only_favorites')}</span>
        </button>
      </div>

      {/* Training Modes Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* 1. Flashcards Mode */}
        <div
          className="glass-panel-interactive"
          onClick={() => handleStartSession('flashcards')}
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderLeft: '4px solid var(--accent-primary)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                }}
              >
                <Layers size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {t('mode.flashcards.badge')}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {t('mode.flashcards.title')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {t('mode.flashcards.desc')}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {filteredWords.length} {t('vocab.words_total')}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <span>{t('vocab.start')}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* 2. Multiple Choice Quiz */}
        <div
          className="glass-panel-interactive"
          onClick={() => handleStartSession('quiz')}
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderLeft: '4px solid #a855f7',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                }}
              >
                <HelpCircle size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#a855f7',
                  backgroundColor: 'rgba(168, 85, 247, 0.15)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {t('mode.quiz.badge')}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {t('mode.quiz.title')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {t('mode.quiz.desc')}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>4 Options</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: '#a855f7',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <span>{t('vocab.start')}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* 3. Spelling / Writing Trainer */}
        <div
          className="glass-panel-interactive"
          onClick={() => handleStartSession('spelling')}
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderLeft: '4px solid #10b981',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-success-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-success)',
                }}
              >
                <Edit3 size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-success)',
                  backgroundColor: 'var(--color-success-bg)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {t('mode.spelling.badge')}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {t('mode.spelling.title')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {t('mode.spelling.desc')}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ä, ö, ü, ß</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--color-success)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <span>{t('vocab.start')}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* 4. Article Rush (Der / Die / Das) */}
        <div
          className="glass-panel-interactive"
          onClick={() => handleStartSession('article-rush')}
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderLeft: '4px solid var(--accent-gold)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-gold-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                }}
              >
                <Zap size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-gold)',
                  backgroundColor: 'var(--accent-gold-subtle)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {t('mode.rush.badge')}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {t('mode.rush.title')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {t('mode.rush.desc')}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t('rush.score')}: {profile.rushHighScore || 0}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <span>{t('vocab.play')}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* 5. Weak Words / Starred Words Focus */}
        <div
          className="glass-panel-interactive"
          onClick={() => handleStartSession('weak-words')}
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderLeft: '4px solid #ef4444',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-error-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-error)',
                }}
              >
                <TrendingUp size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-error)',
                  backgroundColor: 'var(--color-error-bg)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {t('mode.weak.badge')}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              {t('mode.weak.title')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {t('mode.weak.desc')}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('vocab.badge_trainer')}</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'var(--color-error)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <span>{t('vocab.start')}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
