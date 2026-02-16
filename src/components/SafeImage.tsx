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
 * SafeImage component with caching and fallback
 * Loads images directly and shows placeholder on error
 */
export function SafeImage({ src, alt, className = '', fallbackClassName = '' }: SafeImageProps) {
  const [imageUrl, setImageUrl] = useState<string>(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageUrl('');
      setHasError(false);
      return;
    }

    // Get cached or fresh URL
    imageCacheManager.getImage(src).then(url => {
      setImageUrl(url);
    }).catch(() => {
      setImageUrl(src); // Fallback to original URL
    });
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
    />
  );
}
