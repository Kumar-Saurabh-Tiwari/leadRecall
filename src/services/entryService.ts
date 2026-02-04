import { Entry, UserRole } from '@/types';

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
  },
];

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
};
