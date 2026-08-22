import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Star,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import type { GrammarRule, GrammarProgress } from '../../types';
import { CefrBadge } from '../common/CefrBadge';
import { SpeakerButton } from '../common/SpeakerButton';
import { storageService } from '../../services/storageService';
import { playSfx } from '../../utils/audio';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props {
  rule: GrammarRule;
  progress?: GrammarProgress;
  speechRate?: number;
  soundEffects?: boolean;
  onToggleLearned: (ruleId: string, learned: boolean) => void;
  onToggleStar: (ruleId: string, starred: boolean) => void;
  onPracticeRule?: (rule: GrammarRule) => void;
}

export const GrammarCard: React.FC<Props> = ({
  rule,
  progress,
  speechRate = 1.0,
  soundEffects = true,
  onToggleLearned,
  onToggleStar,
  onPracticeRule,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const isLearned = Boolean(progress?.learned);
  const isStarred = Boolean(progress?.starred);

  const handleToggleLearnedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = storageService.toggleLearnGrammar(rule.id);
    onToggleLearned(rule.id, newStatus);
    playSfx(newStatus ? 'levelup' : 'click', soundEffects);
  };

  const handleToggleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = storageService.toggleStarGrammar(rule.id);
    onToggleStar(rule.id, newStatus);
    playSfx('click', soundEffects);
  };

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${
          isLearned
            ? 'rgba(16, 185, 129, 0.45)'
            : isStarred
            ? 'rgba(245, 158, 11, 0.45)'
            : 'var(--border-subtle)'
        }`,
        backgroundColor: isLearned
          ? 'rgba(16, 185, 129, 0.04)'
          : isStarred
          ? 'rgba(245, 158, 11, 0.03)'
          : 'var(--bg-card)',
        overflow: 'hidden',
        boxShadow: isLearned || isStarred ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)',
      }}
    >
      {/* Header Row (Always Visible) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '1.25rem 1.6rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
          {/* Learned Status Button */}
          <button
            type="button"
            onClick={handleToggleLearnedClick}
            style={{
              color: isLearned ? 'var(--color-success)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.2rem',
              marginTop: '2px',
              flexShrink: 0,
            }}
            title={isLearned ? t('grammar.marked_learned') : t('grammar.mark_learned')}
          >
            {isLearned ? (
              <CheckCircle2 size={24} fill="rgba(16, 185, 129, 0.2)" color="var(--color-success)" />
            ) : (
              <Circle size={24} />
            )}
          </button>

          <div style={{ flex: 1 }}>
            {/* Category & CEFR Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--accent-primary)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {rule.category_name}
                {rule.subcategory ? ` • ${rule.subcategory}` : ''}
              </span>

              {rule.cefr_levels?.map((lvl) => (
                <CefrBadge key={lvl} level={lvl} size="sm" />
              ))}
            </div>

            {/* German Rule Summary */}
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
              }}
            >
              {rule.rule_german}
            </h3>

            {/* English Explanation Preview */}
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                marginTop: '0.25rem',
                lineHeight: 1.4,
              }}
            >
              {rule.rule_english}
            </p>
          </div>
        </div>

        {/* Action Controls & Expand Chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Star Button */}
          <button
            type="button"
            onClick={handleToggleStarClick}
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
            title={isStarred ? t('grammar.bookmarked') : t('grammar.bookmark')}
          >
            <Star size={18} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
          </button>

          {/* Expand Toggle */}
          <button
            type="button"
            style={{
              padding: '0.45rem',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div
          className="animate-fade-in"
          style={{
            padding: '0 1.6rem 1.6rem 1.6rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          {/* Examples Section */}
          {rule.example_de && (
            <div style={{ marginTop: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                {t('grammar.example')}
              </div>

              <div
                style={{
                  padding: '1.1rem 1.35rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    "{rule.example_de}"
                  </div>
                  <SpeakerButton text={rule.example_de} rate={speechRate} size={17} />
                </div>

                {rule.example_en && (
                  <div
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.35rem',
                    }}
                  >
                    "{rule.example_en}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes & Memory Hints */}
          {rule.notes && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-gold-subtle)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <Lightbulb size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-gold)', display: 'block', marginBottom: '0.2rem' }}>
                  {t('grammar.notes_tip')}
                </span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {rule.notes}
                </span>
              </div>
            </div>
          )}

          {/* Tags */}
          {rule.tags && rule.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '1.15rem' }}>
              {rule.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Practice Action Button */}
          {onPracticeRule && (
            <div style={{ marginTop: '1.4rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPracticeRule(rule);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.75rem 1.35rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#0b0f17',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
                }}
              >
                <Sparkles size={16} />
                <span>{t('grammar.practice_btn')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
