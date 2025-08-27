# VoiceAssist - Hands-Free Mobile Assistant

A comprehensive voice-controlled accessibility app designed specifically for people with no hands or limited hand mobility. This app enables complete hands-free control of mobile devices through voice commands, providing independence and accessibility in the digital world.

## 🌟 Features

### 📸 Camera & Photography
- **Voice-controlled camera**: "Take a photo", "Take a selfie"
- **Video recording**: "Start recording", "Stop recording"
- **Hands-free photo capture** with countdown timer
- **Multiple photo modes** (front/back camera, burst mode)

### 📱 Device Control  
- **Flashlight control**: "Turn on flashlight", "Turn off flashlight"
- **Volume control**: "Volume up", "Volume down", "Set volume to 50%"
- **Emergency SOS flashlight** with morse code pattern
- **Battery and device information**
- **Settings access** for WiFi, Bluetooth, etc.

### 📞 Communication
- **Voice-activated calling**: "Call [contact name]" or "Call [phone number]"
- **Text messaging**: "Send message to [contact]"
- **Emergency calling**: "Call 911", "Emergency"
- **Contact management**: Search and dial contacts by voice
- **Recent calls** and call log access

### 🧭 Navigation & Apps
- **App launching**: "Open WhatsApp", "Open Camera", etc.
- **Navigation**: "Navigate to [destination]"
- **Settings access**: "Open WiFi settings"
- **Web search**: "Search for [query]"

### 🚨 Emergency Features
- **Emergency services**: Instant 911/emergency calling
- **SOS mode**: Activates flashlight, max volume, location sharing
- **Emergency contacts**: Quick access to pre-configured contacts
- **Location sharing** for emergency situations
- **Emergency guidance** (medical, fire, police scenarios)

### ♿ Accessibility Features
- **Always listening**: Continuous voice recognition
- **Wake word activation**: "Hey Assistant" to start commands
- **Voice feedback**: All actions confirmed verbally
- **Large visual indicators** for status and commands
- **High contrast interface** optimized for visibility
- **Background operation** - works even when app is not visible

## 🚀 Quick Start

### 🔥 Want to Test Without Installing? 

**📱 Download & Install (No Development Setup Required)**

1. **Go to Releases**: Visit the [Releases page](../../releases) of this repository
2. **Download APK**: Click on the latest `app-release.apk` file 
3. **Enable Unknown Sources**: In Android Settings > Security, allow "Install from unknown sources"
4. **Install**: Open the downloaded APK to install the app
5. **Grant Permissions**: Allow microphone, camera, contacts, and location access
6. **Start Testing**: Say "Hey Assistant" to begin!

> 💡 **New builds are automatically created** every time code is updated!

---

### 🛠 For Developers

#### Prerequisites
- React Native development environment
- Android Studio (for Android) or Xcode (for iOS)
- Node.js 16+ and npm/yarn
- Physical device recommended (voice recognition works better on real hardware)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/VoiceAssistApp.git
cd VoiceAssistApp
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **iOS Setup** (if targeting iOS)
```bash
cd ios
pod install
cd ..
```

4. **Android Setup**
- Open `android/app/src/main/AndroidManifest.xml`
- Ensure all required permissions are listed
- Update package name if needed

5. **Run the app**
```bash
# For Android
npx react-native run-android

# For iOS  
npx react-native run-ios
```

## 📋 Voice Commands Reference

### Getting Started
- **"Hey Assistant"** - Wake word to activate listening
- **"Help"** - List available commands
- **"Exit app"** - Close the application

### Camera Commands
- "Take a photo" / "Take a picture" / "Snap"
- "Take a selfie" / "Front camera photo"
- "Start recording" / "Record video"
- "Stop recording" / "Stop video"
- "Open camera" / "Close camera"

### Device Control
- "Turn on flashlight" / "Turn off flashlight"
- "Volume up" / "Volume down" / "Set volume to 75%"
- "Mute" / "Max volume"
- "Battery status" / "Device information"
- "Emergency flashlight" (SOS pattern)

### Communication
- "Call [contact name]" (e.g., "Call Mom", "Call John Smith")
- "Call [phone number]" (e.g., "Call 555-1234")
- "Send message to [contact]" / "Text [contact]"
- "Recent calls" / "Call log"
- "Redial" / "Call back"

### Navigation & Apps
- "Open [app name]" (e.g., "Open WhatsApp", "Open Camera")
- "Navigate to [place]" / "Directions to [place]"
- "Open settings" / "WiFi settings" / "Bluetooth settings"
- "Go to home screen"

### Emergency Commands
- **"Emergency"** - Activates full emergency mode
- **"Call 911"** / **"Call emergency services"**
- **"SOS"** / **"Help"** - Emergency procedures
- **"Medical emergency"** - Medical-specific emergency response
- **"Fire emergency"** - Fire-specific emergency response
- **"Where am I"** - Location information

## 🔧 Configuration

### Setting Up Emergency Contacts
The app can store emergency contacts for quick access:
1. Use voice command: "Add emergency contact"
2. Or manually edit in app settings
3. Configure up to 5 emergency contacts

### Customizing Wake Words
Edit `App.js` to modify wake words:
```javascript
const wakeWords = ['hey assistant', 'voice assistant', 'assistant'];
```

### Adjusting Voice Recognition
In `App.js`, modify voice recognition settings:
```javascript
Voice.onSpeechResults = (e) => {
  // Adjust confidence threshold
  // Modify language settings
  // Customize response handling
};
```

## 📱 Permissions Required

### Android Permissions
- `RECORD_AUDIO` - Voice recognition
- `CAMERA` - Photo/video capture and flashlight
- `CALL_PHONE` - Making phone calls
- `READ_CONTACTS` - Contact access
- `SEND_SMS` - Text messaging
- `ACCESS_FINE_LOCATION` - Emergency location services
- `MODIFY_AUDIO_SETTINGS` - Volume control
- `WAKE_LOCK` - Background operation

### iOS Permissions
- Microphone access for voice recognition
- Camera access for photos/videos
- Contacts access for calling/messaging
- Location access for emergency services
- Speech recognition for voice processing

## 🛠️ Development

### Project Structure
```
VoiceAssistApp/
├── App.js                 # Main application component
├── package.json           # Dependencies and scripts
├── app.json              # App configuration
├── index.js              # Entry point
└── src/
    └── controllers/
        ├── CameraController.js      # Camera functions
        ├── DeviceController.js      # Device controls
        ├── CommunicationController.js # Calls & messages
        ├── NavigationController.js  # App/navigation
        └── EmergencyController.js   # Emergency features
```

### Adding New Voice Commands

1. **Identify the command category** (camera, device, communication, etc.)

2. **Add command recognition** in `App.js`:
```javascript
processVoiceCommand(command) {
  if (command.includes('your new command')) {
    this.yourController.handleNewCommand(command);
  }
}
```

3. **Implement the handler** in appropriate controller:
```javascript
async handleNewCommand(command) {
  try {
    // Your implementation
    this.mainApp.speak("Command executed successfully");
  } catch (error) {
    this.mainApp.speak("Error executing command");
  }
}
```

### Testing Voice Commands
1. Use a physical device (emulators have limited microphone support)
2. Test in quiet environment initially
3. Gradually test with background noise
4. Test with different accents and speech patterns
5. Verify all confirmation feedback is clear

## 🔒 Privacy & Security

- **Local Processing**: Voice recognition happens on-device
- **No Cloud Storage**: Voice data is not transmitted to servers
- **Secure Storage**: Emergency contacts and logs encrypted locally
- **Permission Verification**: All sensitive actions require user permission
- **Emergency Logging**: Emergency calls are logged for safety

## ♿ Accessibility Guidelines

This app follows WCAG 2.1 AAA guidelines where applicable:
- **High contrast** visual elements
- **Large touch targets** (48dp minimum)
- **Clear audio feedback** for all actions
- **Simple, consistent** voice command patterns
- **Error recovery** with helpful voice guidance
- **Redundant confirmation** for critical actions

## 🚀 Automated Testing & Deployment

### 📦 GitHub Actions Build System

This repository is configured with **automated APK building**:

- **Every push** to main/master triggers a new build
- **APK files** are automatically generated and released
- **No local development environment** needed for testing
- **Downloadable builds** available in the [Releases section](../../releases)

### 🔄 How the Automation Works

1. **Code Push**: When you push changes to GitHub
2. **Automated Build**: GitHub Actions builds an Android APK
3. **Automatic Release**: APK is packaged and released automatically
4. **Download & Test**: Anyone can download and install the latest version

### 🎯 Testing Workflow for Contributors

1. **Make changes** to the code locally
2. **Push to GitHub** (or create a pull request)
3. **Wait for build** (usually takes 5-10 minutes)
4. **Download APK** from the Releases page
5. **Test on device** and provide feedback

This makes it incredibly easy for non-developers to test new features!

---

## 🤝 Contributing

We welcome contributions to make VoiceAssist even more accessible and useful!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Areas
- Additional voice commands
- New accessibility features
- UI/UX improvements
- Bug fixes and optimizations
- Documentation improvements
- Internationalization/localization

## 📞 Support & Feedback

- **Issues**: Report bugs via GitHub Issues
- **Feature Requests**: Submit via GitHub Discussions
- **Accessibility Feedback**: Especially welcome from users with disabilities
- **General Questions**: Contact via email or project discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community for the excellent framework
- Voice recognition library contributors
- Accessibility advocates who provided feedback
- Beta testers from the disability community

## 🔮 Roadmap

- **Voice training** for better recognition accuracy
- **Smart home integration** (lights, thermostat, etc.)
- **AI-powered context awareness**
- **Multi-language support**
- **Wearable device integration**
- **Advanced emergency features** (fall detection, etc.)
- **Voice macro recording** for complex tasks

---

**VoiceAssist** - Empowering independence through voice technology 🗣️📱

*Built with ❤️ for the accessibility community*
