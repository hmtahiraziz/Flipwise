/** Expo config — embedded at native build time via expo-constants. */
module.exports = {
  name: 'Flipwise',
  slug: 'flipwise',
  scheme: 'flipwise',
  version: '1.0.0',
  android: {
    package: 'com.flipwise.app',
    // Internet is declared in AndroidManifest. Document picker uses the
    // system file picker (SAF) and does not need broad storage permissions.
  },
  ios: {
    bundleIdentifier: 'com.flipwise.app',
  },
};
