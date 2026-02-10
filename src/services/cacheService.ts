/**
 * Cache Service - Manages IndexedDB for client-side caching
 * Allows fast data retrieval without affecting network calls
 */

const DB_NAME = 'LeadRecall';
const DB_VERSION = 1;

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

class CacheService {
  private db: IDBDatabase | null = null;
  private initialized = false;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.initialized && this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('entries')) {
          db.createObjectStore('entries', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Set a cache entry
   */
  async set<T>(storeName: string, key: string, data: T, ttl?: number): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
      };

      const request = store.put(entry);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get a cache entry
   */
  async get<T>(storeName: string, key: string): Promise<T | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache has expired
        if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
          // Cache expired, delete it
          this.delete(storeName, key).catch(console.error);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };
    });
  }

  /**
   * Delete a cache entry
   */
  async delete(storeName: string, key: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear all entries in a store
   */
  async clear(storeName: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Check if a cache entry exists and is valid
   */
  async has(storeName: string, key: string): Promise<boolean> {
    const data = await this.get(storeName, key);
    return data !== null;
  }

  /**
   * Get all entries in a store
   */
  async getAll<T>(storeName: string): Promise<{ key: string; data: T }[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entries = (request.result as CacheEntry<T>[]).map(entry => ({
          key: entry.key,
          data: entry.data,
        }));
        resolve(entries);
      };
    });
  }
}

export const cacheService = new CacheService();
