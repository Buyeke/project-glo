
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholder?: string;
  webpSrc?: string;
  className?: string;
  onLoadError?: () => void;
  onLoadSuccess?: () => void;
}

export const EnhancedImage = ({
  src,
  alt,
  fallbackSrc,
  placeholder = '/placeholder.svg',
  webpSrc,
  className,
  onLoadError,
  onLoadSuccess,
  ...props
}: EnhancedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check WebP support
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      // Determine which source to use
      let sourceToTry = src;
      if (webpSrc && supportsWebP()) {
        sourceToTry = webpSrc;
      }

      try {
        // Preload the image
        const img = new Image();
        img.onload = () => {
          if (isMounted) {
            setCurrentSrc(sourceToTry);
            setIsLoading(false);
            onLoadSuccess?.();
          }
        };
        img.onerror = () => {
          if (isMounted) {
            // Try fallback if available
            if (fallbackSrc && sourceToTry !== fallbackSrc) {
              const fallbackImg = new Image();
              fallbackImg.onload = () => {
                if (isMounted) {
                  setCurrentSrc(fallbackSrc);
                  setIsLoading(false);
                }
              };
              fallbackImg.onerror = () => {
                if (isMounted) {
                  setHasError(true);
                  setIsLoading(false);
                  setCurrentSrc(placeholder);
                  onLoadError?.();
                }
              };
              fallbackImg.src = fallbackSrc;
            } else {
              setHasError(true);
              setIsLoading(false);
              setCurrentSrc(placeholder);
              onLoadError?.();
            }
          }
        };
        img.src = sourceToTry;
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          setCurrentSrc(placeholder);
          onLoadError?.();
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src, webpSrc, fallbackSrc, placeholder, onLoadError, onLoadSuccess]);

  return (
    <div className={cn('relative', className)}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading && 'opacity-50',
          hasError && 'opacity-75'
        )}
        {...props}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute top-2 right-2">
          <div className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
            Image failed to load
          </div>
        </div>
      )}
    </div>
  );
};
