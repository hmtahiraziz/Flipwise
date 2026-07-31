import {Text, View} from 'react-native';
import {APP_NAME} from '../../config/brand';
import {brandColors} from '../../config/brand';
import {colors, fonts} from '../../config/theme';
import {FlipwiseLogo} from './FlipwiseLogo';

type FlipwiseWordmarkProps = {
  /** Icon size for composed (light) variant */
  iconSize?: number;
  /** Total width for PNG lockups */
  width?: number;
  variant?: 'light' | 'dark-horizontal' | 'dark-stacked';
};

export function FlipwiseWordmark({
  iconSize = 40,
  width = 220,
  variant = 'light',
}: FlipwiseWordmarkProps) {
  if (variant === 'dark-stacked') {
    return (
      <View className="items-center" accessibilityLabel={APP_NAME}>
        <FlipwiseLogo size={Math.round(width * 0.42)} />
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: Math.round(width * 0.16),
            color: brandColors.lime,
            letterSpacing: -0.5,
            marginTop: 12,
          }}>
          {APP_NAME}
        </Text>
      </View>
    );
  }

  if (variant === 'dark-horizontal') {
    return (
      <View
        className="flex-row items-center"
        style={{gap: 12}}
        accessibilityLabel={APP_NAME}>
        <FlipwiseLogo size={Math.round(width * 0.18)} />
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: Math.round(width * 0.12),
            color: brandColors.lime,
            letterSpacing: -0.5,
          }}>
          {APP_NAME}
        </Text>
      </View>
    );
  }

  const fontSize = Math.round(iconSize * 0.85);

  return (
    <View className="flex-row items-center" style={{gap: Math.round(iconSize * 0.28)}}>
      <FlipwiseLogo size={iconSize} />
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize,
          color: colors.text,
          letterSpacing: -0.5,
        }}>
        {APP_NAME}
      </Text>
    </View>
  );
}

export {brandColors};
