
import React, { lazy } from 'react';

// Enhanced lazy loading with error boundaries
const createLazyComponent = (importFn: () => Promise<any>, fallback?: React.ComponentType) => {
  const LazyComponent = lazy(importFn);
  
  return React.forwardRef((props: any, ref) => (
    <React.Suspense fallback={
      fallback ? React.createElement(fallback) : 
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  ));
};

// Lazy load components for better performance
export const LazyComponents = {
  ChatBot: createLazyComponent(() => import('@/components/ChatBot')),
  Dashboard: createLazyComponent(() => import('@/pages/Dashboard')),
  Services: createLazyComponent(() => import('@/pages/Services')),
  Resources: createLazyComponent(() => import('@/pages/Resources')),
  AdminPanel: createLazyComponent(() => import('@/pages/AdminPanel')),
  AdminDashboard: createLazyComponent(() => import('@/components/admin/AdminDashboard')),
  NgoDashboard: createLazyComponent(() => import('@/components/dashboard/NgoDashboard')),
  SimpleDashboard: createLazyComponent(() => import('@/components/dashboard/SimpleDashboard')),
};

// Enhanced debounce function with immediate execution option
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null!;
      if (!immediate) func(...args);
    }, wait);
    if (callNow) func(...args);
  };
};

// Enhanced throttle function
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Enhanced memoized API call helper with better cache management
export const memoizeApiCall = <T>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  ttl: number = 300000, // 5 minutes
  maxCacheSize: number = 50
): (() => Promise<T>) => {
  const cache = new Map<string, { data: T; timestamp: number; accessCount: number }>();
  
  return async () => {
    const cached = cache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < ttl) {
      cached.accessCount++;
      return cached.data;
    }
    
    // Clean cache if it's getting too large
    if (cache.size >= maxCacheSize) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
      const toDelete = entries.slice(0, Math.floor(maxCacheSize / 2));
      toDelete.forEach(([key]) => cache.delete(key));
    }
    
    const data = await apiCall();
    cache.set(cacheKey, { data, timestamp: now, accessCount: 1 });
    return data;
  };
};

// Enhanced image lazy loading with intersection observer
export const lazyLoadImages = (options: {
  rootMargin?: string;
  threshold?: number;
} = {}) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (src) img.src = src;
        if (srcset) img.srcset = srcset;
        
        img.classList.remove('lazy');
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: options.rootMargin || '50px',
    threshold: options.threshold || 0.1
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });

  return () => imageObserver.disconnect();
};

// Enhanced virtual scrolling for large lists
export const useVirtualScroll = (
  items: any[], 
  itemHeight: number, 
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + overscan * 2,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    setScrollTop
  };
};

// Service Worker registration with better error handling
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              console.log('New content available, please refresh.');
            }
          });
        }
      });
      
      console.log('SW registered: ', registration);
      return registration;
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
      throw registrationError;
    }
  }
};

// Enhanced preload critical resources
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontUrls = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-regular.woff2'
  ];
  
  fontUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
  
  // Preload critical images
  const criticalImages = [
    '/logo.svg',
    '/hero-bg.webp',
    '/placeholder.svg'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
  
  // Prefetch likely next pages
  const prefetchUrls = ['/dashboard', '/services', '/resources'];
  prefetchUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log({
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
};

// Bundle analyzer helper
export const analyzeBundleSize = () => {
  console.log('Bundle analysis - Check network tab for chunk sizes');
  console.log('Main chunks loaded:', performance.getEntriesByType('navigation'));
  console.log('Resource timing:', performance.getEntriesByType('resource'));
};
