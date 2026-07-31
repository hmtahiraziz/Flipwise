import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View} from 'react-native';
import {ErrorBoundary} from '../components/ui/ErrorBoundary';
import {FloatingTabBar, type TabItem} from '../components/ui/FloatingTabBar';
import {LibraryStack} from './LibraryStack';
import {ProgressStack} from './ProgressStack';
import {ReviewStack} from './ReviewStack';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ITEMS: TabItem[] = [
  {key: 'Library', label: 'Library', icon: 'collections-bookmark'},
  {key: 'Review', label: 'Review', icon: 'psychology'},
  {key: 'Progress', label: 'Progress', icon: 'insights'},
];

function MainTabBar({state, navigation}: BottomTabBarProps) {
  const activeKey = state.routes[state.index]?.name ?? 'Library';

  return (
    <FloatingTabBar
      tabs={TAB_ITEMS}
      activeKey={activeKey}
      onTabPress={key => {
        const route = state.routes.find(r => r.name === key);
        if (!route) return;

        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
          navigation.navigate(route.name);
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
