import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';

type FlipCardProps = {
  question: string;
  answer: string;
  flipped: boolean;
  onFlip: () => void;
  cardNumber?: number;
  cardType?: string;
  reducedMotion?: boolean;
  explainLoading?: boolean;
  onExplainAi?: () => void;
  onReport?: () => void;
};

function keyTakeaway(answer: string): string {
  const cleaned = answer.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 140) return cleaned;
  const cut = cleaned.slice(0, 140);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  if (lastStop > 60) return cut.slice(0, lastStop + 1);
  return `${cut.trim()}…`;
}

export function FlipCard({
  question,
  answer,
  flipped,
  onFlip,
  cardNumber,
  cardType = 'Concept Check',
  explainLoading = false,
  onExplainAi,
  onReport,
}: FlipCardProps) {
  const {height} = useWindowDimensions();
  const minHeight = Math.min(420, Math.max(320, height * 0.42));

  return (
    <Pressable
      className="w-full active:opacity-98"
      onPress={onFlip}
      accessibilityRole="button"
      accessibilityLabel={flipped ? 'Hide answer' : 'Reveal answer'}>
      <View
        style={{
          minHeight,
          borderRadius: reviewTokens.cardRadius,
          backgroundColor: reviewTokens.card,
          borderWidth: 1,
          borderColor: reviewTokens.border,
          padding: 24,
          shadowColor: brandColors.charcoal,
          shadowOffset: {width: 0, height: 8},
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 3,
        }}>
        <View className="flex-row items-center justify-between" style={{marginBottom: 16}}>
          <View
            style={{
              backgroundColor: brandColors.paleLime,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 12,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: brandColors.olive,
              }}>
              {cardNumber != null ? `Question ${cardNumber}` : 'Question'}
            </Text>
          </View>
          <View className="flex-row items-center" style={{gap: 4}}>
            <MaterialIcons name="psychology" size={14} color={brandColors.olive} />
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 12,
                color: reviewTokens.muted,
              }}>
              {cardType}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 21,
            lineHeight: 28,
            letterSpacing: -0.3,
            color: brandColors.charcoal,
            marginBottom: 20,
          }}>
          {question}
        </Text>

        <View className="flex-row items-center" style={{marginBottom: 16}}>
          <View style={{flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 0.5, borderColor: '#DFE2DA'}} />
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: brandColors.lime,
              borderWidth: 2,
              borderColor: brandColors.surface,
              marginHorizontal: 12,
            }}
          />
          <View style={{flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 0.5, borderColor: '#DFE2DA'}} />
        </View>

        {!flipped ? (
          <View className="items-center justify-center" style={{paddingVertical: 28, gap: 8}}>
            <MaterialIcons name="touch-app" size={22} color={reviewTokens.muted} />
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 13,
                color: reviewTokens.muted,
              }}>
              Tap to reveal answer
            </Text>
          </View>
        ) : (
          <View style={{gap: 16}}>
            <View>
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 11,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: reviewTokens.muted,
                  marginBottom: 6,
                }}>
                Revealed Answer
              </Text>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={{maxHeight: Math.max(120, height * 0.22)}}>
                <Text
                  style={{
                    fontFamily: fonts.bodyMedium,
                    fontSize: 15,
                    lineHeight: 22,
                    color: brandColors.charcoal,
                  }}>
                  {answer}
                </Text>
              </ScrollView>
            </View>

            <View
              className="flex-row items-start"
              style={{
                backgroundColor: reviewTokens.takeawayBg,
                borderWidth: 1,
                borderColor: reviewTokens.takeawayBorder,
                borderRadius: 16,
                padding: 14,
                gap: 10,
              }}>
              <Text style={{fontSize: 16}}>💡</Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.bodyMedium,
                  fontSize: 12,
                  lineHeight: 18,
                  color: reviewTokens.takeawayText,
                }}>
                <Text style={{fontFamily: fonts.bodyBold}}>Key takeaway: </Text>
                {keyTakeaway(answer)}
              </Text>
            </View>

            <View
              className="flex-row items-center justify-between"
              style={{
                marginTop: 4,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: '#F0F2EB',
              }}>
              <Pressable
                onPress={e => {
                  e.stopPropagation?.();
                  if (!explainLoading) onExplainAi?.();
                }}
                disabled={explainLoading}
                accessibilityRole="button"
                accessibilityState={{busy: explainLoading}}
                className={`flex-row items-center active:opacity-80 ${
                  explainLoading ? 'opacity-70' : ''
                }`}
                style={{
                  backgroundColor: brandColors.paleLime,
                  borderRadius: 999,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  gap: 6,
                }}>
                {explainLoading ? (
                  <ActivityIndicator size="small" color={brandColors.olive} />
                ) : (
                  <MaterialIcons
                    name="auto-awesome"
                    size={14}
                    color={brandColors.olive}
                  />
                )}
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 12,
                    color: brandColors.olive,
                  }}>
                  {explainLoading ? 'Explaining…' : 'Explain with AI'}
                </Text>
              </Pressable>
              <Pressable
                onPress={e => {
                  e.stopPropagation?.();
                  onReport?.();
                }}
                accessibilityRole="button"
                className="flex-row items-center active:opacity-70"
                style={{gap: 4}}>
                <MaterialIcons name="flag" size={14} color={reviewTokens.muted} />
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 12,
                    color: reviewTokens.muted,
                  }}>
                  Report issue
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

type ReviewProgressProps = {
  current: number;
  total: number;
  variant?: 'header' | 'inline' | 'session';
};

export function ReviewProgress({
  current,
  total,
  variant = 'inline',
}: ReviewProgressProps) {
  const progress = total > 0 ? current / total : 0;
  const percent = Math.round(progress * 100);

  if (variant === 'header') {
    return (
      <View className="w-full mt-1">
        <View
          className="h-1.5 rounded-full overflow-hidden"
          style={{backgroundColor: libraryTokens.surfaceContainerLow}}>
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.max(progress * 100, 4)}%`,
              backgroundColor: libraryTokens.primaryContainer,
            }}
          />
        </View>
      </View>
    );
  }

  if (variant === 'session') {
    return (
      <View className="w-full">
        <View className="flex-row items-center justify-between" style={{marginBottom: 4}}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: reviewTokens.muted,
            }}>
            Progress
          </Text>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              color: brandColors.charcoal,
            }}>
            {current} / {total} ({percent}%)
          </Text>
        </View>
        <View
          style={{
            height: 8,
            borderRadius: 999,
            backgroundColor: '#E5E8E0',
            overflow: 'hidden',
          }}>
          <View
            style={{
              width: `${Math.max(percent, percent > 0 ? 4 : 0)}%`,
              height: '100%',
              borderRadius: 999,
              backgroundColor: brandColors.lime,
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="w-full">
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 11,
          color: reviewTokens.muted,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
        {current} / {total} cards
      </Text>
      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: libraryTokens.surfaceContainerLow,
          overflow: 'hidden',
        }}>
        <View
          style={{
            width: `${Math.max(progress * 100, 4)}%`,
            height: '100%',
            borderRadius: 999,
            backgroundColor: brandColors.lime,
          }}
        />
      </View>
    </View>
  );
}

export function ReviewBackground() {
  return (
    <View
      className="absolute inset-0"
      style={{backgroundColor: libraryTokens.background}}
      pointerEvents="none"
    />
  );
}
