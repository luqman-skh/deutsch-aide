import React, { useState } from 'react';
import {
  Flame,
  Zap,
  CheckCircle2,
  Cloud,
  CloudOff,
  Settings,
  Moon,
  Sun,
  Globe,
  LogOut,
  LogIn,
  Server,
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../services/authContext';
import { type BackendHealth } from '../../services/apiService';

interface Props {
  profile: UserProfile;
  supabaseConnected: boolean;
  backendHealth: BackendHealth;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<Props> = ({
  profile,
  supabaseConnected,
  backendHealth,
  onOpenSettings,
  onToggleTheme,
  onOpenAuth,
}) => {
  const { language, toggleLanguage, t } = useTranslation();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
          gap: '0.75rem',
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
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* Stats, Language, Auth & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Daily Streak */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: profile.streak > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-tertiary)',
              border: `1px solid ${profile.streak > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)'}`,
              color: profile.streak > 0 ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
            title={`${profile.streak} ${t('app.streak')}`}
          >
            <Flame size={16} fill={profile.streak > 0 ? '#f59e0b' : 'none'} />
            <span>{profile.streak}</span>
          </div>

          {/* XP & Level Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary-subtle)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
            title={`${profile.xp} XP - ${t('app.level')} ${profile.level}`}
          >
            <Zap size={16} fill="currentColor" />
            <span>{profile.xp} XP</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.35rem',
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
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
            }}
            className="md-flex"
            title={`${profile.todayWordsPracticed}/${profile.dailyGoal} (${goalPercent}%)`}
          >
            <CheckCircle2
              size={15}
              color={goalPercent >= 100 ? 'var(--color-success)' : 'var(--text-muted)'}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              {profile.todayWordsPracticed}/${profile.dailyGoal} {t('app.daily_goal')}
            </span>
          </div>

          {/* Backend / Supabase Status */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: supabaseConnected || backendHealth.online ? 'var(--color-success-bg)' : 'var(--bg-tertiary)',
              border: `1px solid ${supabaseConnected || backendHealth.online ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
              color: supabaseConnected || backendHealth.online ? 'var(--color-success)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
            className="lg-inline"
            title={backendHealth.online ? 'Python Backend (FastAPI) & Supabase Online' : 'Offline Mode Active'}
          >
            {backendHealth.online ? <Server size={14} /> : supabaseConnected ? <Cloud size={14} /> : <CloudOff size={14} />}
            <span>{backendHealth.online ? 'API Online' : supabaseConnected ? 'Supabase' : 'Offline'}</span>
          </div>

          {/* Language Switcher Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
            title={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
            aria-label="Toggle language"
          >
            <Globe size={15} color="var(--accent-primary)" />
            <span>{language === 'de' ? '🇩🇪 DE' : '🇬🇧 EN'}</span>
          </button>

          {/* User Auth Profile Pill / Login Button */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-primary-subtle)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#0b0f17',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                  }}
                >
                  {(user.user_metadata?.display_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.user_metadata?.display_name || user.email?.split('@')[0]}
                </span>
              </button>

              {showUserMenu && (
                <div
                  className="glass-panel animate-pop-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '200px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 60,
                  }}
                >
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('auth.logged_in_as')}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-error)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={15} />
                    <span>{t('auth.sign_out')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary)',
                color: '#0b0f17',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              <LogIn size={15} />
              <span>{t('auth.sign_in')}</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={profile.theme === 'light' ? t('settings.theme_dark') : t('settings.theme_light')}
            aria-label="Toggle theme"
          >
            {profile.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={t('app.settings')}
            aria-label="Open Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
