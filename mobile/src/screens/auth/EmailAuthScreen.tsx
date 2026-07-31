import {useSignIn, useSignUp} from '@clerk/clerk-expo';
import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Pressable, Text} from 'react-native';
import {AuthBrandHeader} from '../../components/auth/AuthBrandHeader';
import {AuthDivider} from '../../components/auth/AuthDivider';
import {AuthField} from '../../components/auth/AuthField';
import {AuthFormCard} from '../../components/auth/AuthFormCard';
import {AuthPrimaryButton} from '../../components/auth/AuthPrimaryButton';
import {AuthRememberMe} from '../../components/auth/AuthRememberMe';
import {AuthScreenShell} from '../../components/auth/AuthScreenShell';
import {GoogleSignInButton} from '../../components/auth/GoogleSignInButton';
import {useAuthLayout} from '../../components/auth/authLayout';
import {authTheme} from '../../components/auth/authTheme';
import {toast} from '../../components/ui/Toast';
import {fonts} from '../../config/theme';
import {getApiErrorMessage} from '../../lib/errors';
import {loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues} from '../../lib/schemas';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailAuth'>;

type AuthMode = 'signIn' | 'signUp';

export function EmailAuthScreen({navigation, route}: Props) {
  const initialMode: AuthMode = route.params?.mode === 'signUp' ? 'signUp' : 'signIn';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [rememberMe, setRememberMe] = useState(false);
  const layout = useAuthLayout();
  const {signIn, setActive: setSignInActive, isLoaded: signInLoaded} = useSignIn();
  const {signUp, isLoaded: signUpLoaded} = useSignUp();

  const signInForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {email: '', password: ''},
  });

  const signUpForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {name: '', email: '', password: ''},
  });

  const toggleMode = useCallback(() => {
    setMode(current => (current === 'signIn' ? 'signUp' : 'signIn'));
  }, []);

  const onSignIn = signInForm.handleSubmit(async values => {
    if (!signInLoaded || !signIn) {
      return;
    }

    const email = values.email.trim().toLowerCase();

    try {
      const result = await signIn.create({
        identifier: email,
        password: values.password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setSignInActive?.({session: result.createdSessionId});
        return;
      }

      if (result.status === 'needs_first_factor') {
        const emailCodeFactor = signIn.supportedFirstFactors?.find(
          factor => factor.strategy === 'email_code',
        );

        if (emailCodeFactor && 'emailAddressId' in emailCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          navigation.navigate('EmailVerification', {email, flow: 'signIn'});
          return;
        }

        toast.error('Sign in incomplete', 'Additional verification may be required.');
        return;
      }

      toast.error('Sign in incomplete', 'Additional verification may be required.');
    } catch (error) {
      toast.error('Sign in failed', getApiErrorMessage(error));
    }
  });

  const onSignUp = signUpForm.handleSubmit(async values => {
    if (!signUpLoaded || !signUp) {
      return;
    }

    const email = values.email.trim().toLowerCase();

    try {
      const nameParts = values.name?.trim().split(/\s+/) ?? [];
      const firstName = nameParts[0] ?? undefined;
      const lastName = nameParts.slice(1).join(' ') || undefined;

      await signUp.create({
        emailAddress: email,
        password: values.password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({strategy: 'email_code'});
      navigation.navigate('EmailVerification', {email, flow: 'signUp'});
    } catch (error) {
      toast.error('Sign up failed', getApiErrorMessage(error));
    }
  });

  const isSignIn = mode === 'signIn';
  const form = isSignIn ? signInForm : signUpForm;

  return (
    <AuthScreenShell>
      <AuthBrandHeader
        subtitle={
          isSignIn
            ? 'Log in and jump back into your next review session.'
            : 'Create your account and start studying with AI flashcards.'
        }
      />

      <AuthFormCard>
        {!isSignIn ? (
          <Controller
            control={signUpForm.control}
            name="name"
            render={({field: {onChange, onBlur, value}}) => (
              <AuthField
                label="Name"
                leftIcon="person-outline"
                autoComplete="name"
                placeholder="Alex Chen"
                value={value ?? ''}
                onBlur={onBlur}
                onChangeText={onChange}
                error={signUpForm.formState.errors.name?.message}
              />
            )}
          />
        ) : null}

        <Controller
          control={form.control}
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
              error={form.formState.errors.email?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({field: {onChange, onBlur, value}}) => (
            <AuthField
              label="Password"
              leftIcon="lock-outline"
              secureTextEntry
              compactBottom={isSignIn}
              autoComplete={isSignIn ? 'password' : 'new-password'}
              placeholder="••••••••"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={form.formState.errors.password?.message}
              labelRight={
                isSignIn ? (
                  <Pressable
                    hitSlop={8}
                    onPress={() =>
                      navigation.navigate('ForgotPassword', {
                        email: signInForm.getValues('email'),
                      })
                    }>
                    <Text
                      style={{
                        fontFamily: fonts.bodySemiBold,
                        fontSize: 12,
                        color: authTheme.primary,
                      }}>
                      Forgot Password?
                    </Text>
                  </Pressable>
                ) : undefined
              }
            />
          )}
        />

        {isSignIn ? (
          <AuthRememberMe checked={rememberMe} onToggle={() => setRememberMe(current => !current)} />
        ) : null}

        <AuthPrimaryButton
          label={isSignIn ? 'Login' : 'Create Account'}
          icon={isSignIn ? 'arrow-forward' : 'rocket-launch'}
          loading={form.formState.isSubmitting}
          onPress={isSignIn ? onSignIn : onSignUp}
        />
      </AuthFormCard>

      <AuthDivider />
      <GoogleSignInButton />

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: layout.bodySize,
          lineHeight: layout.bodySize * 1.5,
          color: authTheme.onSurface,
          textAlign: 'center',
          marginTop: layout.footerMarginTop,
        }}>
        {isSignIn ? "Don't have an account? " : 'Already have an account? '}
        <Text
          onPress={toggleMode}
          style={{
            fontFamily: fonts.bodySemiBold,
            color: authTheme.primary,
          }}>
          {isSignIn ? 'Register' : 'Login'}
        </Text>
      </Text>
    </AuthScreenShell>
  );
}
