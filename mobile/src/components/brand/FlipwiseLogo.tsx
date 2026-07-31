import Svg, {Rect} from 'react-native-svg';
import {brandColors} from '../../config/brand';

type FlipwiseLogoProps = {
  size?: number;
  frontColor?: string;
  backColor?: string;
};

/** Flipwise mark — two stacked cards (transparent background). */
export function FlipwiseLogo({
  size = 56,
  frontColor = brandColors.lime,
  backColor = brandColors.cardBack,
}: FlipwiseLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="14" y="16" width="22" height="22" rx="6" fill={backColor} />
      <Rect x="10" y="12" width="22" height="22" rx="6" fill={frontColor} />
    </Svg>
  );
}
