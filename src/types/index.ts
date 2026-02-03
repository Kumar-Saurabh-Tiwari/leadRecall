export type UserRole = 'exhibitor' | 'attendee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  avatar?: string;
}

export interface Entry {
  id: string;
  name: string;
  company: string;
  event: string;
  notes: string;
  type: UserRole;
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  role: UserRole;
  description?: string;
}

export interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  type: 'event' | 'follow-up';
  relatedId?: string;
}
