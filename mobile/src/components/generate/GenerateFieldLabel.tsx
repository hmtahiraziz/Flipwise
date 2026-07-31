import {Text} from 'react-native';
import {colors, fonts} from '../../config/theme';

/** Uppercase label — matches mockup tracking-widest / on-surface-variant */
export function GenerateFieldLabel({children}: {children: string}) {
  return (
    <Text
      style={{
        fontFamily: fonts.bodySemiBold,
        fontSize: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: colors.onSurfaceVariant,
        marginLeft: 4,
        marginBottom: 8,
      }}>
      {children}
    </Text>
  );
}
