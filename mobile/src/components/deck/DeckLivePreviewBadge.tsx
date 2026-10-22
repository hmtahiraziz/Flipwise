import {Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {createDeckTokens} from '../../config/createDeckTokens';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type DeckLivePreviewBadgeProps = {
  title: string;
  subject: string;
  accentColor?: string;
};

/** Mini deck preview that updates as the user types. */
export function DeckLivePreviewBadge({
  title,
  subject,
  accentColor = createDeckTokens.previewDot,
}: DeckLivePreviewBadgeProps) {
  const displayTitle = title.trim() || 'Untitled deck';
  const displaySubject = subject.trim() || 'Add a subject';
  const empty = !title.trim() && !subject.trim();

  return (
    <View style={{marginTop: 20, gap: 8}}>
      <Text
        style={{
          fontFamily: fonts.bodyBold,
          fontSize: 11,
          letterSpacing: 0.55,
          textTransform: 'uppercase',
          color: createDeckTokens.helperText,
          paddingHorizontal: 4,
        }}>
        Preview
      </Text>

      <View
        style={{
          borderRadius: 16,
          backgroundColor: libraryTokens.surface,
          overflow: 'hidden',
          opacity: empty ? 0.72 : 1,
        }}>
        <View style={{height: 4, backgroundColor: accentColor}} />
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: `${accentColor}33`,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons
              name="style"
              size={20}
              color={brandColors.charcoal}
            />
          </View>
          <View style={{flex: 1, gap: 2}}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 16,
                color: brandColors.charcoal,
              }}
              numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: createDeckTokens.helperText,
              }}
              numberOfLines={1}>
              {displaySubject}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
