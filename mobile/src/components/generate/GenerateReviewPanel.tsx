import {useRef, useState, type ReactNode} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {PreviewCardEditor} from '../card/PreviewCardEditor';
import {ScrollToTopFab, SCROLL_TO_TOP_THRESHOLD} from '../ui/ScrollToTopFab';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {GenerateReviewFooter} from './GenerateReviewFooter';
import {GenerateReviewHeader} from './GenerateReviewHeader';
import type {FlashcardDraft} from '../../types/api';

type GenerateReviewPanelProps = {
  preview: FlashcardDraft[];
  deckTitle?: string;
  saving: boolean;
  bottomPad: number;
  compact: boolean;
  headerRight: ReactNode;
  onBack: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onUpdateCard: (
    index: number,
    field: keyof FlashcardDraft,
    value: string,
  ) => void;
  onRemoveCard: (index: number) => void;
};

const REVIEW_FOOTER_CLEARANCE = 88;
const REVIEW_FOOTER_HEIGHT = 80;

export function GenerateReviewPanel({
  preview,
  deckTitle,
  saving,
  bottomPad,
  compact,
  headerRight,
  onBack,
  onSave,
  onDiscard,
  onUpdateCard,
  onRemoveCard,
}: GenerateReviewPanelProps) {
  const validCount = preview.filter(
    c => c.question.trim() && c.answer.trim(),
  ).length;
  const scrollRef = useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const shouldShow = y > SCROLL_TO_TOP_THRESHOLD;
    setShowScrollTop(prev => (prev === shouldShow ? prev : shouldShow));
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({y: 0, animated: true});
  };

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <GenerateReviewHeader onBack={onBack} right={headerRight} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: libraryTokens.containerPadding,
            paddingTop: 24,
            paddingBottom: bottomPad + REVIEW_FOOTER_CLEARANCE,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View
            className="flex-row items-end justify-between"
            style={{marginBottom: libraryTokens.sectionGap}}>
            <View className="flex-1 min-w-0 mr-3">
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                  color: colors.muted,
                  marginBottom: 4,
                }}>
                Generated
              </Text>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: compact ? 28 : 32,
                  lineHeight: compact ? 36 : 40,
                  letterSpacing: -0.64,
                  fontWeight: '700',
                  color: colors.onSurface,
                }}>
                Review & edit
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 16,
                  lineHeight: 24,
                  color: colors.muted,
                  marginTop: 4,
                }}
                numberOfLines={2}>
                {preview.length} cards ready — {validCount} valid for{' '}
                {deckTitle ?? 'your deck'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: libraryTokens.primaryContainer,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginBottom: 8,
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  color: libraryTokens.onPrimaryContainer,
                }}>
                {preview.length}
              </Text>
            </View>
          </View>

          <View style={{gap: libraryTokens.sectionGap}}>
            {preview.map((card, index) => (
              <PreviewCardEditor
                key={index}
                card={card}
                index={index}
                onChange={onUpdateCard}
                onDelete={() => onRemoveCard(index)}
              />
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        className="absolute left-0 right-0"
        style={{bottom: bottomPad}}
        pointerEvents="box-none">
        <ScrollToTopFab
          visible={showScrollTop}
          onPress={scrollToTop}
          bottom={REVIEW_FOOTER_HEIGHT + 12}
        />
        <GenerateReviewFooter
          deckTitle={deckTitle}
          cardCount={preview.length}
          saving={saving}
          compact={compact}
          onSave={onSave}
          onDiscard={onDiscard}
        />
      </View>
    </View>
  );
}
