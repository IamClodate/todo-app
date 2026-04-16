// Main application script for the todo app.
// This file handles UI rendering, Firebase authentication, Firestore task storage,
// and user interactions like adding, editing, and deleting tasks.
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

let authMode = 'login';
let currentUser = null;
let unsubscribeTasks = null;
let taskDocuments = [];

function showElement(element) {
  element.classList.remove('hidden');
}

function hideElement(element) {
  element.classList.add('hidden');
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

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

  totalCount.textContent = total;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
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
      const statusClass = task.completed ? 'completed' : '';
      const dueDateLabel = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
      const title = escapeHtml(task.title);
      const description = escapeHtml(task.description || 'No description provided.');

      return `
        <article class="task-card ${statusClass}">
          <div class="task-header">
            <div>
              <h3 class="task-title">${title}</h3>
              <div class="task-meta">
                <span>${priorityLabel}</span>
                <span>${statusLabel}</span>
                <span>${dueDateLabel}</span>
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
      renderTasks();
    },
    (error) => {
      showError(taskError, 'Unable to load tasks. Check your network connection.');
      console.error('Firestore error:', error);
    }
  );
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  clearError(authError);

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError(authError, 'Please provide both email and password.');
    return;
  }

  authSubmit.disabled = true;
  authSubmit.textContent = authMode === 'login' ? 'Logging in...' : 'Creating account...';

  try {
    if (authMode === 'login') {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      const name = fullNameInput.value.trim();
      const confirmPassword = confirmPasswordInput.value;

      if (!name) {
        showError(authError, 'Please enter your full name.');
        return;
      }

      if (password !== confirmPassword) {
        showError(authError, 'Passwords do not match.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
    }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      showError(authError, 'That email is already registered.');
    } else if (error.code === 'auth/invalid-email') {
      showError(authError, 'Please enter a valid email address.');
    } else if (error.code === 'auth/wrong-password') {
      showError(authError, 'Incorrect password.');
    } else if (error.code === 'auth/user-not-found') {
      showError(authError, 'No account found with that email.');
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

  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  const priority = taskPriority.value;
  const dueDate = taskDueDate.value;
  const taskId = editTaskId.value;

  if (!title) {
    showError(taskError, 'Task title is required.');
    return;
  }

  saveTaskButton.disabled = true;
  saveTaskButton.textContent = taskId ? 'Updating...' : 'Saving...';

  try {
    if (taskId) {
      await updateDoc(doc(db, 'tasks', taskId), { title, description, priority, dueDate });
    } else {
      await addDoc(collection(db, 'tasks'), {
        title,
        description,
        priority,
        dueDate,
        completed: false,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
    }

    resetTaskForm();
  } catch (error) {
    showError(taskError, 'Unable to save task. Please try again.');
    console.error(error);
  } finally {
    saveTaskButton.disabled = false;
    updateTaskFormState(Boolean(editTaskId.value));
  }
}

async function handleTaskAction(event) {
  const action = event.target.dataset.action;
  const taskId = event.target.dataset.id;

  if (!action || !taskId) {
    return;
  }

  if (action === 'toggle') {
    const task = taskDocuments.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    await updateDoc(doc(db, 'tasks', taskId), { completed: !task.completed });
    return;
  }

  if (action === 'edit') {
    const task = taskDocuments.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    taskTitle.value = task.title;
    taskDescription.value = task.description || '';
    taskPriority.value = task.priority;
    taskDueDate.value = task.dueDate || '';
    editTaskId.value = task.id;
    updateTaskFormState(true);
    taskTitle.focus();
    taskForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (action === 'delete') {
    const confirmed = confirm('Delete this task permanently?');
    if (!confirmed) {
      return;
    }

    await deleteDoc(doc(db, 'tasks', taskId));
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
  await signOut(auth);
});
taskForm.addEventListener('submit', handleTaskSubmit);
cancelEditButton.addEventListener('click', resetTaskForm);
tasksList.addEventListener('click', handleTaskAction);
filterStatus.addEventListener('change', renderTasks);
filterPriority.addEventListener('change', renderTasks);
searchQuery.addEventListener('input', renderTasks);
clearFiltersButton.addEventListener('click', clearFilters);

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
    renderTasks();

    if (unsubscribeTasks) {
      unsubscribeTasks();
      unsubscribeTasks = null;
    }
  }
});

setActiveTab('login');
updateTaskFormState(false);
