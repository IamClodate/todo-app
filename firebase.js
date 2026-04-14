// Load the Firebase SDK modules from the Firebase CDN.
// We use the Firebase app module, authentication module, and Firestore module.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

// Firebase project configuration.
// Replace each placeholder value with the config values from your Firebase Console.
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Initialize Firebase with the config values above.
const app = initializeApp(firebaseConfig);

// Export the authentication and Firestore services for use in the app.
export const auth = getAuth(app);
export const db = getFirestore(app);
