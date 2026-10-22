import {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppProviders} from './AppProviders';
import {validateReleaseConfig} from '../config/assertReleaseConfig';
import {RootNavigator} from '../navigation/RootNavigator';
import {ConfigErrorScreen} from '../screens/auth/ConfigErrorScreen';

const releaseConfig = validateReleaseConfig();

export default function App() {
  useEffect(() => {
    for (const warning of releaseConfig.warnings) {
      console.warn(`[Cardweave] ${warning}`);
    }
  }, []);

  if (releaseConfig.errors.length > 0) {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <ConfigErrorScreen
            title="Release configuration invalid"
            message={releaseConfig.errors.join('\n\n')}
          />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
