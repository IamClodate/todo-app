# Biko Todo App

## 🔗 Live Application
I have deployed my application here:
https://bikotodo.netlify.app

## 🧠 Backend Dashboard (Quick Access)
For backend access during demos or testing, I use:
https://app.supabase.com/project/wwbbrowrjipvzhstglkx

## 📦 GitHub Repository
This is my full project repository:
https://github.com/IamClodate/todo-app

---

## 👩‍💻 About This Project
My name is Clodate Mnisi, and I built this full-stack application entirely on my own.

I created Biko Todo to demonstrate my ability to design, build, and deploy a real-world web application from start to finish. This includes frontend development, backend integration, authentication, database management, and deployment.

The application is designed to help users manage their daily tasks in a clean, efficient, and secure way.

---

## 🚀 What The App Does
With this app, I can:

- register and log in securely
- create, edit, and delete tasks
- mark tasks as completed or pending
- assign priority levels (Low, Medium, High)
- set due dates for tasks
- search tasks instantly
- filter tasks by status and priority
- view task statistics (total, completed, pending, overdue)
- ensure each user only sees their own tasks

---

## 🧰 Technologies I Used
- HTML5  
- CSS3  
- Vanilla JavaScript  
- Supabase (Authentication + PostgreSQL Database)  
- Row Level Security (RLS)  
- Netlify (Hosting & Auto Deployment)  
- Git & GitHub  

---

## 🔐 Backend (Supabase)
I use Supabase as my backend for authentication and database management.

### Backend API Base URL
https://wwbbrowrjipvzhstglkx.supabase.co

---

## ⚡ How I Access the Database (For Demo or Debugging)

When I need to quickly access the database, I do the following:

1. Open:
   https://app.supabase.com/project/wwbbrowrjipvzhstglkx  

2. Click on:
   **Table Editor**

3. Select:
   **tasks table**

4. From there I can:
   - view all stored tasks
   - see which user created each task
   - check task status (completed or pending)
   - verify priorities and due dates

This is especially useful during presentations to show that the backend is working in real time.

---

## 🎤 How I Demonstrate the App

During a demo, I usually:

1. Open the live app  
   https://bikotodo.netlify.app  

2. Log in or register  

3. Add a new task  

4. Open the Supabase dashboard  

5. Refresh the `tasks` table  

The new task appears immediately, which shows that the frontend is correctly connected to the backend.

---

## 🔒 Security
I implemented security using Supabase Row Level Security (RLS):

- each task is linked to a specific user  
- users can only view their own tasks  
- users cannot access other users’ data  
- authentication is handled securely via Supabase Auth  

---

## 📁 Project Structure

todo-app/
│
├── index.html
├── styles.css
├── app.js
├── assets/
├── README.md
├── .gitignore


---

## ⚙️ How I Run the App Locally

1. I open the project folder in VS Code  
2. I open `index.html` in the browser  

OR  

I use the Live Server extension for automatic reload  

---

## 🔁 Automatic Deployment (GitHub → Netlify)

I connected my GitHub repository to Netlify for automatic deployment.

This means:
- every time I push code to GitHub  
- Netlify automatically rebuilds and updates the live app  

### Git Commands I Use
```bash
git add .
git commit -m "update"
git push
🌐 Deployment Overview
Frontend: Netlify
Backend: Supabase
Version Control: GitHub
💡 Key Highlights of My App
built as a full-stack application independently
uses real authentication and database (not mock data)
secure backend using Row Level Security
clean and responsive UI design
live production deployment
automatic updates through GitHub integration
🧪 Example Use Case

A user can:

log in securely
create tasks for daily activities
set priorities and deadlines
track progress
manage productivity from a single dashboard
👩‍💻 Author

Clodate Mnisi

📌 Final Note

I developed this project entirely on my own. It reflects my ability to build, secure, and deploy a complete full-stack web application using modern tools and best practices.