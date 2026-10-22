import type {RefObject} from 'react';
import {ActivityIndicator, Pressable, Text, TextInput, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

export type CognitiveDensity = 'definitions' | 'synthesis' | 'exam';

type DocumentImportPanelProps = {
  deckTitle: string;
  notesText: string;
  onNotesChange: (value: string) => void;
  importing: boolean;
  attachedName?: string | null;
  density: CognitiveDensity;
  onDensityChange: (value: CognitiveDensity) => void;
  estimatedCards: string;
  onPickLocal: () => void;
  onImportUrl: () => void;
  onClear: () => void;
  inputFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  notesRef?: RefObject<TextInput | null>;
};

const DENSITY_OPTIONS: Array<{
  value: CognitiveDensity;
  title: string;
  subtitle: string;
  recommended?: boolean;
}> = [
  {
    value: 'definitions',
    title: 'Key Definitions & Formulas',
    subtitle: 'Bite-sized high-yield terms for rapid review',
  },
  {
    value: 'synthesis',
    title: 'Deep Conceptual Synthesis',
    subtitle: 'Underlying intuitions, proofs, and edge cases',
    recommended: true,
  },
  {
    value: 'exam',
    title: 'Exam Scenario Practice',
    subtitle: 'Problem sets and challenge questions with rubric',
  },
];

export function DocumentImportPanel({
  deckTitle,
  notesText,
  onNotesChange,
  importing,
  attachedName,
  density,
  onDensityChange,
  estimatedCards,
  onPickLocal,
  onImportUrl,
  onClear,
  inputFocused,
  onFocus,
  onBlur,
  notesRef,
}: DocumentImportPanelProps) {
  return (
    <View style={{gap: 16}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: libraryTokens.surfaceContainerLow,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1}}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: libraryTokens.tertiaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons
              name="folder-special"
              size={18}
              color={libraryTokens.tertiary}
            />
          </View>
          <View style={{flex: 1, minWidth: 0}}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: libraryTokens.muted,
              }}>
              Target Workspace
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 16,
                color: libraryTokens.ink,
              }}>
              Deck: {deckTitle || 'Current deck'}
            </Text>
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: libraryTokens.border,
          }}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              color: libraryTokens.muted,
            }}>
            PDF
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: brandColors.surface,
          borderRadius: 20,
          padding: 20,
          alignItems: 'center',
          gap: 12,
          borderWidth: 1,
          borderColor: libraryTokens.borderSubtle,
        }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: libraryTokens.surfaceContainerLow,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MaterialIcons
            name="cloud-upload"
            size={32}
            color={libraryTokens.primary}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: 999,
              backgroundColor: libraryTokens.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name="add" size={14} color={brandColors.charcoal} />
          </View>
        </View>
        <Text
          style={{
            fontFamily: fonts.displaySemiBold,
            fontSize: 18,
            color: libraryTokens.ink,
            textAlign: 'center',
          }}>
          Upload Study Material
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            lineHeight: 20,
            color: libraryTokens.muted,
            textAlign: 'center',
            maxWidth: 280,
          }}>
          Drag & drop lecture notes, textbooks, or tap to browse storage
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: libraryTokens.surfaceContainerLow,
          }}>
          <MaterialIcons name="verified" size={16} color={libraryTokens.primary} />
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              letterSpacing: 0.4,
              color: libraryTokens.muted,
            }}>
            PDF (MAX 10MB) · URL pages supported
          </Text>
        </View>

        <View style={{width: '100%', gap: 10, marginTop: 4}}>
          <Pressable
            onPress={onPickLocal}
            disabled={importing}
            accessibilityRole="button"
            className="active:opacity-90"
            style={{
              height: 48,
              borderRadius: 14,
              backgroundColor: libraryTokens.surfaceContainerLow,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: importing ? 0.6 : 1,
            }}>
            {importing ? (
              <ActivityIndicator size="small" color={libraryTokens.ink} />
            ) : (
              <MaterialIcons name="folder-open" size={20} color={libraryTokens.ink} />
            )}
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 14,
                color: libraryTokens.ink,
              }}>
              Choose Local File
            </Text>
          </Pressable>
          <Pressable
            onPress={onImportUrl}
            disabled={importing}
            accessibilityRole="button"
            className="active:opacity-90"
            style={{
              height: 48,
              borderRadius: 14,
              backgroundColor: libraryTokens.surfaceContainerLow,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
            <MaterialIcons name="cloud" size={20} color={libraryTokens.primary} />
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 14,
                color: libraryTokens.ink,
              }}>
              Import from URL
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderRadius: 14,
            backgroundColor: 'rgba(243, 244, 240, 0.7)',
            marginTop: 4,
          }}>
          <View>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                color: libraryTokens.ink,
              }}>
              Auto-OCR & Math LaTeX
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 12,
                color: libraryTokens.muted,
              }}>
              Formulae & diagrams preserved via OCR
            </Text>
          </View>
          <MaterialIcons
            name="auto-awesome"
            size={18}
            color={libraryTokens.primary}
          />
        </View>
      </View>

      {(attachedName || notesText.trim()) && (
        <View style={{gap: 10}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  color: libraryTokens.ink,
                }}>
                Imported Sources
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 999,
                  backgroundColor: libraryTokens.secondaryContainer,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 11,
                    color: libraryTokens.onSecondaryContainer,
                  }}>
                  1 Attached
                </Text>
              </View>
            </View>
            <Pressable onPress={onClear} hitSlop={8}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  color: libraryTokens.primary,
                }}>
                Clear All
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: brandColors.surface,
              borderRadius: 20,
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: libraryTokens.borderSubtle,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
              }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: libraryTokens.errorContainer,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MaterialIcons
                  name="picture-as-pdf"
                  size={24}
                  color={libraryTokens.error}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 16,
                    color: libraryTokens.ink,
                  }}>
                  {attachedName || 'Imported document'}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 4,
                  }}>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: libraryTokens.muted,
                    }}>
                    {notesText.length.toLocaleString()} chars extracted
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      backgroundColor: 'rgba(207, 238, 139, 0.5)',
                    }}>
                    <MaterialIcons
                      name="check-circle"
                      size={13}
                      color={libraryTokens.primary}
                    />
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 11,
                        color: libraryTokens.primary,
                      }}>
                      Ready
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      <View
        style={{
          backgroundColor: brandColors.surface,
          borderRadius: 20,
          padding: 20,
          gap: 16,
          borderWidth: 1,
          borderColor: libraryTokens.borderSubtle,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: libraryTokens.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name="psychology"
                size={18}
                color={brandColors.charcoal}
              />
            </View>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 16,
                color: libraryTokens.ink,
              }}>
              Extraction Settings
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: libraryTokens.primary,
            }}>
            Smart AI
          </Text>
        </View>

        <View style={{gap: 8}}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: libraryTokens.muted,
            }}>
            Cognitive Density
          </Text>
          {DENSITY_OPTIONS.map(option => {
            const selected = density === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onDensityChange(option.value)}
                accessibilityRole="button"
                accessibilityState={{selected}}
                className="active:opacity-95"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: 14,
                  backgroundColor: selected
                    ? 'rgba(207, 238, 139, 0.4)'
                    : libraryTokens.surfaceContainerLow,
                  gap: 12,
                }}>
                <View style={{flex: 1, gap: 2}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}>
                    <Text
                      style={{
                        fontFamily: selected
                          ? fonts.bodyBold
                          : fonts.bodySemiBold,
                        fontSize: 14,
                        color: libraryTokens.ink,
                      }}>
                      {option.title}
                    </Text>
                    {option.recommended ? (
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 999,
                          backgroundColor: libraryTokens.primaryContainer,
                        }}>
                        <Text
                          style={{
                            fontFamily: fonts.bodyBold,
                            fontSize: 11,
                            color: brandColors.charcoal,
                          }}>
                          Recommended
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 12,
                      color: libraryTokens.muted,
                    }}>
                    {option.subtitle}
                  </Text>
                </View>
                <MaterialIcons
                  name={selected ? 'check-circle' : 'radio-button-unchecked'}
                  size={20}
                  color={
                    selected ? libraryTokens.primary : libraryTokens.muted
                  }
                />
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderRadius: 14,
            backgroundColor: libraryTokens.surfaceContainerLow,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1}}>
            <MaterialIcons name="bolt" size={20} color={libraryTokens.primary} />
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  color: libraryTokens.ink,
                }}>
                Cardweave AI Engine
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: libraryTokens.muted,
                }}>
                Fast & High Recall · {estimatedCards}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{gap: 6}}>
        <Text
          style={{
            fontFamily: fonts.bodyBold,
            fontSize: 12,
            color: libraryTokens.ink,
          }}>
          Extracted Notes
        </Text>
        <View
          style={{
            borderRadius: 16,
            borderWidth: inputFocused ? 1.5 : 1,
            borderColor: inputFocused
              ? libraryTokens.primaryContainer
              : libraryTokens.border,
            backgroundColor: brandColors.surface,
            padding: 14,
            minHeight: 140,
          }}>
          <TextInput
            ref={notesRef}
            value={notesText}
            onChangeText={onNotesChange}
            onFocus={onFocus}
            onBlur={onBlur}
            multiline
            placeholder="Paste lecture notes or import a PDF to extract text…"
            placeholderTextColor={`${libraryTokens.muted}99`}
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              lineHeight: 20,
              color: libraryTokens.ink,
              minHeight: 120,
              textAlignVertical: 'top',
              padding: 0,
            }}
          />
        </View>
      </View>
    </View>
  );
}
