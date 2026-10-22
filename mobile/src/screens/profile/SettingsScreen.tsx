import {useAuth, useSSO, useUser} from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useState} from 'react';
import {Linking, Pressable, ScrollView, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {googleOAuthRedirectUrl} from '../../auth/googleOAuth';
import {HeaderProfileButton} from '../../components/profile/HeaderProfileButton';
import {ProfileScreenHeader} from '../../components/profile/ProfileScreenHeader';
import {appAlert} from '../../components/ui/AppAlert';
import {
  SettingsDeleteAccountButton,
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
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProfileStackBack} from '../../hooks/useProfileStackBack';
import {getClerkAccountPortalUrl} from '../../lib/clerkAccount';
import {getApiErrorMessage} from '../../lib/errors';
import {deleteAccountRequest} from '../../services/api/authApi';
import {clearLocalUserData} from '../../storage/clearLocalUserData';
import {toast} from '../../components/ui/Toast';
import type {ProfileRoutesParamList} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<ProfileRoutesParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const onBack = useProfileStackBack(navigation);
  const {signOut} = useAuth();
  const {user: clerkUser} = useUser();
  const {user} = useAppUser();
  const {startSSOFlow} = useSSO();
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const {preferences, updatePreferences} = useTheme();

  const openEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);
  const openPrivacyPolicy = useCallback(() => {
    navigation.navigate('PrivacyPolicy');
  }, [navigation]);
  const openTermsOfService = useCallback(() => {
    navigation.navigate('TermsOfService');
  }, [navigation]);

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
    appAlert('Sign out', 'Are you sure you want to sign out of Cardweave?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => void signOut(),
      },
    ]);
  }, [signOut]);

  const performAccountDeletion = useCallback(async () => {
    setDeletingAccount(true);
    try {
      await deleteAccountRequest();
      clearLocalUserData();
      await signOut();
      toast.success('Account deleted', 'Your Cardweave data has been removed.');
    } catch (error) {
      toast.error('Could not delete account', getApiErrorMessage(error));
    } finally {
      setDeletingAccount(false);
    }
  }, [signOut]);

  const confirmDeleteAccount = useCallback(() => {
    appAlert(
      'Delete account?',
      'This permanently deletes your decks, cards, review history, and profile from Cardweave. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            appAlert(
              'Confirm deletion',
              'Are you sure you want to permanently delete your account?',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Delete permanently',
                  style: 'destructive',
                  onPress: () => void performAccountDeletion(),
                },
              ],
            );
          },
        },
      ],
    );
  }, [performAccountDeletion]);

  const adjustDailyGoal = useCallback(
    (delta: number) => {
      const next = Math.max(1, Math.min(500, preferences.dailyGoal + delta));
      updatePreferences({dailyGoal: next});
    },
    [preferences.dailyGoal, updatePreferences],
  );

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <ProfileScreenHeader
        title="Settings"
        onBack={onBack}
        right={
          <HeaderProfileButton size={32} onPress={openEditProfile} />
        }
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
          <SettingsCardDivider />
          <SettingsLinkRow
            label="Edit profile"
            icon="person"
            onPress={openEditProfile}
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="Study">
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
            subtitle="Limit animations in review"
            value={preferences.reducedMotion}
            onValueChange={value => updatePreferences({reducedMotion: value})}
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
            onPress={openTermsOfService}
          />
        </SettingsSectionCard>

        <SettingsVersionBadge version={APP_VERSION} />

        <View style={{gap: 12}}>
          <SettingsSignOutButton onPress={confirmSignOut} />
          <SettingsDeleteAccountButton
            onPress={confirmDeleteAccount}
            loading={deletingAccount}
          />
        </View>
      </ScrollView>
    </View>
  );
}
