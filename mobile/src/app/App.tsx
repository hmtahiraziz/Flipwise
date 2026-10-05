import {AppProviders} from './AppProviders';
import {assertReleaseConfig} from '../config/assertReleaseConfig';
import {RootNavigator} from '../navigation/RootNavigator';

assertReleaseConfig();

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
