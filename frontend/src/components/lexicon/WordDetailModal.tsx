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
        backgroundColor: 'rgba(5, 8, 15, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-pop-in glow-edge"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '2.25rem',
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
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
            padding: '0.4rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <GenderBadge gender={word.gender} showLabel size="md" />
          <PosBadge pos={word.pos} />
          <CefrBadge level={word.cefr_level || 'A1'} size="sm" />
          {word.frequency_rank && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              #{word.frequency_rank}
            </span>
          )}
        </div>

        {/* Header Word */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            {word.gender && (
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color:
                    word.gender === 'der'
                      ? 'var(--color-der)'
                      : word.gender === 'die'
                      ? 'var(--color-die)'
                      : 'var(--color-das)',
                  marginRight: '0.45rem',
                }}
              >
                {word.gender}
              </span>
            )}
            <h2 style={{ display: 'inline', fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              {word.german}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SpeakerButton
              text={`${word.gender ? word.gender + ' ' : ''}${word.german}`}
              rate={profile.speechSpeed}
              size={18}
            />
            <button
              type="button"
              onClick={() => onToggleStar(word.german)}
              style={{
                padding: '0.45rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isStarred ? 'var(--accent-gold-subtle)' : 'var(--bg-tertiary)',
                color: isStarred ? 'var(--accent-gold)' : 'var(--text-muted)',
                border: `1px solid ${isStarred ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
                boxShadow: isStarred ? '0 0 12px rgba(245, 158, 11, 0.25)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isStarred ? 'Gemerkt' : 'Zu Favoriten hinzufügen'}
            >
              <Star size={18} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
            </button>
          </div>
        </div>

        {/* Translation Box */}
        <div
          style={{
            padding: '1.15rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            Bedeutung (English Translation)
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
            {word.english}
          </div>
          {word.all_translations && word.all_translations !== word.english && (
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Alle Übersetzungen: <em>{word.all_translations}</em>
            </div>
          )}
        </div>

        {/* Example Sentence */}
        {word.example_de && (
          <div
            style={{
              padding: '1.15rem 1.35rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.35rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Beispielsatz
              </span>
              <SpeakerButton text={word.example_de} size={15} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              "{word.example_de}"
            </div>
            {word.example_en && (
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                "{word.example_en}"
              </div>
            )}
          </div>
        )}

        {/* Progress Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.85rem',
            marginBottom: '1.65rem',
          }}
        >
          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{progress?.timesReviewed || 0}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.1rem' }}>Wiederholt</div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
              {progress?.timesCorrect || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.1rem' }}>Richtig</div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
              {progress?.mastery === 3 ? 'Meister' : progress?.mastery === 2 ? 'Gut' : progress?.mastery === 1 ? 'Lernen' : 'Neu'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.1rem' }}>Status</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-primary)',
            color: '#0b0f17',
            fontWeight: 900,
            fontSize: '1rem',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
          }}
        >
          Schließen
        </button>
      </div>
    </div>
  );
};
