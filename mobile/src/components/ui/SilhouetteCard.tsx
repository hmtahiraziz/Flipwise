import type {ReactNode} from 'react';
import {View, type ViewProps, type ViewStyle} from 'react-native';
import {colors} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';

type SilhouetteCardProps = ViewProps & {
  children: ReactNode;
  offset?: number;
  borderRadius?: number;
  /** Review card stack matches HTML mock; default is library style. */
  variant?: 'library' | 'review';
};

export function SilhouetteCard({
  children,
  offset = 4,
  borderRadius = libraryTokens.cardRadius,
  variant = 'library',
  className,
  style,
  ...props
}: SilhouetteCardProps) {
  const isReview = variant === 'review';

  const containerStyle: ViewStyle = isReview
    ? {position: 'relative'}
    : {position: 'relative', paddingBottom: offset, paddingRight: offset};

  const shadowStyle = isReview
    ? {
        position: 'absolute' as const,
        top: reviewTokens.stackOffset,
        left: reviewTokens.stackOffset,
        right: -reviewTokens.stackOffset,
        bottom: -reviewTokens.stackOffset,
        borderRadius: reviewTokens.cardRadius,
        backgroundColor: reviewTokens.cardStack,
        borderWidth: 1,
        borderColor: reviewTokens.border,
        zIndex: 0,
        elevation: 0,
      }
    : {
        position: 'absolute' as const,
        top: offset,
        left: offset,
        right: 0,
        bottom: 0,
        borderRadius,
        backgroundColor: colors.silhouette,
        zIndex: 0,
        elevation: 0,
      };

  return (
    <View className={className} style={[containerStyle, style]} {...props}>
      <View pointerEvents="none" style={shadowStyle} />
      <View style={{position: 'relative', zIndex: 1, elevation: 1, width: '100%'}}>
        {children}
      </View>
    </View>
  );
}
