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
import type {MainTabParamList} from './types';

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

function MainTabBar({state, navigation}: BottomTabBarProps) {
  const route = state.routes[state.index];
  const focusedRouteName =
    getFocusedRouteNameFromRoute(route) ?? route?.name ?? 'Home';

  if (HIDDEN_TAB_ROUTES.has(focusedRouteName)) {
    return null;
  }

  const activeKey = route?.name ?? 'Home';

  return (
    <FloatingTabBar
      tabs={TAB_ITEMS}
      activeKey={activeKey}
      onTabPress={key => {
        const target = state.routes.find(r => r.name === key);
        if (!target) return;

        const event = navigation.emit({
          type: 'tabPress',
          target: target.key,
          canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
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
        tabBar={props => <MainTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          lazy: true,
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
