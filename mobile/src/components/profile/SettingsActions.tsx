import {Pressable, Text, View} from 'react-native';
import {GoogleLogo} from '../auth/GoogleLogo';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type SettingsSignOutButtonProps = {
  onPress: () => void;
};

export function SettingsSignOutButton({onPress}: SettingsSignOutButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      className="active:scale-[0.98]"
      style={{
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: libraryTokens.border,
        backgroundColor: libraryTokens.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          fontFamily: fonts.bodySemiBold,
          fontSize: 16,
          lineHeight: 24,
          color: libraryTokens.error,
        }}>
        Sign out
      </Text>
    </Pressable>
  );
}

type SettingsGoogleRowProps = {
  connected: boolean;
  connecting?: boolean;
  onConnect?: () => void;
};

export function SettingsGoogleRow({
  connected,
  connecting,
  onConnect,
}: SettingsGoogleRowProps) {
  const content = (
    <View
      className="flex-row items-center justify-between"
      style={{paddingHorizontal: 20, paddingVertical: 20, gap: 12}}>
      <View className="flex-row items-center flex-1 min-w-0" style={{gap: 12}}>
        <View
          style={{
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <GoogleLogo size={20} />
        </View>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            lineHeight: 24,
            color: libraryTokens.ink,
          }}>
          {connected ? 'Google Connected' : 'Connect Google'}
        </Text>
      </View>
      {connected ? (
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
      ) : (
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 13,
            color: libraryTokens.primary,
          }}>
          {connecting ? 'Connecting…' : 'Link'}
        </Text>
      )}
    </View>
  );

  if (!connected && onConnect && !connecting) {
    return (
      <Pressable onPress={onConnect} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return content;
}
