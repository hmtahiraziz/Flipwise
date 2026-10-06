import {useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {layout, spacing} from '../config/theme';
import {libraryTokens} from '../config/libraryTokens';

export function useScreenLayout(maxWidth: number = layout.contentMaxWidthTablet) {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isNarrow = width < 360;
  const isCompact = width < 400;
  const isWide = width >= layout.tabletBreakpoint;
  const isTablet = width >= 768;

  const horizontalPadding = isWide ? spacing.xl : spacing.md;
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
  layoutResult: ReturnType<typeof useScreenLayout>,
  extraBottom = 0,
) {
  return {
    paddingHorizontal: layoutResult.horizontalPadding,
    paddingTop: layoutResult.isTablet ? 32 : 16,
    paddingBottom: extraBottom,
    maxWidth: layoutResult.contentMaxWidth,
    width: '100%' as const,
    alignSelf: 'center' as const,
  };
}
