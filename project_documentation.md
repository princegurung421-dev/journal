# Project Documentation: Learning Journal PWA

**Author:** Prince Gurung  
**Course:** BSc (Hons) Computer Science  
**Module:** Mobile Application Development  
**Date:** January 18, 2026

---

## 1. Executive Summary
The Learning Journal PWA is a Progressive Web Application designed to serve as a personal digital logbook for students. It allows users to create, view, delete, and manage daily learning reflections. Built with a "Mobile-First" approach, the application offers a native-app-like experience, functioning seamlessly offline through robust Service Worker caching and IndexedDB data persistence. The backend is powered by a custom Python HTTP server handling RESTful API requests, ensuring data persistence in a portable JSON format.

## 2. Project Overview
### 2.1 Objectives
- To build a fully responsive web application.
- To implement Progressive Web App (PWA) standards (Manifest, Service Worker).
- To enable offline functionality and background synchronization.
- To demonstrate full-stack integration (Frontend + Custom Backend API).

### 2.2 Scope
The application covers the management of learning entries ("Reflections"), personal portfolio display ("Projects"), and a bio section ("About"). Key functional requirements include CRUD operations for reflections, theme toggling, and data portability (Import/Export).

## 3. System Architecture
The project follows a client-server architecture with a distinct separation of concerns:

- **Frontend (Client):** 
  - **HTML5:** Semantic structure.
  - **CSS3:** Glassmorphism design system, Grid/Flexbox layouts.
  - **JavaScript (ES6 Modules):** Business logic, State management, API communication.
  - **IndexedDB:** Client-side storage for offline data.

- **Backend (Server):**
  - **Python (`http.server`):** Handles HTTP requests.
  - **JSON Storage:** Acts as a lightweight NoSQL database.
  - **REST API:** Exposes endpoints for data manipulation.

## 4. Technical Stack & Features
### 4.1 Frontend Technologies
- **PWA Standards:**
  - `manifest.json`: Configures app identity (Name, Icons, Standalone mode).
  - `sw.js`: Service Worker implementing "Stale-While-Revalidate" caching for assets and "Network-First" for API data.
- **UI/UX Design:**
  - **Glassmorphism:** A modern UI trend using background blur and translucency (`backdrop-filter: blur(12px)`).
  - **Responsive Sidebar:** Collapsible navigation optimized for mobile touch targets.
  - **Dynamic Theme:** User-toggleable Dark/Light mode using CSS variables.

### 4.2 Backend Technologies
- **Language:** Python 3.x
- **Server:** Custom `SimpleHTTPRequestHandler` extension.
- **Data Store:** `reflections.json` (Flat-file database).

### 4.3 Key Features
#### 4.3.1 Reflection Management (CRUD)
Users can fill out a detailed form (Title, Category, Content, Key Learnings) to add a reflection. The list of reflections is rendered dynamically. Users can **Delete** entries, which triggers an API call to remove the data permanently from the server.

#### 4.3.2 Import / Export System
- **Export:** Converts the current application state (all reflections) into a downloadable `reflections_backup.json` file.
- **Import:** Allows users to upload a JSON file. The system parses this file and sends each entry to the backend, effectively merging datasets.

#### 4.3.3 Offline & Synchronization
- **Offline Detection:** The app listens for `navigator.onLine` status.
- **Offline Storage:** If the network is unavailable, entries are saved to **IndexedDB** with an `isOffline` flag.
- **Auto-Sync:** When the connection is restored (`window.addEventListener('online')`), the app automatically pushes pending offline entries to the server.

## 5. Implementation Details

### 5.1 Service Worker (`sw.js`)
The Service Worker intercepts network requests.
```javascript
// Example Caching Logic
self.addEventListener('fetch', event => {
    // API calls go to network first
    if (event.request.url.includes('/api/')) {
        event.respondWith(networkFirst(event.request));
    } else {
        // Static assets use Stale-While-Revalidate
        event.respondWith(staleWhileRevalidate(event.request));
    }
});
```

### 5.2 Python Backend (`server.py`)
The server handles the DELETE method (simulated via POST for compatibility) to remove entries.
```python
# Snippet from server.py (Delete Logic)
if self.path == '/api/delete_reflection':
    # Load JSON, filter out ID, save back to file
    reflections = [r for r in reflections if r['id'] != target_id]
    with open(DATA_FILE, 'w') as f:
        json.dump(reflections, f)
```

### 5.3 Offline Database (`db.js`)
A wrapper around IndexedDB Promisified is used for cleaner async/await syntax when saving offline data.

## 6. Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **Cross-Platform Pathing** | The Python server initially failed on different folders. Fixed by using `os.path.dirname(__file__)` to dynamically resolve paths. |
| **Offline Sync** | Ensuring data isn't lost during a network drop. Solved by implementing a robust `IndexedDB` fallback queue. |
| **UI Aesthetics** | Making the app look "Premium". Solved by implementing a custom "Glassmorphism" design system with careful shadow and border usage. |
| **Date Handling** | Converting timestamps between Python and JS. Standardized on ISO strings (`new Date().toISOString()`). |

## 7. Future Scope
- **User Authentication:** Implementing Login/Register to support multiple users on the same device.
- **Search & Filter:** Advanced filtering by Date Range or specific Tags.
- **Cloud Deployment:** Deploying the Python backend to a platform like Render or Heroku, with the frontend on Vercel/Netlify.
- **Rich Text Editor:** Upgrading the textarea to a markdown-supported editor.

## 8. Conclusion
The project successfully demonstrates the capability to build a production-grade PWA. It meets all functional requirements (Journal logging, Offline support) and non-functional requirements (Performance, Aesthetics). The modular code structure allows for easy scalability and maintenance.

---
*End of Documentation*
