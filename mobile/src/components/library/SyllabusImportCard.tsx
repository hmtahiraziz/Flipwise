import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Pressable, Text, View} from 'react-native';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type SyllabusImportCardProps = {
  onTryAiCreator: () => void;
  onPasteText: () => void;
  onImportDoc?: () => void;
  onScanNotes?: () => void;
};

export function SyllabusImportCard({
  onTryAiCreator,
  onPasteText,
  onImportDoc,
  onScanNotes,
}: SyllabusImportCardProps) {
  return (
    <View
      className="overflow-hidden"
      style={{
        borderRadius: 16,
        backgroundColor: '#F4FDE3',
        borderWidth: 1,
        borderColor: '#DCF2A2',
        padding: 16,
        gap: 12,
      }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -24,
          bottom: -24,
          width: 112,
          height: 112,
          borderRadius: 56,
          backgroundColor: 'rgba(255,255,255,0.4)',
        }}
      />

      <View className="flex-row items-center justify-between" style={{gap: 12}}>
        <View className="flex-row items-start flex-1" style={{gap: 12}}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              backgroundColor: brandColors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}>
            <MaterialIcons name="auto-awesome" size={16} color={brandColors.olive} />
          </View>
          <View style={{flex: 1, paddingRight: 4}}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 14,
                lineHeight: 18,
                color: libraryTokens.ink,
              }}>
              Generate cards in seconds
            </Text>
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 11,
                lineHeight: 14,
                color: brandColors.olive,
                marginTop: 2,
              }}>
              Import a PDF, scan notes, or prompt Flipwise AI
            </Text>
            <Pressable
              onPress={onPasteText}
              hitSlop={6}
              accessibilityRole="button"
              style={{marginTop: 6}}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 11,
                  color: '#70757D',
                  textDecorationLine: 'underline',
                }}>
                or paste text instead
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Try AI"
          onPress={onTryAiCreator}
          className="active:opacity-90 flex-row items-center"
          style={{
            backgroundColor: brandColors.lime,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            gap: 4,
            borderWidth: 1,
            borderColor: '#BEF264',
          }}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 12,
              color: brandColors.charcoal,
            }}>
            Try AI
          </Text>
          <MaterialIcons name="arrow-forward" size={14} color={brandColors.charcoal} />
        </Pressable>
      </View>

      {(onImportDoc || onScanNotes) && (
        <View style={{flexDirection: 'row', gap: 8}}>
          {onImportDoc ? (
            <Pressable
              onPress={onImportDoc}
              accessibilityRole="button"
              className="active:opacity-90"
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: brandColors.surface,
                borderWidth: 1,
                borderColor: '#DCF2A2',
              }}>
              <MaterialIcons name="description" size={16} color={brandColors.olive} />
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  color: libraryTokens.ink,
                }}>
                Import Doc
              </Text>
            </Pressable>
          ) : null}
          {onScanNotes ? (
            <Pressable
              onPress={onScanNotes}
              accessibilityRole="button"
              className="active:opacity-90"
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: brandColors.surface,
                borderWidth: 1,
                borderColor: '#DCF2A2',
              }}>
              <MaterialIcons name="photo-camera" size={16} color={brandColors.olive} />
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  color: libraryTokens.ink,
                }}>
                Scan Notes
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}
