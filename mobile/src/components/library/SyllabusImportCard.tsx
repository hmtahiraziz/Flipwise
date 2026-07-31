import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Pressable, Text, View} from 'react-native';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type SyllabusImportCardProps = {
  onTryAiCreator: () => void;
  onPasteText: () => void;
};

export function SyllabusImportCard({
  onTryAiCreator,
  onPasteText,
}: SyllabusImportCardProps) {
  return (
    <View
      className="overflow-hidden"
      style={{
        borderRadius: libraryTokens.cardRadius,
        backgroundColor: libraryTokens.surface,
        borderWidth: 1,
        borderColor: libraryTokens.border,
      }}>
      <View
        className="absolute rounded-full"
        style={{
          top: -56,
          left: -56,
          width: 200,
          height: 200,
          backgroundColor: libraryTokens.primaryContainer,
          opacity: 0.2,
        }}
      />

      <View
        className="items-center"
        style={{padding: 24, gap: 16}}>
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{
            backgroundColor: libraryTokens.surface,
            borderWidth: 1,
            borderColor: libraryTokens.border,
          }}>
          <MaterialIcons
            name="auto-awesome"
            size={24}
            color={libraryTokens.primaryContainer}
          />
        </View>

        <View className="items-center px-2">
          <Text
            style={{
              fontFamily: fonts.displayMedium,
              fontSize: 18,
              lineHeight: 24,
              color: libraryTokens.ink,
            }}>
            Syllabus Import
          </Text>
          <Text
            className="mt-1 text-center"
            style={{
              fontFamily: fonts.bodyMedium,
              fontSize: 13,
              lineHeight: 18,
              color: libraryTokens.muted,
            }}>
            Choose a deck first, then generate cards from a topic or your notes.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try AI Creator"
          className="w-full rounded-full flex-row items-center justify-center active:scale-95"
          style={{
            backgroundColor: libraryTokens.primaryContainer,
            paddingVertical: 12,
            paddingHorizontal: 24,
            gap: 8,
            minHeight: libraryTokens.minTapTarget,
          }}
          onPress={onTryAiCreator}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              lineHeight: 24,
              color: libraryTokens.onPrimaryContainer,
            }}>
            Try AI Creator
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={18}
            color={libraryTokens.onPrimaryContainer}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Paste text instead"
          onPress={onPasteText}
          hitSlop={8}
          className="active:opacity-60"
          style={{minHeight: 44, justifyContent: 'center'}}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              lineHeight: 16,
              letterSpacing: 0.6,
              color: libraryTokens.muted,
            }}>
            or paste text instead
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
