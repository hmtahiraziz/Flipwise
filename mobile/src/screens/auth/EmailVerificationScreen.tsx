import {useSignIn, useSignUp} from '@clerk/clerk-expo';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useState} from 'react';
import {Pressable, Text} from 'react-native';
import {AuthBrandHeader} from '../../components/auth/AuthBrandHeader';
import {AuthField} from '../../components/auth/AuthField';
import {AuthFormCard} from '../../components/auth/AuthFormCard';
import {AuthPrimaryButton} from '../../components/auth/AuthPrimaryButton';
import {AuthScreenShell} from '../../components/auth/AuthScreenShell';
import {useAuthLayout} from '../../components/auth/authLayout';
import {authTheme} from '../../components/auth/authTheme';
import {toast} from '../../components/ui/Toast';
import {fonts} from '../../config/theme';
import {getApiErrorMessage} from '../../lib/errors';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerification'>;

export function EmailVerificationScreen({navigation, route}: Props) {
  const {email, flow} = route.params;
  const layout = useAuthLayout();
  const {signIn, setActive: setSignInActive, isLoaded: signInLoaded} = useSignIn();
  const {signUp, setActive: setSignUpActive, isLoaded: signUpLoaded} = useSignUp();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const isSignUp = flow === 'signUp';
  const isLoaded = isSignUp ? signUpLoaded : signInLoaded;

  const onVerify = useCallback(async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      toast.error('Verification failed', 'Enter the code from your email.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        if (!signUpLoaded || !signUp) {
          return;
        }

        const result = await signUp.attemptEmailAddressVerification({code: trimmedCode});

        if (result.status === 'complete' && result.createdSessionId) {
          await setSignUpActive?.({session: result.createdSessionId});
          return;
        }
      } else {
        if (!signInLoaded || !signIn) {
          return;
        }

        const result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: trimmedCode,
        });

        if (result.status === 'complete' && result.createdSessionId) {
          await setSignInActive?.({session: result.createdSessionId});
          return;
        }
      }

      toast.error('Verification failed', 'Invalid or expired code. Try again or resend.');
    } catch (error) {
      toast.error('Verification failed', getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [
    code,
    isSignUp,
    setSignInActive,
    setSignUpActive,
    signIn,
    signInLoaded,
    signUp,
    signUpLoaded,
  ]);

  const onResend = useCallback(async () => {
    setResending(true);
    try {
      if (isSignUp) {
        if (!signUpLoaded || !signUp) {
          return;
        }
        await signUp.prepareEmailAddressVerification({strategy: 'email_code'});
      } else {
        if (!signInLoaded || !signIn) {
          return;
        }

        const emailCodeFactor = signIn.supportedFirstFactors?.find(
          factor => factor.strategy === 'email_code',
        );

        if (!emailCodeFactor || !('emailAddressId' in emailCodeFactor)) {
          toast.error('Resend failed', 'Email verification is not available for this sign-in.');
          return;
        }

        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailCodeFactor.emailAddressId,
        });
      }

      toast.info('Code sent', 'Check your email for a new verification code.');
    } catch (error) {
      toast.error('Resend failed', getApiErrorMessage(error));
    } finally {
      setResending(false);
    }
  }, [isSignUp, signIn, signInLoaded, signUp, signUpLoaded]);

  return (
    <AuthScreenShell>
      <AuthBrandHeader
        showTagline={false}
        headline="Verify your email"
        subtitle={`Enter the 6-digit code sent to ${email}.`}
      />

      <AuthFormCard>
        <AuthField
          label="Verification Code"
          leftIcon="mark-email-read"
          autoCapitalize="none"
          keyboardType="number-pad"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChangeText={setCode}
          maxLength={6}
        />

        <AuthPrimaryButton
          label="Verify email"
          icon="check"
          loading={submitting}
          disabled={!isLoaded}
          onPress={() => void onVerify()}
        />

        <Pressable
          disabled={resending || !isLoaded}
          onPress={() => void onResend()}
          style={{marginTop: 12, alignItems: 'center', paddingVertical: 8}}>
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: layout.bodySize,
              color: authTheme.muted,
            }}>
            {resending ? 'Sending…' : 'Resend code'}
          </Text>
        </Pressable>
      </AuthFormCard>

      <Pressable
        onPress={() => navigation.goBack()}
        style={{marginTop: layout.footerMarginTop, alignItems: 'center', paddingVertical: 8}}>
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: layout.bodySize,
            color: authTheme.primary,
          }}>
          Back
        </Text>
      </Pressable>
    </AuthScreenShell>
  );
}
