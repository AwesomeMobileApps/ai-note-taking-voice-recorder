import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { Button, Text, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import WatchConnectivityManager, { WatchConnectivityEvents } from '../utils/WatchConnectivity';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // State for watch connectivity
  const [isWatchReachable, setIsWatchReachable] = useState(false);
  
  // Check watch connectivity on iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Check initial reachability
      WatchConnectivityManager.isWatchReachable()
        .then(reachable => setIsWatchReachable(reachable))
        .catch(error => console.error('Error checking watch reachability:', error));
      
      // Listen for reachability changes
      const handleReachabilityChange = (reachable: boolean) => {
        setIsWatchReachable(reachable);
      };
      
      // Add event listener
      WatchConnectivityManager.addEventListener(
        WatchConnectivityEvents.REACHABILITY_CHANGED,
        handleReachabilityChange
      );
      
      // Clean up on unmount
      return () => {
        WatchConnectivityManager.removeEventListener(
          WatchConnectivityEvents.REACHABILITY_CHANGED,
          handleReachabilityChange
        );
      };
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hermit Weekend</Text>
        <Text style={styles.subtitle}>
          Capture, transcribe, and organize your thoughts
        </Text>
        
        {/* Apple Watch connectivity indicator (iOS only) */}
        {Platform.OS === 'ios' && (
          <Chip 
            icon="watch" 
            style={[
              styles.watchChip, 
              isWatchReachable ? styles.watchConnected : styles.watchDisconnected
            ]}
            textStyle={{ color: isWatchReachable ? '#fff' : '#666' }}
          >
            {isWatchReachable ? 'Apple Watch Connected' : 'Apple Watch Not Connected'}
          </Chip>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="microphone"
          onPress={() => navigation.navigate('Record')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Record New Note
        </Button>

        <Button
          mode="outlined"
          icon="notebook"
          onPress={() => navigation.navigate('NotesList')}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          View My Notes
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Transform real-life interactions into organized notes
        </Text>
        
        {Platform.OS === 'ios' && isWatchReachable && (
          <Text style={styles.watchText}>
            You can also record notes directly from your Apple Watch
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginVertical: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  watchChip: {
    marginTop: 16,
  },
  watchConnected: {
    backgroundColor: '#4CAF50',
  },
  watchDisconnected: {
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
  footer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  watchText: {
    fontSize: 14,
    color: '#6200ee',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen; 