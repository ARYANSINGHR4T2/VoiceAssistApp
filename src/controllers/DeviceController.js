import { Alert, PermissionsAndroid, Platform, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';

class DeviceController {
  constructor(mainApp) {
    this.mainApp = mainApp;
    this.flashlightOn = false;
    this.currentVolume = 0.5;
  }

  async handleDeviceCommand(command) {
    console.log('Device command:', command);

    try {
      if (command.includes('flashlight') || command.includes('torch')) {
        await this.handleFlashlight(command);
      }
      else if (command.includes('volume')) {
        await this.handleVolume(command);
      }
      else if (command.includes('brightness')) {
        await this.handleBrightness(command);
      }
      else if (command.includes('wifi') || command.includes('wi-fi')) {
        await this.handleWifi(command);
      }
      else if (command.includes('bluetooth')) {
        await this.handleBluetooth(command);
      }
      else if (command.includes('airplane') || command.includes('flight mode')) {
        await this.handleAirplaneMode(command);
      }
      else if (command.includes('do not disturb') || command.includes('silent mode')) {
        await this.handleSilentMode(command);
      }
      else if (command.includes('screen') && (command.includes('on') || command.includes('off'))) {
        await this.handleScreenToggle(command);
      }
      else if (command.includes('battery')) {
        await this.getBatteryInfo();
      }
      else if (command.includes('device info')) {
        await this.getDeviceInfo();
      }
      else {
        this.mainApp.speak("I didn't understand the device command. Try saying 'turn on flashlight', 'volume up', or 'battery status'");
      }
    } catch (error) {
      console.error('Device command error:', error);
      this.mainApp.speak("Sorry, there was an error with the device function. Please try again.");
    }
  }

  async handleFlashlight(command) {
    try {
      if (command.includes('turn on') || command.includes('on')) {
        await this.turnOnFlashlight();
      } else if (command.includes('turn off') || command.includes('off')) {
        await this.turnOffFlashlight();
      } else if (command.includes('toggle')) {
        if (this.flashlightOn) {
          await this.turnOffFlashlight();
        } else {
          await this.turnOnFlashlight();
        }
      } else {
        this.mainApp.speak("Say 'turn on flashlight' or 'turn off flashlight'");
      }
    } catch (error) {
      console.error('Flashlight error:', error);
      this.mainApp.speak("Error controlling flashlight");
    }
  }

  async turnOnFlashlight() {
    try {
      // Note: Flashlight control requires native implementation
      // This is a placeholder - full flashlight control needs native modules
      this.flashlightOn = true;
      this.mainApp.speak("Flashlight command executed. Please enable flashlight manually or install flashlight control module.");
    } catch (error) {
      console.error('Turn on flashlight error:', error);
      this.mainApp.speak("Error turning on flashlight");
    }
  }

  async turnOffFlashlight() {
    try {
      // Note: Flashlight control requires native implementation
      this.flashlightOn = false;
      this.mainApp.speak("Flashlight off command executed. Please disable flashlight manually or install flashlight control module.");
    } catch (error) {
      console.error('Turn off flashlight error:', error);
      this.mainApp.speak("Error turning off flashlight");
    }
  }

  async handleVolume(command) {
    try {
      if (command.includes('up') || command.includes('increase') || command.includes('higher')) {
        await this.volumeUp();
      } else if (command.includes('down') || command.includes('decrease') || command.includes('lower')) {
        await this.volumeDown();
      } else if (command.includes('max') || command.includes('maximum')) {
        await this.setVolumeMax();
      } else if (command.includes('min') || command.includes('minimum') || command.includes('mute')) {
        await this.setVolumeMin();
      } else if (command.includes('set') || command.includes('to')) {
        // Extract number from command
        const match = command.match(/\d+/);
        if (match) {
          const level = parseInt(match[0]);
          await this.setVolume(level);
        }
      } else {
        await this.getVolumeInfo();
      }
    } catch (error) {
      console.error('Volume error:', error);
      this.mainApp.speak("Error controlling volume");
    }
  }

  async volumeUp() {
    try {
      const currentVolume = await VolumeManager.getVolume();
      const newVolume = Math.min(1.0, currentVolume + 0.1);
      await VolumeManager.setVolume(newVolume);
      this.currentVolume = newVolume;
      this.mainApp.speak(`Volume increased to ${Math.round(newVolume * 100)}%`);
    } catch (error) {
      console.error('Volume up error:', error);
      this.mainApp.speak("Error increasing volume");
    }
  }

  async volumeDown() {
    try {
      const currentVolume = await VolumeManager.getVolume();
      const newVolume = Math.max(0.0, currentVolume - 0.1);
      await VolumeManager.setVolume(newVolume);
      this.currentVolume = newVolume;
      this.mainApp.speak(`Volume decreased to ${Math.round(newVolume * 100)}%`);
    } catch (error) {
      console.error('Volume down error:', error);
      this.mainApp.speak("Error decreasing volume");
    }
  }

  async setVolumeMax() {
    try {
      await VolumeManager.setVolume(1.0);
      this.currentVolume = 1.0;
      this.mainApp.speak("Volume set to maximum");
    } catch (error) {
      console.error('Set max volume error:', error);
      this.mainApp.speak("Error setting maximum volume");
    }
  }

  async setVolumeMin() {
    try {
      await VolumeManager.setVolume(0.0);
      this.currentVolume = 0.0;
      this.mainApp.speak("Volume muted");
    } catch (error) {
      console.error('Set min volume error:', error);
      this.mainApp.speak("Error muting volume");
    }
  }

  async setVolume(percentage) {
    try {
      const volume = Math.min(100, Math.max(0, percentage)) / 100;
      await VolumeManager.setVolume(volume);
      this.currentVolume = volume;
      this.mainApp.speak(`Volume set to ${percentage}%`);
    } catch (error) {
      console.error('Set volume error:', error);
      this.mainApp.speak("Error setting volume");
    }
  }

  async getVolumeInfo() {
    try {
      const volume = await VolumeManager.getVolume();
      this.mainApp.speak(`Current volume is ${Math.round(volume * 100)}%`);
    } catch (error) {
      console.error('Get volume error:', error);
      this.mainApp.speak("Error getting volume information");
    }
  }

  async handleBrightness(command) {
    try {
      // Note: Brightness control requires system-level permissions
      // This is a basic implementation - full brightness control would need native modules
      if (command.includes('up') || command.includes('increase')) {
        this.mainApp.speak("Please increase brightness manually in settings");
      } else if (command.includes('down') || command.includes('decrease')) {
        this.mainApp.speak("Please decrease brightness manually in settings");
      } else {
        this.mainApp.speak("Brightness control requires manual adjustment in device settings");
      }
    } catch (error) {
      console.error('Brightness error:', error);
      this.mainApp.speak("Error with brightness control");
    }
  }

  async handleWifi(command) {
    try {
      if (command.includes('on') || command.includes('enable')) {
        this.mainApp.speak("Opening WiFi settings. Please enable WiFi manually");
        Linking.openSettings();
      } else if (command.includes('off') || command.includes('disable')) {
        this.mainApp.speak("Opening WiFi settings. Please disable WiFi manually");
        Linking.openSettings();
      } else {
        this.mainApp.speak("Opening WiFi settings");
        Linking.openSettings();
      }
    } catch (error) {
      console.error('WiFi error:', error);
      this.mainApp.speak("Error opening WiFi settings");
    }
  }

  async handleBluetooth(command) {
    try {
      if (command.includes('on') || command.includes('enable')) {
        this.mainApp.speak("Opening Bluetooth settings. Please enable Bluetooth manually");
        Linking.openSettings();
      } else if (command.includes('off') || command.includes('disable')) {
        this.mainApp.speak("Opening Bluetooth settings. Please disable Bluetooth manually");
        Linking.openSettings();
      } else {
        this.mainApp.speak("Opening Bluetooth settings");
        Linking.openSettings();
      }
    } catch (error) {
      console.error('Bluetooth error:', error);
      this.mainApp.speak("Error opening Bluetooth settings");
    }
  }

  async handleAirplaneMode(command) {
    try {
      this.mainApp.speak("Opening device settings. Please toggle airplane mode manually");
      Linking.openSettings();
    } catch (error) {
      console.error('Airplane mode error:', error);
      this.mainApp.speak("Error opening settings for airplane mode");
    }
  }

  async handleSilentMode(command) {
    try {
      if (command.includes('on') || command.includes('enable')) {
        await this.setVolumeMin();
        this.mainApp.speak("Device is now in silent mode");
      } else if (command.includes('off') || command.includes('disable')) {
        await this.setVolume(50);
        this.mainApp.speak("Silent mode disabled, volume restored");
      } else {
        this.mainApp.speak("Say 'enable silent mode' or 'disable silent mode'");
      }
    } catch (error) {
      console.error('Silent mode error:', error);
      this.mainApp.speak("Error controlling silent mode");
    }
  }

  async handleScreenToggle(command) {
    try {
      // Screen on/off requires system-level permissions and is security sensitive
      if (command.includes('off')) {
        this.mainApp.speak("Screen lock requires manual action for security. Please use the power button");
      } else {
        this.mainApp.speak("Screen is already on and you're using the app");
      }
    } catch (error) {
      console.error('Screen toggle error:', error);
      this.mainApp.speak("Error with screen control");
    }
  }

  async getBatteryInfo() {
    try {
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      const isCharging = await DeviceInfo.isBatteryCharging();
      
      const percentage = Math.round(batteryLevel * 100);
      const chargingStatus = isCharging ? "and charging" : "and not charging";
      
      this.mainApp.speak(`Battery is at ${percentage}% ${chargingStatus}`);
    } catch (error) {
      console.error('Battery info error:', error);
      this.mainApp.speak("Error getting battery information");
    }
  }

  async getDeviceInfo() {
    try {
      const deviceName = DeviceInfo.getDeviceNameSync();
      const systemVersion = DeviceInfo.getSystemVersion();
      const brand = DeviceInfo.getBrand();
      
      this.mainApp.speak(`Device: ${brand} ${deviceName}, System version: ${systemVersion}`);
    } catch (error) {
      console.error('Device info error:', error);
      this.mainApp.speak("Error getting device information");
    }
  }

  // Emergency flashlight SOS
  async emergencyFlashlight() {
    try {
      this.mainApp.speak("Starting emergency SOS flashlight signal");
      
      // SOS pattern: 3 short, 3 long, 3 short
      const shortFlash = 200;
      const longFlash = 600;
      const gap = 200;
      
      const sosPattern = [
        shortFlash, gap, shortFlash, gap, shortFlash, gap * 3,
        longFlash, gap, longFlash, gap, longFlash, gap * 3,
        shortFlash, gap, shortFlash, gap, shortFlash
      ];
      
      let index = 0;
      const flashSequence = () => {
        if (index < sosPattern.length) {
          const isFlashOn = index % 2 === 0;
          Torch.switchState(isFlashOn);
          
          setTimeout(() => {
            index++;
            flashSequence();
          }, sosPattern[index]);
        } else {
          Torch.switchState(false);
          this.flashlightOn = false;
          this.mainApp.speak("SOS signal complete");
        }
      };
      
      flashSequence();
    } catch (error) {
      console.error('Emergency flashlight error:', error);
      this.mainApp.speak("Error with emergency flashlight");
    }
  }

  // Get device status
  getDeviceStatus() {
    return {
      flashlightOn: this.flashlightOn,
      currentVolume: this.currentVolume,
    };
  }
}

export default DeviceController;
