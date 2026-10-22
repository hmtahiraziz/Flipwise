import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {CardListFooter, CARD_LIST_FOOTER_HEIGHT} from '../../components/card/CardListFooter';
import {CardListItem} from '../../components/card/CardListItem';
import {CardSearchInput} from '../../components/card/CardSearchInput';
import {GenerateReviewHeader} from '../../components/generate/GenerateReviewHeader';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {SilhouetteCard} from '../../components/ui/SilhouetteCard';
import {ScrollToTopFab, SCROLL_TO_TOP_THRESHOLD} from '../../components/ui/ScrollToTopFab';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useCards} from '../../hooks/useCards';
import {useDeck} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {deckMasteryPercent} from '../../lib/deckMastery';
import {getApiErrorMessage} from '../../lib/errors';
import {getSubjectIcon} from '../../lib/subjectIcons';
import type {LibraryStackParamList} from '../../navigation/types';
import {localDataStorage} from '../../storage/localDataStorage';

type Props = NativeStackScreenProps<LibraryStackParamList, 'CardList'>;

export function CardListScreen({navigation, route}: Props) {
  const {deckId} = route.params;
  const layout = useLibraryLayout();
  const {data: deck} = useDeck(deckId);
  const {data: cards, isLoading, error, refetch, isRefetching} = useCards(deckId);
  const [query, setQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [starredIds, setStarredIds] = useState<string[]>(() =>
    localDataStorage.getBookmarks(),
  );
  const listRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      setStarredIds(localDataStorage.getBookmarks());
    }, []),
  );

  const list = cards ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      card =>
        card.question.toLowerCase().includes(q) ||
        card.answer.toLowerCase().includes(q),
    );
  }, [list, query]);

  const mastery = deck ? deckMasteryPercent(deck) : 0;
  const subjectIcon = getSubjectIcon(deck?.subject);
  const compact = layout.isNarrow;
  const tabClearance = layout.tabScrollBottomPadding;
  const screenBg = {backgroundColor: libraryTokens.background};

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const shouldShow = y > SCROLL_TO_TOP_THRESHOLD;
    setShowScrollTop(prev => (prev === shouldShow ? prev : shouldShow));
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  const toggleStar = useCallback((cardId: string) => {
    const next = localDataStorage.toggleBookmark(cardId);
    setStarredIds(next);
  }, []);

  const headerRight = <HeaderProfileButton size={32} />;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={screenBg}>
        <ActivityIndicator size="large" color={libraryTokens.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1" style={screenBg}>
        <GenerateReviewHeader
          onBack={() => navigation.goBack()}
          title="Cards unavailable"
        />
        <View style={{paddingHorizontal: layout.horizontalPadding, paddingTop: 24}}>
          <Text style={{fontFamily: fonts.body, color: libraryTokens.error, marginBottom: 16}}>
            {getApiErrorMessage(error)}
          </Text>
          <Pressable
            onPress={() => void refetch()}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 20,
              backgroundColor: libraryTokens.surface,
              borderWidth: 1,
              borderColor: libraryTokens.border,
              borderRadius: 12,
              alignItems: 'center',
            }}>
            <Text style={{fontFamily: fonts.bodySemiBold, fontSize: 16, color: libraryTokens.ink}}>
              Retry
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={screenBg}>
      <GenerateReviewHeader
        onBack={() => navigation.goBack()}
        title={deck?.title ?? 'Cards'}
        right={headerRight}
      />

      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={item => item.id}
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: 20,
          paddingBottom: 24,
          maxWidth: libraryTokens.contentMaxWidthWide,
          width: '100%',
          alignSelf: 'center',
        }}
        ItemSeparatorComponent={() => <View style={{height: libraryTokens.elementGap + 4}} />}
        ListHeaderComponent={
          <View style={{gap: layout.sectionGap, marginBottom: 8}}>
            <View className="flex-row items-end justify-between">
              <View className="flex-1 min-w-0 mr-3">
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 12,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: libraryTokens.muted,
                  }}>
                  Active Deck
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: compact ? 28 : 32,
                    lineHeight: compact ? 36 : 40,
                    letterSpacing: -0.64,
                    fontWeight: '700',
                    color: libraryTokens.ink,
                    marginTop: 4,
                  }}>
                  Deck Overview
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 16,
                    lineHeight: 24,
                    color: libraryTokens.muted,
                    marginTop: 4,
                  }}>
                  {list.length} {list.length === 1 ? 'card' : 'cards'} in this collection
                  {starredIds.length > 0
                    ? ` · ${starredIds.filter(id => list.some(c => c.id === id)).length} starred`
                    : ''}
                </Text>
              </View>
              <View
                className="flex-row items-center rounded-full"
                style={{
                  gap: 4,
                  backgroundColor: libraryTokens.surfaceContainerLow,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginBottom: 8,
                }}>
                <MaterialIcons name={subjectIcon} size={18} color={libraryTokens.primary} />
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 12,
                    color: libraryTokens.ink,
                  }}>
                  {mastery}% Mastery
                </Text>
              </View>
            </View>

            <CardSearchInput value={query} onChangeText={setQuery} />

            {query.trim() && filtered.length === 0 ? (
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: libraryTokens.muted,
                  textAlign: 'center',
                  paddingVertical: 24,
                }}>
                No cards match "{query.trim()}"
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !query.trim() ? (
            <SilhouetteCard borderRadius={20}>
              <View
                className="items-center"
                style={{
                  backgroundColor: libraryTokens.surface,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: libraryTokens.border,
                  padding: 32,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.displayMedium,
                    fontSize: 18,
                    color: libraryTokens.ink,
                    marginBottom: 8,
                  }}>
                  No cards yet
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: libraryTokens.muted,
                    textAlign: 'center',
                    lineHeight: 20,
                  }}>
                  Generate flashcards with AI or add your first card manually.
                </Text>
              </View>
            </SilhouetteCard>
          ) : null
        }
        renderItem={({item}) => (
          <CardListItem
            card={item}
            starred={starredIds.includes(item.id)}
            onToggleStar={() => toggleStar(item.id)}
            onPress={() =>
              navigation.navigate('EditCard', {deckId, cardId: item.id})
            }
          />
        )}
      />

      <ScrollToTopFab
        visible={showScrollTop}
        onPress={scrollToTop}
        bottom={tabClearance + CARD_LIST_FOOTER_HEIGHT + 12}
      />

      <View style={{paddingBottom: tabClearance}}>
        <CardListFooter
          compact={compact}
          onGenerate={() => navigation.navigate('GenerateCards', {deckId})}
          onAddManual={() => navigation.navigate('EditCard', {deckId})}
        />
      </View>
    </View>
  );
}
