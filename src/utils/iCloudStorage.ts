import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../screens/NotesListScreen';

// Define iCloud container directory for iOS
const ICLOUD_CONTAINER = Platform.OS === 'ios' 
  ? `${RNFS.DocumentDirectoryPath}/../Library/Mobile Documents/iCloud~com~hermitweekend~notes/Documents`
  : '';

/**
 * Utility class for handling iCloud storage operations
 */
class iCloudStorage {
  /**
   * Check if iCloud is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    
    try {
      const exists = await RNFS.exists(ICLOUD_CONTAINER);
      if (!exists) {
        await RNFS.mkdir(ICLOUD_CONTAINER);
      }
      return true;
    } catch (error) {
      console.error('iCloud availability check failed:', error);
      return false;
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
      
      const filePath = `${ICLOUD_CONTAINER}/${note.id}.json`;
      await RNFS.writeFile(filePath, JSON.stringify(note), 'utf8');
      
      // Update the sync status in local storage
      await this.updateSyncStatus(note.id, true);
      
      return true;
    } catch (error) {
      console.error('Failed to save note to iCloud:', error);
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
      await this.updateSyncStatus(noteId, false);
      
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
      
      // Get all notes from local storage
      const notesJson = await AsyncStorage.getItem('notes');
      if (!notesJson) return true; // No notes to sync
      
      const notes = JSON.parse(notesJson) as Note[];
      
      // Save each note to iCloud
      const promises = notes.map(note => this.saveNote(note));
      await Promise.all(promises);
      
      return true;
    } catch (error) {
      console.error('Failed to sync all notes to iCloud:', error);
      return false;
    }
  }

  /**
   * Update the sync status of a note in local storage
   */
  private static async updateSyncStatus(noteId: string, synced: boolean): Promise<void> {
    try {
      const syncStatusJson = await AsyncStorage.getItem('noteSyncStatus');
      const syncStatus = syncStatusJson ? JSON.parse(syncStatusJson) : {};
      
      syncStatus[noteId] = synced;
      
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
      return syncStatus[noteId] === true;
    } catch (error) {
      console.error('Failed to check note sync status:', error);
      return false;
    }
  }
}

export default iCloudStorage; 