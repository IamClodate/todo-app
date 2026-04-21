
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

  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('user_id', currentUser.id)
  }

  const { data, error } = await query

  if (error) {
    console.error(error)
    return
  }

  tasks = data
  renderTasks()
}
// async function loadTasks() {
//   if (!currentUser) return

//   const { data, error } = await supabase
//     .from('tasks')
//     .select('*')
//     .eq('user_id', currentUser.id)
//     .order('created_at', { ascending: false })

//   if (error) {
//     console.error(error)
//     return
//   }

//   tasks = data
//   renderTasks()
// }

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

  // for admin portal
  ${isAdmin ? `<p class="admin-user">👤 ${task.user_id}</p>` : ''}
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
// logoutButton.addEventListener('click', async () => {
//   await supabase.auth.signOut()
//   currentUser = null
//   tasks = []
//   showAuth()
// })

// logout button
logoutButton.addEventListener('click', async () => {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (!confirmLogout) return;

  await supabase.auth.signOut();
  currentUser = null;
  tasks = [];
  showAuth();
});

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

// window.deleteTask = async (id) => {
//   await supabase
//     .from('tasks')
//     .delete()
//     .eq('id', id)

//   loadTasks()
// }

// delete popup confirmation
window.deleteTask = async (id) => {
  const confirmDelete = confirm("⚠ You are about to delete this task. Continue?");
  if (!confirmDelete) return;

  await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  loadTasks();
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


// for admin portal
const ADMIN_EMAIL = "your-email@example.com"

let isAdmin = false

supabase.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null

  if (currentUser) {
    isAdmin = currentUser.email === "your-email@example.com"

    welcomeText.textContent =
      `Welcome ${currentUser.user_metadata?.full_name || currentUser.email}`

    showDashboard()
    loadTasks()
  } else {
    showAuth()
  }
})

const dashboardTitle = document.getElementById('dashboard-title')

if (isAdmin) {
  dashboardTitle.textContent = "Admin Dashboard"
}