import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import {DeckCard} from '../../components/deck/DeckCard';
import {
  LibraryProfileButton,
  LibrarySettingsButton,
} from '../../components/library/LibraryHeader';
import {LibraryStatsPills} from '../../components/library/LibraryStatsPills';
import {LibraryTitleBlock} from '../../components/library/LibraryTitleBlock';
import {LibraryTopBar} from '../../components/library/LibraryTopBar';
import {PickDeckForAiSheet} from '../../components/library/PickDeckForAiSheet';
import {SyllabusImportCard} from '../../components/library/SyllabusImportCard';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {Fab, FabSpacer} from '../../components/ui/Fab';
import {SkeletonDeckList} from '../../components/ui/Skeleton';
import {Button} from '../../components/ui/Button';
import {toast} from '../../components/ui/Toast';
import {libraryTokens} from '../../config/libraryTokens';
import {
  navigateToCreateDeckForGenerate,
  navigateToGenerateCards,
} from '../../lib/deckGenerateNavigation';
import {getApiErrorMessage} from '../../lib/errors';
import {useAppUser} from '../../hooks/useAppUser';
import {useDeckMutations, useDecks} from '../../hooks/useDecks';
import {useLibraryLayout, libraryContentStyle} from '../../hooks/useLibraryLayout';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {useProgressHistory, useProgressSummary} from '../../hooks/useProgress';
import type {GenerateSourceType, LibraryStackParamList} from '../../navigation/types';
import type {Deck} from '../../types/api';

type Props = NativeStackScreenProps<LibraryStackParamList, 'DeckList'>;

export function DeckListScreen({navigation}: Props) {
  const layout = useLibraryLayout(false);
  const {user} = useAppUser();
  const {openProfile, openSettings} = useProfileNavigation();
  const {data: decks = [], isLoading, isRefetching, refetch, error} = useDecks();
  const {data: summary} = useProgressSummary();
  const {data: history = []} = useProgressHistory(7);
  const {deleteDeck, updateDeck} = useDeckMutations();

  const streak = summary?.currentStreak ?? 0;
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerSource, setPickerSource] = useState<GenerateSourceType>('topic');

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

  const decksInProgress = useMemo(
    () =>
      decks.filter(
        d =>
          (d.dueTodayCount ?? 0) + (d.lateCount ?? 0) > 0 ||
          Boolean(d.lastStudiedAt),
      ).length,
    [decks],
  );

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleDelete = (deck: Deck) => {
    Alert.alert(
      'Delete deck',
      `Delete "${deck.title}" and all its cards? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteDeck(deck.id).catch(err => {
              toast.error('Could not delete deck', getApiErrorMessage(err));
            });
          },
        },
      ],
    );
  };

  const handleArchive = (deck: Deck) => {
    Alert.alert(
      'Archive deck',
      `Archive "${deck.title}"? You can restore it later.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Archive',
          onPress: () => {
            void updateDeck(deck.id, {isArchived: true}).catch(err => {
              toast.error('Could not archive deck', getApiErrorMessage(err));
            });
          },
        },
      ],
    );
  };

  const listHeader = useMemo(
    () => (
      <View style={{gap: libraryTokens.sectionGap, marginBottom: 4}}>
        <View style={{gap: 16}}>
          <LibraryTitleBlock />
          <LibraryStatsPills
            streak={streak}
            minutesToday={minutesToday}
            decksInProgress={decksInProgress}
          />
        </View>
        <SyllabusImportCard
          onTryAiCreator={handleAiCreator}
          onPasteText={handlePasteText}
        />
      </View>
    ),
    [streak, minutesToday, decksInProgress, handleAiCreator, handlePasteText],
  );

  const profileAvatar = (
    <ProfileAvatar
      name={user?.name}
      email={user?.email}
      imageUrl={user?.avatarUrl}
      size={32}
      variant="brand"
    />
  );

  const topBar = (
    <LibraryTopBar
      title="Flipwise AI"
      left={<LibrarySettingsButton onPress={openSettings} />}
      right={
        <LibraryProfileButton onPress={openProfile}>
          {profileAvatar}
        </LibraryProfileButton>
      }
    />
  );

  if (isLoading) {
    return (
      <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
        {topBar}
        <View style={libraryContentStyle(layout, layout.tabScrollBottomPadding)}>
          <SkeletonDeckList count={3} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      {topBar}

      <FlatList
        data={decks}
        key={layout.numColumns}
        numColumns={layout.numColumns}
        keyExtractor={item => item.id}
        columnWrapperStyle={
          layout.numColumns > 1 ? {gap: libraryTokens.elementGap} : undefined
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
                className="rounded-2xl p-5 mb-6 border"
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
            <View className="items-center py-8">
              <Text
                className="font-display mb-2"
                style={{fontSize: 18, color: libraryTokens.ink}}>
                No decks yet
              </Text>
              <Text
                className="text-center leading-6"
                style={{fontSize: 16, color: libraryTokens.muted}}>
                Create your first deck or use Syllabus Import above.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={<FabSpacer extra={layout.fabBottomOffset} />}
        renderItem={({item}) => (
          <View className={layout.numColumns > 1 ? 'flex-1' : undefined}>
            <DeckCard
              deck={item}
              onPress={() => navigation.navigate('DeckDetail', {deckId: item.id})}
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
