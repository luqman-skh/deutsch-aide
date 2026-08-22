import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCw,
  Star,
  ArrowLeft,
} from 'lucide-react';
import type { Word, UserProfile } from '../../types';
import { GenderBadge } from '../common/GenderBadge';
import { PosBadge } from '../common/PosBadge';
import { CefrBadge } from '../common/CefrBadge';
import { SpeakerButton } from '../common/SpeakerButton';
import { ProgressBar } from '../common/ProgressBar';
import { speakGerman, playSfx } from '../../utils/audio';
import { storageService } from '../../services/storageService';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props {
  words: Word[];
  profile: UserProfile;
  onFinish: (summary: {
    total: number;
    correct: number;
    xpGained: number;
    incorrectWords: Word[];
  }) => void;
  onExit: () => void;
}

export const FlashcardTrainer: React.FC<Props> = ({
  words,
  profile,
  onFinish,
  onExit,
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [starredMap, setStarredMap] = useState<Record<string, boolean>>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [incorrectList, setIncorrectList] = useState<Word[]>([]);

  const currentWord = words[currentIndex] || null;

  // Initialize starred status
  useEffect(() => {
    const allProgress = storageService.getAllWordProgress();
    const map: Record<string, boolean> = {};
    words.forEach((w) => {
      const p = allProgress[w.german.toLowerCase().trim()];
      if (p?.starred) map[w.german] = true;
    });
    setStarredMap(map);
  }, [words]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    playSfx('flip', profile.soundEffects);
  }, [profile.soundEffects]);

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;
    const newStatus = storageService.toggleStarWord(currentWord.german);
    setStarredMap((prev) => ({ ...prev, [currentWord.german]: newStatus }));
    playSfx('click', profile.soundEffects);
  };

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentWord) return;

    const isCorrect = rating !== 'again';
    const result = storageService.recordWordPractice(currentWord.german, isCorrect, rating);

    setXpTotal((prev) => prev + result.xpGained);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      playSfx('correct', profile.soundEffects);
    } else {
      setIncorrectList((prev) => [...prev, currentWord]);
      playSfx('incorrect', profile.soundEffects);
    }

    if (currentIndex + 1 < words.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish({
        total: words.length,
        correct: correctCount + (isCorrect ? 1 : 0),
        xpGained: xpTotal + result.xpGained,
        incorrectWords: isCorrect ? incorrectList : [...incorrectList, currentWord],
      });
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1') {
        e.preventDefault();
        handleRating('again');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRating('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRating('good');
      } else if (e.key === '4') {
        e.preventDefault();
        handleRating('easy');
      } else if (e.key.toLowerCase() === 's' && currentWord) {
        e.preventDefault();
        speakGerman(currentWord.german, profile.speechSpeed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, currentWord, profile, handleFlip]);

  if (!currentWord) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Keine Wörter zum Lernen gefunden.</p>
        <button
          type="button"
          onClick={onExit}
          style={{
            marginTop: '1rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: 'var(--accent-primary)',
            color: '#0b0f17',
            fontWeight: 800,
            borderRadius: 'var(--radius-md)',
          }}
        >
          {t('fc.exit')}
        </button>
      </div>
    );
  }

  const isStarred = Boolean(starredMap[currentWord.german]);

  const renderHighlightedExample = (example: string, word: string) => {
    if (!example || !word) return example;
    const cleanWord = word.replace(/^(der|die|das)\s+/i, '').trim();
    const regex = new RegExp(`(${cleanWord})`, 'gi');
    const parts = example.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          style={{
            fontWeight: 800,
            color: 'var(--accent-primary)',
            backgroundColor: 'var(--accent-primary-subtle)',
            padding: '0.1rem 0.35rem',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      {/* Top Header & Progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <button
          type="button"
          onClick={onExit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <ArrowLeft size={15} />
          <span>{t('fc.exit')}</span>
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {t('fc.card')} {currentIndex + 1} {t('fc.of')} {words.length}
        </span>
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <ProgressBar current={currentIndex + 1} total={words.length} height={7} />
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="perspective-container"
        style={{ width: '100%', minHeight: '380px', marginBottom: '1.75rem' }}
        onClick={handleFlip}
      >
        <div
          className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}
          style={{ width: '100%', minHeight: '380px', cursor: 'pointer' }}
        >
          {/* Card Front (German) */}
          <div
            className="flip-card-front glass-panel glow-edge"
            style={{
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-medium)',
              position: 'relative',
              background: 'linear-gradient(145deg, var(--bg-card-solid) 0%, var(--bg-secondary) 100%)',
            }}
          >
            {/* Top Badges & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <GenderBadge gender={currentWord.gender} showLabel size="md" />
                <PosBadge pos={currentWord.pos} size="sm" />
                <CefrBadge level={currentWord.cefr_level || 'A1'} size="sm" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SpeakerButton
                  text={`${currentWord.gender ? currentWord.gender + ' ' : ''}${currentWord.german}`}
                  rate={profile.speechSpeed}
                  size={18}
                />
                <button
                  type="button"
                  onClick={handleToggleStar}
                  style={{
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isStarred ? 'var(--accent-gold-subtle)' : 'var(--bg-tertiary)',
                    color: isStarred ? 'var(--accent-gold)' : 'var(--text-muted)',
                    border: `1px solid ${isStarred ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
                    boxShadow: isStarred ? '0 0 12px rgba(245, 158, 11, 0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={isStarred ? 'Gemerkt' : 'Zu Favoriten'}
                >
                  <Star size={18} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
                </button>
              </div>
            </div>

            {/* Central German Word */}
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              {currentWord.gender && (
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color:
                      currentWord.gender === 'der'
                        ? 'var(--color-der)'
                        : currentWord.gender === 'die'
                        ? 'var(--color-die)'
                        : 'var(--color-das)',
                    marginBottom: '0.35rem',
                  }}
                >
                  {currentWord.gender}
                </div>
              )}
              <h1
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
                }}
              >
                {currentWord.german}
              </h1>

              {currentWord.frequency_rank && (
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.15rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    marginTop: '1rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {t('fc.freq_rank')} #{currentWord.frequency_rank}
                </div>
              )}
            </div>

            {/* Bottom Flip Hint */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
              }}
            >
              <RotateCw size={15} color="var(--accent-primary)" />
              <span>{t('fc.flip_hint')}</span>
            </div>
          </div>

          {/* Card Back (English & Details) */}
          <div
            className="flip-card-back glass-panel glow-edge"
            style={{
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-secondary)',
              background: 'linear-gradient(145deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            }}
          >
            {/* Top header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--accent-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {t('fc.context_title')}
              </span>
              <SpeakerButton
                text={`${currentWord.gender ? currentWord.gender + ' ' : ''}${currentWord.german}`}
                rate={profile.speechSpeed}
                size={18}
              />
            </div>

            {/* Translation & Examples */}
            <div style={{ padding: '0.75rem 0' }}>
              <h2
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {currentWord.english}
              </h2>

              {currentWord.all_translations && currentWord.all_translations !== currentWord.english && (
                <p
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                  }}
                >
                  {t('fc.other_translations')} <em>{currentWord.all_translations}</em>
                </p>
              )}

              {/* Example sentence */}
              {currentWord.example_de && (
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '0.75rem',
                    textAlign: 'left',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.96rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.45,
                      marginBottom: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <span>{renderHighlightedExample(currentWord.example_de, currentWord.german)}</span>
                    <SpeakerButton text={currentWord.example_de} size={15} />
                  </div>
                  {currentWord.example_en && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      "{currentWord.example_en}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* German Word Reference & Shortcut Hint */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
              }}
            >
              <span>
                {t('fc.german_ref')}{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {currentWord.gender ? `${currentWord.gender} ` : ''}{currentWord.german}
                </strong>
              </span>
              <span style={{ fontWeight: 600 }}>{t('fc.rate_hint')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
        }}
      >
        {/* Again (1) */}
        <button
          type="button"
          onClick={() => handleRating('again')}
          style={{
            padding: '0.85rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            color: 'var(--color-error)',
            fontWeight: 800,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="Taste [1] drücken"
        >
          <div style={{ fontSize: '0.92rem' }}>{t('fc.rating_again')}</div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            [1]
          </span>
        </button>

        {/* Hard (2) */}
        <button
          type="button"
          onClick={() => handleRating('hard')}
          style={{
            padding: '0.85rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-gold-subtle)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: 'var(--accent-gold)',
            fontWeight: 800,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="Taste [2] drücken"
        >
          <div style={{ fontSize: '0.92rem' }}>{t('fc.rating_hard')}</div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            [2]
          </span>
        </button>

        {/* Good (3) */}
        <button
          type="button"
          onClick={() => handleRating('good')}
          style={{
            padding: '0.85rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-primary-subtle)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            color: 'var(--accent-primary)',
            fontWeight: 800,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="Taste [3] drücken"
        >
          <div style={{ fontSize: '0.92rem' }}>{t('fc.rating_good')}</div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            [3]
          </span>
        </button>

        {/* Easy (4) */}
        <button
          type="button"
          onClick={() => handleRating('easy')}
          style={{
            padding: '0.85rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            color: 'var(--color-success)',
            fontWeight: 800,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="Taste [4] drücken"
        >
          <div style={{ fontSize: '0.92rem' }}>{t('fc.rating_easy')}</div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            [4]
          </span>
        </button>
      </div>
    </div>
  );
};
