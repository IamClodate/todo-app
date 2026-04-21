# Biko Workspace

Premium task management portal with two experiences in one app:

- normal users can register, log in, and manage only their own tasks
- admins can monitor all tasks, assign work, review activity, and view analytics/reporting

## Files

- `index.html` - application structure
- `styles.css` - premium UI styling
- `app.js` - Supabase auth, role-aware logic, analytics, admin dashboard behavior
- `supabase-setup.sql` - database schema, triggers, and RLS policies required for full admin features

## Backend setup

1. Open your Supabase project SQL editor.
2. Run `supabase-setup.sql`.
3. Promote your admin account by inserting its user id into `admin_users`.
4. Make sure your `tasks` table data is still present, or let the script create it if it does not exist.

Example admin promotion query:

```sql
insert into public.admin_users (user_id)
select id
from public.user_profiles
where email = 'clodatemnisi@gmail.com'
on conflict do nothing;
```

## What the app now supports

- login and registration with Supabase Auth
- personal task privacy for normal users
- admin access across the whole system
- admin assignment of tasks to any registered user
- activity feed backed by `activity_logs`
- profile-aware user directory backed by `user_profiles`
- analytics cards for completion, urgency, and user activity
- executive-style reports generated from live workspace data
- responsive premium UI for desktop and mobile

## Local run

Use a local server such as VS Code Live Server so ES modules and browser imports work correctly.

## Important note

The app will still load if the extra admin tables are missing, but the full admin portal becomes complete only after `supabase-setup.sql` is applied.
