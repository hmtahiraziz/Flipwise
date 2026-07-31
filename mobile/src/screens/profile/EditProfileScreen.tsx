import {useUser} from '@clerk/clerk-expo';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {ProfileScreenHeader} from '../../components/profile/ProfileScreenHeader';
import {SilhouetteCard} from '../../components/ui/SilhouetteCard';
import {toast} from '../../components/ui/Toast';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {getApiErrorMessage} from '../../lib/errors';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'EditProfile'>;

const INPUT_BG = '#F7F8F5';

export function EditProfileScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const {user: clerkUser} = useUser();
  const {user, refetchUser} = useAppUser();
  const [name, setName] = useState(
    clerkUser?.fullName?.trim() || clerkUser?.firstName?.trim() || '',
  );
  const [saving, setSaving] = useState(false);

  const tabClearance = layout.tabScrollBottomPadding;

  const onSave = async () => {
    if (!clerkUser) {
      return;
    }

    setSaving(true);
    try {
      const parts = name.trim().split(/\s+/);
      await clerkUser.update({
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' ') || '',
      });
      await clerkUser.reload();
      await refetchUser();
      toast.success('Profile updated');
      navigation.goBack();
    } catch (error) {
      toast.error('Could not update profile', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <ProfileScreenHeader title="Edit profile" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={layout.insets.top + 64}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 24,
            paddingBottom: 24,
            gap: layout.sectionGap,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={{gap: 8}}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 12,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: libraryTokens.muted,
              }}>
              Your profile
            </Text>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: layout.isNarrow ? 28 : 32,
                lineHeight: layout.isNarrow ? 36 : 40,
                letterSpacing: -0.64,
                fontWeight: '700',
                color: libraryTokens.ink,
              }}>
              Personal details
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 15,
                lineHeight: 22,
                color: libraryTokens.muted,
              }}>
              Update your display name. Changes sync with your sign-in account.
            </Text>
          </View>

          <SilhouetteCard variant="review">
            <View
              className="items-center"
              style={{
                borderRadius: reviewTokens.cardRadius,
                borderWidth: 1,
                borderColor: reviewTokens.border,
                backgroundColor: reviewTokens.card,
                paddingVertical: 28,
                paddingHorizontal: 20,
              }}>
              <View
                style={{
                  padding: 4,
                  borderRadius: 999,
                  borderWidth: 3,
                  borderColor: libraryTokens.primaryContainer,
                  backgroundColor: libraryTokens.surface,
                }}>
                <ProfileAvatar
                  name={name || user?.name}
                  email={user?.email}
                  imageUrl={user?.avatarUrl}
                  size={104}
                  variant="brand"
                />
              </View>
            </View>
          </SilhouetteCard>

          <SilhouetteCard variant="review">
            <View
              style={{
                borderRadius: reviewTokens.cardRadius,
                borderWidth: 1,
                borderColor: reviewTokens.border,
                backgroundColor: reviewTokens.card,
                padding: 20,
                gap: 8,
              }}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 11,
                  letterSpacing: 0.55,
                  textTransform: 'uppercase',
                  color: colors.muted,
                }}>
                Full name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                autoComplete="name"
                placeholder="Your name"
                placeholderTextColor={colors.placeholder}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: libraryTokens.border,
                  backgroundColor: INPUT_BG,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontFamily: fonts.body,
                  fontSize: 16,
                  lineHeight: 24,
                  color: colors.onSurface,
                  minHeight: 56,
                }}
              />
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  lineHeight: 18,
                  color: libraryTokens.muted,
                }}>
                Email: {user?.email}
              </Text>
            </View>
          </SilhouetteCard>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={{
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: 16,
          paddingBottom: tabClearance,
          borderTopWidth: 1,
          borderTopColor: libraryTokens.borderSubtle,
          backgroundColor: libraryTokens.background,
        }}>
        <Pressable
          onPress={() => void onSave()}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
          className="active:opacity-90"
          style={{
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 12,
            backgroundColor: libraryTokens.primaryContainer,
            borderBottomWidth: 4,
            borderBottomColor: '#ACD60E',
            opacity: saving ? 0.75 : 1,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}>
          {saving ? (
            <ActivityIndicator size="small" color={libraryTokens.onPrimaryContainer} />
          ) : null}
          <Text
            style={{
              fontFamily: fonts.bodySemiBold,
              fontSize: 16,
              color: libraryTokens.onPrimaryContainer,
            }}>
            Save changes
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
