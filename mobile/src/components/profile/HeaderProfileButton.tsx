import {Pressable, View} from 'react-native';
import {brandColors} from '../../config/theme';
import {useAppUser} from '../../hooks/useAppUser';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {ProfileAvatar} from './ProfileAvatar';

type HeaderProfileButtonProps = {
  onPress?: () => void;
  size?: number;
};

/** Lime-ring profile chip for stack headers. */
export function HeaderProfileButton({
  onPress,
  size = 36,
}: HeaderProfileButtonProps) {
  const {user} = useAppUser();
  const {openProfile} = useProfileNavigation();
  const outer = size + 6;

  return (
    <Pressable
      onPress={onPress ?? openProfile}
      hitSlop={8}
      accessibilityLabel="Profile"
      accessibilityRole="button"
      className="active:opacity-85"
      style={{
        width: outer,
        height: outer,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: brandColors.lime,
        padding: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandColors.surface,
      }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
        }}>
        <ProfileAvatar
          name={user?.name}
          email={user?.email}
          imageUrl={user?.avatarUrl}
          size={size}
          variant="brand"
        />
      </View>
    </Pressable>
  );
}
