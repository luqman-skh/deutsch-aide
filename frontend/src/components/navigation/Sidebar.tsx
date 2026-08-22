import React from 'react';
import { GraduationCap, BookOpen, BookA, User, Sparkles, ChevronRight } from 'lucide-react';
import type { ActiveTab } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  starredWordsCount: number;
  totalWordsCount: number;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  starredWordsCount,
  totalWordsCount,
}) => {
  const { t } = useTranslation();

  const tabs = [
    {
      id: 'vocab' as ActiveTab,
      label: t('nav.vocab'),
      sublabel: t('nav.vocab_sub'),
      icon: GraduationCap,
      badge: `${totalWordsCount}`,
      color: 'var(--accent-primary)',
    },
    {
      id: 'grammar' as ActiveTab,
      label: t('nav.grammar'),
      sublabel: t('nav.grammar_sub'),
      icon: BookOpen,
      badge: '365+',
      color: '#a855f7',
    },
    {
      id: 'lexicon' as ActiveTab,
      label: t('nav.lexicon'),
      sublabel: t('nav.lexicon_sub'),
      icon: BookA,
      badge: starredWordsCount > 0 ? `★ ${starredWordsCount}` : undefined,
      color: '#10b981',
    },
    {
      id: 'profile' as ActiveTab,
      label: t('nav.profile'),
      sublabel: t('nav.profile_sub'),
      icon: User,
      color: 'var(--accent-gold)',
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '270px',
          flexShrink: 0,
          display: 'none',
          flexDirection: 'column',
          gap: '0.6rem',
        }}
        className="sidebar-desktop"
      >
        <div style={{ padding: '0.25rem 0.5rem 0.5rem 0.5rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}
          >
            {t('nav.learning_areas')}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--bg-card-solid)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-medium)' : 'transparent'}`,
                  boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {/* Active left indicator strip */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '15%',
                      bottom: '15%',
                      width: '4px',
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: tab.color,
                      boxShadow: `0 0 8px ${tab.color}`,
                    }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isActive ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? tab.color : 'var(--text-muted)',
                      border: `1px solid ${isActive ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
                      flexShrink: 0,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <Icon size={19} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {tab.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {tab.sublabel}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {tab.badge && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isActive ? 'var(--bg-tertiary)' : 'rgba(255, 255, 255, 0.05)',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={15} color="var(--text-muted)" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Daily Tip Widget */}
        <div
          className="glass-panel"
          style={{
            marginTop: 'auto',
            padding: '1.15rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            background: 'linear-gradient(145deg, var(--bg-card), var(--bg-tertiary))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-gold-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
              }}
            >
              <Sparkles size={14} />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {t('nav.tip')}
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {t('nav.tip_content')}
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-glass)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0.6rem 0.5rem',
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'var(--shadow-lg)',
        }}
        className="nav-mobile-bottom"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? tab.color : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: isActive ? 800 : 500,
                flex: 1,
              }}
            >
              <Icon size={20} />
              <span>{tab.label.split('/')[0].split('&')[0].trim()}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
