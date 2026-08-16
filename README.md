# 🇩🇪 DeutschAide — Full-Stack German Vocabulary & Grammar Trainer

**DeutschAide** ist eine moderne, hochperformante Full-Stack-Webanwendung zum Erlernen der deutschen Sprache. Sie kombiniert einen **Python FastAPI Server**, ein reaktives **React + TypeScript Frontend**, **Supabase Cloud-Authentifizierung & Datenbank**, sowie ein vollständiges zweisprachiges Interface (**🇩🇪 Deutsch / 🇬🇧 English**).

---

## 🌟 Neue Features & Architektur

### 1. 🐍 Python Backend Server (FastAPI)
- **Moderne REST-API**:
  - `/api/words`: Vokabelsuche, Paginierung, Filter nach Niveau (A1–C1), Wortart und Artikeln.
  - `/api/grammar`: 365+ Grammatikregeln, Kategorien und Filter.
  - `/api/auth`: Supabase JWT Token-Verifizierung & Benutzerstatus.
  - `/api/progress`: Cloud-Synchronisation von XP, Streaks und Spaced-Repetition-Fortschritten.
  - `/api/health`: Health-Check & Datenbankstatistiken.
- **🤖 Zukunftssichere LLM-Architektur (AI Placeholder Router)**:
  - `/api/ai/explain`, `/api/ai/correct`, `/api/ai/status`
  - Strukturierte Pydantic-Schemas und modulare Architektur zur einfachen Anbindung von OpenAI, Google Gemini, Anthropic oder lokalem Ollama in der Zukunft.

---

### 2. 🔐 Supabase Authentifizierung (Auth Layer)
- **Anmelden & Registrieren**:
  - Schnelle Registrierung mit E-Mail, Passwort und Nickname.
  - Sichere Authentifizierung über Supabase Auth.
  - Automatisches Cloud-Backup von Vokabel-Fortschritten und Streaks.
  - **Gast-Modus**: Voll funktionsfähig auch ohne Login mit lokalem Speicher.
  - Navbar-Badge mit Benutzer-Dropdown und Cloud-Sync-Status.

---

### 3. 🌐 Sprachumschaltung (🇩🇪 Deutsch / 🇬🇧 English)
- **Vollständiges i18n-System**:
  - Blitzschnelles Umschalten zwischen Deutsch und Englisch direkt in der Navbar (`🇩🇪 DE` / `🇬🇧 EN`) oder im Einstellungsmenü.
  - Vollständige Übersetzung aller Module: Vokabeltrainer, Flashcards, Quiz, Rechtschreibung, Artikel-Rush, Grammatik-Kompass, Lexikon, Profil & Statistiken, und Auth-Dialoge.

---

### 4. 🎓 Die 4 Lernmodule
- **1. Wortschatz-Trainer**: 3D-Flashcards mit Audio (`de-DE`), Multiple-Choice-Quiz, Schreib-Trainer mit Umlaut-Tastatur (`ä`, `ö`, `ü`, `ß`), Artikel-Rush und Fehlertraining.
- **2. Grammatik-Kompass**: 365+ strukturierte Regeln in 30+ Kategorien mit Beispielen, Audio und interaktivem Übungsquiz.
- **3. Wortschatz-Lexikon**: Umfassendes Wörterbuch mit Artikelsuche, Sortierung und Favoriten.
- **4. Profil & Gamification**: XP-Stufen (*Anfänger* → *Großmeister*), Tages-Streak, 7-Tage-Aktivitätsdiagramm und Beherrschungsgrad.

---

## 🚀 Schnellstart (Entwicklung & Start)

### 1. Python Backend starten
```powershell
# In das Backend-Verzeichnis wechseln
cd D:\GitHubRepos\deutsch-helper\backend

# Server starten
& "..\deutsch-project\Scripts\python.exe" run.py
```
- **API Server**: `http://localhost:8000`
- **Interaktive Swagger API Docs**: `http://localhost:8000/docs`

---

### 2. Frontend starten
```powershell
# In das Frontend-Verzeichnis wechseln
cd D:\GitHubRepos\deutsch-helper\frontend

# Entwicklungsserver starten
npm run dev
```
- **Frontend App**: `http://localhost:5173`

---

## 🛠 Technologien

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic, Supabase Python Client, PyJWT
- **Frontend**: React 19, TypeScript, Vite
- **Datenbank & Auth**: Supabase (`auth`, `german_words`, `grammar_rules`, `user_progress`)
- **Internationalisierung**: React Context i18n (`de` / `en`)
- **Styling**: Modern CSS Design System (CSS Variables, Glassmorphism, 3D Transforms)
- **Audio**: Web Speech API (`de-DE`) + Web Audio API Synthesizer