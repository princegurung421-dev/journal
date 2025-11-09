# Learning Journal PWA - Enhanced Version

## New Features Added

### 🌓 Dark/Light Mode Toggle
- Click the moon/sun icon to switch between dark and light themes
- Your preference is saved in localStorage and persists across sessions
- Smooth transitions between themes
- Desktop: Toggle in the navbar
- Mobile: Floating button in bottom-right corner

### 📱 Vertical Collapsible Navbar
- **Desktop (768px+)**: Vertical sidebar with collapsible functionality
  - Collapsed: Shows only icons (70px wide)
  - Expanded: Shows icons + text (220px wide)
  - Click the arrow button to toggle
  - State persists in localStorage
- **Mobile (<768px)**: Horizontal bottom navbar with icons and labels
- Smooth animations and transitions

### 🎴 Accordion-Style Journal Entries
- Journal entries are now collapsible cards
- Click on any entry header to expand/collapse
- First entry is open by default
- Multiple entries can be open simultaneously
- Smooth expand/collapse animations

### 👤 Profile Image Integration
- About page now features a circular profile image
- Responsive design: 200px on desktop, 150px on mobile
- **Important**: Add your profile image as `images/profile.jpg`

## Setup Instructions

1. **Add Your Profile Image**
   - Save your profile photo as `profile.jpg` in the `images/` folder
   - Recommended: Square image, at least 400x400 pixels
   - The CSS will automatically make it circular

2. **Open in Browser**
   - Open any HTML file in your browser
   - Try the theme toggle (moon/sun icon)
   - On desktop, try expanding/collapsing the navbar (arrow button)
   - Click on journal entry headers to expand/collapse them

## Features Overview

### Navigation
- 🏠 Home - Introduction and overview
- 📔 Journal - Weekly learning entries (with accordion)
- 💼 Projects - Portfolio showcase
- 👤 About - Personal profile with photo

### Interactive Elements
- Real-time clock (shows in expanded navbar on desktop)
- Location display (geolocation API)
- YouTube video player integration
- Accordion journal entries
- Collapsible navigation

### Responsive Breakpoints
- Mobile: < 768px (horizontal navbar)
- Tablet: 768px - 1023px (2-column grid)
- Desktop: 1024px+ (3-column grid, vertical navbar)

## Technologies Used
- HTML5
- CSS3 (CSS Variables, Flexbox, Grid, Transitions)
- JavaScript (ES6+)
- LocalStorage API
- Geolocation API
- YouTube IFrame API

## Color Schemes

### Light Mode
- Primary: #008080 (Teal)
- Background: #ecf0f1 (Light Gray)
- Text: #34495e (Dark Blue)
- Cards: #ffffff (White)

### Dark Mode
- Primary: #00d4d4 (Bright Teal)
- Background: #16213e (Dark Blue)
- Text: #e0e0e0 (Light Gray)
- Cards: #1f2937 (Dark Gray)

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- localStorage API for theme persistence
- Geolocation API (optional, with fallback)

Enjoy your enhanced PWA! 🚀
