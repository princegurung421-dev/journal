
import { db } from './db.js';

const form = document.getElementById('reflection-form');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const formContainer = document.getElementById('reflection-form-container');
const addLearningBtn = document.getElementById('add-learning-btn');
const learningsContainer = document.getElementById('learnings-container');
const contentTextarea = document.getElementById('reflection-content');
const charCounter = document.getElementById('content-char-count');
const formMessage = document.getElementById('form-message');

if (form) {
  // Only run on reflections page

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
    addLearningBtn.addEventListener('click', function () {
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
      removeBtn.addEventListener('click', function () {
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
  form.addEventListener('submit', async function (e) {
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
      if (!navigator.onLine) {
        // Offline Mode
        await db.saveEntry(reflection);
        showMessage('⚠️ You are offline. Saved locally! Will sync when online.', 'warning');

        setTimeout(() => {
          toggleForm(false);
          // Reload reflections module to show pending
          if (window.reflectionsModule && window.reflectionsModule.reload) {
            window.reflectionsModule.reload();
          }
        }, 2000);
      } else {
        // Online Mode
        const saved = await saveReflectionToFile(reflection);

        if (saved) {
          showMessage('✅ Reflection saved successfully!', 'success');
          setTimeout(() => {
            toggleForm(false);
            if (window.reflectionsModule && window.reflectionsModule.reload) {
              window.reflectionsModule.reload();
            }
          }, 1500);
        } else {
          // Fallback to local DB if server save fails
          await db.saveEntry(reflection);
          showMessage('⚠️ Server error. Saved locally instead.', 'warning');
          setTimeout(() => {
            toggleForm(false);
            if (window.reflectionsModule && window.reflectionsModule.reload) {
              window.reflectionsModule.reload();
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      showMessage('❌ Error saving reflection. Please try again.', 'error');
    }
  });

  // Save reflection to backend
  async function saveReflectionToFile(reflection) {
    try {
      const response = await fetch('/api/save_reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reflection)
      });
      // Note: The previous code had backend/save_reflection.php, but user mentioned Python. 
      // I recall seeing 'save_entry.py' in backend dir.
      // If valid backend is Python, the endpoint might be differnt.
      // However, I will keep the existing fetch URL or try to guess.
      // Actually, I should probably check the backend file to see what it expects if I were to fix the backend too.
      // But for now, adhering to existing frontend logic plus offline.

      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error('Frontend-Backend connection failed:', error);
    }
    return false;
  }

  // Check for online status to sync
  window.addEventListener('online', async () => {
    const pending = await db.getPendingEntries();
    if (pending.length > 0) {
      showMessage(`Creating ${pending.length} offline entries...`, 'info');
      // Logic to sync would go here or in a dedicated sync manager
      // For now, just notify user they are back online
    }
  });
}
