import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useMemo} from 'react';
import {FlatList, Pressable, RefreshControl, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  LibraryProfileButton,
  LibrarySettingsButton,
} from '../../components/library/LibraryHeader';
import {LibraryTopBar} from '../../components/library/LibraryTopBar';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {Button} from '../../components/ui/Button';
import {SkeletonCard} from '../../components/ui/Skeleton';
import {libraryTokens} from '../../config/libraryTokens';
import {getApiErrorMessage} from '../../lib/errors';
import {useAppUser} from '../../hooks/useAppUser';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {useReviewQueue} from '../../hooks/useReviews';
import type {ReviewStackParamList} from '../../navigation/types';
import type {ReviewQueueItem} from '../../types/api';

type Props = NativeStackScreenProps<ReviewStackParamList, 'ReviewHome'>;

type DeckSummary = {
  deckId: string;
  title: string;
  subject: string;
  dueCount: number;
};

function groupQueueByDeck(queue: ReviewQueueItem[]): DeckSummary[] {
  const map = new Map<string, DeckSummary>();
  for (const item of queue) {
    const existing = map.get(item.deck.id);
    if (existing) {
      existing.dueCount += 1;
    } else {
      map.set(item.deck.id, {
        deckId: item.deck.id,
        title: item.deck.title,
        subject: item.deck.subject,
        dueCount: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.dueCount - a.dueCount);
}

export function ReviewHomeScreen({navigation}: Props) {
  const {user} = useAppUser();
  const {openProfile, openSettings} = useProfileNavigation();
  const {data: queue = [], isLoading, isRefetching, refetch, error} = useReviewQueue();

  const deckBreakdown = useMemo(() => groupQueueByDeck(queue), [queue]);
  const totalDue = queue.length;

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const startGlobalReview = useCallback(() => {
    navigation.navigate('ReviewSession', {});
  }, [navigation]);

  const startDeckReview = useCallback(
    (deckId: string) => {
      navigation.navigate('ReviewSession', {deckId});
    },
    [navigation],
  );

  const topBar = (
    <LibraryTopBar
      title="Review"
      left={<LibrarySettingsButton onPress={openSettings} />}
      right={
        <LibraryProfileButton onPress={openProfile}>
          <ProfileAvatar
            name={user?.name}
            email={user?.email}
            imageUrl={user?.avatarUrl}
            size={32}
            variant="brand"
          />
        </LibraryProfileButton>
      }
    />
  );

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      {topBar}

      <View className="px-5 pt-2 pb-2">
        <Text className="text-body text-muted">
          {totalDue > 0
            ? `${totalDue} ${totalDue === 1 ? 'card' : 'cards'} due across your library`
            : 'You are all caught up for now'}
        </Text>
      </View>

      {isLoading ? (
        <View className="px-5 pt-4">
          <SkeletonCard lines={1} showBadge={false} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </View>
      ) : error ? (
        <View className="px-5 pt-4">
          <View className="bg-card border border-danger/30 rounded-huge p-5">
            <Text className="text-danger">{getApiErrorMessage(error)}</Text>
            <Button
              label="Retry"
              variant="secondary"
              className="mt-3"
              onPress={() => void refetch()}
            />
          </View>
        </View>
      ) : totalDue === 0 ? (
        <View className="flex-1 items-center justify-center px-8 pb-28">
          <View className="bg-card rounded-full p-5 border border-border mb-5">
            <MaterialIcons name="celebration" size={40} color={libraryTokens.primaryContainer} />
          </View>
          <Text className="text-heading font-display text-text mb-2 text-center">
            All caught up
          </Text>
          <Text className="text-body text-muted text-center leading-6">
            No cards are due right now. Check back later or add more cards to your decks.
          </Text>
        </View>
      ) : (
        <>
          <View className="px-5 py-4">
            <Button label={`Start review (${totalDue})`} onPress={startGlobalReview} />
          </View>

          <FlatList
            data={deckBreakdown}
            keyExtractor={item => item.deckId}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
            }
            contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 120}}
            ListHeaderComponent={
              <Text className="text-label-md text-on-surface-variant uppercase mb-3">
                By deck
              </Text>
            }
            renderItem={({item}) => (
              <Pressable
                className="bg-card rounded-huge border border-border p-4 mb-3 flex-row items-center active:opacity-90"
                onPress={() => startDeckReview(item.deckId)}>
                <View className="flex-1 pr-3">
                  <Text className="text-heading text-text">{item.title}</Text>
                  <Text className="text-caption text-muted mt-1">{item.subject}</Text>
                </View>
                <View
                  className="rounded-full px-3 py-1"
                  style={{backgroundColor: libraryTokens.primaryContainer}}>
                  <Text
                    className="text-label-md font-semibold"
                    style={{color: libraryTokens.primary}}>
                    {item.dueCount} due
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={22}
                  color={libraryTokens.muted}
                  style={{marginLeft: 8}}
                />
              </Pressable>
            )}
          />
        </>
      )}
    </View>
  );
}
