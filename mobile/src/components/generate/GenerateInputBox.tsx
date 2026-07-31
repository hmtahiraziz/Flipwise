import type {ReactNode} from 'react';
import {View, type ViewStyle} from 'react-native';
import {libraryTokens, libraryCardShadow} from '../../config/libraryTokens';

type GenerateInputBoxProps = {
  focused?: boolean;
  children: ReactNode;
  style?: ViewStyle;
};

/** Rounded-2xl white input shell — mockup focus ring via border color */
export function GenerateInputBox({focused, children, style}: GenerateInputBoxProps) {
  return (
    <View
      style={[
        {
          borderRadius: 20,
          borderWidth: focused ? 2 : 1,
          borderColor: focused ? libraryTokens.primaryContainer : libraryTokens.border,
          backgroundColor: libraryTokens.surface,
          padding: 16,
          ...libraryCardShadow,
          shadowOpacity: 0.06,
        },
        focused
          ? {
              shadowColor: libraryTokens.primaryContainer,
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }
          : null,
        style,
      ]}>
      {children}
    </View>
  );
}
