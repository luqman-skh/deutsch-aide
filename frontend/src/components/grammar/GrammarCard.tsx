import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Star,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Play,
} from 'lucide-react';
import type { GrammarRule, UserProfile } from '../../types';
import { CefrBadge } from '../common/CefrBadge';
import { SpeakerButton } from '../common/SpeakerButton';
import { GrammarPracticeModal } from './GrammarPracticeModal';
import { playSfx } from '../../utils/audio';

interface Props {
  rule: GrammarRule;
  isLearned: boolean;
  isStarred: boolean;
  profile: UserProfile;
  onToggleLearned: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export const GrammarCard: React.FC<Props> = ({
  rule,
  isLearned,
  isStarred,
  profile,
  onToggleLearned,
  onToggleStar,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPractice, setShowPractice] = useState(false);

  const handleToggleLearned = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLearned(rule.id);
    playSfx('correct', profile.soundEffects);
  };

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar(rule.id);
    playSfx('click', profile.soundEffects);
  };

  return (
    <>
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${isLearned ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
          backgroundColor: isLearned ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-card)',
          transition: 'all var(--transition-normal)',
          overflow: 'hidden',
        }}
      >
        {/* Card Header (Always visible) */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Category & Tags */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginBottom: '0.4rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {rule.category_name}
              </span>

              {rule.subcategory && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {rule.subcategory}
                </span>
              )}

              {rule.cefr_levels.map((lvl) => (
                <CefrBadge key={lvl} level={lvl} size="sm" />
              ))}
            </div>

            {/* German Rule Title */}
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.4,
                marginBottom: '0.3rem',
              }}
            >
              {rule.rule_german}
            </h3>

            {/* English Rule Translation */}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {rule.rule_english}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {/* Learned Checkmark */}
            <button
              type="button"
              onClick={handleToggleLearned}
              style={{
                padding: '0.4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isLearned ? 'var(--color-success-bg)' : 'var(--bg-tertiary)',
                color: isLearned ? 'var(--color-success)' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
              }}
              title={isLearned ? 'Als gelernt markiert' : 'Als gelernt markieren'}
            >
              {isLearned ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </button>

            {/* Star button */}
            <button
              type="button"
              onClick={handleToggleStar}
              style={{
                padding: '0.4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isStarred ? 'var(--accent-gold-subtle)' : 'var(--bg-tertiary)',
                color: isStarred ? 'var(--accent-gold)' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
              }}
              title={isStarred ? 'Gemerkt' : 'Zu Favoriten hinzufügen'}
            >
              <Star size={18} fill={isStarred ? '#f59e0b' : 'none'} />
            </button>

            {/* Expand toggle */}
            <div style={{ color: 'var(--text-muted)', padding: '0.2rem' }}>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {/* Expanded Content Details */}
        {isExpanded && (
          <div
            className="animate-fade-in"
            style={{
              padding: '0 1.5rem 1.5rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
            }}
          >
            {/* Example Sentences */}
            {rule.example_de && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.35rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Beispielsatz (Example)
                  </span>
                  <SpeakerButton text={rule.example_de} rate={profile.speechSpeed} size={15} />
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {rule.example_de}
                </div>
                {rule.example_en && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {rule.example_en}
                  </div>
                )}
              </div>
            )}

            {/* Notes / Tips */}
            {rule.notes && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-gold-subtle)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                }}
              >
                <Lightbulb size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                    Hinweis & Merkhilfe:
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                    {rule.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {rule.tags && rule.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {rule.tags.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Practice Button */}
            <button
              type="button"
              onClick={() => setShowPractice(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary-subtle)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <Play size={15} fill="currentColor" />
              <span>Regel jetzt interaktiv üben</span>
            </button>
          </div>
        )}
      </div>

      {/* Practice Modal */}
      {showPractice && (
        <GrammarPracticeModal
          rule={rule}
          profile={profile}
          onClose={() => setShowPractice(false)}
        />
      )}
    </>
  );
};
