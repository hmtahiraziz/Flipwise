import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ScrollView, Text, View, useWindowDimensions} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import {fonts} from '../../config/theme';
import {useOnboardingLayout, type OnboardingLayout} from './onboardingLayout';
import {ONBOARDING, onboarding} from './onboardingTheme';

export type OnboardingSlideData = {
  id: string;
  headline: string;
  body: string;
  showBrand?: boolean;
  cardIcon: string;
};

type OnboardingSlideProps = {
  slide: OnboardingSlideData;
  index: number;
  scrollX: SharedValue<number>;
};

export function OnboardingSlide({slide, index, scrollX}: OnboardingSlideProps) {
  const {width} = useWindowDimensions();
  const layout = useOnboardingLayout();

  const contentStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, 20],
      Extrapolation.CLAMP,
    );
    return {opacity, transform: [{translateY}]};
  });

  return (
    <View style={{width, flex: 1, paddingHorizontal: layout.containerPadding}}>
      <DecorativeCards layout={layout} />

      <Animated.View style={[contentStyle, {flex: 1}]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={layout.isCompactHeight}
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: layout.mainHeight,
            alignItems: 'center',
            justifyContent: layout.shouldCenterContent ? 'center' : 'flex-start',
            paddingTop: layout.isCompactHeight ? 4 : layout.isTablet ? 12 : 0,
            paddingBottom: layout.isLandscape ? 8 : 16,
          }}>
          {slide.showBrand ? (
            <View style={{alignItems: 'center', marginBottom: layout.sectionGap}}>
              <LogoMark size={layout.logoSize} gap={layout.logoGap} />
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: layout.titleSize,
                  lineHeight: layout.titleSize + 8,
                  letterSpacing: layout.titleSize * -0.02,
                  color: onboarding.onSurface,
                  textAlign: 'center',
                }}>
                Flipwise AI
              </Text>
            </View>
          ) : null}

          <View
            style={{
              width: '100%',
              maxWidth: layout.contentMaxWidth,
              alignItems: 'center',
              marginBottom: layout.sectionGap,
              paddingHorizontal: layout.isNarrow ? 0 : 4,
            }}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: layout.headlineSize,
                lineHeight: layout.headlineSize + 8,
                letterSpacing: -0.24,
                color: onboarding.onSurface,
                textAlign: 'center',
              }}>
              {slide.headline}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: layout.bodySize,
                lineHeight: layout.bodyLineHeight,
                color: onboarding.muted,
                textAlign: 'center',
                marginTop: layout.elementGap,
                maxWidth: layout.bodyMaxWidth,
              }}>
              {slide.body}
            </Text>
          </View>

          <CardPreview
            icon={slide.cardIcon}
            width={layout.cardPreviewWidth}
            height={layout.cardPreviewHeight}
          />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function LogoMark({size, gap}: {size: number; gap: number}) {
  const radius = Math.round(size * (ONBOARDING.logoRadius / ONBOARDING.logoSize));
  const offset = Math.round(size * 0.0625);

  return (
    <View
      style={{
        width: size + offset,
        height: size + offset,
        marginBottom: gap,
        transform: [{rotate: '-3deg'}],
      }}>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: onboarding.primaryContainer,
          borderWidth: 1,
          borderColor: onboarding.onSurface,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: onboarding.background,
          borderWidth: 1,
          borderColor: onboarding.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <MaterialIcons name="auto-awesome" size={size * 0.45} color={onboarding.onSurface} />
      </View>
    </View>
  );
}

function CardPreview({
  icon,
  width,
  height,
}: {
  icon: string;
  width: number;
  height: number;
}) {
  const radius = Math.round(width * (ONBOARDING.cardRadiusLg / ONBOARDING.cardMaxWidth));
  const iconSize = Math.round(width * 0.171);
  const barWide = Math.round(width * 0.343);
  const barNarrow = Math.round(width * 0.229);
  const barHeight = Math.max(6, Math.round(width * 0.029));

  return (
    <View style={{width, height}}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: radius,
          backgroundColor: onboarding.background,
          borderWidth: 1,
          borderColor: onboarding.border,
          opacity: 0.5,
          transform: [{rotate: '-4deg'}, {translateY: Math.round(height * 0.044)}],
        }}
      />
      <View style={{width, height}}>
        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width,
            height,
            borderRadius: radius,
            backgroundColor: onboarding.silhouette,
          }}
        />
        <View
          style={{
            width,
            height,
            borderRadius: radius,
            backgroundColor: onboarding.background,
            borderWidth: 1,
            borderColor: onboarding.border,
            alignItems: 'center',
            justifyContent: 'center',
            padding: width * 0.086,
          }}>
          <View
            style={{
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 2,
              backgroundColor: onboarding.surfaceContainer,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: Math.round(height * 0.067),
            }}>
            <MaterialIcons name={icon} size={iconSize * 0.5} color={onboarding.primary} />
          </View>
          <View
            style={{
              width: barWide,
              height: barHeight,
              borderRadius: barHeight / 2,
              backgroundColor: onboarding.surfaceContainer,
              marginBottom: Math.round(barHeight),
            }}
          />
          <View
            style={{
              width: barNarrow,
              height: barHeight,
              borderRadius: barHeight / 2,
              backgroundColor: onboarding.surfaceContainer,
              opacity: 0.6,
            }}
          />
        </View>
      </View>
    </View>
  );
}

function DecorativeCards({layout}: {layout: OnboardingLayout}) {
  const {decorativeLeft: left, decorativeRight: right} = layout;
  const radius = ONBOARDING.cardRadiusLg;

  return (
    <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} pointerEvents="none">
      <View
        style={{
          position: 'absolute',
          top: left.top,
          left: left.left,
          width: left.width,
          height: left.height,
          borderRadius: radius,
          backgroundColor: onboarding.background,
          borderWidth: 1,
          borderColor: onboarding.border,
          opacity: layout.isLandscape ? 0.25 : 0.4,
          transform: [{rotate: '-15deg'}],
        }}>
        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: left.width,
            height: left.height,
            borderRadius: radius,
            backgroundColor: onboarding.silhouette,
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: right.bottom,
          right: right.right,
          width: right.width,
          height: right.height,
          borderRadius: radius,
          backgroundColor: onboarding.background,
          borderWidth: 1,
          borderColor: onboarding.border,
          opacity: layout.isLandscape ? 0.2 : 0.3,
          transform: [{rotate: '12deg'}],
        }}>
        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: right.width,
            height: right.height,
            borderRadius: radius,
            backgroundColor: onboarding.silhouette,
          }}
        />
      </View>
    </View>
  );
}
