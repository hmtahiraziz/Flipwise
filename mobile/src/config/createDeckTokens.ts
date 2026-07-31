/** Tokens for Create / Edit deck screens — matches New Deck Stitch mock. */
export const createDeckTokens = {
  background: '#F6F7F1',
  footerBackground: '#F5F6F3',
  ink: '#14171A',
  helperText: '#82887A',
  inputBg: '#F7F8F5',
  cardRadius: 24,
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
  focusBorder: '#C6F135',
  previewBadgeBg: 'rgba(255, 255, 255, 0.5)',
  previewDot: '#C6F135',
  buttonText: '#14171A',
  accentSwatches: ['#C6F135', '#F7F8F5', '#C9E4FF', '#FFDAD6', '#E2E3E0'] as const,
} as const;

export type DeckAccentColor = (typeof createDeckTokens.accentSwatches)[number];
