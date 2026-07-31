import type {ReactNode} from 'react';
import {Text, View} from 'react-native';
import {SilhouetteCard} from '../ui/SilhouetteCard';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';

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

      <SilhouetteCard variant="review">
        <View
          style={{
            borderRadius: reviewTokens.cardRadius,
            borderWidth: 1,
            borderColor: reviewTokens.border,
            backgroundColor: reviewTokens.card,
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

export function SettingsActiveBadge() {
  return (
    <View
      className="flex-row items-center rounded-full"
      style={{
        gap: 6,
        backgroundColor: libraryTokens.primaryContainer,
        paddingHorizontal: 12,
        paddingVertical: 4,
      }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: libraryTokens.primary,
        }}
      />
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 13,
          lineHeight: 18,
          color: libraryTokens.onPrimaryContainer,
        }}>
        Active
      </Text>
    </View>
  );
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
