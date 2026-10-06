import type {RefObject} from 'react';
import {Image, Pressable, Text, TextInput, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

export type ScanDensity = 'concise' | 'balanced' | 'deep';

type CameraScanPanelProps = {
  deckTitle: string;
  scanImageUri: string | null;
  scanText: string;
  onScanTextChange: (value: string) => void;
  importing: boolean;
  ocrRunning?: boolean;
  density: ScanDensity;
  onDensityChange: (value: ScanDensity) => void;
  archetypes: {definition: boolean; scenario: boolean; cloze: boolean};
  onToggleArchetype: (key: keyof CameraScanPanelProps['archetypes']) => void;
  estimatedYield: string;
  onPickImage: () => void;
  onTakePhoto?: () => void;
  onPickGallery?: () => void;
  onRunOcr: () => void;
  onClear: () => void;
  inputFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  scanRef?: RefObject<TextInput | null>;
};

const DENSITY: Array<{value: ScanDensity; label: string; count: string}> = [
  {value: 'concise', label: 'Concise', count: '6'},
  {value: 'balanced', label: 'Balanced', count: '14'},
  {value: 'deep', label: 'Deep Dive', count: '22'},
];

export function CameraScanPanel({
  deckTitle,
  scanImageUri,
  scanText,
  onScanTextChange,
  importing,
  ocrRunning = false,
  density,
  onDensityChange,
  archetypes,
  onToggleArchetype,
  estimatedYield,
  onPickImage,
  onTakePhoto,
  onPickGallery,
  onRunOcr,
  onClear,
  inputFocused,
  onFocus,
  onBlur,
  scanRef,
}: CameraScanPanelProps) {
  const hasScan = Boolean(scanImageUri);
  const charCount = scanText.trim().length;
  const clarity = charCount > 200 ? 98 : charCount > 50 ? 86 : charCount > 0 ? 72 : 0;

  return (
    <View style={{gap: 16}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1}}>
          <Text
            style={{
              fontFamily: fonts.bodyBold,
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: libraryTokens.muted,
            }}>
            Target Deck
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: libraryTokens.surfaceContainerLow,
              maxWidth: 160,
            }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                color: libraryTokens.ink,
              }}>
              {deckTitle || 'Current deck'}
            </Text>
            <MaterialIcons
              name="expand-more"
              size={16}
              color={libraryTokens.muted}
            />
          </View>
        </View>
        <Pressable
          onPress={onTakePhoto ?? onPickImage}
          disabled={importing}
          className="active:opacity-90"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: libraryTokens.secondaryContainer,
            opacity: importing ? 0.6 : 1,
          }}>
          <MaterialIcons
            name="photo-camera"
            size={16}
            color={libraryTokens.onSecondaryContainer}
          />
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: libraryTokens.onSecondaryContainer,
            }}>
            {ocrRunning ? 'Scanning…' : 'Add Page'}
          </Text>
        </Pressable>
      </View>

      {/* Camera / thumbnail strip */}
      <View style={{flexDirection: 'row', gap: 10}}>
        <Pressable
          onPress={onPickImage}
          className="active:opacity-90"
          style={{
            width: 96,
            height: 112,
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: brandColors.surface,
            borderWidth: 1,
            borderColor: libraryTokens.border,
          }}>
          {scanImageUri ? (
            <>
              <Image
                source={{uri: scanImageUri}}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
              />
              <View
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  backgroundColor: libraryTokens.primaryContainer,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MaterialIcons name="check" size={14} color={brandColors.charcoal} />
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 6,
                  left: 6,
                  right: 6,
                  backgroundColor: 'rgba(46, 49, 47, 0.8)',
                  borderRadius: 4,
                  paddingVertical: 2,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 10,
                    color: '#F0F1ED',
                  }}>
                  P. 1 · Scan
                </Text>
              </View>
            </>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: libraryTokens.surfaceContainerLow,
              }}>
              <MaterialIcons
                name="document-scanner"
                size={28}
                color={libraryTokens.muted}
              />
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 11,
                  color: libraryTokens.muted,
                  textAlign: 'center',
                }}>
                Capture page
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={onPickGallery ?? onPickImage}
          className="active:opacity-90"
          style={{
            width: 96,
            height: 112,
            borderRadius: 14,
            backgroundColor: libraryTokens.surfaceContainerLow,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              backgroundColor: libraryTokens.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name="photo-library" size={18} color={libraryTokens.primary} />
          </View>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: libraryTokens.muted,
              textAlign: 'center',
            }}>
            Gallery
          </Text>
        </Pressable>

        <Pressable
          onPress={onTakePhoto ?? onPickImage}
          className="active:opacity-90"
          style={{
            width: 96,
            height: 112,
            borderRadius: 14,
            backgroundColor: libraryTokens.surfaceContainerLow,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              backgroundColor: libraryTokens.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialIcons name="add" size={20} color={libraryTokens.primary} />
          </View>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: libraryTokens.muted,
            }}>
            Camera
          </Text>
        </Pressable>
      </View>

      {/* OCR quality + yield */}
      {hasScan || charCount > 0 ? (
        <View
          style={{
            backgroundColor: brandColors.surface,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderColor: libraryTokens.borderSubtle,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1}}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                backgroundColor: libraryTokens.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name="verified"
                size={22}
                color={brandColors.charcoal}
              />
            </View>
            <View style={{flex: 1}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                }}>
                <Text
                  style={{
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 16,
                    color: libraryTokens.ink,
                  }}>
                  Text Clarity: {clarity || '—'}%
                </Text>
                {clarity >= 90 ? (
                  <View
                    style={{
                      paddingHorizontal: 6,
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
                      High Quality
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
                {charCount > 0
                  ? `OCR parsed ${charCount} characters`
                  : 'Paste extracted text or run OCR'}
              </Text>
            </View>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: libraryTokens.muted,
              }}>
              AI Yield
            </Text>
            <Text
              style={{
                fontFamily: fonts.displaySemiBold,
                fontSize: 18,
                color: libraryTokens.primary,
              }}>
              {estimatedYield}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Extracted text / scan preview */}
      <View style={{gap: 10}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              color: libraryTokens.ink,
            }}>
            Scan Preview
          </Text>
          {scanText.trim() ? (
            <Pressable onPress={onClear} hitSlop={8}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 12,
                  color: libraryTokens.primary,
                }}>
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={onRunOcr}
          disabled={importing || !scanImageUri}
          className="active:opacity-90"
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: brandColors.paleLime,
            opacity: importing || !scanImageUri ? 0.55 : 1,
          }}>
          <MaterialIcons
            name={ocrRunning ? 'sync' : 'auto-awesome'}
            size={16}
            color={brandColors.olive}
          />
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: brandColors.olive,
            }}>
            {ocrRunning ? 'Running OCR…' : 'Run OCR'}
          </Text>
        </Pressable>

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
            ref={scanRef}
            value={scanText}
            onChangeText={onScanTextChange}
            onFocus={onFocus}
            onBlur={onBlur}
            multiline
            placeholder="Paste or type text extracted from your scan…"
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

      {/* Generation engine */}
      <View
        style={{
          backgroundColor: brandColors.surface,
          borderRadius: 20,
          padding: 16,
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
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: libraryTokens.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons name="tune" size={18} color={brandColors.charcoal} />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  color: libraryTokens.ink,
                }}>
                Flashcard Generation Engine
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: libraryTokens.muted,
                }}>
                Flipwise Neural Chunking
              </Text>
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: libraryTokens.surfaceContainerLow,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                color: libraryTokens.muted,
              }}>
              Adaptive
            </Text>
          </View>
        </View>

        <View style={{gap: 8}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                color: libraryTokens.ink,
              }}>
              Card Density
            </Text>
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 11,
                color: libraryTokens.primary,
              }}>
              {density === 'balanced'
                ? 'Balanced (1 card / concept)'
                : density === 'concise'
                  ? 'Concise'
                  : 'Deep Dive'}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              padding: 4,
              borderRadius: 14,
              backgroundColor: libraryTokens.surfaceContainerLow,
            }}>
            {DENSITY.map(option => {
              const selected = density === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => onDensityChange(option.value)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: selected ? brandColors.surface : 'transparent',
                  }}>
                  <Text
                    style={{
                      fontFamily: selected ? fonts.bodyBold : fonts.bodySemiBold,
                      fontSize: 12,
                      color: selected ? libraryTokens.ink : libraryTokens.muted,
                    }}>
                    {option.label} ({option.count})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{gap: 8}}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 12,
              color: libraryTokens.ink,
            }}>
            Learning Archetypes
          </Text>
          {(
            [
              {
                key: 'definition' as const,
                title: 'Front / Back Definition',
                subtitle: 'Terminology, formulas, and direct recall',
                icon: 'style',
              },
              {
                key: 'scenario' as const,
                title: 'Real-world Applied Scenarios',
                subtitle: 'Practical case tests and analytical edge cases',
                icon: 'psychology-alt',
              },
              {
                key: 'cloze' as const,
                title: 'Cloze Deletion / Fill-in',
                subtitle: 'Active fill-in-the-blank contextual testing',
                icon: 'short-text',
              },
            ] as const
          ).map(item => {
            const checked = archetypes[item.key];
            return (
              <Pressable
                key={item.key}
                onPress={() => onToggleArchetype(item.key)}
                className="active:opacity-95"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 10,
                  borderRadius: 14,
                  backgroundColor: libraryTokens.surfaceContainerLow,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    flex: 1,
                  }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: brandColors.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <MaterialIcons
                      name={item.icon}
                      size={20}
                      color={libraryTokens.primary}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={{
                        fontFamily: fonts.bodySemiBold,
                        fontSize: 16,
                        color: libraryTokens.ink,
                      }}>
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 12,
                        color: libraryTokens.muted,
                      }}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: checked
                      ? libraryTokens.primary
                      : brandColors.surface,
                    borderWidth: checked ? 0 : 1,
                    borderColor: libraryTokens.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {checked ? (
                    <MaterialIcons name="check" size={16} color="#fff" />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
