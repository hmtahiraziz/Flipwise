import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {useOnboardingLayout} from './onboardingLayout';
import {onboarding} from './onboardingTheme';

type OnboardingNextButtonProps = {
  label: string;
  onPress: () => void;
};

const PRESS_OFFSET = 2;

export function OnboardingNextButton({label, onPress}: OnboardingNextButtonProps) {
  const layout = useOnboardingLayout();
  const radius = layout.buttonHeight / 2;

  return (
    <View style={{width: '100%', height: layout.buttonHeight + PRESS_OFFSET}}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{width: '100%', height: layout.buttonHeight + PRESS_OFFSET}}>
        {({pressed}) => (
          <View
            style={{
              width: '100%',
              height: layout.buttonHeight,
              borderRadius: radius,
              backgroundColor: onboarding.primaryContainer,
              borderWidth: 1,
              borderColor: onboarding.onSurface,
              borderBottomWidth: pressed ? 1 : 3,
              transform: [{translateY: pressed ? PRESS_OFFSET : 0}],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: layout.bodySize,
                lineHeight: layout.bodyLineHeight,
                color: onboarding.onSurface,
              }}>
              {label}
            </Text>
            <MaterialIcons
              name="arrow-forward"
              size={Math.round(layout.bodySize * 1.5)}
              color={onboarding.onSurface}
              style={{marginLeft: 8}}
            />
          </View>
        )}
      </Pressable>
    </View>
  );
}
