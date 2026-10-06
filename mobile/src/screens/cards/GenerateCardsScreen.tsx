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
import * as ImagePicker from 'expo-image-picker';
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
  DocumentImportPanel,
  CameraScanPanel,
  type CognitiveDensity,
  type ScanDensity,
} from '../../components/generate';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {toast} from '../../components/ui/Toast';
import {colors, fonts, brandColors} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useCardMutations} from '../../hooks/useCards';
import {useDeck} from '../../hooks/useDecks';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {useScreenLayout} from '../../hooks/useScreenLayout';
import {getApiErrorMessage, getGenerateErrorMessage} from '../../lib/errors';
import type {GenerateCardsFormValues} from '../../lib/schemas';
import type {
  GenerateSourceType,
  LibraryStackParamList,
} from '../../navigation/types';
import {preferencesStorage} from '../../storage/preferencesStorage';
import type {FlashcardDraft} from '../../types/api';

type Props = NativeStackScreenProps<LibraryStackParamList, 'GenerateCards'>;

/** Mockup quantity row — 5, 10, 15, 20 */
const COUNT_OPTIONS = [5, 10, 15, 20] as const;

type Difficulty = 'easy' | 'medium' | 'hard';
type DetailMode = 'concise' | 'examples';
type CardFormat = 'qa' | 'cloze';

const DIFFICULTY_OPTIONS: Array<{value: Difficulty; label: string}> = [
  {value: 'easy', label: 'Beginner'},
  {value: 'medium', label: 'Intermediate'},
  {value: 'hard', label: 'Advanced'},
];

const DIFFICULTY_TO_TONE: Record<
  Difficulty,
  GenerateCardsFormValues['tone']
> = {
  easy: 'concise',
  medium: 'concise',
  hard: 'critical',
};

const LANGUAGE_LABELS: Record<string, string> = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'es-ES': 'Spanish',
  'fr-FR': 'French',
  'de-DE': 'German',
  'pt-BR': 'Portuguese',
  'hi-IN': 'Hindi',
};

const TAB_CLEARANCE = 100;
const FOOTER_CLEARANCE = 112;

async function pickScanImage(
  source: 'gallery' | 'camera' = 'gallery',
): Promise<{uri: string; name?: string; type?: string} | null> {
  try {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        toast.error('Permission needed', 'Allow camera access to scan notes.');
        return null;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets?.[0]?.uri) {
        return null;
      }
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.fileName ?? `scan-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      };
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.error('Permission needed', 'Allow photo access to pick a scan.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]?.uri) {
      return null;
    }
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName ?? 'scan.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    };
  } catch {
    try {
      const [file] = await pick({
        type: [types.images],
        allowMultiSelection: false,
      });
      return {
        uri: file.uri,
        name: file.name ?? 'scan.jpg',
        type: file.type ?? 'image/jpeg',
      };
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return null;
      }
      throw error;
    }
  }
}

function languageDisplay(code: string): string {
  return LANGUAGE_LABELS[code] ?? code;
}

export function GenerateCardsScreen({navigation, route}: Props) {
  const {deckId, initialSource = 'topic'} = route.params;
  const layout = useScreenLayout(libraryTokens.contentMaxWidthWide);
  const {user} = useAppUser();
  const {openProfile} = useProfileNavigation();
  const {data: deck} = useDeck(deckId);
  const {generateCards, saveCardsBulk, importPdf, importUrl, importScanImage} =
    useCardMutations(deckId);

  const [preview, setPreview] = useState<FlashcardDraft[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [topicText, setTopicText] = useState('');
  const [notesText, setNotesText] = useState('');
  const [scanText, setScanText] = useState('');
  const [scanImageUri, setScanImageUri] = useState<string | null>(null);
  const [scanImageMeta, setScanImageMeta] = useState<{
    name: string;
    type: string;
  } | null>(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [cognitiveDensity, setCognitiveDensity] =
    useState<CognitiveDensity>('synthesis');
  const [scanDensity, setScanDensity] = useState<ScanDensity>('balanced');
  const [scanArchetypes, setScanArchetypes] = useState({
    definition: true,
    scenario: true,
    cloze: true,
  });
  const [activeSource, setActiveSource] =
    useState<GenerateSourceType>(initialSource);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [detailMode, setDetailMode] = useState<DetailMode>('examples');
  const [cardFormat, setCardFormat] = useState<CardFormat>('qa');
  const [language] = useState(() => preferencesStorage.get().language);
  const [inputFocused, setInputFocused] = useState(false);
  const cancelledRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const notesInputRef = useRef<TextInput>(null);
  const topicInputRef = useRef<TextInput>(null);
  const scanInputRef = useRef<TextInput>(null);

  const topicPrefilledRef = useRef(false);

  useEffect(() => {
    topicPrefilledRef.current = false;
    setTopicText('');
    setNotesText('');
    setScanText('');
    setScanImageUri(null);
    setScanImageMeta(null);
    setAttachedFileName(null);
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
    if (initialSource === 'notes' || initialSource === 'pdf') {
      const timer = setTimeout(() => notesInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
    if (initialSource === 'scan') {
      const timer = setTimeout(() => scanInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [initialSource]);

  const sourceType = activeSource;

  const {watch, setValue} = useForm<Pick<GenerateCardsFormValues, 'count' | 'tone'>>({
    defaultValues: {
      count: 10,
      tone: DIFFICULTY_TO_TONE.medium,
    },
  });

  const count = watch('count');
  const tone = watch('tone');
  const bottomPad = Math.max(layout.insets.bottom, 16) + TAB_CLEARANCE;
  const screenBg = {backgroundColor: libraryTokens.background};
  const notesMinHeight = layout.isCompact ? 168 : 192;

  const applyDifficulty = (next: Difficulty) => {
    setDifficulty(next);
    if (detailMode === 'examples') {
      setValue('tone', next === 'hard' ? 'critical' : 'detailed');
    } else {
      setValue('tone', DIFFICULTY_TO_TONE[next]);
    }
  };

  const applyDetailMode = (next: DetailMode) => {
    setDetailMode(next);
    if (next === 'examples') {
      setValue('tone', difficulty === 'hard' ? 'critical' : 'detailed');
    } else {
      setValue('tone', DIFFICULTY_TO_TONE[difficulty]);
    }
  };

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
    if (sourceType === 'scan') {
      return {sourceType: 'notes', content: scanText.trim()};
    }
    return {sourceType: 'notes', content: notesText.trim()};
  };

  const resolveGenerateParams = () => {
    if (sourceType === 'pdf') {
      const nextCount =
        cognitiveDensity === 'definitions'
          ? 6
          : cognitiveDensity === 'exam'
            ? 20
            : 14;
      const nextTone =
        cognitiveDensity === 'definitions'
          ? ('concise' as const)
          : cognitiveDensity === 'exam'
            ? ('critical' as const)
            : ('detailed' as const);
      const nextDifficulty: Difficulty =
        cognitiveDensity === 'definitions'
          ? 'easy'
          : cognitiveDensity === 'exam'
            ? 'hard'
            : 'medium';
      return {
        count: nextCount,
        tone: nextTone,
        difficulty: nextDifficulty,
        detailMode:
          cognitiveDensity === 'definitions'
            ? ('concise' as const)
            : ('examples' as const),
        cardFormat: 'qa' as const,
      };
    }
    if (sourceType === 'scan') {
      const nextCount =
        scanDensity === 'concise' ? 6 : scanDensity === 'deep' ? 20 : 14;
      const nextTone =
        scanDensity === 'deep'
          ? ('detailed' as const)
          : ('concise' as const);
      const nextDifficulty: Difficulty =
        scanDensity === 'deep' ? 'hard' : scanDensity === 'concise' ? 'easy' : 'medium';
      const nextFormat: CardFormat = scanArchetypes.cloze ? 'cloze' : 'qa';
      return {
        count: nextCount,
        tone: nextTone,
        difficulty: nextDifficulty,
        detailMode:
          scanDensity === 'deep'
            ? ('examples' as const)
            : ('concise' as const),
        cardFormat: nextFormat,
      };
    }
    return {
      count,
      tone,
      difficulty,
      detailMode,
      cardFormat,
    };
  };

  const onGenerate = async () => {
    const params = resolveGenerateParams();
    setValue('count', params.count);
    setValue('tone', params.tone);

    const {sourceType: type, content} = resolveSource();
    if (!content) {
      const message =
        sourceType === 'topic'
          ? 'Enter a topic to generate cards from.'
          : sourceType === 'scan'
            ? 'Paste or type extracted text from your scan to continue.'
            : 'Paste your notes or attach a PDF.';
      toast.error(
        sourceType === 'topic' ? 'Topic required' : 'Notes required',
        message,
      );
      return;
    }

    if (type === 'notes' && content.length < 150) {
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
          count: params.count,
          tone: params.tone,
          difficulty: params.difficulty,
          cardFormat: params.cardFormat,
          detailMode: params.detailMode,
          language,
        },
        controller.signal,
      );
      if (cancelledRef.current || controller.signal.aborted) return;
      if (!cards.length) {
        toast.error(
          'No cards generated',
          'Try adding more detail or choosing a different difficulty.',
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
      setAttachedFileName(file.name ?? 'document.pdf');
      setActiveSource(prev => (prev === 'pdf' ? 'pdf' : 'notes'));
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
      setActiveSource(prev => (prev === 'pdf' ? 'pdf' : 'notes'));
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

  const runOcrOnImage = async (
    uri: string,
    name: string,
    type = 'image/jpeg',
  ) => {
    setOcrRunning(true);
    setImporting(true);
    try {
      const result = await importScanImage({uri, name, type});
      setScanText(result.content);
      toast.success(
        'Text extracted',
        `${result.content.length.toLocaleString()} characters ready for cards.`,
      );
    } catch (error) {
      toast.error('OCR failed', getApiErrorMessage(error));
    } finally {
      setOcrRunning(false);
      setImporting(false);
    }
  };

  const handleCaptureOrPickScan = async (source: 'gallery' | 'camera') => {
    try {
      setImporting(true);
      const picked = await pickScanImage(source);
      if (!picked) return;
      const name = picked.name ?? `scan-${Date.now()}.jpg`;
      const type = picked.type ?? 'image/jpeg';
      setScanImageUri(picked.uri);
      setScanImageMeta({name, type});
      setActiveSource('scan');
      setImporting(false);
      await runOcrOnImage(picked.uri, name, type);
    } catch (error) {
      toast.error('Could not open scanner', getApiErrorMessage(error));
      setImporting(false);
    }
  };

  const handlePickScanImage = async () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Take Photo', 'Choose from Gallery', 'Cancel'],
          cancelButtonIndex: 2,
        },
        index => {
          if (index === 0) void handleCaptureOrPickScan('camera');
          if (index === 1) void handleCaptureOrPickScan('gallery');
        },
      );
      return;
    }

    Alert.alert('Scan notes', 'Capture a page or pick from your gallery.', [
      {text: 'Take Photo', onPress: () => void handleCaptureOrPickScan('camera')},
      {
        text: 'Choose from Gallery',
        onPress: () => void handleCaptureOrPickScan('gallery'),
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const handleRunOcr = () => {
    if (!scanImageUri) {
      toast.error('No image', 'Take a photo or pick a scan first.');
      return;
    }
    void runOcrOnImage(
      scanImageUri,
      scanImageMeta?.name ?? 'scan.jpg',
      scanImageMeta?.type ?? 'image/jpeg',
    );
  };

  const handleSourceTypeChange = (type: GenerateSourceType) => {
    setActiveSource(type);
    setInputFocused(false);
    if (type === 'topic' || type === 'scan') {
      setShowUrlInput(false);
    }
  };

  const densityToCount = (d: CognitiveDensity | ScanDensity): number => {
    if (d === 'definitions' || d === 'concise') return 6;
    if (d === 'exam' || d === 'deep') return 20;
    return 14;
  };

  const estimatedCardsLabel = (() => {
    if (sourceType === 'scan') {
      const n = densityToCount(scanDensity);
      return `${Math.max(4, n - 2)}–${n + 2} Cards`;
    }
    if (sourceType === 'pdf') {
      const n = densityToCount(cognitiveDensity);
      return `~${n - 4}-${n + 4} cards`;
    }
    return `${count} cards`;
  })();

  const heroTitle = 'Create cards with AI';
  const heroSubtitle =
    'Choose a source, customize depth, and generate high-yield flashcards in seconds.';
  const deckTitle = deck?.title?.trim() ?? '';
  const showDeckContext = Boolean(deckTitle);
  const showNotesField = sourceType === 'notes';
  const showUpload = sourceType === 'notes';
  const showPdfPanel = sourceType === 'pdf';
  const showScanPanel = sourceType === 'scan';

  const sourceInputLabel =
    sourceType === 'topic'
      ? 'Topic or Specific Focus'
      : sourceType === 'scan'
        ? 'Extracted text'
        : 'Study Notes';
  const sourceHint =
    sourceType === 'topic'
      ? 'From deck topic'
      : sourceType === 'scan'
        ? 'Paste OCR text'
        : 'Paste or import';

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

  const handleRegenerateBatch = () => {
    Alert.alert(
      'Regenerate batch?',
      'Current cards will be replaced with a new AI generation.',
      [
        {text: 'Keep editing', style: 'cancel'},
        {
          text: 'Regenerate',
          onPress: () => {
            setPreview(null);
            void onGenerate();
          },
        },
      ],
    );
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
        onRegenerateBatch={handleRegenerateBatch}
      />
    );
  }

  return (
    <View className="flex-1" style={screenBg}>
      <DeckDetailHeader
        title={
          sourceType === 'pdf'
            ? 'Document Import'
            : sourceType === 'scan'
              ? 'Camera Scan'
              : 'Generate with AI'
        }
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
            paddingHorizontal: 16,
            paddingBottom: bottomPad + FOOTER_CLEARANCE,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
            gap: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <GenerateHeroSection
            compact={layout.isCompact}
            title={heroTitle}
            subtitle={heroSubtitle}
            deckTitle={showDeckContext ? deckTitle : undefined}
          />

          <View>
            <GenerateFieldLabel>Input Source</GenerateFieldLabel>
            <GenerateSourceTypeToggle
              value={sourceType}
              onChange={handleSourceTypeChange}
            />
          </View>

          <View
            style={{
              backgroundColor: libraryTokens.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: libraryTokens.border,
              padding: 16,
              gap: 16,
            }}>
            {sourceType === 'topic' ? (
              <View style={{gap: 6}}>
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{
                      fontFamily: fonts.bodyBold,
                      fontSize: 12,
                      color: libraryTokens.ink,
                    }}>
                    {sourceInputLabel}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 11,
                      color: '#70757D',
                    }}>
                    {sourceHint}
                  </Text>
                </View>
                <View style={{position: 'relative'}}>
                  <GenerateInputBox focused={inputFocused}>
                    <TextInput
                      ref={topicInputRef}
                      style={{
                        fontFamily: fonts.bodyMedium,
                        fontSize: 12,
                        lineHeight: 18,
                        color: libraryTokens.ink,
                        padding: 0,
                        minHeight: 72,
                        textAlignVertical: 'top',
                        paddingBottom: 18,
                      }}
                      placeholder="e.g. Supervised learning, Loss functions..."
                      placeholderTextColor={`${colors.muted}99`}
                      multiline
                      value={topicText}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      onChangeText={setTopicText}
                    />
                  </GenerateInputBox>
                  <Text
                    style={{
                      position: 'absolute',
                      right: 12,
                      bottom: 10,
                      fontFamily: fonts.body,
                      fontSize: 10,
                      color: '#70757D',
                    }}>
                    {topicText.length} chars
                  </Text>
                </View>
              </View>
            ) : null}

            {showNotesField ? (
              <View style={{gap: 6}}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 12,
                    color: libraryTokens.ink,
                  }}>
                  {sourceInputLabel}
                </Text>
                <GenerateInputBox focused={inputFocused}>
                  <TextInput
                    ref={notesInputRef}
                    style={{
                      minHeight: notesMinHeight,
                      fontFamily: fonts.body,
                      fontSize: 14,
                      lineHeight: 20,
                      color: libraryTokens.ink,
                      textAlignVertical: 'top',
                      padding: 0,
                    }}
                    placeholder="Paste your lecture notes, article text, or concepts…"
                    placeholderTextColor={`${colors.muted}99`}
                    multiline
                    value={notesText}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChangeText={setNotesText}
                  />
                </GenerateInputBox>
              </View>
            ) : null}

            {showPdfPanel ? (
              <DocumentImportPanel
                deckTitle={deckTitle}
                notesText={notesText}
                onNotesChange={setNotesText}
                importing={importing}
                attachedName={attachedFileName}
                density={cognitiveDensity}
                onDensityChange={setCognitiveDensity}
                estimatedCards={estimatedCardsLabel}
                onPickLocal={() => void handlePdfImport()}
                onImportUrl={() => {
                  setShowUrlInput(true);
                  if (urlInput.trim()) void handleUrlImport();
                }}
                onClear={() => {
                  setNotesText('');
                  setAttachedFileName(null);
                }}
                inputFocused={inputFocused}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                notesRef={notesInputRef}
              />
            ) : null}

            {showScanPanel ? (
              <CameraScanPanel
                deckTitle={deckTitle}
                scanImageUri={scanImageUri}
                scanText={scanText}
                onScanTextChange={setScanText}
                importing={importing || ocrRunning}
                ocrRunning={ocrRunning}
                density={scanDensity}
                onDensityChange={setScanDensity}
                archetypes={scanArchetypes}
                onToggleArchetype={key =>
                  setScanArchetypes(prev => ({...prev, [key]: !prev[key]}))
                }
                estimatedYield={estimatedCardsLabel}
                onTakePhoto={() => void handleCaptureOrPickScan('camera')}
                onPickGallery={() => void handleCaptureOrPickScan('gallery')}
                onPickImage={() => void handlePickScanImage()}
                onRunOcr={handleRunOcr}
                onClear={() => {
                  setScanText('');
                  setScanImageUri(null);
                  setScanImageMeta(null);
                }}
                inputFocused={inputFocused}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                scanRef={scanInputRef}
              />
            ) : null}

            {!showPdfPanel && !showScanPanel ? (
            <>
            <View className="flex-row" style={{gap: 10}}>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 12,
                    color: libraryTokens.ink,
                    marginBottom: 6,
                  }}>
                  Target Deck
                </Text>
                <View
                  style={{
                    backgroundColor: libraryTokens.background,
                    borderWidth: 1,
                    borderColor: libraryTokens.border,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 12,
                      color: libraryTokens.ink,
                    }}>
                    {deckTitle || 'Current deck'}
                  </Text>
                </View>
              </View>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 12,
                    color: libraryTokens.ink,
                    marginBottom: 6,
                  }}>
                  Language
                </Text>
                <View
                  style={{
                    backgroundColor: libraryTokens.background,
                    borderWidth: 1,
                    borderColor: libraryTokens.border,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 12,
                      color: libraryTokens.ink,
                    }}>
                    {languageDisplay(language)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{height: 1, backgroundColor: libraryTokens.border}} />

            <GenerateSegmentSelector
              label="Difficulty Level"
              options={DIFFICULTY_OPTIONS.map(o => ({
                value: o.value,
                label: o.label,
              }))}
              value={difficulty}
              onChange={applyDifficulty}
            />

            <View>
              <View className="flex-row items-center justify-between" style={{marginBottom: 8}}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 12,
                    color: libraryTokens.ink,
                  }}>
                  Cards to Generate
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 12,
                    color: brandColors.olive,
                  }}>
                  {count} Cards
                </Text>
              </View>
              <View className="flex-row" style={{gap: 8}}>
                {COUNT_OPTIONS.map(n => {
                  const selected = count === n;
                  return (
                    <Pressable
                      key={n}
                      onPress={() => setValue('count', n)}
                      accessibilityRole="button"
                      accessibilityState={{selected}}
                      className="active:opacity-90"
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 16,
                        alignItems: 'center',
                        backgroundColor: selected
                          ? brandColors.lime
                          : libraryTokens.background,
                        borderWidth: 1,
                        borderColor: selected
                          ? brandColors.lime
                          : libraryTokens.border,
                      }}>
                      <Text
                        style={{
                          fontFamily: selected ? fonts.bodyBold : fonts.bodySemiBold,
                          fontSize: 12,
                          color: selected ? brandColors.charcoal : '#70757D',
                        }}>
                        {n}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{height: 1, backgroundColor: libraryTokens.border}} />

            <View style={{gap: 12}}>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: libraryTokens.ink,
                }}>
                Explanation Depth
              </Text>
              <View className="flex-row" style={{gap: 8}}>
                {(
                  [
                    {value: 'concise' as const, label: 'Concise points'},
                    {value: 'examples' as const, label: 'With examples'},
                  ] as const
                ).map(option => {
                  const selected = detailMode === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => applyDetailMode(option.value)}
                      className="active:opacity-90 flex-row items-center"
                      style={{
                        flex: 1,
                        gap: 8,
                        padding: 10,
                        borderRadius: 16,
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected
                          ? brandColors.lime
                          : libraryTokens.border,
                        backgroundColor: selected
                          ? 'rgba(241,251,207,0.4)'
                          : libraryTokens.background,
                      }}>
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          borderWidth: 2,
                          borderColor: selected
                            ? brandColors.olive
                            : libraryTokens.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: selected
                            ? brandColors.olive
                            : 'transparent',
                        }}>
                        {selected ? (
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: brandColors.surface,
                            }}
                          />
                        ) : null}
                      </View>
                      <Text
                        style={{
                          fontFamily: selected ? fonts.bodyBold : fonts.bodySemiBold,
                          fontSize: 11,
                          color: brandColors.charcoal,
                        }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: libraryTokens.ink,
                }}>
                Format
              </Text>
              <View className="flex-row" style={{gap: 8}}>
                {(
                  [
                    {value: 'qa' as const, label: 'Standard Q&A'},
                    {value: 'cloze' as const, label: 'Cloze blank'},
                  ] as const
                ).map(option => {
                  const selected = cardFormat === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setCardFormat(option.value)}
                      accessibilityRole="button"
                      accessibilityState={{selected}}
                      className="active:opacity-90"
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 16,
                        alignItems: 'center',
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected
                          ? brandColors.charcoal
                          : libraryTokens.border,
                        backgroundColor: selected
                          ? brandColors.surface
                          : libraryTokens.background,
                      }}>
                      <Text
                        style={{
                          fontFamily: selected ? fonts.bodyBold : fonts.bodyMedium,
                          fontSize: 12,
                          color: selected ? brandColors.charcoal : '#70757D',
                        }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {showUpload ? (
              <View>
                <GenerateFieldLabel>Or Upload</GenerateFieldLabel>
                <Pressable
                  onPress={openUploadOptions}
                  disabled={importing}
                  accessibilityRole="button"
                  className="active:opacity-80 flex-row items-center justify-center"
                  style={{
                    gap: 10,
                    paddingVertical: 18,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    borderColor: colors.outlineVariant,
                    backgroundColor: libraryTokens.background,
                    opacity: importing ? 0.6 : 1,
                  }}>
                  <MaterialIcons name="upload-file" size={20} color="#70757D" />
                  <Text
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 13,
                      color: '#70757D',
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
                        backgroundColor: libraryTokens.background,
                        paddingHorizontal: 16,
                        height: 44,
                        fontFamily: fonts.body,
                        fontSize: 13,
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
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: brandColors.lime,
                      }}>
                      <Text
                        style={{
                          fontFamily: fonts.bodySemiBold,
                          fontSize: 12,
                          color: brandColors.charcoal,
                        }}>
                        Import from URL
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}
            </>
            ) : null}
          </View>

            {showPdfPanel && showUrlInput ? (
              <View style={{gap: 8}}>
                <TextInput
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: libraryTokens.border,
                    backgroundColor: brandColors.surface,
                    paddingHorizontal: 16,
                    height: 44,
                    fontFamily: fonts.body,
                    fontSize: 13,
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
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: brandColors.lime,
                  }}>
                  <Text
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 12,
                      color: brandColors.charcoal,
                    }}>
                    Import from URL
                  </Text>
                </Pressable>
              </View>
            ) : null}

          <View
            className="flex-row items-start"
            style={{
              backgroundColor: brandColors.paleLime,
              borderWidth: 1,
              borderColor: brandColors.lime,
              borderRadius: 16,
              padding: 14,
              gap: 12,
            }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                backgroundColor: brandColors.lime,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
              }}>
              <MaterialIcons name="auto-awesome" size={12} color={brandColors.charcoal} />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.bodyMedium,
                fontSize: 12,
                lineHeight: 18,
                color: brandColors.charcoal,
              }}>
              AI will analyze key definitions, contrasting concepts, and practical
              examples for optimal spaced repetition recall.
            </Text>
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
            onCancel={() => navigation.goBack()}
            disabled={importing}
            cardCount={
              sourceType === 'pdf' || sourceType === 'scan'
                ? resolveGenerateParams().count
                : count
            }
            generateLabel={
              sourceType === 'pdf'
                ? 'Extract & Generate'
                : sourceType === 'scan'
                  ? 'Generate Cards'
                  : undefined
            }
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
