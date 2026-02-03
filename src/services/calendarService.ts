import { CalendarItem } from '@/types';

const mockCalendarItems: CalendarItem[] = [
  {
    id: '1',
    title: 'DevCon 2025',
    date: new Date('2025-02-15'),
    type: 'event',
    relatedId: '1',
  },
  {
    id: '2',
    title: 'Follow up with Sarah Johnson',
    date: new Date('2025-02-10'),
    type: 'follow-up',
    relatedId: '1',
  },
  {
    id: '3',
    title: 'SaaS Summit',
    date: new Date('2025-03-10'),
    type: 'event',
    relatedId: '2',
  },
  {
    id: '4',
    title: 'Follow up with Michael Chen',
    date: new Date('2025-02-08'),
    type: 'follow-up',
    relatedId: '2',
  },
  {
    id: '5',
    title: 'AI Expo',
    date: new Date('2025-03-25'),
    type: 'event',
    relatedId: '3',
  },
  {
    id: '6',
    title: 'Schedule demo with Emma',
    date: new Date('2025-02-05'),
    type: 'follow-up',
  },
];

export const calendarService = {
  getAll(): CalendarItem[] {
    return [...mockCalendarItems].sort((a, b) => a.date.getTime() - b.date.getTime());
  },

  getByDate(date: Date): CalendarItem[] {
    return mockCalendarItems.filter(
      item => item.date.toDateString() === date.toDateString()
    );
  },

  getUpcoming(limit?: number): CalendarItem[] {
    const now = new Date();
    const upcoming = this.getAll().filter(item => item.date >= now);
    return limit ? upcoming.slice(0, limit) : upcoming;
  },

  getByType(type: 'event' | 'follow-up'): CalendarItem[] {
    return this.getAll().filter(item => item.type === type);
  },
};
