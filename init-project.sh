#!/bin/bash

# Make script exit if any command fails
set -e

echo "Initializing Hermit Weekend React Native project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Please install Node.js and try again."
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "npm not found. Please install npm and try again."
  exit 1
fi

# Install React Native CLI if not already installed
if ! command -v react-native &> /dev/null; then
  echo "Installing React Native CLI..."
  npm install -g react-native-cli
fi

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Initialize iOS project
echo "Setting up iOS project..."
./setup-ios.sh

# Initialize Android project
echo "Setting up Android project..."
if [ ! -d "android" ]; then
  echo "Creating Android project structure..."
  npx react-native init temp --template react-native-template-typescript
  cp -r temp/android .
  rm -rf temp
fi

echo "Project initialization completed!"
echo "You can now run the app using:"
echo "  iOS: 'npx react-native run-ios'"
echo "  Android: 'npx react-native run-android'" 