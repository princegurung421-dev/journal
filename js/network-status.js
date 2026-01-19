// Network Status & Sync Logic
// This script runs on all pages to provide global connectivity feedback.

import { db } from './db.js';

function showToast(message, type = 'online') {
    // Remove existing toast if any
    const existing = document.querySelector('.network-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `network-toast ${type}`;
    const icon = type === 'offline' ? 'fa-wifi-slash' : 'fa-wifi';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// Sync offline entries to backend
async function syncOfflineEntries() {
    try {
        const offlineEntries = await db.getPendingEntries();
        if (offlineEntries.length === 0) return;

        showToast(`Syncing ${offlineEntries.length} pending entries...`, 'online');

        for (const entry of offlineEntries) {
            // Remove DB-specific ID before sending to server (server generates new one)
            const { id, isOffline, synced, ...entryData } = entry;

            const response = await fetch('/api/save_reflection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData)
            });

            if (response.ok) {
                await db.deleteEntry(id);
            }
        }

        showToast('Back online - Synced with DB', 'online');

        // If we are on the reflections page, verify if we can reload the list
        if (window.reflectionsModule && typeof window.reflectionsModule.reload === 'function') {
            window.reflectionsModule.reload();
        }
    } catch (error) {
        console.error('Sync failed:', error);
        showToast('Sync failed. Will retry later.', 'offline');
    }
}

// Event Listeners for Network Status
window.addEventListener('online', () => {
    showToast('Back Online', 'online');
    syncOfflineEntries();
});

window.addEventListener('offline', () => {
    showToast('No Network - Offline Mode', 'offline');
});

// Check on load - if offline, show toast briefly
if (!navigator.onLine) {
    showToast('No Network - Offline Mode', 'offline');
} else {
    // Try sync on load
    syncOfflineEntries();
}
