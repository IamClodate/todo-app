// import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// const supabaseUrl = 'https://wwbbrowrjipvzhstglkx.supabase.co'
// const supabaseKey = 'YOUR_ANON_KEY'
// const supabase = createClient(supabaseUrl, supabaseKey)


// // ===================== DOM ELEMENTS =====================
// const authScreen = document.getElementById('auth-screen');
// const dashboardScreen = document.getElementById('dashboard-screen');

// const loginTab = document.getElementById('login-tab');
// const registerTab = document.getElementById('register-tab');
// const nameField = document.getElementById('name-field');
// const confirmPasswordField = document.getElementById('confirm-password-field');
// const authForm = document.getElementById('auth-form');
// const authError = document.getElementById('auth-error');
// const authSubmit = document.getElementById('auth-submit');
// const fullNameInput = document.getElementById('full-name');
// const emailInput = document.getElementById('auth-email');
// const passwordInput = document.getElementById('auth-password');
// const confirmPasswordInput = document.getElementById('confirm-password');

// const welcomeText = document.getElementById('welcome-text');
// const logoutButton = document.getElementById('logout-button');
// const taskForm = document.getElementById('task-form');
// const taskTitle = document.getElementById('task-title');
// const taskDescription = document.getElementById('task-description');
// const taskPriority = document.getElementById('task-priority');
// const taskDueDate = document.getElementById('task-due-date');
// const editTaskId = document.getElementById('edit-task-id');
// const taskFormTitle = document.getElementById('task-form-title');
// const taskError = document.getElementById('task-error');
// const saveTaskButton = document.getElementById('save-task');
// const cancelEditButton = document.getElementById('cancel-edit');
// const filterStatus = document.getElementById('filter-status');
// const filterPriority = document.getElementById('filter-priority');
// const searchQuery = document.getElementById('search-query');
// const clearFiltersButton = document.getElementById('clear-filters');
// const tasksList = document.getElementById('tasks-list');
// const totalCount = document.getElementById('total-count');
// const completedCount = document.getElementById('completed-count');
// const pendingCount = document.getElementById('pending-count');
// const overdueCount = document.getElementById('overdue-count');
// const toastRegion = document.getElementById('toast-region');


// // ===================== STATE =====================
// let authMode = 'login';
// let currentUser = null;
// let taskDocuments = [];
// let activeToastTimeouts = [];

// const PRIORITY_VALUES = ['low', 'medium', 'high'];
// const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
// const MAX_TITLE_LENGTH = 80;
// const MAX_DESCRIPTION_LENGTH = 280;


// // ===================== UI HELPERS =====================
// function showElement(el) { el.classList.remove('hidden'); }
// function hideElement(el) { el.classList.add('hidden'); }

// function clearNode(node) {
//   while (node.firstChild) node.removeChild(node.firstChild);
// }

// function showError(el, msg) {
//   el.textContent = msg;
//   el.classList.remove('hidden');
// }

// function clearError(el) {
//   el.textContent = '';
//   el.classList.add('hidden');
// }

// function showToast(message, type = 'info') {
//   const toast = document.createElement('div');
//   toast.className = `toast toast-${type}`;
//   toast.textContent = message;
//   toastRegion.appendChild(toast);

//   requestAnimationFrame(() => toast.classList.add('visible'));

//   const timeout = setTimeout(() => {
//     toast.classList.remove('visible');
//     setTimeout(() => toast.remove(), 200);
//   }, 2500);

//   activeToastTimeouts.push(timeout);
// }


// // ===================== TASK LOADER (SUPABASE) =====================
// async function loadTasks() {
//   if (!currentUser) return;

//   const { data, error } = await supabase
//     .from('tasks')
//     .select('*')
//     .eq('user_id', currentUser.id)
//     .order('created_at', { ascending: false });

//   if (error) {
//     showError(taskError, 'Failed to load tasks');
//     console.error(error);
//     return;
//   }

//   taskDocuments = data.map(task => ({
//     id: task.id,
//     title: task.title,
//     description: task.description,
//     priority: task.priority,
//     dueDate: task.due_date,
//     completed: task.completed,
//     userId: task.user_id
//   }));

//   renderTasks();
// }


// // ===================== AUTH =====================
// async function handleAuthSubmit(e) {
//   e.preventDefault();
//   clearError(authError);

//   const email = emailInput.value.trim().toLowerCase();
//   const password = passwordInput.value;

//   try {
//     if (authMode === 'login') {
//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//       });
//       if (error) throw error;

//     } else {
//       const name = fullNameInput.value.trim();

//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: { full_name: name }
//         }
//       });

//       if (error) throw error;
//     }

//   } catch (err) {
//     showError(authError, err.message);
//   }
// }


// // ===================== TASK SUBMIT =====================
// async function handleTaskSubmit(e) {
//   e.preventDefault();
//   clearError(taskError);

//   if (!currentUser) return;

//   const title = taskTitle.value.trim();
//   const description = taskDescription.value.trim();
//   const priority = taskPriority.value;
//   const dueDate = taskDueDate.value || null;
//   const taskId = editTaskId.value;

//   try {

//     if (taskId) {
//       await supabase
//         .from('tasks')
//         .update({
//           title,
//           description,
//           priority,
//           due_date: dueDate,
//           updated_at: new Date()
//         })
//         .eq('id', taskId);

//       showToast('Task updated', 'success');

//     } else {
//       await supabase
//         .from('tasks')
//         .insert([{
//           title,
//           description,
//           priority,
//           due_date: dueDate,
//           completed: false,
//           user_id: currentUser.id
//         }]);

//       showToast('Task created', 'success');
//     }

//     await loadTasks();
//     resetTaskForm();

//   } catch (err) {
//     showError(taskError, err.message);
//   }
// }


// // ===================== TASK ACTIONS =====================
// async function handleTaskAction(e) {
//   const btn = e.target.closest('button[data-action]');
//   if (!btn) return;

//   const action = btn.dataset.action;
//   const id = btn.dataset.id;

//   const task = taskDocuments.find(t => t.id === id);
//   if (!task) return;

//   try {

//     if (action === 'toggle') {
//       await supabase
//         .from('tasks')
//         .update({
//           completed: !task.completed,
//           updated_at: new Date()
//         })
//         .eq('id', id);

//       await loadTasks();
//     }

//     if (action === 'delete') {
//       await supabase
//         .from('tasks')
//         .delete()
//         .eq('id', id);

//       await loadTasks();
//     }

//     if (action === 'edit') {
//       taskTitle.value = task.title;
//       taskDescription.value = task.description || '';
//       taskPriority.value = task.priority;
//       taskDueDate.value = task.dueDate || '';
//       editTaskId.value = task.id;
//     }

//   } catch (err) {
//     console.error(err);
//   }
// }


// // ===================== RENDER TASKS (UNCHANGED LOGIC) =====================
// function renderTasks() {
//   const filtered = taskDocuments;

//   if (!filtered.length) {
//     tasksList.innerHTML = `<p>No tasks yet</p>`;
//     return;
//   }

//   tasksList.innerHTML = filtered.map(task => `
//     <div class="task-card">
//       <h3>${task.title}</h3>
//       <p>${task.description || ''}</p>

//       <button data-action="toggle" data-id="${task.id}">
//         Toggle
//       </button>

//       <button data-action="edit" data-id="${task.id}">
//         Edit
//       </button>

//       <button data-action="delete" data-id="${task.id}">
//         Delete
//       </button>
//     </div>
//   `).join('');
// }


// // ===================== RESET =====================
// function resetTaskForm() {
//   taskForm.reset();
//   editTaskId.value = '';
// }


// // ===================== AUTH LISTENER =====================
// supabase.auth.onAuthStateChange((event, session) => {
//   currentUser = session?.user || null;

//   if (currentUser) {
//     welcomeText.textContent =
//       `Welcome ${currentUser.user_metadata?.full_name || currentUser.email}`;

//     showElement(dashboardScreen);
//     hideElement(authScreen);

//     loadTasks();

//   } else {
//     showElement(authScreen);
//     hideElement(dashboardScreen);
//     taskDocuments = [];
//     renderTasks();
//   }
// });


// // ===================== EVENTS =====================
// authForm.addEventListener('submit', handleAuthSubmit);
// taskForm.addEventListener('submit', handleTaskSubmit);
// tasksList.addEventListener('click', handleTaskAction);

// logoutButton.addEventListener('click', async () => {
//   await supabase.auth.signOut();
// });

console.log("APP LOADED")
console.log("🔥 APP IS RUNNING");
console.log("🔥 APP LOADED - SUPABASE ACTIVE")

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://wwbbrowrjipvzhstglkx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3YmJyb3dyamlwdnpoc3RnbGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTIxMjgsImV4cCI6MjA5MjE4ODEyOH0.beslyN3mmgBUYt1ndBwejJy4Elgovzr0KKpxw9QwNjQ'

const supabase = createClient(supabaseUrl, supabaseKey)

/* ---------------- DOM ---------------- */
const authScreen = document.getElementById('auth-screen')
const dashboardScreen = document.getElementById('dashboard-screen')

const loginTab = document.getElementById('login-tab')
const registerTab = document.getElementById('register-tab')

const authForm = document.getElementById('auth-form')
const authError = document.getElementById('auth-error')
const authSubmit = document.getElementById('auth-submit')

const fullNameInput = document.getElementById('full-name')
const emailInput = document.getElementById('auth-email')
const passwordInput = document.getElementById('auth-password')
const confirmPasswordInput = document.getElementById('confirm-password')

const welcomeText = document.getElementById('welcome-text')
const logoutButton = document.getElementById('logout-button')

const taskForm = document.getElementById('task-form')
const taskTitle = document.getElementById('task-title')
const taskDescription = document.getElementById('task-description')
const taskPriority = document.getElementById('task-priority')
const taskDueDate = document.getElementById('task-due-date')
const editTaskId = document.getElementById('edit-task-id')

const taskError = document.getElementById('task-error')
const tasksList = document.getElementById('tasks-list')

const filterStatus = document.getElementById('filter-status')
const filterPriority = document.getElementById('filter-priority')
const searchQuery = document.getElementById('search-query')
const clearFiltersButton = document.getElementById('clear-filters')

const totalCount = document.getElementById('total-count')
const completedCount = document.getElementById('completed-count')
const pendingCount = document.getElementById('pending-count')
const overdueCount = document.getElementById('overdue-count')

/* ---------------- STATE ---------------- */
let currentUser = null
let tasks = []
let authMode = 'login'

/* ---------------- UI HELPERS ---------------- */
const show = el => el.classList.remove('hidden')
const hide = el => el.classList.add('hidden')

function showError(el, msg) {
  el.textContent = msg
  show(el)
}

function clearError(el) {
  el.textContent = ''
  hide(el)
}

/* ---------------- AUTH UI ---------------- */
function setAuthMode(mode) {
  authMode = mode

  if (mode === 'login') {
    loginTab.classList.add('active')
    registerTab.classList.remove('active')
    hide(document.getElementById('name-field'))
    hide(document.getElementById('confirm-password-field'))
    authSubmit.textContent = 'Login'
  } else {
    registerTab.classList.add('active')
    loginTab.classList.remove('active')
    show(document.getElementById('name-field'))
    show(document.getElementById('confirm-password-field'))
    authSubmit.textContent = 'Register'
  }
}

function showDashboard() {
  hide(authScreen)
  show(dashboardScreen)
}

function showAuth() {
  show(authScreen)
  hide(dashboardScreen)
}

/* ---------------- TASK LOADING ---------------- */
async function loadTasks() {
  if (!currentUser) return

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  tasks = data
  renderTasks()
}

/* ---------------- RENDER ---------------- */
function renderTasks() {
  let filtered = [...tasks]

  const status = filterStatus.value
  const priority = filterPriority.value
  const search = searchQuery.value.toLowerCase()

  if (status !== 'all') {
    filtered = filtered.filter(t =>
      status === 'completed' ? t.completed : !t.completed
    )
  }

  if (priority !== 'all') {
    filtered = filtered.filter(t => t.priority === priority)
  }

  if (search) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(search)
    )
  }

  tasksList.innerHTML = filtered.map(task => `
    <div class="task-card">
      <h3>${task.title}</h3>
      <p>${task.description || ''}</p>

      <small>
        Priority: ${task.priority} |
        Due: ${task.due_date || 'None'}
      </small>

      <div class="task-actions">
        <button onclick="toggleTask('${task.id}', ${task.completed})">
          ${task.completed ? 'Undo' : 'Done'}
        </button>

        <button onclick="editTask('${task.id}')">Edit</button>

        <button onclick="deleteTask('${task.id}')">Delete</button>
      </div>
    </div>
  `).join('')

  totalCount.textContent = tasks.length
  completedCount.textContent = tasks.filter(t => t.completed).length
  pendingCount.textContent = tasks.filter(t => !t.completed).length
  overdueCount.textContent = tasks.filter(t =>
    !t.completed && t.due_date && new Date(t.due_date) < new Date()
  ).length
}

/* ---------------- AUTH ---------------- */
authForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearError(authError)

  const email = emailInput.value
  const password = passwordInput.value
  const name = fullNameInput.value

  try {
    if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      currentUser = data.user
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      })

      if (error) throw error
      currentUser = data.user
    }

    showDashboard()
    loadTasks()

  } catch (err) {
    showError(authError, err.message)
  }
})

/* ---------------- LOGOUT ---------------- */
logoutButton.addEventListener('click', async () => {
  await supabase.auth.signOut()
  currentUser = null
  tasks = []
  showAuth()
})

/* ---------------- CREATE / UPDATE TASK ---------------- */
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const id = editTaskId.value

  const payload = {
    title: taskTitle.value,
    description: taskDescription.value,
    priority: taskPriority.value,
    due_date: taskDueDate.value || null,
    user_id: currentUser.id
  }

  if (id) {
    await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
  } else {
    await supabase
      .from('tasks')
      .insert([{
        ...payload,
        completed: false
      }])
  }

  taskForm.reset()
  editTaskId.value = ''
  loadTasks()
})

/* ---------------- ACTIONS ---------------- */
window.toggleTask = async (id, completed) => {
  await supabase
    .from('tasks')
    .update({ completed: !completed })
    .eq('id', id)

  loadTasks()
}

window.deleteTask = async (id) => {
  await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  loadTasks()
}

window.editTask = (id) => {
  const task = tasks.find(t => t.id === id)

  taskTitle.value = task.title
  taskDescription.value = task.description
  taskPriority.value = task.priority
  taskDueDate.value = task.due_date
  editTaskId.value = task.id
//  set the focus and clear the form after submit
  taskTitle.focus()
}

/* ---------------- FILTERS ---------------- */
filterStatus.addEventListener('change', renderTasks)
filterPriority.addEventListener('change', renderTasks)
searchQuery.addEventListener('input', renderTasks)

clearFiltersButton.addEventListener('click', () => {
  filterStatus.value = 'all'
  filterPriority.value = 'all'
  searchQuery.value = ''
  renderTasks()
})


/* ---------------- AUTH STATE ---------------- */
supabase.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null

  if (currentUser) {
    welcomeText.textContent =
      `Welcome ${currentUser.user_metadata?.full_name || currentUser.email}`

    showDashboard()
    loadTasks()
  } else {
    showAuth()
  }
})

/* INIT */
setAuthMode('login')
showAuth()

loginTab.addEventListener('click', () => setAuthMode('login'))
registerTab.addEventListener('click', () => setAuthMode('register'))
