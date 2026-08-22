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
        backgroundColor: 'var(--bg-glass)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Logo & Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.25rem',
              letterSpacing: '-0.04em',
              userSelect: 'none',
            }}
          >
            <span>DE</span>
            {/* German flag mini accent at the bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                display: 'flex',
                borderBottomLeftRadius: 'var(--radius-md)',
                borderBottomRightRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <div style={{ flex: 1, backgroundColor: '#000000' }} />
              <div style={{ flex: 1, backgroundColor: '#dd0000' }} />
              <div style={{ flex: 1, backgroundColor: '#ffce00' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                Deutsch<span style={{ background: 'var(--accent-primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Aide</span>
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '0.12rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-gold-subtle)',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  letterSpacing: '0.04em',
                }}
              >
                PRO
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* Gamification Stats, Language, Auth & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Daily Streak Flame Pill */}
          <div
            className={profile.streak > 0 ? 'animate-flame' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: profile.streak > 0 ? 'var(--accent-gold-subtle)' : 'var(--bg-tertiary)',
              border: `1px solid ${profile.streak > 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
              color: profile.streak > 0 ? 'var(--accent-gold)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 800,
              boxShadow: profile.streak > 0 ? '0 0 14px rgba(245, 158, 11, 0.2)' : 'none',
              cursor: 'default',
            }}
            title={`${profile.streak} ${t('app.streak')}`}
          >
            <Flame size={17} fill={profile.streak > 0 ? '#f59e0b' : 'none'} color="#f59e0b" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{profile.streak}</span>
          </div>

          {/* XP & Level Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary-subtle)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 800,
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.15)',
              cursor: 'default',
            }}
            title={`${profile.xp} XP • ${t('app.level')} ${profile.level}`}
          >
            <Zap size={16} fill="currentColor" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{profile.xp} XP</span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '0.1rem 0.4rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Lvl {profile.level}
            </span>
          </div>

          {/* Daily Goal Progress Pill */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: goalPercent >= 100 ? 'var(--color-success-bg)' : 'var(--bg-tertiary)',
              border: `1px solid ${goalPercent >= 100 ? 'var(--color-success-border)' : 'var(--border-subtle)'}`,
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
            className="md-flex"
            title={`${profile.todayWordsPracticed}/${profile.dailyGoal} (${goalPercent}%)`}
          >
            <CheckCircle2
              size={15}
              color={goalPercent >= 100 ? 'var(--color-success)' : 'var(--text-muted)'}
            />
            <span style={{ color: goalPercent >= 100 ? 'var(--color-success)' : 'var(--text-secondary)' }}>
              {profile.todayWordsPracticed}/{profile.dailyGoal} {t('app.daily_goal')}
            </span>
          </div>

          {/* Backend / Supabase Status Pill */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.7rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: backendHealth.online || supabaseConnected ? 'var(--color-success-bg)' : 'var(--bg-tertiary)',
              border: `1px solid ${backendHealth.online || supabaseConnected ? 'var(--color-success-border)' : 'var(--border-subtle)'}`,
              color: backendHealth.online || supabaseConnected ? 'var(--color-success)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
            className="lg-inline"
            title={backendHealth.online ? 'FastAPI Python Server & Supabase Online' : 'Offline / Client Mode'}
          >
            {backendHealth.online ? <Server size={13} /> : supabaseConnected ? <Cloud size={13} /> : <CloudOff size={13} />}
            <span>{backendHealth.online ? 'FastAPI' : supabaseConnected ? 'Supabase' : 'Offline'}</span>
          </div>

          {/* Dual Language Switcher Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 800,
              boxShadow: 'var(--shadow-sm)',
            }}
            title={language === 'de' ? 'Switch interface to English' : 'Oberfläche auf Deutsch umschalten'}
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
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem 0.35rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-primary-gradient)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  {(user.user_metadata?.display_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.user_metadata?.display_name || user.email?.split('@')[0]}
                </span>
              </button>

              {showUserMenu && (
                <div
                  className="glass-panel animate-pop-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.6rem)',
                    right: 0,
                    width: '220px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 60,
                  }}
                >
                  <div style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('auth.logged_in_as')}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-error)',
                      backgroundColor: 'var(--color-error-bg)',
                      border: '1px solid var(--color-error-border)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
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
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-primary)',
                color: '#0b0f17',
                fontSize: '0.84rem',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.35)',
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
              padding: '0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
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
              padding: '0.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
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
