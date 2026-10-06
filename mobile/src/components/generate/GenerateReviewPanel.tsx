import {useRef, useState, type ReactNode} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {PreviewCardEditor} from '../card/PreviewCardEditor';
import {ScrollToTopFab, SCROLL_TO_TOP_THRESHOLD} from '../ui/ScrollToTopFab';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {GenerateReviewFooter} from './GenerateReviewFooter';
import {GenerateReviewHeader} from './GenerateReviewHeader';
import {toast} from '../ui/Toast';
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
  onRegenerateBatch?: () => void;
};

const REVIEW_FOOTER_CLEARANCE = 88;
const REVIEW_FOOTER_HEIGHT = 80;
const SUBTEXT = '#70757D';

function cardTypeForIndex(index: number, question?: string): string {
  if (question?.includes('____')) {
    return 'Cloze deletion';
  }
  const types = ['Concept check', 'Key definition', 'Application', 'Compare & contrast'];
  return types[index % types.length] ?? 'Concept check';
}

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
  onRegenerateBatch,
}: GenerateReviewPanelProps) {
  const validCount = preview.filter(
    c => c.question.trim() && c.answer.trim(),
  ).length;
  const scrollRef = useRef<ScrollView>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [allSelected, setAllSelected] = useState(true);

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
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: bottomPad + REVIEW_FOOTER_CLEARANCE,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={{marginBottom: 16}}>
            <View className="flex-row items-center justify-between" style={{marginBottom: 4}}>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 11,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: '#757E70',
                }}>
                Generated with AI
              </Text>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  backgroundColor: brandColors.lime,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 12,
                    color: brandColors.charcoal,
                  }}>
                  {preview.length}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: compact ? 24 : 28,
                lineHeight: compact ? 30 : 34,
                letterSpacing: -0.4,
                color: brandColors.charcoal,
              }}>
              Review & edit
            </Text>
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 14,
                color: SUBTEXT,
                marginTop: 2,
              }}>
              {preview.length} cards ready — {validCount} valid for{' '}
              <Text style={{fontFamily: fonts.bodySemiBold, color: brandColors.charcoal}}>
                {deckTitle ?? 'your deck'}
              </Text>
            </Text>

            <View
              className="flex-row items-start"
              style={{
                marginTop: 14,
                backgroundColor: 'rgba(241,251,207,0.6)',
                borderWidth: 1,
                borderColor: 'rgba(82,107,23,0.15)',
                borderRadius: 12,
                padding: 12,
                gap: 10,
              }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  backgroundColor: libraryTokens.primaryContainer,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}>
                <MaterialIcons
                  name="tips-and-updates"
                  size={16}
                  color={libraryTokens.onPrimaryContainer}
                />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.bodyMedium,
                  fontSize: 12,
                  lineHeight: 18,
                  color: brandColors.olive,
                }}>
                Tap any question or answer to refine wording before adding these
                cards to your deck. Remove anything that feels off-topic.
              </Text>
            </View>

            <View
              className="flex-row"
              style={{marginTop: 14, gap: 8}}>
              {[
                {
                  label: 'Ready',
                  value: String(validCount),
                  icon: 'verified' as const,
                },
                {
                  label: 'In batch',
                  value: String(preview.length),
                  icon: 'style' as const,
                },
                {
                  label: 'Editable',
                  value: 'Live',
                  icon: 'edit' as const,
                },
              ].map(stat => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: libraryTokens.borderSubtle,
                    backgroundColor: libraryTokens.surface,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    gap: 4,
                  }}>
                  <MaterialIcons
                    name={stat.icon}
                    size={16}
                    color={brandColors.olive}
                  />
                  <Text
                    style={{
                      fontFamily: fonts.bodyBold,
                      fontSize: 15,
                      color: brandColors.charcoal,
                    }}>
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 11,
                      color: SUBTEXT,
                    }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            <View
              className="flex-row items-center justify-between"
              style={{
                marginTop: 14,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: libraryTokens.border,
              }}>
              <Pressable
                onPress={() => setAllSelected(v => !v)}
                accessibilityRole="button"
                className="flex-row items-center active:opacity-80"
                style={{gap: 6, paddingVertical: 4}}>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    backgroundColor: allSelected
                      ? brandColors.charcoal
                      : brandColors.surface,
                    borderWidth: allSelected ? 0 : 1,
                    borderColor: libraryTokens.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {allSelected ? (
                    <MaterialIcons name="check" size={12} color={brandColors.surface} />
                  ) : null}
                </View>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 12,
                    color: brandColors.charcoal,
                  }}>
                  Select All ({preview.length})
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (onRegenerateBatch) {
                    onRegenerateBatch();
                    return;
                  }
                  toast.info(
                    'Regenerate',
                    'Go back and tap Generate again to create a new batch.',
                  );
                }}
                accessibilityRole="button"
                className="flex-row items-center active:opacity-80"
                style={{gap: 4, paddingVertical: 4}}>
                <MaterialIcons name="refresh" size={14} color={brandColors.olive} />
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 12,
                    color: brandColors.olive,
                  }}>
                  Regenerate batch
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={{gap: 16}}>
            {preview.map((card, index) => (
              <PreviewCardEditor
                key={index}
                card={card}
                index={index}
                total={preview.length}
                cardType={cardTypeForIndex(index, card.question)}
                onChange={onUpdateCard}
                onDelete={() => onRemoveCard(index)}
                onRegenerate={() =>
                  toast.info(
                    'Regenerate card',
                    'Edit the text below, or regenerate the full batch.',
                  )
                }
              />
            ))}

            <Pressable
              onPress={() =>
                toast.info('Add card', 'Save this batch first, then add cards from the deck.')
              }
              accessibilityRole="button"
              className="active:opacity-80 flex-row items-center justify-center"
              style={{
                paddingVertical: 14,
                borderRadius: 16,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: libraryTokens.border,
                backgroundColor: 'rgba(255,255,255,0.5)',
                gap: 8,
              }}>
              <MaterialIcons name="add" size={16} color={brandColors.olive} />
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: brandColors.olive,
                }}>
                Add Another Card Manually
              </Text>
            </Pressable>
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
          cardCount={validCount || preview.length}
          saving={saving}
          compact={compact}
          onSave={onSave}
          onDiscard={onDiscard}
        />
      </View>
    </View>
  );
}
