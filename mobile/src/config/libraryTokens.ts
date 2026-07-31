/** Design tokens for the My Library screen — single source of truth for pixel-match. */
export const libraryTokens = {
  background: '#F5F6F3',
  surface: '#FFFFFF',
  ink: '#1A1A1A',
  muted: '#6B7280',
  mutedSubtitle: '#6B7280',
  border: '#E5E7EB',
  borderSubtle: 'rgba(229, 231, 235, 0.85)',
  primary: '#516600',
  primaryContainer: '#C6F135',
  onPrimaryContainer: '#556B00',
  secondaryContainer: '#DFE0DD',
  onSecondaryContainer: '#616361',
  tertiary: '#476178',
  tertiaryContainer: '#C9E4FF',
  error: '#EF4444',
  errorMuted: '#FEF2F2',
  errorContainer: '#FFDAD6',
  warning: '#F59E0B',
  warningBar: '#FBBF24',
  surfaceContainerLow: '#F2F3F7',
  fabDark: '#1A1A1A',
  fabSize: 56,
  navBarBottomInset: 8,
  navBarTopInset: 8,
  navBarPadding: 6,
  navTabPaddingX: 20,
  navTabPaddingY: 6,
  navIconSize: 22,
  navLabelSize: 10,
  navBarClearance: 88,
  minTapTarget: 44,
  containerPadding: 20,
  sectionGap: 32,
  elementGap: 12,
  cardRadius: 24,
  contentMaxWidth: 480,
  contentMaxWidthWide: 672,
} as const;

/** Soft card shadow — matches reference: 0 4px 12px rgba(0,0,0,0.05) */
export const libraryCardShadow = {
  shadowColor: '#000000',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.05,
  shadowRadius: 12,
  elevation: 2,
} as const;

export const libraryFabShadow = {
  shadowColor: '#000000',
  shadowOffset: {width: 0, height: 10},
  shadowOpacity: 0.22,
  shadowRadius: 20,
  elevation: 12,
} as const;

export const libraryNavShadow = {
  shadowColor: '#000000',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 6,
} as const;

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
        background: libraryTokens.primaryContainer,
        text: libraryTokens.onPrimaryContainer,
        border: false,
      };
    case 'new':
      return {
        background: libraryTokens.errorMuted,
        text: libraryTokens.error,
        border: true,
      };
    default:
      return {
        background: libraryTokens.secondaryContainer,
        text: libraryTokens.onSecondaryContainer,
        border: false,
      };
  }
}

export function statusIconStyle(variant: DeckStatusVariant) {
  switch (variant) {
    case 'excellent':
      return {
        background: 'rgba(198, 241, 53, 0.1)',
        icon: libraryTokens.primary,
      };
    case 'new':
      return {
        background: 'rgba(255, 218, 214, 0.4)',
        icon: libraryTokens.error,
      };
    default:
      return {
        background: 'rgba(201, 228, 255, 0.3)',
        icon: libraryTokens.tertiary,
      };
  }
}
