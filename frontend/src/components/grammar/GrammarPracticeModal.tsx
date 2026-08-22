import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import type { GrammarRule, UserProfile } from '../../types';
import { CefrBadge } from '../common/CefrBadge';
import { playSfx } from '../../utils/audio';
import { storageService } from '../../services/storageService';

interface Props {
  rule: GrammarRule;
  profile: UserProfile;
  onClose: () => void;
}

export const GrammarPracticeModal: React.FC<Props> = ({ rule, profile, onClose }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generate an exercise based on the rule
  const exercise = useMemo(() => {
    const deExample = rule.example_de || 'Der Mann liest das Buch.';
    const enExample = rule.example_en || 'The man reads the book.';
    const qText = `Welche Aussage oder Anwendung passt zur Regel "${rule.subcategory || rule.category_name}"?`;

    const options = [
      {
        text: `Beispiel: "${deExample}" (${enExample})`,
        isCorrect: true,
        explanation: `Richtig! Dies demonstriert: ${rule.rule_english}`,
      },
      {
        text: `Diese Konstruktion wird nur in der Umgangssprache ohne Regeln genutzt.`,
        isCorrect: false,
        explanation: `Nicht richtig. Die grammatikalische Regel lautet: ${rule.rule_english}`,
      },
      {
        text: `Der Kasus oder die Form ändert sich hierbei niemals.`,
        isCorrect: false,
        explanation: `Falsch. Beachte: ${rule.rule_german}`,
      },
    ];

    return {
      question: qText,
      exampleDe: deExample,
      exampleEn: enExample,
      options: options.sort(() => 0.5 - Math.random()),
    };
  }, [rule]);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    const isCorrect = exercise.options[idx].isCorrect;
    if (isCorrect) {
      storageService.recordGrammarQuiz(rule.id, 100);
      playSfx('correct', profile.soundEffects);
    } else {
      storageService.recordGrammarQuiz(rule.id, 30);
      playSfx('incorrect', profile.soundEffects);
    }
  };

  const isCorrectSelection = selectedAnswer !== null && exercise.options[selectedAnswer]?.isCorrect;

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
          maxWidth: '580px',
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {rule.category_name}
          </span>
          <CefrBadge level={rule.cefr_levels[0] || 'A1'} size="sm" />
        </div>

        <h3 style={{ fontSize: '1.45rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          {rule.subcategory || rule.rule_german}
        </h3>

        {/* Rule Summary Box */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
            {rule.rule_german}
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {rule.rule_english}
          </div>
        </div>

        {/* Question Prompt */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
            Wähle das korrekte Anwendungsbeispiel:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {exercise.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              let btnBg = 'var(--bg-tertiary)';
              let btnBorder = 'var(--border-subtle)';
              let btnColor = 'var(--text-primary)';

              if (isAnswered) {
                if (opt.isCorrect) {
                  btnBg = 'var(--color-success-bg)';
                  btnBorder = 'var(--color-success-border)';
                  btnColor = 'var(--color-success)';
                } else if (isSelected) {
                  btnBg = 'var(--color-error-bg)';
                  btnBorder = 'var(--color-error-border)';
                  btnColor = 'var(--color-error)';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: btnBg,
                    border: `1.5px solid ${btnBorder}`,
                    color: btnColor,
                    fontSize: '0.92rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    lineHeight: 1.45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: isAnswered ? 'default' : 'pointer',
                  }}
                  className={!isAnswered ? 'glass-panel-interactive' : ''}
                >
                  <span>{opt.text}</span>
                  {isAnswered && opt.isCorrect && <CheckCircle2 size={20} color="var(--color-success)" />}
                  {isAnswered && isSelected && !opt.isCorrect && <XCircle size={20} color="var(--color-error)" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation on answer */}
        {isAnswered && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: '1.1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isCorrectSelection ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
              border: `1px solid ${isCorrectSelection ? 'var(--color-success-border)' : 'var(--color-error-border)'}`,
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isCorrectSelection ? 'var(--color-success)' : 'var(--color-error)' }}>
              {isCorrectSelection ? '✓ Richtig verstanden! (+20 XP)' : '✕ Erklärung beachten:'}
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
              {selectedAnswer !== null && exercise.options[selectedAnswer]?.explanation}
            </div>
          </div>
        )}

        {/* Close Button */}
        {isAnswered && (
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
            Fertigstellen & Schließen
          </button>
        )}
      </div>
    </div>
  );
};
