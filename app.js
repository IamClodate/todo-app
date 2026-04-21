import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://wwbbrowrjipvzhstglkx.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3YmJyb3dyamlwdnpoc3RnbGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTIxMjgsImV4cCI6MjA5MjE4ODEyOH0.beslyN3mmgBUYt1ndBwejJy4Elgovzr0KKpxw9QwNjQ'
const ADMIN_EMAILS = ['clodatemnisi@gmail.com']

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const state = {
  authMode: 'login',
  currentUser: null,
  isAdmin: false,
  tasks: [],
  profiles: [],
  activity: [],
  capabilities: {
    profiles: false,
    activityLogs: false,
    adminUsers: false
  }
}

const dom = {
  authScreen: document.getElementById('auth-screen'),
  dashboardScreen: document.getElementById('dashboard-screen'),
  loginTab: document.getElementById('login-tab'),
  registerTab: document.getElementById('register-tab'),
  authForm: document.getElementById('auth-form'),
  authError: document.getElementById('auth-error'),
  authSubmit: document.getElementById('auth-submit'),
  nameField: document.getElementById('name-field'),
  confirmPasswordField: document.getElementById('confirm-password-field'),
  fullNameInput: document.getElementById('full-name'),
  emailInput: document.getElementById('auth-email'),
  passwordInput: document.getElementById('auth-password'),
  confirmPasswordInput: document.getElementById('confirm-password'),
  dashboardTitle: document.getElementById('dashboard-title'),
  welcomeText: document.getElementById('welcome-text'),
  roleBadge: document.getElementById('role-badge'),
  activeUserEmail: document.getElementById('active-user-email'),
  logoutButton: document.getElementById('logout-button'),
  setupBanner: document.getElementById('setup-banner'),
  setupSummary: document.getElementById('setup-summary'),
  taskForm: document.getElementById('task-form'),
  taskError: document.getElementById('task-error'),
  taskTitle: document.getElementById('task-title'),
  taskDescription: document.getElementById('task-description'),
  taskPriority: document.getElementById('task-priority'),
  taskDueDate: document.getElementById('task-due-date'),
  taskOwnerField: document.getElementById('owner-field'),
  taskOwner: document.getElementById('task-owner'),
  editTaskId: document.getElementById('edit-task-id'),
  cancelEdit: document.getElementById('cancel-edit'),
  taskFormTitle: document.getElementById('task-form-title'),
  taskFormNote: document.getElementById('task-form-note'),
  totalCount: document.getElementById('total-count'),
  completedCount: document.getElementById('completed-count'),
  pendingCount: document.getElementById('pending-count'),
  overdueCount: document.getElementById('overdue-count'),
  completionRate: document.getElementById('completion-rate'),
  completionBar: document.getElementById('completion-bar'),
  highPriorityCount: document.getElementById('high-priority-count'),
  highPriorityCaption: document.getElementById('high-priority-caption'),
  dueSoonCount: document.getElementById('due-soon-count'),
  dueSoonCaption: document.getElementById('due-soon-caption'),
  fourthInsightLabel: document.getElementById('fourth-insight-label'),
  fourthInsightValue: document.getElementById('fourth-insight-value'),
  fourthInsightCaption: document.getElementById('fourth-insight-caption'),
  analyticsTitle: document.getElementById('analytics-title'),
  analyticsChip: document.getElementById('analytics-chip'),
  reportCards: document.getElementById('report-cards'),
  refreshReports: document.getElementById('refresh-reports'),
  filterStatus: document.getElementById('filter-status'),
  filterPriority: document.getElementById('filter-priority'),
  filterOwner: document.getElementById('filter-owner'),
  searchQuery: document.getElementById('search-query'),
  clearFiltersButton: document.getElementById('clear-filters'),
  tasksHeading: document.getElementById('tasks-heading'),
  tasksList: document.getElementById('tasks-list'),
  activityTitle: document.getElementById('activity-title'),
  activityChip: document.getElementById('activity-chip'),
  activityList: document.getElementById('activity-list'),
  adminPanel: document.getElementById('admin-panel'),
  userInsights: document.getElementById('user-insights'),
  toastRegion: document.getElementById('toast-region')
}

const show = element => element.classList.remove('hidden')
const hide = element => element.classList.add('hidden')

function setAuthMode(mode) {
  state.authMode = mode
  const isLogin = mode === 'login'

  dom.loginTab.classList.toggle('active', isLogin)
  dom.registerTab.classList.toggle('active', !isLogin)
  dom.authSubmit.textContent = isLogin ? 'Login' : 'Create account'

  if (isLogin) {
    hide(dom.nameField)
    hide(dom.confirmPasswordField)
  } else {
    show(dom.nameField)
    show(dom.confirmPasswordField)
  }
}

function showAuth() {
  show(dom.authScreen)
  hide(dom.dashboardScreen)
}

function showDashboard() {
  hide(dom.authScreen)
  show(dom.dashboardScreen)
}

function showError(element, message) {
  element.textContent = message
  show(element)
}

function clearError(element) {
  element.textContent = ''
  hide(element)
}

function toast(message, type = 'success') {
  const note = document.createElement('div')
  note.className = `toast ${type}`
  note.textContent = message
  dom.toastRegion.appendChild(note)

  setTimeout(() => note.remove(), 3200)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatDate(dateString) {
  if (!dateString) return 'No due date'
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return 'No due date'

  return new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'just now'

  const time = new Date(dateString).getTime()

  if (Number.isNaN(time)) return 'just now'

  const diffMinutes = Math.round((time - Date.now()) / 60000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute')

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour')

  const diffDays = Math.round(diffHours / 24)
  return formatter.format(diffDays, 'day')
}

function isTaskOverdue(task) {
  if (!task?.due_date || task.completed) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(task.due_date)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate < today
}

function getProfileById(userId) {
  return state.profiles.find(profile => profile.id === userId) || null
}

function getOwnerLabel(userId) {
  if (!userId) return 'Unassigned'

  const profile = getProfileById(userId)

  if (profile) return profile.full_name || profile.email || 'Unknown user'

  if (state.currentUser?.id === userId) {
    return state.currentUser.user_metadata?.full_name || state.currentUser.email || 'You'
  }

  return `User ${userId.slice(0, 8)}`
}

function updateChrome() {
  const profileName =
    state.currentUser?.user_metadata?.full_name || state.currentUser?.email || 'Workspace'

  dom.dashboardTitle.textContent = state.isAdmin ? 'Admin Command Center' : 'My Workspace'
  dom.welcomeText.textContent = state.isAdmin
    ? `Admin access enabled for ${profileName}`
    : `Welcome back, ${profileName}`
  dom.activeUserEmail.textContent = state.currentUser?.email || ''
  dom.roleBadge.textContent = state.isAdmin ? 'Admin' : 'User'
  dom.roleBadge.className = `role-badge ${state.isAdmin ? 'admin' : 'user'}`

  dom.analyticsTitle.textContent = state.isAdmin ? 'System performance snapshot' : 'Personal performance snapshot'
  dom.analyticsChip.textContent = state.isAdmin ? 'Admin analytics' : 'Personal analytics'
  dom.tasksHeading.textContent = state.isAdmin ? 'All tasks across the system' : 'My tasks'
  dom.activityTitle.textContent = state.isAdmin ? 'System activity' : 'My recent activity'
  dom.activityChip.textContent = state.isAdmin ? 'Audited events' : 'Private feed'
  dom.taskFormNote.textContent = state.isAdmin ? 'Admin assignment enabled' : 'Personal view'

  if (state.isAdmin) {
    show(dom.adminPanel)
    show(dom.filterOwner)
    show(dom.taskOwnerField)
  } else {
    hide(dom.adminPanel)
    hide(dom.filterOwner)
    hide(dom.taskOwnerField)
  }
}

async function detectCapabilities() {
  const checks = {
    profiles: ['user_profiles', 'id'],
    activityLogs: ['activity_logs', 'id'],
    adminUsers: ['admin_users', 'user_id']
  }

  const result = {
    profiles: false,
    activityLogs: false,
    adminUsers: false
  }

  for (const [key, [table, column]] of Object.entries(checks)) {
    const { error } = await supabase.from(table).select(column).limit(1)
    result[key] = !error
  }

  state.capabilities = result
  renderSetupBanner()
}

function renderSetupBanner() {
  const missing = []

  if (!state.capabilities.profiles) missing.push('profiles')
  if (!state.capabilities.activityLogs) missing.push('activity logs')
  if (!state.capabilities.adminUsers) missing.push('admin role table')

  if (!missing.length) {
    hide(dom.setupBanner)
    return
  }

  dom.setupSummary.textContent = `Missing: ${missing.join(', ')}`
  show(dom.setupBanner)
}

async function resolveAdmin(user) {
  const email = user?.email?.toLowerCase()
  let dbAdmin = false

  if (state.capabilities.adminUsers && user?.id) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    dbAdmin = Boolean(data && !error)
  }

  return ADMIN_EMAILS.includes(email) || dbAdmin
}

async function ensureProfile() {
  if (!state.capabilities.profiles || !state.currentUser) return

  const payload = {
    id: state.currentUser.id,
    email: state.currentUser.email,
    full_name: state.currentUser.user_metadata?.full_name || state.currentUser.email,
    role: state.isAdmin ? 'admin' : 'user',
    last_seen_at: new Date().toISOString()
  }

  await supabase.from('user_profiles').upsert(payload, { onConflict: 'id' })
}

async function recordActivity(action, details, targetTaskId = null) {
  if (!state.capabilities.activityLogs || !state.currentUser) return

  await supabase.from('activity_logs').insert({
    user_id: state.currentUser.id,
    action,
    details,
    target_task_id: targetTaskId,
    metadata: {
      role: state.isAdmin ? 'admin' : 'user',
      email: state.currentUser.email
    }
  })
}

async function loadProfiles() {
  if (!state.capabilities.profiles || !state.currentUser) {
    state.profiles = []
    return
  }

  let query = supabase
    .from('user_profiles')
    .select('id, email, full_name, role, last_seen_at')
    .order('full_name', { ascending: true })

  if (!state.isAdmin) {
    query = query.eq('id', state.currentUser.id)
  }

  const { data, error } = await query

  if (error) {
    state.profiles = []
    return
  }

  state.profiles = data || []
}

async function loadTasks() {
  if (!state.currentUser) return

  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })

  if (!state.isAdmin) {
    query = query.eq('user_id', state.currentUser.id)
  }

  const { data, error } = await query

  if (error) {
    showError(dom.taskError, error.message)
    state.tasks = []
    return
  }

  state.tasks = data || []
  clearError(dom.taskError)
}

async function loadActivity() {
  if (!state.currentUser) return

  if (!state.capabilities.activityLogs) {
    state.activity = []
    return
  }

  let query = supabase
    .from('activity_logs')
    .select('id, user_id, action, details, created_at, target_task_id')
    .order('created_at', { ascending: false })
    .limit(12)

  if (!state.isAdmin) {
    query = query.eq('user_id', state.currentUser.id)
  }

  const { data, error } = await query

  if (error) {
    state.activity = []
    return
  }

  state.activity = data || []
}

function fillOwnerOptions() {
  if (!state.isAdmin) return

  const ownerOptions = []
  const seen = new Set()

  for (const profile of state.profiles) {
    if (!profile?.id || seen.has(profile.id)) continue
    seen.add(profile.id)
    ownerOptions.push(
      `<option value="${escapeHtml(profile.id)}">${escapeHtml(
        profile.full_name || profile.email || profile.id
      )}</option>`
    )
  }

  if (state.currentUser && !seen.has(state.currentUser.id)) {
    ownerOptions.push(
      `<option value="${escapeHtml(state.currentUser.id)}">${escapeHtml(
        state.currentUser.user_metadata?.full_name || state.currentUser.email || 'Current user'
      )}</option>`
    )
  }

  dom.taskOwner.innerHTML = ownerOptions.join('')
  dom.filterOwner.innerHTML = `<option value="all">All users</option>${ownerOptions.join('')}`

  if (!dom.taskOwner.value && state.currentUser) {
    dom.taskOwner.value = state.currentUser.id
  }
}

function getFilteredTasks() {
  let filtered = [...state.tasks]
  const status = dom.filterStatus.value
  const priority = dom.filterPriority.value
  const owner = dom.filterOwner.value
  const search = dom.searchQuery.value.trim().toLowerCase()

  if (status !== 'all') {
    filtered = filtered.filter(task => {
      if (status === 'completed') return task.completed
      if (status === 'pending') return !task.completed
      return isTaskOverdue(task)
    })
  }

  if (priority !== 'all') {
    filtered = filtered.filter(task => task.priority === priority)
  }

  if (state.isAdmin && owner !== 'all') {
    filtered = filtered.filter(task => task.user_id === owner)
  }

  if (search) {
    filtered = filtered.filter(task => {
      const haystack = [
        task.title,
        task.description,
        getOwnerLabel(task.user_id),
        getProfileById(task.user_id)?.email
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(search)
    })
  }

  return filtered
}

function renderStats() {
  const total = state.tasks.length
  const completed = state.tasks.filter(task => task.completed).length
  const pending = state.tasks.filter(task => !task.completed).length
  const overdue = state.tasks.filter(task => isTaskOverdue(task)).length
  const completionRate = total ? Math.round((completed / total) * 100) : 0
  const highPriority = state.tasks.filter(task => task.priority === 'high' && !task.completed).length
  const dueSoon = state.tasks.filter(task => {
    if (!task.due_date || task.completed) return false
    const diffDays = Math.ceil((new Date(task.due_date) - new Date()) / 86400000)
    return diffDays >= 0 && diffDays <= 7
  }).length

  dom.totalCount.textContent = total
  dom.completedCount.textContent = completed
  dom.pendingCount.textContent = pending
  dom.overdueCount.textContent = overdue
  dom.completionRate.textContent = `${completionRate}%`
  dom.completionBar.style.width = `${completionRate}%`
  dom.highPriorityCount.textContent = String(highPriority)
  dom.highPriorityCaption.textContent =
    highPriority > 0 ? `${highPriority} critical item${highPriority === 1 ? '' : 's'} need attention` : 'No critical items right now'
  dom.dueSoonCount.textContent = String(dueSoon)
  dom.dueSoonCaption.textContent =
    dueSoon > 0 ? `${dueSoon} task${dueSoon === 1 ? '' : 's'} approaching deadline` : 'Timeline looks stable'

  if (state.isAdmin) {
    const activeUsers = new Set(state.tasks.map(task => task.user_id).filter(Boolean)).size
    dom.fourthInsightLabel.textContent = 'Active users'
    dom.fourthInsightValue.textContent = String(activeUsers)
    dom.fourthInsightCaption.textContent = 'Users currently represented in this task view'
  } else {
    const score = Math.max(0, completionRate - overdue * 8 + Math.min(20, pending))
    dom.fourthInsightLabel.textContent = 'Productivity score'
    dom.fourthInsightValue.textContent = String(score)
    dom.fourthInsightCaption.textContent = 'Weighted from completion, backlog, and overdue work'
  }
}

function renderReports() {
  const total = state.tasks.length
  const completed = state.tasks.filter(task => task.completed).length
  const overdue = state.tasks.filter(task => isTaskOverdue(task)).length
  const highPriority = state.tasks.filter(task => task.priority === 'high' && !task.completed).length
  const uniqueUsers = new Set(state.tasks.map(task => task.user_id).filter(Boolean)).size

  const cards = state.isAdmin
    ? [
        {
          title: 'System health',
          body:
            total === 0
              ? 'No tasks are currently stored. Once users start creating work, this panel will summarize throughput and execution quality.'
              : `${completed} of ${total} tasks are complete, giving the workspace a ${Math.round(
                  (completed / total) * 100
                )}% completion rate across ${uniqueUsers || 1} active user account${uniqueUsers === 1 ? '' : 's'}.`
        },
        {
          title: 'Risk report',
          body:
            overdue > 0
              ? `${overdue} overdue task${overdue === 1 ? '' : 's'} and ${highPriority} high-priority open item${
                  highPriority === 1 ? '' : 's'
                } need admin follow-up. Focus on users with stacked deadlines first.`
              : 'No overdue work detected right now. Admin focus can shift toward coaching, prioritization, and keeping cycle time short.'
        },
        {
          title: 'Operational guidance',
          body:
            state.activity.length > 0
              ? 'Recent activity is flowing into the audit feed. Use that panel to verify logins, edits, completions, and delete actions during demos or QA reviews.'
              : 'Activity reporting will become much richer once the `activity_logs` table from the setup script is active.'
        }
      ]
    : [
        {
          title: 'Focus summary',
          body:
            total === 0
              ? 'You do not have any tasks yet. Create your first task to start building a daily execution rhythm.'
              : `You currently have ${total} task${total === 1 ? '' : 's'} in your workspace, with ${completed} already completed.`
        },
        {
          title: 'Risk watch',
          body:
            overdue > 0
              ? `${overdue} task${overdue === 1 ? '' : 's'} are overdue. Move those to the top of your list before adding more work.`
              : 'No overdue tasks right now. Your current task timeline looks under control.'
        },
        {
          title: 'Next best move',
          body:
            highPriority > 0
              ? `You still have ${highPriority} high-priority task${highPriority === 1 ? '' : 's'} open. Completing those first will improve your momentum fastest.`
              : 'Your high-priority queue is clear. This is a good moment to close medium-priority items or tidy your backlog.'
        }
      ]

  dom.reportCards.innerHTML = cards
    .map(
      card => `
        <article class="report-card">
          <span>${escapeHtml(card.title)}</span>
          <p>${escapeHtml(card.body)}</p>
        </article>
      `
    )
    .join('')
}

function renderTasks() {
  const filtered = getFilteredTasks()

  if (!filtered.length) {
    dom.tasksList.innerHTML = `
      <div class="empty-state">
        No tasks match the current filters. Try clearing filters or add a new task.
      </div>
    `
    return
  }

  dom.tasksList.innerHTML = filtered
    .map(task => {
      const overdue = isTaskOverdue(task)
      const statusClass = task.completed ? 'completed' : overdue ? 'overdue' : 'pending'
      const statusLabel = task.completed ? 'Completed' : overdue ? 'Overdue' : 'Pending'
      const owner = getOwnerLabel(task.user_id)

      return `
        <article class="task-card ${statusClass}">
          <div class="task-topline">
            <div>
              <h3>${escapeHtml(task.title || 'Untitled task')}</h3>
              <p>${escapeHtml(task.description || 'No description provided.')}</p>
            </div>
            <div class="meta-stack">
              <span class="priority-badge ${escapeHtml(task.priority || 'medium')}">${escapeHtml(
                task.priority || 'medium'
              )}</span>
              <span class="status-pill ${statusClass}">${statusLabel}</span>
            </div>
          </div>

          <div class="task-meta">
            <div class="task-owner">
              <span class="chip">Due ${escapeHtml(formatDate(task.due_date))}</span>
              ${state.isAdmin ? `<span class="chip">Owner ${escapeHtml(owner)}</span>` : ''}
            </div>
            <small>Created ${escapeHtml(formatRelativeTime(task.created_at))}</small>
          </div>

          <div class="task-actions">
            <small>${task.completed ? 'Task finished and recorded.' : 'Task is still open.'}</small>
            <div class="task-action-group">
              <button class="mini-btn" type="button" data-action="toggle" data-id="${escapeHtml(task.id)}">
                ${task.completed ? 'Mark pending' : 'Mark complete'}
              </button>
              <button class="mini-btn" type="button" data-action="edit" data-id="${escapeHtml(task.id)}">
                Edit
              </button>
              <button class="danger-btn" type="button" data-action="delete" data-id="${escapeHtml(task.id)}">
                Delete
              </button>
            </div>
          </div>
        </article>
      `
    })
    .join('')
}

function renderActivity() {
  if (!state.activity.length) {
    dom.activityList.innerHTML = `
      <div class="empty-state">
        Activity will appear here after sign-ins, task updates, and admin actions are recorded.
      </div>
    `
    return
  }

  dom.activityList.innerHTML = state.activity
    .map(item => {
      const actor = getOwnerLabel(item.user_id)
      return `
        <article class="activity-item">
          <div>
            <strong>${escapeHtml(actor)}</strong>
            <p>${escapeHtml(item.details || item.action || 'Activity recorded')}</p>
          </div>
          <time datetime="${escapeHtml(item.created_at || '')}">${escapeHtml(
            formatRelativeTime(item.created_at)
          )}</time>
        </article>
      `
    })
    .join('')
}

function renderUserInsights() {
  if (!state.isAdmin) return

  const statsByUser = new Map()

  for (const task of state.tasks) {
    const current = statsByUser.get(task.user_id) || {
      total: 0,
      completed: 0,
      overdue: 0
    }

    current.total += 1
    if (task.completed) current.completed += 1
    if (isTaskOverdue(task)) current.overdue += 1

    statsByUser.set(task.user_id, current)
  }

  const cards = (state.profiles.length ? state.profiles : [{ id: state.currentUser.id }]).map(profile => {
    const stats = statsByUser.get(profile.id) || { total: 0, completed: 0, overdue: 0 }
    const label = profile.full_name || profile.email || getOwnerLabel(profile.id)
    const role = profile.role || (profile.id === state.currentUser?.id ? (state.isAdmin ? 'admin' : 'user') : 'user')

    return `
      <article class="user-card">
        <div class="user-card-top">
          <div>
            <h3>${escapeHtml(label)}</h3>
            <small>${escapeHtml(profile.email || profile.id || '')}</small>
          </div>
          <span class="chip">${escapeHtml(role)}</span>
        </div>
        <div class="user-stats">
          <div class="user-stat">
            <strong>${stats.total}</strong>
            <small>Total</small>
          </div>
          <div class="user-stat">
            <strong>${stats.completed}</strong>
            <small>Completed</small>
          </div>
          <div class="user-stat">
            <strong>${stats.overdue}</strong>
            <small>Overdue</small>
          </div>
        </div>
      </article>
    `
  })

  dom.userInsights.innerHTML = cards.join('') || '<div class="empty-state">No users found yet.</div>'
}

function renderEverything() {
  updateChrome()
  fillOwnerOptions()
  renderStats()
  renderReports()
  renderTasks()
  renderActivity()
  renderUserInsights()
}

function resetTaskForm() {
  dom.taskForm.reset()
  dom.editTaskId.value = ''
  dom.taskPriority.value = 'medium'
  dom.taskFormTitle.textContent = 'Create or update work'
  hide(dom.cancelEdit)

  if (state.isAdmin && state.currentUser) {
    dom.taskOwner.value = state.currentUser.id
  }
}

function beginEdit(taskId) {
  const task = state.tasks.find(entry => entry.id === taskId)

  if (!task) return

  dom.editTaskId.value = task.id
  dom.taskTitle.value = task.title || ''
  dom.taskDescription.value = task.description || ''
  dom.taskPriority.value = task.priority || 'medium'
  dom.taskDueDate.value = task.due_date || ''

  if (state.isAdmin && task.user_id) {
    dom.taskOwner.value = task.user_id
  }

  dom.taskFormTitle.textContent = `Editing: ${task.title || 'Task'}`
  show(dom.cancelEdit)
  dom.taskTitle.focus()
}

async function refreshData() {
  await Promise.all([loadProfiles(), loadTasks(), loadActivity()])
  renderEverything()
}

async function handleAuthSubmit(event) {
  event.preventDefault()
  clearError(dom.authError)

  const email = dom.emailInput.value.trim()
  const password = dom.passwordInput.value
  const fullName = dom.fullNameInput.value.trim()
  const confirmPassword = dom.confirmPasswordInput.value

  if (!email || !password) {
    showError(dom.authError, 'Email and password are required.')
    return
  }

  if (state.authMode === 'register') {
    if (!fullName) {
      showError(dom.authError, 'Please enter your full name.')
      return
    }

    if (password !== confirmPassword) {
      showError(dom.authError, 'Passwords do not match.')
      return
    }
  }

  try {
    if (state.authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast('Welcome back.')
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (error) throw error

      if (!data.session) {
        toast('Account created. Check your email confirmation settings before login.')
        setAuthMode('login')
        dom.authForm.reset()
      } else {
        toast('Account created successfully.')
      }
    }
  } catch (error) {
    showError(dom.authError, error.message || 'Authentication failed.')
  }
}

async function handleLogout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    toast(error.message, 'error')
    return
  }

  state.currentUser = null
  state.tasks = []
  state.activity = []
  state.profiles = []
  resetTaskForm()
  showAuth()
}

async function handleTaskSubmit(event) {
  event.preventDefault()
  clearError(dom.taskError)

  if (!state.currentUser) return

  const id = dom.editTaskId.value
  const assignedUserId = state.isAdmin ? dom.taskOwner.value || state.currentUser.id : state.currentUser.id

  const payload = {
    title: dom.taskTitle.value.trim(),
    description: dom.taskDescription.value.trim(),
    priority: dom.taskPriority.value,
    due_date: dom.taskDueDate.value || null,
    user_id: assignedUserId
  }

  if (!payload.title) {
    showError(dom.taskError, 'Task title is required.')
    return
  }

  try {
    if (id) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', id)
      if (error) throw error
      await recordActivity('task_updated', `Updated task "${payload.title}".`, id)
      toast('Task updated.')
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...payload, completed: false }])
        .select('id')
        .single()

      if (error) throw error
      await recordActivity('task_created', `Created task "${payload.title}".`, data?.id || null)
      toast('Task created.')
    }

    resetTaskForm()
    await refreshData()
  } catch (error) {
    showError(dom.taskError, error.message || 'Could not save task.')
  }
}

async function toggleTask(taskId) {
  const task = state.tasks.find(entry => entry.id === taskId)
  if (!task) return

  const { error } = await supabase
    .from('tasks')
    .update({ completed: !task.completed })
    .eq('id', taskId)

  if (error) {
    toast(error.message, 'error')
    return
  }

  await recordActivity(
    task.completed ? 'task_reopened' : 'task_completed',
    `${task.completed ? 'Reopened' : 'Completed'} task "${task.title}".`,
    taskId
  )
  toast(task.completed ? 'Task moved back to pending.' : 'Task marked complete.')
  await refreshData()
}

async function deleteTask(taskId) {
  const task = state.tasks.find(entry => entry.id === taskId)
  if (!task) return

  const confirmed = window.confirm(`Delete "${task.title}"? This action cannot be undone.`)
  if (!confirmed) return

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) {
    toast(error.message, 'error')
    return
  }

  await recordActivity('task_deleted', `Deleted task "${task.title}".`, taskId)
  toast('Task deleted.')
  await refreshData()
}

async function handleTaskListClick(event) {
  const button = event.target.closest('button[data-action]')
  if (!button) return

  const { action, id } = button.dataset

  if (action === 'edit') beginEdit(id)
  if (action === 'toggle') await toggleTask(id)
  if (action === 'delete') await deleteTask(id)
}

async function initializeSession(user, authEvent = null) {
  state.currentUser = user
  await detectCapabilities()
  state.isAdmin = await resolveAdmin(user)

  updateChrome()
  await ensureProfile()
  showDashboard()
  await refreshData()

  if (authEvent === 'SIGNED_IN') {
    await recordActivity('login', `${user.email} signed in.`)
  }

  if (authEvent === 'USER_UPDATED') {
    await recordActivity('profile_updated', `${user.email} updated account details.`)
  }
}

function wireEvents() {
  dom.loginTab.addEventListener('click', () => setAuthMode('login'))
  dom.registerTab.addEventListener('click', () => setAuthMode('register'))
  dom.authForm.addEventListener('submit', handleAuthSubmit)
  dom.logoutButton.addEventListener('click', handleLogout)
  dom.taskForm.addEventListener('submit', handleTaskSubmit)
  dom.cancelEdit.addEventListener('click', resetTaskForm)
  dom.refreshReports.addEventListener('click', renderReports)
  dom.tasksList.addEventListener('click', handleTaskListClick)

  dom.filterStatus.addEventListener('change', renderTasks)
  dom.filterPriority.addEventListener('change', renderTasks)
  dom.filterOwner.addEventListener('change', renderTasks)
  dom.searchQuery.addEventListener('input', renderTasks)

  dom.clearFiltersButton.addEventListener('click', () => {
    dom.filterStatus.value = 'all'
    dom.filterPriority.value = 'all'
    dom.filterOwner.value = 'all'
    dom.searchQuery.value = ''
    renderTasks()
  })
}

async function init() {
  setAuthMode('login')
  showAuth()
  wireEvents()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session?.user) {
    await initializeSession(session.user)
  }

  supabase.auth.onAuthStateChange(async (event, sessionState) => {
    if (event === 'INITIAL_SESSION') return

    if (sessionState?.user) {
      await initializeSession(sessionState.user, event)
    } else {
      state.currentUser = null
      state.isAdmin = false
      state.tasks = []
      state.activity = []
      state.profiles = []
      resetTaskForm()
      showAuth()
    }
  })
}

init()
