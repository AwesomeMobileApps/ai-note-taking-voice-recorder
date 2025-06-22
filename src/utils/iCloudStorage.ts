import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../screens/NotesListScreen';

// Define iCloud container directory for iOS
const ICLOUD_CONTAINER = Platform.OS === 'ios' 
  ? `${RNFS.DocumentDirectoryPath}/../Library/Mobile Documents/iCloud~com~hermitweekend~notes/Documents`
  : '';

// Define sync status constants
const SYNC_STATUS = {
  NOT_SYNCED: 'not_synced',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  FAILED: 'failed'
};

// Define sync events
export const SYNC_EVENTS = {
  SYNC_STARTED: 'sync_started',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  NOTE_SYNCED: 'note_synced'
};

// Define listeners array
const syncListeners: { event: string, callback: Function }[] = [];

/**
 * Utility class for handling iCloud storage operations with enhanced syncing
 */
class iCloudStorage {
  /**
   * Check if iCloud is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    
    try {
      // Check if iCloud is enabled in device settings
      if (NativeModules.RNiCloud) {
        const iCloudStatus = await NativeModules.RNiCloud.getICloudStatus();
        if (!iCloudStatus.enabled) {
          console.log('iCloud is not enabled on this device');
          return false;
        }
      }
      
      // Check if container directory exists
      const exists = await RNFS.exists(ICLOUD_CONTAINER);
      if (!exists) {
        await RNFS.mkdir(ICLOUD_CONTAINER);
      }
      
      // Verify we can write to the container
      const testFile = `${ICLOUD_CONTAINER}/test.txt`;
      await RNFS.writeFile(testFile, 'test', 'utf8');
      await RNFS.unlink(testFile);
      
      return true;
    } catch (error) {
      console.error('iCloud availability check failed:', error);
      return false;
    }
  }

  /**
   * Set up iCloud sync listeners
   */
  static setupSyncListeners(): void {
    if (Platform.OS !== 'ios' || !NativeModules.RNiCloud) return;
    
    const iCloudEmitter = new NativeEventEmitter(NativeModules.RNiCloud);
    
    // Listen for iCloud key-value store changes
    iCloudEmitter.addListener('iCloudKeyValueStoreDidChangeRemotely', this.handleRemoteChanges);
    
    // Listen for iCloud document changes
    iCloudEmitter.addListener('iCloudDocumentStoreDidChangeRemotely', this.handleRemoteDocumentChanges);
  }

  /**
   * Handle remote changes from iCloud
   */
  private static async handleRemoteChanges(event: any): Promise<void> {
    try {
      // Notify listeners that sync has started
      iCloudStorage.notifyListeners(SYNC_EVENTS.SYNC_STARTED, null);
      
      // Sync notes from iCloud
      await iCloudStorage.syncFromiCloud();
      
      // Notify listeners that sync has completed
      iCloudStorage.notifyListeners(SYNC_EVENTS.SYNC_COMPLETED, null);
    } catch (error) {
      console.error('Error handling remote changes:', error);
      iCloudStorage.notifyListeners(SYNC_EVENTS.SYNC_FAILED, error);
    }
  }

  /**
   * Handle remote document changes from iCloud
   */
  private static async handleRemoteDocumentChanges(event: any): Promise<void> {
    try {
      // Get the list of changed documents
      const changedDocs = event.changedDocuments || [];
      
      // Process each changed document
      for (const docURL of changedDocs) {
        const noteId = docURL.split('/').pop().replace('.json', '');
        
        // Get the note from iCloud
        const note = await iCloudStorage.getNote(noteId);
        
        if (note) {
          // Update local storage
          await iCloudStorage.updateLocalNote(note);
          
          // Notify listeners that a note has been synced
          iCloudStorage.notifyListeners(SYNC_EVENTS.NOTE_SYNCED, note);
        }
      }
    } catch (error) {
      console.error('Error handling remote document changes:', error);
    }
  }

  /**
   * Save a note to iCloud
   */
  static async saveNote(note: Note): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) return false;
      
      // Update sync status
      await this.updateSyncStatus(note.id, SYNC_STATUS.SYNCING);
      
      // Save note to iCloud
      const filePath = `${ICLOUD_CONTAINER}/${note.id}.json`;
      await RNFS.writeFile(filePath, JSON.stringify(note), 'utf8');
      
      // Update the sync status in local storage
      await this.updateSyncStatus(note.id, SYNC_STATUS.SYNCED);
      
      // Notify listeners that a note has been synced
      this.notifyListeners(SYNC_EVENTS.NOTE_SYNCED, note);
      
      return true;
    } catch (error) {
      console.error('Failed to save note to iCloud:', error);
      
      // Update sync status to failed
      await this.updateSyncStatus(note.id, SYNC_STATUS.FAILED);
      
      return false;
    }
  }

  /**
   * Get a note from iCloud
   */
  static async getNote(noteId: string): Promise<Note | null> {
    if (Platform.OS !== 'ios') return null;
    
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) return null;
      
      const filePath = `${ICLOUD_CONTAINER}/${noteId}.json`;
      const exists = await RNFS.exists(filePath);
      
      if (!exists) return null;
      
      const content = await RNFS.readFile(filePath, 'utf8');
      return JSON.parse(content) as Note;
    } catch (error) {
      console.error('Failed to get note from iCloud:', error);
      return null;
    }
  }

  /**
   * Delete a note from iCloud
   */
  static async deleteNote(noteId: string): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) return false;
      
      const filePath = `${ICLOUD_CONTAINER}/${noteId}.json`;
      const exists = await RNFS.exists(filePath);
      
      if (exists) {
        await RNFS.unlink(filePath);
      }
      
      // Update the sync status in local storage
      await this.updateSyncStatus(noteId, SYNC_STATUS.NOT_SYNCED);
      
      return true;
    } catch (error) {
      console.error('Failed to delete note from iCloud:', error);
      return false;
    }
  }

  /**
   * Sync all local notes to iCloud
   */
  static async syncAllNotes(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) return false;
      
      // Notify listeners that sync has started
      this.notifyListeners(SYNC_EVENTS.SYNC_STARTED, null);
      
      // Get all notes from local storage
      const notesJson = await AsyncStorage.getItem('notes');
      if (!notesJson) return true; // No notes to sync
      
      const notes = JSON.parse(notesJson) as Note[];
      
      // Save each note to iCloud
      const promises = notes.map(note => this.saveNote(note));
      await Promise.all(promises);
      
      // Notify listeners that sync has completed
      this.notifyListeners(SYNC_EVENTS.SYNC_COMPLETED, null);
      
      return true;
    } catch (error) {
      console.error('Failed to sync all notes to iCloud:', error);
      
      // Notify listeners that sync has failed
      this.notifyListeners(SYNC_EVENTS.SYNC_FAILED, error);
      
      return false;
    }
  }

  /**
   * Sync notes from iCloud to local storage
   */
  static async syncFromiCloud(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) return false;
      
      // Get all files from iCloud container
      const files = await RNFS.readDir(ICLOUD_CONTAINER);
      const jsonFiles = files.filter(file => file.name.endsWith('.json'));
      
      // Get all notes from local storage
      const notesJson = await AsyncStorage.getItem('notes');
      const localNotes = notesJson ? JSON.parse(notesJson) as Note[] : [];
      
      // Create a map of local notes by ID for quick lookup
      const localNotesMap = new Map<string, Note>();
      localNotes.forEach(note => localNotesMap.set(note.id, note));
      
      // Process each iCloud note
      for (const file of jsonFiles) {
        try {
          // Read the note from iCloud
          const content = await RNFS.readFile(file.path, 'utf8');
          const cloudNote = JSON.parse(content) as Note;
          
          // Check if the note exists locally
          const localNote = localNotesMap.get(cloudNote.id);
          
          if (!localNote) {
            // Note doesn't exist locally, add it
            localNotes.push(cloudNote);
            localNotesMap.set(cloudNote.id, cloudNote);
          } else {
            // Note exists locally, check which is newer
            const cloudDate = new Date(cloudNote.updatedAt).getTime();
            const localDate = new Date(localNote.updatedAt).getTime();
            
            if (cloudDate > localDate) {
              // Cloud note is newer, update local note
              localNotesMap.set(cloudNote.id, cloudNote);
              
              // Find and replace the note in the localNotes array
              const index = localNotes.findIndex(n => n.id === cloudNote.id);
              if (index !== -1) {
                localNotes[index] = cloudNote;
              }
            }
          }
        } catch (error) {
          console.error(`Error processing iCloud note ${file.name}:`, error);
        }
      }
      
      // Save updated notes to local storage
      await AsyncStorage.setItem('notes', JSON.stringify(localNotes));
      
      return true;
    } catch (error) {
      console.error('Failed to sync from iCloud:', error);
      return false;
    }
  }

  /**
   * Update a note in local storage
   */
  static async updateLocalNote(note: Note): Promise<boolean> {
    try {
      // Get all notes from local storage
      const notesJson = await AsyncStorage.getItem('notes');
      const notes = notesJson ? JSON.parse(notesJson) as Note[] : [];
      
      // Find the note index
      const index = notes.findIndex(n => n.id === note.id);
      
      if (index !== -1) {
        // Update existing note
        notes[index] = note;
      } else {
        // Add new note
        notes.push(note);
      }
      
      // Save updated notes to local storage
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
      
      return true;
    } catch (error) {
      console.error('Failed to update local note:', error);
      return false;
    }
  }

  /**
   * Update the sync status of a note in local storage
   */
  private static async updateSyncStatus(noteId: string, status: string): Promise<void> {
    try {
      const syncStatusJson = await AsyncStorage.getItem('noteSyncStatus');
      const syncStatus = syncStatusJson ? JSON.parse(syncStatusJson) : {};
      
      syncStatus[noteId] = status;
      
      await AsyncStorage.setItem('noteSyncStatus', JSON.stringify(syncStatus));
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  }

  /**
   * Check if a note is synced to iCloud
   */
  static async isNoteSynced(noteId: string): Promise<boolean> {
    try {
      const syncStatusJson = await AsyncStorage.getItem('noteSyncStatus');
      if (!syncStatusJson) return false;
      
      const syncStatus = JSON.parse(syncStatusJson);
      return syncStatus[noteId] === SYNC_STATUS.SYNCED;
    } catch (error) {
      console.error('Failed to check note sync status:', error);
      return false;
    }
  }

  /**
   * Get the sync status of a note
   */
  static async getNoteSyncStatus(noteId: string): Promise<string> {
    try {
      const syncStatusJson = await AsyncStorage.getItem('noteSyncStatus');
      if (!syncStatusJson) return SYNC_STATUS.NOT_SYNCED;
      
      const syncStatus = JSON.parse(syncStatusJson);
      return syncStatus[noteId] || SYNC_STATUS.NOT_SYNCED;
    } catch (error) {
      console.error('Failed to get note sync status:', error);
      return SYNC_STATUS.NOT_SYNCED;
    }
  }

  /**
   * Add a sync event listener
   */
  static addSyncListener(event: string, callback: Function): void {
    syncListeners.push({ event, callback });
  }

  /**
   * Remove a sync event listener
   */
  static removeSyncListener(event: string, callback: Function): void {
    const index = syncListeners.findIndex(
      listener => listener.event === event && listener.callback === callback
    );
    
    if (index !== -1) {
      syncListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of an event
   */
  private static notifyListeners(event: string, data: any): void {
    syncListeners
      .filter(listener => listener.event === event)
      .forEach(listener => listener.callback(data));
  }
}

export default iCloudStorage; 