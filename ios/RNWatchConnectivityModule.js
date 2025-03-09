import { NativeModules, NativeEventEmitter } from 'react-native';

const { RNWatchConnectivity } = NativeModules;

// Set up the event emitter
if (RNWatchConnectivity) {
  RNWatchConnectivity.setEventEmitter(RNWatchConnectivity);
}

export default RNWatchConnectivity; 