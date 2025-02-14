
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
      minSdkVersion: 21, // Supports Android 5.0 and up (broad device compatibility)
      targetSdkVersion: 33,
    },
    navigationBarColor: "#000000",
    navigationBarDividerColor: "#000000",
    backgroundColor: "#000000"
  },
  ios: {
    contentInset: "always"
  },
  style: {
    androidStatusBar: {
      backgroundColor: "#000000",
      style: "dark",
      overlay: true, // This makes the status bar transparent
      translucent: true
    },
    androidNavigationBar: {
      backgroundColor: "#000000",
      style: "dark"
    }
  }
};

export default config;

