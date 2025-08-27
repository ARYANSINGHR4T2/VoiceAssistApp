import { Alert, PermissionsAndroid, Platform, Linking } from 'react-native';
import Contacts from 'react-native-contacts';
import CallLogs from 'react-native-call-log';
import AsyncStorage from '@react-native-async-storage/async-storage';

class CommunicationController {
  constructor(mainApp) {
    this.mainApp = mainApp;
    this.contacts = [];
    this.emergencyContacts = [];
    this.lastDialedNumber = null;
  }

  async handleCommunicationCommand(command) {
    console.log('Communication command:', command);

    try {
      if (command.includes('call')) {
        await this.handlePhoneCall(command);
      }
      else if (command.includes('message') || command.includes('text') || command.includes('sms')) {
        await this.handleTextMessage(command);
      }
      else if (command.includes('redial') || command.includes('call back')) {
        await this.redialLastNumber();
      }
      else if (command.includes('voicemail')) {
        await this.checkVoicemail();
      }
      else if (command.includes('contacts') || command.includes('find contact')) {
        await this.handleContactSearch(command);
      }
      else if (command.includes('add contact')) {
        await this.handleAddContact(command);
      }
      else if (command.includes('recent calls') || command.includes('call log')) {
        await this.getRecentCalls();
      }
      else {
        this.mainApp.speak("I didn't understand the communication command. Try saying 'call someone', 'send message', or 'recent calls'");
      }
    } catch (error) {
      console.error('Communication command error:', error);
      this.mainApp.speak("Sorry, there was an error with the communication function. Please try again.");
    }
  }

  async handlePhoneCall(command) {
    try {
      // Check permissions
      const hasCallPermission = await this.checkPhonePermission();
      if (!hasCallPermission) {
        this.mainApp.speak("Phone permission is required to make calls");
        return;
      }

      // Extract contact name or number from command
      let contactInfo = this.extractContactFromCommand(command, 'call');
      
      if (!contactInfo) {
        this.mainApp.speak("Who would you like to call?");
        return;
      }

      // Emergency numbers
      if (this.isEmergencyNumber(contactInfo)) {
        await this.makeEmergencyCall(contactInfo);
        return;
      }

      // Find contact
      const contact = await this.findContact(contactInfo);
      
      if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        const phoneNumber = contact.phoneNumbers[0].number;
        await this.makeCall(phoneNumber, contact.displayName);
      } else if (this.isPhoneNumber(contactInfo)) {
        await this.makeCall(contactInfo);
      } else {
        this.mainApp.speak(`I couldn't find a contact named ${contactInfo}. Please try again or say the phone number.`);
      }
    } catch (error) {
      console.error('Phone call error:', error);
      this.mainApp.speak("Error making phone call");
    }
  }

  async makeCall(phoneNumber, contactName = null) {
    try {
      this.lastDialedNumber = phoneNumber;
      const displayName = contactName || phoneNumber;
      
      this.mainApp.speak(`Calling ${displayName}`);
      
      const phoneUrl = `tel:${phoneNumber}`;
      const canCall = await Linking.canOpenURL(phoneUrl);
      
      if (canCall) {
        await Linking.openURL(phoneUrl);
      } else {
        this.mainApp.speak("Unable to make phone calls on this device");
      }
    } catch (error) {
      console.error('Make call error:', error);
      this.mainApp.speak("Error making the call");
    }
  }

  async makeEmergencyCall(number) {
    try {
      this.mainApp.speak(`Making emergency call to ${number}. Stay calm.`);
      
      const phoneUrl = `tel:${number}`;
      await Linking.openURL(phoneUrl);
      
      // Log emergency call
      await this.logEmergencyCall(number);
    } catch (error) {
      console.error('Emergency call error:', error);
      this.mainApp.speak("Error making emergency call");
    }
  }

  async handleTextMessage(command) {
    try {
      // Check SMS permission
      const hasSmsPermission = await this.checkSmsPermission();
      if (!hasSmsPermission) {
        this.mainApp.speak("SMS permission is required to send messages");
        return;
      }

      // Extract contact and message from command
      let contactInfo = this.extractContactFromCommand(command, 'message');
      
      if (!contactInfo) {
        this.mainApp.speak("Who would you like to send a message to?");
        return;
      }

      // Find contact
      const contact = await this.findContact(contactInfo);
      
      if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        const phoneNumber = contact.phoneNumbers[0].number;
        this.mainApp.speak("What message would you like to send?");
        // In a real implementation, you'd wait for the next voice input
        await this.openMessaging(phoneNumber, contact.displayName);
      } else if (this.isPhoneNumber(contactInfo)) {
        await this.openMessaging(contactInfo);
      } else {
        this.mainApp.speak(`I couldn't find a contact named ${contactInfo}. Please try again or say the phone number.`);
      }
    } catch (error) {
      console.error('Text message error:', error);
      this.mainApp.speak("Error sending text message");
    }
  }

  async openMessaging(phoneNumber, contactName = null) {
    try {
      const displayName = contactName || phoneNumber;
      this.mainApp.speak(`Opening messaging for ${displayName}`);
      
      const smsUrl = `sms:${phoneNumber}`;
      const canOpenSms = await Linking.canOpenURL(smsUrl);
      
      if (canOpenSms) {
        await Linking.openURL(smsUrl);
      } else {
        this.mainApp.speak("Unable to open messaging on this device");
      }
    } catch (error) {
      console.error('Open messaging error:', error);
      this.mainApp.speak("Error opening messaging");
    }
  }

  async redialLastNumber() {
    try {
      if (this.lastDialedNumber) {
        this.mainApp.speak("Redialing last number");
        await this.makeCall(this.lastDialedNumber);
      } else {
        // Try to get last number from call log
        const recentCalls = await this.getCallLog();
        if (recentCalls && recentCalls.length > 0) {
          const lastCall = recentCalls[0];
          await this.makeCall(lastCall.phoneNumber);
        } else {
          this.mainApp.speak("No recent calls found to redial");
        }
      }
    } catch (error) {
      console.error('Redial error:', error);
      this.mainApp.speak("Error redialing number");
    }
  }

  async checkVoicemail() {
    try {
      this.mainApp.speak("Checking voicemail");
      
      // Most carriers use a standard voicemail number
      const voicemailUrl = "tel:*86";
      await Linking.openURL(voicemailUrl);
    } catch (error) {
      console.error('Voicemail error:', error);
      this.mainApp.speak("Error accessing voicemail");
    }
  }

  async handleContactSearch(command) {
    try {
      const searchTerm = this.extractContactFromCommand(command, 'find');
      
      if (!searchTerm) {
        this.mainApp.speak("What contact would you like to find?");
        return;
      }

      const contact = await this.findContact(searchTerm);
      
      if (contact) {
        const phoneInfo = contact.phoneNumbers && contact.phoneNumbers.length > 0 
          ? contact.phoneNumbers[0].number 
          : "No phone number";
        
        this.mainApp.speak(`Found ${contact.displayName}. Phone: ${phoneInfo}`);
      } else {
        this.mainApp.speak(`No contact found for ${searchTerm}`);
      }
    } catch (error) {
      console.error('Contact search error:', error);
      this.mainApp.speak("Error searching contacts");
    }
  }

  async handleAddContact(command) {
    try {
      this.mainApp.speak("Opening contacts app to add a new contact");
      
      // Open contacts app
      const contactsUrl = "content://contacts/people/";
      const canOpen = await Linking.canOpenURL(contactsUrl);
      
      if (canOpen) {
        await Linking.openURL(contactsUrl);
      } else {
        // Fallback to general phone app
        await Linking.openURL("tel:");
      }
    } catch (error) {
      console.error('Add contact error:', error);
      this.mainApp.speak("Error opening contacts to add new contact");
    }
  }

  async getRecentCalls() {
    try {
      const hasCallLogPermission = await this.checkCallLogPermission();
      if (!hasCallLogPermission) {
        this.mainApp.speak("Call log permission is required to view recent calls");
        return;
      }

      const callLog = await this.getCallLog();
      
      if (callLog && callLog.length > 0) {
        const recentCount = Math.min(5, callLog.length);
        this.mainApp.speak(`Here are your ${recentCount} most recent calls:`);
        
        for (let i = 0; i < recentCount; i++) {
          const call = callLog[i];
          const contact = await this.findContactByNumber(call.phoneNumber);
          const displayName = contact ? contact.displayName : call.phoneNumber;
          const callType = this.getCallType(call.type);
          
          this.mainApp.speak(`${i + 1}: ${callType} ${displayName}`);
        }
      } else {
        this.mainApp.speak("No recent calls found");
      }
    } catch (error) {
      console.error('Recent calls error:', error);
      this.mainApp.speak("Error getting recent calls");
    }
  }

  async getCallLog() {
    try {
      if (Platform.OS === 'android') {
        const calls = await CallLogs.load(50);
        return calls;
      }
      return [];
    } catch (error) {
      console.error('Call log error:', error);
      return [];
    }
  }

  getCallType(type) {
    switch (type) {
      case 'INCOMING': return 'Incoming call from';
      case 'OUTGOING': return 'Call to';
      case 'MISSED': return 'Missed call from';
      default: return 'Call with';
    }
  }

  async findContact(searchTerm) {
    try {
      const hasContactsPermission = await this.checkContactsPermission();
      if (!hasContactsPermission) {
        return null;
      }

      if (this.contacts.length === 0) {
        this.contacts = await Contacts.getAll();
      }

      const searchLower = searchTerm.toLowerCase();
      const contact = this.contacts.find(c => 
        c.displayName.toLowerCase().includes(searchLower) ||
        (c.givenName && c.givenName.toLowerCase().includes(searchLower)) ||
        (c.familyName && c.familyName.toLowerCase().includes(searchLower))
      );

      return contact;
    } catch (error) {
      console.error('Find contact error:', error);
      return null;
    }
  }

  async findContactByNumber(phoneNumber) {
    try {
      if (this.contacts.length === 0) {
        this.contacts = await Contacts.getAll();
      }

      const contact = this.contacts.find(c => 
        c.phoneNumbers && c.phoneNumbers.some(p => 
          p.number.replace(/[^\d]/g, '') === phoneNumber.replace(/[^\d]/g, '')
        )
      );

      return contact;
    } catch (error) {
      console.error('Find contact by number error:', error);
      return null;
    }
  }

  extractContactFromCommand(command, action) {
    // Remove action words and common prefixes
    let cleaned = command.toLowerCase();
    
    const removeWords = [
      action, 'to', 'the', 'a', 'an', 'my', 'please', 'can you',
      'i want to', 'i need to', 'would you', 'could you'
    ];
    
    removeWords.forEach(word => {
      cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
    });
    
    cleaned = cleaned.trim();
    
    // If it looks like a phone number, return it
    if (this.isPhoneNumber(cleaned)) {
      return cleaned;
    }
    
    // Return the remaining text as contact name
    return cleaned || null;
  }

  isPhoneNumber(text) {
    const phoneRegex = /^[\+]?[1-9]?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(text.replace(/\s/g, ''));
  }

  isEmergencyNumber(number) {
    const emergencyNumbers = ['911', '112', '999', '000'];
    return emergencyNumbers.includes(number);
  }

  async logEmergencyCall(number) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = { number, timestamp, type: 'emergency' };
      
      const existingLogs = await AsyncStorage.getItem('emergency_calls') || '[]';
      const logs = JSON.parse(existingLogs);
      logs.push(logEntry);
      
      await AsyncStorage.setItem('emergency_calls', JSON.stringify(logs));
    } catch (error) {
      console.error('Log emergency call error:', error);
    }
  }

  async checkPhonePermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
        
        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE,
            {
              title: 'Phone Permission',
              message: 'VoiceAssist needs phone access to make calls',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch (error) {
        console.error('Phone permission check error:', error);
        return false;
      }
    }
    return true;
  }

  async checkSmsPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.SEND_SMS
        );
        
        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.SEND_SMS,
            {
              title: 'SMS Permission',
              message: 'VoiceAssist needs SMS access to send messages',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch (error) {
        console.error('SMS permission check error:', error);
        return false;
      }
    }
    return true;
  }

  async checkContactsPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );
        
        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
              title: 'Contacts Permission',
              message: 'VoiceAssist needs contacts access to find people to call',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch (error) {
        console.error('Contacts permission check error:', error);
        return false;
      }
    }
    return true;
  }

  async checkCallLogPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
        );
        
        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
            {
              title: 'Call Log Permission',
              message: 'VoiceAssist needs call log access to show recent calls',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch (error) {
        console.error('Call log permission check error:', error);
        return false;
      }
    }
    return true;
  }
}

export default CommunicationController;
