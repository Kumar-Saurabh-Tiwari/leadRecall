import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Event } from '@/types';
import { eventService } from '@/services/eventService';
import { useAuth } from './AuthContext';

interface EventContextType {
  events: Event[];
  isLoading: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Event) => void;
  updateEvents: (events: Event[]) => void;
  isInitialized: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  const mapApiEventToEvent = (apiEvent: any): Event => ({
    id: apiEvent._id,
    name: apiEvent.sName,
    date: new Date(apiEvent.dStartDate),
    endDate: apiEvent.dEndDate ? new Date(apiEvent.dEndDate) : undefined,
    location: apiEvent.sLocationPhysical,
    role: user?.role || 'attendee',
    description: apiEvent.sShortDescription,
    image: apiEvent.sLogo,
  });

  const fetchEvents = useCallback(async () => {
    // Skip if already loading or already initialized
    if (isLoading || isInitialized) {
      return;
    }

    try {
      setIsLoading(true);
      const adminEmail = user?.email;
      
      if (!adminEmail) {
        console.error('Admin email not available');
        setIsInitialized(true);
        return;
      }

      const response = await eventService.getLeadEvents(adminEmail);
      if (response && typeof response === 'object' && 'data' in response) {
        const apiData = response as { data: { events: any[] } };
        if (apiData.data?.events && Array.isArray(apiData.data.events)) {
          const mappedEvents = apiData.data.events.map(mapApiEventToEvent);
          setEvents(mappedEvents);
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback to mock data
      setEvents(eventService.getAll());
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [user?.email, isLoading, isInitialized]);

  const addEvent = useCallback((event: Event) => {
    setEvents(prev => [event, ...prev]);
  }, []);

  const updateEvents = useCallback((newEvents: Event[]) => {
    setEvents(newEvents);
  }, []);

  // Auto-fetch events when user is available and not yet initialized
  useEffect(() => {
    if (user?.email && !isInitialized) {
      fetchEvents();
    }
  }, [user?.email, isInitialized, fetchEvents]);

  return (
    <EventContext.Provider value={{ events, isLoading, fetchEvents, addEvent, updateEvents, isInitialized }}>
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
