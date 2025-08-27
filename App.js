import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  PermissionsAndroid,
  Platform,
  AppState,
  DeviceEventEmitter,
  BackHandler
} from 'react-native';

import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import CameraController from './src/controllers/CameraController';
import DeviceController from './src/controllers/DeviceController';
import CommunicationController from './src/controllers/CommunicationController';
import NavigationController from './src/controllers/NavigationController';
import EmergencyController from './src/controllers/EmergencyController';

class VoiceAssistApp extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      recognized: '',
      pitch: '',
      error: '',
      end: '',
      started: '',
      results: [],
      partialResults: [],
      isListening: false,
      isActive: true,
      lastCommand: '',
      confidence: 0
    };

    // Initialize controllers
    this.cameraController = new CameraController(this);
    this.deviceController = new DeviceController(this);
    this.communicationController = new CommunicationController(this);
    this.navigationController = new NavigationController(this);
    this.emergencyController = new EmergencyController(this);

    // Bind voice event handlers
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);

    // TTS Configuration
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
  }

  async componentDidMount() {
    await this.requestPermissions();
    await this.initializeTts();
    this.startContinuousListening();
    
    // Handle app state changes
    AppState.addEventListener('change', this.handleAppStateChange);
    
    // Handle back button press
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    
    // Welcome message
    this.speak("Voice Assistant is ready. Say 'Hey Assistant' to give me commands.");
  }

  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
    AppState.removeEventListener('change', this.handleAppStateChange);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      this.setState({ isActive: true });
      this.startContinuousListening();
    } else {
      this.setState({ isActive: false });
    }
  };

  handleBackPress = () => {
    // Prevent accidental app closing - require voice command
    this.speak("Say 'Exit App' to close the application");
    return true;
  };

  async requestPermissions() {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS
      ];

      try {
        const results = await PermissionsAndroid.requestMultiple(permissions);
        console.log('Permissions granted:', results);
      } catch (error) {
        console.error('Permission error:', error);
      }
    }
  }

  async initializeTts() {
    try {
      await Tts.getInitStatus();
    } catch (error) {
      console.error('TTS initialization error:', error);
    }
  }

  async startContinuousListening() {
    try {
      await Voice.start('en-US');
      this.setState({ isListening: true });
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      // Retry after 2 seconds
      setTimeout(() => this.startContinuousListening(), 2000);
    }
  }

  async stopListening() {
    try {
      await Voice.stop();
      this.setState({ isListening: false });
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  onSpeechStart = (e) => {
    this.setState({ started: '√' });
  };

  onSpeechRecognized = (e) => {
    this.setState({ recognized: '√' });
  };

  onSpeechEnd = (e) => {
    this.setState({ end: '√' });
    // Restart listening after a brief pause
    setTimeout(() => {
      if (this.state.isActive) {
        this.startContinuousListening();
      }
    }, 1000);
  };

  onSpeechError = (e) => {
    console.log('Speech error:', e.error);
    this.setState({ error: JSON.stringify(e.error) });
    // Restart listening on error
    setTimeout(() => {
      if (this.state.isActive) {
        this.startContinuousListening();
      }
    }, 1000);
  };

  onSpeechResults = (e) => {
    const results = e.value || [];
    this.setState({ results });
    
    if (results.length > 0) {
      const command = results[0].toLowerCase();
      this.processVoiceCommand(command);
    }
  };

  onSpeechPartialResults = (e) => {
    this.setState({ partialResults: e.value });
  };

  processVoiceCommand(command) {
    console.log('Processing command:', command);
    
    // Check for wake words
    const wakeWords = ['hey assistant', 'voice assistant', 'assistant'];
    const hasWakeWord = wakeWords.some(wake => command.includes(wake));
    
    if (!hasWakeWord && !this.state.lastCommand) {
      return; // Ignore commands without wake word
    }

    // Remove wake words from command
    let cleanCommand = command;
    wakeWords.forEach(wake => {
      cleanCommand = cleanCommand.replace(wake, '').trim();
    });

    this.setState({ lastCommand: cleanCommand });

    // Process different types of commands
    if (this.isEmergencyCommand(cleanCommand)) {
      this.emergencyController.handleEmergencyCommand(cleanCommand);
    } else if (this.isCameraCommand(cleanCommand)) {
      this.cameraController.handleCameraCommand(cleanCommand);
    } else if (this.isDeviceCommand(cleanCommand)) {
      this.deviceController.handleDeviceCommand(cleanCommand);
    } else if (this.isCommunicationCommand(cleanCommand)) {
      this.communicationController.handleCommunicationCommand(cleanCommand);
    } else if (this.isNavigationCommand(cleanCommand)) {
      this.navigationController.handleNavigationCommand(cleanCommand);
    } else if (this.isAppCommand(cleanCommand)) {
      this.handleAppCommand(cleanCommand);
    } else if (cleanCommand) {
      this.speak(`I didn't understand the command: ${cleanCommand}. Please try again.`);
    }
  }

  isEmergencyCommand(command) {
    const emergencyWords = ['emergency', 'help', 'call 911', 'call emergency', 'urgent'];
    return emergencyWords.some(word => command.includes(word));
  }

  isCameraCommand(command) {
    const cameraWords = ['camera', 'photo', 'picture', 'record', 'video', 'selfie'];
    return cameraWords.some(word => command.includes(word));
  }

  isDeviceCommand(command) {
    const deviceWords = ['flashlight', 'torch', 'volume', 'brightness', 'wifi', 'airplane'];
    return deviceWords.some(word => command.includes(word));
  }

  isCommunicationCommand(command) {
    const commWords = ['call', 'text', 'message', 'sms', 'phone', 'contact'];
    return commWords.some(word => command.includes(word));
  }

  isNavigationCommand(command) {
    const navWords = ['navigate', 'directions', 'map', 'location', 'gps'];
    return navWords.some(word => command.includes(word));
  }

  isAppCommand(command) {
    const appWords = ['exit', 'close', 'quit', 'open app', 'launch'];
    return appWords.some(word => command.includes(word));
  }

  handleAppCommand(command) {
    if (command.includes('exit') || command.includes('close') || command.includes('quit')) {
      this.speak("Goodbye! Voice Assistant is closing.");
      setTimeout(() => BackHandler.exitApp(), 2000);
    }
  }

  speak(text) {
    console.log('Speaking:', text);
    Tts.speak(text);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>VoiceAssist</Text>
        <Text style={styles.subtitle}>Hands-Free Mobile Assistant</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.status}>
            Listening: {this.state.isListening ? '🎤' : '⏸️'}
          </Text>
          <Text style={styles.status}>
            Status: {this.state.isActive ? 'Active' : 'Background'}
          </Text>
        </View>

        <View style={styles.commandContainer}>
          <Text style={styles.commandTitle}>Last Command:</Text>
          <Text style={styles.commandText}>
            {this.state.lastCommand || 'Say "Hey Assistant" to start'}
          </Text>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Voice Commands:</Text>
          <Text style={styles.instruction}>📸 "Take a photo" / "Start recording"</Text>
          <Text style={styles.instruction}>💡 "Turn on flashlight" / "Turn off flashlight"</Text>
          <Text style={styles.instruction}>📞 "Call [contact name]"</Text>
          <Text style={styles.instruction}>💬 "Send message to [contact]"</Text>
          <Text style={styles.instruction}>🚨 "Emergency" / "Call 911"</Text>
          <Text style={styles.instruction}>📱 "Open [app name]"</Text>
          <Text style={styles.instruction}>🔊 "Volume up" / "Volume down"</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 30,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  status: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 5,
  },
  commandContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    minWidth: 300,
  },
  commandTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commandText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  instructionsContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  instruction: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
    paddingLeft: 10,
  },
});

export default VoiceAssistApp;
