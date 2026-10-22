import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DeckCard} from '../../components/deck/DeckCard';
import {LibraryStatsPills} from '../../components/library/LibraryStatsPills';
import {LibraryTitleBlock} from '../../components/library/LibraryTitleBlock';
import {PickDeckForAiSheet} from '../../components/library/PickDeckForAiSheet';
import {SyllabusImportCard} from '../../components/library/SyllabusImportCard';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {appAlert} from '../../components/ui/AppAlert';
import {Fab, FabSpacer} from '../../components/ui/Fab';
import {SkeletonDeckList} from '../../components/ui/Skeleton';
import {Button} from '../../components/ui/Button';
import {FirstRunEmpty} from '../../components/ui/FirstRunEmpty';
import {toast} from '../../components/ui/Toast';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {
  navigateToCreateDeckForGenerate,
  navigateToGenerateCards,
} from '../../lib/deckGenerateNavigation';
import {getApiErrorMessage} from '../../lib/errors';
import {useDeckMutations, useDecks} from '../../hooks/useDecks';
import {useLibraryLayout, libraryContentStyle} from '../../hooks/useLibraryLayout';
import {useProgressHistory, useProgressSummary} from '../../hooks/useProgress';
import {reviewKeys} from '../../hooks/useReviews';
import {fetchReviewQueue} from '../../services/api/reviewApi';
import type {
  GenerateSourceType,
  LibraryStackParamList,
} from '../../navigation/types';
import type {Deck} from '../../types/api';

type Props = NativeStackScreenProps<LibraryStackParamList, 'DeckList'>;

type FilterChip = 'all' | 'active' | 'starred' | 'completed' | `subject:${string}`;
type SortMode = 'recent' | 'title' | 'due';

const SORT_LABELS: Record<SortMode, string> = {
  recent: 'Recently Studied',
  title: 'Title',
  due: 'Due first',
};

const SORT_CYCLE: SortMode[] = ['recent', 'title', 'due'];
const SUBTEXT = '#70757D';

function deckDue(deck: Deck): number {
  return deck.dueCount ?? (deck.dueTodayCount ?? 0) + (deck.lateCount ?? 0);
}

function deckMatchesQuery(deck: Deck, query: string): boolean {
  if (!query) return true;
  const haystack = [deck.title, deck.subject, ...(deck.tags ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export function DeckListScreen({navigation}: Props) {
  const layout = useLibraryLayout(false);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const {data: decks = [], isLoading, isRefetching, refetch, error} = useDecks();
  const {data: summary} = useProgressSummary();
  const {data: history = []} = useProgressHistory(7);
  const {deleteDeck, updateDeck} = useDeckMutations();

  const streak = summary?.currentStreak ?? 0;
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSource, setPickerSource] = useState<GenerateSourceType>('topic');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterChip>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [gridMode, setGridMode] = useState(false);

  const numColumns = gridMode ? 2 : 1;

  const openDeckPicker = useCallback((source: GenerateSourceType) => {
    setPickerSource(source);
    setPickerVisible(true);
  }, []);

  const handleAiCreator = useCallback(() => {
    openDeckPicker('topic');
  }, [openDeckPicker]);

  const handlePasteText = useCallback(() => {
    openDeckPicker('notes');
  }, [openDeckPicker]);

  const handleImportDoc = useCallback(() => {
    openDeckPicker('pdf');
  }, [openDeckPicker]);

  const handleScanNotes = useCallback(() => {
    openDeckPicker('scan');
  }, [openDeckPicker]);

  const handlePickerClose = useCallback(() => {
    setPickerVisible(false);
  }, []);

  const handlePickerCreateDeck = useCallback(() => {
    setPickerVisible(false);
    navigateToCreateDeckForGenerate(navigation, pickerSource);
  }, [navigation, pickerSource]);

  const handlePickerSelectDeck = useCallback(
    (deckId: string) => {
      setPickerVisible(false);
      navigateToGenerateCards(navigation, deckId, pickerSource);
    },
    [navigation, pickerSource],
  );

  const minutesToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const entry = history.find(d => d.date === today);
    if (entry?.minutesStudied) return entry.minutesStudied;
    const cards = summary?.reviewedTodayCount ?? 0;
    return cards > 0 ? Math.max(cards * 2, 1) : 0;
  }, [history, summary?.reviewedTodayCount]);

  const activeCount = useMemo(
    () => decks.filter(d => !d.isArchived && deckDue(d) > 0).length,
    [decks],
  );
  const starredCount = useMemo(
    () => decks.filter(d => d.isFavorite).length,
    [decks],
  );
  const completedCount = useMemo(
    () => decks.filter(d => !d.isArchived && deckDue(d) === 0 && d.cardCount > 0).length,
    [decks],
  );
  const totalVisible = useMemo(
    () => decks.filter(d => !d.isArchived).length,
    [decks],
  );

  const subjectChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const deck of decks) {
      const subject = deck.subject?.trim();
      if (!subject) continue;
      counts.set(subject, (counts.get(subject) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([subject]) => subject);
  }, [decks]);

  const filteredDecks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = decks.filter(d => !d.isArchived && deckMatchesQuery(d, q));

    if (filter === 'active') {
      list = list.filter(d => deckDue(d) > 0);
    } else if (filter === 'starred') {
      list = list.filter(d => d.isFavorite);
    } else if (filter === 'completed') {
      list = list.filter(d => deckDue(d) === 0 && d.cardCount > 0);
    } else if (filter.startsWith('subject:')) {
      const subject = filter.slice('subject:'.length);
      list = list.filter(d => d.subject?.trim() === subject);
    }

    const sorted = [...list];
    if (sortMode === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'due') {
      sorted.sort((a, b) => deckDue(b) - deckDue(a));
    } else {
      sorted.sort((a, b) => {
        const ta = a.lastStudiedAt ? new Date(a.lastStudiedAt).getTime() : 0;
        const tb = b.lastStudiedAt ? new Date(b.lastStudiedAt).getTime() : 0;
        return tb - ta;
      });
    }
    return sorted;
  }, [decks, searchQuery, filter, sortMode]);

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const cycleSort = useCallback(() => {
    setSortMode(current => {
      const idx = SORT_CYCLE.indexOf(current);
      return SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
    });
  }, []);

  const handleToggleFavorite = useCallback(
    (deck: Deck) => {
      void updateDeck(deck.id, {isFavorite: !deck.isFavorite})
        .then(() => {
          toast.success(deck.isFavorite ? 'Removed from starred' : 'Starred');
        })
        .catch(err => {
          toast.error('Could not update deck', getApiErrorMessage(err));
        });
    },
    [updateDeck],
  );

  const openDeckReview = useCallback(
    (deckId: string) => {
      void queryClient.prefetchQuery({
        queryKey: reviewKeys.queue(deckId),
        queryFn: () => fetchReviewQueue(deckId),
      });
      navigation.navigate('ReviewSession', {deckId, forceFresh: true});
    },
    [navigation, queryClient],
  );

  const handleDelete = (deck: Deck) => {
    appAlert(
      'Delete deck',
      `Delete "${deck.title}" and all its cards? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteDeck(deck.id)
              .then(() => toast.success('Deck deleted'))
              .catch(err => {
                toast.error('Could not delete deck', getApiErrorMessage(err));
              });
          },
        },
      ],
    );
  };

  const handleArchive = (deck: Deck) => {
    appAlert(
      'Archive deck',
      `Archive "${deck.title}"? You can restore it later.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Archive',
          onPress: () => {
            void updateDeck(deck.id, {isArchived: true})
              .then(() => toast.success('Deck archived'))
              .catch(err => {
                toast.error('Could not archive deck', getApiErrorMessage(err));
              });
          },
        },
      ],
    );
  };

  const hasActiveQuery =
    searchQuery.trim().length > 0 || filter !== 'all' || sortMode !== 'recent';

  const listHeader = useMemo(() => {
    const chips: Array<{id: FilterChip; label: string; count?: number}> = [
      {id: 'all', label: 'All Decks', count: totalVisible},
      {id: 'active', label: 'Active', count: activeCount},
      {id: 'starred', label: 'Starred ⭐', count: starredCount || undefined},
      {id: 'completed', label: 'Completed', count: completedCount || undefined},
      ...subjectChips.map(subject => ({
        id: `subject:${subject}` as FilterChip,
        label: subject,
      })),
    ];

    return (
      <View style={{gap: 14, marginBottom: 4}}>
        <View className="flex-row items-center justify-between">
          <View style={{flex: 1, paddingRight: 12}}>
            <LibraryTitleBlock />
          </View>
          <HeaderProfileButton size={32} />
        </View>

        <View
          className="flex-row items-center"
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            backgroundColor: libraryTokens.surface,
            paddingHorizontal: 14,
            minHeight: 44,
            gap: 10,
          }}>
          <MaterialIcons name="search" size={16} color={SUBTEXT} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search decks, tags, or cards..."
            placeholderTextColor={SUBTEXT}
            accessibilityLabel="Search decks"
            style={{
              flex: 1,
              fontFamily: fonts.body,
              fontSize: 12,
              color: libraryTokens.ink,
              paddingVertical: 10,
            }}
          />
          {searchQuery.length > 0 ? (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
              accessibilityLabel="Clear search">
              <MaterialIcons name="cancel" size={16} color={SUBTEXT} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: 8, paddingRight: 8}}>
          {chips.map(option => {
            const selected = filter === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setFilter(option.id)}
                accessibilityRole="button"
                accessibilityState={{selected}}
                className="active:opacity-90 flex-row items-center"
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: selected ? 'rgba(199,245,43,0.8)' : libraryTokens.border,
                  backgroundColor: selected
                    ? brandColors.paleLime
                    : brandColors.surface,
                  gap: 6,
                }}>
                <Text
                  style={{
                    fontFamily: selected ? fonts.bodyBold : fonts.bodySemiBold,
                    fontSize: 12,
                    color: selected ? brandColors.olive : SUBTEXT,
                  }}>
                  {option.label}
                </Text>
                {option.count != null ? (
                  <View
                    style={{
                      backgroundColor: selected ? brandColors.lime : '#F3F4F6',
                      borderRadius: 999,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.display,
                        fontSize: 10,
                        color: selected ? brandColors.charcoal : SUBTEXT,
                      }}>
                      {option.count}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={cycleSort}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${SORT_LABELS[sortMode]}`}
            className="flex-row items-center active:opacity-80"
            style={{gap: 4}}>
            <Text style={{fontFamily: fonts.bodySemiBold, fontSize: 12, color: SUBTEXT}}>
              Sort:
            </Text>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 12,
                color: libraryTokens.ink,
              }}>
              {SORT_LABELS[sortMode]}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color={SUBTEXT} />
          </Pressable>

          <View
            className="flex-row items-center"
            style={{
              backgroundColor: brandColors.surface,
              borderWidth: 1,
              borderColor: libraryTokens.border,
              borderRadius: 8,
              padding: 2,
            }}>
            <Pressable
              onPress={() => setGridMode(false)}
              accessibilityRole="button"
              accessibilityLabel="List view"
              accessibilityState={{selected: !gridMode}}
              style={{
                padding: 6,
                borderRadius: 6,
                backgroundColor: !gridMode ? brandColors.paleLime : 'transparent',
              }}>
              <MaterialIcons
                name="view-headline"
                size={16}
                color={!gridMode ? brandColors.olive : SUBTEXT}
              />
            </Pressable>
            <Pressable
              onPress={() => setGridMode(true)}
              accessibilityRole="button"
              accessibilityLabel="Grid view"
              accessibilityState={{selected: gridMode}}
              style={{
                padding: 6,
                borderRadius: 6,
                backgroundColor: gridMode ? brandColors.paleLime : 'transparent',
              }}>
              <MaterialIcons
                name="grid-view"
                size={16}
                color={gridMode ? brandColors.olive : SUBTEXT}
              />
            </Pressable>
          </View>
        </View>

        <LibraryStatsPills
          streak={streak}
          minutesToday={minutesToday}
          decksInProgress={activeCount}
        />

        <SyllabusImportCard
          onTryAiCreator={handleAiCreator}
          onPasteText={handlePasteText}
          onImportDoc={handleImportDoc}
          onScanNotes={handleScanNotes}
        />

        <View className="flex-row items-center justify-between" style={{marginTop: 4}}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 12,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: SUBTEXT,
            }}>
            Your Collections
          </Text>
          <Text style={{fontFamily: fonts.bodyMedium, fontSize: 11, color: SUBTEXT}}>
            {activeCount} active / {totalVisible} total
          </Text>
        </View>
      </View>
    );
  }, [
    streak,
    minutesToday,
    activeCount,
    totalVisible,
    starredCount,
    completedCount,
    subjectChips,
    handleAiCreator,
    handlePasteText,
    handleImportDoc,
    handleScanNotes,
    searchQuery,
    filter,
    sortMode,
    gridMode,
    cycleSort,
  ]);

  if (isLoading) {
    return (
      <View
        className="flex-1"
        style={{backgroundColor: libraryTokens.background, paddingTop: insets.top}}>
        <View style={libraryContentStyle(layout, layout.tabScrollBottomPadding)}>
          <SkeletonDeckList count={3} />
        </View>
      </View>
    );
  }

  const isFirstRun = decks.length === 0;
  const emptyMessage = {
    title: 'No matching decks',
    body: hasActiveQuery
      ? 'Try a different search, filter, or sort.'
      : 'No decks match this view.',
  };

  return (
    <View
      className="flex-1"
      style={{backgroundColor: libraryTokens.background, paddingTop: insets.top}}>
      <FlatList
        data={filteredDecks}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={item => item.id}
        columnWrapperStyle={
          numColumns > 1 ? {gap: libraryTokens.elementGap} : undefined
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        contentContainerStyle={libraryContentStyle(
          layout,
          layout.tabScrollBottomPadding,
        )}
        ListHeaderComponent={
          <>
            {error ? (
              <View
                className="rounded-2xl p-5 mb-4 border"
                style={{
                  backgroundColor: libraryTokens.surface,
                  borderColor: 'rgba(239,68,68,0.3)',
                }}>
                <Text style={{color: libraryTokens.error}}>
                  {getApiErrorMessage(error)}
                </Text>
                <Button
                  label="Retry"
                  variant="secondary"
                  className="mt-3"
                  onPress={() => void refetch()}
                />
              </View>
            ) : null}
            {listHeader}
          </>
        }
        ListEmptyComponent={
          !error ? (
            isFirstRun ? (
              <FirstRunEmpty
                icon="folder-open"
                title="No decks yet"
                body="Create a deck from Home, or tap + below to get started."
              />
            ) : (
              <View className="items-center py-8">
                <Text
                  className="font-display mb-2"
                  style={{fontSize: 18, color: libraryTokens.ink}}>
                  {emptyMessage.title}
                </Text>
                <Text
                  className="text-center leading-6"
                  style={{fontSize: 16, color: libraryTokens.muted}}>
                  {emptyMessage.body}
                </Text>
              </View>
            )
          ) : null
        }
        ListFooterComponent={<FabSpacer extra={layout.fabBottomOffset} />}
        renderItem={({item}) => (
          <View className={numColumns > 1 ? 'flex-1' : undefined}>
            <DeckCard
              deck={item}
              compact={gridMode}
              isFavorite={!!item.isFavorite}
              onToggleFavorite={() => handleToggleFavorite(item)}
              onPress={() => navigation.navigate('DeckDetail', {deckId: item.id})}
              onReview={() => openDeckReview(item.id)}
              onEdit={() => navigation.navigate('EditDeck', {deckId: item.id})}
              onDelete={() => handleDelete(item)}
              onArchive={() => handleArchive(item)}
            />
          </View>
        )}
      />

      <Fab
        variant="dark"
        label="Create deck"
        onPress={() => navigation.navigate('CreateDeck')}
        bottomOffset={layout.fabBottomOffset}
      />

      <PickDeckForAiSheet
        visible={pickerVisible}
        initialSource={pickerSource}
        decks={decks}
        onClose={handlePickerClose}
        onCreateDeck={handlePickerCreateDeck}
        onSelectDeck={handlePickerSelectDeck}
      />
    </View>
  );
}
