import type {ReactNode} from 'react';
import {Text, View} from 'react-native';
import {SilhouetteCard} from '../ui/SilhouetteCard';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type SettingsSectionCardProps = {
  title?: string;
  children: ReactNode;
};

export function SettingsSectionCard({title, children}: SettingsSectionCardProps) {
  return (
    <View style={{gap: 12}}>
      {title ? (
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 12,
            lineHeight: 16,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: libraryTokens.muted,
            paddingHorizontal: 4,
          }}>
          {title}
        </Text>
      ) : null}

      {/* Library silhouette pads the stack offset so ScrollView does not clip borders/shadows. */}
      <SilhouetteCard borderRadius={libraryTokens.cardRadius} offset={4}>
        <View
          style={{
            borderRadius: libraryTokens.cardRadius,
            borderWidth: 1,
            borderColor: libraryTokens.border,
            backgroundColor: libraryTokens.surface,
            overflow: 'hidden',
          }}>
          {children}
        </View>
      </SilhouetteCard>
    </View>
  );
}

export function SettingsCardDivider() {
  return <View style={{height: 1, backgroundColor: libraryTokens.border}} />;
}

export function SettingsVersionBadge({version}: {version: string}) {
  return (
    <View className="items-center" style={{paddingVertical: 8}}>
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: libraryTokens.border,
          backgroundColor: colors.surfaceContainer,
          paddingHorizontal: 16,
          paddingVertical: 6,
        }}>
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 12,
            lineHeight: 16,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: libraryTokens.muted,
          }}>
          Version {version}
        </Text>
      </View>
    </View>
  );
}
