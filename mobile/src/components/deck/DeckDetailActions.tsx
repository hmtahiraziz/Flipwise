import {Pressable, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../config/theme';
import {deckDetailTokens} from '../../config/deckDetailTokens';

type DeckDetailActionsProps = {
  dueCount: number;
  onStartReview: () => void;
  onViewCards: () => void;
  onGenerate: () => void;
  onAddCard?: () => void;
  onImport?: () => void;
  onScan?: () => void;
  compact?: boolean;
};

export function DeckDetailActions({
  dueCount,
  onStartReview,
  onViewCards,
  onGenerate,
  onAddCard,
  onImport,
  onScan,
  compact,
}: DeckDetailActionsProps) {
  const reviewLabel =
    dueCount > 0 ? `Start review (${dueCount})` : 'Start study session';

  return (
    <View style={{gap: 12}}>
      <Pressable
        onPress={onStartReview}
        accessibilityRole="button"
        accessibilityLabel={reviewLabel}
        className="active:scale-[0.98]"
        style={{
          backgroundColor: deckDetailTokens.brand,
          borderRadius: 999,
          paddingVertical: compact ? 16 : 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}>
        <MaterialIcons name="play-arrow" size={24} color={deckDetailTokens.ink} />
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: compact ? 15 : 16,
            color: deckDetailTokens.ink,
          }}>
          {reviewLabel}
        </Text>
      </Pressable>

      <View style={{flexDirection: 'row', gap: 10}}>
        <Pressable
          onPress={onViewCards}
          accessibilityRole="button"
          accessibilityLabel="View cards"
          className="active:scale-[0.98]"
          style={{
            flex: 1,
            backgroundColor: deckDetailTokens.surfaceContainer,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: deckDetailTokens.border,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}>
          <MaterialIcons name="style" size={18} color={deckDetailTokens.ink} />
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 13,
              color: deckDetailTokens.ink,
            }}>
            Cards
          </Text>
        </Pressable>

        <Pressable
          onPress={onGenerate}
          accessibilityRole="button"
          accessibilityLabel="AI Generate"
          className="active:scale-[0.98]"
          style={{
            flex: 1,
            backgroundColor: deckDetailTokens.surfaceContainer,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: deckDetailTokens.border,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}>
          <MaterialIcons
            name="auto-awesome"
            size={18}
            color={deckDetailTokens.primary}
          />
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 13,
              color: deckDetailTokens.ink,
            }}>
            AI Gen
          </Text>
        </Pressable>

        {onAddCard ? (
          <Pressable
            onPress={onAddCard}
            accessibilityRole="button"
            accessibilityLabel="Add card"
            className="active:scale-[0.98]"
            style={{
              flex: 1,
              backgroundColor: deckDetailTokens.surfaceContainer,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: deckDetailTokens.border,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}>
            <MaterialIcons name="add" size={18} color={deckDetailTokens.ink} />
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 13,
                color: deckDetailTokens.ink,
              }}>
              Add
            </Text>
          </Pressable>
        ) : null}
      </View>

      {(onImport || onScan) && (
        <View style={{gap: 8}}>
          {onImport ? (
            <Pressable
              onPress={onImport}
              accessibilityRole="button"
              accessibilityLabel="Import document"
              className="active:opacity-90"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: deckDetailTokens.tertiaryContainer,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <MaterialIcons
                  name="upload-file"
                  size={20}
                  color={deckDetailTokens.primary}
                />
                <View>
                  <Text
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 14,
                      color: deckDetailTokens.ink,
                    }}>
                    Import document
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: deckDetailTokens.mutedText,
                    }}>
                    PDF extract → AI cards
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={deckDetailTokens.mutedText}
              />
            </Pressable>
          ) : null}
          {onScan ? (
            <Pressable
              onPress={onScan}
              accessibilityRole="button"
              accessibilityLabel="Scan notes"
              className="active:opacity-90"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: deckDetailTokens.surfaceContainer,
                borderWidth: 1,
                borderColor: deckDetailTokens.border,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <MaterialIcons
                  name="photo-camera"
                  size={20}
                  color={deckDetailTokens.primary}
                />
                <View>
                  <Text
                    style={{
                      fontFamily: fonts.bodySemiBold,
                      fontSize: 14,
                      color: deckDetailTokens.ink,
                    }}>
                    Scan notes
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: deckDetailTokens.mutedText,
                    }}>
                    Camera or gallery → OCR
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={deckDetailTokens.mutedText}
              />
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}
