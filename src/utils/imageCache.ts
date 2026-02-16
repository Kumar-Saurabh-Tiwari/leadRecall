/**
 * Simple image URL caching - returns URLs directly
 * Avoids CORS issues by not attempting to proxy images
 */

interface CachedImageUrl {
  url: string;
  timestamp: number;
}

const IMAGE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

class ImageCacheManager {
  private cache: Map<string, CachedImageUrl> = new Map();

  /**
   * Get image URL from cache or return directly
   */
  async getImage(url: string): Promise<string> {
    if (!url) return '';

    // Return from cache if available and not expired
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_DURATION) {
      return cached.url;
    }

    // Cache the URL
    this.cache.set(url, {
      url,
      timestamp: Date.now(),
    });

    // Return URL directly - let the browser handle image loading
    return url;
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
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

export const imageCacheManager = new ImageCacheManager();
