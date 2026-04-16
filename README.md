# Biko Todo App

## Short Summary
I built Biko Todo as a clean and practical task management web app that helps me organise daily work, track priorities, and manage tasks securely through Firebase Authentication and Firestore.

## About This App
My name is Clodate Mnisi, and this application was built solely by myself, Clodate Mnisi. I created it to show that I can design and develop a complete frontend and Firebase-powered web application from start to finish using HTML, CSS, JavaScript, and Firebase services.

Biko Todo allows me and my users to:
- create an account and sign in securely
- add, edit, complete, and delete tasks
- assign priority levels to tasks
- add due dates to tasks
- search tasks quickly
- filter tasks by status and priority
- keep each user's tasks private and stored in Firestore

## App Link
My Firebase project is configured as `biko-todo`, so the app can be hosted with the standard Firebase Hosting links below:
- https://biko-todo.web.app
- https://biko-todo.firebaseapp.com

## Technologies I Used
- HTML5
- CSS3
- Vanilla JavaScript
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Visual Studio Code

## How To Run My App In VS Code
1. I open the project folder in Visual Studio Code.
2. I make sure all project files are in the same folder, including `index.html`, `styles.css`, `app.js`, and `firebase.js`.
3. I install the VS Code `Live Server` extension if I want a quick local preview.
4. I right-click `index.html` and choose `Open with Live Server`, or I open the file directly in the browser.
5. If I update the Firebase configuration, I refresh the browser so the app reconnects with the correct project settings.

## Firebase Setup Instructions
1. I go to the Firebase Console: https://console.firebase.google.com
2. I create a new Firebase project or open my existing project named `biko-todo`.
3. I open `Project settings` and register a Web App if I have not already done so.
4. I copy the Firebase configuration values and place them inside [firebase.js](C:/Users/cloda/OneDrive/Documents/BIKO%202026/TO%20DO%20LIST/todo-app/firebase.js).
5. I open `Authentication`, then enable `Email/Password` sign-in.
6. I open `Firestore Database`, create the database, and start in the appropriate mode for my project.
7. I make sure my Firestore rules protect each signed-in user's data properly before production use.

## Important Project Files
- [index.html](C:/Users/cloda/OneDrive/Documents/BIKO%202026/TO%20DO%20LIST/todo-app/index.html): I use this file for the app structure and layout.
- [styles.css](C:/Users/cloda/OneDrive/Documents/BIKO%202026/TO%20DO%20LIST/todo-app/styles.css): I use this file for the full visual design and responsive styling.
- [app.js](C:/Users/cloda/OneDrive/Documents/BIKO%202026/TO%20DO%20LIST/todo-app/app.js): I use this file for task logic, filtering, authentication flow, and user interactions.
- [firebase.js](C:/Users/cloda/OneDrive/Documents/BIKO%202026/TO%20DO%20LIST/todo-app/firebase.js): I use this file to connect my app to Firebase.

## Features I Included
- secure registration and login
- user-specific task storage
- task creation and task editing
- task completion and task deletion
- search and filtering tools
- due dates and priority tags
- responsive layout for desktop and mobile
- minimal interface for a smoother user experience

## How To Use My App
1. I register a new account or log in with an existing account.
2. I open my dashboard after authentication.
3. I add a task title, description, priority, and due date.
4. I save the task and view it instantly in my task list.
5. I use the task buttons to mark a task as done, edit it, or delete it.
6. I use the filter and search tools to find tasks faster.
7. I log out when I am finished.

## Notes For A Client Or Reviewer
- I built this app in a way that keeps each user's tasks connected to that user's account.
- I used Firebase because it gives me authentication, database storage, and hosting in one ecosystem.
- I kept the design minimal so the app feels clean, focused, and easy to use.
- I improved the interface to make task management smoother and more user friendly.

## Deployment
If I want to deploy the project again with Firebase Hosting, I can use:

```bash
firebase login
firebase init hosting
firebase deploy
```

## Final Statement
I developed this project independently as Clodate Mnisi, and it reflects my own work, my technical skills, and my approach to building a useful client-ready web application.
