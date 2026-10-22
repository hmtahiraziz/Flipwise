import type {RefObject} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

export type ScanDensity = 'concise' | 'balanced' | 'deep';

type ArchetypeKey = 'definition' | 'scenario' | 'cloze';

type CameraScanPanelProps = {
  deckTitle: string;
  scanImageUri: string | null;
  scanText: string;
  onScanTextChange: (value: string) => void;
  importing: boolean;
  ocrRunning?: boolean;
  ocrFailed?: boolean;
  density: ScanDensity;
  onDensityChange: (value: ScanDensity) => void;
  archetypes: {definition: boolean; scenario: boolean; cloze: boolean};
  onToggleArchetype: (key: ArchetypeKey) => void;
  estimatedYield: string;
  /** Opens capture sheet (camera / gallery). */
  onPickImage: () => void;
  onRunOcr: () => void;
  onClear: () => void;
  inputFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  scanRef?: RefObject<TextInput | null>;
};

const DENSITY: Array<{value: ScanDensity; label: string; hint: string}> = [
  {value: 'concise', label: 'Concise', hint: '6 cards'},
  {value: 'balanced', label: 'Balanced', hint: '14 cards'},
  {value: 'deep', label: 'Deep', hint: '22 cards'},
];

const ARCHETYPES: Array<{
  key: ArchetypeKey;
  title: string;
  subtitle: string;
  icon: string;
}> = [
  {
    key: 'definition',
    title: 'Definition cards',
    subtitle: 'Terms, formulas, and direct recall',
    icon: 'style',
  },
  {
    key: 'scenario',
    title: 'Scenario cards',
    subtitle: 'Applied cases and edge questions',
    icon: 'psychology',
  },
  {
    key: 'cloze',
    title: 'Cloze cards',
    subtitle: 'Fill-in-the-blank practice',
    icon: 'short-text',
  },
];

export function CameraScanPanel({
  deckTitle,
  scanImageUri,
  scanText,
  onScanTextChange,
  importing,
  ocrRunning = false,
  ocrFailed = false,
  density,
  onDensityChange,
  archetypes,
  onToggleArchetype,
  estimatedYield,
  onPickImage,
  onRunOcr,
  onClear,
  inputFocused,
  onFocus,
  onBlur,
  scanRef,
}: CameraScanPanelProps) {
  const hasScan = Boolean(scanImageUri);
  const charCount = scanText.trim().length;

  const toggleArchetype = (key: ArchetypeKey) => {
    const currentlyOn = archetypes[key];
    const enabledCount = Object.values(archetypes).filter(Boolean).length;
    // Keep at least one archetype selected.
    if (currentlyOn && enabledCount <= 1) {
      return;
    }
    onToggleArchetype(key);
  };

  return (
    <View style={styles.root}>
      {/* Target deck */}
      <View style={styles.deckRow}>
        <Text style={styles.deckLabel}>Target deck</Text>
        <View style={styles.deckChip}>
          <MaterialIcons name="folder" size={14} color={brandColors.olive} />
          <Text style={styles.deckChipText} numberOfLines={1}>
            {deckTitle || 'Current deck'}
          </Text>
        </View>
      </View>

      {/* Single capture surface */}
      <Pressable
        onPress={onPickImage}
        disabled={importing}
        accessibilityRole="button"
        accessibilityLabel="Capture or choose a page to scan"
        style={[styles.captureCard, importing ? styles.dimmed : null]}>
        {scanImageUri ? (
          <>
            <Image
              source={{uri: scanImageUri}}
              style={styles.captureImage}
              resizeMode="cover"
            />
            <View style={styles.captureOverlay}>
              <View style={styles.captureBadge}>
                <MaterialIcons name="check" size={14} color={brandColors.charcoal} />
                <Text style={styles.captureBadgeText}>Page ready</Text>
              </View>
              <Text style={styles.captureHint}>Tap to replace</Text>
            </View>
          </>
        ) : (
          <View style={styles.captureEmpty}>
            <View style={styles.captureIcon}>
              <MaterialIcons
                name="document-scanner"
                size={28}
                color={brandColors.charcoal}
              />
            </View>
            <Text style={styles.captureTitle}>Capture page</Text>
            <Text style={styles.captureSub}>
              Take a photo or choose from gallery
            </Text>
          </View>
        )}
      </Pressable>

      {ocrFailed && hasScan ? (
        <View style={styles.failCard}>
          <Text style={styles.failTitle}>Couldn’t read this page</Text>
          <Text style={styles.failBody}>
            Retake with better light, retry OCR, or paste text below.
          </Text>
          <View style={styles.failActions}>
            <Pressable
              onPress={onRunOcr}
              disabled={importing}
              style={[styles.failPrimary, importing ? styles.dimmed : null]}>
              <Text style={styles.failPrimaryText}>Retry OCR</Text>
            </Pressable>
            <Pressable
              onPress={onPickImage}
              disabled={importing}
              style={[styles.failSecondary, importing ? styles.dimmed : null]}>
              <Text style={styles.failSecondaryText}>Retake</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Preview + OCR */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scan preview</Text>
          <View style={styles.sectionHeaderRight}>
            {charCount > 0 ? (
              <Text style={styles.yieldText}>{estimatedYield}</Text>
            ) : null}
            {scanText.trim() || hasScan ? (
              <Pressable onPress={onClear} hitSlop={8}>
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={onRunOcr}
          disabled={importing || !scanImageUri}
          style={[
            styles.ocrBtn,
            importing || !scanImageUri ? styles.dimmed : null,
          ]}>
          <MaterialIcons
            name={ocrRunning ? 'hourglass-empty' : 'auto-awesome'}
            size={16}
            color={brandColors.charcoal}
          />
          <Text style={styles.ocrBtnText}>
            {ocrRunning ? 'Running OCR…' : 'Run OCR'}
          </Text>
        </Pressable>

        <View
          style={[
            styles.textBox,
            inputFocused ? styles.textBoxFocused : null,
          ]}>
          <TextInput
            ref={scanRef}
            value={scanText}
            onChangeText={onScanTextChange}
            onFocus={onFocus}
            onBlur={onBlur}
            multiline
            placeholder="Paste or type text from your notes…"
            placeholderTextColor={`${libraryTokens.muted}99`}
            style={styles.textInput}
          />
        </View>
      </View>

      {/* Generation options */}
      <View style={styles.engineCard}>
        <View style={styles.engineHeader}>
          <View style={styles.engineTitleRow}>
            <View style={styles.engineIcon}>
              <MaterialIcons name="tune" size={18} color={brandColors.charcoal} />
            </View>
            <View style={styles.engineTitles}>
              <Text style={styles.engineTitle} numberOfLines={1}>
                Generation options
              </Text>
              <Text style={styles.engineSub} numberOfLines={1}>
                Density & card styles
              </Text>
            </View>
          </View>
          <View style={styles.adaptivePill}>
            <Text style={styles.adaptiveText}>Adaptive</Text>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Card density</Text>
        <View style={styles.densityRow}>
          {DENSITY.map(option => {
            const selected = density === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onDensityChange(option.value)}
                accessibilityRole="button"
                accessibilityState={{selected}}
                style={[
                  styles.densityChip,
                  selected ? styles.densityChipOn : null,
                ]}>
                <Text
                  style={[
                    styles.densityLabel,
                    selected ? styles.densityLabelOn : null,
                  ]}
                  numberOfLines={1}>
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.densityHint,
                    selected ? styles.densityHintOn : null,
                  ]}
                  numberOfLines={1}>
                  {option.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
          Learning archetypes
        </Text>
        <View style={styles.archetypeList}>
          {ARCHETYPES.map(item => {
            const checked = archetypes[item.key];
            return (
              <Pressable
                key={item.key}
                onPress={() => toggleArchetype(item.key)}
                accessibilityRole="checkbox"
                accessibilityState={{checked}}
                style={styles.archetypeRow}>
                <View style={styles.archetypeIcon}>
                  <MaterialIcons
                    name={item.icon as 'style'}
                    size={18}
                    color={brandColors.olive}
                  />
                </View>
                <View style={styles.archetypeCopy}>
                  <Text style={styles.archetypeTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.archetypeSub} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkBox,
                    checked ? styles.checkBoxOn : null,
                  ]}>
                  {checked ? (
                    <MaterialIcons
                      name="check"
                      size={14}
                      color={brandColors.charcoal}
                    />
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

const styles = StyleSheet.create({
  root: {
    marginBottom: 4,
  },
  deckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deckLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: libraryTokens.muted,
    marginRight: 10,
  },
  deckChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.paleLime,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: brandColors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deckChipText: {
    flex: 1,
    marginLeft: 6,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: brandColors.charcoal,
  },
  captureCard: {
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: brandColors.border,
    backgroundColor: brandColors.surface,
    marginBottom: 14,
  },
  captureImage: {
    width: '100%',
    height: '100%',
  },
  captureOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(25, 28, 26, 0.28)',
    justifyContent: 'space-between',
    padding: 12,
  },
  captureBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.lime,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  captureBadgeText: {
    marginLeft: 4,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: brandColors.charcoal,
  },
  captureHint: {
    alignSelf: 'flex-end',
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: '#F7F8F4',
  },
  captureEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFDEE',
    paddingHorizontal: 20,
  },
  captureIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: brandColors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  captureTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 16,
    color: brandColors.charcoal,
    marginBottom: 4,
  },
  captureSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brandColors.muted,
    textAlign: 'center',
  },
  failCard: {
    backgroundColor: brandColors.dangerBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.22)',
    padding: 12,
    marginBottom: 14,
  },
  failTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brandColors.charcoal,
    marginBottom: 4,
  },
  failBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: brandColors.muted,
    marginBottom: 10,
  },
  failActions: {
    flexDirection: 'row',
  },
  failPrimary: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: brandColors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  failPrimaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brandColors.charcoal,
  },
  failSecondary: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: brandColors.border,
    backgroundColor: brandColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failSecondaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brandColors.charcoal,
  },
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: brandColors.charcoal,
  },
  yieldText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brandColors.olive,
    marginRight: 12,
  },
  clearText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: brandColors.olive,
  },
  ocrBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.lime,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 10,
  },
  ocrBtnText: {
    marginLeft: 6,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brandColors.charcoal,
  },
  textBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brandColors.border,
    backgroundColor: brandColors.surface,
    padding: 14,
    minHeight: 120,
  },
  textBoxFocused: {
    borderColor: brandColors.lime,
    borderWidth: 1.5,
  },
  textInput: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brandColors.charcoal,
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 0,
  },
  engineCard: {
    backgroundColor: brandColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: brandColors.border,
    padding: 14,
  },
  engineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  engineTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    marginRight: 8,
  },
  engineIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: brandColors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  engineTitles: {
    flex: 1,
    minWidth: 0,
  },
  engineTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: brandColors.charcoal,
  },
  engineSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brandColors.muted,
    marginTop: 1,
  },
  adaptivePill: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: brandColors.paleLime,
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  adaptiveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: brandColors.olive,
  },
  fieldLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: brandColors.charcoal,
    marginBottom: 8,
  },
  fieldLabelSpaced: {
    marginTop: 14,
  },
  densityRow: {
    flexDirection: 'row',
    backgroundColor: libraryTokens.surfaceContainerLow,
    borderRadius: 14,
    padding: 4,
  },
  densityChip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  densityChipOn: {
    backgroundColor: brandColors.surface,
  },
  densityLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: brandColors.muted,
  },
  densityLabelOn: {
    fontFamily: fonts.bodyBold,
    color: brandColors.charcoal,
  },
  densityHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: brandColors.muted,
    marginTop: 2,
  },
  densityHintOn: {
    color: brandColors.olive,
  },
  archetypeList: {},
  archetypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: libraryTokens.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  archetypeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: brandColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  archetypeCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  archetypeTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: brandColors.charcoal,
  },
  archetypeSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: brandColors.muted,
    marginTop: 2,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: brandColors.border,
    backgroundColor: brandColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: {
    borderColor: brandColors.lime,
    backgroundColor: brandColors.lime,
  },
  dimmed: {
    opacity: 0.55,
  },
});
