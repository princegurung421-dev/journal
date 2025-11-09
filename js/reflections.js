(function() {
  'use strict';

  const REFLECTIONS_URL = 'backend/reflections.json';
  let allReflections = [];
  let filterKeyword = '';

  // Load reflections from JSON
  async function loadReflections() {
    try {
      const response = await fetch(REFLECTIONS_URL + '?t=' + Date.now()); // Cache busting
      if (!response.ok) {
        throw new Error('Failed to load reflections');
      }
      const data = await response.json();
      allReflections = data;
      displayReflections(allReflections);
      updateReflectionCount(allReflections.length);
    } catch (error) {
      console.error('Error loading reflections:', error);
      showError('Could not load reflections. Make sure reflections.json exists.');
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
          <p>No reflections found. Run <code>python3 backend/save_entry.py</code> to add your first reflection!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = reflections.map((entry, index) => `
      <article class="journal-card" data-id="${entry.id}">
        <div class="journal-header">
          <div class="journal-title-section">
            <span class="week-badge reflection-badge">Reflection #${reflections.length - index}</span>
            <h2>${escapeHtml(entry.title)}</h2>
          </div>
          <button class="journal-toggle" aria-label="Toggle entry">
            <i class="fas fa-chevron-down"></i>
          </button>
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
                ${entry.learnings.map(learning => `<li>${escapeHtml(learning)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </article>
    `).join('');

    // Attach event listeners to new elements
    attachAccordionListeners();
  }

  // Attach click listeners to accordion headers
  function attachAccordionListeners() {
    const headers = document.querySelectorAll('#dynamic-reflections .journal-header');
    headers.forEach(header => {
      header.addEventListener('click', function() {
        const card = this.closest('.journal-card');
        card.classList.toggle('active');
      });
    });
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Calculate time ago
  function getTimeAgo(timestamp) {
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

  // Export reflections as JSON file
  function exportReflections() {
    const dataStr = JSON.stringify(allReflections, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reflections-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Filter reflections by keyword
  function filterReflections(keyword) {
    filterKeyword = keyword.toLowerCase().trim();
    
    if (!filterKeyword) {
      displayReflections(allReflections);
      return;
    }

    const filtered = allReflections.filter(entry => {
      return entry.title.toLowerCase().includes(filterKeyword) ||
             entry.content.toLowerCase().includes(filterKeyword) ||
             entry.category.toLowerCase().includes(filterKeyword) ||
             (entry.learnings && entry.learnings.some(l => l.toLowerCase().includes(filterKeyword)));
    });

    displayReflections(filtered);
    
    // Show filter info
    const container = document.getElementById('dynamic-reflections');
    if (container && filtered.length < allReflections.length) {
      const filterInfo = document.createElement('div');
      filterInfo.className = 'filter-info';
      filterInfo.innerHTML = `
        <i class="fas fa-filter"></i>
        Showing ${filtered.length} of ${allReflections.length} reflections
        <button class="clear-filter" onclick="document.getElementById('search-input').value=''; window.reflectionsModule.filterReflections('');">
          <i class="fas fa-times"></i> Clear filter
        </button>
      `;
      container.insertBefore(filterInfo, container.firstChild);
    }
  }

  // Import reflections from file
  function importReflections(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          allReflections = imported;
          displayReflections(allReflections);
          updateReflectionCount(allReflections.length);
          alert(`✅ Successfully imported ${imported.length} reflections!`);
        } else {
          alert('❌ Invalid JSON format. Expected an array of reflections.');
        }
      } catch (error) {
        alert('❌ Error parsing JSON file: ' + error.message);
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
    const importInput = document.getElementById('import-file-input');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          importReflections(e.target.files[0]);
        }
      });
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
    reload: loadReflections
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
