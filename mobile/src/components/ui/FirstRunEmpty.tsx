import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {brandColors, elevation, fonts} from '../../config/theme';

type EmptyAction = {
  label: string;
  onPress: () => void;
  icon?: string;
};

type FirstRunEmptyProps = {
  icon?: string;
  title: string;
  body: string;
  primaryAction?: EmptyAction;
};

/**
 * Compact first-run empty state — soft Cardweave wash + optional primary CTA.
 */
export function FirstRunEmpty({
  icon = 'auto-awesome',
  title,
  body,
  primaryAction,
}: FirstRunEmptyProps) {
  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={styles.orb} />

      <View style={styles.headerRow}>
        <View style={styles.iconTile}>
          <MaterialIcons
            name={icon as 'auto-awesome'}
            size={22}
            color={brandColors.charcoal}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </View>

      {primaryAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={primaryAction.label}
          onPress={primaryAction.onPress}
          style={({pressed}) => [
            styles.cta,
            pressed ? styles.ctaPressed : null,
          ]}>
          <View style={styles.ctaInner}>
            <MaterialIcons
              name={(primaryAction.icon ?? 'add') as 'add'}
              size={20}
              color={brandColors.charcoal}
            />
            <Text style={styles.ctaLabel}>{primaryAction.label}</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brandColors.border,
    backgroundColor: '#FBFDEE',
    padding: 18,
    gap: 14,
    overflow: 'hidden',
    ...elevation.tier1,
  },
  orb: {
    position: 'absolute',
    right: -28,
    top: -28,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(199, 245, 43, 0.22)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: brandColors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(25, 28, 26, 0.06)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: brandColors.charcoal,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: brandColors.muted,
  },
  cta: {
    height: 48,
    borderRadius: 999,
    backgroundColor: brandColors.lime,
    borderWidth: 1,
    borderColor: 'rgba(25, 28, 26, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{scale: 0.98}],
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 18,
    color: brandColors.charcoal,
    marginLeft: 8,
  },
});
