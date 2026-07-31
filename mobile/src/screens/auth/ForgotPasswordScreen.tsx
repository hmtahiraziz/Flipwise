import {useSignIn} from '@clerk/clerk-expo';
import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
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
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
  type ForgotPasswordEmailValues,
  type ResetPasswordFormValues,
} from '../../lib/schemas';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

type Step = 'email' | 'reset';

export function ForgotPasswordScreen({navigation, route}: Props) {
  const layout = useAuthLayout();
  const initialEmail = route.params?.email?.trim().toLowerCase() ?? '';
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [sendingCode, setSendingCode] = useState(false);
  const [resending, setResending] = useState(false);
  const {signIn, setActive, isLoaded} = useSignIn();
  const autoSentRef = useRef(false);

  const emailForm = useForm<ForgotPasswordEmailValues>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: {email: initialEmail},
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {code: '', password: '', confirmPassword: ''},
  });

  const sendResetCode = useCallback(
    async (targetEmail: string) => {
      if (!isLoaded || !signIn) {
        return false;
      }

      setSendingCode(true);
      try {
        await signIn.create({
          strategy: 'reset_password_email_code',
          identifier: targetEmail.trim().toLowerCase(),
        });
        setEmail(targetEmail.trim().toLowerCase());
        setStep('reset');
        toast.info('Code sent', 'Check your email for a password reset code.');
        return true;
      } catch (error) {
        toast.error('Could not send code', getApiErrorMessage(error));
        return false;
      } finally {
        setSendingCode(false);
      }
    },
    [isLoaded, signIn],
  );

  const onRequestCode = emailForm.handleSubmit(async values => {
    await sendResetCode(values.email);
  });

  const onResendCode = useCallback(async () => {
    if (!email) {
      return;
    }
    setResending(true);
    try {
      await sendResetCode(email);
    } finally {
      setResending(false);
    }
  }, [email, sendResetCode]);

  const onResetPassword = resetForm.handleSubmit(async values => {
    if (!isLoaded || !signIn) {
      return;
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: values.code.trim(),
        password: values.password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive?.({session: result.createdSessionId});
        toast.info('Password updated', 'You are now signed in.');
        return;
      }

      toast.error('Reset failed', 'Could not reset your password. Try again.');
    } catch (error) {
      toast.error('Reset failed', getApiErrorMessage(error));
    }
  });

  useEffect(() => {
    if (initialEmail && isLoaded && !autoSentRef.current) {
      autoSentRef.current = true;
      void sendResetCode(initialEmail);
    }
  }, [initialEmail, isLoaded, sendResetCode]);

  return (
    <AuthScreenShell>
      <AuthBrandHeader
        showTagline={false}
        headline={step === 'email' ? 'Reset your password' : 'Create a new password'}
        subtitle={
          step === 'email'
            ? "Enter your email and we'll send you a reset code."
            : `Enter the code sent to ${email} and choose a new password.`
        }
      />

      <AuthFormCard>
        {step === 'email' ? (
          <>
            <Controller
              control={emailForm.control}
              name="email"
              render={({field: {onChange, onBlur, value}}) => (
                <AuthField
                  label="Email Address"
                  leftIcon="mail-outline"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={emailForm.formState.errors.email?.message}
                />
              )}
            />
            <AuthPrimaryButton
              label="Send reset code"
              icon="mail-outline"
              loading={sendingCode || emailForm.formState.isSubmitting}
              onPress={onRequestCode}
            />
          </>
        ) : (
          <>
            <Controller
              control={resetForm.control}
              name="code"
              render={({field: {onChange, onBlur, value}}) => (
                <AuthField
                  label="Reset Code"
                  leftIcon="mark-email-read"
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  maxLength={6}
                  error={resetForm.formState.errors.code?.message}
                />
              )}
            />
            <Controller
              control={resetForm.control}
              name="password"
              render={({field: {onChange, onBlur, value}}) => (
                <AuthField
                  label="New Password"
                  leftIcon="lock-outline"
                  secureTextEntry
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={resetForm.formState.errors.password?.message}
                />
              )}
            />
            <Controller
              control={resetForm.control}
              name="confirmPassword"
              render={({field: {onChange, onBlur, value}}) => (
                <AuthField
                  label="Confirm Password"
                  leftIcon="lock-outline"
                  secureTextEntry
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={resetForm.formState.errors.confirmPassword?.message}
                />
              )}
            />
            <AuthPrimaryButton
              label="Update password"
              icon="check"
              loading={resetForm.formState.isSubmitting}
              onPress={onResetPassword}
            />
            <Pressable
              disabled={resending}
              onPress={() => void onResendCode()}
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
          </>
        )}
      </AuthFormCard>

      <Pressable
        onPress={() => navigation.navigate('EmailAuth', {mode: 'signIn'})}
        style={{marginTop: layout.footerMarginTop, alignItems: 'center', paddingVertical: 8}}>
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: layout.bodySize,
            color: authTheme.primary,
          }}>
          Back to login
        </Text>
      </Pressable>
    </AuthScreenShell>
  );
}
