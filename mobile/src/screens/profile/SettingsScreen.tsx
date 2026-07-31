import {useAuth, useSSO, useUser} from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useState} from 'react';
import {Alert, Linking, Pressable, ScrollView, View} from 'react-native';
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
} from '../../components/profile/SettingsRows';
import {APP_VERSION, SUPPORT_EMAIL} from '../../config/app';
import {colors} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {getClerkAccountPortalUrl} from '../../lib/clerkAccount';
import {getApiErrorMessage} from '../../lib/errors';
import {toast} from '../../components/ui/Toast';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const {signOut} = useAuth();
  const {user: clerkUser} = useUser();
  const {user} = useAppUser();
  const {openPrivacyPolicy, openTermsOfService, openEditProfile} = useProfileNavigation();
  const {startSSOFlow} = useSSO();
  const [connectingGoogle, setConnectingGoogle] = useState(false);

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
    <View className="flex-1" style={{backgroundColor: colors.white}}>
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
