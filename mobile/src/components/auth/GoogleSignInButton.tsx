import {useSignIn, useSSO} from '@clerk/clerk-expo';
import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {
  coolDownOAuthBrowser,
  googleOAuthRedirectUrl,
  warmUpOAuthBrowser,
} from '../../auth/googleOAuth';
import {fonts} from '../../config/theme';
import {getApiErrorMessage} from '../../lib/errors';
import {toast} from '../ui/Toast';
import {useAuthLayout} from './authLayout';
import {authTheme} from './authTheme';
import {GoogleLogo} from './GoogleLogo';

/** Google Identity–style sign-in button (white fill, official G logo). */
export function GoogleSignInButton() {
  const layout = useAuthLayout();
  const {startSSOFlow} = useSSO();
  const {isLoaded: isSignInLoaded} = useSignIn();
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);

  const buttonHeight = layout.inputHeight;
  const logoSize = layout.isVeryCompactHeight ? 18 : 20;

  useEffect(() => {
    void warmUpOAuthBrowser();
    return () => {
      void coolDownOAuthBrowser();
    };
  }, []);

  const onPress = useCallback(async () => {
    if (!isSignInLoaded) {
      toast.error('Google sign-in unavailable', 'Auth is still loading. Try again in a moment.');
      return;
    }

    setLoading(true);
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

      if (authSessionResult?.type !== 'success') {
        toast.error(
          'Google sign-in failed',
          'The sign-in browser did not return successfully. Check redirect URL in Clerk dashboard.',
        );
        return;
      }

      if (!createdSessionId) {
        toast.error(
          'Google sign-in failed',
          'Could not complete sign-in. Ensure Google is enabled in Clerk and redirect URL is allowlisted.',
        );
        return;
      }

      await setActive?.({session: createdSessionId});
    } catch (error) {
      toast.error('Google sign-in failed', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [isSignInLoaded, startSSOFlow]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      disabled={loading || !isSignInLoaded}
      onPress={() => void onPress()}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{width: '100%', opacity: loading || !isSignInLoaded ? 0.7 : 1}}>
      <View
        style={{
          height: buttonHeight,
          borderRadius: layout.inputRadius,
          borderWidth: 1,
          borderColor: '#747775',
          backgroundColor: pressed ? '#F8F9FA' : '#FFFFFF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          gap: 12,
        }}>
        {loading ? (
          <ActivityIndicator size="small" color={authTheme.onSurface} />
        ) : (
          <>
            <View
              style={{
                width: logoSize,
                height: logoSize,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <GoogleLogo size={logoSize} />
            </View>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: layout.bodySize,
                lineHeight: Math.round(layout.bodySize * 1.5),
                color: '#1F1F1F',
                letterSpacing: 0.1,
              }}>
              Continue with Google
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}
