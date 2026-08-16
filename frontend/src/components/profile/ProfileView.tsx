import React, { useMemo } from 'react';
import {
  User,
  Flame,
  Zap,
  Target,
  Trophy,
  Star,
  Calendar,
  Settings,
  ArrowRight,
} from 'lucide-react';
import type { UserProfile, Word, GrammarRule } from '../../types';
import { storageService } from '../../services/storageService';
import { CefrBadge } from '../common/CefrBadge';
import { GenderBadge } from '../common/GenderBadge';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props {
  profile: UserProfile;
  words: Word[];
  grammarRules: GrammarRule[];
  onOpenSettings: () => void;
  onNavigateTab: (tab: 'vocab' | 'grammar' | 'lexicon') => void;
}

export const ProfileView: React.FC<Props> = ({
  profile,
  words,
  grammarRules,
  onOpenSettings,
  onNavigateTab,
}) => {
  const { t } = useTranslation();
  const wordProgressMap = useMemo(() => storageService.getAllWordProgress(), [profile]);
  const grammarProgressMap = useMemo(() => storageService.getAllGrammarProgress(), [profile]);

  // Compute Word Mastery stats
  const masteryStats = useMemo(() => {
    let mastered = 0; // Level 3+
    let familiar = 0; // Level 2
    let learning = 0; // Level 1
    let unlearned = 0; // Level 0

    words.forEach((w) => {
      const p = wordProgressMap[w.german.toLowerCase().trim()];
      const m = p?.mastery || 0;
      if (m >= 3) mastered++;
      else if (m === 2) familiar++;
      else if (m === 1) learning++;
      else unlearned++;
    });

    return { mastered, familiar, learning, unlearned, total: words.length };
  }, [words, wordProgressMap]);

  // Starred Words & Rules
  const starredWords = useMemo(() => {
    return words.filter((w) => wordProgressMap[w.german.toLowerCase().trim()]?.starred);
  }, [words, wordProgressMap]);

  const starredRules = useMemo(() => {
    return grammarRules.filter((r) => grammarProgressMap[r.id]?.starred);
  }, [grammarRules, grammarProgressMap]);

  const learnedRulesCount = useMemo(() => {
    return Object.values(grammarProgressMap).filter((p) => p.learned).length;
  }, [grammarProgressMap]);

  const xpIntoCurrentLevel = profile.xp % 100;
  const levelProgressPercent = Math.min(100, Math.round((xpIntoCurrentLevel / 100) * 100));

  // Activity History: past 7 days
  const past7Days = useMemo(() => {
    const days: { dateStr: string; label: string; count: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('de-DE', { weekday: 'short' });
      const count = profile.activityHistory?.[dateStr] || 0;
      days.push({ dateStr, label: dayName, count });
    }
    return days;
  }, [profile.activityHistory]);

  const maxActivity = Math.max(1, ...past7Days.map((d) => d.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Profile Overview Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          {/* User Info & Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #2563eb, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                color: '#ffffff',
              }}
            >
              <User size={36} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {profile.name}
                </h1>
                <CefrBadge level={profile.targetLevel} size="md" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    backgroundColor: 'var(--accent-primary-subtle)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  Stufe {profile.level}: {profile.levelTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            <Settings size={16} />
            <span>{t('profile.edit_btn')}</span>
          </button>
        </div>

        {/* Level XP Progress Bar */}
        <div style={{ marginTop: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {t('profile.level_progress')} (Stufe {profile.level})
            </span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
              {xpIntoCurrentLevel} / 100 XP
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '10px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${levelProgressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {t('profile.xp_to_next', { xp: 100 - xpIntoCurrentLevel, lvl: profile.level + 1 })}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Streak */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid #f59e0b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
            <Flame size={20} fill="#f59e0b" />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t('profile.streak_title')}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {profile.streak} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('profile.streak_days')}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {t('profile.streak_desc')}
          </p>
        </div>

        {/* Total XP */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid var(--accent-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
            <Zap size={20} fill="currentColor" />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t('profile.total_xp')}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {profile.xp} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>XP</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {t('profile.total_xp_desc')}
          </p>
        </div>

        {/* Daily Goal */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid #10b981',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', marginBottom: '0.5rem' }}>
            <Target size={20} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t('profile.daily_goal')}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {profile.todayWordsPracticed} / {profile.dailyGoal}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {Math.round((profile.todayWordsPracticed / profile.dailyGoal) * 100)}% {t('profile.daily_goal_desc')}
          </p>
        </div>

        {/* Rush High Score */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderLeft: '4px solid #a855f7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a855f7', marginBottom: '0.5rem' }}>
            <Trophy size={20} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t('profile.rush_record')}</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            {profile.rushHighScore || 0} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pkt</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {t('profile.rush_record_desc')}
          </p>
        </div>
      </div>

      {/* 7-Day Activity Chart */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Calendar size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {t('profile.activity_chart')}
          </h3>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '140px',
            gap: '0.5rem',
            paddingTop: '1rem',
          }}
        >
          {past7Days.map((day) => {
            const heightPct = Math.max(8, Math.round((day.count / maxActivity) * 100));
            const isToday = day.dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={day.dateStr}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: day.count > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {day.count}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '38px',
                    height: `${heightPct}%`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isToday
                      ? 'var(--accent-primary)'
                      : day.count > 0
                      ? 'var(--accent-primary-subtle)'
                      : 'var(--bg-tertiary)',
                    border: `1px solid ${isToday ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    transition: 'height 0.4s ease',
                  }}
                  title={`${day.dateStr}: ${day.count} Wörter geübt`}
                />
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: isToday ? 800 : 500,
                    color: isToday ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}
                >
                  {day.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mastery & Grammar Summary (2-Col Layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Vocabulary Mastery Breakdown */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {t('profile.vocab_mastery')}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('vocab')}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>{t('profile.practice_btn')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Level 3: Mastered */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                  {t('profile.mastery_level_3')}
                </span>
                <span style={{ fontWeight: 700 }}>{masteryStats.mastered}</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${(masteryStats.mastered / masteryStats.total) * 100}%`, height: '100%', backgroundColor: 'var(--color-success)' }} />
              </div>
            </div>

            {/* Level 2: Familiar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {t('profile.mastery_level_2')}
                </span>
                <span style={{ fontWeight: 700 }}>{masteryStats.familiar}</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${(masteryStats.familiar / masteryStats.total) * 100}%`, height: '100%', backgroundColor: 'var(--accent-primary)' }} />
              </div>
            </div>

            {/* Level 1: Learning */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                  {t('profile.mastery_level_1')}
                </span>
                <span style={{ fontWeight: 700 }}>{masteryStats.learning}</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${(masteryStats.learning / masteryStats.total) * 100}%`, height: '100%', backgroundColor: 'var(--accent-gold)' }} />
              </div>
            </div>

            {/* Level 0: Unseen */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('profile.mastery_level_0')}
                </span>
                <span style={{ fontWeight: 700 }}>{masteryStats.unlearned}</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${(masteryStats.unlearned / masteryStats.total) * 100}%`, height: '100%', backgroundColor: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Grammar Mastery Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {t('profile.grammar_status')}
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('grammar')}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>{t('profile.view_rules')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-full)',
                border: '6px solid var(--color-success)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {learnedRulesCount}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ {grammarRules.length}</span>
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {learnedRulesCount} Regeln gemeistert
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {t('profile.grammar_learned_desc')}
              </p>
            </div>
          </div>

          {/* Bookmarked rules notice */}
          {starredRules.length > 0 && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-gold-subtle)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.85rem' }}>
                <Star size={16} fill="#f59e0b" />
                <span>{starredRules.length} {t('profile.rules_bookmarked')}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {t('profile.rules_bookmarked_desc')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Starred Words Collection */}
      {starredWords.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={18} fill="#f59e0b" color="#f59e0b" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {t('profile.starred_vocab')} ({starredWords.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('vocab')}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>{t('profile.practice_now')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {starredWords.slice(0, 20).map((word) => (
              <span
                key={word.german}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <GenderBadge gender={word.gender} size="sm" />
                <strong>{word.german}</strong>
                <span style={{ color: 'var(--text-muted)' }}>→ {word.english}</span>
              </span>
            ))}
            {starredWords.length > 20 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                +{starredWords.length - 20} weitere
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
