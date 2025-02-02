import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bosley.app',
  appName: 'Bosley',
  webDir: 'dist',
  server: {
    url: 'https://yridaehdhtmdtasnbsrn.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'key0',
      minSdkVersion: 21,
      targetSdkVersion: 33,
    }
  }
};

export default config;