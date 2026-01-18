/**
 * Learning Journal Offline Database
 * Handles storing reflections when offline and synchronizing when online.
 */

const DB_NAME = 'learning-journal-db';
const DB_VERSION = 1;
const STORE_NAME = 'offline-entries';

const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = event => {
        console.error('Database error:', event.target.error);
        reject('Error opening database');
    };

    request.onsuccess = event => {
        resolve(event.target.result);
    };

    request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
    };
});

export const db = {
    async saveEntry(entry) {
        const database = await dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Add timestamp if not present
            entry.createdAt = new Date().toISOString();
            entry.synced = false;

            const request = store.add(entry);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getPendingEntries() {
        const database = await dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async deleteEntry(id) {
        const database = await dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async clearAll() {
        const database = await dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
