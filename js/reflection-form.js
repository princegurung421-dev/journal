(function() {
  'use strict';

  const form = document.getElementById('reflection-form');
  const toggleFormBtn = document.getElementById('toggle-form-btn');
  const cancelFormBtn = document.getElementById('cancel-form-btn');
  const formContainer = document.getElementById('reflection-form-container');
  const addLearningBtn = document.getElementById('add-learning-btn');
  const learningsContainer = document.getElementById('learnings-container');
  const contentTextarea = document.getElementById('reflection-content');
  const charCounter = document.getElementById('content-char-count');
  const formMessage = document.getElementById('form-message');

  if (!form) return; // Only run on reflections page

  // Toggle form visibility
  function toggleForm(show) {
    if (show) {
      formContainer.style.display = 'block';
      toggleFormBtn.style.display = 'none';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      formContainer.style.display = 'none';
      toggleFormBtn.style.display = 'flex';
      form.reset();
      // Reset learnings to just one input
      learningsContainer.innerHTML = `
        <div class="learning-input-group">
          <input type="text" class="learning-input" placeholder="Add a key learning..." maxlength="150">
          <button type="button" class="remove-learning-btn" style="display: none;">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      updateCharCounter();
      hideMessage();
    }
  }

  // Show/hide form
  if (toggleFormBtn) {
    toggleFormBtn.addEventListener('click', () => toggleForm(true));
  }

  if (cancelFormBtn) {
    cancelFormBtn.addEventListener('click', () => toggleForm(false));
  }

  // Character counter
  function updateCharCounter() {
    if (contentTextarea && charCounter) {
      const count = contentTextarea.value.length;
      charCounter.textContent = count;
    }
  }

  if (contentTextarea) {
    contentTextarea.addEventListener('input', updateCharCounter);
  }

  // Add learning input
  if (addLearningBtn) {
    addLearningBtn.addEventListener('click', function() {
      const newInput = document.createElement('div');
      newInput.className = 'learning-input-group';
      newInput.innerHTML = `
        <input type="text" class="learning-input" placeholder="Add a key learning..." maxlength="150">
        <button type="button" class="remove-learning-btn">
          <i class="fas fa-times"></i>
        </button>
      `;
      learningsContainer.appendChild(newInput);
      
      // Add remove functionality
      const removeBtn = newInput.querySelector('.remove-learning-btn');
      removeBtn.addEventListener('click', function() {
        newInput.remove();
      });
      
      // Focus new input
      newInput.querySelector('.learning-input').focus();
    });
  }

  // Show message
  function showMessage(text, type = 'success') {
    if (formMessage) {
      formMessage.textContent = text;
      formMessage.className = `form-message ${type}`;
      formMessage.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        hideMessage();
      }, 5000);
    }
  }

  function hideMessage() {
    if (formMessage) {
      formMessage.style.display = 'none';
    }
  }

  // Form submission
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Collect form data
      const title = document.getElementById('reflection-title').value.trim();
      const category = document.getElementById('reflection-category').value;
      const content = document.getElementById('reflection-content').value.trim();
      
      // Collect learnings
      const learningInputs = document.querySelectorAll('.learning-input');
      const learnings = Array.from(learningInputs)
        .map(input => input.value.trim())
        .filter(value => value.length > 0);
      
      // Validate
      if (!title || !content) {
        showMessage('Please fill in all required fields!', 'error');
        return;
      }

      // Create reflection object
      const now = new Date();
      const reflection = {
        id: now.getTime().toString(),
        title: title,
        content: content,
        category: category,
        learnings: learnings,
        date: now.toISOString().split('T')[0],
        timestamp: now.toISOString(),
        formatted_date: now.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      try {
        // Save to localStorage as well for immediate feedback
        const existingReflections = await loadReflectionsFromFile();
        existingReflections.unshift(reflection);
        
        // Try to save to file via a save endpoint
        const saved = await saveReflectionToFile(reflection);
        
        if (saved) {
          showMessage('✅ Reflection saved successfully!', 'success');
          
          // Reset form
          setTimeout(() => {
            toggleForm(false);
            // Reload reflections
            if (window.reflectionsModule && window.reflectionsModule.reload) {
              window.reflectionsModule.reload();
            } else {
              location.reload();
            }
          }, 1500);
        } else {
          // Fallback: save to localStorage only
          localStorage.setItem('pj_reflections_temp', JSON.stringify(existingReflections));
          showMessage('⚠️ Saved locally. Use Python script to persist permanently.', 'warning');
          
          setTimeout(() => {
            toggleForm(false);
            displayLocalReflections(existingReflections);
          }, 2000);
        }
      } catch (error) {
        console.error('Error saving reflection:', error);
        showMessage('❌ Error saving reflection. Please try again.', 'error');
      }
    });
  }

  // Load reflections from file
  async function loadReflectionsFromFile() {
    try {
      const response = await fetch('backend/reflections.json?t=' + Date.now());
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error loading reflections:', error);
    }
    return [];
  }

  // Save reflection to file
  async function saveReflectionToFile(reflection) {
    try {
      // Try to use a save endpoint (this would require a backend server)
      const response = await fetch('backend/save_reflection.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reflection)
      });
      
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error('No backend save endpoint available:', error);
    }
    
    // Fallback: provide download option
    return false;
  }

  // Display reflections from localStorage (fallback)
  function displayLocalReflections(reflections) {
    const container = document.getElementById('dynamic-reflections');
    if (!container) return;

    if (reflections.length === 0) {
      container.innerHTML = `
        <div class="no-reflections">
          <i class="fas fa-inbox"></i>
          <p>No reflections yet. Click "Add New Reflection" to create your first one!</p>
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

    // Attach accordion listeners
    const headers = container.querySelectorAll('.journal-header');
    headers.forEach(header => {
      header.addEventListener('click', function() {
        const card = this.closest('.journal-card');
        card.classList.toggle('active');
      });
    });
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Check for temp reflections on load
  function checkTempReflections() {
    const temp = localStorage.getItem('pj_reflections_temp');
    if (temp) {
      try {
        const reflections = JSON.parse(temp);
        displayLocalReflections(reflections);
        
        // Show info message
        const info = document.createElement('div');
        document.querySelector('.reflections-section').prepend(info);
      } catch (error) {
        console.error('Error parsing temp reflections:', error);
      }
    }
  }

  // Initialize
  if (document.getElementById('reflection-form')) {
    checkTempReflections();
  }
})();
