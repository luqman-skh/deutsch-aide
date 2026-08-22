import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Zap, Timer, Flame, Trophy, RotateCcw } from 'lucide-react';
import type { Word, UserProfile, Gender } from '../../types';
import { speakGerman, playSfx } from '../../utils/audio';
import { storageService } from '../../services/storageService';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props {
  words: Word[];
  profile: UserProfile;
  onExit: () => void;
}

export const ArticleRushTrainer: React.FC<Props> = ({ words, profile, onExit }) => {
  const { t } = useTranslation();
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

      if (currentIndex + 1 < shuffledNouns.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setShuffledNouns([...nounWords].sort(() => 0.5 - Math.random()));
        setCurrentIndex(0);
      }
    },
    [gameState, currentWord, combo, maxCombo, currentIndex, shuffledNouns.length, nounWords, profile]
  );

  // Keyboard shortcuts
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
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--accent-gold)',
            backgroundColor: 'var(--accent-gold-subtle)',
            padding: '0.35rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <Trophy size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            Rekord: {profile.rushHighScore || 0} Pkt
          </span>
        </div>
      </div>

      {gameState === 'ready' && (
        <div
          className="glass-panel animate-pop-in glow-edge"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)',
            background: 'linear-gradient(145deg, var(--bg-card-solid) 0%, var(--bg-secondary) 100%)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(245, 158, 11, 0.25))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.2)',
            }}
          >
            <Zap size={44} color="var(--accent-gold)" />
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            {t('rush.header')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', maxWidth: '480px', margin: '0 auto 2.25rem auto', lineHeight: 1.5 }}>
            {t('rush.ready_desc')}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => startGame(30)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.1rem 2rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary)',
                color: '#0b0f17',
                fontWeight: 900,
                fontSize: '1.05rem',
                boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
              }}
            >
              <Timer size={20} />
              <span>{t('rush.start_30')}</span>
            </button>

            <button
              type="button"
              onClick={() => startGame(60)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.1rem 2rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontWeight: 800,
                fontSize: '1.05rem',
              }}
            >
              <Timer size={20} />
              <span>{t('rush.start_60')}</span>
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
              padding: '0.85rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Timer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '1.35rem',
                fontWeight: 900,
                color: timeLeft <= 5 ? 'var(--color-error)' : 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Timer size={22} color={timeLeft <= 5 ? 'var(--color-error)' : 'var(--accent-primary)'} />
              <span>{timeLeft}s</span>
            </div>

            {/* Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--accent-gold)' }}>{score}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pkt</span>
            </div>

            {/* Combo */}
            <div
              className={combo >= 5 ? 'animate-flame' : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                color: combo >= 5 ? 'var(--accent-gold)' : 'var(--text-secondary)',
              }}
            >
              <Flame size={18} fill={combo >= 5 ? '#f59e0b' : 'none'} />
              <span>{combo}x Combo</span>
            </div>
          </div>

          {/* Target Word Card */}
          <div
            className="glass-panel glow-edge"
            style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, var(--bg-card-solid) 0%, var(--bg-secondary) 100%)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
              {t('rush.which_article')}
            </div>

            <h1
              style={{
                fontSize: '3.5rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                lineHeight: 1.15,
              }}
            >
              {currentWord.german}
            </h1>

            <div style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              "{currentWord.english}"
            </div>

            {/* Flash Feedback overlay */}
            {feedback && (
              <div
                className="animate-pop-in"
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: feedback.isCorrect ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                  color: feedback.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                  border: `1px solid ${feedback.isCorrect ? 'var(--color-success-border)' : 'var(--color-error-border)'}`,
                  boxShadow: 'var(--shadow-md)',
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
            {/* DER Button */}
            <button
              type="button"
              onClick={() => handleAnswer('der')}
              style={{
                padding: '2rem 1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-der-bg)',
                border: '2px solid var(--color-der)',
                color: 'var(--color-der)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--color-der-glow)',
                transition: 'all 0.1s ease',
              }}
            >
              <span style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>DER</span>
              <span style={{ fontSize: '0.74rem', opacity: 0.85, textTransform: 'uppercase', fontWeight: 800 }}>
                Maskulin [1/D]
              </span>
            </button>

            {/* DIE Button */}
            <button
              type="button"
              onClick={() => handleAnswer('die')}
              style={{
                padding: '2rem 1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-die-bg)',
                border: '2px solid var(--color-die)',
                color: 'var(--color-die)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--color-die-glow)',
                transition: 'all 0.1s ease',
              }}
            >
              <span style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>DIE</span>
              <span style={{ fontSize: '0.74rem', opacity: 0.85, textTransform: 'uppercase', fontWeight: 800 }}>
                Feminin [2/E]
              </span>
            </button>

            {/* DAS Button */}
            <button
              type="button"
              onClick={() => handleAnswer('das')}
              style={{
                padding: '2rem 1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-das-bg)',
                border: '2px solid var(--color-das)',
                color: 'var(--color-das)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--color-das-glow)',
                transition: 'all 0.1s ease',
              }}
            >
              <span style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>DAS</span>
              <span style={{ fontSize: '0.74rem', opacity: 0.85, textTransform: 'uppercase', fontWeight: 800 }}>
                Neutrum [3/A]
              </span>
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div
          className="glass-panel animate-pop-in glow-edge"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)',
            background: 'linear-gradient(145deg, var(--bg-card-solid) 0%, var(--bg-secondary) 100%)',
            border: '1px solid var(--border-medium)',
          }}
        >
          {isNewHighScore && (
            <div
              className="animate-flame"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-gold-subtle)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: 'var(--accent-gold)',
                fontWeight: 900,
                fontSize: '0.9rem',
                marginBottom: '1.25rem',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.35)',
              }}
            >
              <Trophy size={20} />
              <span>{t('rush.new_record')}</span>
            </div>
          )}

          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {t('rush.time_up')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.25rem' }}>
            {t('rush.result_for')} {duration}s Artikel-Rush:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2.25rem',
            }}
          >
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                {score}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                {t('rush.score')}
              </div>
            </div>

            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                {correctCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                {t('rush.correct')}
              </div>
            </div>

            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                {maxCombo}x
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                {t('rush.max_combo')}
              </div>
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
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary)',
                color: '#0b0f17',
                fontWeight: 900,
                fontSize: '1rem',
                boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
              }}
            >
              <RotateCcw size={18} />
              <span>{t('rush.play_again')}</span>
            </button>

            <button
              type="button"
              onClick={() => setGameState('ready')}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {t('rush.choose_mode')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
