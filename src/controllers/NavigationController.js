import { Alert, Linking, DeviceEventEmitter } from 'react-native';
import { launchNavigator } from 'react-native-launch-navigator';

class NavigationController {
  constructor(mainApp) {
    this.mainApp = mainApp;
    this.installedApps = [];
  }

  async handleNavigationCommand(command) {
    console.log('Navigation command:', command);

    try {
      if (command.includes('open') && (command.includes('app') || command.includes('application'))) {
        await this.handleOpenApp(command);
      }
      else if (command.includes('navigate') || command.includes('directions') || command.includes('map')) {
        await this.handleNavigation(command);
      }
      else if (command.includes('go to') && !command.includes('website')) {
        await this.handleNavigation(command);
      }
      else if (command.includes('settings')) {
        await this.openSettings(command);
      }
      else if (command.includes('home screen') || command.includes('launcher')) {
        await this.goToHomeScreen();
      }
      else if (command.includes('back') || command.includes('previous')) {
        await this.goBack();
      }
      else if (command.includes('recent apps') || command.includes('task switcher')) {
        await this.openRecentApps();
      }
      else if (command.includes('notifications')) {
        await this.openNotifications();
      }
      else {
        this.mainApp.speak("I didn't understand the navigation command. Try saying 'open app', 'navigate to', or 'go to settings'");
      }
    } catch (error) {
      console.error('Navigation command error:', error);
      this.mainApp.speak("Sorry, there was an error with navigation. Please try again.");
    }
  }

  async handleOpenApp(command) {
    try {
      const appName = this.extractAppName(command);
      
      if (!appName) {
        this.mainApp.speak("Which app would you like to open?");
        return;
      }

      this.mainApp.speak(`Opening ${appName}`);
      
      // Try common app schemes
      const success = await this.tryOpenApp(appName);
      
      if (!success) {
        this.mainApp.speak(`I couldn't find an app called ${appName}. Please make sure it's installed.`);
      }
    } catch (error) {
      console.error('Open app error:', error);
      this.mainApp.speak("Error opening the app");
    }
  }

  async tryOpenApp(appName) {
    const appNameLower = appName.toLowerCase();
    
    // Common app URL schemes
    const appSchemes = {
      'whatsapp': 'whatsapp://',
      'facebook': 'fb://',
      'instagram': 'instagram://',
      'twitter': 'twitter://',
      'youtube': 'youtube://',
      'gmail': 'googlegmail://',
      'maps': 'maps://',
      'google maps': 'comgooglemaps://',
      'spotify': 'spotify://',
      'netflix': 'nflx://',
      'uber': 'uber://',
      'messenger': 'fb-messenger://',
      'telegram': 'tg://',
      'amazon': 'com.amazon.mShop.android.shopping://',
      'camera': 'camera://',
      'gallery': 'content://media/internal/images/media',
      'contacts': 'content://contacts/people/',
      'calculator': 'calculator://',
      'calendar': 'calshow://',
      'notes': 'mobilenotes://',
      'clock': 'clock://',
      'weather': 'weather://'
    };

    // Try exact match first
    if (appSchemes[appNameLower]) {
      try {
        const canOpen = await Linking.canOpenURL(appSchemes[appNameLower]);
        if (canOpen) {
          await Linking.openURL(appSchemes[appNameLower]);
          return true;
        }
      } catch (error) {
        console.log(`Could not open ${appNameLower} with scheme`);
      }
    }

    // Try partial matches
    for (const [key, scheme] of Object.entries(appSchemes)) {
      if (appNameLower.includes(key) || key.includes(appNameLower)) {
        try {
          const canOpen = await Linking.canOpenURL(scheme);
          if (canOpen) {
            await Linking.openURL(scheme);
            return true;
          }
        } catch (error) {
          console.log(`Could not open ${key} with scheme`);
        }
      }
    }

    // Try opening through system app launcher (Android)
    try {
      const packageName = this.getPackageName(appNameLower);
      if (packageName) {
        const intent = `intent://launch/#Intent;package=${packageName};end`;
        await Linking.openURL(intent);
        return true;
      }
    } catch (error) {
      console.log('Could not open with package name');
    }

    return false;
  }

  getPackageName(appName) {
    const packageNames = {
      'whatsapp': 'com.whatsapp',
      'facebook': 'com.facebook.katana',
      'instagram': 'com.instagram.android',
      'twitter': 'com.twitter.android',
      'youtube': 'com.google.android.youtube',
      'gmail': 'com.google.android.gm',
      'chrome': 'com.android.chrome',
      'maps': 'com.google.android.apps.maps',
      'spotify': 'com.spotify.music',
      'netflix': 'com.netflix.mediaclient',
      'uber': 'com.ubercab',
      'messenger': 'com.facebook.orca',
      'telegram': 'org.telegram.messenger',
      'amazon': 'com.amazon.mShop.android.shopping'
    };

    return packageNames[appName] || null;
  }

  extractAppName(command) {
    // Remove common words
    let cleaned = command.toLowerCase();
    const removeWords = ['open', 'app', 'application', 'the', 'please', 'can you', 'launch'];
    
    removeWords.forEach(word => {
      cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    });
    
    return cleaned.trim();
  }

  async handleNavigation(command) {
    try {
      const destination = this.extractDestination(command);
      
      if (!destination) {
        this.mainApp.speak("Where would you like to navigate to?");
        return;
      }

      this.mainApp.speak(`Getting directions to ${destination}`);
      
      // Try using the launch-navigator library
      try {
        await launchNavigator.navigate(destination);
      } catch (error) {
        // Fallback to opening maps with query
        const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(destination)}`;
        const canOpenMaps = await Linking.canOpenURL(mapsUrl);
        
        if (canOpenMaps) {
          await Linking.openURL(mapsUrl);
        } else {
          this.mainApp.speak("Unable to open navigation. Please install a maps app.");
        }
      }
    } catch (error) {
      console.error('Navigation error:', error);
      this.mainApp.speak("Error opening navigation");
    }
  }

  extractDestination(command) {
    let cleaned = command.toLowerCase();
    const removeWords = ['navigate', 'directions', 'to', 'go', 'take me', 'drive', 'map', 'maps'];
    
    removeWords.forEach(word => {
      cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    });
    
    return cleaned.trim();
  }

  async openSettings(command) {
    try {
      if (command.includes('wifi') || command.includes('wi-fi')) {
        this.mainApp.speak("Opening WiFi settings");
        await Linking.openSettings();
      } else if (command.includes('bluetooth')) {
        this.mainApp.speak("Opening Bluetooth settings");
        await Linking.openSettings();
      } else if (command.includes('display') || command.includes('brightness')) {
        this.mainApp.speak("Opening display settings");
        await Linking.openSettings();
      } else if (command.includes('sound') || command.includes('volume')) {
        this.mainApp.speak("Opening sound settings");
        await Linking.openSettings();
      } else {
        this.mainApp.speak("Opening device settings");
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Settings error:', error);
      this.mainApp.speak("Error opening settings");
    }
  }

  async goToHomeScreen() {
    try {
      this.mainApp.speak("Going to home screen");
      
      // This is device-specific and requires system-level access
      // In practice, users would need to use the home button
      this.mainApp.speak("Please press the home button to go to home screen");
    } catch (error) {
      console.error('Home screen error:', error);
      this.mainApp.speak("Error going to home screen");
    }
  }

  async goBack() {
    try {
      this.mainApp.speak("Going back");
      
      // This would typically use the navigation stack in React Native
      // For system-level back, users need to use back button
      this.mainApp.speak("Please use the back button or back gesture");
    } catch (error) {
      console.error('Go back error:', error);
      this.mainApp.speak("Error going back");
    }
  }

  async openRecentApps() {
    try {
      this.mainApp.speak("Opening recent apps");
      
      // This requires system-level access
      this.mainApp.speak("Please use the recent apps button or gesture");
    } catch (error) {
      console.error('Recent apps error:', error);
      this.mainApp.speak("Error opening recent apps");
    }
  }

  async openNotifications() {
    try {
      this.mainApp.speak("Opening notifications");
      
      // This requires system-level access
      this.mainApp.speak("Please swipe down from the top to see notifications");
    } catch (error) {
      console.error('Notifications error:', error);
      this.mainApp.speak("Error opening notifications");
    }
  }

  // Utility functions for common navigation tasks
  async openUrl(url) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Open URL error:', error);
      return false;
    }
  }

  async searchWeb(query) {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      this.mainApp.speak(`Searching for ${query}`);
      await this.openUrl(searchUrl);
    } catch (error) {
      console.error('Web search error:', error);
      this.mainApp.speak("Error performing web search");
    }
  }

  // Quick actions for accessibility
  async quickAction(action) {
    switch (action.toLowerCase()) {
      case 'emergency':
        this.mainApp.emergencyController.handleEmergencyCommand('emergency');
        break;
      case 'flashlight':
        this.mainApp.deviceController.handleFlashlight('toggle');
        break;
      case 'call':
        this.mainApp.speak("Who would you like to call?");
        break;
      case 'message':
        this.mainApp.speak("Who would you like to message?");
        break;
      default:
        this.mainApp.speak(`Unknown quick action: ${action}`);
    }
  }
}

export default NavigationController;
