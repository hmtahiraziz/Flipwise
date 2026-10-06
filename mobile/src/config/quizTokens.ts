/** Practice quiz tokens — Electric Repetition / Interactive AI Quiz. */
import {brandColors, lightColors} from './theme';

export const quizTokens = {
  background: brandColors.background,
  surface: brandColors.surface,
  surfaceLow: lightColors.surfaceContainerLow,
  ink: brandColors.charcoal,
  muted: brandColors.muted,
  primary: lightColors.primary,
  brand: brandColors.lime,
  paleLime: brandColors.paleLime,
  olive: brandColors.olive,
  secondaryContainer: lightColors.secondaryContainer,
  onSecondaryContainer: lightColors.onSecondaryContainer,
  border: brandColors.border,
  borderSubtle: 'rgba(228, 231, 220, 0.85)',
  correctBg: brandColors.paleLime,
  correctBorder: brandColors.lime,
  correctText: brandColors.olive,
  wrongBg: brandColors.dangerBg,
  wrongBorder: '#F3C5C5',
  wrongText: brandColors.dangerIcon,
  cardRadius: 20,
  choiceRadius: 16,
} as const;
