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

    // Move to next card or complete
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
        <p>Keine Wörter zum Lernen gefunden.</p>
        <button type="button" onClick={onExit} style={{ marginTop: '1rem' }}>
          Zurück
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
            padding: '0.1rem 0.3rem',
            borderRadius: 'var(--radius-sm)',
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
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
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
            padding: '0.4rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Beenden</span>
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Karte {currentIndex + 1} von {words.length}
        </span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <ProgressBar current={currentIndex + 1} total={words.length} height={6} />
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="perspective-container"
        style={{ width: '100%', minHeight: '360px', marginBottom: '1.5rem' }}
        onClick={handleFlip}
      >
        <div
          className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}
          style={{ width: '100%', minHeight: '360px', cursor: 'pointer' }}
        >
          {/* Card Front (German) */}
          <div
            className="flip-card-front glass-panel"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-medium)',
              position: 'relative',
            }}
          >
            {/* Top Badges & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GenderBadge gender={currentWord.gender} showLabel />
                <PosBadge pos={currentWord.pos} />
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
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isStarred ? 'var(--accent-gold-subtle)' : 'var(--bg-tertiary)',
                    color: isStarred ? 'var(--accent-gold)' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  title={isStarred ? 'Gemerkt (Favorit)' : 'Zu Favoriten hinzufügen'}
                >
                  <Star size={18} fill={isStarred ? '#f59e0b' : 'none'} />
                </button>
              </div>
            </div>

            {/* Central German Word */}
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              {currentWord.gender && (
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color:
                      currentWord.gender === 'der'
                        ? 'var(--color-der)'
                        : currentWord.gender === 'die'
                        ? 'var(--color-die)'
                        : 'var(--color-das)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {currentWord.gender}
                </div>
              )}
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                }}
              >
                {currentWord.german}
              </h1>

              {currentWord.frequency_rank && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.75rem',
                  }}
                >
                  Häufigkeitsrang: #{currentWord.frequency_rank}
                </div>
              )}
            </div>

            {/* Bottom Flip Hint */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
              }}
            >
              <RotateCw size={14} />
              <span>Klicken oder [Leertaste] zum Umdrehen</span>
            </div>
          </div>

          {/* Card Back (English & Details) */}
          <div
            className="flip-card-back glass-panel"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            {/* Top header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  Übersetzung & Kontext
                </span>
              </div>
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
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: 'var(--accent-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                {currentWord.english}
              </h2>

              {currentWord.all_translations && currentWord.all_translations !== currentWord.english && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                  }}
                >
                  Weitere Bedeutungen: <em>{currentWord.all_translations}</em>
                </p>
              )}

              {/* Example sentence */}
              {currentWord.example_de && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '0.75rem',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.92rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      marginBottom: '0.25rem',
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
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {currentWord.example_en}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* German Word Reference */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.5rem',
              }}
            >
              <span>
                Deutsch: <strong>{currentWord.gender ? `${currentWord.gender} ` : ''}{currentWord.german}</strong>
              </span>
              <span>[1-4] zum Bewerten</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.6rem',
        }}
      >
        <button
          type="button"
          onClick={() => handleRating('again')}
          style={{
            padding: '0.75rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--color-error)',
            fontWeight: 700,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
          }}
          title="Taste [1] drücken"
        >
          <div style={{ fontSize: '0.85rem' }}>Nochmals</div>
          <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>Taste 1</span>
        </button>

        <button
          type="button"
          onClick={() => handleRating('hard')}
          style={{
            padding: '0.75rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--accent-gold)',
            fontWeight: 700,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
          }}
          title="Taste [2] drücken"
        >
          <div style={{ fontSize: '0.85rem' }}>Schwer</div>
          <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>Taste 2</span>
        </button>

        <button
          type="button"
          onClick={() => handleRating('good')}
          style={{
            padding: '0.75rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-primary-subtle)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: 'var(--accent-primary)',
            fontWeight: 700,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
          }}
          title="Taste [3] drücken"
        >
          <div style={{ fontSize: '0.85rem' }}>Gut</div>
          <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>Taste 3</span>
        </button>

        <button
          type="button"
          onClick={() => handleRating('easy')}
          style={{
            padding: '0.75rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--color-success)',
            fontWeight: 700,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
          }}
          title="Taste [4] drücken"
        >
          <div style={{ fontSize: '0.85rem' }}>Einfach</div>
          <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>Taste 4</span>
        </button>
      </div>
    </div>
  );
};
