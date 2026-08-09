import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alphaai.app',
  appName: 'Alpha AI',
  webDir: 'dist',
  server: {
    url: 'https://ansh-yadav-nu.vercel.app',
    cleartext: true
  }
};

export default config;
