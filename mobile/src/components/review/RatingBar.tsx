import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {previewIntervalHint} from '../../lib/sm2';
import {fonts} from '../../config/theme';
import {reviewTokens} from '../../config/reviewTokens';
import type {EaseRating} from '../../types/api';

type ReviewState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

type RatingOption = {
  rating: EaseRating;
  label: string;
  icon?: string;
  bg: string;
  border: string;
  text: string;
  hintColor: string;
  recommended?: boolean;
};

type RatingBarProps = {
  review: ReviewState;
  onRate: (rating: EaseRating) => void;
  disabled?: boolean;
  contentWidth: number;
};

function formatRatingHint(rating: EaseRating, hint: string): string {
  if (rating === 'again') return '< 1 min';
  if (hint === '<1d') return '<1 day';
  if (hint.endsWith('d')) {
    const days = parseInt(hint, 10);
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  if (hint.endsWith('w')) {
    const weeks = parseInt(hint, 10);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  if (hint.endsWith('mo')) {
    const months = parseInt(hint, 10);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  return hint;
}

const RATING_OPTIONS: RatingOption[] = [
  {
    rating: 'again',
    label: 'Again',
    icon: 'replay',
    bg: reviewTokens.againBg,
    border: reviewTokens.againBorder,
    text: reviewTokens.againText,
    hintColor: reviewTokens.muted,
  },
  {
    rating: 'hard',
    label: 'Hard',
    bg: reviewTokens.hardBg,
    border: reviewTokens.hardBorder,
    text: reviewTokens.hardText,
    hintColor: reviewTokens.muted,
  },
  {
    rating: 'good',
    label: 'Good',
    bg: reviewTokens.goodBg,
    border: reviewTokens.goodBorder,
    text: reviewTokens.goodText,
    hintColor: reviewTokens.olive,
    recommended: true,
  },
  {
    rating: 'easy',
    label: 'Easy',
    icon: 'check',
    bg: reviewTokens.easyBg,
    border: reviewTokens.easyBorder,
    text: reviewTokens.easyText,
    hintColor: reviewTokens.muted,
  },
];

const BUTTON_GAP = 8;

export function RatingBar({review, onRate, disabled, contentWidth}: RatingBarProps) {
  const buttonWidth = (contentWidth - BUTTON_GAP * 3) / 4;

  return (
    <View>
      <View className="flex-row items-center justify-between" style={{marginBottom: 8, paddingHorizontal: 2}}>
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 11,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: reviewTokens.muted,
          }}>
          Rate your recall
        </Text>
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 11,
            color: reviewTokens.muted,
          }}>
          Adjusts next review interval
        </Text>
      </View>

      <View className="flex-row" style={{gap: BUTTON_GAP}}>
        {RATING_OPTIONS.map(option => {
          const hint = formatRatingHint(
            option.rating,
            previewIntervalHint(review, option.rating),
          );

          return (
            <Pressable
              key={option.rating}
              disabled={disabled}
              className={`items-center justify-center active:scale-95 ${
                disabled ? 'opacity-50' : ''
              }`}
              style={{
                width: buttonWidth,
                borderRadius: 16,
                backgroundColor: option.bg,
                borderWidth: option.recommended ? 2 : 1,
                borderColor: option.border,
                paddingVertical: 10,
                paddingHorizontal: 4,
              }}
              onPress={() => onRate(option.rating)}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${option.label}, next review in ${hint}`}>
              <View className="flex-row items-center" style={{gap: 2}}>
                {option.icon ? (
                  <MaterialIcons name={option.icon} size={12} color={option.text} />
                ) : null}
                <Text
                  style={{
                    fontFamily: option.recommended ? fonts.display : fonts.bodyBold,
                    fontSize: 12,
                    color: option.text,
                  }}>
                  {option.label}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: option.recommended ? fonts.bodyBold : fonts.bodySemiBold,
                  fontSize: 11,
                  color: option.hintColor,
                  marginTop: 2,
                }}>
                {hint}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
