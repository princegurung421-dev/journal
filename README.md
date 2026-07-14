# Prince's Learning Journal — Progressive Web App

A Progressive Web App (PWA) that documents my Mobile Application Development
learning journey. It combines a weekly reflections journal, a portfolio, an
about page, and a Tic-Tac-Toe mini-project, backed by a **Flask** API and
made installable + offline-capable through a **web app manifest** and a
**service worker**.

**Live app:** _add your PythonAnywhere URL here_
**Repository:** _add your GitHub URL here_

---

## Features

- **Frontend** — semantic HTML5, responsive mobile-first CSS, ES6-module JavaScript.
- **Flask backend** (`app.py`) — serves the whole app and a JSON API for reflections.
- **Data storage** — server-side `backend/reflections.json` plus client-side IndexedDB (`js/db.js`) for offline entries.
- **API feature** — REST API (`/api/reflections`, `/api/save_reflection`, `/api/delete_reflection`) and third-party/browser APIs (geolocation, clock, YouTube embed).
- **Service worker** (`sw.js`) — pre-caches core files, network-first for the API, offline navigation fallback.
- **Web app manifest** (`manifest.json`) — name, icons (192/512 + maskable), theme colour → **installable** on desktop and Android.
- **Mini project** — Tic-Tac-Toe game (`tictactoe.html`, `js/tictactoe.js`).

---

## Project structure

```
journal/
├── app.py                 # Flask backend (main entry point)
├── wsgi.py                # WSGI entry point for PythonAnywhere
├── requirements.txt       # Python dependencies (Flask)
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── index.html             # Home
├── journal.html           # Journal / reflections list
├── reflections.html       # Add + manage reflections
├── projects.html          # Portfolio
├── about.html             # About me
├── tictactoe.html         # Mini project (game)
├── css/style.css
├── js/                    # clock, location, theme, db, journal, reflections,
│                          # reflection-form, network-status, thirdparty, tictactoe
├── images/                # profile + PWA icons (192/512/maskable/apple/favicon)
└── backend/
    ├── reflections.json   # server-side data store
    └── save_entry.py      # Lab 5 CLI tool for adding entries
```

---

## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open **http://localhost:8000**. The API and static files are both served
by Flask on the same origin, so the service worker and API work out of the box.

---

## Deploy

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step PythonAnywhere setup
(this is what makes the full frontend + backend + PWA work online, and where
the install / manifest evidence should be captured).

---

## PWA / offline test checklist

1. Open the live HTTPS URL in Chrome.
2. DevTools → **Application → Manifest**: shows name, icons, theme colour, no errors.
3. DevTools → **Application → Service Workers**: `sw.js` is *activated and running*.
4. Address bar shows an **install** icon → install the app; it opens in its own window.
5. DevTools → **Network → Offline**, then reload: pages still load from cache.
6. Add a reflection while offline → it is queued in IndexedDB and syncs when back online.
