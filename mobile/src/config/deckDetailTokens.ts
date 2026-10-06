/** Deck detail tokens — Electric Repetition / Stitch. */
import {brandColors, lightColors} from './theme';

export const deckDetailTokens = {
  brand: brandColors.lime,
  brandMuted: 'rgba(199, 245, 43, 0.22)',
  surface: brandColors.background,
  surfaceWarm: lightColors.surfaceContainerLow,
  surfaceContainer: brandColors.surface,
  ink: brandColors.charcoal,
  mutedText: brandColors.muted,
  primary: lightColors.primary,
  secondaryContainer: lightColors.secondaryContainer,
  onSecondaryContainer: lightColors.onSecondaryContainer,
  tertiaryContainer: brandColors.paleLime,
  border: brandColors.border,
  borderStrong: brandColors.border,
  borderSubtle: 'rgba(228, 231, 220, 0.85)',
  error: brandColors.dangerIcon,
  errorMuted: brandColors.dangerBg,
  cardRadius: 20,
  containerPadding: 16,
  sectionGap: 20,
  statGap: 10,
} as const;
