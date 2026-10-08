import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {Linking, Pressable, Text, View} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {AuthDivider} from '../../components/auth/AuthDivider';
import {AuthPrimaryButton} from '../../components/auth/AuthPrimaryButton';
import {AuthScreenShell} from '../../components/auth/AuthScreenShell';
import {authTheme} from '../../components/auth/authTheme';
import {useAuthLayout} from '../../components/auth/authLayout';
import {GoogleSignInButton} from '../../components/auth/GoogleSignInButton';
import {FlipwiseWordmark} from '../../components/brand/FlipwiseWordmark';
import {PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL} from '../../config/app';
import {APP_TAGLINE} from '../../config/brand';
import {fonts} from '../../config/theme';
import type {AuthStackParamList} from '../../navigation/types';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthWelcome'>;

export function AuthWelcomeScreen({navigation}: Props) {
  const layout = useAuthLayout();

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <AuthScreenShell>
      <View style={{alignItems: 'center', marginBottom: 40}}>
        <FlipwiseWordmark variant="light" iconSize={44} />
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: layout.bodySize,
            lineHeight: Math.round(layout.bodySize * 1.5),
            color: authTheme.muted,
            textAlign: 'center',
            marginTop: 20,
          }}>
          {APP_TAGLINE}
        </Text>
      </View>

      <GoogleSignInButton />
      <AuthDivider />

      <AuthPrimaryButton
        label="Continue with email"
        icon="mail-outline"
        onPress={() => navigation.navigate('EmailAuth', {mode: 'signIn'})}
      />

      <Pressable
        onPress={() => navigation.navigate('EmailAuth', {mode: 'signUp'})}
        accessibilityRole="button"
        style={{marginTop: 24, alignItems: 'center', paddingVertical: 8}}>
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: layout.bodySize,
            color: authTheme.primary,
          }}>
          Create an account
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 40,
          gap: 16,
        }}>
        <Pressable onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: authTheme.muted,
            }}>
            Terms
          </Text>
        </Pressable>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: authTheme.muted,
          }}>
          ·
        </Text>
        <Pressable onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: authTheme.muted,
            }}>
            Privacy
          </Text>
        </Pressable>
      </View>
    </AuthScreenShell>
  );
}
