import {useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {libraryTokens} from '../config/libraryTokens';

/** Layout hook tuned for the My Library screen (480px phone column). */
export function useLibraryLayout(enableTwoColumnGrid = false) {
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isNarrow = width < 360;
  const isTablet = width >= 480;
  const isDesktop = width >= 1024;
  const horizontalPadding = isNarrow ? 16 : libraryTokens.containerPadding;
  const contentMaxWidth = Math.min(
    isDesktop ? libraryTokens.contentMaxWidthWide : libraryTokens.contentMaxWidth,
    width - horizontalPadding * 2,
  );
  const numColumns =
    enableTwoColumnGrid && isDesktop ? 2 : 1;
  const tabBarClearance = libraryTokens.navBarClearance;
  const fabClearance = 96;

  return {
    width,
    insets,
    horizontalPadding,
    contentMaxWidth,
    isNarrow,
    isTablet,
    isDesktop,
    numColumns,
    sectionGap: libraryTokens.sectionGap,
    tabScrollBottomPadding: Math.max(insets.bottom, 16) + tabBarClearance,
    fabBottomOffset: fabClearance,
  };
}

export function libraryContentStyle(
  layout: ReturnType<typeof useLibraryLayout>,
  extraBottom = 0,
) {
  return {
    paddingHorizontal: layout.horizontalPadding,
    paddingTop: 0,
    paddingBottom: extraBottom,
    maxWidth: layout.contentMaxWidth,
    width: '100%' as const,
    alignSelf: 'center' as const,
  };
}
