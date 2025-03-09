import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, IconButton, FAB, ActivityIndicator, Searchbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define Note type
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

type NotesListScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NotesList'>;
};

const NotesListScreen: React.FC<NotesListScreenProps> = ({ navigation }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load notes from storage
  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesJson = await AsyncStorage.getItem('notes');
      if (notesJson) {
        const parsedNotes = JSON.parse(notesJson) as Note[];
        // Sort notes by creation date (newest first)
        const sortedNotes = parsedNotes.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotes(sortedNotes);
        setFilteredNotes(sortedNotes);
      } else {
        setNotes([]);
        setFilteredNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load notes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase()) || 
        note.content.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              // Filter out the note to delete
              const updatedNotes = notes.filter(note => note.id !== noteId);
              
              // Save updated notes to storage
              await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
              
              // Update state
              setNotes(updatedNotes);
              setFilteredNotes(
                searchQuery.trim() === '' 
                  ? updatedNotes 
                  : updatedNotes.filter(note => 
                      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      note.content.toLowerCase().includes(searchQuery.toLowerCase())
                    )
              );
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Render note item
  const renderNoteItem = ({ item }: { item: Note }) => {
    // Extract first line as title or use the provided title
    const title = item.title || 'Untitled Note';
    
    // Extract a preview of the content (first 100 characters)
    const contentPreview = item.content
      .replace(/^#.*$/m, '') // Remove markdown headers
      .replace(/^\*.*$/m, '') // Remove markdown lists
      .replace(/^_.*_$/m, '') // Remove italics
      .trim()
      .slice(0, 100) + (item.content.length > 100 ? '...' : '');
    
    return (
      <Card 
        style={styles.noteCard}
        onPress={() => navigation.navigate('NoteView', { noteId: item.id })}
      >
        <Card.Title 
          title={title}
          subtitle={formatDate(item.createdAt)}
          right={(props) => (
            <IconButton
              {...props}
              icon="delete"
              onPress={() => deleteNote(item.id)}
            />
          )}
        />
        <Card.Content>
          <Text numberOfLines={2} style={styles.previewText}>
            {contentPreview}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        placeholder="Search notes..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim() !== '' 
              ? 'No notes match your search.' 
              : 'No notes yet. Start by recording a new note!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Record')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  noteCard: {
    marginBottom: 16,
    elevation: 2,
  },
  previewText: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});

export default NotesListScreen; 