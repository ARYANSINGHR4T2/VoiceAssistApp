#!/bin/bash

# VoiceAssist Setup Script
# Automated setup for VoiceAssist React Native App

set -e

echo "🗣️ VoiceAssist Setup Starting..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Check if React Native CLI is installed globally
if ! command -v react-native &> /dev/null; then
    echo "📦 Installing React Native CLI globally..."
    npm install -g react-native-cli
fi

echo "✅ React Native CLI available"

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Check platform setup
echo ""
echo "📱 Platform Setup Check:"
echo "========================"

# Check Android setup
if command -v adb &> /dev/null; then
    echo "✅ Android SDK detected"
    echo "   ADB version: $(adb version | head -n1)"
else
    echo "⚠️  Android SDK not found. For Android development:"
    echo "   - Install Android Studio"
    echo "   - Set up Android SDK"
    echo "   - Add Android SDK tools to PATH"
fi

# Check iOS setup (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcodebuild &> /dev/null; then
        echo "✅ Xcode detected"
        echo "   Xcode version: $(xcodebuild -version | head -n1)"
        
        # Install iOS dependencies
        if [ -d "ios" ]; then
            echo "📦 Installing iOS dependencies..."
            cd ios
            pod install
            cd ..
            echo "✅ iOS dependencies installed"
        fi
    else
        echo "⚠️  Xcode not found. For iOS development:"
        echo "   - Install Xcode from App Store"
        echo "   - Install Xcode Command Line Tools"
    fi
else
    echo "ℹ️  iOS development requires macOS"
fi

# Create necessary directories
echo ""
echo "📁 Creating necessary directories..."
mkdir -p src/services
mkdir -p android/app/src/main/assets
mkdir -p logs

# Set permissions for scripts
chmod +x setup.sh

echo ""
echo "🔧 Final Setup Steps:"
echo "====================="

echo "1. 📱 Connect your device via USB"
echo "2. 🔓 Enable Developer Options and USB Debugging"
echo "3. 🔐 Grant required permissions when prompted"
echo "4. 🚀 Run the app:"
echo "   - Android: npm run android"
echo "   - iOS: npm run ios"

echo ""
echo "📋 Important Notes:"
echo "=================="
echo "• 🎤 Voice recognition works best on physical devices"
echo "• 📍 Location permissions required for emergency features"
echo "• 🔊 Ensure device volume is up for voice feedback"
echo "• 🔋 App may request battery optimization exemption"

echo ""
echo "🆘 Emergency Features Setup:"
echo "============================"
echo "• Configure emergency contacts through voice commands"
echo "• Test emergency calling in safe environment"
echo "• Ensure location services are enabled"

echo ""
echo "✅ VoiceAssist setup complete!"
echo ""
echo "Next steps:"
echo "1. Test basic voice commands: 'Hey Assistant, help'"
echo "2. Configure emergency contacts"
echo "3. Test camera and flashlight functions"
echo "4. Set up device-specific accessibility settings"
echo ""
echo "For support: Check README.md or GitHub issues"
echo "Happy hands-free controlling! 🗣️📱"
