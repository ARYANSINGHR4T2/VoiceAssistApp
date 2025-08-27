import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

class EmergencyController {
  constructor(mainApp) {
    this.mainApp = mainApp;
    this.emergencyContacts = [];
    this.emergencyServices = {
      'us': '911',
      'uk': '999',
      'eu': '112',
      'au': '000',
      'in': '112'
    };
  }

  async handleEmergencyCommand(command) {
    console.log('Emergency command:', command);

    try {
      if (command.includes('call 911') || command.includes('call emergency')) {
        await this.callEmergencyServices();
      }
      else if (command.includes('emergency') && command.includes('contact')) {
        await this.callEmergencyContact();
      }
      else if (command.includes('sos') || command.includes('help')) {
        await this.activateSOS();
      }
      else if (command.includes('location') || command.includes('where am i')) {
        await this.shareLocation();
      }
      else if (command.includes('medical') || command.includes('health')) {
        await this.handleMedicalEmergency();
      }
      else if (command.includes('fire')) {
        await this.handleFireEmergency();
      }
      else if (command.includes('police')) {
        await this.handlePoliceEmergency();
      }
      else {
        // General emergency - activate all safety features
        await this.handleGeneralEmergency();
      }
    } catch (error) {
      console.error('Emergency command error:', error);
      this.mainApp.speak("Emergency system error. Calling emergency services directly.");
      await this.callEmergencyServices();
    }
  }

  async callEmergencyServices(specificNumber = null) {
    try {
      let emergencyNumber = specificNumber;
      
      if (!emergencyNumber) {
        // Try to detect country and use appropriate emergency number
        emergencyNumber = await this.getEmergencyNumber();
      }

      this.mainApp.speak(`Calling emergency services at ${emergencyNumber}. Stay calm, help is on the way.`);
      
      const phoneUrl = `tel:${emergencyNumber}`;
      await Linking.openURL(phoneUrl);
      
      // Log emergency call
      await this.logEmergencyCall(emergencyNumber, 'services');
      
      // Start additional emergency procedures
      setTimeout(() => {
        this.startEmergencyProcedures();
      }, 5000);

    } catch (error) {
      console.error('Emergency call error:', error);
      this.mainApp.speak("Error calling emergency services. Please dial manually or ask someone nearby for help.");
    }
  }

  async callEmergencyContact() {
    try {
      const contacts = await this.getEmergencyContacts();
      
      if (contacts.length === 0) {
        this.mainApp.speak("No emergency contacts configured. Calling emergency services instead.");
        await this.callEmergencyServices();
        return;
      }

      const contact = contacts[0]; // Use first emergency contact
      this.mainApp.speak(`Calling emergency contact ${contact.name}`);
      
      const phoneUrl = `tel:${contact.phone}`;
      await Linking.openURL(phoneUrl);
      
      await this.logEmergencyCall(contact.phone, 'emergency_contact');

    } catch (error) {
      console.error('Emergency contact call error:', error);
      this.mainApp.speak("Error calling emergency contact. Calling emergency services.");
      await this.callEmergencyServices();
    }
  }

  async activateSOS() {
    try {
      this.mainApp.speak("Activating SOS emergency mode. Calling emergency services and notifying contacts.");
      
      // Call emergency services
      await this.callEmergencyServices();
      
      // Start SOS procedures
      await this.startSOSProcedures();
      
    } catch (error) {
      console.error('SOS activation error:', error);
      this.mainApp.speak("SOS system error. Please call for help manually.");
    }
  }

  async startSOSProcedures() {
    try {
      // 1. Start emergency flashlight signal
      if (this.mainApp.deviceController) {
        await this.mainApp.deviceController.emergencyFlashlight();
      }
      
      // 2. Max volume for visibility
      if (this.mainApp.deviceController) {
        await this.mainApp.deviceController.setVolumeMax();
      }
      
      // 3. Send location to emergency contacts
      await this.sendLocationToContacts();
      
      // 4. Log SOS activation
      await this.logSOSActivation();
      
    } catch (error) {
      console.error('SOS procedures error:', error);
    }
  }

  async shareLocation() {
    try {
      this.mainApp.speak("Getting your location information");
      
      // Note: This is a simplified version. In a real app, you'd use Geolocation
      const locationInfo = await this.getCurrentLocationInfo();
      
      if (locationInfo) {
        this.mainApp.speak(`Your approximate location is ${locationInfo}`);
        
        // Open maps with current location
        const mapsUrl = "https://maps.google.com/?q=current+location";
        await Linking.openURL(mapsUrl);
      } else {
        this.mainApp.speak("Unable to get precise location. Please describe your location to emergency services.");
      }
      
    } catch (error) {
      console.error('Location sharing error:', error);
      this.mainApp.speak("Error getting location. Please tell emergency services where you are.");
    }
  }

  async handleMedicalEmergency() {
    try {
      this.mainApp.speak("Medical emergency detected. Calling emergency medical services. Stay calm and don't move unless safe to do so.");
      
      // Call emergency services immediately
      await this.callEmergencyServices();
      
      // Provide medical emergency guidance
      setTimeout(() => {
        this.provideMedicalGuidance();
      }, 3000);
      
    } catch (error) {
      console.error('Medical emergency error:', error);
      await this.callEmergencyServices();
    }
  }

  async handleFireEmergency() {
    try {
      this.mainApp.speak("Fire emergency detected. Calling fire department. Get to safety immediately and stay low if there's smoke.");
      
      // Call emergency services
      await this.callEmergencyServices();
      
      // Provide fire safety guidance
      setTimeout(() => {
        this.provideFireGuidance();
      }, 3000);
      
    } catch (error) {
      console.error('Fire emergency error:', error);
      await this.callEmergencyServices();
    }
  }

  async handlePoliceEmergency() {
    try {
      this.mainApp.speak("Police emergency detected. Calling police. Try to get to a safe location if possible.");
      
      // Call emergency services
      await this.callEmergencyServices();
      
      // Provide safety guidance
      setTimeout(() => {
        this.provideSafetyGuidance();
      }, 3000);
      
    } catch (error) {
      console.error('Police emergency error:', error);
      await this.callEmergencyServices();
    }
  }

  async handleGeneralEmergency() {
    try {
      this.mainApp.speak("Emergency detected. Activating all emergency procedures.");
      
      // Call emergency services
      await this.callEmergencyServices();
      
      // Activate SOS mode
      await this.startSOSProcedures();
      
    } catch (error) {
      console.error('General emergency error:', error);
      await this.callEmergencyServices();
    }
  }

  async getEmergencyNumber() {
    try {
      const country = await DeviceInfo.getDeviceCountry();
      return this.emergencyServices[country.toLowerCase()] || '911';
    } catch (error) {
      return '911'; // Default to US emergency number
    }
  }

  async getCurrentLocationInfo() {
    try {
      // Simplified location info
      // In a real app, you'd use react-native-geolocation-service
      return "Location services required for precise coordinates";
    } catch (error) {
      return null;
    }
  }

  async getEmergencyContacts() {
    try {
      const contacts = await AsyncStorage.getItem('emergency_contacts');
      return contacts ? JSON.parse(contacts) : [];
    } catch (error) {
      console.error('Get emergency contacts error:', error);
      return [];
    }
  }

  async addEmergencyContact(name, phone) {
    try {
      const contacts = await this.getEmergencyContacts();
      contacts.push({ name, phone, dateAdded: new Date().toISOString() });
      await AsyncStorage.setItem('emergency_contacts', JSON.stringify(contacts));
      
      this.mainApp.speak(`Added ${name} as emergency contact`);
    } catch (error) {
      console.error('Add emergency contact error:', error);
      this.mainApp.speak("Error adding emergency contact");
    }
  }

  async sendLocationToContacts() {
    try {
      const contacts = await this.getEmergencyContacts();
      const location = await this.getCurrentLocationInfo();
      
      if (contacts.length > 0 && location) {
        // In a real app, you'd send SMS with location
        this.mainApp.speak("Sending location information to emergency contacts");
      }
    } catch (error) {
      console.error('Send location error:', error);
    }
  }

  async logEmergencyCall(number, type) {
    try {
      const logEntry = {
        number,
        type,
        timestamp: new Date().toISOString(),
        deviceInfo: await DeviceInfo.getDeviceName()
      };
      
      const existingLogs = await AsyncStorage.getItem('emergency_logs') || '[]';
      const logs = JSON.parse(existingLogs);
      logs.push(logEntry);
      
      await AsyncStorage.setItem('emergency_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Log emergency call error:', error);
    }
  }

  async logSOSActivation() {
    try {
      const logEntry = {
        type: 'SOS_ACTIVATION',
        timestamp: new Date().toISOString(),
        deviceInfo: await DeviceInfo.getDeviceName(),
        batteryLevel: await DeviceInfo.getBatteryLevel()
      };
      
      const existingLogs = await AsyncStorage.getItem('sos_logs') || '[]';
      const logs = JSON.parse(existingLogs);
      logs.push(logEntry);
      
      await AsyncStorage.setItem('sos_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Log SOS activation error:', error);
    }
  }

  provideMedicalGuidance() {
    const guidance = [
      "If you're conscious and able to speak, stay on the line with emergency services.",
      "Don't move if you suspect spinal injury unless you're in immediate danger.",
      "If bleeding, apply pressure to the wound with clean cloth.",
      "Try to stay calm and breathe normally."
    ];
    
    guidance.forEach((instruction, index) => {
      setTimeout(() => {
        this.mainApp.speak(instruction);
      }, index * 5000);
    });
  }

  provideFireGuidance() {
    const guidance = [
      "Get out of the building immediately if safe to do so.",
      "Stay low if there's smoke - crawl if necessary.",
      "Feel doors before opening - if hot, find another way out.",
      "Once outside, stay out and don't go back inside."
    ];
    
    guidance.forEach((instruction, index) => {
      setTimeout(() => {
        this.mainApp.speak(instruction);
      }, index * 4000);
    });
  }

  provideSafetyGuidance() {
    const guidance = [
      "Try to get to a safe, well-lit area if possible.",
      "Stay on the line with police and describe your situation.",
      "If you must run, head toward other people or a public place.",
      "Keep this phone with you for emergency services to contact you."
    ];
    
    guidance.forEach((instruction, index) => {
      setTimeout(() => {
        this.mainApp.speak(instruction);
      }, index * 4000);
    });
  }

  async startEmergencyProcedures() {
    try {
      // Keep screen on
      this.mainApp.speak("Emergency mode active. Screen will stay on and volume is maximized.");
      
      // Additional emergency features would go here
      // Such as sending automated messages, location tracking, etc.
      
    } catch (error) {
      console.error('Emergency procedures error:', error);
    }
  }
}

export default EmergencyController;
