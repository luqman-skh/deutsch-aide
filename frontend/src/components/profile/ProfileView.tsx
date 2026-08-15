import React, { useMemo } from 'react';
import {
  Flame,
  Zap,
  CheckCircle2,
  Trophy,
  Star,
  Settings,
  Calendar,
  ArrowRight,
  Award,
} from 'lucide-react';
import type { UserProfile, Word, GrammarRule } from '../../types';
import { CefrBadge } from '../common/CefrBadge';
import { SpeakerButton } from '../common/SpeakerButton';
import { ProgressBar } from '../common/ProgressBar';
import { storageService } from '../../services/storageService';

interface Props {
  profile: UserProfile;
  words: Word[];
  rules: GrammarRule[];
  onOpenSettings: () => void;
  onNavigateToVocab: () => void;
  onNavigateToGrammar: () => void;
}

export const ProfileView: React.FC<Props> = ({
  profile,
  words,
  rules,
  onOpenSettings,
  onNavigateToVocab,
  onNavigateToGrammar,
}) => {
  const wordProgressMap = useMemo(() => storageService.getAllWordProgress(), [profile]);
  const grammarProgressMap = useMemo(() => storageService.getAllGrammarProgress(), [profile]);

  // Compute vocabulary mastery counts
  const vocabStats = useMemo(() => {
    let mastered = 0;
    let familiar = 0;
    let learning = 0;
    let unseen = 0;

    words.forEach((w) => {
      const p = wordProgressMap[w.german.toLowerCase().trim()];
      if (!p || p.timesReviewed === 0) {
        unseen++;
      } else if (p.mastery >= 3) {
        mastered++;
      } else if (p.mastery === 2) {
        familiar++;
      } else {
        learning++;
      }
    });

    return { mastered, familiar, learning, unseen, total: words.length };
  }, [words, wordProgressMap]);

  // Compute grammar mastery counts
  const grammarStats = useMemo(() => {
    let learned = 0;
    let starred = 0;

    rules.forEach((r) => {
      const p = grammarProgressMap[r.id];
      if (p?.learned) learned++;
      if (p?.starred) starred++;
    });

    return { learned, starred, total: rules.length };
  }, [rules, grammarProgressMap]);

  // Starred Words list
  const starredWords = useMemo(() => {
    return words.filter((w) => wordProgressMap[w.german.toLowerCase().trim()]?.starred);
  }, [words, wordProgressMap]);

  // Generate 7-day activity data
  const weeklyActivity = useMemo(() => {
    const days: { label: string; date: string; count: number; isToday: boolean }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      const label = dayNames[d.getDay()];

      days.push({
        label,
        date: dateStr,
        count: profile.activityHistory?.[dateStr] || 0,
        isToday: i === 0,
      });
    }

    const maxCount = Math.max(1, ...days.map((d) => d.count));
    return { days, maxCount };
  }, [profile.activityHistory]);

  // XP Progress to next level
  const prevLevelXp = Math.pow(profile.level - 1, 2) * 50;
  const nextLevelXp = Math.pow(profile.level, 2) * 50;
  const xpInCurrentLevel = Math.max(0, profile.xp - prevLevelXp);
  const xpNeededInCurrentLevel = Math.max(1, nextLevelXp - prevLevelXp);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Profile Header Card */}
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
          {/* Avatar and Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #38bdf8, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {profile.name[0]?.toUpperCase() || 'D'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {profile.name}
                </h1>
                <CefrBadge level={profile.targetLevel} size="md" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <Award size={16} color="var(--accent-gold)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                  Stufe {profile.level}: {profile.levelTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.2rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            <Settings size={16} />
            <span>Profil anpassen</span>
          </button>
        </div>

        {/* Level XP Progress Bar */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Stufe {profile.level} Fortschritt ({xpInCurrentLevel} / {xpNeededInCurrentLevel} XP)
            </span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
              Noch {Math.max(0, nextLevelXp - profile.xp)} XP bis Stufe {profile.level + 1}
            </span>
          </div>
          <ProgressBar current={xpInCurrentLevel} total={xpNeededInCurrentLevel} height={10} color="var(--accent-primary)" />
        </div>
      </div>

      {/* 4 Core Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Streak */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderLeft: '4px solid var(--accent-gold)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Lernserie</span>
            <Flame size={22} color="var(--accent-gold)" fill={profile.streak > 0 ? '#f59e0b' : 'none'} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
            {profile.streak} {profile.streak === 1 ? 'Tag' : 'Tage'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Täglich üben, um die Serie zu halten
          </div>
        </div>

        {/* Total XP */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderLeft: '4px solid var(--accent-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Gesamt-XP</span>
            <Zap size={22} color="var(--accent-primary)" fill="currentColor" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {profile.xp.toLocaleString()} XP
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Erhalten durch Flashcards & Quizzes
          </div>
        </div>

        {/* Daily Goal */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderLeft: '4px solid var(--color-success)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tagesziel</span>
            <CheckCircle2 size={22} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {profile.todayWordsPracticed} / {profile.dailyGoal}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {Math.min(100, Math.round((profile.todayWordsPracticed / profile.dailyGoal) * 100))}% erreicht heute
          </div>
        </div>

        {/* Article Rush High Score */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderLeft: '4px solid #a855f7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Artikel-Rush Rekord</span>
            <Trophy size={22} color="#a855f7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7' }}>
            {profile.rushHighScore || 0} Pkt
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Beste Punktzahl im Schnelligkeitstest
          </div>
        </div>
      </div>

      {/* 7-Day Activity Chart */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Calendar size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Lernaktivität der letzten 7 Tage</h2>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
            height: '160px',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {weeklyActivity.days.map((day) => {
            const heightPercent = Math.max(12, Math.round((day.count / weeklyActivity.maxCount) * 100));

            return (
              <div
                key={day.date}
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
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: day.count > 0 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                  {day.count}
                </span>

                <div
                  style={{
                    width: '100%',
                    maxWidth: '40px',
                    height: `${heightPercent}%`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: day.isToday
                      ? 'var(--accent-primary)'
                      : day.count > 0
                      ? 'var(--accent-primary-subtle)'
                      : 'var(--bg-tertiary)',
                    border: `1px solid ${day.isToday ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    transition: 'all 0.3s ease',
                  }}
                  title={`${day.date}: ${day.count} Wörter geübt`}
                />

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: day.isToday ? 800 : 500,
                    color: day.isToday ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mastery Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Vocab Mastery Breakdown */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Wortschatz-Beherrschung</h3>
            <button
              type="button"
              onClick={onNavigateToVocab}
              style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>Üben</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ Gemeistert (Level 3)</span>
                <span>{vocabStats.mastered} Wörter ({Math.round((vocabStats.mastered / vocabStats.total) * 100)}%)</span>
              </div>
              <ProgressBar current={vocabStats.mastered} total={vocabStats.total} color="var(--color-success)" height={7} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Vertraut (Level 2)</span>
                <span>{vocabStats.familiar} Wörter ({Math.round((vocabStats.familiar / vocabStats.total) * 100)}%)</span>
              </div>
              <ProgressBar current={vocabStats.familiar} total={vocabStats.total} color="var(--accent-primary)" height={7} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>In Bearbeitung (Level 1)</span>
                <span>{vocabStats.learning} Wörter ({Math.round((vocabStats.learning / vocabStats.total) * 100)}%)</span>
              </div>
              <ProgressBar current={vocabStats.learning} total={vocabStats.total} color="var(--accent-gold)" height={7} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Noch ungeübt</span>
                <span>{vocabStats.unseen} Wörter ({Math.round((vocabStats.unseen / vocabStats.total) * 100)}%)</span>
              </div>
              <ProgressBar current={vocabStats.unseen} total={vocabStats.total} color="var(--border-medium)" height={7} />
            </div>
          </div>
        </div>

        {/* Grammar Rules Breakdown */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Grammatik-Status</h3>
            <button
              type="button"
              onClick={onNavigateToGrammar}
              style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <span>Regeln ansehen</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Gelernt & Verstanden</span>
                <strong style={{ color: 'var(--color-success)' }}>
                  {grammarStats.learned} / {grammarStats.total} ({Math.round((grammarStats.learned / grammarStats.total) * 100)}%)
                </strong>
              </div>
              <ProgressBar current={grammarStats.learned} total={grammarStats.total} color="var(--color-success)" height={8} />
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                marginTop: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                ★ {grammarStats.starred} Grammatikregeln gemerkt
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Wiederhole gemerkte Regeln regelmäßig mit den interaktiven Übungen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Starred Vocabulary Section */}
      {starredWords.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={20} color="var(--accent-gold)" fill="#f59e0b" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Gemerkte Vokabeln ({starredWords.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={onNavigateToVocab}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#0b0f17',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              Jetzt üben
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {starredWords.slice(0, 12).map((w, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    {w.gender ? `${w.gender} ` : ''}{w.german}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{w.english}</div>
                </div>
                <SpeakerButton text={w.german} size={15} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
