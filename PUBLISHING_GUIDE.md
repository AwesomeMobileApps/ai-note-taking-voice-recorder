# Hermit Weekend Publishing Guide

This guide provides step-by-step instructions for publishing your Hermit Weekend app to both the Apple App Store and Google Play Store.

## Table of Contents

1. [Preparing Your App for Release](#preparing-your-app-for-release)
2. [Publishing to Apple App Store](#publishing-to-apple-app-store)
3. [Publishing to Google Play Store](#publishing-to-google-play-store)
4. [Post-Publishing Considerations](#post-publishing-considerations)

## Preparing Your App for Release

Before submitting to either store, complete these preparation steps:

### 1. Update App Version

Update your app version in the following files:

- For iOS: `ios/HermitWeekend/Info.plist` (CFBundleShortVersionString and CFBundleVersion)
- For Android: `android/app/build.gradle` (versionCode and versionName)

### 2. Create App Icons and Splash Screens

Generate app icons and splash screens for both platforms:

```bash
# Install the react-native-asset generator
npm install -g react-native-asset

# Generate assets (from your project root)
npx react-native-asset generate
```

### 3. Test Your App Thoroughly

- Test on multiple devices and OS versions
- Verify all features work correctly
- Check for any performance issues
- Ensure proper error handling

### 4. Prepare Marketing Materials

- App screenshots (for different device sizes)
- App description
- Keywords for search optimization
- Privacy policy URL
- Support URL

## Publishing to Apple App Store

### 1. Enroll in the Apple Developer Program

If you haven't already, enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year).

### 2. Create an App ID

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to "Certificates, IDs & Profiles"
3. Select "Identifiers" and click the "+" button
4. Select "App IDs" and click "Continue"
5. Enter a description and Bundle ID (e.g., com.yourcompany.hermitweekend)
6. Select necessary capabilities (iCloud, Push Notifications, etc.)
7. Click "Continue" and then "Register"

### 3. Create App Store Connect Record

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" and then the "+" button
3. Select "New App"
4. Fill in the required information:
   - Platform: iOS
   - App Name: Hermit Weekend
   - Primary Language: English (or your preferred language)
   - Bundle ID: Select the one you created
   - SKU: A unique identifier (e.g., HERMITWEEKEND001)
5. Click "Create"

### 4. Configure App Information

In App Store Connect, complete the following sections:

1. **App Information**
   - Privacy Policy URL
   - Category (Productivity)

2. **Pricing and Availability**
   - Price: Free or Paid
   - Availability: Select countries

3. **App Review Information**
   - Contact information
   - Demo account (if needed)
   - Notes for the review team

4. **Version Information**
   - Screenshots (for all required device sizes)
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)

### 5. Configure iCloud Capabilities

1. In Xcode, open your project
2. Select your target and go to "Signing & Capabilities"
3. Click "+" and add "iCloud"
4. Check "iCloud Documents" and specify a container identifier

### 6. Build and Archive Your App

1. In Xcode, select "Generic iOS Device" as the build target
2. Go to Product > Archive
3. When the archive is complete, the Organizer window will appear

### 7. Submit to App Store

1. In the Organizer, select your archive and click "Distribute App"
2. Select "App Store Connect" and click "Next"
3. Choose distribution options and click "Next"
4. Select your App Store Connect application and click "Next"
5. Review the settings and click "Upload"
6. Wait for the upload to complete and processing to finish

### 8. Submit for Review

1. In App Store Connect, go to your app
2. Click on the version you just uploaded
3. Verify all information is complete
4. Click "Submit for Review"

### 9. Monitor Review Status

The review process typically takes 1-3 days. You'll receive email notifications about the status.

## Publishing to Google Play Store

### 1. Create a Google Play Developer Account

Register for a [Google Play Developer account](https://play.google.com/console/signup) ($25 one-time fee).

### 2. Create a New Application

1. Go to the [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Enter app details:
   - App name: Hermit Weekend
   - Default language: English (or your preferred language)
   - App or game: App
   - Free or paid: Choose option
4. Confirm developer program agreement and click "Create app"

### 3. Set Up Your Store Listing

Complete the following sections:

1. **Store listing**
   - App description (short and full)
   - Screenshots (for phone, tablet, etc.)
   - Feature graphic
   - Promo video (optional)
   - App icon

2. **Content rating**
   - Complete the questionnaire

3. **Pricing & distribution**
   - Select free or paid
   - Choose countries for distribution

### 4. Configure App Signing

1. In Android Studio, go to Build > Generate Signed Bundle/APK
2. Select "Android App Bundle" and click "Next"
3. Create a new keystore or use an existing one
4. Fill in the keystore information and click "Next"
5. Select release build variant and click "Finish"

### 5. Create a Release

1. In the Google Play Console, go to your app
2. Navigate to "Production" under "Release" section
3. Click "Create new release"
4. Upload your signed AAB file
5. Add release notes
6. Click "Save" and then "Review release"

### 6. Submit for Review

1. Review all information
2. Click "Start rollout to Production"

### 7. Monitor Review Status

The review process typically takes a few hours to a few days. You'll receive email notifications about the status.

## Post-Publishing Considerations

### 1. Monitor Analytics

- Use App Store Connect and Google Play Console analytics
- Track downloads, user engagement, and retention

### 2. Gather User Feedback

- Respond to user reviews
- Address common issues in updates

### 3. Plan Regular Updates

- Fix bugs
- Add new features
- Improve performance

### 4. Marketing Your App

- Social media promotion
- Content marketing
- App store optimization (ASO)

### 5. Consider Monetization Strategies

- In-app purchases
- Premium features
- Subscription model

## Troubleshooting Common Issues

### Apple App Store Rejections

1. **Privacy Policy Issues**
   - Ensure your privacy policy is comprehensive and accessible

2. **Crashes and Bugs**
   - Test thoroughly before submission

3. **Metadata Issues**
   - Make sure screenshots and descriptions match app functionality

### Google Play Store Rejections

1. **Policy Violations**
   - Review Google Play policies carefully

2. **App Performance**
   - Test on various Android devices

3. **Content Issues**
   - Ensure all content is appropriate for your selected audience

## Additional Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy Center](https://play.google.com/about/developer-content-policy/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/) 