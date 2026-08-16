import React, { useState, useEffect, useCallback } from 'react';
import type { Word, GrammarRule, UserProfile, ActiveTab } from './types';
import { dataService, type SupabaseHealth } from './services/dataService';
import { apiService, type BackendHealth } from './services/apiService';
import { storageService } from './services/storageService';
import { playSfx } from './utils/audio';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './services/authContext';

import { Navbar } from './components/navigation/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { VocabHub } from './components/vocab/VocabHub';
import { GrammarExplorer } from './components/grammar/GrammarExplorer';
import { LexiconExplorer } from './components/lexicon/LexiconExplorer';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsModal } from './components/profile/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const { user, session } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('vocab');
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [words, setWords] = useState<Word[]>([]);
  const [grammarRules, setGrammarRules] = useState<GrammarRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealth>({
    connected: false,
    wordsCount: 0,
    rulesCount: 0,
    message: 'Verbinde...',
  });

  const [backendHealth, setBackendHealth] = useState<BackendHealth>({
    online: false,
    databaseConnected: false,
    wordsCount: 0,
    rulesCount: 0,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setLoading(true);

    // 1. Check Python backend server health
    const bHealth = await apiService.checkHealth();
    setBackendHealth(bHealth);

    // 2. Fetch words (from backend if available, or dataService)
    let fetchedWords: Word[] = [];
    if (bHealth.online) {
      const res = await apiService.getWords({ pageSize: 500 });
      if (res && res.data && res.data.length > 0) {
        fetchedWords = res.data;
      }
    }
    if (fetchedWords.length === 0) {
      const res = await dataService.getWords();
      fetchedWords = res.data;
    }
    setWords(fetchedWords);

    // 3. Fetch grammar rules (from backend or dataService)
    let fetchedRules: GrammarRule[] = [];
    if (bHealth.online) {
      const res = await apiService.getGrammarRules();
      if (res && res.data && res.data.length > 0) {
        fetchedRules = res.data;
      }
    }
    if (fetchedRules.length === 0) {
      const res = await dataService.getGrammarRules();
      fetchedRules = res.data;
    }
    setGrammarRules(fetchedRules);

    // 4. Check Supabase health
    const sHealth = await dataService.checkHealth();
    setSupabaseHealth(sHealth);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Sync profile when user changes
  useEffect(() => {
    if (user) {
      const updated: UserProfile = {
        ...profile,
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || profile.name,
        email: user.email,
      };
      setProfile(updated);
      storageService.saveProfile(updated);

      // Trigger cloud sync to backend
      if (backendHealth.online && session?.access_token) {
        apiService.syncProgress(
          {
            profile: updated,
            words_progress: storageService.getAllWordProgress(),
            grammar_progress: storageService.getAllGrammarProgress(),
          },
          session.access_token
        );
      }
    }
  }, [user, session]);

  const handleToggleTheme = () => {
    const nextTheme: 'dark' | 'light' = profile.theme === 'dark' ? 'light' : 'dark';
    const updated: UserProfile = { ...profile, theme: nextTheme };
    setProfile(updated);
    storageService.saveProfile(updated);
    document.documentElement.setAttribute('data-theme', nextTheme);
    playSfx('click', profile.soundEffects);
  };

  const handleRefreshProfile = () => {
    setProfile(storageService.getProfile());
  };

  const starredWordsCount = Object.values(storageService.getAllWordProgress()).filter(
    (p) => p.starred
  ).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Sticky Navbar */}
      <Navbar
        profile={profile}
        supabaseConnected={supabaseHealth.connected}
        backendHealth={backendHealth}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Layout Container */}
      <div
        style={{
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          padding: '1.5rem 1.25rem 5rem 1.25rem',
          display: 'flex',
          gap: '2rem',
          flex: 1,
        }}
      >
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            playSfx('click', profile.soundEffects);
          }}
          starredWordsCount={starredWordsCount}
          totalWordsCount={words.length}
        />

        {/* Dynamic Tab Content Area */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 1rem',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-full)',
                  border: '4px solid var(--accent-primary-subtle)',
                  borderTopColor: 'var(--accent-primary)',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Lade Wörter & Grammatikregeln...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'vocab' && (
                <VocabHub
                  words={words}
                  profile={profile}
                  onRefreshData={handleRefreshProfile}
                />
              )}

              {activeTab === 'grammar' && (
                <GrammarExplorer
                  rules={grammarRules}
                  profile={profile}
                  onRefreshProfile={handleRefreshProfile}
                />
              )}

              {activeTab === 'lexicon' && (
                <LexiconExplorer
                  words={words}
                  profile={profile}
                  onRefreshData={handleRefreshProfile}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  profile={profile}
                  words={words}
                  grammarRules={grammarRules}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          profile={profile}
          supabaseHealth={supabaseHealth}
          backendHealth={backendHealth}
          onUpdateProfile={(updated) => setProfile(updated)}
          onRefreshHealth={loadInitialData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          handleRefreshProfile();
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
