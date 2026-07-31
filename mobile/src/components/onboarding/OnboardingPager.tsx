import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import {FlatList, useWindowDimensions, type ViewToken} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import {OnboardingSlide, type OnboardingSlideData} from './OnboardingSlide';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<OnboardingSlideData>);

export type OnboardingPagerHandle = {
  scrollToIndex: (index: number) => void;
};

type OnboardingPagerProps = {
  slides: OnboardingSlideData[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

export const OnboardingPager = forwardRef<OnboardingPagerHandle, OnboardingPagerProps>(
  function OnboardingPager({slides, activeIndex, onIndexChange}, ref) {
    const {width} = useWindowDimensions();
    const scrollX = useSharedValue(0);
    const listRef = useRef<FlatList<OnboardingSlideData>>(null);

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: event => {
        scrollX.value = event.contentOffset.x;
      },
    });

    const onViewableItemsChanged = useCallback(
      ({viewableItems}: {viewableItems: ViewToken[]}) => {
        const index = viewableItems[0]?.index;
        if (index != null && index !== activeIndex) {
          onIndexChange(index);
        }
      },
      [activeIndex, onIndexChange],
    );

    const viewabilityConfig = useRef({viewAreaCoveragePercentThreshold: 60}).current;

    const scrollToIndex = useCallback(
      (index: number) => {
        listRef.current?.scrollToIndex({index, animated: true});
        onIndexChange(index);
      },
      [onIndexChange],
    );

    useImperativeHandle(ref, () => ({scrollToIndex}), [scrollToIndex]);

    return (
      <AnimatedFlatList
        ref={listRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({item, index}) => (
          <OnboardingSlide slide={item} index={index} scrollX={scrollX} />
        )}
      />
    );
  },
);

export type {OnboardingSlideData};
