import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {View} from 'react-native';
import {ErrorBoundary} from '../components/ui/ErrorBoundary';
import {FloatingTabBar, type TabItem} from '../components/ui/FloatingTabBar';
import {HomeStack} from './HomeStack';
import {LibraryStack} from './LibraryStack';
import {ProgressStack} from './ProgressStack';
import {ReviewStack} from './ReviewStack';
import type {MainTabParamList, ProfileRoutesParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ITEMS: TabItem[] = [
  {key: 'Home', label: 'Home', icon: 'home'},
  {key: 'Library', label: 'Library', icon: 'collections-bookmark'},
  {key: 'Review', label: 'Review', icon: 'menu-book'},
  {key: 'Progress', label: 'Progress', icon: 'insights'},
];

/** Nested stack screens where the floating tab bar should not show. */
const HIDDEN_TAB_ROUTES = new Set([
  'ReviewSession',
  'GenerateCards',
  'EditCard',
  'CreateDeck',
  'EditDeck',
  'StudyPlanner',
  'QuizSession',
]);

const PROFILE_ROUTES = new Set<keyof ProfileRoutesParamList>([
  'ProfileHome',
  'Settings',
  'EditProfile',
  'PrivacyPolicy',
  'TermsOfService',
  'DataHandling',
]);

function MainTabBar({state, navigation}: BottomTabBarProps) {
  const route = state.routes[state.index];
  const focusedRouteName =
    getFocusedRouteNameFromRoute(route) ?? route?.name ?? 'Home';

  const tabBarVisible = !HIDDEN_TAB_ROUTES.has(focusedRouteName);
  const activeKey = route?.name ?? 'Home';
  // Edit Profile / Privacy / Terms live under Settings — keep Settings highlighted,
  // not the underlying Home/Library/Review/Progress tab.
  const settingsActive = PROFILE_ROUTES.has(
    focusedRouteName as keyof ProfileRoutesParamList,
  );

  const tabRootScreen = (tabName: string) =>
    tabName === 'Home'
      ? 'HomeHome'
      : tabName === 'Library'
        ? 'DeckList'
        : tabName === 'Review'
          ? 'ReviewHome'
          : 'ProgressHome';

  return (
    <FloatingTabBar
      tabs={TAB_ITEMS}
      activeKey={activeKey}
      settingsActive={settingsActive}
      visible={tabBarVisible}
      onSettingsPress={() => {
        const currentTab = activeKey as keyof MainTabParamList;
        if (focusedRouteName === 'Settings') {
          return;
        }
        // Keep the tab root under Settings so Back returns here, not the prior tab.
        navigation.navigate(currentTab, {
          screen: 'Settings',
          initial: false,
        });
      }}
      onTabPress={key => {
        const target = state.routes.find(r => r.name === key);
        if (!target) return;

        const event = navigation.emit({
          type: 'tabPress',
          target: target.key,
          canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
          const nestedName =
            target.name === activeKey
              ? focusedRouteName
              : getFocusedRouteNameFromRoute(target);
          const onProfileRoute =
            nestedName &&
            PROFILE_ROUTES.has(nestedName as keyof ProfileRoutesParamList);

          // Leave Settings/Edit Profile/legal screens for the tab root — never
          // leave Home highlighted while still showing a settings screen.
          if (onProfileRoute) {
            navigation.navigate(target.name, {
              screen: tabRootScreen(target.name),
            });
            return;
          }

          navigation.navigate(target.name);
        }
      }}
    />
  );
}

export function MainTabs() {
  return (
    <View className="flex-1 bg-background">
      <Tab.Navigator
        tabBar={MainTabBar}
        screenOptions={{
          headerShown: false,
          lazy: false,
          freezeOnBlur: true,
        }}>
        <Tab.Screen name="Home">
          {() => (
            <ErrorBoundary title="Home unavailable">
              <HomeStack />
            </ErrorBoundary>
          )}
        </Tab.Screen>
        <Tab.Screen name="Library">
          {() => (
            <ErrorBoundary title="Library unavailable">
              <LibraryStack />
            </ErrorBoundary>
          )}
        </Tab.Screen>
        <Tab.Screen name="Review">
          {() => (
            <ErrorBoundary title="Review unavailable">
              <ReviewStack />
            </ErrorBoundary>
          )}
        </Tab.Screen>
        <Tab.Screen name="Progress">
          {() => (
            <ErrorBoundary title="Progress unavailable">
              <ProgressStack />
            </ErrorBoundary>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}
