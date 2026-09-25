import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.starmaen.lionbrowser',
  appName: 'Lion Browser',
  webDir: 'dist',
  android: {
    adjustMarginsForEdgeToEdge: 'disable',
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
    },
  },
};

export default config;
