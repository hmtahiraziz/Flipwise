import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';
import type {ExplainCardResponse} from '../../types/api';

type ExplainAiSheetProps = {
  visible: boolean;
  loading: boolean;
  error?: string | null;
  result?: ExplainCardResponse | null;
  question?: string;
  onClose: () => void;
  onRetry?: () => void;
};

export function ExplainAiSheet({
  visible,
  loading,
  error,
  result,
  question,
  onClose,
  onRetry,
}: ExplainAiSheetProps) {
  const insets = useSafeAreaInsets();
  const {height} = useWindowDimensions();
  const maxSheetHeight = Math.min(height * 0.78, 640);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close AI explanation"
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(26, 26, 26, 0.45)',
          }}
        />

        <View
          style={{
            maxHeight: maxSheetHeight,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: libraryTokens.background,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 20),
            shadowColor: brandColors.charcoal,
            shadowOffset: {width: 0, height: -4},
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 16,
          }}>
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 999,
              backgroundColor: libraryTokens.border,
              marginBottom: 16,
            }}
          />

          <View
            className="flex-row items-center justify-between"
            style={{paddingHorizontal: 20, marginBottom: 12}}>
            <View className="flex-row items-center" style={{gap: 8, flex: 1}}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: brandColors.paleLime,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MaterialIcons
                  name="auto-awesome"
                  size={18}
                  color={brandColors.olive}
                />
              </View>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 18,
                    color: brandColors.charcoal,
                  }}>
                  Explain with AI
                </Text>
                {question ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: reviewTokens.muted,
                      marginTop: 2,
                    }}>
                    {question}
                  </Text>
                ) : null}
              </View>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              className="active:opacity-70"
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: libraryTokens.surfaceContainerLow,
              }}>
              <MaterialIcons name="close" size={18} color={libraryTokens.ink} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 8,
              gap: 16,
            }}>
            {loading ? (
              <View
                style={{
                  paddingVertical: 40,
                  alignItems: 'center',
                  gap: 12,
                }}>
                <ActivityIndicator color={brandColors.olive} size="large" />
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 14,
                    color: reviewTokens.muted,
                  }}>
                  Crafting a clear explanation…
                </Text>
              </View>
            ) : null}

            {!loading && error ? (
              <View
                style={{
                  backgroundColor: '#FDECEC',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: '#F5C2C2',
                  padding: 16,
                  gap: 12,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyMedium,
                    fontSize: 14,
                    lineHeight: 20,
                    color: brandColors.charcoal,
                  }}>
                  {error}
                </Text>
                {onRetry ? (
                  <Pressable
                    onPress={onRetry}
                    accessibilityRole="button"
                    className="active:opacity-80 self-start"
                    style={{
                      backgroundColor: brandColors.lime,
                      borderRadius: 999,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 13,
                        color: brandColors.charcoal,
                      }}>
                      Try again
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {!loading && !error && result ? (
              <>
                <View
                  style={{
                    backgroundColor: reviewTokens.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: reviewTokens.border,
                    padding: 16,
                  }}>
                  <Text
                    style={{
                      fontFamily: fonts.bodyBold,
                      fontSize: 11,
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                      color: reviewTokens.muted,
                      marginBottom: 8,
                    }}>
                    Explanation
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.bodyMedium,
                      fontSize: 15,
                      lineHeight: 22,
                      color: brandColors.charcoal,
                    }}>
                    {result.explanation}
                  </Text>
                </View>

                {result.keyPoints && result.keyPoints.length > 0 ? (
                  <View
                    style={{
                      backgroundColor: reviewTokens.takeawayBg,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: reviewTokens.takeawayBorder,
                      padding: 16,
                      gap: 10,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        color: reviewTokens.takeawayText,
                      }}>
                      Key points
                    </Text>
                    {result.keyPoints.map((point, index) => (
                      <View
                        key={`${index}-${point.slice(0, 12)}`}
                        className="flex-row items-start"
                        style={{gap: 8}}>
                        <Text
                          style={{
                            fontFamily: fonts.bodyBold,
                            fontSize: 14,
                            color: brandColors.olive,
                            marginTop: 1,
                          }}>
                          •
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontFamily: fonts.bodyMedium,
                            fontSize: 14,
                            lineHeight: 20,
                            color: reviewTokens.takeawayText,
                          }}>
                          {point}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {result.analogy ? (
                  <View
                    style={{
                      backgroundColor: brandColors.paleLime,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: brandColors.border,
                      padding: 16,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        color: brandColors.olive,
                        marginBottom: 8,
                      }}>
                      Analogy
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.bodyMedium,
                        fontSize: 14,
                        lineHeight: 20,
                        color: brandColors.charcoal,
                      }}>
                      {result.analogy}
                    </Text>
                  </View>
                ) : null}

                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 12,
                    lineHeight: 17,
                    color: reviewTokens.muted,
                    marginTop: 4,
                  }}>
                  AI coaching can be imperfect — same limits as card generation.
                  Double-check against your notes.
                </Text>
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
