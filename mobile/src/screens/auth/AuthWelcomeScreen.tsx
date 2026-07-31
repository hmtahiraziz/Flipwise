import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useEffect} from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {FlipwiseWordmark} from '../../components/brand/FlipwiseWordmark';
import {AuthDivider} from '../../components/auth/AuthDivider';
import {GoogleSignInButton} from '../../components/auth/GoogleSignInButton';
import {Button} from '../../components/ui/Button';
import {APP_TAGLINE} from '../../config/brand';
import type {AuthStackParamList} from '../../navigation/types';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthWelcome'>;

export function AuthWelcomeScreen({navigation}: Props) {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingVertical: 32,
        }}
        keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-[480px] self-center">
          <View className="items-center mb-10">
            <FlipwiseWordmark variant="light" iconSize={44} />
            <Text className="text-body text-muted mt-5 text-center leading-6">
              {APP_TAGLINE}
            </Text>
          </View>

          <GoogleSignInButton />
          <AuthDivider />

          <Button
            label="Continue with email"
            variant="ghost"
            onPress={() => navigation.navigate('EmailAuth', {mode: 'signIn'})}
          />

          <Pressable
            className="mt-6 items-center py-2"
            onPress={() => navigation.navigate('EmailAuth', {mode: 'signUp'})}>
            <Text className="text-body text-muted font-medium">
              Create an account
            </Text>
          </Pressable>

          <View className="flex-row justify-center mt-10 gap-4">
            <Pressable onPress={() => void Linking.openURL('https://flipwise.app/terms')}>
              <Text className="text-caption text-muted">Terms</Text>
            </Pressable>
            <Text className="text-caption text-muted">·</Text>
            <Pressable onPress={() => void Linking.openURL('https://flipwise.app/privacy')}>
              <Text className="text-caption text-muted">Privacy</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
