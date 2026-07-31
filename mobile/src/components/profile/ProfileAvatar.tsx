import {Image, Text, View} from 'react-native';
import {colors} from '../../config/theme';

type ProfileAvatarProps = {
  name?: string | null;
  email?: string;
  imageUrl?: string | null;
  size?: number;
  /** Lime brand ring avatar for library header */
  variant?: 'default' | 'brand';
};

function getInitials(name?: string | null, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (email?.slice(0, 2) ?? '?').toUpperCase();
}

export function ProfileAvatar({
  name,
  email,
  imageUrl,
  size = 96,
  variant = 'default',
}: ProfileAvatarProps) {
  const initials = getInitials(name, email);
  const fontSize = Math.round(size * 0.34);
  const brandBg = colors.primaryContainer;
  const brandText = colors.onPrimaryContainer;

  if (imageUrl) {
    return (
      <Image
        source={{uri: imageUrl}}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: variant === 'brand' ? brandBg : colors.brandLavender,
        }}
      />
    );
  }

  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: variant === 'brand' ? brandBg : colors.brandLavender,
      }}>
      <Text
        style={{
          fontFamily: 'Manrope-Bold',
          fontSize,
          color: variant === 'brand' ? brandText : colors.text,
        }}>
        {initials}
      </Text>
    </View>
  );
}

export function ProfileAvatarChip({
  name,
  email,
  imageUrl,
}: Omit<ProfileAvatarProps, 'size'>) {
  return <ProfileAvatar name={name} email={email} imageUrl={imageUrl} size={36} />;
}
