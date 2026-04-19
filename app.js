import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://wwbbrowrjipvzhstglkx.supabase.co'
const supabaseKey = 'YOUR_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)


// ===================== DOM ELEMENTS =====================
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');

const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const nameField = document.getElementById('name-field');
const confirmPasswordField = document.getElementById('confirm-password-field');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const authSubmit = document.getElementById('auth-submit');
const fullNameInput = document.getElementById('full-name');
const emailInput = document.getElementById('auth-email');
const passwordInput = document.getElementById('auth-password');
const confirmPasswordInput = document.getElementById('confirm-password');

const welcomeText = document.getElementById('welcome-text');
const logoutButton = document.getElementById('logout-button');
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskPriority = document.getElementById('task-priority');
const taskDueDate = document.getElementById('task-due-date');
const editTaskId = document.getElementById('edit-task-id');
const taskFormTitle = document.getElementById('task-form-title');
const taskError = document.getElementById('task-error');
const saveTaskButton = document.getElementById('save-task');
const cancelEditButton = document.getElementById('cancel-edit');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const searchQuery = document.getElementById('search-query');
const clearFiltersButton = document.getElementById('clear-filters');
const tasksList = document.getElementById('tasks-list');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const overdueCount = document.getElementById('overdue-count');
const toastRegion = document.getElementById('toast-region');


// ===================== STATE =====================
let authMode = 'login';
let currentUser = null;
let taskDocuments = [];
let activeToastTimeouts = [];

const PRIORITY_VALUES = ['low', 'medium', 'high'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 280;


// ===================== UI HELPERS =====================
function showElement(el) { el.classList.remove('hidden'); }
function hideElement(el) { el.classList.add('hidden'); }

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearError(el) {
  el.textContent = '';
  el.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastRegion.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  const timeout = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 200);
  }, 2500);

  activeToastTimeouts.push(timeout);
}


// ===================== TASK LOADER (SUPABASE) =====================
async function loadTasks() {
  if (!currentUser) return;

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    showError(taskError, 'Failed to load tasks');
    console.error(error);
    return;
  }

  taskDocuments = data.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.due_date,
    completed: task.completed,
    userId: task.user_id
  }));

  renderTasks();
}


// ===================== AUTH =====================
async function handleAuthSubmit(e) {
  e.preventDefault();
  clearError(authError);

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  try {
    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

    } else {
      const name = fullNameInput.value.trim();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) throw error;
    }

  } catch (err) {
    showError(authError, err.message);
  }
}


// ===================== TASK SUBMIT =====================
async function handleTaskSubmit(e) {
  e.preventDefault();
  clearError(taskError);

  if (!currentUser) return;

  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  const priority = taskPriority.value;
  const dueDate = taskDueDate.value || null;
  const taskId = editTaskId.value;

  try {

    if (taskId) {
      await supabase
        .from('tasks')
        .update({
          title,
          description,
          priority,
          due_date: dueDate,
          updated_at: new Date()
        })
        .eq('id', taskId);

      showToast('Task updated', 'success');

    } else {
      await supabase
        .from('tasks')
        .insert([{
          title,
          description,
          priority,
          due_date: dueDate,
          completed: false,
          user_id: currentUser.id
        }]);

      showToast('Task created', 'success');
    }

    await loadTasks();
    resetTaskForm();

  } catch (err) {
    showError(taskError, err.message);
  }
}


// ===================== TASK ACTIONS =====================
async function handleTaskAction(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  const task = taskDocuments.find(t => t.id === id);
  if (!task) return;

  try {

    if (action === 'toggle') {
      await supabase
        .from('tasks')
        .update({
          completed: !task.completed,
          updated_at: new Date()
        })
        .eq('id', id);

      await loadTasks();
    }

    if (action === 'delete') {
      await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      await loadTasks();
    }

    if (action === 'edit') {
      taskTitle.value = task.title;
      taskDescription.value = task.description || '';
      taskPriority.value = task.priority;
      taskDueDate.value = task.dueDate || '';
      editTaskId.value = task.id;
    }

  } catch (err) {
    console.error(err);
  }
}


// ===================== RENDER TASKS (UNCHANGED LOGIC) =====================
function renderTasks() {
  const filtered = taskDocuments;

  if (!filtered.length) {
    tasksList.innerHTML = `<p>No tasks yet</p>`;
    return;
  }

  tasksList.innerHTML = filtered.map(task => `
    <div class="task-card">
      <h3>${task.title}</h3>
      <p>${task.description || ''}</p>

      <button data-action="toggle" data-id="${task.id}">
        Toggle
      </button>

      <button data-action="edit" data-id="${task.id}">
        Edit
      </button>

      <button data-action="delete" data-id="${task.id}">
        Delete
      </button>
    </div>
  `).join('');
}


// ===================== RESET =====================
function resetTaskForm() {
  taskForm.reset();
  editTaskId.value = '';
}


// ===================== AUTH LISTENER =====================
supabase.auth.onAuthStateChange((event, session) => {
  currentUser = session?.user || null;

  if (currentUser) {
    welcomeText.textContent =
      `Welcome ${currentUser.user_metadata?.full_name || currentUser.email}`;

    showElement(dashboardScreen);
    hideElement(authScreen);

    loadTasks();

  } else {
    showElement(authScreen);
    hideElement(dashboardScreen);
    taskDocuments = [];
    renderTasks();
  }
});


// ===================== EVENTS =====================
authForm.addEventListener('submit', handleAuthSubmit);
taskForm.addEventListener('submit', handleTaskSubmit);
tasksList.addEventListener('click', handleTaskAction);

logoutButton.addEventListener('click', async () => {
  await supabase.auth.signOut();
});