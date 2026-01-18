# Mobile Application Development - Project Presentation
## Learning Journal PWA
**Student Name:** Prince Gurung  
**Course:** BSc (Hons) Computer Science  
**Module:** Mobile Application Development  

---

## Slide 1: Introduction
- **Project Title:** Personal Learning Journal PWA
- **Objective:** Develop a Progressive Web Application (PWA) to document weekly learning, showcase projects, and engage in reflective practice.
- **Key Philosophy:** Mobile-First Design, Offline-First Architecture, and Seamless User Experience (UX).

---

## Slide 2: Problem Statement & Motivation
- **The Need:** A dedicated, personal space to track academic progress and store technical reflections.
- **Why a PWA?**
    - native-like experience on mobile devices.
    - Accessible offline (crucial for on-the-go journaling).
    - Installable without an App Store.
- **Goal:** Create a digital "second brain" for learning mobile development.

---

## Slide 3: Technical Stack - Frontend
- **HTML5:** Semantic structure for accessibility and SEO.
- **CSS3:** 
    - Custom aesthetics (Glassmorphism).
    - Responsive Design (Flexbox & Grid).
    - Animations (Keyframes, Transitions).
- **JavaScript (ES6+):**
    - Modular architecture (ES Modules).
    - Async/Await for data handling.
    - DOM Manipulation for dynamic UI.

---

## Slide 4: Technical Stack - Backend & Data
- **Backend:** Python `http.server` (Custom Implementation).
    - RESTful API endpoints (`GET`, `POST`, `DELETE`).
    - Robust path handling for static file serving.
- **Database (Persistence):** JSON File Storage (`reflections.json`).
- **Client-Side Storage:** IndexedDB (via wrapper) for robust offline data capability.

---

## Slide 5: Core Features Overview
1.  **Reflections Management:** Create, Read, Delete reflections.
2.  **Offline Capability:** Full functionality without internet.
3.  **Data Synchronization:** Auto-sync offline entries when online.
4.  **Data Portability:** Import/Export reflections (JSON).
5.  **Interactive UI:** Dark/Light Theme, Real-time Clock, Geolocation.

---

## Slide 6: User Interface (UI) Strategy
- **Design Language:** Modern "Glassmorphism" (Blur effects, semi-transparent layers).
- **Typography:** Google Fonts ('Outfit' for headings, 'Inter' for body) for readability.
- **Responsiveness:**
    - Collapsible Sidebar for Mobile.
    - Expanded Sidebar for Desktop.
    - Adaptive Card Layouts.

---

## Slide 7: PWA Implementation - Manifest
- **`manifest.json`:**
    - Defines app name, icons, and theme colors.
    - configuration `display: standalone` for native app feel.
    - Ensures "Add to Home Screen" installability.

---

## Slide 8: PWA Implementation - Service Worker
- **File:** `sw.js`
- **Caching Strategy:**
    - **Stale-While-Revalidate:** For static assets (CSS, JS) ensuring speed and freshness.
    - **Network-First:** For dynamic API calls to ensure data accuracy.
    - **Offline Fallback:** Serving cached shell when network fails.

---

## Slide 9: Feature Deep Dive - Reflections CRUD
- **Create:** User-friendly form with category selection and "Key Learnings" tags.
- **Read:** Dynamic card-based list with "Time Ago" timestamps.
- **Delete:** Ability to remove entries via API (Python backend) and UI.
- **Logic:** JavaScript `fetch` API communicates with Python server.

---

## Slide 10: Feature Deep Dive - Offline & Sync
- **Challenge:** How to save data when no internet?
- **Solution:**
    - Detect status via `navigator.onLine`.
    - If **Offline**: Save to **IndexedDB** marked as `isOffline: true`. Show "Pending Sync" badge.
    - If **Online**: Send directly to server.
- **Sync Logic:** On `window.online` event, iterate IndexedDB -> POST to Server -> Clear DB.

---

## Slide 11: Feature Deep Dive - Import / Export
- **Data Freedom:** Users own their data.
- **Export:**
    - JavaScript generates a `Blob` of the current JSON data.
    - Triggers auto-download of `reflections_backup.json`.
- **Import:**
    - File Reader API parses uploaded JSON.
    - Merges new entries with existing data via backend API.

---

## Slide 12: Backend Logic (Python)
- **Custom Server:** Extended `SimpleHTTPRequestHandler`.
- **API Endpoints:**
    - `GET /api/reflections`: Returns JSON data.
    - `POST /api/save_reflection`: Appends new entry.
    - `POST /api/delete_reflection`: Removes entry by ID.
- **CORS Support:** Headers enabled (`Access-Control-Allow-Origin`) for development flexibility.

---

## Slide 13: UI/UX Highlights - Themes & Location
- **Dark/Light Mode:**
    - CSS Variables (`--glass-bg`, `--text-main`) toggle classes.
    - Persisted in `localStorage`.
- **Geolocation:**
    - Uses Browser Geolocation API.
    - Reverse Geocoding via OpenStreetMap (Nominatim).
    - Displays user's City/Country in sidebar.

---

## Slide 14: Week-by-Week Progress (1-6)
- **Week 1-2:** HTML Skeleton, Semantic Tagging, GitHub Setup.
- **Week 3:** CSS Styling, Flexbox Layouts, Responsive Media Queries.
- **Week 4:** JavaScript Basics, DOM Manipulation, Dynamic Content.
- **Week 5:** Advanced JS, Fetch API, JSON Data Handling.
- **Week 6:** PWA Setup, Manifest, Service Workers.

---

## Slide 15: Week-by-Week Progress (7-12)
- **Week 7-9:** Backend Integration (Python), Persistent Storage.
- **Week 10:** Offline Storage (IndexedDB), Sync Logic.
- **Week 11:** UI Refinement (Glassmorphism), Animations.
- **Week 12:** Final Polish, Testing, Documentation, Deployment Prep.

---

## Slide 16: Challenges & Solutions
- **Challenge:** Handling file paths in Python server across different OS/directories.
    - *Solution:* Used dynamic `os.path.dirname` resolution.
- **Challenge:** CSS "Glassmorphism" support on older browsers.
    - *Solution:* Added standard fallback colors.
- **Challenge:** Syncing duplicate data.
    - *Solution:* Unique ID generation (Timestamp) for every entry.

---

## Slide 17: Testing & Verification
- **Lighthouse Audit:** Scored high on PWA, Accessibility, and Best Practices.
- **Device Testing:** Verified on Chrome DevTools (Mobile/Tablet/Desktop).
- **Offline Test:** Disabled Network -> Added Entry -> Re-enabled Network -> Verified Sync.

---

## Slide 18: Future Scope
- **User Authentication:** Multi-user support with Login/Signup.
- **Cloud Database:** Migrate from JSON file to SQLite/PostgreSQL.
- **Push Notifications:** Reminders to journal daily.
- **Search Optimization:** Full-text search for reflection content.

---

## Slide 19: Conclusion
- The **Learning Journal PWA** successfully meets the criteria of a modern, responsive, and offline-capable web application.
- It demonstrates proficiency in full-stack concepts: Frontend (HTML/CSS/JS), Backend (Python API), and System Architecture (PWA/Offline).

---

## Slide 20: Q&A
- Thank you for your time.
- Questions?
