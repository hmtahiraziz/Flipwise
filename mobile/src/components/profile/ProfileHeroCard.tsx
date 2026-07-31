import {Text, View} from 'react-native';
import {SilhouetteCard} from '../ui/SilhouetteCard';
import {fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';
import {ProfileAvatar} from './ProfileAvatar';

type ProfileHeroCardProps = {
  name: string;
  email: string;
  imageUrl?: string | null;
};

export function ProfileHeroCard({name, email, imageUrl}: ProfileHeroCardProps) {
  return (
    <SilhouetteCard variant="review">
      <View
        className="items-center"
        style={{
          borderRadius: reviewTokens.cardRadius,
          borderWidth: 1,
          borderColor: reviewTokens.border,
          backgroundColor: reviewTokens.card,
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 24,
          gap: 16,
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
            name={name}
            email={email}
            imageUrl={imageUrl}
            size={112}
            variant="brand"
          />
        </View>

        <View className="items-center" style={{gap: 4, width: '100%'}}>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 26,
              lineHeight: 34,
              letterSpacing: -0.52,
              fontWeight: '700',
              color: libraryTokens.ink,
              textAlign: 'center',
            }}
            numberOfLines={2}>
            {name}
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              lineHeight: 22,
              color: libraryTokens.muted,
              textAlign: 'center',
            }}
            numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>
    </SilhouetteCard>
  );
}
