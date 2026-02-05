import { environment } from '@/config/environment';
import { Attendee } from '@/types';

/**
 * AttendeeService handles all API calls related to attendee registration and management
 * API endpoints will be updated once backend is ready
 */

class AttendeeService {
  private apiUrl = environment.apiUrl;

  /**
   * Register a new attendee
   * TODO: Update endpoint once API is available
   */
  async registerAttendee(attendeeData: Partial<Attendee>): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/users/register-leaduser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Anonymous': 'true'
        },
        body: JSON.stringify(attendeeData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Attendee registration error:', error);
      throw error;
    }
  }

  /**
   * Verify and login attendee using email only
   */
  async verifyAndLoginLeadRegisterUser(email: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/users/verify-register-leaduser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Anonymous': 'true'
        },
        body: JSON.stringify({ sEmail: email }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Attendee verification error:', error);
      throw error;
    }
  }


  /**
   * Upload profile photo to storage and get direct URL
   */
  async getDirectURL(file: File, mediaType: string = 'image'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);

      const response = await fetch(`${this.apiUrl}/common/upload-media`, {
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
  }

  /**
   * Get attendee by ID
   * TODO: Update endpoint once API is available
   */
  async getAttendee(attendeeId: string): Promise<Attendee> {
    try {
      const response = await fetch(`${this.apiUrl}/api/attendees/${attendeeId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch attendee');
      }

      return await response.json();
    } catch (error) {
      console.error('Get attendee error:', error);
      throw error;
    }
  }

  /**
   * Update attendee profile
   * TODO: Update endpoint once API is available
   */
  async updateAttendee(attendeeId: string, updates: Partial<Attendee>): Promise<Attendee> {
    try {
      const response = await fetch(`${this.apiUrl}/api/attendees/${attendeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Update attendee error:', error);
      throw error;
    }
  }
}

export const attendeeService = new AttendeeService();
