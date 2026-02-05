import { environment } from '@/config/environment';
import { Exhibitor } from '@/types';

/**
 * ExhibitorService handles all API calls related to exhibitor registration and management
 * API endpoints will be updated once backend is ready
 */

class ExhibitorService {
  private apiUrl = environment.apiUrl;

  /**
   * Register a new exhibitor
   * TODO: Update endpoint once API is available
   */
  async registerExhibitor(exhibitorData: Partial<Exhibitor>): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/users/register-leaduser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Anonymous': 'true'
        },
        body: JSON.stringify(exhibitorData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Exhibitor registration error:', error);
      throw error;
    }
  }
  
  /**
   * Verify and login exhibitor using email only
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
      console.error('Exhibitor verification error:', error);
      throw error;
    }
  }

  /**
   * Upload company logo to storage and get direct URL
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
   * Get exhibitor by ID
   * TODO: Update endpoint once API is available
   */
  async getExhibitor(exhibitorId: string): Promise<Exhibitor> {
    try {
      const response = await fetch(`${this.apiUrl}/api/exhibitors/${exhibitorId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exhibitor');
      }

      return await response.json();
    } catch (error) {
      console.error('Get exhibitor error:', error);
      throw error;
    }
  }

  /**
   * Update exhibitor profile
   * TODO: Update endpoint once API is available
   */
  async updateExhibitor(exhibitorId: string, updates: Partial<Exhibitor>): Promise<Exhibitor> {
    try {
      const response = await fetch(`${this.apiUrl}/api/exhibitors/${exhibitorId}`, {
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
      console.error('Update exhibitor error:', error);
      throw error;
    }
  }
}

export const exhibitorService = new ExhibitorService();
