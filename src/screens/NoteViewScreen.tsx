import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share, Platform } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator, IconButton, Chip, Divider, Menu } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import { Note } from './NotesListScreen';
import { generateSummary } from '../utils/summarization';
import MindMap from '../components/MindMap';

type NoteViewScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NoteView'>;
  route: RouteProp<RootStackParamList, 'NoteView'>;
};

const NoteViewScreen: React.FC<NoteViewScreenProps> = ({ navigation, route }) => {
  const { noteId } = route.params;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'summary' | 'mindmap'>('content');
  const [menuVisible, setMenuVisible] = useState(false);
  const [summary, setSummary] = useState('');

  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        const notesJson = await AsyncStorage.getItem('notes');
        if (notesJson) {
          const notes = JSON.parse(notesJson) as Note[];
          const foundNote = notes.find(n => n.id === noteId);
          
          if (foundNote) {
            setNote(foundNote);
            setEditedTitle(foundNote.title);
            setEditedContent(foundNote.content);
            
            // Generate summary
            const noteSummary = generateSummary(foundNote.content, 200);
            setSummary(noteSummary);
          } else {
            Alert.alert('Error', 'Note not found');
            navigation.goBack();
          }
        } else {
          Alert.alert('Error', 'No notes found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading note:', error);
        Alert.alert('Error', 'Failed to load note. Please try again.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId, navigation]);

  // Update navigation options when note is loaded
  useEffect(() => {
    if (note) {
      navigation.setOptions({
        title: note.title || 'Note Details',
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon={isEditing ? 'check' : 'pencil'}
              onPress={isEditing ? saveChanges : () => setIsEditing(true)}
            />
            <IconButton
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          </View>
        ),
      });
    }
  }, [note, navigation, isEditing]);

  // Save edited note
  const saveChanges = async () => {
    if (!note) return;
    
    try {
      setIsSaving(true);
      
      // Get all notes
      const notesJson = await AsyncStorage.getItem('notes');
      if (!notesJson) {
        throw new Error('No notes found');
      }
      
      const notes = JSON.parse(notesJson) as Note[];
      
      // Find and update the current note
      const updatedNotes = notes.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            title: editedTitle || 'Untitled Note',
            content: editedContent,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });
      
      // Save updated notes
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      
      // Update local state
      const updatedNote = updatedNotes.find(n => n.id === noteId);
      if (updatedNote) {
        setNote(updatedNote);
        
        // Update summary
        const noteSummary = generateSummary(editedContent, 200);
        setSummary(noteSummary);
      }
      
      setIsEditing(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving note:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    if (note) {
      setEditedTitle(note.title);
      setEditedContent(note.content);
    }
    setIsEditing(false);
  };

  // Export note as markdown
  const exportNote = async () => {
    if (!note) return;
    
    try {
      await Share.share({
        message: note.content,
        title: note.title,
      });
    } catch (error) {
      console.error('Error sharing note:', error);
      Alert.alert('Error', 'Failed to share note. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.errorContainer}>
        <Text>Note not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Menu for additional options */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
        style={styles.menu}
      >
        <Menu.Item 
          onPress={() => {
            setMenuVisible(false);
            exportNote();
          }} 
          title="Export as Markdown" 
          icon="export"
        />
      </Menu>
      
      {/* Tab selector */}
      {!isEditing && (
        <View style={styles.tabContainer}>
          <Chip
            selected={activeTab === 'content'}
            onPress={() => setActiveTab('content')}
            style={styles.tab}
            icon="file-document"
          >
            Content
          </Chip>
          <Chip
            selected={activeTab === 'summary'}
            onPress={() => setActiveTab('summary')}
            style={styles.tab}
            icon="text-box"
          >
            Summary
          </Chip>
          <Chip
            selected={activeTab === 'mindmap'}
            onPress={() => setActiveTab('mindmap')}
            style={styles.tab}
            icon="sitemap"
          >
            Mind Map
          </Chip>
        </View>
      )}
      
      <ScrollView style={styles.scrollView}>
        {isEditing ? (
          // Edit mode
          <View style={styles.editContainer}>
            <TextInput
              label="Title"
              value={editedTitle}
              onChangeText={setEditedTitle}
              style={styles.titleInput}
              mode="outlined"
            />
            
            <TextInput
              label="Content (Markdown)"
              value={editedContent}
              onChangeText={setEditedContent}
              multiline
              style={styles.contentInput}
              mode="outlined"
              numberOfLines={10}
            />
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={saveChanges}
                style={styles.button}
                loading={isSaving}
                disabled={isSaving}
              >
                Save Changes
              </Button>
              
              <Button
                mode="outlined"
                onPress={cancelEditing}
                style={styles.button}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </View>
            
            <View style={styles.markdownHelpContainer}>
              <Text style={styles.markdownHelpTitle}>Markdown Tips:</Text>
              <Text style={styles.markdownHelpText}>
                # Header 1{'\n'}
                ## Header 2{'\n'}
                **Bold Text**{'\n'}
                *Italic Text*{'\n'}
                - List item{'\n'}
                1. Numbered item{'\n'}
                [Link](https://example.com)
              </Text>
            </View>
          </View>
        ) : (
          // View mode
          <View style={styles.viewContainer}>
            <View style={styles.metaContainer}>
              <Text style={styles.dateText}>
                Created: {formatDate(note.createdAt)}
              </Text>
              {note.updatedAt !== note.createdAt && (
                <Text style={styles.dateText}>
                  Updated: {formatDate(note.updatedAt)}
                </Text>
              )}
            </View>
            
            {activeTab === 'content' && (
              <View style={styles.markdownContainer}>
                <Markdown style={markdownStyles}>
                  {note.content}
                </Markdown>
              </View>
            )}
            
            {activeTab === 'summary' && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <Divider style={styles.divider} />
                <Text style={styles.summaryText}>{summary}</Text>
              </View>
            )}
            
            {activeTab === 'mindmap' && (
              <View style={styles.mindmapContainer}>
                <Text style={styles.mindmapTitle}>Mind Map</Text>
                <Divider style={styles.divider} />
                <MindMap content={note.content} title={note.title} />
              </View>
            )}
            
            <Button
              mode="outlined"
              icon="pencil"
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Note
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Markdown styling
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#6200ee',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#7e57c2',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  paragraph: {
    marginVertical: 8,
  },
  link: {
    color: '#2196f3',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
    paddingLeft: 16,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  list_item: {
    marginVertical: 4,
  },
  bullet_list: {
    marginLeft: 16,
  },
  ordered_list: {
    marginLeft: 16,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  viewContainer: {
    padding: 16,
  },
  editContainer: {
    padding: 16,
  },
  metaContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e8eaf6',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  markdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  mindmapContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 300,
  },
  mindmapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#e0e0e0',
    height: 1,
  },
  titleInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  contentInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
    minHeight: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  editButton: {
    marginTop: 16,
  },
  markdownHelpContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  markdownHelpTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  markdownHelpText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    marginHorizontal: 4,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default NoteViewScreen; 