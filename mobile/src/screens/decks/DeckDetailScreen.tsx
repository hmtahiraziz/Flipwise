import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Alert, Pressable, ScrollView, Text, View} from 'react-native';
import {DeckDetailActions} from '../../components/deck/DeckDetailActions';
import {DeckDetailScreenHeader} from '../../components/deck/DeckDetailScreenHeader';
import {DeckDetailStatTile} from '../../components/deck/DeckDetailStatTile';
import {DeckMasteryCard} from '../../components/deck/DeckMasteryCard';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {SkeletonCard} from '../../components/ui/Skeleton';
import {toast} from '../../components/ui/Toast';
import {deckDetailTokens} from '../../config/deckDetailTokens';
import {fonts} from '../../config/theme';
import {getApiErrorMessage} from '../../lib/errors';
import {deckMasteryPercent} from '../../lib/deckMastery';
import {formatLastStudiedShort} from '../../lib/sm2';
import {useDeck, useDeckMutations} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import type {LibraryStackParamList, MainTabParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'DeckDetail'>;

export function DeckDetailScreen({navigation, route}: Props) {
  const {deckId} = route.params;
  const layout = useLibraryLayout();
  const {data: deck, isLoading, error, refetch} = useDeck(deckId);
  const {deleteDeck} = useDeckMutations();

  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();

  const horizontalPadding = layout.isNarrow ? 20 : deckDetailTokens.containerPadding;
  const screenBg = {backgroundColor: deckDetailTokens.surface};

  const confirmDelete = () => {
    Alert.alert(
      'Delete deck',
      'This will permanently delete the deck and all its cards.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void handleDelete(),
        },
      ],
    );
  };

  const openOverflowMenu = () => {
    Alert.alert(deck?.title ?? 'Deck', undefined, [
      {
        text: 'Edit deck',
        onPress: () => navigation.navigate('EditDeck', {deckId}),
      },
      {text: 'Delete deck', style: 'destructive', onPress: confirmDelete},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const handleDelete = async () => {
    try {
      await deleteDeck(deckId);
      navigation.popToTop();
    } catch (err) {
      toast.error('Could not delete deck', getApiErrorMessage(err));
    }
  };

  const startReview = () => {
    tabNavigation?.navigate('Review', {
      screen: 'ReviewSession',
      params: {deckId},
    });
  };

  const headerRight = <HeaderProfileButton />;

  if (isLoading) {
    return (
      <View className="flex-1" style={screenBg}>
        <DeckDetailScreenHeader
          title="Loading..."
          onBack={() => navigation.goBack()}
          compact={layout.isNarrow}
        />
        <View style={{paddingHorizontal: horizontalPadding, paddingTop: 16}}>
          <SkeletonCard lines={3} showBadge />
        </View>
      </View>
    );
  }

  if (error || !deck) {
    return (
      <View className="flex-1" style={screenBg}>
        <DeckDetailScreenHeader
          title="Deck unavailable"
          onBack={() => navigation.goBack()}
          compact={layout.isNarrow}
        />
        <View style={{paddingHorizontal: horizontalPadding, paddingTop: 24}}>
          <Text style={{color: '#EF4444', marginBottom: 16}}>
            {getApiErrorMessage(error, 'Deck not found')}
          </Text>
          <Pressable
            onPress={() => void refetch()}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 20,
              backgroundColor: deckDetailTokens.surfaceContainer,
              borderWidth: 1,
              borderColor: deckDetailTokens.borderStrong,
              borderRadius: deckDetailTokens.cardRadius,
              alignItems: 'center',
            }}>
            <Text style={{fontWeight: '600', color: deckDetailTokens.ink}}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const dueTodayTotal = (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0);
  const mastery = deckMasteryPercent(deck);
  const subject = deck.subject?.trim() ?? '';
  const showSubjectBadge =
    subject.length > 0 &&
    subject.localeCompare(deck.title.trim(), undefined, {sensitivity: 'accent'}) !== 0;

  return (
    <View className="flex-1" style={screenBg}>
      <DeckDetailScreenHeader
        title={deck.title}
        onBack={() => navigation.goBack()}
        right={headerRight}
        onTitleLongPress={openOverflowMenu}
        compact={layout.isNarrow}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: layout.tabScrollBottomPadding + 24,
          maxWidth: 412,
          width: '100%',
          alignSelf: 'center',
        }}>
        <View style={{marginBottom: 32}}>
          {showSubjectBadge ? (
            <View
              className="self-start rounded-full mb-6"
              style={{
                backgroundColor: deckDetailTokens.brandMuted,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  color: deckDetailTokens.ink,
                }}>
                {subject}
              </Text>
            </View>
          ) : null}

          <View
            className="flex-row"
            style={{
              gap: deckDetailTokens.statGap,
              marginBottom: 40,
              marginTop: showSubjectBadge ? 0 : 4,
            }}>
            <DeckDetailStatTile
              icon="style"
              value={deck.cardCount}
              label={'Total\nCards'}
            />
            <DeckDetailStatTile
              icon="event"
              value={dueTodayTotal}
              label={'Due\nToday'}
            />
            <DeckDetailStatTile
              icon="schedule"
              value={formatLastStudiedShort(deck.lastStudiedAt)}
              label={'Last\nStudied'}
            />
          </View>

          <DeckDetailActions
            dueCount={dueTodayTotal}
            compact={layout.isNarrow}
            onStartReview={startReview}
            onViewCards={() => navigation.navigate('CardList', {deckId})}
            onGenerate={() => navigation.navigate('GenerateCards', {deckId})}
          />

          <View style={{marginTop: 48}}>
            <DeckMasteryCard masteryPercent={mastery} totalCards={deck.cardCount} />
          </View>

          {deck.description ? (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 16,
                lineHeight: 24,
                color: deckDetailTokens.mutedText,
                marginTop: 32,
              }}>
              {deck.description}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
