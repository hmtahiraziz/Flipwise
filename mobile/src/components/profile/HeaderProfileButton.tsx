import {Pressable} from 'react-native';
import {colors} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {ProfileAvatar} from './ProfileAvatar';

type HeaderProfileButtonProps = {
  onPress?: () => void;
  borderColor?: string;
  backgroundColor?: string;
};

/** Standard 40×40 profile chip for stack screen headers (Card List, Generate, Deck Detail, etc.). */
export function HeaderProfileButton({
  onPress,
  borderColor = libraryTokens.border,
  backgroundColor = colors.surfaceContainer,
}: HeaderProfileButtonProps) {
  const {user} = useAppUser();
  const {openProfile} = useProfileNavigation();

  return (
    <Pressable
      onPress={onPress ?? openProfile}
      hitSlop={8}
      accessibilityLabel="Profile"
      accessibilityRole="button"
      className="active:opacity-80"
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        borderWidth: 1,
        borderColor,
        overflow: 'hidden',
        backgroundColor,
      }}>
      <ProfileAvatar
        name={user?.name}
        email={user?.email}
        imageUrl={user?.avatarUrl}
        size={40}
      />
    </Pressable>
  );
}
