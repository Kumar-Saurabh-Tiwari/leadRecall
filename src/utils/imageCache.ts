/**
 * Image cache utility for reliable image loading
 * Implements fallback mechanisms and retry logic to ensure images always display
 */

interface CachedImage {
  url: string;
  data: string; // Base64 data
  timestamp: number;
}

const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class ImageCacheManager {
  private cache: Map<string, CachedImage> = new Map();
  private loadingPromises: Map<string, Promise<string>> = new Map();

  /**
   * Get cached image data or fetch from URL
   */
  async getImage(url: string): Promise<string> {
    if (!url) return '';

    // Return from memory cache if available
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_DURATION) {
      return cached.data;
    }

    // Return existing loading promise if image is being fetched
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Initiate new fetch with retry logic
    const loadingPromise = this.fetchImageWithRetry(url);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const data = await loadingPromise;
      // Remove from loading promises on success
      this.loadingPromises.delete(url);
      return data;
    } catch (error) {
      // Remove from loading promises on error
      this.loadingPromises.delete(url);
      console.warn(`Failed to load image after retries: ${url}`, error);
      // Return original URL as fallback
      return url;
    }
  }

  /**
   * Fetch image with retry logic
   */
  private async fetchImageWithRetry(url: string, attempt = 1): Promise<string> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'image/jpeg,image/png,image/gif,image/webp,image/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          
          // Store in cache
          this.cache.set(url, {
            url,
            data: base64,
            timestamp: Date.now(),
          });

          resolve(base64);
        };

        reader.onerror = () => {
          reject(new Error('Failed to read image blob'));
        };

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        return this.fetchImageWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Pre-cache images for better performance
   */
  async preCacheImages(urls: string[]): Promise<void> {
    const promises = urls
      .filter(url => url && !this.cache.has(url))
      .map(url => this.getImage(url).catch(() => null));

    await Promise.all(promises);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

export const imageCacheManager = new ImageCacheManager();
