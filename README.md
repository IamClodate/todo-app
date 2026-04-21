# Biko Workspace

Biko Workspace is a premium full-stack task management web application with secure authentication, personal task privacy, and a powerful admin portal for monitoring activity across the system. Normal users only see and manage their own tasks, while the admin can view all users, manage all tasks, review activity logs, and track analytics and reports from one dashboard.

I created this application entirely on my own, from the UI design to the frontend logic, backend integration, authentication flow, database structure, role-based access, admin experience, and deployment setup.

## Live Links

- Live App: https://bikotodo.netlify.app
- Admin Portal: https://bikotodo.netlify.app
- Supabase Project Dashboard: https://app.supabase.com/project/wwbbrowrjipvzhstglkx
- Supabase API URL: https://wwbbrowrjipvzhstglkx.supabase.co
- GitHub Repository: https://github.com/IamClodate/todo-app

## Quick Summary

This project demonstrates my ability to build a real-world full-stack product independently.

It includes:

- secure user registration and login
- private user task management
- admin-only system-wide visibility
- analytics and reporting
- activity monitoring
- premium responsive UI
- live deployment and GitHub-based update workflow

## Why This Project Stands Out

This is not just a basic to-do list. It is a role-aware task management platform with a real backend and an admin control layer.

What makes it stronger as a portfolio project:

- built as a complete full-stack application, not a mock frontend
- uses Supabase authentication and PostgreSQL-backed data
- protects user data with Row Level Security
- includes an admin experience with monitoring and reporting
- designed with a polished premium interface instead of a default template look
- deployed live and version-controlled professionally with GitHub

## Core Features

- User registration and login with Supabase Auth
- Private task creation, editing, completion, and deletion
- Priority levels: low, medium, high
- Due dates and overdue tracking
- Search and filtering
- Personal productivity statistics
- Admin dashboard for viewing all tasks across the system
- Admin ability to assign tasks to users
- User insights and activity monitoring
- Report cards and analytics summaries
- Responsive experience for desktop and mobile

## Admin Portal

The admin portal is accessed through the same live application link:

- Admin Portal URL: https://bikotodo.netlify.app

To enter admin mode, log in with an account that has been added to the `admin_users` table in Supabase.

Admin capabilities include:

- view all tasks across the system
- filter tasks by owner
- assign tasks to users
- monitor recent user activity
- review analytics and report summaries
- inspect user-level task performance

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)
- Netlify
- GitHub

## Project Files

- `index.html` - application structure and dashboard layout
- `styles.css` - premium responsive styling and visual system
- `app.js` - application logic, authentication, admin behavior, analytics, and task operations
- `supabase-setup.sql` - backend setup script for database tables, triggers, and RLS policies

## Backend Setup

Use this Supabase project:

- Supabase Dashboard: https://app.supabase.com/project/wwbbrowrjipvzhstglkx
- Supabase API URL: https://wwbbrowrjipvzhstglkx.supabase.co

### Step 1: Run the SQL setup

1. Open the Supabase SQL Editor.
2. Open the local file `supabase-setup.sql`.
3. Copy the full SQL script.
4. Paste it into Supabase SQL Editor.
5. Click `Run`.

This script sets up:

- `user_profiles`
- `admin_users`
- `activity_logs`
- `tasks` structure and hardening
- triggers for profile/task updates
- Row Level Security policies for users and admins

### Step 2: Promote your admin account

After registering your admin email in the app, run this query in Supabase:

```sql
insert into public.admin_users (user_id)
select id
from public.user_profiles
where email = 'clodatemnisi@gmail.com'
on conflict do nothing;
```

That gives the account full admin portal access.

## How To Run Locally

1. Open the project in VS Code.
2. Install the `Live Server` extension if needed.
3. Right-click `index.html`.
4. Click `Open with Live Server`.
5. Open the local URL shown in your browser.

Important:

- use Live Server instead of opening the file directly
- this is required because `app.js` uses browser ES module imports

## How To Demonstrate The App

1. Open the live app:
   https://bikotodo.netlify.app
2. Register a normal user and create tasks.
3. Log out.
4. Log in with the admin account.
5. Show the admin dashboard, all tasks view, analytics, activity, and user insights.
6. Open Supabase to show that the backend is storing real data in real time:
   https://app.supabase.com/project/wwbbrowrjipvzhstglkx

## Security

This app uses Supabase Row Level Security to protect user data.

Security model:

- normal users can only access their own task data
- admins can access all system tasks and supporting admin data
- authentication is handled through Supabase Auth
- admin capability is controlled through the `admin_users` table

## Deployment

- Frontend Hosting: Netlify
- Live Production URL: https://bikotodo.netlify.app
- Source Control: GitHub
- Repository URL: https://github.com/IamClodate/todo-app

If Netlify is connected to your GitHub repository, every push to GitHub can trigger automatic deployment.

## GitHub Update Commands

Use these commands whenever you make changes and want to push them immediately:

```bash
git add .
git commit -m "update project"
git push origin main
```

If Netlify is connected to GitHub, that push will automatically update the live deployed app.

## Recommended Workflow

```bash
git status
git add .
git commit -m "describe your change"
git push origin main
```

## What This Project Says About Me

This project reflects my ability to:

- build full-stack applications independently
- design clean and professional user interfaces
- integrate real backend services
- implement secure authentication and access control
- think beyond CRUD by adding admin workflows and analytics
- deploy, maintain, and improve production-ready software

## Author

Clodate Mnisi

## Final Note

I built this app alone as a complete end-to-end project. It represents my frontend skills, backend integration skills, design sensibility, security awareness, and ability to ship a polished real-world product that goes beyond a beginner demo.
