import React from 'react';
import {
  Trophy,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import type { Word } from '../../types';
import { GenderBadge } from '../common/GenderBadge';
import { SpeakerButton } from '../common/SpeakerButton';
import { useTranslation } from '../../i18n/LanguageContext';

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
  const { t } = useTranslation();
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      <div
        className="glass-panel animate-pop-in glow-edge"
        style={{
          padding: '3rem 2.25rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          background: 'linear-gradient(145deg, var(--bg-card-solid) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        {/* Celebration Trophy Emblem */}
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(56, 189, 248, 0.25))',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.25)',
          }}
          className="animate-float"
        >
          <Trophy size={48} color="var(--accent-gold)" />
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
          {t('summary.completed')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2.25rem' }}>
          {modeTitle} • {t('summary.great_job')}
        </p>

        {/* Stats Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Accuracy */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: accuracy >= 80 ? 'var(--color-success)' : 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              {t('summary.accuracy')}
            </div>
          </div>

          {/* Correct / Total */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {correctCount}/{totalAnswered}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
              {t('summary.correct_total')}
            </div>
          </div>

          {/* XP Gained */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary-subtle)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
            }}
          >
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              +{xpGained}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 700, marginTop: '0.2rem' }}>
              {t('summary.xp_earned')}
            </div>
          </div>
        </div>

        {/* Mistakes Review Section */}
        {incorrectWords.length > 0 && (
          <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
              <AlertTriangle size={17} color="var(--color-error)" />
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-error)' }}>
                {t('summary.mistakes_title')} ({incorrectWords.length})
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '220px',
                overflowY: 'auto',
                paddingRight: '0.35rem',
              }}
            >
              {incorrectWords.map((word) => (
                <div
                  key={word.id || word.german}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <GenderBadge gender={word.gender} size="sm" />
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                      {word.german}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>— {word.english}</span>
                  </div>

                  <SpeakerButton text={`${word.gender ? word.gender + ' ' : ''}${word.german}`} size={15} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onRestart}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1.1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#0b0f17',
              fontWeight: 900,
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
              minWidth: '180px',
            }}
          >
            <RotateCcw size={18} />
            <span>{t('summary.train_again')}</span>
          </button>

          {incorrectWords.length > 0 && onRetryMistakes && (
            <button
              type="button"
              onClick={onRetryMistakes}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1.1rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error)',
                fontWeight: 800,
                fontSize: '1rem',
                minWidth: '180px',
              }}
            >
              <AlertTriangle size={18} />
              <span>{t('summary.retry_mistakes')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExit}
            style={{
              flex: 1,
              padding: '1.1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '1rem',
              minWidth: '160px',
            }}
          >
            {t('summary.back_to_menu')}
          </button>
        </div>
      </div>
    </div>
  );
};
