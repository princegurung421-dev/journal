
import { db } from './db.js';

const REFLECTIONS_URL = '/api/reflections';
let allReflections = [];
let filterKeyword = '';

// Load reflections from JSON and DB
async function loadReflections() {
  try {
    let backendData = [];
    try {
      const response = await fetch(REFLECTIONS_URL + '?t=' + Date.now()); // Cache busting
      if (response.ok) {
        backendData = await response.json();
      }
    } catch (e) {
      console.warn('Could not load backend reflections (might be offline)', e);
    }

    // Load offline entries
    const offlineData = await db.getPendingEntries();

    // Merge: Offline entries first (assuming they are newer or user wants to see them)
    // Add a flag to identify them
    const offlineWithFlag = offlineData.map(entry => ({ ...entry, isOffline: true }));

    allReflections = [...offlineWithFlag, ...backendData];

    displayReflections(allReflections);
    updateReflectionCount(allReflections.length);
  } catch (error) {
    console.error('Error loading reflections:', error);
    showError('Could not load reflections.');
  }
}

// Display reflections in the DOM
function displayReflections(reflections) {
  const container = document.getElementById('dynamic-reflections');
  if (!container) return;

  if (reflections.length === 0) {
    container.innerHTML = `
        <div class="no-reflections">
          <i class="fas fa-inbox"></i>
          <p>No reflections found. Add your first reflection!</p>
        </div>
      `;
    return;
  }

  container.innerHTML = reflections.map((entry, index) => `
      <article class="journal-card ${entry.isOffline ? 'offline-entry' : ''}" data-id="${entry.id}">
        <div class="journal-header">
          <div class="journal-title-section">
            <span class="week-badge reflection-badge ${entry.isOffline ? 'offline-badge' : ''}">
                ${entry.isOffline ? '<i class="fas fa-wifi-slash"></i> Offline' : `Reflection #${reflections.length - index}`}
            </span>
            <h2>${escapeHtml(entry.title)}</h2>
          </div>
          <div style="display: flex; align-items: center;">
            ${!entry.isOffline ? `
            <button class="delete-btn" title="Delete Entry" onclick="window.reflectionsModule.deleteReflection('${entry.id}')">
                <i class="fas fa-trash-alt"></i>
            </button>` : ''}
            <button class="journal-toggle" aria-label="Toggle entry">
                <i class="fas fa-chevron-down"></i>
            </button>
          </div>
        </div>
        <div class="journal-content">
          <div class="journal-meta">
            <span><i class="far fa-calendar"></i> ${entry.formatted_date}</span>
            <span><i class="fas fa-tag"></i> ${escapeHtml(entry.category)}</span>
            <span><i class="far fa-clock"></i> ${getTimeAgo(entry.timestamp)}</span>
          </div>
          <div class="reflection-text">
            ${escapeHtml(entry.content).replace(/\n/g, '<br>')}
          </div>
          ${entry.learnings && entry.learnings.length > 0 ? `
            <div class="journal-highlight">
              <h4><i class="fas fa-lightbulb"></i> Key Learnings</h4>
              <ul>
                ${entry.learnings.filter(l => l).map(learning => `<li>${escapeHtml(learning)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${entry.isOffline ? '<div class="offline-status">Pending Sync</div>' : ''}
        </div>
      </article>
    `).join('');

  attachAccordionListeners();
}

// Attach click listeners to accordion headers
function attachAccordionListeners() {
  const headers = document.querySelectorAll('#dynamic-reflections .journal-header');
  headers.forEach(header => {
    header.addEventListener('click', function (e) {
      if (e.target.closest('.delete-btn')) return; // Ignore clicks on delete button
      const card = this.closest('.journal-card');
      card.classList.toggle('active');
    });
  });
}

// ... helper functions (escapeHtml, getTimeAgo, updateReflectionCount, showError, filterReflections - unchanged) ...
// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Calculate time ago
function getTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
}

// Update reflection count
function updateReflectionCount(count) {
  const counter = document.getElementById('reflection-count');
  if (counter) {
    counter.textContent = count;
  }
}

// Show error message
function showError(message) {
  const container = document.getElementById('dynamic-reflections');
  if (container) {
    container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>${message}</p>
        </div>
      `;
  }
}

// Filter reflections by keyword
function filterReflections(keyword) {
  filterKeyword = keyword.toLowerCase().trim();

  if (!filterKeyword) {
    displayReflections(allReflections);
    return;
  }

  const filtered = allReflections.filter(entry => {
    return (entry.title && entry.title.toLowerCase().includes(filterKeyword)) ||
      (entry.content && entry.content.toLowerCase().includes(filterKeyword)) ||
      (entry.category && entry.category.toLowerCase().includes(filterKeyword)) ||
      (entry.learnings && entry.learnings.some(l => l.toLowerCase().includes(filterKeyword)));
  });

  displayReflections(filtered);
}


// Delete Reflection
async function deleteReflection(id) {
  if (!confirm('Are you sure you want to delete this reflection?')) return;

  try {
    const response = await fetch('/api/delete_reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    });

    if (response.ok) {
      loadReflections(); // Reload list
    } else {
      alert('Failed to delete reflection.');
    }
  } catch (e) {
    console.error("Delete failed", e);
    alert('Error connecting to server.');
  }
}

// Export Reflections
function exportReflections() {
  if (allReflections.length === 0) {
    alert('No reflections to export.');
    return;
  }
  const dataStr = JSON.stringify(allReflections, null, 4);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reflections_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import Reflections
function importReflections() {
  const input = document.getElementById('import-file-input');
  if (input) input.click();
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (!Array.isArray(importedData)) throw new Error('Invalid format');

      // Send each imported entry to backend
      let count = 0;
      for (const entry of importedData) {
        // Ensure ID is unique or generate new one if conflict could occur (simplified here)
        // Just posting as new for safety or using existing ID logic
        await fetch('/api/save_reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        count++;
      }
      alert(`Successfully imported ${count} reflections!`);
      loadReflections();
    } catch (err) {
      console.error(err);
      alert('Error importing file: Invalid JSON.');
    }
  };
  reader.readAsText(file);
}

// Setup event listeners
function setupEventListeners() {
  // Export button
  const exportBtn = document.getElementById('export-reflections');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportReflections);
  }

  // Import button
  const importBtn = document.getElementById('import-reflections');
  const fileInput = document.getElementById('import-file-input');
  if (importBtn && fileInput) {
    importBtn.addEventListener('click', importReflections);
    fileInput.addEventListener('change', handleFileImport);
  }

  // Search/filter input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterReflections(e.target.value);
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-reflections');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadReflections();
      refreshBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Refreshing...';
      setTimeout(() => {
        refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Refresh';
      }, 1000);
    });
  }
}

// Initialize when DOM is ready
function init() {
  if (document.getElementById('dynamic-reflections')) {
    loadReflections();
    setupEventListeners();
  }
}

// Expose functions globally for inline event handlers
window.reflectionsModule = {
  filterReflections: filterReflections,
  reload: loadReflections,
  deleteReflection: deleteReflection
};

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
