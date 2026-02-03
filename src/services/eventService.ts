import { Event, UserRole } from '@/types';

const mockEvents: Event[] = [
  {
    id: '1',
    name: 'DevCon 2025',
    date: new Date('2025-02-15'),
    location: 'San Francisco, CA',
    role: 'exhibitor',
    description: 'Annual developer conference featuring the latest in tech.',
  },
  {
    id: '2',
    name: 'SaaS Summit',
    date: new Date('2025-03-10'),
    location: 'New York, NY',
    role: 'attendee',
    description: 'The premier SaaS industry gathering.',
  },
  {
    id: '3',
    name: 'AI Expo',
    date: new Date('2025-03-25'),
    location: 'Austin, TX',
    role: 'exhibitor',
    description: 'Explore cutting-edge AI innovations.',
  },
  {
    id: '4',
    name: 'Startup Connect',
    date: new Date('2025-04-05'),
    location: 'Boston, MA',
    role: 'attendee',
    description: 'Network with founders and investors.',
  },
  {
    id: '5',
    name: 'Tech Leaders Forum',
    date: new Date('2025-04-20'),
    location: 'Seattle, WA',
    role: 'exhibitor',
    description: 'Executive-level tech discussions.',
  },
];

export const eventService = {
  getAll(): Event[] {
    return [...mockEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
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
};
