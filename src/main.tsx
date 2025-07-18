
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadCriticalResources, registerServiceWorker } from './utils/performanceOptimizations';

// Preload critical resources
preloadCriticalResources();

// Register service worker
registerServiceWorker().catch(console.error);

// Performance monitoring
if (import.meta.env.DEV) {
  // Monitor performance in development
  window.addEventListener('load', () => {
    if ('performance' in window) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.log(`Page load time: ${loadTime}ms`);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
