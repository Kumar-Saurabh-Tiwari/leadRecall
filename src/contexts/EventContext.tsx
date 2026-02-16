import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Event, Entry } from '@/types';
import { eventService } from '@/services/eventService';
import { entryService } from '@/services/entryService';
import { offlineEventService } from '@/services/offlineEventService';
import { offlineEntryService } from '@/services/offlineEntryService';
import { syncService } from '@/services/syncService';
import { useAuth } from './AuthContext';

interface EventContextType {
  events: Event[];
  entries: Entry[];
  isLoading: boolean;
  fetchEvents: (forceRefresh?: boolean) => Promise<void>;
  addEvent: (event: Event) => void;
  updateEvents: (events: Event[]) => void;
  isInitialized: boolean;
  setEntries: (entries: Entry[]) => void;
  addEntry: (entry: Entry) => void;
  refreshEntries: () => Promise<void>;
  isEntriesInitialized: boolean;
  setIsEntriesInitialized: (initialized: boolean) => void;
  isOnline: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [entries, setEntriesState] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEntriesInitialized, setIsEntriesInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();

  // Initialize offline services and load cached data
  useEffect(() => {
    const initOfflineData = async () => {
      try {
        // Load cached events immediately
        const cachedEvents = await offlineEventService.getAllLocal();
        if (cachedEvents.length > 0) {
          const sortedEvents = offlineEventService.sortEventsByTimeline(cachedEvents);
          setEvents(sortedEvents);
        }

        // Load cached entries immediately
        const cachedEntries = await offlineEntryService.getAllLocal();
        if (cachedEntries.length > 0) {
          setEntriesState(cachedEntries);
          setIsEntriesInitialized(true);
        }
      } catch (error) {
        console.error('Failed to load cached data:', error);
      }
    };

    initOfflineData();
  }, []);

  // Listen for network status changes
  useEffect(() => {
    const unsubscribe = syncService.onStatusChange((online) => {
      setIsOnline(online);
      
      // When coming back online, trigger sync
      if (online && user?.email) {
        console.log('Back online, triggering sync...');
        syncService.syncOfflineData();
        
        // Refresh data from server
        if (isInitialized) {
          fetchEvents(true);
        }
        if (isEntriesInitialized) {
          refreshEntries();
        }
      }
    });

    return unsubscribe;
  }, [user?.email, isInitialized, isEntriesInitialized]);

  const fetchEvents = useCallback(async (forceRefresh: boolean = false) => {
    // Skip if already loading
    if (isLoading) {
      return;
    }

    // Skip if already initialized unless forceRefresh is true
    if (isInitialized && !forceRefresh) {
      return;
    }

    try {
      setIsLoading(true);
      const adminEmail = user?.email;
      const userRole = user?.role;
      
      if (!adminEmail || !userRole) {
        console.error('User data not available');
        setIsInitialized(true);
        return;
      }

      // Use offline-first service
      const fetchedEvents = await offlineEventService.fetchAndCacheEvents(adminEmail, userRole);
      const sortedEvents = offlineEventService.sortEventsByTimeline(fetchedEvents);
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Load from cache on error
      const cachedEvents = await offlineEventService.getAllLocal();
      if (cachedEvents.length > 0) {
        const sortedEvents = offlineEventService.sortEventsByTimeline(cachedEvents);
        setEvents(sortedEvents);
      }
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [user?.email, user?.role, isLoading, isInitialized]);

  const addEvent = useCallback((event: Event) => {
    setEvents(prev => [event, ...prev]);
  }, []);

  const updateEvents = useCallback((newEvents: Event[]) => {
    setEvents(newEvents);
  }, []);

  const setEntries = useCallback((newEntries: Entry[]) => {
    setEntriesState(newEntries);
  }, []);

  const addEntry = useCallback((entry: Entry) => {
    setEntriesState(prev => [entry, ...prev]);
  }, []);

  const refreshEntries = useCallback(async () => {
    if (!user?.role || !user?.email) {
      return;
    }

    try {
      // Use offline-first service
      const fetchedEntries = await offlineEntryService.fetchAndCacheEntries(user.email, user.role);
      setEntriesState(fetchedEntries);
      setIsEntriesInitialized(true);
      let apiResponse;
      if (user.role === 'exhibitor') {
        // Exhibitors get attendee data
        apiResponse = await entryService.getExhibitorData(user.email);
      } else {
        // Attendees get exhibitor data
        apiResponse = await entryService.getAttendeeData(user.email);
      }

      console.log('Refresh API Response:', apiResponse);

      // Transform API response to Entry format
      const dataArray = apiResponse?.data || apiResponse;
      if (dataArray && Array.isArray(dataArray)) {
        const transformedEntries: Entry[] = dataArray.map((item: any) => {
          // Get first non-empty event title
          const validEvent = item.oContactData?.sEventTitles?.find((evt: any) => evt.sTitle && evt.sTitle.trim());
          
          // Get first non-N/A LinkedIn profile link
          const linkedinProfile = item.oContactData?.profiles?.find((prof: any) => prof.sProfileLink && prof.sProfileLink !== 'N/A');
          
          return {
            id: item._id || item.id || crypto.randomUUID(),
            name: item.oContactData ? 
              `${item.oContactData.sFirstName || ''} ${item.oContactData.sLastName || ''}`.trim() : 
              'Unknown',
            company: item.oContactData?.sCompany || 'Unknown Company',
            event: validEvent?.sTitle || 'Unknown Event',
            notes: item.oContactData?.sEntryNotes?.[0] || '',
            type: user.role === 'exhibitor' ? 'attendee' : 'exhibitor',
            createdAt: item.dCreatedDate ? new Date(item.dCreatedDate) : new Date(),
            email: item.oContactData?.sEmail?.[0]?.Email || undefined,
            phone: item.oContactData?.contacts?.[0]?.sContactNumber || undefined,
            linkedin: linkedinProfile?.sProfileLink || undefined,
            profileUrl: undefined,
            image: item?.sMediaUrl && item?.sMediaUrl !== 'No Image' ? item?.sMediaUrl : undefined
          };
        });

        setEntriesState(transformedEntries);
      } else {
        setEntriesState([]);
      }
    } catch (err) {
      console.error('Error refreshing entries:', err);
      // Load from cache on error
      const cachedEntries = await offlineEntryService.getAllLocal();
      setEntriesState(cachedEntries);
    }
  }, [user?.role, user?.email]);

  // Auto-fetch events when user is available and not yet initialized
  useEffect(() => {
    if (user?.email && !isInitialized) {
      fetchEvents();
    }
  }, [user?.email, isInitialized, fetchEvents]);

  return (
    <EventContext.Provider value={{ 
      events, 
      entries, 
      isLoading, 
      fetchEvents, 
      addEvent, 
      updateEvents, 
      isInitialized, 
      setEntries, 
      addEntry, 
      refreshEntries, 
      isEntriesInitialized, 
      setIsEntriesInitialized,
      isOnline
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
   