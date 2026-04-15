// Load the Firebase SDK modules from the Firebase CDN.
// We use the Firebase app module, authentication module, and Firestore module.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

// Firebase project configuration.
// Replace each placeholder value with the config values from your Firebase Console.
const firebaseConfig = {
  apiKey: 'AIzaSyDXe4AiGL4Q5GCoFyh2v5gWeZXvUkplcN0',
  authDomain: 'biko-todo.firebaseapp.com',
  projectId: 'biko-todo',
  storageBucket: 'biko-todo.firebasestorage.app',
  messagingSenderId: '263332279098',
  appId: '1:263332279098:web:57c2a3a7aefd963d3a1603',
  measurementId: 'G-M31ECYTLCV',
};

const hasPlaceholderConfig = Object.values(firebaseConfig).some(
  (value) => typeof value === 'string' && value.startsWith('YOUR_')
);

if (hasPlaceholderConfig) {
  throw new Error(
    'Firebase config is not set. Open firebase.js and replace all YOUR_* values with your Firebase project settings.'
  );
}

// Initialize Firebase with the config values above.
const app = initializeApp(firebaseConfig);

// Export the authentication and Firestore services for use in the app.
export const auth = getAuth(app);
export const db = getFirestore(app);
