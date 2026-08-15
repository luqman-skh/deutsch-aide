import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, RotateCcw, ArrowRight } from 'lucide-react';
import type { Word } from '../../types';

interface Props {
  modeTitle: string;
  totalAnswered: number;
  correctCount: number;
  xpGained: number;
  incorrectWords: Word[];
  onRestart: () => void;
  onRetryMistakes?: () => void;
  onExit: () => void;
}

export const SessionSummary: React.FC<Props> = ({
  modeTitle,
  totalAnswered,
  correctCount,
  xpGained,
  incorrectWords,
  onRestart,
  onRetryMistakes,
  onExit,
}) => {
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  useEffect(() => {
    if (accuracy >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  }, [accuracy]);

  return (
    <div
      className="glass-panel animate-pop-in"
      style={{
        maxWidth: '560px',
        margin: '2rem auto',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}
    >
      {/* Trophy Badge */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          color: 'var(--accent-gold)',
        }}
      >
        <Trophy size={36} />
      </div>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        Hervorragend geübt!
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
        Lerneinheit abgeschlossen: <strong>{modeTitle}</strong>
      </p>

      {/* Stats Grid */}
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
            padding: '1rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {totalAnswered}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Wörter Geübt
          </div>
        </div>

        <div
          style={{
            padding: '1rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: accuracy >= 80 ? 'var(--color-success)' : accuracy >= 50 ? 'var(--accent-gold)' : 'var(--color-error)',
            }}
          >
            {accuracy}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Genauigkeit
          </div>
        </div>

        <div
          style={{
            padding: '1rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}
        >
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem',
            }}
          >
            <Zap size={20} fill="#f59e0b" />
            <span>+{xpGained}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            XP Erhalten
          </div>
        </div>
      </div>

      {/* Incorrect Words Review Box (if any) */}
      {incorrectWords.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-error)' }}>
              Nochmals üben ({incorrectWords.length}):
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              maxHeight: '140px',
              overflowY: 'auto',
            }}
          >
            {incorrectWords.map((w, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {w.gender ? `${w.gender} ` : ''}<strong>{w.german}</strong> → {w.english}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {incorrectWords.length > 0 && onRetryMistakes && (
          <button
            type="button"
            onClick={onRetryMistakes}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-gold)',
              color: '#0b0f17',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <RotateCcw size={18} />
            <span>Fehler wiederholen ({incorrectWords.length} Wörter)</span>
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onRestart}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#0b0f17',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            <RotateCcw size={18} />
            <span>Neu starten</span>
          </button>

          <button
            type="button"
            onClick={onExit}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            <span>Zurück zur Übersicht</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
