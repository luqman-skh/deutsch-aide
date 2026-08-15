import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  BookA,
} from 'lucide-react';
import type { Word, UserProfile, WordProgress } from '../../types';
import { GenderBadge } from '../common/GenderBadge';
import { PosBadge } from '../common/PosBadge';
import { CefrBadge } from '../common/CefrBadge';
import { SpeakerButton } from '../common/SpeakerButton';
import { WordDetailModal } from './WordDetailModal';
import { storageService } from '../../services/storageService';
import { playSfx } from '../../utils/audio';

interface Props {
  words: Word[];
  profile: UserProfile;
}

export const LexiconExplorer: React.FC<Props> = ({ words, profile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mastered' | 'learning' | 'starred' | 'unseen'>('all');
  const [sortBy, setSortBy] = useState<'frequency' | 'alpha-asc' | 'alpha-desc' | 'practiced'>('frequency');
  const [page, setPage] = useState(1);
  const itemsPerPage = 30;

  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, WordProgress>>(() =>
    storageService.getAllWordProgress()
  );

  const handleToggleStar = (german: string) => {
    storageService.toggleStarWord(german);
    setProgressMap(storageService.getAllWordProgress());
    playSfx('click', profile.soundEffects);
  };

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const key = w.german.toLowerCase().trim();
      const p = progressMap[key];

      // Search match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchDe = w.german.toLowerCase().includes(q);
        const matchEn = w.english.toLowerCase().includes(q);
        const matchTrans = (w.all_translations || '').toLowerCase().includes(q);
        const matchEx = (w.example_de || '').toLowerCase().includes(q);
        if (!matchDe && !matchEn && !matchTrans && !matchEx) return false;
      }

      // POS filter
      if (selectedPos !== 'all' && (w.pos || '').toLowerCase() !== selectedPos) {
        return false;
      }

      // Gender filter
      if (selectedGender !== 'all') {
        const g = (w.gender || '').toLowerCase().trim();
        if (selectedGender === 'none' && g !== '') return false;
        if (selectedGender !== 'none' && g !== selectedGender) return false;
      }

      // Level filter
      if (selectedLevel !== 'all' && (w.cefr_level || 'A1') !== selectedLevel) {
        return false;
      }

      // Status filter
      if (statusFilter === 'starred' && !p?.starred) return false;
      if (statusFilter === 'mastered' && (!p || p.mastery < 3)) return false;
      if (statusFilter === 'learning' && (!p || p.mastery === 0 || p.mastery >= 3)) return false;
      if (statusFilter === 'unseen' && p && p.timesReviewed > 0) return false;

      return true;
    });
  }, [words, searchTerm, selectedPos, selectedGender, selectedLevel, statusFilter, progressMap]);

  // Sort words
  const sortedWords = useMemo(() => {
    return [...filteredWords].sort((a, b) => {
      if (sortBy === 'frequency') {
        return (a.frequency_rank || 9999) - (b.frequency_rank || 9999);
      }
      if (sortBy === 'alpha-asc') {
        return a.german.localeCompare(b.german, 'de');
      }
      if (sortBy === 'alpha-desc') {
        return b.german.localeCompare(a.german, 'de');
      }
      if (sortBy === 'practiced') {
        const pA = progressMap[a.german.toLowerCase().trim()]?.timesReviewed || 0;
        const pB = progressMap[b.german.toLowerCase().trim()]?.timesReviewed || 0;
        return pB - pA;
      }
      return 0;
    });
  }, [filteredWords, sortBy, progressMap]);

  const paginatedList = useMemo(() => {
    return sortedWords.slice(0, page * itemsPerPage);
  }, [sortedWords, page]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))',
          border: '1px solid var(--border-medium)',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Wortschatz-Lexikon & Suche
        </span>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
          Deutsches Wörterbuch ({words.length} Wörter)
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          Durchsuche den gesamten Wortschatz nach Bedeutungen, Artikeln, Beispielsätzen und Wortarten.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Search row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Auf Deutsch oder Englisch suchen..."
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.6rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* POS Filter */}
          <select
            value={selectedPos}
            onChange={(e) => {
              setSelectedPos(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              flex: '1 1 140px',
            }}
          >
            <option value="all">Alle Wortarten</option>
            <option value="noun">Nomen</option>
            <option value="verb">Verben</option>
            <option value="adjective">Adjektive</option>
            <option value="adverb">Adverbien</option>
            <option value="preposition">Präpositionen</option>
            <option value="pronoun">Pronomen</option>
          </select>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              width: '130px',
            }}
          >
            <option value="all">Alle Artikel</option>
            <option value="der">der (Maskulin)</option>
            <option value="die">die (Feminin)</option>
            <option value="das">das (Neutrum)</option>
            <option value="none">Ohne Artikel</option>
          </select>

          {/* CEFR Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              width: '120px',
            }}
          >
            <option value="all">Alle Stufen</option>
            <option value="A1">Niveau A1</option>
            <option value="A2">Niveau A2</option>
            <option value="B1">Niveau B1</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              width: '170px',
            }}
          >
            <option value="frequency">Sortierung: Häufigkeit</option>
            <option value="alpha-asc">Alphabetisch: A → Z</option>
            <option value="alpha-desc">Alphabetisch: Z → A</option>
            <option value="practiced">Meist geübt</option>
          </select>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
            Lernstatus:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: statusFilter === 'all' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: statusFilter === 'all' ? '#0b0f17' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Alle
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('starred')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: statusFilter === 'starred' ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              color: statusFilter === 'starred' ? '#0b0f17' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            ★ Favoriten
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('mastered')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: statusFilter === 'mastered' ? 'var(--color-success)' : 'var(--bg-tertiary)',
              color: statusFilter === 'mastered' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            ✓ Gemeistert
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('learning')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: statusFilter === 'learning' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: statusFilter === 'learning' ? '#0b0f17' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            In Bearbeitung
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('unseen')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: statusFilter === 'unseen' ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
              color: statusFilter === 'unseen' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Ungeübt
          </button>
        </div>
      </div>

      {/* Words Count */}
      <div style={{ padding: '0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        {sortedWords.length} Wörter gefunden
      </div>

      {/* Words Grid */}
      {paginatedList.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {paginatedList.map((w, idx) => {
            const key = w.german.toLowerCase().trim();
            const p = progressMap[key];
            const isStarred = Boolean(p?.starred);

            return (
              <div
                key={idx}
                className="glass-panel-interactive"
                onClick={() => setSelectedWord(w)}
                style={{
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  minHeight: '140px',
                }}
              >
                <div>
                  {/* Badges & Speaker */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <GenderBadge gender={w.gender} size="sm" />
                      <PosBadge pos={w.pos} size="sm" />
                      <CefrBadge level={w.cefr_level || 'A1'} size="sm" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <SpeakerButton
                        text={`${w.gender ? w.gender + ' ' : ''}${w.german}`}
                        rate={profile.speechSpeed}
                        size={15}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(w.german);
                        }}
                        style={{
                          padding: '0.3rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isStarred ? 'var(--accent-gold-subtle)' : 'transparent',
                          color: isStarred ? 'var(--accent-gold)' : 'var(--text-muted)',
                        }}
                      >
                        <Star size={15} fill={isStarred ? '#f59e0b' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* German Word */}
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {w.gender && (
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          marginRight: '0.35rem',
                          color:
                            w.gender === 'der'
                              ? 'var(--color-der)'
                              : w.gender === 'die'
                              ? 'var(--color-die)'
                              : 'var(--color-das)',
                        }}
                      >
                        {w.gender}
                      </span>
                    )}
                    {w.german}
                  </div>

                  {/* English Translation */}
                  <div style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                    {w.english}
                  </div>
                </div>

                {/* Bottom Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.75rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>#{w.frequency_rank || idx + 1}</span>
                  {p && p.mastery >= 3 ? (
                    <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓ Gemeistert</span>
                  ) : p && p.timesReviewed > 0 ? (
                    <span>{p.timesReviewed}x geübt</span>
                  ) : (
                    <span>Neu</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <BookA size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Keine Wörter gefunden
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Passe deine Suche oder Filtereinstellungen an.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedPos('all');
              setSelectedGender('all');
              setSelectedLevel('all');
              setStatusFilter('all');
            }}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#0b0f17',
              fontWeight: 700,
            }}
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      {/* Load More Button */}
      {paginatedList.length < sortedWords.length && (
        <button
          type="button"
          onClick={() => setPage((prev) => prev + 1)}
          style={{
            margin: '1.5rem auto 0 auto',
            padding: '0.85rem 2.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}
        >
          Weitere Wörter laden (+{Math.min(itemsPerPage, sortedWords.length - paginatedList.length)})
        </button>
      )}

      {/* Word Detail Modal */}
      {selectedWord && (
        <WordDetailModal
          word={selectedWord}
          progress={progressMap[selectedWord.german.toLowerCase().trim()]}
          profile={profile}
          isStarred={Boolean(progressMap[selectedWord.german.toLowerCase().trim()]?.starred)}
          onToggleStar={handleToggleStar}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
};
