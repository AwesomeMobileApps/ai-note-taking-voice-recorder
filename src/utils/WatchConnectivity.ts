import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

// Define the interface for note data received from the watch
export interface WatchNoteData {
  title: string;
  content: string;
  timestamp: number;
}

// Define the event types
export enum WatchConnectivityEvents {
  NOTE_RECEIVED = 'noteReceived',
  REACHABILITY_CHANGED = 'reachabilityChanged',
  SESSION_ACTIVATED = 'sessionActivated',
}

// Create a class to manage Watch Connectivity
class WatchConnectivityManager {
  private static instance: WatchConnectivityManager;
  private eventEmitter: NativeEventEmitter | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  
  // Private constructor for singleton pattern
  private constructor() {
    // Only initialize on iOS
    if (Platform.OS === 'ios' && NativeModules.RNWatchConnectivity) {
      this.eventEmitter = new NativeEventEmitter(NativeModules.RNWatchConnectivity);
      
      // Set up listeners for native events
      this.setupNativeListeners();
    }
  }
  
  // Get the singleton instance
  public static getInstance(): WatchConnectivityManager {
    if (!WatchConnectivityManager.instance) {
      WatchConnectivityManager.instance = new WatchConnectivityManager();
    }
    return WatchConnectivityManager.instance;
  }
  
  // Set up native event listeners
  private setupNativeListeners(): void {
    if (!this.eventEmitter) return;
    
    // Listen for note received events
    this.eventEmitter.addListener('noteReceived', (noteData: WatchNoteData) => {
      this.emit(WatchConnectivityEvents.NOTE_RECEIVED, noteData);
    });
    
    // Listen for reachability changes
    this.eventEmitter.addListener('reachabilityChanged', (reachable: boolean) => {
      this.emit(WatchConnectivityEvents.REACHABILITY_CHANGED, reachable);
    });
    
    // Listen for session activation
    this.eventEmitter.addListener('sessionActivated', () => {
      this.emit(WatchConnectivityEvents.SESSION_ACTIVATED);
    });
  }
  
  // Add an event listener
  public addEventListener(event: WatchConnectivityEvents, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }
  
  // Remove an event listener
  public removeEventListener(event: WatchConnectivityEvents, callback: Function): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.delete(callback);
    }
  }
  
  // Emit an event to all listeners
  private emit(event: WatchConnectivityEvents, ...args: any[]): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => {
        callback(...args);
      });
    }
  }
  
  // Check if the watch is reachable
  public isWatchReachable(): Promise<boolean> {
    if (Platform.OS !== 'ios' || !NativeModules.RNWatchConnectivity) {
      return Promise.resolve(false);
    }
    
    return NativeModules.RNWatchConnectivity.isReachable();
  }
  
  // Send a message to the watch
  public sendMessageToWatch(message: object): Promise<any> {
    if (Platform.OS !== 'ios' || !NativeModules.RNWatchConnectivity) {
      return Promise.reject(new Error('Watch connectivity not available'));
    }
    
    return NativeModules.RNWatchConnectivity.sendMessage(message);
  }
}

// Export the singleton instance
export default WatchConnectivityManager.getInstance(); 