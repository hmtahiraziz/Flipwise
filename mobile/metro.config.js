const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');

const config = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    blockList: [
      /.*[/\\]android[/\\]\.cxx[/\\].*/,
      /.*[/\\]android[/\\]build[/\\].*/,
    ],
  },
});

module.exports = withNativeWind(config, {input: './global.css'});
