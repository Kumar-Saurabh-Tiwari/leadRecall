import { indexedDBService, SyncQueueItem } from './indexedDBService';
import { entryService } from './entryService';
import { eventService } from './eventService';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

class SyncService {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncListeners: Set<(status: SyncStatus, message?: string) => void> = new Set();
  private statusListeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    this.initializeNetworkListeners();
    this.checkOnlineStatus();
  }

  private initializeNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('Network: Online');
      this.isOnline = true;
      this.notifyStatusListeners(true);
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      console.log('Network: Offline');
      this.isOnline = false;
      this.notifyStatusListeners(false);
    });
  }

  private async checkOnlineStatus() {
    // Double-check online status with a ping
    if (navigator.onLine) {
      try {
        const response = await fetch('/manifest.json', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        this.isOnline = response.ok;
      } catch {
        this.isOnline = false;
      }
    } else {
      this.isOnline = false;
    }
    this.notifyStatusListeners(this.isOnline);
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public onStatusChange(callback: (isOnline: boolean) => void): () => void {
    this.statusListeners.add(callback);
    // Immediately call with current status
    callback(this.isOnline);
    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private notifyStatusListeners(isOnline: boolean) {
    this.statusListeners.forEach(listener => listener(isOnline));
  }

  public onSyncStatusChange(callback: (status: SyncStatus, message?: string) => void): () => void {
    this.syncListeners.add(callback);
    return () => {
      this.syncListeners.delete(callback);
    };
  }

  private notifySyncListeners(status: SyncStatus, message?: string) {
    this.syncListeners.forEach(listener => listener(status, message));
  }

  public async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      console.log('Sync skipped: offline or already syncing');
      return;
    }

    this.isSyncing = true;
    this.notifySyncListeners('syncing', 'Syncing offline data...');

    try {
      const queue = await indexedDBService.getSyncQueue();
      
      if (queue.length === 0) {
        console.log('No items to sync');
        this.notifySyncListeners('idle');
        this.isSyncing = false;
        return;
      }

      console.log(`Syncing ${queue.length} items...`);
      
      // Sort by timestamp to maintain order
      const sortedQueue = queue.sort((a, b) => a.timestamp - b.timestamp);

      let successCount = 0;
      let failCount = 0;

      for (const item of sortedQueue) {
        try {
          await this.processSyncItem(item);
          await indexedDBService.removeFromSyncQueue(item.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          failCount++;
          
          // Retry logic: increment retry count
          if (item.retryCount < 3) {
            await indexedDBService.updateSyncQueueItem({
              ...item,
              retryCount: item.retryCount + 1
            });
          } else {
            // Max retries reached, remove from queue
            console.error(`Max retries reached for item ${item.id}, removing from queue`);
            await indexedDBService.removeFromSyncQueue(item.id);
          }
        }
      }

      if (failCount === 0) {
        this.notifySyncListeners('success', `Successfully synced ${successCount} item(s)`);
      } else {
        this.notifySyncListeners('error', `Synced ${successCount} item(s), ${failCount} failed`);
      }

      console.log(`Sync complete: ${successCount} success, ${failCount} failed`);
    } catch (error) {
      console.error('Sync error:', error);
      this.notifySyncListeners('error', 'Sync failed');
    } finally {
      this.isSyncing = false;
      // Return to idle after a delay
      setTimeout(() => {
        if (!this.isSyncing) {
          this.notifySyncListeners('idle');
        }
      }, 3000);
    }
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    console.log(`Processing sync item: ${item.type} - ${item.operation}`, item);

    if (item.type === 'entry') {
      await this.syncEntry(item);
    } else if (item.type === 'event') {
      await this.syncEvent(item);
    }
  }

  private async syncEntry(item: SyncQueueItem): Promise<void> {
    const { operation, data } = item;

    switch (operation) {
      case 'create':
        if (data.apiData.entryType === 'exhibitor') {
          await entryService.addNewExhibitorData(data.apiData);
        } else {
          await entryService.addNewAttendeeData(data.apiData);
        }
        break;

      case 'update':
        if (data.type === 'exhibitor') {
          await entryService.updateExhibitorDataByID(data.id, data.apiData);
        } else {
          await entryService.updateAttendeeDataByID(data.id, data.apiData);
        }
        break;

      case 'delete':
        if (data.type === 'exhibitor') {
          await entryService.deleteExhibitor(data.id, data.email);
        } else {
          await entryService.deleteAttendee(data.id, data.email);
        }
        break;
    }
  }

  private async syncEvent(item: SyncQueueItem): Promise<void> {
    const { operation, data } = item;

    switch (operation) {
      case 'create':
        await eventService.addNewLeadEvent(data);
        break;

      // Add update and delete operations when they exist in your API
      case 'update':
        console.log('Event update not yet implemented in API');
        break;

      case 'delete':
        console.log('Event delete not yet implemented in API');
        break;
    }
  }

  public async manualSync(): Promise<void> {
    await this.checkOnlineStatus();
    if (this.isOnline) {
      await this.syncOfflineData();
    } else {
      this.notifySyncListeners('error', 'Cannot sync: Device is offline');
    }
  }

  public getSyncStatus(): { isOnline: boolean; isSyncing: boolean } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing
    };
  }
}

export const syncService = new SyncService();
