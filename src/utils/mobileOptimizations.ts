
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const initializeMobileApp = async () => {
  if (Capacitor.isNativePlatform()) {
    // Hide splash screen after app loads
    await SplashScreen.hide();

    // Configure status bar
    if (Capacitor.getPlatform() === 'ios') {
      await StatusBar.setStyle({ style: Style.Light });
    }

    // Handle back button on Android
    if (Capacitor.getPlatform() === 'android') {
      document.addEventListener('ionBackButton', (ev: any) => {
        ev.detail.register(-1, () => {
          if (window.location.pathname === '/') {
            // Exit app if on home page
            (navigator as any).app?.exitApp();
          } else {
            // Navigate back
            window.history.back();
          }
        });
      });
    }
  }
};

// Enhanced touch interactions for mobile
export const addMobileTouchOptimizations = () => {
  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Add touch-action CSS for better scrolling
  document.body.style.touchAction = 'manipulation';
};
