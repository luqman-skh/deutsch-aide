import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import type { Word, UserProfile } from '../../types';
import { GenderBadge } from '../common/GenderBadge';
import { PosBadge } from '../common/PosBadge';
import { ProgressBar } from '../common/ProgressBar';
import { SpeakerButton } from '../common/SpeakerButton';
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

export const SpellingTrainer: React.FC<Props> = ({
  words,
  profile,
  onFinish,
  onExit,
}) => {
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

        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Wort {currentIndex + 1} von {words.length}
        </span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <ProgressBar current={currentIndex + 1} total={words.length} height={6} />
      </div>

      {/* Prompt Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Schreibübung (Spelling)
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
              gap: '0.3rem',
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: hintLevel > 0 ? 'var(--accent-gold-subtle)' : 'var(--bg-tertiary)',
              border: `1px solid ${hintLevel > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)'}`,
              color: hintLevel > 0 ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <Lightbulb size={14} />
            <span>Hinweis {hintLevel > 0 ? `(${hintLevel}/2)` : ''}</span>
          </button>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          Übersetze ins Deutsche:
        </div>

        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '1rem' }}>
          {currentWord.english}
        </h2>

        {/* Hint display */}
        {hintLevel >= 1 && (
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-gold-subtle)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--accent-gold)',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            {currentWord.gender && <span>Artikel: <strong>{currentWord.gender}</strong></span>}
            <span>
              Anfangsbuchstabe: <strong>{currentWord.german[0]}</strong>
              {hintLevel >= 2 && <span>...{currentWord.german.slice(1)}</span>}
            </span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleCheck} style={{ marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isSubmitted}
            placeholder="Deutsches Wort eingeben..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            style={{
              width: '100%',
              padding: '1.1rem 1.25rem',
              fontSize: '1.2rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              border: `2px solid ${
                isSubmitted
                  ? isCorrect
                    ? 'var(--color-success)'
                    : 'var(--color-error)'
                  : 'var(--border-medium)'
              }`,
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        </div>

        {/* German Umlauts Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
            Umlaute:
          </span>
          {umlauts.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => handleInsertChar(char)}
              disabled={isSubmitted}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
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
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: userInput.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: userInput.trim() ? '#0b0f17' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: userInput.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Überprüfen [Enter]
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
      </form>

      {/* Answer Feedback Card */}
      {isSubmitted && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
            border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {isCorrect ? (
              <>
                <CheckCircle2 size={22} color="var(--color-success)" />
                <span style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '1.1rem' }}>
                  Richtig!
                </span>
              </>
            ) : (
              <>
                <XCircle size={22} color="var(--color-error)" />
                <span style={{ fontWeight: 800, color: 'var(--color-error)', fontSize: '1.1rem' }}>
                  Nicht ganz!
                </span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Richtige Lösung:</span>
            <GenderBadge gender={currentWord.gender} showLabel />
            <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{currentWord.german}</strong>
            <SpeakerButton text={`${currentWord.gender ? currentWord.gender + ' ' : ''}${currentWord.german}`} size={16} />
          </div>

          {currentWord.example_de && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div>"{currentWord.example_de}"</div>
              {currentWord.example_en && <div style={{ color: 'var(--text-muted)' }}>"{currentWord.example_en}"</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
