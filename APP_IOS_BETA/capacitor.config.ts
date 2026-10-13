import type { CapacitorConfig } from '@capacitor/cli';

// LAB-only prototype. Do not point the native shell to production financial data.
const config: CapacitorConfig = {
  appId: 'com.fluxia.beta',
  appName: 'Fluxia BETA',
  webDir: 'www',
  server: { iosScheme: 'capacitor' },
  ios: { contentInset: 'automatic' },
};
export default config;
