import {useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ONBOARDING} from './onboardingTheme';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

export type OnboardingLayout = ReturnType<typeof useOnboardingLayout>;

export function useOnboardingLayout() {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isLandscape = width > height;
  const shortSide = Math.min(width, height);
  const isTablet = shortSide >= 600;
  const isNarrow = width < 360;
  const isCompactHeight = height < 700 || (isLandscape && height < 520);
  const isVeryCompactHeight = height < 620 || (isLandscape && height < 440);

  const containerPadding = isTablet ? 24 : isNarrow ? 16 : ONBOARDING.containerPadding;
  const horizontalInset = containerPadding * 2;
  const contentWidth = width - horizontalInset;

  const heightScale = clamp(
    isLandscape ? height / 390 : height / 844,
    0.78,
    1.08,
  );

  const sectionGap = Math.round(
    isVeryCompactHeight ? 16 : isCompactHeight ? 20 : isTablet ? 36 : ONBOARDING.sectionGap,
  );
  const elementGap = Math.round(isVeryCompactHeight ? 12 : ONBOARDING.elementGap);
  const footerGap = Math.round(
    isVeryCompactHeight ? 20 : isCompactHeight ? 24 : ONBOARDING.footerGap,
  );
  const footerPaddingBottom = Math.round(
    isVeryCompactHeight ? 24 : ONBOARDING.footerPaddingBottom,
  );

  const logoSize = Math.round(
    clamp(ONBOARDING.logoSize * heightScale, isVeryCompactHeight ? 60 : 68, isTablet ? 88 : 80),
  );
  const logoGap = Math.round(lerp(height, 440, 844, 16, 24));

  const titleSize = Math.round(clamp(32 * heightScale, 26, isTablet ? 36 : 32));
  const headlineSize = Math.round(clamp(24 * heightScale, 20, isTablet ? 28 : 24));
  const bodySize = Math.round(clamp(16 * heightScale, 14, 16));
  const bodyLineHeight = Math.round(bodySize * 1.5);

  const cardPreviewWidth = Math.round(
    clamp(contentWidth * (isTablet ? 0.55 : 0.92), 220, ONBOARDING.cardMaxWidth),
  );
  const cardPreviewHeight = Math.round(cardPreviewWidth * ONBOARDING.cardAspectRatio);

  const buttonHeight = Math.round(
    clamp(ONBOARDING.buttonHeight * heightScale, 48, ONBOARDING.buttonHeight),
  );
  const buttonMaxWidth = isTablet
    ? Math.min(contentWidth, 420)
    : ONBOARDING.buttonMaxWidth;

  const contentMaxWidth = Math.min(
    isTablet ? 520 : ONBOARDING.contentMaxWidth,
    contentWidth,
  );
  const bodyMaxWidth = Math.min(360, contentMaxWidth);

  const headerHeight = Math.round(
    (isVeryCompactHeight ? 52 : ONBOARDING.headerHeight) + insets.top,
  );

  const footerHeight =
    insets.bottom +
    footerPaddingBottom +
    footerGap +
    buttonHeight +
    8 +
    16;

  const mainHeight = Math.max(height - headerHeight - footerHeight, isLandscape ? 200 : 240);

  const decorativeScale = clamp(shortSide / 390, 0.75, isTablet ? 1.2 : 1);
  const decorativeLeft = {
    width: Math.round(192 * decorativeScale),
    height: Math.round(256 * decorativeScale),
    top: Math.round(height * (isLandscape ? 0.04 : 0.08)),
    left: Math.round(-20 * decorativeScale),
  };
  const decorativeRight = {
    width: Math.round(224 * decorativeScale),
    height: Math.round(288 * decorativeScale),
    bottom: Math.round(height * (isLandscape ? 0.1 : 0.18)),
    right: Math.round(-30 * decorativeScale),
  };

  return {
    width,
    height,
    insets,
    isLandscape,
    isTablet,
    isNarrow,
    isCompactHeight,
    isVeryCompactHeight,
    containerPadding,
    contentWidth,
    contentMaxWidth,
    bodyMaxWidth,
    cardPreviewWidth,
    cardPreviewHeight,
    buttonHeight,
    buttonMaxWidth,
    sectionGap,
    elementGap,
    footerGap,
    footerPaddingBottom,
    logoSize,
    logoGap,
    titleSize,
    headlineSize,
    bodySize,
    bodyLineHeight,
    headerHeight,
    mainHeight,
    decorativeLeft,
    decorativeRight,
    shouldCenterContent: !isCompactHeight && !isLandscape,
  };
}
