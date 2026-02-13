import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { imageCacheManager } from '@/utils/imageCache';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * SafeImage component with caching, retry logic, and fallback
 * Ensures images always display either from cache, API, or placeholder
 */
export function SafeImage({ src, alt, className = '', fallbackClassName = '' }: SafeImageProps) {
  const [imageUrl, setImageUrl] = useState<string>(src || '');
  const [isLoading, setIsLoading] = useState(!!src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageUrl('');
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Reset states on new src
    setIsLoading(true);
    setHasError(false);

    const loadImage = async () => {
      try {
        // Use cache manager for reliability
        const cachedOrUrl = await imageCacheManager.getImage(src);
        setImageUrl(cachedOrUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load image:', src, error);
        // Fallback to original URL anyway
        setImageUrl(src);
        setIsLoading(false);
        setHasError(true);
      }
    };

    loadImage();
  }, [src]);

  if (!imageUrl || hasError) {
    // Placeholder fallback
    return (
      <div className={`w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center ${fallbackClassName}`}>
        <User className="h-20 w-20 text-slate-300 dark:text-slate-500" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
      onLoad={() => setIsLoading(false)}
    />
  );
}
