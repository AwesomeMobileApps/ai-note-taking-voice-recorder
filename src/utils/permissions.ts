import { Platform, PermissionsAndroid, Alert } from 'react-native';

/**
 * Request microphone permission for Android devices
 * iOS handles permissions through Info.plist
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Hermit Weekend needs access to your microphone to record notes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Permission Denied',
          'You need to grant microphone permission to record notes.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (err) {
      console.error('Error requesting microphone permission:', err);
      return false;
    }
  }
  
  // For iOS, we assume permission is handled through Info.plist
  return true;
};

/**
 * Check if microphone permission is granted (Android only)
 * iOS handles permissions through Info.plist
 */
export const checkMicrophonePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return result;
    } catch (err) {
      console.error('Error checking microphone permission:', err);
      return false;
    }
  }
  
  // For iOS, we assume permission is handled through Info.plist
  return true;
}; 