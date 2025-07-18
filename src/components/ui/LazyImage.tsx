
import React, { useState, useRef, useEffect } from 'react';
import { getOptimizedImageConfig, handleImageError } from '@/utils/imageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  webpSrc?: string;
  fallbackSrc?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

export const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  webpSrc,
  fallbackSrc,
  sizes,
  loading = 'lazy'
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageConfig, setImageConfig] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const setupImageConfig = async () => {
      const config = await getOptimizedImageConfig(src, alt, {
        webpSrc,
        fallbackSrc,
        sizes,
        loading
      });
      setImageConfig(config);
    };

    setupImageConfig();
  }, [src, alt, webpSrc, fallbackSrc, sizes, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!imageConfig) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <picture>
      {imageConfig.webpSrc && (
        <source srcSet={imageConfig.webpSrc} type="image/webp" />
      )}
      <img
        ref={imgRef}
        src={isInView || loading === 'eager' ? imageConfig.src : undefined}
        alt={imageConfig.alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        width={width}
        height={height}
        sizes={imageConfig.sizes}
        loading={imageConfig.loading}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => handleImageError(e, imageConfig.fallbackSrc)}
      />
    </picture>
  );
};
