import {Pressable, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ProfileAvatarChip} from './ProfileAvatar';
import {colors} from '../../config/theme';
import {useAppUser} from '../../hooks/useAppUser';

type HeaderProfileActionsProps = {
  onSettingsPress: () => void;
  onProfilePress: () => void;
};

export function HeaderProfileActions({
  onSettingsPress,
  onProfilePress,
}: HeaderProfileActionsProps) {
  const {user} = useAppUser();

  return (
    <View className="flex-row items-center gap-0.5">
      <Pressable
        onPress={onSettingsPress}
        hitSlop={8}
        accessibilityLabel="Settings"
        accessibilityRole="button"
        className="w-10 h-10 items-center justify-center rounded-full bg-surface-muted active:opacity-70">
        <MaterialIcons name="settings" size={22} color={colors.text} />
      </Pressable>
      <Pressable
        onPress={onProfilePress}
        hitSlop={8}
        accessibilityLabel="Profile"
        accessibilityRole="button"
        className="p-0.5 active:opacity-70">
        <ProfileAvatarChip
          name={user?.name}
          email={user?.email}
          imageUrl={user?.avatarUrl}
        />
      </Pressable>
    </View>
  );
}
