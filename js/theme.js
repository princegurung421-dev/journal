(function() {
  'use strict';

  // Theme Management
  const THEME_KEY = 'pj_theme_preference';
  
  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch (e) {
      return 'light';
    }
  }
  
  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Could not store theme preference', e);
    }
  }
  
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcons(theme);
  }
  
  function updateThemeIcons(theme) {
    const icons = document.querySelectorAll('.theme-toggle i, .theme-toggle-mobile i');
    icons.forEach(icon => {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
    const buttons = document.querySelectorAll('.theme-toggle, .theme-toggle-mobile');
    buttons.forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    setStoredTheme(newTheme);
  }
  
  // Initialize theme
  const savedTheme = getStoredTheme();
  applyTheme(savedTheme);
  
  // Navbar Management
  const NAVBAR_KEY = 'pj_navbar_state';
  
  function getNavbarState() {
    try {
      return localStorage.getItem(NAVBAR_KEY) || 'collapsed';
    } catch (e) {
      return 'collapsed';
    }
  }
  
  function setNavbarState(state) {
    try {
      localStorage.setItem(NAVBAR_KEY, state);
    } catch (e) {
      console.warn('Could not store navbar state', e);
    }
  }
  
  function applyNavbarState(state) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    if (state === 'expanded') {
      navbar.classList.add('expanded');
      document.body.classList.add('navbar-expanded');
    } else {
      navbar.classList.remove('expanded');
      document.body.classList.remove('navbar-expanded');
    }
    
    updateNavbarToggleIcon(state);
  }
  
  function updateNavbarToggleIcon(state) {
    const toggle = document.querySelector('.navbar-toggle');
    if (toggle) {
      toggle.setAttribute('aria-label', state === 'expanded' ? 'Collapse navbar' : 'Expand navbar');
    }
  }
  
  function toggleNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const isExpanded = navbar.classList.contains('expanded');
    const newState = isExpanded ? 'collapsed' : 'expanded';
    applyNavbarState(newState);
    setNavbarState(newState);
  }
  
  // Initialize navbar state (only on desktop) - Default to expanded
  if (window.innerWidth >= 768) {
    const savedState = getNavbarState();
    // If no saved state, default to expanded
    applyNavbarState(savedState || 'expanded');
    // Save expanded as default if not set
    if (!savedState) {
      setNavbarState('expanded');
    }
  }
  
  // Event listeners setup
  function setupEventListeners() {
    // Theme toggle buttons
    const themeToggles = document.querySelectorAll('.theme-toggle, .theme-toggle-mobile');
    themeToggles.forEach(toggle => {
      toggle.addEventListener('click', toggleTheme);
    });
    
    // Navbar toggle button
    const navbarToggle = document.querySelector('.navbar-toggle');
    if (navbarToggle) {
      navbarToggle.addEventListener('click', toggleNavbar);
    }
    
    // Journal accordion functionality
    const journalHeaders = document.querySelectorAll('.journal-header');
    journalHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const card = this.closest('.journal-card');
        const wasActive = card.classList.contains('active');
        
        // Optional: Close other entries (comment out if you want multiple open)
        // document.querySelectorAll('.journal-card').forEach(c => c.classList.remove('active'));
        
        if (wasActive) {
          card.classList.remove('active');
        } else {
          card.classList.add('active');
        }
      });
    });
    
    // Also handle toggle button clicks
    const journalToggles = document.querySelectorAll('.journal-toggle');
    journalToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent double-trigger from header click
      });
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
  } else {
    setupEventListeners();
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth < 768) {
      // Mobile: reset navbar
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.classList.remove('expanded');
        document.body.classList.remove('navbar-expanded');
      }
    } else {
      // Desktop: restore saved state
      const savedState = getNavbarState();
      applyNavbarState(savedState);
    }
  });
})();
