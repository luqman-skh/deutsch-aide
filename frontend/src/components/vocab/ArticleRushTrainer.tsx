import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Zap, Timer, Flame, Trophy, RotateCcw } from 'lucide-react';
import type { Word, UserProfile, Gender } from '../../types';
import { speakGerman, playSfx } from '../../utils/audio';
import { storageService } from '../../services/storageService';

interface Props {
  words: Word[];
  profile: UserProfile;
  onExit: () => void;
}

export const ArticleRushTrainer: React.FC<Props> = ({ words, profile, onExit }) => {
  const nounWords = useMemo(() => {
    return words.filter((w) => ['der', 'die', 'das'].includes((w.gender || '').toLowerCase().trim()));
  }, [words]);

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [duration, setDuration] = useState<30 | 60>(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [shuffledNouns, setShuffledNouns] = useState<Word[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; gender: Gender } | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const startGame = useCallback(
    (timeDuration: 30 | 60) => {
      const shuffled = [...nounWords].sort(() => 0.5 - Math.random());
      setShuffledNouns(shuffled);
      setDuration(timeDuration);
      setTimeLeft(timeDuration);
      setCurrentIndex(0);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setCorrectCount(0);
      setFeedback(null);
      setIsNewHighScore(false);
      setGameState('playing');
      playSfx('click', profile.soundEffects);
    },
    [nounWords, profile.soundEffects]
  );

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      setGameState('gameover');
      const isNewHigh = storageService.recordRushHighScore(score);
      setIsNewHighScore(isNewHigh);
      playSfx(isNewHigh ? 'levelup' : 'streak', profile.soundEffects);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5 && prev > 1) {
          playSfx('tick', profile.soundEffects);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, profile.soundEffects]);

  const currentWord = shuffledNouns[currentIndex] || null;

  const handleAnswer = useCallback(
    (selectedGender: Gender) => {
      if (gameState !== 'playing' || !currentWord) return;

      const targetGender = (currentWord.gender || '').toLowerCase().trim();
      const isCorrect = selectedGender.toLowerCase().trim() === targetGender;

      if (isCorrect) {
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);

        const multiplier = nextCombo >= 15 ? 4 : nextCombo >= 10 ? 3 : nextCombo >= 5 ? 2 : 1;
        const points = 10 * multiplier;
        setScore((prev) => prev + points);
        setCorrectCount((prev) => prev + 1);

        setFeedback({ isCorrect: true, gender: targetGender });
        playSfx(nextCombo % 5 === 0 ? 'streak' : 'correct', profile.soundEffects);
        storageService.recordWordPractice(currentWord.german, true, 'good');
      } else {
        setCombo(0);
        setFeedback({ isCorrect: false, gender: targetGender });
        playSfx('incorrect', profile.soundEffects);
        storageService.recordWordPractice(currentWord.german, false, 'again');
      }

      speakGerman(currentWord.german, profile.speechSpeed);

      // Advance to next word
      if (currentIndex + 1 < shuffledNouns.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setShuffledNouns([...nounWords].sort(() => 0.5 - Math.random()));
        setCurrentIndex(0);
      }
    },
    [gameState, currentWord, combo, maxCombo, currentIndex, shuffledNouns.length, nounWords, profile]
  );

  // Keyboard shortcuts: 1/D for der, 2/E for die, 3/A for das
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const key = e.key.toLowerCase();
      if (key === '1' || key === 'd') {
        e.preventDefault();
        handleAnswer('der');
      } else if (key === '2' || key === 'e') {
        e.preventDefault();
        handleAnswer('die');
      } else if (key === '3' || key === 'a' || key === 's') {
        e.preventDefault();
        handleAnswer('das');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleAnswer]);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      {/* Top Bar */}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)' }}>
          <Trophy size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            Rekord: {profile.rushHighScore || 0} Pkt
          </span>
        </div>
      </div>

      {gameState === 'ready' && (
        <div
          className="glass-panel animate-pop-in"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(236, 72, 153, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            <Zap size={40} color="var(--accent-primary)" />
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Artikel-Rush (Der / Die / Das)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 2rem auto' }}>
            Reagiere blitzschnell und wähle den richtigen Artikel für jedes deutsche Nomen, bevor die Zeit abläuft!
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => startGame(30)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary)',
                color: '#0b0f17',
                fontWeight: 800,
                fontSize: '1.05rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <Timer size={20} />
              <span>30 Sekunden Rush</span>
            </button>

            <button
              type="button"
              onClick={() => startGame(60)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '1.05rem',
              }}
            >
              <Timer size={20} />
              <span>60 Sekunden Marathon</span>
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentWord && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Game Stats Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Timer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: timeLeft <= 5 ? 'var(--color-error)' : 'var(--text-primary)',
              }}
            >
              <Timer size={20} color={timeLeft <= 5 ? 'var(--color-error)' : 'var(--accent-primary)'} />
              <span>{timeLeft}s</span>
            </div>

            {/* Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '1.25rem', fontWeight: 800 }}>
              <span style={{ color: 'var(--accent-gold)' }}>{score}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pkt</span>
            </div>

            {/* Combo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: combo >= 5 ? 'var(--accent-gold)' : 'var(--text-secondary)',
              }}
            >
              <Flame size={16} fill={combo >= 5 ? '#f59e0b' : 'none'} />
              <span>{combo}x Combo</span>
            </div>
          </div>

          {/* Target Word Card */}
          <div
            className="glass-panel"
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Welcher Artikel passt?
            </div>

            <h1
              style={{
                fontSize: '3rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}
            >
              {currentWord.german}
            </h1>

            <div style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              "{currentWord.english}"
            </div>

            {/* Flash Feedback overlay */}
            {feedback && (
              <div
                className="animate-pop-in"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: feedback.isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                  color: feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                  border: `1px solid ${feedback.isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                }}
              >
                {feedback.gender} {currentWord.german}
              </div>
            )}
          </div>

          {/* Der / Die / Das Big Buttons */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => handleAnswer('der')}
              style={{
                padding: '1.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-der-bg)',
                border: '2px solid var(--color-der)',
                color: 'var(--color-der)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>DER</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>
                Maskulin [1 / D]
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAnswer('die')}
              style={{
                padding: '1.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-die-bg)',
                border: '2px solid var(--color-die)',
                color: 'var(--color-die)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>DIE</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>
                Feminin [2 / E]
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAnswer('das')}
              style={{
                padding: '1.75rem 1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-das-bg)',
                border: '2px solid var(--color-das)',
                color: 'var(--color-das)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>DAS</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>
                Neutrum [3 / A]
              </span>
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div
          className="glass-panel animate-pop-in"
          style={{
            padding: '2.5rem 2rem',
            textAlign: 'center',
          }}
        >
          {isNewHighScore ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: 'var(--accent-gold)',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <Trophy size={18} />
              <span>NEUER REKORD!</span>
            </div>
          ) : null}

          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Zeit abgelaufen!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Ergebnis für {duration}s Artikel-Rush:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{score}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Punkte</div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>
                {correctCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Richtig</div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {maxCombo}x
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Combo</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => startGame(duration)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.9rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary)',
                color: '#0b0f17',
                fontWeight: 700,
              }}
            >
              <RotateCcw size={18} />
              <span>Nochmals spielen</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState('ready')}
              style={{
                flex: 1,
                padding: '0.9rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontWeight: 600,
              }}
            >
              Modus wählen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
