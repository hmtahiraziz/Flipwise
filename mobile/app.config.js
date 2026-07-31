/** Expo config — embedded at native build time via expo-constants. */
module.exports = {
  name: 'Flipwise',
  slug: 'flipwise',
  scheme: 'flipwise',
  version: '1.0.0',
  android: {
    package: 'com.flipwise.app',
    permissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
  },
  ios: {
    bundleIdentifier: 'com.flipwise.app',
  },
};
