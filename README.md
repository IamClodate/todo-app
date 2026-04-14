# Biko Todo App

A vanilla HTML, CSS, and JavaScript task manager connected to Firebase Auth and Firestore.

## What this app includes

- User registration and login with Firebase Authentication
- User-specific task persistence in Cloud Firestore
- Create, edit, complete, and delete tasks
- Task filtering by status and priority
- Task search by title
- Logout support

## Setup

1. Open the `todo-app` folder in your editor.
2. Replace the placeholder config values in `firebase.js` with your Firebase project values.
3. Start the app by opening `index.html` in a browser, or serve it from a local static server.

## Firebase configuration

Create a Firebase project and enable:

- Authentication > Email/Password
- Firestore Database

Then update `firebase.js`:

```js
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

## Notes

- The app stores tasks in a Firestore collection called `tasks`.
- Each task is saved with the signed-in user UID.
- For production, tighten Firestore rules so only authenticated users can read/write their own tasks.

## Local testing

1. Open the `todo-app` folder.
2. Replace the placeholder config values in `firebase.js` with your Firebase project settings.
3. Open `index.html` in a browser, or run a static server such as `npx serve .`.

## Deployment

This app can be deployed as static files because it uses only HTML, CSS, and JavaScript.

- For GitHub Pages, enable Pages in repository settings and publish from the `main` branch.
- Or use Vercel/Netlify by pointing to the `todo-app` folder.

## Assessment checklist

- Authentication with Firebase Auth: register, login, logout
- Task persistence in Firestore per authenticated user
- Create, read, update, delete tasks
- Task filtering by status and priority
- Task search by title
- User-friendly dashboard and responsive layout
