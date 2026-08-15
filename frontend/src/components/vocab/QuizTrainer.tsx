import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { Word, UserProfile } from '../../types';
import { GenderBadge } from '../common/GenderBadge';
import { PosBadge } from '../common/PosBadge';
import { ProgressBar } from '../common/ProgressBar';
import { SpeakerButton } from '../common/SpeakerButton';
import { speakGerman, playSfx } from '../../utils/audio';
import { storageService } from '../../services/storageService';

interface Props {
  words: Word[];
  allWordsPool: Word[];
  profile: UserProfile;
  onFinish: (summary: {
    total: number;
    correct: number;
    xpGained: number;
    incorrectWords: Word[];
  }) => void;
  onExit: () => void;
}

export const QuizTrainer: React.FC<Props> = ({
  words,
  allWordsPool,
  profile,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [incorrectList, setIncorrectList] = useState<Word[]>([]);
  const [modeDeToEn, setModeDeToEn] = useState(true);

  const currentWord = words[currentIndex] || null;

  // Generate 4 randomized options
  const options = useMemo(() => {
    if (!currentWord) return [];

    const correctAnswer = modeDeToEn ? currentWord.english : currentWord.german;
    const pool = allWordsPool.filter(
      (w) => (modeDeToEn ? w.english !== currentWord.english : w.german !== currentWord.german)
    );

    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const distractors = shuffledPool
      .slice(0, 3)
      .map((w) => (modeDeToEn ? w.english : w.german));

    const allOpts = Array.from(new Set([correctAnswer, ...distractors]));

    while (allOpts.length < 4 && pool.length > allOpts.length) {
      const extra = pool[Math.floor(Math.random() * pool.length)];
      const val = modeDeToEn ? extra.english : extra.german;
      if (!allOpts.includes(val)) allOpts.push(val);
    }

    return allOpts.sort(() => 0.5 - Math.random());
  }, [currentWord, allWordsPool, modeDeToEn]);

  const correctAnswer = currentWord ? (modeDeToEn ? currentWord.english : currentWord.german) : '';

  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentWord) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);

      const bonus = newStreak >= 3 ? 5 : 0;
      const res = storageService.recordWordPractice(currentWord.german, true, 'good');
      setXpTotal((prev) => prev + res.xpGained + bonus);

      playSfx(newStreak >= 3 ? 'streak' : 'correct', profile.soundEffects);
    } else {
      setStreak(0);
      setIncorrectList((prev) => [...prev, currentWord]);
      const res = storageService.recordWordPractice(currentWord.german, false, 'again');
      setXpTotal((prev) => prev + res.xpGained);
      playSfx('incorrect', profile.soundEffects);
    }

    speakGerman(currentWord.german, profile.speechSpeed);
  };

  const handleNext = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onFinish({
        total: words.length,
        correct: correctCount,
        xpGained: xpTotal,
        incorrectWords: incorrectList,
      });
    }
  };

  // Keyboard number shortcuts 1-4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (options[idx]) handleSelectOption(options[idx]);
        }
      } else if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, isAnswered, currentIndex]);

  if (!currentWord) return null;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
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
          }}
        >
          <ArrowLeft size={16} />
          <span>Beenden</span>
        </button>

        {/* Streak Counter */}
        {streak > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--accent-gold)',
              fontWeight: 800,
              fontSize: '0.85rem',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <Sparkles size={14} />
            <span>{streak}x Serie!</span>
          </div>
        )}

        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Frage {currentIndex + 1} von {words.length}
        </span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <ProgressBar current={currentIndex + 1} total={words.length} height={6} />
      </div>

      {/* Question Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => !isAnswered && setModeDeToEn(!modeDeToEn)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-primary-subtle)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
              }}
              title="Klicken zum Wechseln der Fragerichtung"
            >
              {modeDeToEn ? 'Deutsch → Englisch' : 'Englisch → Deutsch'}
            </button>
            <PosBadge pos={currentWord.pos} size="sm" />
          </div>

          <SpeakerButton
            text={`${currentWord.gender ? currentWord.gender + ' ' : ''}${currentWord.german}`}
            rate={profile.speechSpeed}
          />
        </div>

        <div style={{ padding: '1rem 0' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Was bedeutet dieses Wort?
          </div>

          {modeDeToEn ? (
            <div>
              {currentWord.gender && (
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color:
                      currentWord.gender === 'der'
                        ? 'var(--color-der)'
                        : currentWord.gender === 'die'
                        ? 'var(--color-die)'
                        : 'var(--color-das)',
                  }}
                >
                  {currentWord.gender}
                </div>
              )}
              <h2
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                {currentWord.german}
              </h2>
            </div>
          ) : (
            <h2
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: 'var(--accent-primary)',
              }}
            >
              {currentWord.english}
            </h2>
          )}
        </div>
      </div>

      {/* Options Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {options.map((option, idx) => {
          const isCorrect = option.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
          const isSelected = selectedOption === option;

          let btnBg = 'var(--bg-card)';
          let btnBorder = 'var(--border-subtle)';
          let btnColor = 'var(--text-primary)';

          if (isAnswered) {
            if (isCorrect) {
              btnBg = 'var(--color-success-bg)';
              btnBorder = 'rgba(16, 185, 129, 0.5)';
              btnColor = 'var(--color-success)';
            } else if (isSelected) {
              btnBg = 'var(--color-error-bg)';
              btnBorder = 'rgba(239, 68, 68, 0.5)';
              btnColor = 'var(--color-error)';
            } else {
              btnBg = 'var(--bg-card)';
              btnBorder = 'var(--border-subtle)';
              btnColor = 'var(--text-muted)';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectOption(option)}
              disabled={isAnswered}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: btnBg,
                border: `2px solid ${btnBorder}`,
                color: btnColor,
                fontWeight: 600,
                fontSize: '1.05rem',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
                cursor: isAnswered ? 'default' : 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {idx + 1}
                </span>
                <span>{option}</span>
              </div>

              {isAnswered && isCorrect && <CheckCircle2 size={20} color="var(--color-success)" />}
              {isAnswered && isSelected && !isCorrect && <XCircle size={20} color="var(--color-error)" />}
            </button>
          );
        })}
      </div>

      {/* Explanation Box on Answer */}
      {isAnswered && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <GenderBadge gender={currentWord.gender} showLabel />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {currentWord.german} = {currentWord.english}
            </span>
          </div>

          {currentWord.example_de && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              <div>"{currentWord.example_de}"</div>
              {currentWord.example_en && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>"{currentWord.example_en}"</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <button
          type="button"
          onClick={handleNext}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-primary)',
            color: '#0b0f17',
            fontWeight: 800,
            fontSize: '1rem',
          }}
        >
          <span>Weiter [Enter]</span>
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};
