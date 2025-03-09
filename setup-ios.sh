#!/bin/bash

# Make script exit if any command fails
set -e

echo "Setting up iOS project for Hermit Weekend..."

# Check if Xcode command line tools are installed
if ! xcode-select -p &> /dev/null; then
  echo "Xcode command line tools not found. Installing..."
  xcode-select --install
  echo "Please run this script again after installation completes."
  exit 1
fi

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
  echo "CocoaPods not found. Installing..."
  sudo gem install cocoapods
fi

# Create iOS directory if it doesn't exist
mkdir -p ios

# Create basic Xcode project structure if it doesn't exist
if [ ! -d "ios/HermitWeekend" ]; then
  echo "Creating basic iOS project structure..."
  mkdir -p ios/HermitWeekend
  mkdir -p ios/HermitWeekendWatch
  mkdir -p ios/HermitWeekendWatchExtension
fi

# Initialize React Native iOS project if needed
if [ ! -f "ios/HermitWeekend.xcodeproj/project.pbxproj" ]; then
  echo "Initializing React Native iOS project..."
  npx react-native init temp --template react-native-template-typescript
  cp -r temp/ios/temp.xcodeproj ios/HermitWeekend.xcodeproj
  rm -rf temp
fi

# Navigate to iOS directory
cd ios

# Clean any previous pods
if [ -d "Pods" ]; then
  echo "Cleaning previous CocoaPods installation..."
  rm -rf Pods
  rm -f Podfile.lock
fi

# Install CocoaPods dependencies
echo "Installing CocoaPods dependencies..."
pod install

# Check if pod install was successful
if [ $? -eq 0 ]; then
  echo "iOS setup completed successfully!"
  echo "You can now run 'npx react-native run-ios' to start the app."
else
  echo "Error: CocoaPods installation failed."
  echo "Try running 'pod install --verbose' in the ios directory for more details."
  exit 1
fi 