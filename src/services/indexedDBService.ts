import { Entry, Event } from '@/types';

const DB_NAME = 'LeadRecallDB';
const DB_VERSION = 1;

// Store names
const ENTRIES_STORE = 'entries';
const EVENTS_STORE = 'events';
const SYNC_QUEUE_STORE = 'syncQueue';

export interface SyncQueueItem {
  id: string;
  type: 'entry' | 'event';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create entries store
        if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
          const entryStore = db.createObjectStore(ENTRIES_STORE, { keyPath: 'id' });
          entryStore.createIndex('createdAt', 'createdAt', { unique: false });
          entryStore.createIndex('type', 'type', { unique: false });
          entryStore.createIndex('event', 'event', { unique: false });
        }

        // Create events store
        if (!db.objectStoreNames.contains(EVENTS_STORE)) {
          const eventStore = db.createObjectStore(EVENTS_STORE, { keyPath: 'id' });
          eventStore.createIndex('date', 'date', { unique: false });
          eventStore.createIndex('role', 'role', { unique: false });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  // Entry operations
  async getAllEntries(): Promise<Entry[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, 'readonly');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt)
        }));
        resolve(entries);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getEntryById(id: string): Promise<Entry | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, 'readonly');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve({
            ...request.result,
            createdAt: new Date(request.result.createdAt)
          });
        } else {
          resolve(undefined);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveEntry(entry: Entry): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, 'readwrite');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveEntries(entries: Entry[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, 'readwrite');
      const store = transaction.objectStore(ENTRIES_STORE);

      let completed = 0;
      const total = entries.length;

      if (total === 0) {
        resolve();
        return;
      }

      entries.forEach(entry => {
        const request = store.put(entry);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async deleteEntry(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, 'readwrite');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearEntries(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ENTRIES_STORE, 'readwrite');
      const store = transaction.objectStore(ENTRIES_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Event operations
  async getAllEvents(): Promise<Event[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVENTS_STORE, 'readonly');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const events = request.result.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined
        }));
        resolve(events);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVENTS_STORE, 'readonly');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve({
            ...request.result,
            date: new Date(request.result.date),
            endDate: request.result.endDate ? new Date(request.result.endDate) : undefined
          });
        } else {
          resolve(undefined);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveEvent(event: Event): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVENTS_STORE, 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.put(event);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveEvents(events: Event[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVENTS_STORE, 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);

      let completed = 0;
      const total = events.length;

      if (total === 0) {
        resolve();
        return;
      }

      events.forEach(event => {
        const request = store.put(event);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async deleteEvent(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVENTS_STORE, 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearEvents(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(EVENTS_STORE, 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync queue operations
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const db = await this.getDB();
    const syncItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.add(syncItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_QUEUE_STORE, 'readonly');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncQueue(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();
