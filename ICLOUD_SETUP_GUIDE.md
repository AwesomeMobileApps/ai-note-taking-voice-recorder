# iCloud Integration Guide for Hermit Weekend

This guide provides detailed instructions for setting up and configuring iCloud integration in your Hermit Weekend app.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up iCloud in Xcode](#setting-up-icloud-in-xcode)
3. [Configuring Entitlements](#configuring-entitlements)
4. [Implementing iCloud in Your App](#implementing-icloud-in-your-app)
5. [Testing iCloud Integration](#testing-icloud-integration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- An Apple Developer account ($99/year)
- Xcode installed (latest version recommended)
- Your app project set up in Xcode
- A valid App ID with iCloud capabilities

## Setting Up iCloud in Xcode

### 1. Create an App ID with iCloud Capability

1. Go to the [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Click the "+" button to create a new identifier
3. Select "App IDs" and click "Continue"
4. Enter a description (e.g., "Hermit Weekend")
5. Enter your Bundle ID (e.g., "com.yourcompany.hermitweekend")
6. Scroll down to "Capabilities" and check "iCloud"
7. Select "iCloud Documents" and "CloudKit"
8. Click "Continue" and then "Register"

### 2. Create an iCloud Container

1. In the Apple Developer Portal, go to "Certificates, IDs & Profiles"
2. Select "Identifiers" from the sidebar
3. Click the "+" button and select "iCloud Containers"
4. Enter a description (e.g., "Hermit Weekend Notes")
5. Enter an identifier (e.g., "iCloud.com.yourcompany.hermitweekend.notes")
6. Click "Continue" and then "Register"

### 3. Associate the Container with Your App ID

1. Go back to "Identifiers" and select your App ID
2. Click "Edit"
3. Scroll to the iCloud section and ensure it's checked
4. Select your newly created container
5. Click "Save"

## Configuring Entitlements

### 1. Enable iCloud in Your Xcode Project

1. Open your project in Xcode
2. Select your target and go to the "Signing & Capabilities" tab
3. Click the "+" button in the top-right corner
4. Add "iCloud" capability
5. Check "iCloud Documents"
6. Select your iCloud container from the dropdown

### 2. Configure Entitlements File

Xcode will automatically create an entitlements file. Ensure it contains:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.icloud-container-identifiers</key>
    <array>
        <string>iCloud.com.yourcompany.hermitweekend.notes</string>
    </array>
    <key>com.apple.developer.icloud-services</key>
    <array>
        <string>CloudDocuments</string>
    </array>
    <key>com.apple.developer.ubiquity-container-identifiers</key>
    <array>
        <string>iCloud.com.yourcompany.hermitweekend.notes</string>
    </array>
</dict>
</plist>
```

## Implementing iCloud in Your App

### 1. Update Info.plist

Add the following to your Info.plist file:

```xml
<key>NSUbiquitousContainers</key>
<dict>
    <key>iCloud.com.yourcompany.hermitweekend.notes</key>
    <dict>
        <key>NSUbiquitousContainerIsDocumentScopePublic</key>
        <true/>
        <key>NSUbiquitousContainerName</key>
        <string>Hermit Weekend</string>
        <key>NSUbiquitousContainerSupportedFolderLevels</key>
        <string>Any</string>
    </dict>
</dict>
```

### 2. Install Required Dependencies

Make sure you have the necessary dependencies:

```bash
npm install react-native-fs
```

### 3. Use the iCloudStorage Utility

We've already created an `iCloudStorage.ts` utility that handles:

- Checking iCloud availability
- Saving notes to iCloud
- Retrieving notes from iCloud
- Syncing notes between devices

The utility is implemented in `src/utils/iCloudStorage.ts`.

### 4. Integrate with Your App's Workflow

The iCloud integration is already set up in:

- `RecordScreen.tsx`: For saving new notes to iCloud
- `NoteViewScreen.tsx`: For viewing iCloud sync status and manually syncing

## Testing iCloud Integration

### 1. Test on Real Devices

iCloud functionality should be tested on real iOS devices, not simulators.

### 2. Sign In to iCloud

Ensure you're signed in to iCloud on your test device:

1. Go to Settings > [Your Name] > iCloud
2. Ensure iCloud Drive is turned on
3. Scroll down and make sure your app is enabled

### 3. Test Scenarios

Test the following scenarios:

1. **Creating a new note**: Verify it syncs to iCloud
2. **Editing an existing note**: Verify changes sync to iCloud
3. **Deleting a note**: Verify it's removed from iCloud
4. **Multi-device sync**: Create a note on one device and verify it appears on another

## Troubleshooting

### Common Issues and Solutions

1. **iCloud Container Not Found**
   - Verify your container ID in the Apple Developer Portal
   - Check your entitlements file for correct container ID

2. **Files Not Syncing**
   - Ensure the device is connected to the internet
   - Check if iCloud Drive is enabled in device settings
   - Verify the user is signed in to iCloud

3. **Permission Errors**
   - Check that your app has the correct entitlements
   - Verify Info.plist configuration

4. **Sync Conflicts**
   - Implement proper conflict resolution in your app
   - Use metadata like timestamps to determine the latest version

### Debugging iCloud Issues

1. **Enable iCloud Logging**
   
   Add the following to your scheme's arguments:
   
   ```
   -com.apple.coredata.ubiquity.logLevel 3
   ```

2. **Check System Logs**
   
   Use the Console app on macOS to view logs from your device.

3. **Test with Development iCloud Account**
   
   Use a separate iCloud account for development to avoid affecting your personal data.

## Additional Resources

- [Apple Documentation: iCloud Design Guide](https://developer.apple.com/icloud/documentation/cloudkit-design/)
- [Apple Documentation: File System Programming Guide](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/Introduction/Introduction.html)
- [React Native FS Documentation](https://github.com/itinance/react-native-fs) 