# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app
   Use Expo to launch the Metro bundler:
   ```bash
   npx expo start 
   ```
   If you want to use the Dev Client instead of Expo Go:
   npx expo start --dev-client

3. Prebuild (Generate Android/iOS Native Projects)

   Run this whenever you add native modules or change native config:
   ```
      npx expo prebuild
   ```
4. Run on Android (Debug)
   ```
   npx expo run:android --variant debug
   ```
   --OR simply --
   ```
   npx expo run:android
   ```

5. Run on Android (Release)
   Build and install the release variant:
   ```
   npx expo run:android --variant release
   ```

6. Build APK (Standalone)
   Generate a standalone APK:

   Debug APK
      ./gradlew assembleDebug

   Release APK
      ./gradlew assembleRelease


   Output files will be located under:
      android/app/build/outputs/apk/

7. Export for EAS-Free Android App Bundles
   (Useful for building offline bundles without cloud builds)
      npx expo export --platform android

8. Useful Commands
   List attached Android devices:
   ```
      adb devices
   ```


9. Project Structure

Your app code lives inside the app/ directory
(file-based routing via Expo Router).

Native Android project lives inside android/
(after running npx expo prebuild).

10. 

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
