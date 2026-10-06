/** Onboarding tokens — Electric Repetition. */
import {brandColors, lightColors} from '../../config/theme';

export const onboarding = {
  background: brandColors.background,
  onSurface: brandColors.charcoal,
  dotActive: brandColors.charcoal,
  muted: brandColors.muted,
  primaryContainer: brandColors.lime,
  primary: lightColors.primary,
  surfaceContainer: lightColors.surfaceContainer,
  border: brandColors.border,
  silhouette: brandColors.background,
} as const;

export const ONBOARDING = {
  containerPadding: 16,
  headerHeight: 64,
  footerPaddingBottom: 40,
  footerGap: 32,
  buttonMaxWidth: 384,
  buttonHeight: 56,
  contentMaxWidth: 448,
  cardMaxWidth: 280,
  cardAspectRatio: 180 / 280,
  sectionGap: 24,
  elementGap: 16,
  logoSize: 80,
  logoRadius: 12,
  cardRadiusLg: 20,
} as const;
