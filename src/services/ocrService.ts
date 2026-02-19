import { environment } from '@/config/environment';

interface OCRResult {
  labels?: string[];
  text?: string;
  confidence?: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  job_title?: string;
  company?: string;
}

/**
 * OCRService handles all API calls related to OCR and image processing
 */
class OCRService {
  private apiUrl = environment.apiUrl;

  /**
   * Detect labels from an image using vision API
   */
    //     const data = new FormData();
    //   formData.append('image', this.capturedImageFile);
  async detectLabels(data: FormData): Promise<OCRResult> {
    try {
      const response = await fetch(`${this.apiUrl}/media/vision/detect-labels`, {
        method: 'POST',
        headers: {
          'Anonymous': 'true'
        },
        body: data
      });

      if (!response.ok) {
        throw new Error(`OCR detection failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OCR detection error:', error);
      throw error;
    }
  }
  /**
   * Detect text from an image using vision API
   */
    //     const data = new FormData();
    //   formData.append('image', this.capturedImageFile);
  async detectTexts(data: FormData): Promise<OCRResult> {
    try {
      const response = await fetch(`${this.apiUrl}/media/vision/detect-texts`, {
        method: 'POST',
        headers: {
          'Anonymous': 'true'
        },
        body: data
      });

      if (!response.ok) {
        throw new Error(`OCR detection failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OCR detection error:', error);
      throw error;
    }
  }

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
}


export const ocrService = new OCRService();