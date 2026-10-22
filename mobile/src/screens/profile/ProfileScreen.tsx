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
import {brandColors, fonts} from '../../config/theme';
import {libraryTokens} from '../../config/libraryTokens';
import {useAppUser} from '../../hooks/useAppUser';
import {useDecks} from '../../hooks/useDecks';
import {useLibraryLayout} from '../../hooks/useLibraryLayout';
import {useProfileNavigation} from '../../hooks/useProfileNavigation';
import {useProfileStackBack} from '../../hooks/useProfileStackBack';
import {useProgressSummary} from '../../hooks/useProgress';
import {useReviewQueue} from '../../hooks/useReviews';
import type {ProfileRoutesParamList} from '../../navigation/types';
import {useTheme} from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<ProfileRoutesParamList, 'ProfileHome'>;

export function ProfileScreen({navigation}: Props) {
  const layout = useLibraryLayout();
  const onBack = useProfileStackBack(navigation);
  const {openSettings, openEditProfile, openDataHandling} =
    useProfileNavigation();
  const {user} = useAppUser();
  const {preferences} = useTheme();
  const {data: decks = []} = useDecks();
  const {data: queue = []} = useReviewQueue();
  const {data: summary} = useProgressSummary();

  const deckCount = decks.length;
  const dueCount = queue.length;
  const cardCount = decks.reduce((sum, deck) => sum + deck.cardCount, 0);
  const streak = summary?.currentStreak ?? 0;
  const reviewedToday = summary?.reviewedTodayCount ?? 0;
  const dailyGoal = preferences.dailyGoal;
  const displayName = user?.name?.trim() || 'Cardweave learner';
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
        backgroundColor: libraryTokens.surfaceContainerLow,
      }}>
      <MaterialIcons name="settings" size={22} color={libraryTokens.ink} />
    </Pressable>
  );

  return (
    <View className="flex-1" style={{backgroundColor: libraryTokens.background}}>
      <ProfileScreenHeader
        title="Profile"
        onBack={onBack}
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

        <View
          style={{
            backgroundColor: brandColors.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: libraryTokens.borderSubtle,
            paddingVertical: 16,
            paddingHorizontal: 8,
            flexDirection: 'row',
          }}>
          <ProfileStatTile label="Decks" value={deckCount} accent="brand" />
          <View style={{width: 1, backgroundColor: libraryTokens.border}} />
          <ProfileStatTile
            label="Due now"
            value={dueCount}
            accent={dueCount > 0 ? 'danger' : 'default'}
          />
          <View style={{width: 1, backgroundColor: libraryTokens.border}} />
          <ProfileStatTile label="Cards" value={cardCount} />
        </View>

        <View
          style={{
            backgroundColor: brandColors.surface,
            borderRadius: 20,
            padding: 16,
            gap: 12,
            borderWidth: 1,
            borderColor: libraryTokens.borderSubtle,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 16,
                color: libraryTokens.ink,
              }}>
              Study pulse
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: libraryTokens.secondaryContainer,
              }}>
              <MaterialIcons
                name="local-fire-department"
                size={14}
                color={libraryTokens.onSecondaryContainer}
              />
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 12,
                  color: libraryTokens.onSecondaryContainer,
                }}>
                {streak} day streak
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: libraryTokens.muted,
            }}>
            {reviewedToday} / {dailyGoal} cards toward today&apos;s goal
          </Text>
          <View
            style={{
              height: 8,
              borderRadius: 999,
              backgroundColor: libraryTokens.surfaceContainerLow,
              overflow: 'hidden',
            }}>
            <View
              style={{
                height: '100%',
                width: `${Math.min(
                  100,
                  Math.round((reviewedToday / Math.max(1, dailyGoal)) * 100),
                )}%`,
                backgroundColor: libraryTokens.primaryContainer,
                borderRadius: 999,
              }}
            />
          </View>
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
