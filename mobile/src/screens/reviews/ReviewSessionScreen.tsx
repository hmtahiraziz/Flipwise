import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  FlipCard,
  ReviewBackground,
  ReviewProgress,
} from '../../components/review/FlipCard';
import {RatingBar} from '../../components/review/RatingBar';
import {ReviewSessionHeader} from '../../components/review/ReviewSessionHeader';
import {LibraryProfileButton} from '../../components/library/LibraryHeader';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {Button} from '../../components/ui/Button';
import {toast} from '../../components/ui/Toast';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {getApiErrorMessage} from '../../lib/errors';
import {useReviewMutations, useReviewQueue} from '../../hooks/useReviews';
import type {ReviewStackParamList} from '../../navigation/types';
import type {EaseRating, ReviewQueueItem} from '../../types/api';

type Props = NativeStackScreenProps<ReviewStackParamList, 'ReviewSession'>;

const TAB_BAR_CLEARANCE = 100;

export function ReviewSessionScreen({navigation, route}: Props) {
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const maxContentWidth = Math.min(width - 40, 448);
  const deckId = route.params?.deckId;
  const {user} = useAppUser();
  const {openProfile} = useProfileNavigation();
  const {data: queue = [], isLoading, error, refetch} = useReviewQueue(deckId);
  const {rateCard, isRating} = useReviewMutations(deckId);

  const [sessionQueue, setSessionQueue] = useState<ReviewQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionStart] = useState(() => Date.now());

  useEffect(() => {
    if (queue.length > 0 && sessionQueue.length === 0 && !completed) {
      setSessionQueue(queue);
      setCurrentIndex(0);
      setFlipped(false);
    }
  }, [queue, sessionQueue.length, completed]);

  const currentItem = sessionQueue[currentIndex];
  const totalCards = sessionQueue.length;
  const isSessionDone = completed || (totalCards > 0 && currentIndex >= totalCards);

  const deckTitle = useMemo(() => {
    if (deckId && currentItem?.deck.title) return currentItem.deck.title;
    if (deckId) return sessionQueue[0]?.deck.title ?? 'Review';
    return 'All decks';
  }, [currentItem, deckId, sessionQueue]);

  const elapsedMinutes = Math.floor((Date.now() - sessionStart) / 60000);

  const handleRate = useCallback(
    async (rating: EaseRating) => {
      if (!currentItem || isRating) return;

      try {
        await rateCard({cardId: currentItem.card.id, rating});

        if (rating === 'again') {
          setSessionQueue(prev => {
            const remaining = prev.filter(
              item => item.card.id !== currentItem.card.id,
            );
            return [...remaining, currentItem];
          });
        } else {
          setCurrentIndex(prev => prev + 1);
        }

        setFlipped(false);
      } catch (err) {
        toast.error('Could not save rating', getApiErrorMessage(err));
      }
    },
    [currentItem, isRating, rateCard],
  );

  useEffect(() => {
    if (totalCards > 0 && currentIndex >= totalCards && !completed) {
      setCompleted(true);
    }
  }, [currentIndex, totalCards, completed]);

  const headerRight = (
    <LibraryProfileButton onPress={openProfile}>
      <ProfileAvatar
        name={user?.name}
        email={user?.email}
        imageUrl={user?.avatarUrl}
        size={32}
        variant="brand"
      />
    </LibraryProfileButton>
  );

  const screenStyle = {backgroundColor: libraryTokens.background};

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={screenStyle}>
        <ActivityIndicator size="large" color={libraryTokens.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1" style={screenStyle}>
        <ReviewSessionHeader
          title="Review unavailable"
          onBack={() => navigation.goBack()}
        />
        <View className="px-5 pt-6">
          <Text className="text-danger mb-4">{getApiErrorMessage(error)}</Text>
          <Button label="Retry" variant="secondary" onPress={() => void refetch()} />
        </View>
      </View>
    );
  }

  if (queue.length === 0) {
    return (
      <View className="flex-1" style={screenStyle}>
        <ReviewSessionHeader
          title="All caught up"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 px-5 pt-6">
          <Text className="text-body text-muted leading-6 mb-6">
            {deckId
              ? 'No cards are due for review in this deck right now.'
              : 'No cards are due across your library right now.'}
          </Text>
          <Button label="Done" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  if (isSessionDone) {
    return (
      <View className="flex-1" style={screenStyle}>
        <ReviewSessionHeader
          title="Session complete"
          onBack={() => navigation.goBack()}
        />
        <View className="flex-1 px-5 pt-6">
          <Text className="text-body text-muted leading-6 mb-6">
            You reviewed {totalCards} {totalCards === 1 ? 'card' : 'cards'}. Cards rated
            Good or Easy will reappear on their scheduled dates.
          </Text>
          <Button label="Done" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View className="flex-1 items-center justify-center" style={screenStyle}>
        <ActivityIndicator size="large" color={libraryTokens.primary} />
      </View>
    );
  }

  const bottomPadding = Math.max(insets.bottom, 16) + TAB_BAR_CLEARANCE;

  return (
    <View className="flex-1" style={screenStyle}>
      <ReviewBackground />

      <ReviewSessionHeader
        title={deckTitle}
        subtitle={`Daily review session${elapsedMinutes > 0 ? ` · ${elapsedMinutes}m` : ''}`}
        onBack={() => navigation.goBack()}
        right={headerRight}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: libraryTokens.containerPadding,
          paddingTop: 16,
          paddingBottom: bottomPadding,
          flexGrow: 1,
        }}>
        <View
          className="w-full self-center"
          style={{maxWidth: maxContentWidth, gap: libraryTokens.sectionGap}}>
          <ReviewProgress
            current={currentIndex + 1}
            total={totalCards}
            variant="session"
          />

          <View className="justify-center">
            <FlipCard
              key={currentItem.card.id}
              question={currentItem.card.question}
              answer={currentItem.card.answer}
              flipped={flipped}
              onFlip={() => setFlipped(prev => !prev)}
            />
          </View>

          {flipped ? (
            <Animated.View entering={FadeInDown.duration(350).delay(100)}>
              <RatingBar
                review={currentItem.review}
                onRate={rating => void handleRate(rating)}
                disabled={isRating}
                contentWidth={maxContentWidth}
              />
            </Animated.View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
