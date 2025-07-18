
import { lazy } from 'react';

// Lazy load components for better performance
export const LazyComponents = {
  ChatBot: lazy(() => import('@/components/ChatBot')),
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  Services: lazy(() => import('@/pages/Services')),
  Resources: lazy(() => import('@/pages/Resources')),
  AdminPanel: lazy(() => import('@/pages/AdminPanel')),
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for API calls
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoized API call helper
export const memoizeApiCall = <T>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  ttl: number = 300000 // 5 minutes
): (() => Promise<T>) => {
  const cache = new Map<string, { data: T; timestamp: number }>();
  
  return async () => {
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data;
    }
    
    const data = await apiCall();
    cache.set(cacheKey, { data, timestamp: now });
    return data;
  };
};

// Image lazy loading with intersection observer
export const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

// Virtual scrolling for large lists
export const useVirtualScroll = (items: any[], itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
  
  // Preload critical images
  const criticalImages = [
    '/logo.svg',
    '/hero-bg.webp'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
};
