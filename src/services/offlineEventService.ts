import { Event, UserRole } from '@/types';
import { eventService } from './eventService';
import { indexedDBService } from './indexedDBService';
import { syncService } from './syncService';

/**
 * Offline-first wrapper for event service
 * - Always reads from IndexedDB first for instant loading
 * - When online, fetches from API and updates IndexedDB
 * - When offline, queues operations for later sync
 */
class OfflineEventService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    await indexedDBService.init();
    this.isInitialized = true;
  }

  /**
   * Get all events from IndexedDB (instant, works offline)
   */
  async getAllLocal(): Promise<Event[]> {
    await this.initialize();
    return indexedDBService.getAllEvents();
  }

  /**
   * Fetch events from API and update IndexedDB cache
   * Falls back to IndexedDB if offline
   */
  async fetchAndCacheEvents(adminEmail: string, userRole: UserRole): Promise<Event[]> {
    await this.initialize();

    // Always return local data first for instant loading
    const localEvents = await indexedDBService.getAllEvents();

    // If offline, return local data
    if (!syncService.getOnlineStatus()) {
      console.log('Offline: returning cached events');
      return localEvents;
    }

    // If online, fetch from API and update cache
    try {
      const response = await eventService.getLeadEvents(adminEmail);
      
      if (response && typeof response === 'object' && 'data' in response) {
        const apiData = response as { data: { events: any[] } };
        if (apiData.data?.events && Array.isArray(apiData.data.events)) {
          const mappedEvents: Event[] = apiData.data.events.map((apiEvent: any) => ({
            id: apiEvent._id,
            name: apiEvent.sName,
            date: new Date(apiEvent.dStartDate),
            endDate: apiEvent.dEndDate ? new Date(apiEvent.dEndDate) : undefined,
            location: apiEvent.sLocationPhysical,
            role: userRole,
            description: apiEvent.sShortDescription,
            image: apiEvent.sLogo,
          }));

          // Update IndexedDB cache
          await indexedDBService.clearEvents();
          await indexedDBService.saveEvents(mappedEvents);
          
          return mappedEvents;
        }
      }

      return localEvents;
    } catch (error) {
      console.error('Failed to fetch events from API, using cached data:', error);
      return localEvents;
    }
  }

  /**
   * Add a new event
   * - Saves to IndexedDB immediately
   * - If online, syncs to API
   * - If offline, queues for later sync
   */
  async addEvent(eventData: Omit<Event, 'id'>, apiData: any): Promise<Event> {
    await this.initialize();

    const newEvent: Event = {
      ...eventData,
      id: crypto.randomUUID(),
    };

    // Save to IndexedDB first (works offline)
    await indexedDBService.saveEvent(newEvent);

    // Sync to API if online, otherwise queue
    if (syncService.getOnlineStatus()) {
      try {
        const response = await eventService.addNewLeadEvent(apiData);
        
        // Update the event with the server-generated ID if available
        if (response && typeof response === 'object' && 'data' in response) {
          const responseData = response as { data: { _id?: string } };
          if (responseData.data?._id) {
            newEvent.id = responseData.data._id;
            await indexedDBService.saveEvent(newEvent);
          }
        }
      } catch (error) {
        console.error('Failed to sync event to API, will retry later:', error);
        // Queue for later sync
        await indexedDBService.addToSyncQueue({
          type: 'event',
          operation: 'create',
          data: apiData
        });
      }
    } else {
      // Offline: queue for later sync
      await indexedDBService.addToSyncQueue({
        type: 'event',
        operation: 'create',
        data: apiData
      });
    }

    return newEvent;
  }

  /**
   * Get event by ID (from IndexedDB)
   */
  async getById(id: string): Promise<Event | undefined> {
    await this.initialize();
    return indexedDBService.getEventById(id);
  }

  /**
   * Update an event locally
   * Note: API doesn't have update endpoint yet, so this only updates IndexedDB
   */
  async updateEventLocal(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    await this.initialize();

    const existingEvent = await indexedDBService.getEventById(id);
    if (!existingEvent) return undefined;

    const updatedEvent = { ...existingEvent, ...updates };
    await indexedDBService.saveEvent(updatedEvent);

    return updatedEvent;
  }

  /**
   * Delete an event locally
   * Note: API doesn't have delete endpoint yet, so this only deletes from IndexedDB
   */
  async deleteEventLocal(id: string): Promise<boolean> {
    await this.initialize();

    const event = await indexedDBService.getEventById(id);
    if (!event) return false;

    await indexedDBService.deleteEvent(id);
    return true;
  }

  /**
   * Clear all events (useful for logout)
   */
  async clearAll(): Promise<void> {
    await this.initialize();
    await indexedDBService.clearEvents();
  }

  /**
   * Sort events by timeline (live, upcoming, past)
   */
  sortEventsByTimeline(events: Event[]): Event[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getEventTimeline = (eventDate: Date): 'live' | 'upcoming' | 'past' => {
      const eventDateOnly = new Date(eventDate);
      eventDateOnly.setHours(0, 0, 0, 0);

      if (eventDateOnly.getTime() > today.getTime()) return 'upcoming';
      if (eventDateOnly.getTime() === today.getTime()) return 'live';
      return 'past';
    };

    const timelineOrder = { live: 0, upcoming: 1, past: 2 };

    return [...events].sort((a, b) => {
      const aTimeline = getEventTimeline(a.date);
      const bTimeline = getEventTimeline(b.date);

      const timelineCompare = timelineOrder[aTimeline] - timelineOrder[bTimeline];
      if (timelineCompare !== 0) return timelineCompare;

      return a.date.getTime() - b.date.getTime();
    });
  }
}

export const offlineEventService = new OfflineEventService();
