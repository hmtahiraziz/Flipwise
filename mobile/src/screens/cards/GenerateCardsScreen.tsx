import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {
  ActionSheetIOS,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {DeckDetailHeader} from '../../components/deck/DeckDetailHeader';
import {
  GenerateFieldLabel,
  GenerateHeroSection,
  GenerateInputBox,
  GenerateLoadingOverlay,
  GenerateReviewPanel,
  GenerateScreenFooter,
  GenerateSegmentSelector,
  GenerateSourceTypeToggle,
} from '../../components/generate';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {toast} from '../../components/ui/Toast';
import {colors, fonts} from '../../config/theme';
import {libraryTokens, libraryCardShadow} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useCardMutations} from '../../hooks/useCards';
import {useDeck} from '../../hooks/useDecks';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {useScreenLayout} from '../../hooks/useScreenLayout';
import {getApiErrorMessage, getGenerateErrorMessage} from '../../lib/errors';
import type {GenerateCardsFormValues} from '../../lib/schemas';
import type {LibraryStackParamList} from '../../navigation/types';
import type {FlashcardDraft} from '../../types/api';

type Props = NativeStackScreenProps<LibraryStackParamList, 'GenerateCards'>;

/** Mockup quantity row — 5, 10, 20, 30 */
const COUNT_OPTIONS = [5, 10, 20, 30] as const;
const TONE_OPTIONS = [
  {value: 'concise' as const, label: 'Concise'},
  {value: 'detailed' as const, label: 'Detailed'},
  {value: 'child-friendly' as const, label: 'Child-friendly'},
  {value: 'critical' as const, label: 'Critical'},
];
const TAB_CLEARANCE = 100;
const FOOTER_CLEARANCE = 112;
const SECTION_GAP = 24;
const CONTAINER_PADDING = 24;

export function GenerateCardsScreen({navigation, route}: Props) {
  const {deckId, initialSource = 'topic'} = route.params;
  const layout = useScreenLayout(libraryTokens.contentMaxWidthWide);
  const {user} = useAppUser();
  const {openProfile} = useProfileNavigation();
  const {data: deck} = useDeck(deckId);
  const {generateCards, saveCardsBulk, importPdf, importUrl} =
    useCardMutations(deckId);

  const [preview, setPreview] = useState<FlashcardDraft[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [topicText, setTopicText] = useState('');
  const [notesText, setNotesText] = useState('');
  const [activeSource, setActiveSource] = useState<'topic' | 'notes'>(initialSource);
  const [inputFocused, setInputFocused] = useState(false);
  const cancelledRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const notesInputRef = useRef<TextInput>(null);
  const topicInputRef = useRef<TextInput>(null);

  const topicPrefilledRef = useRef(false);

  useEffect(() => {
    topicPrefilledRef.current = false;
    setTopicText('');
    setNotesText('');
  }, [deckId]);

  useEffect(() => {
    if (!deck || topicPrefilledRef.current || initialSource !== 'topic') {
      return;
    }

    const suggestion = deck.subject?.trim() || deck.title?.trim();
    if (suggestion) {
      setTopicText(suggestion);
      topicPrefilledRef.current = true;
    }
  }, [deck, deckId, initialSource]);

  useEffect(() => {
    setActiveSource(initialSource);
    if (initialSource === 'notes') {
      const timer = setTimeout(() => notesInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [initialSource]);

  const sourceType = activeSource;

  const {watch, setValue} = useForm<Pick<GenerateCardsFormValues, 'count' | 'tone'>>({
    defaultValues: {
      count: 10,
      tone: 'concise',
    },
  });

  const count = watch('count');
  const tone = watch('tone');
  const bottomPad = Math.max(layout.insets.bottom, 16) + TAB_CLEARANCE;
  const screenBg = {backgroundColor: libraryTokens.background};
  const notesMinHeight = layout.isCompact ? 168 : 192;

  const headerRight = (
    <Pressable
      onPress={openProfile}
      hitSlop={8}
      accessibilityLabel="Profile"
      accessibilityRole="button"
      className="active:opacity-80"
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        overflow: 'hidden',
        backgroundColor: colors.surfaceContainer,
      }}>
      <ProfileAvatar
        name={user?.name}
        email={user?.email}
        imageUrl={user?.avatarUrl}
        size={40}
      />
    </Pressable>
  );

  const resolveSource = (): {sourceType: 'topic' | 'notes'; content: string} => {
    if (sourceType === 'topic') {
      return {sourceType: 'topic', content: topicText.trim()};
    }
    return {sourceType: 'notes', content: notesText.trim()};
  };

  const onGenerate = async () => {
    const {sourceType: type, content} = resolveSource();
    if (!content) {
      toast.error(
        sourceType === 'topic' ? 'Topic required' : 'Notes required',
        sourceType === 'topic'
          ? 'Enter a topic to generate cards from.'
          : 'Paste your notes or attach a PDF.',
      );
      return;
    }

    if (sourceType === 'notes' && content.length < 150) {
      toast.error(
        'Notes may be too short',
        'Add more content for better flashcards, or switch to Topic mode.',
      );
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    cancelledRef.current = false;
    setPreview(null);
    setGenerating(true);

    try {
      const cards = await generateCards(
        {
          sourceType: type,
          content,
          count,
          tone,
        },
        controller.signal,
      );
      if (cancelledRef.current || controller.signal.aborted) return;
      if (!cards.length) {
        toast.error(
          'No cards generated',
          'Try adding more detail or choosing a different tone.',
        );
        return;
      }
      setPreview(cards);
    } catch (error) {
      if (cancelledRef.current || controller.signal.aborted) return;
      const {title, message, cancelled} = getGenerateErrorMessage(error);
      if (!cancelled) {
        toast.error(title, message);
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        if (!cancelledRef.current) {
          setGenerating(false);
        }
      }
    }
  };

  const handleCancelGeneration = useCallback(() => {
    cancelledRef.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    setGenerating(false);
  }, []);

  const handlePdfImport = async () => {
    try {
      const [file] = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
      });
      setImporting(true);
      const result = await importPdf({
        uri: file.uri,
        name: file.name ?? 'document.pdf',
        type: file.type ?? 'application/pdf',
      });
      setNotesText(result.content);
      setActiveSource('notes');
      toast.success('PDF imported', 'Text extracted into study notes.');
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      toast.error('PDF import failed', getApiErrorMessage(error));
    } finally {
      setImporting(false);
    }
  };

  const importFromUrl = async (url: string) => {
    setImporting(true);
    try {
      const result = await importUrl(url);
      setNotesText(result.content);
      setActiveSource('notes');
      toast.success('URL imported', 'Readable text extracted.');
    } catch (error) {
      toast.error('URL import failed', getApiErrorMessage(error));
    } finally {
      setImporting(false);
    }
  };

  const handleUrlImport = async () => {
    const url = urlInput.trim();
    if (!url) {
      setShowUrlInput(true);
      toast.error('URL required', 'Paste a link below, then tap Import again.');
      return;
    }
    await importFromUrl(url);
  };

  const openUploadOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Upload PDF', 'Import from URL', 'Cancel'],
          cancelButtonIndex: 2,
        },
        index => {
          if (index === 0) void handlePdfImport();
          if (index === 1) {
            setShowUrlInput(true);
            if (urlInput.trim()) void handleUrlImport();
          }
        },
      );
      return;
    }

    Alert.alert('Attach file', undefined, [
      {text: 'Upload PDF', onPress: () => void handlePdfImport()},
      {
        text: 'Import from URL',
        onPress: () => {
          setShowUrlInput(true);
          if (urlInput.trim()) void handleUrlImport();
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const handleSourceTypeChange = (type: 'topic' | 'notes') => {
    setActiveSource(type);
    setInputFocused(false);
    if (type === 'topic') {
      setShowUrlInput(false);
    }
  };

  const heroTitle =
    sourceType === 'topic' ? 'Start from a topic' : 'Transform your notes';
  const heroSubtitle =
    sourceType === 'topic'
      ? 'Topic is prefilled from your deck subject. Edit it to a subtopic like Hooks or Navigation.'
      : 'Paste notes or import a PDF. AI uses your material and the deck subject for focus.';
  const deckSubject = deck?.subject?.trim() ?? '';
  const deckTitle = deck?.title?.trim() ?? '';
  const showDeckContext = Boolean(deckTitle);

  const updatePreviewCard = (
    index: number,
    field: keyof FlashcardDraft,
    value: string,
  ) => {
    setPreview(current => {
      if (!current) return current;
      return current.map((card, i) =>
        i === index ? {...card, [field]: value} : card,
      );
    });
  };

  const removePreviewCard = (index: number) => {
    setPreview(current => current?.filter((_, i) => i !== index) ?? null);
  };

  const handleSaveAll = async () => {
    if (!preview?.length) return;

    const validCards = preview.filter(
      card => card.question.trim() && card.answer.trim(),
    );

    if (validCards.length === 0) {
      toast.error('No valid cards', 'Each card needs a question and answer.');
      return;
    }

    setSaving(true);
    try {
      await saveCardsBulk(
        validCards.map(card => ({
          question: card.question.trim(),
          answer: card.answer.trim(),
        })),
      );
      navigation.replace('CardList', {deckId});
    } catch (error) {
      toast.error('Could not save cards', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmDiscard = () => {
    Alert.alert('Discard cards?', 'Your generated cards will be lost.', [
      {text: 'Keep editing', style: 'cancel'},
      {text: 'Discard', style: 'destructive', onPress: () => setPreview(null)},
    ]);
  };

  const confirmBackFromReview = () => {
    Alert.alert('Leave review?', 'Generated cards will be lost.', [
      {text: 'Keep editing', style: 'cancel'},
      {text: 'Leave', style: 'destructive', onPress: () => setPreview(null)},
    ]);
  };

  if (preview) {
    return (
      <GenerateReviewPanel
        preview={preview}
        deckTitle={deck?.title}
        saving={saving}
        bottomPad={bottomPad}
        compact={layout.isCompact || layout.isNarrow}
        headerRight={headerRight}
        onBack={confirmBackFromReview}
        onSave={() => void handleSaveAll()}
        onDiscard={confirmDiscard}
        onUpdateCard={updatePreviewCard}
        onRemoveCard={removePreviewCard}
      />
    );
  }

  return (
    <View className="flex-1" style={screenBg}>
      <DeckDetailHeader
        title="Generate with AI"
        titleColor={libraryTokens.ink}
        backIconColor={libraryTokens.ink}
        onBack={() => navigation.goBack()}
        right={headerRight}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={layout.insets.top + 64}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: CONTAINER_PADDING,
            paddingBottom: bottomPad + FOOTER_CLEARANCE,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <GenerateHeroSection
            compact={layout.isCompact}
            title={heroTitle}
            subtitle={heroSubtitle}
          />

          {showDeckContext ? (
            <View
              style={{
                marginTop: 16,
                alignSelf: 'flex-start',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: libraryTokens.border,
                backgroundColor: libraryTokens.surface,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  color: libraryTokens.muted,
                }}>
                Saving to{' '}
                <Text style={{color: libraryTokens.ink}}>{deckTitle}</Text>
                {deckSubject &&
                deckSubject.localeCompare(deckTitle, undefined, {
                  sensitivity: 'accent',
                }) !== 0
                  ? ` · ${deckSubject}`
                  : ''}
              </Text>
            </View>
          ) : null}

          <View style={{gap: SECTION_GAP, marginTop: SECTION_GAP}}>
            <View>
              <GenerateFieldLabel>Input Source</GenerateFieldLabel>
              <GenerateSourceTypeToggle
                value={sourceType}
                onChange={handleSourceTypeChange}
              />
            </View>

            {sourceType === 'topic' ? (
              <View style={{gap: 8}}>
                <GenerateFieldLabel>Topic</GenerateFieldLabel>
                <GenerateInputBox focused={inputFocused}>
                  <TextInput
                    ref={topicInputRef}
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 16,
                      lineHeight: 22,
                      color: libraryTokens.ink,
                      padding: 0,
                      minHeight: 24,
                    }}
                    placeholder="e.g. Hooks, Navigation, FlatList…"
                    placeholderTextColor={`${colors.muted}99`}
                    value={topicText}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChangeText={setTopicText}
                  />
                </GenerateInputBox>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 13,
                    lineHeight: 18,
                    color: libraryTokens.muted,
                  }}>
                  Prefilled from your deck subject — narrow it to a subtopic for
                  more focused cards.
                </Text>
              </View>
            ) : (
              <View>
                <GenerateFieldLabel>Study Notes</GenerateFieldLabel>
                <GenerateInputBox focused={inputFocused}>
                  <TextInput
                    ref={notesInputRef}
                    style={{
                      minHeight: notesMinHeight,
                      fontFamily: fonts.body,
                      fontSize: 16,
                      lineHeight: 22,
                      color: libraryTokens.ink,
                      textAlignVertical: 'top',
                      padding: 0,
                    }}
                    placeholder="Paste your lecture notes, article text, or complex concepts here to break them down…"
                    placeholderTextColor={`${colors.muted}99`}
                    multiline
                    value={notesText}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChangeText={setNotesText}
                  />
                </GenerateInputBox>
              </View>
            )}

            <GenerateSegmentSelector
              label="Card Tone"
              options={TONE_OPTIONS.map(o => ({value: o.value, label: o.label}))}
              value={tone}
              onChange={value => setValue('tone', value)}
              scrollable
            />

            {/* Quantity */}
            <GenerateSegmentSelector
              label="Quantity"
              options={COUNT_OPTIONS.map(n => ({value: n, label: String(n)}))}
              value={count}
              onChange={value => setValue('count', value)}
            />

            {sourceType === 'notes' ? (
            <View>
              <GenerateFieldLabel>Or Upload</GenerateFieldLabel>
              <Pressable
                onPress={openUploadOptions}
                disabled={importing}
                accessibilityRole="button"
                accessibilityLabel="Attach file"
                className="active:opacity-80"
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  paddingVertical: 24,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: colors.outlineVariant,
                  backgroundColor: libraryTokens.surface,
                  opacity: importing ? 0.6 : 1,
                  ...libraryCardShadow,
                  shadowOpacity: 0.06,
                }}>
                <MaterialIcons
                  name="upload-file"
                  size={22}
                  color={libraryTokens.muted}
                />
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 14,
                    color: libraryTokens.muted,
                  }}>
                  Attach PDF
                </Text>
              </Pressable>

              {showUrlInput ? (
                <View style={{marginTop: 12, gap: 8}}>
                  <TextInput
                    style={{
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: libraryTokens.border,
                      backgroundColor: libraryTokens.surface,
                      paddingHorizontal: 16,
                      height: 48,
                      fontFamily: fonts.body,
                      fontSize: 14,
                      color: libraryTokens.ink,
                    }}
                    placeholder="https://example.com/article"
                    placeholderTextColor={colors.placeholder}
                    value={urlInput}
                    onChangeText={setUrlInput}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <Pressable
                    onPress={() => void handleUrlImport()}
                    disabled={importing}
                    style={{
                      alignSelf: 'flex-start',
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 999,
                      backgroundColor: libraryTokens.primaryContainer,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodySemiBold,
                        fontSize: 13,
                        color: '#161E00',
                      }}>
                      Import from URL
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {!generating ? (
        <View
          className="absolute left-0 right-0"
          style={{bottom: bottomPad}}
          pointerEvents="box-none">
          <GenerateScreenFooter
            onGenerate={() => void onGenerate()}
            disabled={importing}
          />
        </View>
      ) : null}

      {generating ? (
        <GenerateLoadingOverlay
          onCancel={handleCancelGeneration}
          bottomPad={bottomPad}
        />
      ) : null}
    </View>
  );
}
