import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

class CameraController {
  constructor(mainApp) {
    this.mainApp = mainApp;
    this.camera = null;
    this.isRecording = false;
    this.recordingTimer = null;
  }

  async handleCameraCommand(command) {
    console.log('Camera command:', command);

    try {
      if (command.includes('take photo') || command.includes('take picture') || 
          command.includes('capture') || command.includes('snap')) {
        await this.takePhoto();
      } 
      else if (command.includes('take selfie') || command.includes('front camera')) {
        await this.takeSelfie();
      }
      else if (command.includes('start recording') || command.includes('record video')) {
        await this.startVideoRecording();
      }
      else if (command.includes('stop recording') || command.includes('stop video')) {
        await this.stopVideoRecording();
      }
      else if (command.includes('open camera')) {
        await this.openCamera();
      }
      else if (command.includes('close camera')) {
        this.closeCamera();
      }
      else {
        this.mainApp.speak("I didn't understand the camera command. Try saying 'take photo', 'start recording', or 'open camera'");
      }
    } catch (error) {
      console.error('Camera command error:', error);
      this.mainApp.speak("Sorry, there was an error with the camera. Please try again.");
    }
  }

  async takePhoto() {
    try {
      // Check camera permission
      const hasPermission = await this.checkCameraPermission();
      if (!hasPermission) {
        this.mainApp.speak("Camera permission is required to take photos");
        return;
      }

      this.mainApp.speak("Taking photo now");

      const options = {
        mediaType: 'photo',
        quality: 1,
        maxWidth: 2000,
        maxHeight: 2000,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

      launchCamera(options, (response) => {
        if (response.didCancel) {
          this.mainApp.speak("Photo cancelled");
        } else if (response.errorMessage) {
          console.error('Camera error:', response.errorMessage);
          this.mainApp.speak("Error taking photo");
        } else {
          this.mainApp.speak("Photo taken successfully");
          console.log('Photo saved:', response.assets[0]);
        }
      });

    } catch (error) {
      console.error('Take photo error:', error);
      this.mainApp.speak("Error taking photo");
    }
  }

  async takeSelfie() {
    try {
      const hasPermission = await this.checkCameraPermission();
      if (!hasPermission) {
        this.mainApp.speak("Camera permission is required to take selfies");
        return;
      }

      this.mainApp.speak("Taking selfie with front camera");

      const options = {
        mediaType: 'photo',
        quality: 1,
        maxWidth: 2000,
        maxHeight: 2000,
        cameraType: 'front',
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

      launchCamera(options, (response) => {
        if (response.didCancel) {
          this.mainApp.speak("Selfie cancelled");
        } else if (response.errorMessage) {
          console.error('Selfie error:', response.errorMessage);
          this.mainApp.speak("Error taking selfie");
        } else {
          this.mainApp.speak("Selfie taken successfully");
        }
      });

    } catch (error) {
      console.error('Take selfie error:', error);
      this.mainApp.speak("Error taking selfie");
    }
  }

  async startVideoRecording() {
    try {
      if (this.isRecording) {
        this.mainApp.speak("Already recording video");
        return;
      }

      const hasPermission = await this.checkCameraPermission();
      if (!hasPermission) {
        this.mainApp.speak("Camera permission is required to record video");
        return;
      }

      this.mainApp.speak("Starting video recording");
      this.isRecording = true;

      const options = {
        mediaType: 'video',
        videoQuality: 'high',
        durationLimit: 300, // 5 minutes max
        storageOptions: {
          skipBackup: true,
          path: 'videos',
        },
      };

      launchCamera(options, (response) => {
        this.isRecording = false;
        
        if (response.didCancel) {
          this.mainApp.speak("Video recording cancelled");
        } else if (response.errorMessage) {
          console.error('Video recording error:', response.errorMessage);
          this.mainApp.speak("Error recording video");
        } else {
          this.mainApp.speak("Video recorded successfully");
          console.log('Video saved:', response.assets[0]);
        }
      });

      // Auto-stop after 5 minutes
      this.recordingTimer = setTimeout(() => {
        if (this.isRecording) {
          this.stopVideoRecording();
        }
      }, 300000);

    } catch (error) {
      console.error('Start recording error:', error);
      this.isRecording = false;
      this.mainApp.speak("Error starting video recording");
    }
  }

  async stopVideoRecording() {
    try {
      if (!this.isRecording) {
        this.mainApp.speak("Not currently recording");
        return;
      }

      this.mainApp.speak("Stopping video recording");
      this.isRecording = false;

      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
        this.recordingTimer = null;
      }

      // Note: The actual stopping is handled by the camera library
      // This is more for user feedback and state management

    } catch (error) {
      console.error('Stop recording error:', error);
      this.mainApp.speak("Error stopping video recording");
    }
  }

  async openCamera() {
    try {
      const hasPermission = await this.checkCameraPermission();
      if (!hasPermission) {
        this.mainApp.speak("Camera permission is required");
        return;
      }

      this.mainApp.speak("Opening camera app");
      
      // Launch the camera in photo mode
      const options = {
        mediaType: 'photo',
        quality: 1,
      };

      launchCamera(options, (response) => {
        if (response.didCancel) {
          this.mainApp.speak("Camera closed");
        }
      });

    } catch (error) {
      console.error('Open camera error:', error);
      this.mainApp.speak("Error opening camera");
    }
  }

  closeCamera() {
    try {
      this.mainApp.speak("Closing camera");
      // Camera will close automatically when user exits
      this.isRecording = false;
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
        this.recordingTimer = null;
      }
    } catch (error) {
      console.error('Close camera error:', error);
    }
  }

  async checkCameraPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        
        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'VoiceAssist needs camera access to take photos and videos',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return result === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } catch (error) {
        console.error('Permission check error:', error);
        return false;
      }
    }
    return true; // iOS permissions are handled differently
  }

  // Voice-guided camera features
  async takePhotoWithCountdown(seconds = 3) {
    try {
      this.mainApp.speak(`Taking photo in ${seconds} seconds`);
      
      const countdown = (count) => {
        if (count > 0) {
          this.mainApp.speak(count.toString());
          setTimeout(() => countdown(count - 1), 1000);
        } else {
          this.takePhoto();
        }
      };
      
      setTimeout(() => countdown(seconds), 1000);
    } catch (error) {
      console.error('Countdown photo error:', error);
      this.mainApp.speak("Error with countdown photo");
    }
  }

  async takeMultiplePhotos(count = 3) {
    try {
      this.mainApp.speak(`Taking ${count} photos`);
      
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          this.mainApp.speak(`Photo ${i + 1}`);
          this.takePhoto();
        }, i * 2000);
      }
    } catch (error) {
      console.error('Multiple photos error:', error);
      this.mainApp.speak("Error taking multiple photos");
    }
  }

  // Get camera status
  getCameraStatus() {
    return {
      isRecording: this.isRecording,
      hasCamera: true, // Assume device has camera
    };
  }
}

export default CameraController;
