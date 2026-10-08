import {useAuth, useSSO, useUser} from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useState} from 'react';
import {Alert, Linking, Pressable, ScrollView, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {googleOAuthRedirectUrl} from '../../auth/googleOAuth';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {ProfileScreenHeader} from '../../components/profile/ProfileScreenHeader';
import {
  SettingsGoogleRow,
  SettingsSignOutButton,
} from '../../components/profile/SettingsActions';
import {
  SettingsCardDivider,
  SettingsSectionCard,
  SettingsVersionBadge,
} from '../../components/profile/SettingsSectionCard';
import {
  SettingsDetailRow,
  SettingsLinkRow,
  SettingsToggleRow,
} from '../../components/profile/SettingsRows';
import {APP_VERSION, SUPPORT_EMAIL} from '../../config/app';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {getClerkAccountPortalUrl} from '../../lib/clerkAccount';
import {getApiErrorMessage} from '../../lib/errors';
import {toast} from '../../components/ui/Toast';
import type {ProfileRoutesParamList} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';
import type {ThemePreference} from '../../storage/preferencesStorage';

type Props = NativeStackScreenProps<ProfileRoutesParamList, 'Settings'>;

const THEME_OPTIONS: Array<{value: ThemePreference; label: string}> = [
  {value: 'light', label: 'Light'},
  {value: 'dark', label: 'Dark'},
  {value: 'system', label: 'System'},
];

export function SettingsScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const {signOut} = useAuth();
  const {user: clerkUser} = useUser();
  const {user} = useAppUser();
  const {openPrivacyPolicy, openTermsOfService, openEditProfile} =
    useProfileNavigation();
  const {startSSOFlow} = useSSO();
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const {
    preference,
    preferences,
    setThemePreference,
    updatePreferences,
  } = useTheme();

  const hasGoogle =
    clerkUser?.externalAccounts.some(account => account.provider === 'google') ??
    false;

  const openAccountPortal = useCallback(async () => {
    const url = getClerkAccountPortalUrl();
    if (!url) {
      toast.error('Unavailable', 'Account management is not configured.');
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        enableBarCollapsing: true,
      });
    } catch (error) {
      toast.error('Could not open account portal', getApiErrorMessage(error));
    }
  }, []);

  const connectGoogle = useCallback(async () => {
    setConnectingGoogle(true);
    try {
      const {createdSessionId, setActive, authSessionResult} = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: googleOAuthRedirectUrl,
      });

      if (
        authSessionResult?.type === 'cancel' ||
        authSessionResult?.type === 'dismiss' ||
        authSessionResult?.type === 'locked'
      ) {
        return;
      }

      if (createdSessionId) {
        await setActive?.({session: createdSessionId});
        toast.success('Google connected');
      }
    } catch (error) {
      toast.error('Could not connect Google', getApiErrorMessage(error));
    } finally {
      setConnectingGoogle(false);
    }
  }, [startSSOFlow]);

  const confirmSignOut = useCallback(() => {
    Alert.alert('Sign out', 'Are you sure you want to sign out of Flipwise?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => void signOut(),
      },
    ]);
  }, [signOut]);

  const adjustDailyGoal = useCallback(
    (delta: number) => {
      const next = Math.max(1, Math.min(500, preferences.dailyGoal + delta));
      updatePreferences({dailyGoal: next});
    },
    [preferences.dailyGoal, updatePreferences],
  );

  const headerAvatar = (
    <Pressable
      onPress={openEditProfile}
      hitSlop={8}
      accessibilityLabel="Edit profile"
      accessibilityRole="button"
      className="active:opacity-80"
      style={{
        width: 32,
        height: 32,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: colors.surfaceContainer,
      }}>
      <ProfileAvatar
        name={user?.name}
        email={user?.email}
        imageUrl={user?.avatarUrl}
        size={32}
      />
    </Pressable>
  );

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <ProfileScreenHeader
        title="Settings"
        onBack={() => navigation.goBack()}
        right={headerAvatar}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: 24,
          paddingBottom: layout.tabScrollBottomPadding + 24,
          gap: layout.sectionGap,
          maxWidth: libraryTokens.contentMaxWidthWide,
          width: '100%',
          alignSelf: 'center',
        }}>
        <SettingsSectionCard title="Account">
          <SettingsDetailRow
            label="Email"
            subtitle={user?.email ?? 'Not set'}
            onPress={() => void openAccountPortal()}
          />
          <SettingsCardDivider />
          <SettingsGoogleRow
            connected={hasGoogle}
            connecting={connectingGoogle}
            onConnect={hasGoogle ? undefined : () => void connectGoogle()}
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="Appearance & Study">
          <View style={{paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8}}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 16,
                lineHeight: 24,
                color: libraryTokens.ink,
                marginBottom: 12,
              }}>
              Theme
            </Text>
            <View className="flex-row" style={{gap: 8}}>
              {THEME_OPTIONS.map(option => {
                const selected = preference === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setThemePreference(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{selected}}
                    className="active:opacity-90"
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: selected
                        ? libraryTokens.primaryContainer
                        : libraryTokens.border,
                      backgroundColor: selected
                        ? libraryTokens.primaryContainer
                        : libraryTokens.surface,
                    }}>
                    <Text
                      style={{
                        fontFamily: fonts.bodySemiBold,
                        fontSize: 13,
                        color: selected
                          ? libraryTokens.onPrimaryContainer
                          : libraryTokens.muted,
                      }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <SettingsCardDivider />

          <View
            className="flex-row items-center justify-between"
            style={{paddingHorizontal: 20, paddingVertical: 16, gap: 12}}>
            <View className="flex-1 min-w-0">
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  lineHeight: 24,
                  color: libraryTokens.ink,
                }}>
                Daily goal
              </Text>
              <Text
                style={{
                  fontFamily: fonts.bodyMedium,
                  fontSize: 13,
                  lineHeight: 18,
                  color: libraryTokens.muted,
                  marginTop: 2,
                }}>
                Cards to review each day
              </Text>
            </View>
            <View className="flex-row items-center" style={{gap: 10}}>
              <Pressable
                onPress={() => adjustDailyGoal(-5)}
                accessibilityLabel="Decrease daily goal"
                className="active:opacity-80"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: libraryTokens.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: libraryTokens.surface,
                }}>
                <MaterialIcons name="remove" size={18} color={libraryTokens.ink} />
              </Pressable>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  minWidth: 36,
                  textAlign: 'center',
                  color: libraryTokens.ink,
                }}>
                {preferences.dailyGoal}
              </Text>
              <Pressable
                onPress={() => adjustDailyGoal(5)}
                accessibilityLabel="Increase daily goal"
                className="active:opacity-80"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: libraryTokens.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: libraryTokens.surface,
                }}>
                <MaterialIcons name="add" size={18} color={libraryTokens.ink} />
              </Pressable>
            </View>
          </View>

          <SettingsCardDivider />
          <SettingsToggleRow
            label="Reduced motion"
            subtitle="Limit animations"
            value={preferences.reducedMotion}
            onValueChange={value => updatePreferences({reducedMotion: value})}
          />
          <SettingsCardDivider />
          <SettingsToggleRow
            label="Haptics"
            subtitle="Vibration feedback"
            value={preferences.haptics}
            onValueChange={value => updatePreferences({haptics: value})}
          />
          <SettingsCardDivider />
          <SettingsToggleRow
            label="Sound"
            subtitle="Review sound effects"
            value={preferences.sound}
            onValueChange={value => updatePreferences({sound: value})}
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="Notifications">
          <SettingsToggleRow
            label="Study reminders"
            subtitle="Daily nudge when cards are due"
            value={preferences.remindersEnabled}
            onValueChange={value => {
              updatePreferences({remindersEnabled: value});
              toast.success(
                value ? 'Reminders on' : 'Reminders off',
                value
                  ? 'We will notify you when reviews are waiting.'
                  : 'You will not receive study reminder notifications.',
              );
            }}
          />
          <SettingsCardDivider />
          <SettingsToggleRow
            label="Quiet hours"
            subtitle={`${preferences.quietHoursStart} – ${preferences.quietHoursEnd}`}
            value={preferences.quietHoursEnabled}
            onValueChange={value =>
              updatePreferences({quietHoursEnabled: value})
            }
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="Support">
          <SettingsLinkRow
            label="Help"
            icon="help"
            onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          />
          <SettingsCardDivider />
          <SettingsLinkRow
            label="Privacy Policy"
            icon="security"
            onPress={openPrivacyPolicy}
          />
          <SettingsCardDivider />
          <SettingsLinkRow
            label="Terms of Service"
            icon="description"
            trailingIcon="open-in-new"
            onPress={openTermsOfService}
          />
        </SettingsSectionCard>

        <SettingsVersionBadge version={APP_VERSION} />

        <SettingsSignOutButton onPress={confirmSignOut} />
      </ScrollView>
    </View>
  );
}
