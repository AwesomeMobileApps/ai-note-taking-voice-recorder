# Hermit Weekend

A React Native mobile app for capturing, transcribing, and organizing notes from real-life interactions, with Apple Watch support.

## Features

- **Voice Recording**: Capture your thoughts and conversations on the go
- **Automatic Transcription**: Convert speech to text in real-time
- **Markdown Support**: View and edit notes with full markdown formatting
- **Note Summarization**: Automatically generate concise summaries of your notes
- **Mind Map Visualization**: View your notes as visual mind maps for better comprehension
- **Export Functionality**: Share your notes in markdown format
- **Search Functionality**: Quickly find notes by content or title
- **Offline Support**: All notes are stored locally on your device
- **Apple Watch App**: Record notes directly from your Apple Watch

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- React Native development environment set up
- iOS: XCode and CocoaPods
- Android: Android Studio and Android SDK

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/hermit-weekend.git
cd hermit-weekend
```

2. Install dependencies:
```
npm install
# or
yarn install
```

3. Install iOS dependencies (iOS only):
```
cd ios && pod install && cd ..
```

4. Start the Metro bundler:
```
npm start
# or
yarn start
```

5. Run the app:
```
# For iOS
npm run ios
# or
yarn ios

# For Android
npm run android
# or
yarn android
```

## Using the App

### Recording Notes

1. Tap "Record New Note" on the home screen
2. Speak clearly to record your thoughts
3. Tap "Stop Recording" when finished
4. Add a title (optional) and tap "Save Note"

### Viewing and Organizing Notes

1. Tap "View My Notes" to see all your saved notes
2. Use the search bar to find specific notes
3. Tap on a note to view its details
4. In the note view, switch between different tabs:
   - **Content**: View the full note with markdown formatting
   - **Summary**: See an automatically generated summary of your note
   - **Mind Map**: Visualize the key topics in your note as a mind map

### Editing and Exporting

1. Tap the pencil icon to edit a note
2. Use markdown formatting to structure your note
3. Tap the three-dot menu to access additional options
4. Select "Export as Markdown" to share your note

## Apple Watch App

The Hermit Weekend app includes an Apple Watch companion app that allows you to:

- Record voice notes directly from your watch
- Transcribe speech to text on the watch
- Send notes to your iPhone app

To use the Apple Watch app:

1. Install the iOS app on your iPhone
2. The Watch app will automatically be installed on your paired Apple Watch
3. Open the Watch app and tap "Record" to start recording a note
4. When finished, tap "Stop" and then "Send to iPhone"
5. The note will appear in your iPhone app, where you can edit, summarize, and visualize it

## Tech Stack

- React Native
- TypeScript
- React Navigation
- React Native Paper (UI components)
- React Native Voice (Speech recognition)
- AsyncStorage (Local storage)
- React Native Markdown Display
- WatchConnectivity (for Apple Watch integration)

## Project Structure

```
hermit-weekend/
├── src/
│   ├── screens/           # Screen components
│   ├── components/        # Reusable UI components
│   │   └── MindMap.tsx    # Mind map visualization component
│   ├── utils/             # Utility functions
│   │   └── summarization.ts # Text summarization utilities
│   └── assets/            # Images, fonts, etc.
├── ios/
│   ├── HermitWeekend/     # iOS app
│   ├── HermitWeekendWatch/        # Apple Watch app
│   └── HermitWeekendWatchExtension/  # Apple Watch extension
├── App.tsx                # Main application component
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Native community
- React Native Paper team
- React Native Voice contributors
- Apple WatchKit and WatchConnectivity frameworks 