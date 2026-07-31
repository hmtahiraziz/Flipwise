import {useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AUTH_LAYOUT} from './authTheme';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

export function useAuthLayout() {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isLandscape = width > height;
  const shortSide = Math.min(width, height);
  const isNarrow = width < 360;
  const isCompactHeight = height < 700 || (isLandscape && height < 520);
  const isVeryCompactHeight = height < 620 || (isLandscape && height < 440);
  const isTablet = shortSide >= 600;

  const containerPadding = isTablet ? 24 : isNarrow ? 16 : AUTH_LAYOUT.containerPadding;
  const contentMaxWidth = Math.min(isTablet ? 420 : 400, width - containerPadding * 2);

  const heightScale = clamp(isLandscape ? height / 390 : height / 844, 0.78, 1.08);

  const titleSize = Math.round(clamp(30 * heightScale, 24, isTablet ? 34 : 30));
  const headlineSize = Math.round(clamp(32 * heightScale, 24, isTablet ? 36 : 32));
  const bodySize = Math.round(clamp(16 * heightScale, 14, 16));
  const logoSize = Math.round(clamp(34 * heightScale, 28, 38));
  const formPadding = Math.round(lerp(height, 440, 844, 20, 24));
  const inputHeight = Math.round(clamp(48 * heightScale, 44, 48));
  const inputRadius = AUTH_LAYOUT.inputRadius;
  const buttonHeight = Math.round(clamp(56 * heightScale, 48, 56));
  const sectionGap = Math.round(isVeryCompactHeight ? 18 : isCompactHeight ? 22 : 28);
  const fieldGap = Math.round(isVeryCompactHeight ? 14 : 18);
  const dividerGap = Math.round(isVeryCompactHeight ? 20 : isCompactHeight ? 24 : 28);
  const footerMarginTop = Math.round(isCompactHeight ? 20 : 24);

  return {
    width,
    height,
    insets,
    containerPadding,
    contentMaxWidth,
    titleSize,
    headlineSize,
    bodySize,
    logoSize,
    formPadding,
    inputHeight,
    inputRadius,
    buttonHeight,
    sectionGap,
    fieldGap,
    dividerGap,
    footerMarginTop,
    isCompactHeight,
    isVeryCompactHeight,
    isLandscape,
    isTablet,
    isNarrow,
  };
}
