import { CalendarItem } from '@/types';
import { environment } from '@/config/environment';

const mockCalendarItems: CalendarItem[] = [
  // Today (Feb 4, 2026)
  {
    id: '1',
    title: 'Tech Innovation Summit 2026',
    date: new Date('2026-02-04T09:00:00'),
    type: 'event',
    relatedId: '8.5',
  },
  {
    id: '2',
    title: 'Developer Meetup Live',
    date: new Date('2026-02-04T14:30:00'),
    type: 'event',
    relatedId: '8.6',
  },
  {
    id: '3',
    title: 'Follow up with John Doe',
    date: new Date('2026-02-04T16:00:00'),
    type: 'follow-up',
  },
  // Tomorrow (Feb 5, 2026)
  {
    id: '4',
    title: 'Weekly Team Sync',
    date: new Date('2026-02-05T10:00:00'),
    type: 'event',
  },
  {
    id: '5',
    title: 'Demo with Client',
    date: new Date('2026-02-05T15:00:00'),
    type: 'follow-up',
  },
  // This Week
  {
    id: '6',
    title: 'Product Launch Meeting',
    date: new Date('2026-02-06T11:00:00'),
    type: 'event',
  },
  {
    id: '7',
    title: 'Follow up with Sarah',
    date: new Date('2026-02-06T14:00:00'),
    type: 'follow-up',
  },
  {
    id: '8',
    title: 'Tech Conference Call',
    date: new Date('2026-02-08T09:30:00'),
    type: 'event',
  },
  {
    id: '9',
    title: 'Schedule meeting',
    date: new Date('2026-02-08T17:00:00'),
    type: 'follow-up',
  },
  // Next Week
  {
    id: '10',
    title: 'Partner Presentation',
    date: new Date('2026-02-10T13:00:00'),
    type: 'event',
  },
  {
    id: '11',
    title: 'Follow up with Michael',
    date: new Date('2026-02-10T15:30:00'),
    type: 'follow-up',
  },
  {
    id: '12',
    title: 'Marketing Workshop',
    date: new Date('2026-02-12T10:00:00'),
    type: 'event',
  },
  {
    id: '13',
    title: 'Client feedback session',
    date: new Date('2026-02-12T16:00:00'),
    type: 'follow-up',
  },
  // Later in month
  {
    id: '14',
    title: 'DevCon 2026',
    date: new Date('2026-02-15T08:00:00'),
    type: 'event',
    relatedId: '1',
  },
  {
    id: '15',
    title: 'SaaS Summit',
    date: new Date('2026-03-10T09:00:00'),
    type: 'event',
    relatedId: '2',
  },
  {
    id: '16',
    title: 'Mobile World Congress',
    date: new Date('2026-03-15T08:00:00'),
    type: 'event',
    relatedId: '9',
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

  // backend api call to get calendar data
  async getCalendarData(sEmail: string, type: string): Promise<any> {
    try {
      const response = await fetch(`${environment.apiUrl}/users/calendar-events?email=${sEmail}&type=${type}`, {
        headers: {
          'Anonymous': 'true'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      throw error;
    }
  },

  //   const taskData = {
  //     _id: task.id,
  //     iContactId: task.id,
  //     sType: 'calendar_event',
  //     sEmail: userEmail || '',
  //     sNote: task.note || task.description || '',
  //     aAddtionalDetails: task.detail,
  //     sActionTime: task.datetime
  // };
  async addNewCalendarTask(taskData: any): Promise<any> {
    try {
      const response = await fetch(`${environment.apiUrl}/profile/add-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Anonymous': 'true'
        },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) {
        throw new Error('Failed to add calendar task');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding calendar task:', error);
      throw error;
    }
  }
};

