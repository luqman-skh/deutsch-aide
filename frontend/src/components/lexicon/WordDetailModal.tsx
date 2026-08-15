import React from 'react';
import { X, Star } from 'lucide-react';
import type { Word, UserProfile, WordProgress } from '../../types';
import { GenderBadge } from '../common/GenderBadge';
import { PosBadge } from '../common/PosBadge';
import { CefrBadge } from '../common/CefrBadge';
import { SpeakerButton } from '../common/SpeakerButton';

interface Props {
  word: Word;
  progress?: WordProgress;
  profile: UserProfile;
  isStarred: boolean;
  onToggleStar: (german: string) => void;
  onClose: () => void;
}

export const WordDetailModal: React.FC<Props> = ({
  word,
  progress,
  profile,
  isStarred,
  onToggleStar,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-pop-in"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: 'var(--text-muted)',
            padding: '0.25rem',
          }}
        >
          <X size={20} />
        </button>

        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <GenderBadge gender={word.gender} showLabel />
          <PosBadge pos={word.pos} />
          <CefrBadge level={word.cefr_level || 'A1'} size="sm" />
        </div>

        {/* Header Word */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            {word.gender && (
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color:
                    word.gender === 'der'
                      ? 'var(--color-der)'
                      : word.gender === 'die'
                      ? 'var(--color-die)'
                      : 'var(--color-das)',
                  marginRight: '0.4rem',
                }}
              >
                {word.gender}
              </span>
            )}
            <h2 style={{ display: 'inline', fontSize: '2rem', fontWeight: 800 }}>
              {word.german}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SpeakerButton
              text={`${word.gender ? word.gender + ' ' : ''}${word.german}`}
              rate={profile.speechSpeed}
              size={20}
            />
            <button
              type="button"
              onClick={() => onToggleStar(word.german)}
              style={{
                padding: '0.4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isStarred ? 'var(--accent-gold-subtle)' : 'var(--bg-tertiary)',
                color: isStarred ? 'var(--accent-gold)' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
              }}
              title={isStarred ? 'Gemerkt' : 'Zu Favoriten hinzufügen'}
            >
              <Star size={20} fill={isStarred ? '#f59e0b' : 'none'} />
            </button>
          </div>
        </div>

        {/* Translation Box */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Bedeutung (English Translation)
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
            {word.english}
          </div>
          {word.all_translations && word.all_translations !== word.english && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Alle Übersetzungen: {word.all_translations}
            </div>
          )}
        </div>

        {/* Example Sentence */}
        {word.example_de && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Beispielsatz
              </span>
              <SpeakerButton text={word.example_de} size={15} />
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {word.example_de}
            </div>
            {word.example_en && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {word.example_en}
              </div>
            )}
          </div>
        )}

        {/* Progress Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{progress?.timesReviewed || 0}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Wiederholt</div>
          </div>

          <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-success)' }}>
              {progress?.timesCorrect || 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Richtig</div>
          </div>

          <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {progress?.mastery === 3 ? 'Meister' : progress?.mastery === 2 ? 'Gut' : progress?.mastery === 1 ? 'Lernen' : 'Neu'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-primary)',
            color: '#0b0f17',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}
        >
          Schließen
        </button>
      </div>
    </div>
  );
};
