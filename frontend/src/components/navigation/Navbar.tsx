import React from 'react';
import { Flame, Zap, CheckCircle2, Cloud, CloudOff, Settings, Moon, Sun } from 'lucide-react';
import type { UserProfile } from '../../types';

interface Props {
  profile: UserProfile;
  supabaseConnected: boolean;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<Props> = ({
  profile,
  supabaseConnected,
  onOpenSettings,
  onToggleTheme,
}) => {
  const goalPercent = Math.min(
    100,
    Math.round((profile.todayWordsPracticed / profile.dailyGoal) * 100)
  );

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #2563eb, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#ffffff',
              letterSpacing: '-0.03em',
            }}
          >
            DE
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                Deutsch<span style={{ color: 'var(--accent-primary)' }}>Aide</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-gold-subtle)',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                PRO
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Vokabel- & Grammatik-Trainer
            </p>
          </div>
        </div>

        {/* Stats & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Daily Streak */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: profile.streak > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-tertiary)',
              border: `1px solid ${profile.streak > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)'}`,
              color: profile.streak > 0 ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
            title={`${profile.streak} Tag(e) Streak! Übe täglich, um deine Serie zu halten.`}
          >
            <Flame size={16} fill={profile.streak > 0 ? '#f59e0b' : 'none'} />
            <span>{profile.streak}</span>
          </div>

          {/* XP & Level Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary-subtle)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
            title={`${profile.xp} XP - Stufe ${profile.level}: ${profile.levelTitle}`}
          >
            <Zap size={16} fill="currentColor" />
            <span>{profile.xp} XP</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.4rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
              }}
            >
              Lvl {profile.level}
            </span>
          </div>

          {/* Daily Goal Pill */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
            }}
            className="md-flex"
            title={`Tagesziel: ${profile.todayWordsPracticed}/${profile.dailyGoal} Wörter (${goalPercent}%)`}
          >
            <CheckCircle2
              size={15}
              color={goalPercent >= 100 ? 'var(--color-success)' : 'var(--text-muted)'}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              {profile.todayWordsPracticed}/{profile.dailyGoal} Ziel
            </span>
          </div>

          {/* Supabase Status Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: supabaseConnected ? 'var(--color-success-bg)' : 'var(--bg-tertiary)',
              border: `1px solid ${supabaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
              color: supabaseConnected ? 'var(--color-success)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
            title={supabaseConnected ? 'Supabase Live Connected' : 'Offline / Bundled Dataset Active'}
          >
            {supabaseConnected ? <Cloud size={14} /> : <CloudOff size={14} />}
            <span style={{ display: 'none' }} className="lg-inline">
              {supabaseConnected ? 'Supabase' : 'Offline'}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Design wechseln (Light / Dark)"
            aria-label="Toggle theme"
          >
            {profile.theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Einstellungen (Settings & Supabase Sync)"
            aria-label="Open Settings"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
