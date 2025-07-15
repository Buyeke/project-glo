
// Image optimization and WebP support utilities

export interface ImageConfig {
  src: string;
  webpSrc?: string;
  fallbackSrc?: string;
  alt: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

// Check if WebP is supported by the browser
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==';
  });
};

// Preload an image
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Generate responsive image sources
export const generateImageSources = (
  baseSrc: string, 
  sizes: number[] = [400, 800, 1200]
): string[] => {
  const extension = baseSrc.split('.').pop()?.toLowerCase();
  const baseName = baseSrc.replace(/\.[^/.]+$/, '');
  
  return sizes.map(size => `${baseName}_${size}w.${extension}`);
};

// Get optimized image configuration
export const getOptimizedImageConfig = async (
  src: string, 
  alt: string,
  options: {
    webpSrc?: string;
    fallbackSrc?: string;
    sizes?: string;
    loading?: 'lazy' | 'eager';
  } = {}
): Promise<ImageConfig> => {
  const webpSupported = await supportsWebP();
  
  return {
    src: webpSupported && options.webpSrc ? options.webpSrc : src,
    webpSrc: options.webpSrc,
    fallbackSrc: options.fallbackSrc || '/placeholder.svg',
    alt,
    sizes: options.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    loading: options.loading || 'lazy'
  };
};

// Handle image loading errors gracefully
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = '/placeholder.svg'
) => {
  const target = event.target as HTMLImageElement;
  if (target.src !== fallbackSrc) {
    target.src = fallbackSrc;
  }
};

// Convert image URL to WebP if supported
export const getWebPUrl = (originalUrl: string): string => {
  if (!originalUrl) return originalUrl;
  
  // Simple WebP URL conversion (this would depend on your image service)
  const extension = originalUrl.split('.').pop()?.toLowerCase();
  if (extension && ['jpg', 'jpeg', 'png'].includes(extension)) {
    return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  return originalUrl;
};

// Image compression utility for uploaded images
export const compressImage = (
  file: File, 
  maxWidth: number = 1200, 
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};
