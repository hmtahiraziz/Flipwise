import {View} from 'react-native';

type OnboardingBlobProps = {
  color: string;
  size?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
};

export function OnboardingBlob({
  color,
  size = 180,
  top,
  left,
  right,
  bottom,
}: OnboardingBlobProps) {
  return (
    <View
      pointerEvents="none"
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity: 0.15,
        top,
        left,
        right,
        bottom,
      }}
    />
  );
}
