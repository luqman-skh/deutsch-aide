import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Flame } from 'lucide-react';
import type { Word, UserProfile } from '../../types';
import { GenderBadge } from '../common/GenderBadge';
import { PosBadge } from '../common/PosBadge';
import { ProgressBar } from '../common/ProgressBar';
import { SpeakerButton } from '../common/SpeakerButton';
import { speakGerman, playSfx } from '../../utils/audio';
import { storageService } from '../../services/storageService';
import { useTranslation } from '../../i18n/LanguageContext';

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
  const { t } = useTranslation();
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
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
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

        {/* Streak Counter */}
        {streak > 1 && (
          <div
            className="animate-flame"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--accent-gold)',
              fontWeight: 800,
              fontSize: '0.85rem',
              backgroundColor: 'var(--accent-gold-subtle)',
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 0 14px rgba(245, 158, 11, 0.25)',
            }}
          >
            <Flame size={16} fill="#f59e0b" />
            <span>{streak}x {t('quiz.streak')}</span>
          </div>
        )}

        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {t('quiz.question_count')} {currentIndex + 1} {t('fc.of')} {words.length}
        </span>
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <ProgressBar current={currentIndex + 1} total={words.length} height={7} />
      </div>

      {/* Question Card */}
      <div
        className="glass-panel glow-edge"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-lg)',
          background: 'linear-gradient(145deg, var(--bg-card-solid) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => !isAnswered && setModeDeToEn(!modeDeToEn)}
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-primary-subtle)',
                padding: '0.25rem 0.7rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                letterSpacing: '0.02em',
              }}
              title="Klicken zum Wechseln der Fragerichtung"
            >
              {modeDeToEn ? '🇩🇪 DE → 🇬🇧 EN' : '🇬🇧 EN → 🇩🇪 DE'}
            </button>
            <PosBadge pos={currentWord.pos} size="sm" />
          </div>

          <SpeakerButton
            text={`${currentWord.gender ? currentWord.gender + ' ' : ''}${currentWord.german}`}
            rate={profile.speechSpeed}
            size={18}
          />
        </div>

        <div style={{ padding: '1rem 0' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
            {t('quiz.what_means')}
          </div>

          {modeDeToEn ? (
            <div>
              {currentWord.gender && (
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
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
                  fontSize: '2.75rem',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                }}
              >
                {currentWord.german}
              </h2>
            </div>
          ) : (
            <h2
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'var(--accent-primary)',
                letterSpacing: '-0.02em',
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
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        {options.map((option, idx) => {
          const isCorrect = option.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
          const isSelected = selectedOption === option;

          let btnBg = 'var(--bg-card-solid)';
          let btnBorder = 'var(--border-subtle)';
          let btnColor = 'var(--text-primary)';
          let btnShadow = 'var(--shadow-sm)';

          if (isAnswered) {
            if (isCorrect) {
              btnBg = 'var(--color-success-bg)';
              btnBorder = 'var(--color-success-border)';
              btnColor = 'var(--color-success)';
              btnShadow = '0 0 16px rgba(16, 185, 129, 0.2)';
            } else if (isSelected) {
              btnBg = 'var(--color-error-bg)';
              btnBorder = 'var(--color-error-border)';
              btnColor = 'var(--color-error)';
              btnShadow = '0 0 16px rgba(239, 68, 68, 0.2)';
            } else {
              btnBg = 'var(--bg-card-solid)';
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
                padding: '1.1rem 1.4rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: btnBg,
                border: `2px solid ${btnBorder}`,
                color: btnColor,
                fontWeight: 700,
                fontSize: '1.08rem',
                textAlign: 'left',
                boxShadow: btnShadow,
                transform: !isAnswered && isSelected ? 'scale(0.98)' : 'none',
                cursor: isAnswered ? 'default' : 'pointer',
              }}
              className={!isAnswered ? 'glass-panel-interactive' : ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {idx + 1}
                </span>
                <span>{option}</span>
              </div>

              {isAnswered && isCorrect && <CheckCircle2 size={22} color="var(--color-success)" />}
              {isAnswered && isSelected && !isCorrect && <XCircle size={22} color="var(--color-error)" />}
            </button>
          );
        })}
      </div>

      {/* Explanation Box on Answer */}
      {isAnswered && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '1.15rem 1.4rem',
            marginBottom: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
            <GenderBadge gender={currentWord.gender} showLabel />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {currentWord.german} = {currentWord.english}
            </span>
          </div>

          {currentWord.example_de && (
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              <div>"{currentWord.example_de}"</div>
              {currentWord.example_en && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.1rem' }}>
                  "{currentWord.example_en}"
                </div>
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
            padding: '1.1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-primary)',
            color: '#0b0f17',
            fontWeight: 900,
            fontSize: '1.05rem',
            boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
          }}
        >
          <span>{t('quiz.next')}</span>
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};
