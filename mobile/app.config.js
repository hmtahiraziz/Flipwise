/** Expo config — embedded at native build time via expo-constants. */
module.exports = {
  name: 'Flipwise',
  slug: 'flipwise',
  scheme: 'flipwise',
  version: '1.0.0',
  android: {
    package: 'com.flipwise.app',
    permissions: ['CAMERA', 'READ_MEDIA_IMAGES'],
  },
  ios: {
    bundleIdentifier: 'com.flipwise.app',
    infoPlist: {
      NSCameraUsageDescription:
        'Flipwise uses the camera to scan handwritten or printed study notes.',
      NSPhotoLibraryUsageDescription:
        'Flipwise accesses your photos so you can import scanned notes.',
    },
  },
  plugins: [
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow Flipwise to access your photos for note scanning.',
        cameraPermission:
          'Allow Flipwise to use your camera to scan study notes.',
      },
    ],
  ],
};
