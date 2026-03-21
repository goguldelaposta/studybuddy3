import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studybuddy.app',
  appName: 'StudyBuddy',
  webDir: 'dist',
  server: {
    // Folosim https pe Android ca BrowserRouter să funcționeze (evită file://)
    androidScheme: 'https',
    hostname: 'app',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#09090b',
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      style: 'DEFAULT',
      overlaysWebView: true,
    },
  },
};

export default config;
