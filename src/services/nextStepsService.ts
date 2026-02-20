import { environment } from '@/config/environment';

export interface NextStepAction {
  label: string;
  icon: string;
  value: string;
}

export interface NextStepData {
  /** MongoDB _id of the contact */
  iContactId: string;
  /** Contact's full name */
  sPersonName?: string;
  /** Contact's email */
  sEmail?: string;
  /** Main note text */
  sNote?: string;
  /** Additional details / sub-option chosen */
  aAddtionalDetails?: string;
  /** Action type: refer | connect | call | mention | buy | contemplate | others */
  sType?: string;
  /** Users tagged in the note */
  sTagUsers?: Array<{ _id?: string; name: string }>;
  /** ISO string or Date for scheduled follow-up */
  sActionTime?: string | Date;
  /** Whether this note has commercial value */
  isCommercialValue?: boolean;
  /** Client-side timestamp */
  dTimeStamp?: Date;
  // legacy local fields kept for offline fallback
  selectedOptions?: string[];
}

class NextStepsService {
  private nextStepActions: NextStepAction[] = [
    { label: 'Refer', icon: '🔗', value: 'refer' },
    { label: 'Connect', icon: '🤝', value: 'connect' },
    { label: 'Call', icon: '☎️', value: 'call' },
    { label: 'Mention to', icon: '👤', value: 'mention' },
    { label: 'Buy', icon: '💳', value: 'buy' },
    { label: 'Contemplate', icon: '💭', value: 'contemplate' },
    { label: 'Other', icon: '⋮', value: 'others' }
  ];

  private contemplatOptions = [
    { label: 'An idea', icon: '💡' },
    { label: 'Working Together', icon: '👥' },
    { label: 'A Proposal', icon: '📋' },
    { label: 'Other', icon: '⋮' }
  ];

  /**
   * Get all available next step actions
   */
  getNextStepActions(): NextStepAction[] {
    console.log('[NextStepsService] Getting next step actions');
    return this.nextStepActions;
  }

  /**
   * Get contemplate options
   */
  getContemplateOptions() {
    console.log('[NextStepsService] Getting contemplate options');
    return this.contemplatOptions;
  }

  /**
   * Save next step data
   */
  async saveNextStep(data: NextStepData): Promise<void> {
    try {
      console.log('[NextStepsService] Saving next step data:', data);
      // TODO: Add API call here when backend is ready
      // For now, just console logging
      
      // Store in local storage as backup
      const existingData = localStorage.getItem('nextStepsData');
      const dataArray = existingData ? JSON.parse(existingData) : [];
      dataArray.push({ ...data, timestamp: new Date().toISOString() });
      localStorage.setItem('nextStepsData', JSON.stringify(dataArray));
      
      console.log('[NextStepsService] Next step data saved successfully');
    } catch (error) {
      console.error('[NextStepsService] Error saving next step:', error);
      throw error;
    }
  }

  /**
   * Get next step history for a record
   */
  async getNextStepHistory(recordId: string): Promise<NextStepData[]> {
    try {
      console.log('[NextStepsService] Fetching next step history for record:', recordId);
      // TODO: Add API call here when backend is ready
      
      const data = localStorage.getItem('nextStepsData');
      const dataArray = data ? JSON.parse(data) : [];
      return dataArray.filter((item: NextStepData) => item.iContactId === recordId);
    } catch (error) {
      console.error('[NextStepsService] Error fetching next step history:', error);
      return [];
    }
  }

  /**
   * Update next step
   */
  async updateNextStep(recordId: string, stepData: Partial<NextStepData>): Promise<void> {
    try {
      console.log('[NextStepsService] Updating next step for record:', recordId, 'with data:', stepData);
      // TODO: Add API call here when backend is ready
      
      const data = localStorage.getItem('nextStepsData');
      const dataArray = data ? JSON.parse(data) : [];
      const index = dataArray.findIndex((item: NextStepData) => item.iContactId === recordId);
      if (index !== -1) {
        dataArray[index] = { ...dataArray[index], ...stepData };
        localStorage.setItem('nextStepsData', JSON.stringify(dataArray));
      }
      
      console.log('[NextStepsService] Next step updated successfully');
    } catch (error) {
      console.error('[NextStepsService] Error updating next step:', error);
      throw error;
    }
  }

  /**
   * Delete next step
   */
  async deleteNextStep(recordId: string): Promise<void> {
    try {
      console.log('[NextStepsService] Deleting next step for record:', recordId);
      // TODO: Add API call here when backend is ready
      
      const data = localStorage.getItem('nextStepsData');
      const dataArray = data ? JSON.parse(data) : [];
      const filtered = dataArray.filter((item: NextStepData) => item.iContactId !== recordId);
      localStorage.setItem('nextStepsData', JSON.stringify(filtered));
      
      console.log('[NextStepsService] Next step deleted successfully');
    } catch (error) {
      console.error('[NextStepsService] Error deleting next step:', error);
      throw error;
    }
  }

  // backend APIs (fetch + Promise)
  private hostUrl = environment.apiUrl;

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Anonymous': 'true'
    };
  }

  /**
   * Add additional media attachment to a record
   * Clears cached audio text from localStorage
   * @param data - Media data to attach
   * @param mediaType - Type of additional media
   */
  async addAdditionalMedia(data: any, mediaType: string): Promise<any> {
    try {
      // clear any cached audio transcript key (safe no-op if missing)
      localStorage.removeItem('cachedAudioText');
    } catch (e) {
      // ignore
    }

    const response = await fetch(`${this.hostUrl}/media/additional-media/${encodeURIComponent(mediaType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  /**
   * Retrieve additional media records with filtering
   */
  async getAdditionalMedia(filterData: any): Promise<any> {
    const response = await fetch(`${this.hostUrl}/profile/get-additional-media-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(filterData)
    });
    return response.json();
  }

  /**
   * Edit an existing additional media attachment
   */
  async editAdditionalMedia(data: any): Promise<any> {
    const response = await fetch(`${this.hostUrl}/media/additional-media/edit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  /**
   * Delete an additional media attachment
   */
  async deleteAdditionalMedia(data: { eMediaType: string; [k: string]: any }): Promise<any> {
    const response = await fetch(`${this.hostUrl}/media/additional-media/delete/${encodeURIComponent(data.eMediaType)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  /**
   * Create a new note/next step for a contact
   * @param data - Note data
   * @returns Created note with ID
   */
  async addNextSteps(data: any): Promise<any> {
    const response = await fetch(`${this.hostUrl}/profile/add-note`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  /**
   * Update an existing note/next step
   * @param data - Updated note data
   * @param id - Note ID to update
   * @returns Update confirmation
   */
  async updateNextSteps(data: any, id: string | number): Promise<any> {
    const response = await fetch(`${this.hostUrl}/profile/update-note/${encodeURIComponent(String(id))}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  /**
   * Retrieve a specific note/next step record
   * @param id - Note ID to retrieve
   * @returns Note details with response metadata
   */
  async getNextStepRecords(id: string | number): Promise<any> {
    const response = await fetch(`${this.hostUrl}/profile/get-note/${encodeURIComponent(String(id))}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders()
      }
    });
    return response.json();
  }

  /**
   * Get all notes associated with a specific contact
   * @param iContactId - Contact ID to filter notes
   * @returns Array of contact notes with response metadata
   */
  async getAllNextSteps(iContactId: string | number): Promise<any> {
    const response = await fetch(`${this.hostUrl}/profile/get-notes-by-contact/?iContactId=${encodeURIComponent(String(iContactId))}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders()
      }
    });
    return response.json();
  }

  /**
   * Get all notes created by the authenticated user
   * @returns Array of user's notes with response metadata
   */
  async getAllNextStepsOfUser(): Promise<any> {
    const response = await fetch(`${this.hostUrl}/profile/get-notes-by-userId`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders()
      }
    });
    return response.json();
  }
}

export const nextStepsService = new NextStepsService();
