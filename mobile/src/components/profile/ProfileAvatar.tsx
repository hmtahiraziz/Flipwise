import {useEffect, useState} from 'react';
import {Image, Text, View} from 'react-native';
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';

type ProfileAvatarProps = {
  name?: string | null;
  email?: string;
  imageUrl?: string | null;
  size?: number;
  /** Lime initials chip — preferred for headers */
  variant?: 'default' | 'brand';
  /** Bust RN image cache after avatar replace (Clerk URLs can look identical). */
  cacheKey?: number | string;
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

function withCacheBust(url: string, cacheKey?: number | string): string {
  if (cacheKey === undefined || cacheKey === null || cacheKey === '') {
    return url;
  }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}cw_avatar=${encodeURIComponent(String(cacheKey))}`;
}

export function ProfileAvatar({
  name,
  email,
  imageUrl,
  size = 96,
  variant = 'brand',
  cacheKey,
}: ProfileAvatarProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const initials = getInitials(name, email);
  const fontSize = Math.round(size * 0.36);
  const bg = variant === 'brand' ? brandColors.lime : libraryTokens.surfaceContainerLow;
  const fg = brandColors.charcoal;

  useEffect(() => {
    setLoadFailed(false);
  }, [imageUrl, cacheKey]);

  if (imageUrl && !loadFailed) {
    const uri = imageUrl.startsWith('file:') || imageUrl.startsWith('content:')
      ? imageUrl
      : withCacheBust(imageUrl, cacheKey);

    return (
      <Image
        source={{uri}}
        onError={() => setLoadFailed(true)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize,
          fontWeight: '700',
          color: fg,
          letterSpacing: -0.3,
        }}>
        {initials}
      </Text>
    </View>
  );
}
