import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {previewIntervalHint} from '../../lib/sm2';
import {libraryTokens} from '../../config/libraryTokens';
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
  icon: string;
  bg: string;
  text: string;
  iconColor: string;
};

type RatingBarProps = {
  review: ReviewState;
  onRate: (rating: EaseRating) => void;
  disabled?: boolean;
  contentWidth: number;
};

function formatRatingHint(rating: EaseRating, hint: string): string {
  if (rating === 'again') return '1 min';
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
    text: reviewTokens.againText,
    iconColor: reviewTokens.againText,
  },
  {
    rating: 'hard',
    label: 'Hard',
    icon: 'sentiment-neutral',
    bg: reviewTokens.hardBg,
    text: reviewTokens.hardText,
    iconColor: reviewTokens.hardText,
  },
  {
    rating: 'good',
    label: 'Good',
    icon: 'sentiment-satisfied',
    bg: reviewTokens.goodBg,
    text: reviewTokens.goodText,
    iconColor: reviewTokens.goodText,
  },
  {
    rating: 'easy',
    label: 'Easy',
    icon: 'sentiment-very-satisfied',
    bg: reviewTokens.easyBg,
    text: reviewTokens.easyText,
    iconColor: reviewTokens.easyText,
  },
];

const BUTTON_GAP = 8;

export function RatingBar({review, onRate, disabled, contentWidth}: RatingBarProps) {
  const buttonWidth = (contentWidth - BUTTON_GAP * 3) / 4;

  return (
    <View>
      <Text
        className="text-center font-display-md text-heading mb-6"
        style={{color: libraryTokens.ink}}>
        How easy was this card?
      </Text>

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
              className={`items-center justify-center py-3 px-1 rounded-xl active:scale-95 ${
                disabled ? 'opacity-50' : ''
              }`}
              style={{width: buttonWidth, backgroundColor: option.bg}}
              onPress={() => onRate(option.rating)}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${option.label}, next review in ${hint}`}>
              <MaterialIcons name={option.icon} size={20} color={option.iconColor} />
              <Text
                className="font-body-semibold text-sm mt-1"
                style={{color: option.text}}>
                {option.label}
              </Text>
              <Text className="text-[10px] mt-0.5 opacity-70" style={{color: option.text}}>
                {hint}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
