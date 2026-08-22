import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
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
  profile: UserProfile;
  onFinish: (summary: {
    total: number;
    correct: number;
    xpGained: number;
    incorrectWords: Word[];
  }) => void;
  onExit: () => void;
}

export const SpellingTrainer: React.FC<Props> = ({
  words,
  profile,
  onFinish,
  onExit,
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0: none, 1: gender/first char, 2: full reveal
  const [correctCount, setCorrectCount] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [incorrectList, setIncorrectList] = useState<Word[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentWord = words[currentIndex] || null;

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex, isSubmitted]);

  if (!currentWord) return null;

  const umlauts = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

  const handleInsertChar = (char: string) => {
    if (isSubmitted) return;
    setUserInput((prev) => prev + char);
    inputRef.current?.focus();
  };

  const handleCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSubmitted || !userInput.trim()) return;

    const targetClean = currentWord.german.toLowerCase().trim();
    const userClean = userInput.toLowerCase().trim();

    const withArticle = currentWord.gender ? `${currentWord.gender.toLowerCase()} ${targetClean}` : targetClean;
    const withoutArticle = userClean.replace(/^(der|die|das)\s+/i, '').trim();

    const correct =
      userClean === targetClean ||
      userClean === withArticle ||
      withoutArticle === targetClean;

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct && hintLevel === 0) {
      setCorrectCount((prev) => prev + 1);
      const res = storageService.recordWordPractice(currentWord.german, true, 'good');
      setXpTotal((prev) => prev + res.xpGained + 5);
      playSfx('correct', profile.soundEffects);
    } else {
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
      setUserInput('');
      setIsSubmitted(false);
      setIsCorrect(false);
      setHintLevel(0);
    } else {
      onFinish({
        total: words.length,
        correct: correctCount,
        xpGained: xpTotal,
        incorrectWords: incorrectList,
      });
    }
  };

  const handleHint = () => {
    setHintLevel((prev) => Math.min(2, prev + 1));
    playSfx('click', profile.soundEffects);
  };

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

        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {t('spelling.word_count')} {currentIndex + 1} {t('fc.of')} {words.length}
        </span>
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <ProgressBar current={currentIndex + 1} total={words.length} height={7} />
      </div>

      {/* Prompt Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--color-success)',
                backgroundColor: 'var(--color-success-bg)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-success-border)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {t('mode.spelling.badge')}
            </span>
            <PosBadge pos={currentWord.pos} size="sm" />
          </div>

          <button
            type="button"
            onClick={handleHint}
            disabled={hintLevel >= 2 || isSubmitted}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: hintLevel > 0 ? 'var(--accent-gold-subtle)' : 'var(--bg-tertiary)',
              border: `1px solid ${hintLevel > 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-medium)'}`,
              color: hintLevel > 0 ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Lightbulb size={14} />
            <span>{t('spelling.hint_btn')} {hintLevel > 0 ? `(${hintLevel}/2)` : ''}</span>
          </button>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>
          {t('spelling.prompt')}
        </div>

        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          {currentWord.english}
        </h2>

        {/* Hint display */}
        {hintLevel >= 1 && (
          <div
            className="animate-pop-in"
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-gold-subtle)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: 'var(--accent-gold)',
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
            }}
          >
            {currentWord.gender && <span>{t('spelling.article')} <strong>{currentWord.gender}</strong></span>}
            <span>
              {t('spelling.first_char')} <strong>{currentWord.german[0]}</strong>
              {hintLevel >= 2 && <span>...{currentWord.german.slice(1)}</span>}
            </span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleCheck} style={{ marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isSubmitted}
            placeholder={t('spelling.placeholder')}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            style={{
              width: '100%',
              padding: '1.2rem 1.4rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card-solid)',
              border: `2px solid ${
                isSubmitted
                  ? isCorrect
                    ? 'var(--color-success)'
                    : 'var(--color-error)'
                  : 'var(--border-medium)'
              }`,
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-md)',
            }}
          />
        </div>

        {/* German Umlauts Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            {t('spelling.umlauts')}
          </span>
          {umlauts.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => handleInsertChar(char)}
              disabled={isSubmitted}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
              className="glass-panel-interactive"
            >
              {char}
            </button>
          ))}
        </div>

        {!isSubmitted ? (
          <button
            type="submit"
            disabled={!userInput.trim()}
            style={{
              width: '100%',
              padding: '1.1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: userInput.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: userInput.trim() ? '#0b0f17' : 'var(--text-muted)',
              fontWeight: 900,
              fontSize: '1.05rem',
              cursor: userInput.trim() ? 'pointer' : 'not-allowed',
              boxShadow: userInput.trim() ? '0 4px 16px rgba(56, 189, 248, 0.4)' : 'none',
            }}
          >
            {t('spelling.check')}
          </button>
        ) : (
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
      </form>

      {/* Answer Feedback Card */}
      {isSubmitted && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '1.35rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
            border: `1px solid ${isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {isCorrect ? (
              <>
                <CheckCircle2 size={24} color="var(--color-success)" />
                <span style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '1.15rem' }}>
                  {t('spelling.correct')}
                </span>
              </>
            ) : (
              <>
                <XCircle size={24} color="var(--color-error)" />
                <span style={{ fontWeight: 800, color: 'var(--color-error)', fontSize: '1.15rem' }}>
                  {t('spelling.incorrect')}
                </span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('spelling.solution')}</span>
            <GenderBadge gender={currentWord.gender} showLabel />
            <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{currentWord.german}</strong>
            <SpeakerButton text={`${currentWord.gender ? currentWord.gender + ' ' : ''}${currentWord.german}`} size={16} />
          </div>

          {currentWord.example_de && (
            <div style={{ marginTop: '0.85rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div>"{currentWord.example_de}"</div>
              {currentWord.example_en && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>"{currentWord.example_en}"</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
