export type UserRole = 'exhibitor' | 'attendee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  avatar?: string;
}

export interface Exhibitor {
  id?: string;
  sCompanyName: string;
  sCompanyLogo?: string;
  sEmail: string;
  sUserName: string;
  sRole: string;
  sLinkedinUrl?: string;
  sPhoneNumber?: string;
  sBoothNumber: string;
  sExhibitorId?: string;
  sRegistrationType: string;
  sCheckInStatus?: string;
  iEventId?: string;
  sEventName?: string;
  sMediaUrl?: string;
}

export interface Attendee {
  id?: string;
  sUserName: string;
  sAttendeeId?: string;
  sCompanyName: string;
  sRole: string;
  sLinkedinUrl?: string;
  sUserType: string;
  sPhoneNumber?: string;
  sTicketNumber: string;
  sCheckInStatus?: string;
  sEmail: string;
  iEventId?: string;
  sEventName?: string;
  sMediaUrl?: string;
}

export interface Entry {
  id: string;
  name: string;
  company: string;
  event: string;
  notes: string;
  type: 'exhibitor' | 'attendee' | 'content';
  createdAt: Date;
  linkedin?: string;
  profileUrl?: string;
  email?: string;
  phone?: string;
  image?: string;
  role?: string;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  endDate?: Date;
  location: string;
  locationName?: string;
  role: UserRole;
  description?: string;
  image?: string;
  organizer?: string;
}

export interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  type: 'event' | 'follow-up';
  relatedId?: string;
}
export interface ProfileResponse {
  message: string;
  data: ProfileData;
}

export interface ProfileData {
  sUserName: string;
  sCompanyName: string;
  sRegistrationType: 'exhibitor' | 'attendee';
  sPhoneNumber: string;
  sEmail: string;
  sUrl?: string;
  sTicketNumber?: string;
  sCheckInStatus: string;
  iEventId?: string;
  sEventName?: string;
  sUserType: string;
  sBoothNumber?: string;
  sProfileUrl?: string;
  sRole?: string;
  sLinkedinUrl?: string;
  sCategory?: string;
  sMediaUrl?: string;
  _id: string;
  dCreatedDate: string;
  dUpdatedDate: string;
  __v: number;
}