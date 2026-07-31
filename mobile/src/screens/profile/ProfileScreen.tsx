import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Pressable, ScrollView, Text, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ProfileHeroCard} from '../../components/profile/ProfileHeroCard';
import {ProfileScreenHeader} from '../../components/profile/ProfileScreenHeader';
import {ProfileStatTile} from '../../components/profile/ProfileStatTile';
import {
  SettingsCardDivider,
  SettingsSectionCard,
} from '../../components/profile/SettingsSectionCard';
import {SettingsLinkRow} from '../../components/profile/SettingsRows';
import {SilhouetteCard} from '../../components/ui/SilhouetteCard';
import {colors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {reviewTokens} from '../../config/reviewTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useDecks} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {useReviewQueue} from '../../hooks/useReviews';
import type {LibraryStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'ProfileHome'>;

export function ProfileScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const {openSettings, openEditProfile, openDataHandling} = useProfileNavigation();
  const {user} = useAppUser();
  const {data: decks = []} = useDecks();
  const {data: queue = []} = useReviewQueue();

  const deckCount = decks.length;
  const dueCount = queue.length;
  const displayName = user?.name?.trim() || 'Flipwise learner';

  const settingsButton = (
    <Pressable
      onPress={openSettings}
      hitSlop={8}
      accessibilityLabel="Settings"
      accessibilityRole="button"
      className="active:opacity-70"
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceContainer,
        borderWidth: 1,
        borderColor: libraryTokens.border,
      }}>
      <MaterialIcons name="settings" size={22} color={libraryTokens.ink} />
    </Pressable>
  );

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <ProfileScreenHeader
        title="Profile"
        onBack={() => navigation.goBack()}
        right={settingsButton}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.horizontalPadding,
          paddingTop: 24,
          paddingBottom: layout.tabScrollBottomPadding + 24,
          gap: layout.sectionGap,
          maxWidth: libraryTokens.contentMaxWidthWide,
          width: '100%',
          alignSelf: 'center',
        }}>
        <ProfileHeroCard
          name={displayName}
          email={user?.email ?? ''}
          imageUrl={user?.avatarUrl}
        />

        <SilhouetteCard variant="review">
          <View
            className="flex-row"
            style={{
              borderRadius: reviewTokens.cardRadius,
              borderWidth: 1,
              borderColor: reviewTokens.border,
              backgroundColor: reviewTokens.card,
              paddingVertical: 20,
              paddingHorizontal: 12,
            }}>
            <ProfileStatTile label="Decks" value={deckCount} accent="brand" />
            <View style={{width: 1, backgroundColor: libraryTokens.border}} />
            <ProfileStatTile
              label="Due now"
              value={dueCount}
              accent={dueCount > 0 ? 'danger' : 'default'}
            />
            <View style={{width: 1, backgroundColor: libraryTokens.border}} />
            <ProfileStatTile
              label="Cards"
              value={decks.reduce((sum, deck) => sum + deck.cardCount, 0)}
            />
          </View>
        </SilhouetteCard>

        <View style={{gap: 8}}>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              lineHeight: 22,
              color: libraryTokens.muted,
              paddingHorizontal: 4,
            }}>
            Manage your account, study preferences, and privacy settings.
          </Text>
        </View>

        <SettingsSectionCard title="Account">
          <SettingsLinkRow
            label="Edit profile"
            icon="person"
            onPress={openEditProfile}
          />
          <SettingsCardDivider />
          <SettingsLinkRow
            label="Settings"
            icon="settings"
            onPress={openSettings}
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="Privacy">
          <SettingsLinkRow
            label="Data & privacy"
            icon="shield"
            onPress={openDataHandling}
          />
        </SettingsSectionCard>
      </ScrollView>
    </View>
  );
}
