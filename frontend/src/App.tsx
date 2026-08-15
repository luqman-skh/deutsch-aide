import React, { useState, useEffect, useCallback } from 'react';
import type { Word, GrammarRule, UserProfile, ActiveTab } from './types';
import { Navbar } from './components/navigation/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { VocabHub } from './components/vocab/VocabHub';
import { GrammarExplorer } from './components/grammar/GrammarExplorer';
import { LexiconExplorer } from './components/lexicon/LexiconExplorer';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsModal } from './components/profile/SettingsModal';
import { dataService, type SupabaseHealth } from './services/dataService';
import { storageService } from './services/storageService';
import { playSfx } from './utils/audio';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('vocab');
  const [words, setWords] = useState<Word[]>([]);
  const [grammarRules, setGrammarRules] = useState<GrammarRule[]>([]);
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealth>({
    connected: false,
    wordsCount: 0,
    rulesCount: 0,
    message: 'Initialisiere Verbindung...',
  });

  // Apply theme to document on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.theme);
  }, [profile.theme]);

  // Load datasets and verify Supabase health
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [wordsRes, grammarRes, healthRes] = await Promise.all([
        dataService.getWords(),
        dataService.getGrammarRules(),
        dataService.checkHealth(),
      ]);

      setWords(wordsRes.data);
      setGrammarRules(grammarRes.data);
      setSupabaseHealth(healthRes);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleToggleTheme = () => {
    const nextTheme: 'dark' | 'light' = profile.theme === 'dark' ? 'light' : 'dark';
    const updated: UserProfile = { ...profile, theme: nextTheme };
    setProfile(updated);
    storageService.saveProfile(updated);
    document.documentElement.setAttribute('data-theme', nextTheme);
    playSfx('click', profile.soundEffects);
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
  };

  const handleRefreshHealth = async () => {
    const health = await dataService.checkHealth();
    setSupabaseHealth(health);
    const [wRes, gRes] = await Promise.all([
      dataService.getWords(true),
      dataService.getGrammarRules(true),
    ]);
    setWords(wRes.data);
    setGrammarRules(gRes.data);
  };

  // Count starred words for sidebar badge
  const starredWordsCount = React.useMemo(() => {
    const progress = storageService.getAllWordProgress();
    return Object.values(progress).filter((p) => p.starred).length;
  }, [profile]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          gap: '1rem',
        }}
      >
        <Loader2 size={42} className="animate-spin" color="var(--accent-primary)" />
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          DeutschAide wird geladen...
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Wortschatz & Grammatikregeln werden vorbereitet
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar
        profile={profile}
        supabaseConnected={supabaseHealth.connected}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Layout Container */}
      <div className="main-layout">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          starredWordsCount={starredWordsCount}
          totalWordsCount={words.length}
        />

        {/* Dynamic Content Views */}
        <main className="content-area">
          {activeTab === 'vocab' && (
            <VocabHub
              words={words}
              profile={profile}
              onRefreshData={loadInitialData}
            />
          )}

          {activeTab === 'grammar' && (
            <GrammarExplorer
              rules={grammarRules}
              profile={profile}
            />
          )}

          {activeTab === 'lexicon' && (
            <LexiconExplorer
              words={words}
              profile={profile}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              words={words}
              rules={grammarRules}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onNavigateToVocab={() => setActiveTab('vocab')}
              onNavigateToGrammar={() => setActiveTab('grammar')}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          profile={profile}
          supabaseHealth={supabaseHealth}
          onUpdateProfile={handleUpdateProfile}
          onRefreshHealth={handleRefreshHealth}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
