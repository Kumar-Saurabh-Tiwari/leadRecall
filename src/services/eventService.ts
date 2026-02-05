import { Event, UserRole } from '@/types';
import { environment } from '@/config/environment';

const mockEvents: Event[] = [
  // Past Events
  {
    id: '1',
    name: 'DevCon 2025',
    date: new Date('2025-02-15'),
    location: 'San Francisco, CA',
    role: 'exhibitor',
    description: 'Annual developer conference featuring the latest in tech.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'SaaS Summit',
    date: new Date('2025-03-10'),
    location: 'New York, NY',
    role: 'attendee',
    description: 'The premier SaaS industry gathering.',
    image: 'https://images.unsplash.com/photo-1540575467063-178f50902f4e?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'AI Expo',
    date: new Date('2025-03-25'),
    location: 'Austin, TX',
    role: 'exhibitor',
    description: 'Explore cutting-edge AI innovations.',
    image: 'https://images.unsplash.com/photo-1677442d019cecf31b1a77c71b5affa7c1a3e4fa?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    name: 'Startup Connect',
    date: new Date('2025-04-05'),
    location: 'Boston, MA',
    role: 'attendee',
    description: 'Network with founders and investors.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    name: 'Tech Leaders Forum',
    date: new Date('2025-04-20'),
    location: 'Seattle, WA',
    role: 'exhibitor',
    description: 'Executive-level tech discussions.',
    image: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    name: 'Web Summit Europe',
    date: new Date('2025-10-13'),
    location: 'Lisbon, Portugal',
    role: 'exhibitor',
    description: 'Europe\'s largest tech conference.',
    image: 'https://images.unsplash.com/photo-1540575467063-178f50902f4e?w=400&h=300&fit=crop',
  },
  {
    id: '7',
    name: 'Cloud Native Conference',
    date: new Date('2025-11-08'),
    location: 'Denver, CO',
    role: 'attendee',
    description: 'Cloud infrastructure and DevOps focused event.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=300&fit=crop',
  },
  {
    id: '8',
    name: 'CyberSecurity Summit',
    date: new Date('2025-12-02'),
    location: 'Washington, DC',
    role: 'exhibitor',
    description: 'Latest in cybersecurity trends and solutions.',
    image: 'https://images.unsplash.com/photo-1677442d019cecf31b1a77c71b5affa7c1a3e4fa?w=400&h=300&fit=crop',
  },
  // Live Events (Today)
  {
    id: '8.5',
    name: 'Tech Innovation Summit 2026',
    date: new Date('2026-02-04'),
    location: 'Virtual',
    role: 'exhibitor',
    description: 'Live streaming of cutting-edge technology innovations happening now.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
  {
    id: '8.6',
    name: 'Developer Meetup Live',
    date: new Date('2026-02-04'),
    location: 'San Francisco, CA',
    role: 'attendee',
    description: 'Real-time networking and tech talks happening today.',
    image: 'https://images.unsplash.com/photo-1540575467063-178f50902f4e?w=400&h=300&fit=crop',
  },
  // Upcoming Events
  {
    id: '9',
    name: 'Mobile World Congress 2026',
    date: new Date('2026-03-15'),
    location: 'Barcelona, Spain',
    role: 'exhibitor',
    description: 'Premier mobile industry event showcasing innovation.',
    image: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=400&h=300&fit=crop',
  },
  {
    id: '10',
    name: 'Google I/O 2026',
    date: new Date('2026-05-12'),
    location: 'Mountain View, CA',
    role: 'attendee',
    description: 'Google\'s annual developer conference.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=300&fit=crop',
  },
  {
    id: '11',
    name: 'WWDC 2026',
    date: new Date('2026-06-08'),
    location: 'San Jose, CA',
    role: 'attendee',
    description: 'Apple\'s Worldwide Developers Conference.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  },
  {
    id: '12',
    name: 'AWS re:Invent 2026',
    date: new Date('2026-11-30'),
    location: 'Las Vegas, NV',
    role: 'exhibitor',
    description: 'AWS\'s premier cloud computing conference.',
    image: 'https://images.unsplash.com/photo-1540575467063-178f50902f4e?w=400&h=300&fit=crop',
  },
  {
    id: '13',
    name: 'Tech Innovation Summit',
    date: new Date('2026-08-20'),
    location: 'Chicago, IL',
    role: 'exhibitor',
    description: 'Discover breakthrough technologies and innovations.',
    image: 'https://images.unsplash.com/photo-1677442d019cecf31b1a77c71b5affa7c1a3e4fa?w=400&h=300&fit=crop',
  },
  {
    id: '14',
    name: 'Product Hunt Makers Festival',
    date: new Date('2026-09-10'),
    location: 'San Francisco, CA',
    role: 'attendee',
    description: 'Celebrate and connect with product makers worldwide.',
    image: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=400&h=300&fit=crop',
  },
];

export const eventService = {
  getAll(): Event[] {
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

    return [...mockEvents].sort((a, b) => {
      const aTimeline = getEventTimeline(a.date);
      const bTimeline = getEventTimeline(b.date);

      const timelineCompare = timelineOrder[aTimeline] - timelineOrder[bTimeline];
      if (timelineCompare !== 0) return timelineCompare;

      return a.date.getTime() - b.date.getTime();
    });
  },

  getById(id: string): Event | undefined {
    return mockEvents.find(e => e.id === id);
  },

  getByRole(role: UserRole): Event[] {
    return this.getAll().filter(e => e.role === role);
  },

  getUpcoming(): Event[] {
    const now = new Date();
    return this.getAll().filter(e => e.date >= now);
  },

  add(eventData: Omit<Event, 'id'>): Event {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
    };
    mockEvents.push(newEvent);
    return newEvent;
  },
 
  // Backend APIs

  addNewLeadEvent: async (data: unknown): Promise<unknown> => {
    const response = await fetch(`${environment.apiUrl}/users/addNewLeadEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Anonymous': 'true',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  async getDirectURL(file: File, mediaType: string = 'image'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);

      const response = await fetch(`${environment.apiUrl}/common/upload-media`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const result = await response.json();
      return result.data.url; // Return the direct URL from API response
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  },

  getLeadEvents: async (adminEmail: string): Promise<unknown> => {
    const response = await fetch(`${environment.apiUrl}/users/getLeadEvents?adminEmail=${adminEmail}`, {
      method: 'GET',
      headers: {
        'Anonymous': 'true',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getLeadEventData: async (adminEmail: string, userType: string, eventId: string): Promise<unknown> => {
    const response = await fetch(`${environment.apiUrl}/users/getLeadEventData?adminEmail=${adminEmail}&userType=${userType}&eventId=${eventId}`, {
      method: 'GET',
      headers: {
        'Anonymous': 'true',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getLeadUserByEmail: async (adminEmail: string): Promise<unknown> => {
    const response = await fetch(`${environment.apiUrl}/users/register-leaduser/${adminEmail}`, {
      method: 'GET',
      headers: {
        'Anonymous': 'true',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  inviteLeadUserToEventTeam: async (data: unknown): Promise<unknown> => {
    const response = await fetch(`${environment.apiUrl}/users/invite-user-to-event-team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Anonymous': 'true',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
