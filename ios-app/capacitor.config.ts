import type { CapacitorConfig } from '@capacitor/cli';

// iOS development shell. Production/PWA URLs are deliberately not changed.
const config: CapacitorConfig = {
  appId: 'com.fluxia.elite.beta',
  appName: 'Fluxia BETA',
  webDir: 'www',
  bundledWebRuntime: false,
  ios: { contentInset: 'automatic' },
};
export default config;
