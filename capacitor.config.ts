
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.bosley',
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
  },
  ios: {
    contentInset: "always"
  },
  style: {
    androidStatusBar: {
      overlay: true,
      backgroundColor: "#000000",
      style: "dark"
    }
  }
};

export default config;
