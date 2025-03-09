import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator, Snackbar, Surface, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import Voice, { 
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent
} from 'react-native-voice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WatchConnectivityManager, { WatchConnectivityEvents, WatchNoteData } from '../utils/WatchConnectivity';
import iCloudStorage from '../utils/iCloudStorage';

type RecordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Record'>;
};

const RecordScreen: React.FC<RecordScreenProps> = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watchSnackbarVisible, setWatchSnackbarVisible] = useState(false);
  const [watchNoteReceived, setWatchNoteReceived] = useState<WatchNoteData | null>(null);
  const [iCloudAvailable, setICloudAvailable] = useState(false);
  const [iCloudSyncEnabled, setICloudSyncEnabled] = useState(true);

  // Check iCloud availability
  useEffect(() => {
    const checkICloud = async () => {
      if (Platform.OS === 'ios') {
        const available = await iCloudStorage.isAvailable();
        setICloudAvailable(available);
        
        // Get user preference for iCloud sync
        const syncPref = await AsyncStorage.getItem('iCloudSyncEnabled');
        setICloudSyncEnabled(syncPref !== 'false');
      }
    };
    
    checkICloud();
  }, []);

  // Initialize voice recognition
  useEffect(() => {
    // Set up voice recognition event handlers
    Voice.onSpeechStart = () => setIsRecording(true);
    Voice.onSpeechEnd = () => setIsRecording(false);
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Clean up listeners on unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Set up Watch Connectivity listener
  useEffect(() => {
    // Only set up on iOS
    if (Platform.OS === 'ios') {
      // Listen for notes from Apple Watch
      const handleWatchNote = (noteData: WatchNoteData) => {
        // Show notification
        setWatchNoteReceived(noteData);
        setWatchSnackbarVisible(true);
      };
      
      // Add event listener
      WatchConnectivityManager.addEventListener(
        WatchConnectivityEvents.NOTE_RECEIVED,
        handleWatchNote
      );
      
      // Clean up on unmount
      return () => {
        WatchConnectivityManager.removeEventListener(
          WatchConnectivityEvents.NOTE_RECEIVED,
          handleWatchNote
        );
      };
    }
  }, []);

  // Handle speech recognition results
  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      // Get the most confident result
      const result = e.value[0];
      setTranscription((prev) => prev + ' ' + result);
    }
  };

  // Handle speech recognition errors
  const onSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech recognition error:', e);
    setIsRecording(false);
    setIsProcessing(false);
    Alert.alert('Recognition Error', 'There was a problem with speech recognition. Please try again.');
  };

  // Start recording
  const startRecording = async () => {
    try {
      setIsProcessing(true);
      await Voice.start('en-US');
      setIsProcessing(false);
    } catch (e) {
      console.error('Error starting recording:', e);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      setIsProcessing(true);
      await Voice.stop();
      setIsProcessing(false);
    } catch (e) {
      console.error('Error stopping recording:', e);
      setIsProcessing(false);
    }
  };

  // Convert transcription to markdown
  const convertToMarkdown = (text: string): string => {
    // Simple markdown conversion - can be enhanced
    const lines = text.split('. ');
    let markdown = '';
    
    if (lines.length > 0) {
      // Add title
      markdown += `# ${title || 'Untitled Note'}\n\n`;
      
      // Add date
      markdown += `_Created on ${new Date().toLocaleString()}_\n\n`;
      
      // Add paragraphs
      lines.forEach(line => {
        if (line.trim()) {
          markdown += `${line.trim()}.\n\n`;
        }
      });
    }
    
    return markdown;
  };

  // Save note
  const saveNote = async (noteText: string = transcription, noteTitle: string = title) => {
    if (!noteText.trim()) {
      Alert.alert('Error', 'Cannot save an empty note. Please record something first.');
      return;
    }

    try {
      setIsSaving(true);
      
      // Convert to markdown
      const markdownContent = convertToMarkdown(noteText);
      
      // Generate a unique ID for the note
      const noteId = `note_${Date.now()}`;
      
      // Create note object
      const note = {
        id: noteId,
        title: noteTitle || 'Untitled Note',
        content: markdownContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Get existing notes
      const existingNotesJson = await AsyncStorage.getItem('notes');
      const existingNotes = existingNotesJson ? JSON.parse(existingNotesJson) : [];
      
      // Add new note
      const updatedNotes = [...existingNotes, note];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      
      // Save to iCloud if available and enabled
      if (Platform.OS === 'ios' && iCloudAvailable && iCloudSyncEnabled) {
        await iCloudStorage.saveNote(note);
      }
      
      setIsSaving(false);
      
      // Navigate to the note view
      navigation.navigate('NoteView', { noteId });
    } catch (error) {
      console.error('Error saving note:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    }
  };

  // Toggle iCloud sync
  const toggleICloudSync = async () => {
    const newValue = !iCloudSyncEnabled;
    setICloudSyncEnabled(newValue);
    await AsyncStorage.setItem('iCloudSyncEnabled', newValue ? 'true' : 'false');
    
    if (newValue && iCloudAvailable) {
      // Sync all notes to iCloud
      iCloudStorage.syncAllNotes();
    }
  };

  // Clear the current transcription
  const clearTranscription = () => {
    Alert.alert(
      'Clear Transcription',
      'Are you sure you want to clear the current transcription?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          onPress: () => {
            setTranscription('');
            setTitle('');
          },
          style: 'destructive'
        },
      ]
    );
  };

  // Handle saving a note received from Apple Watch
  const handleSaveWatchNote = () => {
    if (watchNoteReceived) {
      // Save the note from the watch
      saveNote(watchNoteReceived.content, watchNoteReceived.title);
      
      // Hide the snackbar
      setWatchSnackbarVisible(false);
      setWatchNoteReceived(null);
    }
  };

  // Dismiss the watch note snackbar
  const dismissWatchSnackbar = () => {
    setWatchSnackbarVisible(false);
    setWatchNoteReceived(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.headerSurface}>
        <Text style={styles.headerTitle}>Record Note</Text>
        {Platform.OS === 'ios' && iCloudAvailable && (
          <IconButton
            icon={iCloudSyncEnabled ? "cloud" : "cloud-off-outline"}
            size={24}
            onPress={toggleICloudSync}
            style={styles.iCloudButton}
            iconColor={iCloudSyncEnabled ? "#4CAF50" : "#9E9E9E"}
          />
        )}
      </Surface>
      
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.inputSurface}>
          <TextInput
            label="Note Title"
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
            mode="outlined"
            theme={{ colors: { primary: '#6200ee' } }}
          />
        </Surface>
        
        <Surface style={styles.transcriptionSurface}>
          <Text style={styles.sectionTitle}>Transcription:</Text>
          <ScrollView style={styles.transcriptionScroll}>
            <Text style={styles.transcriptionText}>
              {transcription || 'Your transcription will appear here...'}
            </Text>
          </ScrollView>
        </Surface>
        
        <View style={styles.controlsContainer}>
          {isProcessing ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : (
            <>
              <Button
                mode="contained"
                icon={isRecording ? "stop" : "microphone"}
                onPress={isRecording ? stopRecording : startRecording}
                style={[styles.button, isRecording ? styles.stopButton : styles.recordButton]}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              
              {transcription.trim() && (
                <View style={styles.actionButtonsContainer}>
                  <Button
                    mode="outlined"
                    icon="content-save"
                    onPress={() => saveNote()}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    loading={isSaving}
                    disabled={isSaving}
                    labelStyle={styles.buttonLabel}
                  >
                    Save Note
                  </Button>
                  
                  <Button
                    mode="outlined"
                    icon="delete"
                    onPress={clearTranscription}
                    style={[styles.button, styles.clearButton]}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.clearButtonLabel}
                  >
                    Clear
                  </Button>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      
      {/* Snackbar for Apple Watch notes */}
      <Snackbar
        visible={watchSnackbarVisible}
        onDismiss={dismissWatchSnackbar}
        action={{
          label: 'Save',
          onPress: handleSaveWatchNote,
        }}
        duration={10000}
        style={styles.snackbar}
      >
        Note received from Apple Watch: {watchNoteReceived?.title || 'Untitled'}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerSurface: {
    padding: 16,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  iCloudButton: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  inputSurface: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  titleInput: {
    backgroundColor: '#fff',
  },
  transcriptionSurface: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  transcriptionScroll: {
    minHeight: 200,
    maxHeight: 300,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  controlsContainer: {
    marginTop: 16,
    gap: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  recordButton: {
    backgroundColor: '#6200ee',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  clearButton: {
    borderColor: '#f44336',
  },
  clearButtonLabel: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '500',
  },
  snackbar: {
    marginBottom: 16,
  },
});

export default RecordScreen; 