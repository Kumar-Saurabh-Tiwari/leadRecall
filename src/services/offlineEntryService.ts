import { Entry, UserRole } from '@/types';
import { entryService } from './entryService';
import { indexedDBService } from './indexedDBService';
import { syncService } from './syncService';

/**
 * Offline-first wrapper for entry service
 * - Always reads from IndexedDB first for instant loading
 * - When online, fetches from API and updates IndexedDB
 * - When offline, queues operations for later sync
 */
class OfflineEntryService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    await indexedDBService.init();
    this.isInitialized = true;
  }

  /**
   * Get all entries from IndexedDB (instant, works offline)
   */
  async getAllLocal(): Promise<Entry[]> {
    await this.initialize();
    return indexedDBService.getAllEntries();
  }

  /**
   * Fetch entries from API and update IndexedDB cache
   * Falls back to IndexedDB if offline
   */
  async fetchAndCacheEntries(userEmail: string, userRole: UserRole): Promise<Entry[]> {
    await this.initialize();

    // Always return local data first for instant loading
    const localEntries = await indexedDBService.getAllEntries();

    // If offline, return local data
    if (!syncService.getOnlineStatus()) {
      console.log('Offline: returning cached entries');
      return localEntries;
    }

    // If online, fetch from API and update cache
    try {
      let apiResponse;
      if (userRole === 'exhibitor') {
        apiResponse = await entryService.getExhibitorData(userEmail);
      } else {
        apiResponse = await entryService.getAttendeeData(userEmail);
      }

      const dataArray = apiResponse?.data || apiResponse;
      if (dataArray && Array.isArray(dataArray)) {
        const transformedEntries: Entry[] = dataArray.map((item: any) => {
          const validEvent = item.oContactData?.sEventTitles?.find((evt: any) => evt.sTitle && evt.sTitle.trim());
          const linkedinProfile = item.oContactData?.profiles?.find((prof: any) => prof.sProfileLink && prof.sProfileLink !== 'N/A');
          
          return {
            id: item._id || item.id || crypto.randomUUID(),
            name: item.oContactData ? 
              `${item.oContactData.sFirstName || ''} ${item.oContactData.sLastName || ''}`.trim() : 
              'Unknown',
            company: item.oContactData?.sCompany || 'Unknown Company',
            event: validEvent?.sTitle || 'Unknown Event',
            notes: item.oContactData?.sEntryNotes?.[0] || '',
            type: userRole === 'exhibitor' ? 'attendee' : 'exhibitor',
            createdAt: item.dCreatedDate ? new Date(item.dCreatedDate) : new Date(),
            email: item.oContactData?.sEmail?.[0]?.Email || undefined,
            phone: item.oContactData?.contacts?.[0]?.sContactNumber || undefined,
            linkedin: linkedinProfile?.sProfileLink || undefined,
            profileUrl: undefined,
            image: undefined
          };
        });

        // Update IndexedDB cache
        await indexedDBService.clearEntries();
        await indexedDBService.saveEntries(transformedEntries);
        
        return transformedEntries;
      }

      return localEntries;
    } catch (error) {
      console.error('Failed to fetch entries from API, using cached data:', error);
      return localEntries;
    }
  }

  /**
   * Add a new entry
   * - Saves to IndexedDB immediately
   * - If online, syncs to API
   * - If offline, queues for later sync
   */
  async addEntry(entry: Omit<Entry, 'id' | 'createdAt'>, apiData: any): Promise<Entry> {
    await this.initialize();

    const newEntry: Entry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Save to IndexedDB first (works offline)
    await indexedDBService.saveEntry(newEntry);

    // Sync to API if online, otherwise queue
    if (syncService.getOnlineStatus()) {
      try {
        let response;
        if (apiData.entryType === 'exhibitor') {
          response = await entryService.addNewExhibitorData(apiData);
        } else {
          response = await entryService.addNewAttendeeData(apiData);
        }

        // Update the entry with the server-generated ID if available
        if (response?.data?._id) {
          newEntry.id = response.data._id;
          await indexedDBService.saveEntry(newEntry);
        }
      } catch (error) {
        console.error('Failed to sync entry to API, will retry later:', error);
        // Queue for later sync
        await indexedDBService.addToSyncQueue({
          type: 'entry',
          operation: 'create',
          data: { ...newEntry, apiData, type: entry.type }
        });
      }
    } else {
      // Offline: queue for later sync
      await indexedDBService.addToSyncQueue({
        type: 'entry',
        operation: 'create',
        data: { ...newEntry, apiData, type: entry.type }
      });
    }

    return newEntry;
  }

  /**
   * Update an existing entry
   */
  async updateEntry(id: string, updates: Partial<Entry>, apiData: any, userEmail: string): Promise<Entry | undefined> {
    await this.initialize();

    const existingEntry = await indexedDBService.getEntryById(id);
    if (!existingEntry) return undefined;

    const updatedEntry = { ...existingEntry, ...updates };
    
    // Update IndexedDB first
    await indexedDBService.saveEntry(updatedEntry);

    // Sync to API if online, otherwise queue
    if (syncService.getOnlineStatus()) {
      try {
        if (updatedEntry.type === 'exhibitor') {
          await entryService.updateExhibitorDataByID(id, apiData);
        } else {
          await entryService.updateAttendeeDataByID(id, apiData);
        }
      } catch (error) {
        console.error('Failed to sync update to API, will retry later:', error);
        await indexedDBService.addToSyncQueue({
          type: 'entry',
          operation: 'update',
          data: { id, apiData, type: updatedEntry.type, email: userEmail }
        });
      }
    } else {
      await indexedDBService.addToSyncQueue({
        type: 'entry',
        operation: 'update',
        data: { id, apiData, type: updatedEntry.type, email: userEmail }
      });
    }

    return updatedEntry;
  }

  /**
   * Delete an entry
   */
  async deleteEntry(id: string, entryType: UserRole, userEmail: string): Promise<boolean> {
    await this.initialize();

    const entry = await indexedDBService.getEntryById(id);
    if (!entry) return false;

    // Delete from IndexedDB first
    await indexedDBService.deleteEntry(id);

    // Sync to API if online, otherwise queue
    if (syncService.getOnlineStatus()) {
      try {
        if (entryType === 'exhibitor') {
          await entryService.deleteExhibitor(id, userEmail);
        } else {
          await entryService.deleteAttendee(id, userEmail);
        }
      } catch (error) {
        console.error('Failed to sync delete to API, will retry later:', error);
        await indexedDBService.addToSyncQueue({
          type: 'entry',
          operation: 'delete',
          data: { id, type: entryType, email: userEmail }
        });
      }
    } else {
      await indexedDBService.addToSyncQueue({
        type: 'entry',
        operation: 'delete',
        data: { id, type: entryType, email: userEmail }
      });
    }

    return true;
  }

  /**
   * Get entry by ID (from IndexedDB)
   */
  async getById(id: string): Promise<Entry | undefined> {
    await this.initialize();
    return indexedDBService.getEntryById(id);
  }

  /**
   * Clear all entries (useful for logout)
   */
  async clearAll(): Promise<void> {
    await this.initialize();
    await indexedDBService.clearEntries();
  }
}

export const offlineEntryService = new OfflineEntryService();
