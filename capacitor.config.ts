
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6f4bde81af4946b29d041ec7163a4a1b',
  appName: 'Glo',
  webDir: 'dist',
  server: {
    url: 'https://6f4bde81-af49-46b2-9d04-1ec7163a4a1b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'LIGHT_CONTENT',
      backgroundColor: '#2563eb'
    }
  }
};

export default config;
