import { Entry, UserRole } from '@/types';
import { environment } from '@/config/environment';

const initialEntries: Entry[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'TechStart Inc.',
    event: 'DevCon 2025',
    notes: 'Interested in our enterprise plan. Follow up next week.',
    type: 'attendee',
    createdAt: new Date('2025-02-02'),
    email: 'sarah.johnson@techstart.com',
    phone: '+1 (555) 123-4567',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    profileUrl: 'https://techstart.com',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Michael Chen',
    company: 'Innovation Labs',
    event: 'DevCon 2025',
    notes: 'CTO looking for partnership opportunities.',
    type: 'exhibitor',
    createdAt: new Date('2025-02-01'),
    email: 'michael.chen@innovationlabs.io',
    phone: '+1 (555) 234-5678',
    linkedin: 'https://linkedin.com/in/michaelchen',
    profileUrl: 'https://innovationlabs.io',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Emma Williams',
    company: 'CloudScale Solutions',
    event: 'SaaS Summit',
    notes: 'Requested demo for Q2. Very promising lead.',
    type: 'attendee',
    createdAt: new Date('2025-01-30'),
    email: 'emma.williams@cloudscale.com',
    phone: '+1 (555) 345-6789',
    linkedin: 'https://linkedin.com/in/emmawilliams',
    profileUrl: 'https://cloudscale.com',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'David Park',
    company: 'NextGen AI',
    event: 'AI Expo',
    notes: 'Met at keynote. Wants to explore integration.',
    type: 'exhibitor',
    createdAt: new Date('2025-01-28'),
    email: 'david.park@nextgenai.com',
    phone: '+1 (555) 456-7890',
    linkedin: 'https://linkedin.com/in/davidpark',
    profileUrl: 'https://nextgenai.com',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
];

const hostUrl = environment.apiUrl;

let entries = [...initialEntries];

export const entryService = {
  getAll(): Entry[] {
    return [...entries].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getById(id: string): Entry | undefined {
    return entries.find(e => e.id === id);
  },

  add(entry: Omit<Entry, 'id' | 'createdAt'>): Entry {
    const newEntry: Entry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    entries = [newEntry, ...entries];
    return newEntry;
  },

  update(id: string, data: Partial<Entry>): Entry | undefined {
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    entries[index] = { ...entries[index], ...data };
    return entries[index];
  },

  delete(id: string): boolean {
    const initialLength = entries.length;
    entries = entries.filter(e => e.id !== id);
    return entries.length < initialLength;
  },

  getByType(type: UserRole): Entry[] {
    return this.getAll().filter(e => e.type === type);
  },

  getByRole(userRole: UserRole): Entry[] {
    // Exhibitors see attendee entries, Attendees see exhibitor entries
    const oppositeRole: UserRole = userRole === 'exhibitor' ? 'attendee' : 'exhibitor';
    return this.getAll().filter(e => e.type === oppositeRole);
  },

  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Anonymous': 'true',
      'Content-Type': 'application/json'
    };
  },

  // backend apis for entries for attendees and exhibitors

  async getExhibitorData(sExhibitorEmail: string): Promise<any> {
    const response = await fetch(`${hostUrl}/users/exhibitor-data?sExhibitorEmail=${sExhibitorEmail}`, {
      headers: {
        'Anonymous': 'true'
      }
    });
    return response.json();
  },

  async getAttendeeData(sAttendeeEmail: string): Promise<any> {
    const response = await fetch(`${hostUrl}/users/attendee-data?sAttendeeEmail=${sAttendeeEmail}`, {
      headers: {
        'Anonymous': 'true'
      }
    });
    return response.json();
  },

  async getExhibitorDataByID(id: string): Promise<any> {
    const response = await fetch(`${hostUrl}/users/exhibitor-data/${id}`, {
      headers: {
        'Anonymous': 'true'
      }
    });
    return response.json();
  },

  async getAttendeeDataByID(id: string): Promise<any> {
    const response = await fetch(`${hostUrl}/users/attendee-data/${id}`, {
      headers: {
        'Anonymous': 'true'
      }
    });
    return response.json();
  },

  async updateExhibitorDataByID(id: string, updateData: any): Promise<any> {
    const response = await fetch(`${hostUrl}/users/exhibitor-data/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Anonymous': 'true'
      },
      body: JSON.stringify(updateData)
    });
    return response.json();
  },

  async updateAttendeeDataByID(id: string, updateData: any): Promise<any> {
    const response = await fetch(`${hostUrl}/users/attendee-data/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Anonymous': 'true'
      },
      body: JSON.stringify(updateData)
    });
    return response.json();
  },

  // event data

  async getExhibitorEventData(sExhibitorEmail: string, sEventId: string): Promise<any> {
    const response = await fetch(`${hostUrl}/users/exhibitor-event-data?sExhibitorEmail=${sExhibitorEmail}&sEventId=${sEventId}`, {
      headers: {
        'Anonymous': 'true'
      }
    });
    return response.json();
  },

  async getAttendeeEventData(sAttendeeEmail: string, sEventId: string): Promise<any> {
    const response = await fetch(`${hostUrl}/users/attendee-event-data?sAttendeeEmail=${sAttendeeEmail}&sEventId=${sEventId}`, {
      headers: {
        'Anonymous': 'true'
      }
    });
    return response.json();
  },

  async addNewExhibitorData(data: any): Promise<any> {
    const response = await fetch(`${hostUrl}/users/addNewExhibitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Anonymous': 'true'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async addNewAttendeeData(data: any): Promise<any> {
    const response = await fetch(`${hostUrl}/users/addNewAttendee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Anonymous': 'true'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteExhibitor(entryId: string, sExhibitorEmail: string): Promise<any> {
    const response = await fetch(`${hostUrl}/users/exhibitor-data/${entryId}?sExhibitorEmail=${sExhibitorEmail}`, {
      method: 'DELETE',
      headers: {
        'Anonymous': 'true'
      }
    });
    return response.json();
  },

  async deleteAttendee(entryId: string, sAttendeeEmail: string): Promise<any> {
    const response = await fetch(`${hostUrl}/users/attendee-data/${entryId}?sAttendeeEmail=${sAttendeeEmail}`, {
      method: 'DELETE',
      headers: {
        'Anonymous': 'true'
      }
    });
    return response.json();
  },

  async registerUserEvent(data: any): Promise<any> {
    const response = await fetch(`${hostUrl}/users/addNewUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Anonymous': 'true'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async addInviteUserEvent(data: any): Promise<any> {
    const response = await fetch(`${hostUrl}/media/add/user-invite`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async addAdditionalMedia(data: any, mediaType: string): Promise<any> {
    const response = await fetch(`${hostUrl}/media/additional-media/trade-show/${mediaType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getAdditionalMedia(filterData: any): Promise<any> {
    const response = await fetch(`${hostUrl}/profile/get-additional-media-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(filterData)
    });
    return response.json();
  }
};
