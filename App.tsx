import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import RecordScreen from './src/screens/RecordScreen';
import NotesListScreen from './src/screens/NotesListScreen';
import NoteViewScreen from './src/screens/NoteViewScreen';

// Define the navigation stack parameter types
export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
  NotesList: undefined;
  NoteView: { noteId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#6200ee',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Hermit Weekend' }} 
            />
            <Stack.Screen 
              name="Record" 
              component={RecordScreen} 
              options={{ title: 'Record Note' }} 
            />
            <Stack.Screen 
              name="NotesList" 
              component={NotesListScreen} 
              options={{ title: 'My Notes' }} 
            />
            <Stack.Screen 
              name="NoteView" 
              component={NoteViewScreen} 
              options={{ title: 'Note Details' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App; 