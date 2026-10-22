import {useUser} from '@clerk/clerk-expo';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ProfileAvatar} from '../../components/profile/ProfileAvatar';
import {ProfileScreenHeader} from '../../components/profile/ProfileScreenHeader';
import {appAlert, showAppActionSheet} from '../../components/ui/AppAlert';
import {keyboardScrollProps} from '../../components/ui/KeyboardSafeView';
import {toast} from '../../components/ui/Toast';
import {brandColors, colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProfileStackBack} from '../../hooks/useProfileStackBack';
import {getApiErrorMessage} from '../../lib/errors';
import type {ProfileRoutesParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileRoutesParamList, 'EditProfile'>;

const INPUT_BG = '#F7F8F5';
const AVATAR_SIZE = 112;

type PickedAvatar = {
  uri: string;
  /** Clerk Expo requires a data URL on native — Blob/File uploads fail. */
  dataUrl: string;
};

const avatarPickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
  base64: true,
  exif: false,
  preferredAssetRepresentationMode:
    ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
};

function assetToPickedAvatar(
  asset: ImagePicker.ImagePickerAsset,
): PickedAvatar | null {
  if (!asset.uri || !asset.base64) {
    toast.error(
      'Could not read photo',
      'Try another image, or retake with the camera.',
    );
    return null;
  }

  const mime = (asset.mimeType ?? 'image/jpeg').toLowerCase();
  if (mime.includes('heic') || mime.includes('heif')) {
    toast.error(
      'Unsupported photo format',
      'Use JPEG or PNG. Retake with the camera, or pick a different photo.',
    );
    return null;
  }

  const safeMime =
    mime.startsWith('image/') && !mime.includes('heic')
      ? mime === 'image/jpg'
        ? 'image/jpeg'
        : mime
      : 'image/jpeg';

  return {
    uri: asset.uri,
    dataUrl: `data:${safeMime};base64,${asset.base64}`,
  };
}

async function pickAvatarImage(
  source: 'camera' | 'gallery',
): Promise<PickedAvatar | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast.error('Permission needed', 'Allow camera access to take a photo.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync(avatarPickerOptions);
    if (result.canceled || !result.assets?.[0]) {
      return null;
    }
    return assetToPickedAvatar(result.assets[0]);
  }

  // System photo picker — no READ_MEDIA_IMAGES / media-library permission.
  const result = await ImagePicker.launchImageLibraryAsync(avatarPickerOptions);
  if (result.canceled || !result.assets?.[0]) {
    return null;
  }
  return assetToPickedAvatar(result.assets[0]);
}

export function EditProfileScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const onBack = useProfileStackBack(navigation);
  const {user: clerkUser} = useUser();
  const {user, refetchUser} = useAppUser();
  const [name, setName] = useState(
    clerkUser?.fullName?.trim() || clerkUser?.firstName?.trim() || '',
  );
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localPreviewUri, setLocalPreviewUri] = useState<string | null>(null);
  const [avatarCacheKey, setAvatarCacheKey] = useState(0);

  const tabClearance = layout.tabScrollBottomPadding;
  const remoteAvatarUrl = user?.avatarUrl || clerkUser?.imageUrl || null;
  const displayAvatarUrl = localPreviewUri || remoteAvatarUrl;
  const hasAvatar = Boolean(displayAvatarUrl);

  const uploadAvatar = useCallback(
    async (picked: PickedAvatar) => {
      if (!clerkUser) {
        toast.error('Not signed in', 'Sign in again to update your photo.');
        return;
      }

      setLocalPreviewUri(picked.uri);
      setUploadingAvatar(true);
      try {
        await clerkUser.setProfileImage({file: picked.dataUrl});
        await clerkUser.reload();
        await refetchUser();
        setAvatarCacheKey(Date.now());
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
      setAvatarCacheKey(Date.now());
      setLocalPreviewUri(null);
      toast.success('Photo removed');
    } catch (error) {
      toast.error('Could not remove photo', getApiErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  }, [clerkUser, refetchUser]);

  const confirmRemoveAvatar = useCallback(() => {
    appAlert('Remove photo?', 'Your profile will show initials instead.', [
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
        await uploadAvatar(picked);
      } catch (error) {
        toast.error('Could not open picker', getApiErrorMessage(error));
      }
    },
    [uploadAvatar],
  );

  const openAvatarMenu = useCallback(() => {
    if (uploadingAvatar) return;

    const options = hasAvatar
      ? ['Take Photo', 'Choose from Library', 'Remove Photo', 'Cancel']
      : ['Take Photo', 'Choose from Library', 'Cancel'];
    const cancelButtonIndex = hasAvatar ? 3 : 2;
    const destructiveButtonIndex = hasAvatar ? 2 : undefined;

    showAppActionSheet({
      title: 'Profile photo',
      message: 'Upload a clear square photo for your Cardweave avatar.',
      options,
      cancelButtonIndex,
      destructiveButtonIndex,
      onPress: index => {
        if (index === 0) void handlePickSource('camera');
        if (index === 1) void handlePickSource('gallery');
        if (hasAvatar && index === 2) confirmRemoveAvatar();
      },
    });
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
      <ProfileScreenHeader title="Edit profile" onBack={onBack} />

      <View className="flex-1">
        <KeyboardAwareScrollView
          bottomOffset={24}
          {...keyboardScrollProps}
          contentContainerStyle={{
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 24,
            paddingBottom: 24,
            gap: layout.sectionGap,
            maxWidth: libraryTokens.contentMaxWidthWide,
            width: '100%',
            alignSelf: 'center',
          }}
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
                  cacheKey={avatarCacheKey}
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
        </KeyboardAwareScrollView>
      </View>

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
            onPress={onBack}
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
