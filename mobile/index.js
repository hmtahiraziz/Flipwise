/**
 * @format
 */

import './global.css';
import './src/auth/googleOAuth';
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import {AppRegistry, LogBox} from 'react-native';
import App from './src/app/App';
import {name as appName} from './app.json';

if (__DEV__) {
  LogBox.ignoreLogs(['Clerk: Clerk has been loaded with development keys']);

  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args
      .map(arg => (typeof arg === 'string' ? arg : ''))
      .join(' ');
    if (message.includes('Clerk has been loaded with development keys')) {
      return;
    }
    originalWarn(...args);
  };
}

AppRegistry.registerComponent(appName, () => App);
