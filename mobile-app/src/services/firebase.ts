import firebase from '@react-native-firebase/app';
import '@react-native-firebase/analytics';

// For native mobile, Firebase automatically picks up the configuration 
// from google-services.json (Android) and GoogleService-Info.plist (iOS).
// No manual config object is required if initialized this way.

if (!firebase.apps.length) {
  firebase.initializeApp({});
}

const app = firebase.app();
const analytics = firebase.analytics();

export { app, analytics };
