# React Native Expo App

A mobile application built with **React Native** and **Expo**.

## Features

- Cross-platform (Android & iOS)
- Fast development with Expo
- Modern React Native architecture
- Easy setup and deployment

## Prerequisites

Before running the project, make sure you have installed:

- Node.js (LTS version)
- npm or yarn
- Git
- Expo Go (Android/iOS) or Android Studio/Xcode (optional)

Check your installation:

```bash
node -v
npm -v
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repository.git
```

### 2. Navigate to the project folder

```bash
cd your-repository
```

### 3. Install dependencies

```bash
npm install
```

or

```bash
yarn
```

## Running the Project

Start the Expo development server:

```bash
npx expo start
```

or

```bash
npm start
```

## Run on Android

Using Expo Go:

1. Install **Expo Go** from the Play Store.
2. Run:

```bash
npx expo start
```

3. Scan the QR code with Expo Go.

Using Android Emulator:

```bash
npx expo start --android
```

## Run on iOS

(macOS only)

```bash
npx expo start --ios
```

Or scan the QR code using Expo Go on your iPhone.

## Run on Web

```bash
npx expo start --web
```

## Project Structure

```
project-root/
│
├── assets/
├── components/
├── screens/
├── navigation/
├── app/
├── hooks/
├── constants/
├── services/
├── utils/
├── package.json
├── app.json
└── README.md
```

## Useful Commands

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npx expo start
```

Clear Expo cache:

```bash
npx expo start --clear
```

Check project health:

```bash
npx expo doctor
```

Update Expo packages:

```bash
npx expo install --fix
```

## Building the App

Install EAS CLI:

```bash
npm install -g eas-cli
```

Login:

```bash
eas login
```

Configure the project:

```bash
eas build:configure
```

Build Android APK/AAB:

```bash
eas build --platform android
```

Build iOS:

```bash
eas build --platform ios
```

## Troubleshooting

If dependencies are corrupted:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

For Windows:

```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

Clear Expo cache:

```bash
npx expo start --clear
```

## Technologies Used

- React Native
- Expo
- JavaScript / TypeScript
- React Navigation
- Expo SDK

## License

This project is licensed under the MIT License.

## Author

Your Name

GitHub: https://github.com/your-username
