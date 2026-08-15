# 🇩🇪 DeutschAide — Interaktiver Vokabel- & Grammatiktrainer

**DeutschAide** ist eine moderne, hochperformante Webanwendung zum Erlernen der deutschen Sprache. Sie kombiniert einen vielseitigen **Wortschatz-Trainer**, einen umfangreichen **Grammatik-Kompass** und ein motivierendes **Lernprofil mit Gamification** (XP, Streaks, Stufen und Statistiken).

Die Anwendung nutzt **React + TypeScript** im Frontend und **Supabase** als Cloud-Datenbank mit automatischer **Offline-Fallback-Resilienz** für nahtloses Lernen ohne Unterbrechungen.

---

## 🌟 Hauptfunktionen (Core Features)

### 1. 🎓 Wortschatz-Trainer (Vocab Trainer)
- **🗂 3D-Karteikarten (Flashcards)**:
  - 3D-Drehanimation (Klick oder `Leertaste`)
  - Farbkodierte Artikel-Hervorhebung (**der** = Blau, **die** = Pink/Rot, **das** = Grün)
  - Deutsche Sprachausgabe (Aussprache via Web Speech API)
  - Beispielsätze mit zweisprachiger Übersetzung und Schlüsselwort-Highlight
  - **Spaced-Repetition-System (SRS)**: Bewertung nach *Nochmals* (Taste 1), *Schwer* (Taste 2), *Gut* (Taste 3) und *Einfach* (Taste 4)
- **❓ Multiple-Choice Quiz**:
  - Dynamisch generierte 4-Optionen-Fragen
  - Umschaltbar zwischen **Deutsch → Englisch** und **Englisch → Deutsch**
  - Sofortiges Feedback, Serie-Multiplikatoren (`3x`, `5x`, `10x`) und XP-Boni
- **✍️ Schreib-Trainer (Type-In Spelling)**:
  - Wortschreibungsprüfung mit integrierter **Umlaute-Schnellleiste** (`ä`, `ö`, `ü`, `ß`, `Ä`, `Ö`, `Ü`)
  - Stufenweises Hinweissystem (1. Stufe: Artikel & Anfangsbuchstabe, 2. Stufe: Wortkontur)
- **⚡ Artikel-Rush (Der / Die / Das)**:
  - Schnelligkeits-Minispiel (30 oder 60 Sekunden Timer)
  - Große Tastatur-Hotkeys (`1/D` für der, `2/E` für die, `3/A` für das)
  - Combo-Multiplikatoren und Highscore-Speicherung
- **🎯 Gezieltes Fehlertraining (Problemwörter)**:
  - Wiederhole gezielt Wörter mit hoher Fehlerquote oder gemerkte Favoriten

---

### 2. 📖 Grammatikregeln & Übungen (Grammatik-Kompass)
- **365+ strukturierte Grammatikregeln**:
  - Kategorisiert in über 30 Bereiche (Fälle/Kasus, Artikel, Adjektivdeklination, Verbkonjugation, Zeitformen, Präpositionen, Relativsätze, Satzbau, etc.)
  - Filterbar nach CEFR-Niveau (**A1, A2, B1, B2, C1**)
- **Detaillierte Regelkarten**:
  - Zweisprachige Erläuterungen (Deutsch & Englisch)
  - Praxisnahe Beispielsätze mit Audio-Aussprache
  - Wichtige Merkhilfen, Tipps und Schlagwörter
  - Status "Gelernt" mit Fortschrittsbalken und Favoriten-Markierung
- **Interaktive Regel-Praxis**:
  - Teste dein Verständnis jeder einzelnen Grammatikregel direkt in einer interaktiven Übung

---

### 3. 📚 Wortschatz-Lexikon (Wörterbuch & Suche)
- Durchsuche den gesamten Wortschatz in Echtzeit auf Deutsch oder Englisch
- Filter nach Wortart (Nomen, Verben, Adjektive, etc.), Artikel (**der / die / das**), CEFR-Stufe und Lernstatus
- Sortierung nach Häufigkeitsrang, Alphabet oder Übungsfrequenz
- Detailansicht mit allen Synonymen, Beispielen und Statistiken

---

### 4. 👤 Profil & Lernfortschritt (Mein Profil)
- **Gamification**:
  - XP-System & Stufenaufstieg (z. B. *Anfänger* → *Wort-Entdecker* → *Deutsch-Profi* → *Grandmaster*)
  - XP-Fortschrittsbalken zur nächsten Stufe
  - Tägliche Lernserie (**Streak** mit Flammensymbol)
  - Tagesziel-Verfolgung (z. B. 15 Wörter/Tag)
- **7-Tage-Aktivitätsdiagramm**: Balkendiagramm der täglichen Lernaktivität
- **Beherrschungsgrad**: Übersicht über gemeisterte, vertraute, in Bearbeitung befindliche und ungeübte Vokabeln
- **Favoritensammlung**: Schnellzugriff auf gemerkte Vokabeln und Regeln
- **Einstellungen**: Anpassung von Name, Zielniveau, Sprechgeschwindigkeit, Soundeffekten, Dark/Light-Theme und Supabase-Synchronisation

---

## ☁️ Supabase-Integration & Offline-Fallback

DeutschAide verbindet sich automatisch mit deiner Supabase-Instanz:
- **Tabelle `german_words`**: Vokabeldatenbank mit Übersetzungen, Artikeln, Beispielen und Rängen
- **Tabelle `grammar_rules`**: Grammatikdatenbank mit Kategorien, Regeln und Beispielen
- **Offline-Resilienz**: Falls keine Internetverbindung besteht oder Tabellen leer sind, greift die App nahtlos auf die mitgelieferten Datensätze zu.
- **In-App DB-Seeding**: Über den Einstellungsdialog (`⚙️`) kann die Datenbank mit einem Klick aus der UI befüllt werden.

---

## 🚀 Schnellstart (Entwicklung & Start)

### Voraussetzungen
- **Node.js**: v18+ (empfohlen v20 oder v22)
- **npm**: v9+

### Frontend starten
```bash
# In das Frontend-Verzeichnis wechseln
cd frontend

# Abhängigkeiten installieren (falls noch nicht geschehen)
npm install

# Entwicklungsserver starten
npm run dev
```

Die Anwendung öffnet sich unter `http://localhost:5173`.

### Produktions-Build erstellen
```bash
cd frontend
npm run build
```

---

## 🛠 Technologien & Architektur

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Modernes CSS-Designsystem (CSS-Variablen, Glassmorphism, 3D-Transforms, Responsive Breakpoints)
- **Datenbank & Backend**: Supabase (`@supabase/supabase-js`)
- **Audio & Sound**: Web Speech API (`de-DE` SpeechSynthesis) + Web Audio API (Synthetische Soundeffekte)
- **Icons**: Lucide React
- **Feier-Effekte**: Canvas Confetti
