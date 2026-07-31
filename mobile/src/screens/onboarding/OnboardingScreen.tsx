import {useCallback, useMemo, useRef, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {useOnboardingStore} from '../../store/onboardingStore';
import {OnboardingNextButton} from '../../components/onboarding/OnboardingNextButton';
import {OnboardingPager, type OnboardingPagerHandle} from '../../components/onboarding/OnboardingPager';
import type {OnboardingSlideData} from '../../components/onboarding/OnboardingSlide';
import {PageIndicator} from '../../components/onboarding/PageIndicator';
import {useOnboardingLayout} from '../../components/onboarding/onboardingLayout';
import {onboarding} from '../../components/onboarding/onboardingTheme';

export function OnboardingScreen() {
  const layout = useOnboardingLayout();
  const completeOnboarding = useOnboardingStore(state => state.completeOnboarding);
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<OnboardingPagerHandle>(null);

  const slides = useMemo<OnboardingSlideData[]>(
    () => [
      {
        id: 'welcome',
        showBrand: true,
        headline: 'Welcome to Flipwise',
        body: 'AI-powered flashcards that adapt to how you learn. Study smarter, retain more, and master any subject with personalized spaced-repetition.',
        cardIcon: 'downloading',
      },
      {
        id: 'generate',
        headline: 'Generate in seconds',
        body: 'Turn notes, PDFs, or topics into study-ready cards with AI — no manual entry required.',
        cardIcon: 'auto-awesome',
      },
      {
        id: 'remember',
        headline: 'Remember for good',
        body: 'Spaced repetition schedules reviews when you need them, so knowledge sticks long after your first session.',
        cardIcon: 'schedule',
      },
    ],
    [],
  );

  const isLastSlide = activeIndex === slides.length - 1;

  const finish = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const handlePrimary = useCallback(() => {
    if (isLastSlide) {
      finish();
      return;
    }
    pagerRef.current?.scrollToIndex(activeIndex + 1);
  }, [activeIndex, finish, isLastSlide]);

  return (
    <View style={{flex: 1, backgroundColor: onboarding.background}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingHorizontal: layout.containerPadding,
          minHeight: layout.headerHeight,
          paddingTop: layout.insets.top,
        }}>
        {!isLastSlide ? (
          <Pressable onPress={finish} hitSlop={12} style={{paddingVertical: 8, paddingHorizontal: 16}}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: layout.bodySize,
                lineHeight: layout.bodyLineHeight,
                color: onboarding.muted,
              }}>
              Skip
            </Text>
          </Pressable>
        ) : (
          <View style={{width: 64}} />
        )}
      </View>

      <View style={{flex: 1}}>
        <OnboardingPager
          ref={pagerRef}
          slides={slides}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
        />
      </View>

      <View
        style={{
          width: '100%',
          paddingHorizontal: layout.containerPadding,
          paddingTop: layout.isLandscape ? 4 : 8,
          paddingBottom: Math.max(layout.insets.bottom, layout.footerPaddingBottom),
          alignItems: 'stretch',
          gap: layout.footerGap,
          backgroundColor: onboarding.background,
        }}>
        <View style={{alignSelf: 'center'}}>
          <PageIndicator count={slides.length} activeIndex={activeIndex} />
        </View>
        <View style={{width: '100%', maxWidth: layout.buttonMaxWidth, alignSelf: 'center'}}>
          <OnboardingNextButton
            label={isLastSlide ? 'Get Started' : 'Next'}
            onPress={handlePrimary}
          />
        </View>
      </View>
    </View>
  );
}
