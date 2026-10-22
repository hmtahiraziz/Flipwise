/** Expo config — embedded at native build time via expo-constants. */
module.exports = {
  name: 'Cardweave',
  slug: 'cardweave',
  scheme: 'cardweave',
  version: '1.0.0',
  android: {
    package: 'com.cardweave.app',
    // CAMERA only — gallery uses the system photo picker (no READ_MEDIA_IMAGES).
    permissions: ['CAMERA'],
  },
  ios: {
    bundleIdentifier: 'com.cardweave.app',
    infoPlist: {
      NSCameraUsageDescription:
        'Cardweave uses the camera to scan handwritten or printed study notes and for optional profile photos.',
    },
  },
  plugins: [
    [
      'expo-image-picker',
      {
        // false = do not add READ_MEDIA_IMAGES / photo-library usage strings.
        // launchImageLibraryAsync uses the system picker without broad access.
        photosPermission: false,
        cameraPermission:
          'Allow Cardweave to use your camera to scan study notes or take a profile photo.',
      },
    ],
  ],
};
