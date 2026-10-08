import {useUser} from '@clerk/clerk-expo';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useState} from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {ProfileScreenHeader} from '../../components/profile/ProfileScreenHeader';
import {toast} from '../../components/ui/Toast';
import {brandColors, colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {getApiErrorMessage} from '../../lib/errors';
import type {ProfileRoutesParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileRoutesParamList, 'EditProfile'>;

const INPUT_BG = '#F7F8F5';
const AVATAR_SIZE = 112;

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Could not read selected image');
  }
  return response.blob();
}

async function pickAvatarImage(
  source: 'camera' | 'gallery',
): Promise<{uri: string} | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast.error('Permission needed', 'Allow camera access to take a photo.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]?.uri) {
      return null;
    }
    return {uri: result.assets[0].uri};
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    toast.error('Permission needed', 'Allow photo access to choose an avatar.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }
  return {uri: result.assets[0].uri};
}

export function EditProfileScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const {user: clerkUser} = useUser();
  const {user, refetchUser} = useAppUser();
  const [name, setName] = useState(
    clerkUser?.fullName?.trim() || clerkUser?.firstName?.trim() || '',
  );
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localPreviewUri, setLocalPreviewUri] = useState<string | null>(null);

  const tabClearance = layout.tabScrollBottomPadding;
  const displayAvatarUrl = localPreviewUri || user?.avatarUrl || clerkUser?.imageUrl;
  const hasAvatar = Boolean(displayAvatarUrl);

  const uploadAvatar = useCallback(
    async (uri: string) => {
      if (!clerkUser) {
        toast.error('Not signed in', 'Sign in again to update your photo.');
        return;
      }

      setLocalPreviewUri(uri);
      setUploadingAvatar(true);
      try {
        const blob = await uriToBlob(uri);
        await clerkUser.setProfileImage({file: blob});
        await clerkUser.reload();
        await refetchUser();
        setLocalPreviewUri(null);
        toast.success('Photo updated', 'Your profile avatar has been saved.');
      } catch (error) {
        setLocalPreviewUri(null);
        toast.error('Could not upload photo', getApiErrorMessage(error));
      } finally {
        setUploadingAvatar(false);
      }
    },
    [clerkUser, refetchUser],
  );

  const removeAvatar = useCallback(async () => {
    if (!clerkUser) return;

    setUploadingAvatar(true);
    try {
      await clerkUser.setProfileImage({file: null});
      await clerkUser.reload();
      await refetchUser();
      setLocalPreviewUri(null);
      toast.success('Photo removed');
    } catch (error) {
      toast.error('Could not remove photo', getApiErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  }, [clerkUser, refetchUser]);

  const confirmRemoveAvatar = useCallback(() => {
    Alert.alert('Remove photo?', 'Your profile will show initials instead.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => void removeAvatar(),
      },
    ]);
  }, [removeAvatar]);

  const handlePickSource = useCallback(
    async (source: 'camera' | 'gallery') => {
      try {
        const picked = await pickAvatarImage(source);
        if (!picked) return;
        await uploadAvatar(picked.uri);
      } catch (error) {
        toast.error('Could not open picker', getApiErrorMessage(error));
      }
    },
    [uploadAvatar],
  );

  const openAvatarMenu = useCallback(() => {
    if (uploadingAvatar) return;

    if (Platform.OS === 'ios') {
      const options = hasAvatar
        ? ['Take Photo', 'Choose from Library', 'Remove Photo', 'Cancel']
        : ['Take Photo', 'Choose from Library', 'Cancel'];
      const cancelButtonIndex = hasAvatar ? 3 : 2;
      const destructiveButtonIndex = hasAvatar ? 2 : undefined;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
          title: 'Profile photo',
          message: 'Upload a clear square photo for your Flipwise avatar.',
        },
        index => {
          if (index === 0) void handlePickSource('camera');
          if (index === 1) void handlePickSource('gallery');
          if (hasAvatar && index === 2) confirmRemoveAvatar();
        },
      );
      return;
    }

    Alert.alert(
      'Profile photo',
      'Upload a clear square photo for your Flipwise avatar.',
      [
        {text: 'Take Photo', onPress: () => void handlePickSource('camera')},
        {
          text: 'Choose from Library',
          onPress: () => void handlePickSource('gallery'),
        },
        ...(hasAvatar
          ? [
              {
                text: 'Remove Photo',
                style: 'destructive' as const,
                onPress: confirmRemoveAvatar,
              },
            ]
          : []),
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  }, [
    confirmRemoveAvatar,
    handlePickSource,
    hasAvatar,
    uploadingAvatar,
  ]);

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
              Update your photo and display name. Changes sync with your sign-in
              account.
            </Text>
          </View>

          {/* Avatar upload card */}
          <View
            style={{
              backgroundColor: brandColors.surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: libraryTokens.borderSubtle,
              paddingVertical: 28,
              paddingHorizontal: 20,
              alignItems: 'center',
              gap: 16,
            }}>
            <Pressable
              onPress={openAvatarMenu}
              disabled={uploadingAvatar}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              className="active:opacity-95"
              style={{alignItems: 'center'}}>
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
                  imageUrl={displayAvatarUrl}
                  size={AVATAR_SIZE}
                  variant="brand"
                />
                <View
                  style={{
                    position: 'absolute',
                    right: 4,
                    bottom: 4,
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    backgroundColor: libraryTokens.primaryContainer,
                    borderWidth: 3,
                    borderColor: brandColors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {uploadingAvatar ? (
                    <ActivityIndicator
                      size="small"
                      color={libraryTokens.onPrimaryContainer}
                    />
                  ) : (
                    <MaterialIcons
                      name="photo-camera"
                      size={18}
                      color={libraryTokens.onPrimaryContainer}
                    />
                  )}
                </View>
              </View>
            </Pressable>

            <View style={{alignItems: 'center', gap: 4}}>
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  color: libraryTokens.ink,
                }}>
                {uploadingAvatar ? 'Uploading photo…' : 'Profile photo'}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  lineHeight: 18,
                  color: libraryTokens.muted,
                  textAlign: 'center',
                }}>
                JPG or PNG · square crop recommended
              </Text>
            </View>

            <View style={{flexDirection: 'row', gap: 10, width: '100%'}}>
              <Pressable
                onPress={openAvatarMenu}
                disabled={uploadingAvatar}
                accessibilityRole="button"
                accessibilityLabel="Upload photo"
                className="active:opacity-90"
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: libraryTokens.primaryContainer,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  opacity: uploadingAvatar ? 0.65 : 1,
                }}>
                <MaterialIcons
                  name="upload"
                  size={18}
                  color={libraryTokens.onPrimaryContainer}
                />
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 14,
                    color: libraryTokens.onPrimaryContainer,
                  }}>
                  {hasAvatar ? 'Change photo' : 'Upload photo'}
                </Text>
              </Pressable>

              {hasAvatar ? (
                <Pressable
                  onPress={confirmRemoveAvatar}
                  disabled={uploadingAvatar}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                  className="active:opacity-90"
                  style={{
                    height: 48,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    backgroundColor: libraryTokens.surfaceContainerLow,
                    borderWidth: 1,
                    borderColor: libraryTokens.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    opacity: uploadingAvatar ? 0.65 : 1,
                  }}>
                  <MaterialIcons
                    name="delete-outline"
                    size={18}
                    color={libraryTokens.error}
                  />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* Name card */}
          <View
            style={{
              backgroundColor: brandColors.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: libraryTokens.borderSubtle,
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
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={{
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: 12,
          paddingBottom: tabClearance,
          borderTopWidth: 1,
          borderTopColor: libraryTokens.borderSubtle,
          backgroundColor: 'rgba(249, 250, 246, 0.92)',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}>
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={saving || uploadingAvatar}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            className="active:opacity-90"
            style={{
              flex: 1,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              backgroundColor: libraryTokens.surface,
              borderWidth: 1,
              borderColor: libraryTokens.border,
              opacity: saving || uploadingAvatar ? 0.6 : 1,
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 14,
                color: libraryTokens.ink,
              }}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void onSave()}
            disabled={saving || uploadingAvatar}
            accessibilityRole="button"
            accessibilityLabel="Save changes"
            className="active:opacity-90"
            style={{
              flex: 2,
              minHeight: 52,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 999,
              backgroundColor: libraryTokens.primaryContainer,
              opacity: saving || uploadingAvatar ? 0.75 : 1,
            }}>
            {saving ? (
              <ActivityIndicator
                size="small"
                color={libraryTokens.onPrimaryContainer}
              />
            ) : (
              <MaterialIcons
                name="check"
                size={20}
                color={libraryTokens.onPrimaryContainer}
              />
            )}
            <Text
              style={{
                fontFamily: fonts.bodyBold,
                fontSize: 14,
                color: libraryTokens.onPrimaryContainer,
              }}>
              Save changes
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
