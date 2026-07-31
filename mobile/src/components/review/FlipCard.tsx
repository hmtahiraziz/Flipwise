import type {ReactNode} from 'react';
import {Pressable, ScrollView, Text, useWindowDimensions, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SilhouetteCard} from '../ui/SilhouetteCard';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';

type FlipCardProps = {
  question: string;
  answer: string;
  flipped: boolean;
  onFlip: () => void;
};

const CARD_MIN_HEIGHT = 380;
const CARD_MAX_HEIGHT = 420;

function SectionLabel({label, tone = 'muted'}: {label: string; tone?: 'muted' | 'primary'}) {
  return (
    <View className="shrink-0">
      <Text
        className={`text-label font-body-semibold uppercase tracking-widest ${
          tone === 'primary' ? 'text-primary' : 'text-muted'
        }`}>
        {label}
      </Text>
      <View className="h-1 w-12 bg-primary-container rounded-full mt-2" />
    </View>
  );
}

function CardContent({children}: {children: ReactNode}) {
  return <View className="flex-1">{children}</View>;
}

export function FlipCard({question, answer, flipped, onFlip}: FlipCardProps) {
  const {height} = useWindowDimensions();
  const cardHeight = Math.min(CARD_MAX_HEIGHT, Math.max(CARD_MIN_HEIGHT, height * 0.48));

  return (
    <Pressable
      className="w-full active:opacity-98"
      onPress={onFlip}
      accessibilityRole="button"
      accessibilityLabel={flipped ? 'Hide answer' : 'Reveal answer'}>
      <SilhouetteCard variant="review">
        <View
          className="border border-border overflow-hidden"
          style={{
            height: cardHeight,
            borderRadius: reviewTokens.cardRadius,
            backgroundColor: reviewTokens.card,
          }}>
          {!flipped ? (
            <CardContent key="front">
              <View className="flex-1 p-8">
                <SectionLabel label="Question" />

                <View className="flex-1 justify-center items-center py-6">
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      flexGrow: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 4,
                    }}
                    style={{width: '100%'}}>
                    <Text
                      className="font-display text-[32px] text-secondary text-center tracking-tight leading-10"
                      style={{color: reviewTokens.secondary}}>
                      {question}
                    </Text>
                  </ScrollView>
                </View>

                <View className="shrink-0 flex-row items-center justify-center gap-2 opacity-50 pt-2">
                  <MaterialIcons name="touch-app" size={16} color={reviewTokens.muted} />
                  <Text className="text-caption text-muted">Tap to reveal</Text>
                </View>
              </View>
            </CardContent>
          ) : (
            <CardContent key="back">
              <View className="flex-1 p-8">
                <SectionLabel label="The answer" tone="primary" />

                <ScrollView
                  className="flex-1 my-5"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{paddingBottom: 4}}>
                  <Text
                    className="font-body text-body leading-relaxed"
                    style={{color: reviewTokens.onSurface}}>
                    {answer}
                  </Text>
                </ScrollView>

                <View
                  className="shrink-0 rounded-xl p-4 flex-row items-start gap-3"
                  style={{backgroundColor: reviewTokens.surfaceContainerLow}}>
                  <MaterialIcons
                    name="auto-awesome"
                    size={18}
                    color={reviewTokens.primaryFixedDim}
                  />
                  <Text
                    className="text-caption flex-1 leading-5 italic"
                    style={{color: reviewTokens.muted}}>
                    Rate honestly so your next review is scheduled at the right time.
                  </Text>
                </View>

                <View className="shrink-0 flex-row items-center justify-center gap-2 mt-4 opacity-30">
                  <MaterialIcons name="flip" size={14} color={reviewTokens.muted} />
                  <Text className="text-[10px] text-muted">Tap to hide</Text>
                </View>
              </View>
            </CardContent>
          )}
        </View>
      </SilhouetteCard>
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
        <View className="flex-row items-center justify-between mb-2">
          <Text
            className="text-label font-body-semibold uppercase tracking-widest"
            style={{color: libraryTokens.muted}}>
            Progress
          </Text>
          <Text
            className="text-label font-body-semibold uppercase tracking-widest"
            style={{color: libraryTokens.primary}}>
            {current}/{total}
          </Text>
        </View>
        <View
          className="h-3 rounded-full overflow-hidden border"
          style={{
            backgroundColor: reviewTokens.cardStack,
            borderColor: libraryTokens.border,
          }}>
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

  return (
    <View className="w-full">
      <Text className="text-label text-muted uppercase mb-2">
        {current} / {total} cards
      </Text>
      <View
        className="h-2 rounded-full overflow-hidden"
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

export function ReviewBackground() {
  return (
    <View
      className="absolute inset-0"
      style={{backgroundColor: libraryTokens.background}}
      pointerEvents="none"
    />
  );
}
