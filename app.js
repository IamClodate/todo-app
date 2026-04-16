import { auth, db } from './firebase.js';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

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

const PRIORITY_VALUES = ['low', 'medium', 'high'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 280;

let authMode = 'login';
let currentUser = null;
let unsubscribeTasks = null;
let taskDocuments = [];
let activeToastTimeouts = [];

function showElement(element) {
  element.classList.remove('hidden');
}

function hideElement(element) {
  element.classList.add('hidden');
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function setActiveTab(mode) {
  authMode = mode;

  if (mode === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    hideElement(nameField);
    hideElement(confirmPasswordField);
    authSubmit.textContent = 'Login';
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    showElement(nameField);
    showElement(confirmPasswordField);
    authSubmit.textContent = 'Create account';
  }

  clearError(authError);
}

function showAuth() {
  showElement(authScreen);
  hideElement(dashboardScreen);
}

function showDashboard() {
  hideElement(authScreen);
  showElement(dashboardScreen);
}

function showError(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
}

function clearError(element) {
  element.textContent = '';
  element.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastRegion.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  const timeoutId = window.setTimeout(() => {
    toast.classList.remove('visible');
    window.setTimeout(() => toast.remove(), 220);
  }, 2800);

  activeToastTimeouts.push(timeoutId);
}

function clearToasts() {
  activeToastTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
  activeToastTimeouts = [];
  clearNode(toastRegion);
}

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function isValidDueDate(value) {
  return value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isPastDue(value) {
  if (!value) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${value}T00:00:00`);
  return dueDate < today;
}

function updateTaskFormState(isEditing) {
  taskFormTitle.textContent = isEditing ? 'Edit task' : 'Add new task';
  saveTaskButton.textContent = isEditing ? 'Update task' : 'Save task';
  cancelEditButton.classList.toggle('hidden', !isEditing);
}

function updateStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter((task) => !task.completed && isPastDue(task.dueDate)).length;

  totalCount.textContent = total;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
  overdueCount.textContent = overdue;
}

function getFilteredTasks() {
  const status = filterStatus.value;
  const priority = filterPriority.value;
  const queryValue = searchQuery.value.trim().toLowerCase();

  return taskDocuments.filter((task) => {
    const matchesStatus =
      status === 'all' ||
      (status === 'completed' && task.completed) ||
      (status === 'pending' && !task.completed);
    const matchesPriority = priority === 'all' || task.priority === priority;
    const matchesSearch =
      task.title.toLowerCase().includes(queryValue) ||
      (task.description || '').toLowerCase().includes(queryValue);

    return matchesStatus && matchesPriority && matchesSearch;
  });
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  updateStats(taskDocuments);

  if (filteredTasks.length === 0) {
    const emptyMessage = taskDocuments.length === 0
      ? 'No tasks yet. Add the first one above to get started.'
      : 'No tasks match the current filters. Clear them to see everything again.';

    tasksList.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
    return;
  }

  tasksList.innerHTML = filteredTasks
    .map((task) => {
      const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
      const statusLabel = task.completed ? 'Completed' : 'Pending';
      const dueDateLabel = task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString() : 'No due date';
      const title = escapeHtml(task.title);
      const description = escapeHtml(task.description || 'No description provided.');
      const priorityClass = `priority-${task.priority}`;
      const completedClass = task.completed ? 'completed' : '';
      const overdueClass = !task.completed && isPastDue(task.dueDate) ? 'is-overdue' : '';
      const dueTone = !task.completed && isPastDue(task.dueDate) ? 'badge-overdue' : '';

      return `
        <article class="task-card ${completedClass} ${priorityClass} ${overdueClass}">
          <div class="task-header">
            <div>
              <h3 class="task-title">${title}</h3>
              <div class="task-meta">
                <span class="badge badge-priority">${priorityLabel}</span>
                <span class="badge">${statusLabel}</span>
                <span class="badge ${dueTone}">${dueDateLabel}</span>
              </div>
            </div>
            <div class="task-actions">
              <button class="action-btn" data-action="toggle" data-id="${task.id}">${task.completed ? 'Mark pending' : 'Mark done'}</button>
              <button class="action-btn" data-action="edit" data-id="${task.id}">Edit</button>
              <button class="action-btn danger" data-action="delete" data-id="${task.id}">Delete</button>
            </div>
          </div>
          <p>${description}</p>
        </article>
      `;
    })
    .join('');
}

function subscribeToTasks(userId) {
  if (unsubscribeTasks) {
    unsubscribeTasks();
  }

  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  unsubscribeTasks = onSnapshot(
    tasksQuery,
    (snapshot) => {
      taskDocuments = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      clearError(taskError);
      renderTasks();
    },
    (error) => {
      showError(taskError, 'Unable to load tasks. Please confirm Firestore is enabled and the rules are deployed.');
      showToast('Task sync failed. Please check Firebase setup.', 'error');
      console.error('Firestore error:', error);
    }
  );
}

function validateAuthInput() {
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    return 'Please provide both email and password.';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Please enter a valid email address.';
  }

  if (authMode === 'register') {
    const name = normalizeWhitespace(fullNameInput.value);

    if (name.length < 2) {
      return 'Please enter your full name with at least 2 characters.';
    }

    if (!PASSWORD_PATTERN.test(password)) {
      return 'Please use at least 8 characters and include both letters and numbers.';
    }

    if (password !== confirmPasswordInput.value) {
      return 'Passwords do not match.';
    }
  }

  return '';
}

function validateTaskInput() {
  const title = normalizeWhitespace(taskTitle.value);
  const description = normalizeWhitespace(taskDescription.value);
  const priority = taskPriority.value;
  const dueDate = taskDueDate.value;

  if (title.length < 3) {
    return 'Task title must be at least 3 characters long.';
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return `Task title must stay under ${MAX_TITLE_LENGTH} characters.`;
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return `Description must stay under ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  if (!PRIORITY_VALUES.includes(priority)) {
    return 'Please choose a valid priority.';
  }

  if (!isValidDueDate(dueDate)) {
    return 'Please choose a valid due date.';
  }

  return '';
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  clearError(authError);

  const validationError = validateAuthInput();
  if (validationError) {
    showError(authError, validationError);
    return;
  }

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  authSubmit.disabled = true;
  authSubmit.textContent = authMode === 'login' ? 'Logging in...' : 'Creating account...';

  try {
    if (authMode === 'login') {
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Login successful. Welcome back.', 'success');
    } else {
      const name = normalizeWhitespace(fullNameInput.value);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      showToast('Account created successfully.', 'success');
    }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      showError(authError, 'That email is already registered.');
    } else if (error.code === 'auth/invalid-email') {
      showError(authError, 'Please enter a valid email address.');
    } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      showError(authError, 'Incorrect email or password.');
    } else if (error.code === 'auth/user-not-found') {
      showError(authError, 'No account found with that email.');
    } else if (error.code === 'auth/weak-password') {
      showError(authError, 'Please use a stronger password with at least 8 characters.');
    } else {
      showError(authError, error.message || 'Unable to authenticate. Try again.');
      console.error(error);
    }
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = authMode === 'login' ? 'Login' : 'Create account';
  }
}

async function handleTaskSubmit(event) {
  event.preventDefault();
  clearError(taskError);

  if (!currentUser) {
    showError(taskError, 'Please log in before saving a task.');
    return;
  }

  const validationError = validateTaskInput();
  if (validationError) {
    showError(taskError, validationError);
    return;
  }

  const title = normalizeWhitespace(taskTitle.value);
  const description = normalizeWhitespace(taskDescription.value);
  const priority = taskPriority.value;
  const dueDate = taskDueDate.value || null;
  const taskId = editTaskId.value;

  saveTaskButton.disabled = true;
  cancelEditButton.disabled = true;
  saveTaskButton.textContent = taskId ? 'Updating...' : 'Saving...';

  try {
    if (taskId) {
      const task = taskDocuments.find((item) => item.id === taskId && item.userId === currentUser.uid);
      if (!task) {
        throw new Error('The selected task could not be found for this account.');
      }

      await updateDoc(doc(db, 'tasks', taskId), {
        title,
        description,
        priority,
        dueDate,
        updatedAt: serverTimestamp(),
      });
      showToast('Task updated successfully.', 'success');
    } else {
      await addDoc(collection(db, 'tasks'), {
        title,
        description,
        priority,
        dueDate,
        completed: false,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast('Task saved successfully.', 'success');
    }

    resetTaskForm();
  } catch (error) {
    showError(taskError, error.message || 'Unable to save task. Please try again.');
    console.error(error);
  } finally {
    saveTaskButton.disabled = false;
    cancelEditButton.disabled = false;
    updateTaskFormState(Boolean(editTaskId.value));
  }
}

async function handleTaskAction(event) {
  const target = event.target.closest('button[data-action]');
  if (!target) {
    return;
  }

  const action = target.dataset.action;
  const taskId = target.dataset.id;
  const task = taskDocuments.find((item) => item.id === taskId && item.userId === currentUser?.uid);

  if (!action || !taskId || !task) {
    showToast('That task is no longer available.', 'error');
    return;
  }

  target.disabled = true;

  try {
    if (action === 'toggle') {
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !task.completed,
        updatedAt: serverTimestamp(),
      });
      showToast(task.completed ? 'Task moved back to pending.' : 'Task marked as done.', 'success');
      return;
    }

    if (action === 'edit') {
      taskTitle.value = task.title;
      taskDescription.value = task.description || '';
      taskPriority.value = task.priority;
      taskDueDate.value = task.dueDate || '';
      editTaskId.value = task.id;
      clearError(taskError);
      updateTaskFormState(true);
      taskTitle.focus();
      taskForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('Editing task details now.', 'info');
      return;
    }

    if (action === 'delete') {
      const confirmed = confirm('Delete this task permanently?');
      if (!confirmed) {
        return;
      }

      await deleteDoc(doc(db, 'tasks', taskId));
      if (editTaskId.value === taskId) {
        resetTaskForm();
      }
      showToast('Task deleted successfully.', 'success');
    }
  } catch (error) {
    showToast('Task action failed. Please try again.', 'error');
    console.error(error);
  } finally {
    target.disabled = false;
  }
}

function resetTaskForm() {
  taskForm.reset();
  editTaskId.value = '';
  updateTaskFormState(false);
  clearError(taskError);
}

function clearFilters() {
  filterStatus.value = 'all';
  filterPriority.value = 'all';
  searchQuery.value = '';
  renderTasks();
}

loginTab.addEventListener('click', () => setActiveTab('login'));
registerTab.addEventListener('click', () => setActiveTab('register'));
authForm.addEventListener('submit', handleAuthSubmit);
logoutButton.addEventListener('click', async () => {
  try {
    await signOut(auth);
    showToast('You have logged out successfully.', 'success');
  } catch (error) {
    showToast('Logout failed. Please try again.', 'error');
    console.error(error);
  }
});
taskForm.addEventListener('submit', handleTaskSubmit);
cancelEditButton.addEventListener('click', () => {
  resetTaskForm();
  showToast('Edit cancelled.', 'info');
});
tasksList.addEventListener('click', handleTaskAction);
filterStatus.addEventListener('change', renderTasks);
filterPriority.addEventListener('change', renderTasks);
searchQuery.addEventListener('input', renderTasks);
clearFiltersButton.addEventListener('click', () => {
  clearFilters();
  showToast('Filters cleared.', 'info');
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user) {
    welcomeText.textContent = `Welcome back, ${user.displayName || user.email}`;
    showDashboard();
    resetTaskForm();
    clearFilters();
    subscribeToTasks(user.uid);
  } else {
    showAuth();
    taskDocuments = [];
    clearToasts();
    renderTasks();

    if (unsubscribeTasks) {
      unsubscribeTasks();
      unsubscribeTasks = null;
    }
  }
});

setActiveTab('login');
updateTaskFormState(false);
renderTasks();
