
import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    // Check if running in Capacitor (native app)
    const checkNative = () => {
      return window.location.protocol === 'capacitor:' || 
             (window as any).Capacitor !== undefined;
    };

    // Check if mobile device
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    setIsNativeApp(checkNative());
    setIsMobile(checkMobile());
  }, []);

  return { isMobile, isNativeApp };
};
