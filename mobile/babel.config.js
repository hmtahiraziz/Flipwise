module.exports = {
  presets: [
    ['babel-preset-expo', {jsxImportSource: 'nativewind'}],
    'nativewind/babel',
  ],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        allowUndefined: true,
      },
    ],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-worklets/plugin', // must stay last (Reanimated 4+)
  ],
};
