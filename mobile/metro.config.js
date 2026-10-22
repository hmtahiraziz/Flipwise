const fs = require('fs');
const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withNativeWind} = require('nativewind/metro');

const kcSrc = path.resolve(
  __dirname,
  'node_modules/react-native-keyboard-controller/src',
);

function fileIfExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
      ? filePath
      : null;
  } catch {
    return null;
  }
}

function resolveKcRelative(fromDir, moduleName, platform) {
  const base = path.resolve(fromDir, moduleName);
  const candidates = [
    `${base}.${platform}.tsx`,
    `${base}.${platform}.ts`,
    `${base}.native.tsx`,
    `${base}.native.ts`,
    `${base}.tsx`,
    `${base}.ts`,
    `${base}.jsx`,
    `${base}.js`,
    path.join(base, `index.${platform}.tsx`),
    path.join(base, `index.${platform}.ts`),
    path.join(base, 'index.native.tsx'),
    path.join(base, 'index.native.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
    path.join(base, 'index.jsx'),
    path.join(base, 'index.js'),
  ];
  for (const candidate of candidates) {
    const hit = fileIfExists(candidate);
    if (hit) {
      return hit;
    }
  }
  return null;
}

const baseConfig = mergeConfig(getDefaultConfig(__dirname), {
  resolver: {
    blockList: [
      /.*[/\\]android[/\\]\.cxx[/\\].*/,
      /.*[/\\]android[/\\]build[/\\].*/,
    ],
  },
});

const config = withNativeWind(baseConfig, {input: './global.css'});
const upstreamResolveRequest = config.resolver.resolveRequest;

// Apply AFTER withNativeWind so NativeWind does not wipe this resolver.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-keyboard-controller') {
    return {type: 'sourceFile', filePath: path.join(kcSrc, 'index.ts')};
  }

  const origin = context.originModulePath?.replace(/\\/g, '/') ?? '';
  if (
    origin.includes('/react-native-keyboard-controller/src/') &&
    (moduleName.startsWith('./') || moduleName.startsWith('../'))
  ) {
    const filePath = resolveKcRelative(
      path.dirname(context.originModulePath),
      moduleName,
      platform,
    );
    if (filePath) {
      return {type: 'sourceFile', filePath};
    }
  }

  if (typeof upstreamResolveRequest === 'function') {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
