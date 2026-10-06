/** Library / nav tokens aligned to Electric Repetition. */
import {brandColors, elevation, layout, lightColors} from './theme';

export const libraryTokens = {
  background: brandColors.background,
  surface: brandColors.surface,
  ink: brandColors.charcoal,
  muted: brandColors.muted,
  mutedSubtitle: brandColors.muted,
  border: brandColors.border,
  borderSubtle: 'rgba(228, 231, 220, 0.85)',
  primary: lightColors.primary,
  primaryContainer: brandColors.lime,
  onPrimaryContainer: brandColors.charcoal,
  secondaryContainer: lightColors.secondaryContainer,
  onSecondaryContainer: lightColors.onSecondaryContainer,
  tertiary: lightColors.tertiary,
  tertiaryContainer: brandColors.paleLime,
  error: brandColors.dangerIcon,
  errorMuted: brandColors.dangerBg,
  errorContainer: lightColors.errorContainer,
  warning: lightColors.warning,
  warningBar: lightColors.warningBar,
  surfaceContainerLow: lightColors.surfaceContainerLow,
  fabDark: brandColors.charcoal,
  fabSize: 56,
  navBarBottomInset: 16,
  navBarTopInset: 8,
  navBarPadding: 6,
  navTabPaddingX: 12,
  navTabPaddingY: 8,
  navIconSize: 22,
  navLabelSize: 10,
  navBarClearance: layout.tabBarClearance,
  minTapTarget: layout.minTouchTarget,
  containerPadding: 16,
  sectionGap: 24,
  elementGap: 12,
  cardRadius: 20,
  contentMaxWidth: layout.contentMaxWidthPhone,
  contentMaxWidthWide: layout.contentMaxWidthTablet,
} as const;

export const libraryCardShadow = elevation.tier1;

export const libraryFabShadow = {
  shadowColor: brandColors.charcoal,
  shadowOffset: {width: 0, height: 10},
  shadowOpacity: 0.18,
  shadowRadius: 20,
  elevation: 12,
} as const;

export const libraryNavShadow = elevation.tier2;

export type DeckStatusVariant = 'excellent' | 'active' | 'new';

export function masteryColorsFromPercent(percent: number) {
  if (percent >= 70) {
    return {
      bar: libraryTokens.primaryContainer,
      text: libraryTokens.primary,
    };
  }
  if (percent >= 30) {
    return {
      bar: libraryTokens.warningBar,
      text: libraryTokens.warning,
    };
  }
  return {
    bar: libraryTokens.error,
    text: libraryTokens.error,
  };
}

export function statusBadgeStyle(variant: DeckStatusVariant) {
  switch (variant) {
    case 'excellent':
      return {
        backgroundColor: brandColors.paleLime,
        color: brandColors.olive,
      };
    case 'active':
      return {
        backgroundColor: brandColors.lime,
        color: brandColors.charcoal,
      };
    default:
      return {
        backgroundColor: lightColors.surfaceContainer,
        color: brandColors.muted,
      };
  }
}

export function statusIconStyle(variant: DeckStatusVariant) {
  return statusBadgeStyle(variant);
}
