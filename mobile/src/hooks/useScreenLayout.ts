import {useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {libraryTokens} from '../config/libraryTokens';

const DEFAULT_PADDING = 20;
const MAX_CONTENT_WIDTH = 672;

export function useScreenLayout(maxWidth = MAX_CONTENT_WIDTH) {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isNarrow = width < 360;
  const isCompact = width < 400;
  const isWide = width >= 640;
  const isTablet = width >= 768;

  const horizontalPadding = isNarrow ? 16 : DEFAULT_PADDING;
  const contentMaxWidth = Math.min(maxWidth, width - horizontalPadding * 2);
  const footerBottom = Math.max(insets.bottom, 12) + 16;
  const tabBarClearance = libraryTokens.navBarClearance;
  const stickyFooterClearance = 88;

  return {
    width,
    height,
    insets,
    horizontalPadding,
    contentMaxWidth,
    isNarrow,
    isCompact,
    isWide,
    isTablet,
    footerBottom,
    tabBarClearance,
    stickyFooterClearance,
    scrollBottomPadding: footerBottom + stickyFooterClearance,
    tabScrollBottomPadding: Math.max(insets.bottom, 16) + tabBarClearance,
  };
}

export function contentContainerStyle(
  layout: ReturnType<typeof useScreenLayout>,
  extraBottom = 0,
) {
  return {
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: layout.isTablet ? 32 : 24,
    paddingBottom: extraBottom,
    maxWidth: layout.contentMaxWidth,
    width: '100%' as const,
    alignSelf: 'center' as const,
  };
}
