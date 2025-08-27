/**
 * VoiceAssist - Hands-Free Mobile Assistant
 * Entry point for the React Native application
 */

import {AppRegistry} from 'react-native';
import VoiceAssistApp from './App';
import {name as appName} from './app.json';

// Register the main app component
AppRegistry.registerComponent(appName, () => VoiceAssistApp);

// Keep the app running in the background for voice recognition
AppRegistry.registerHeadlessTask('VoiceAssistBackground', () => require('./src/services/BackgroundService'));
