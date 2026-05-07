// ============================================================================
// 📊 DASHBOARD - Grêmio Estudantil v3 (Corrigido)
// ============================================================================

let currentUser = null;
let tasksData = [];
let eventsData = [];

document.addEventListener('DOMContentLoaded', async () => {
    CONFIG.initSupabase();
    await initDashboard();
});

async function initDashboard() {
    try {
        // Check authentication
        if (!UTILS.requireAuth()) return;

        currentUser = UTILS.getStorageUser();
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }

        // Update UI with user info
        updateUserInfo();

        // Load data
        await loadDashboardData();

        // Setup event listeners
        setupEventListeners();

    } catch (error) {
        console.error('❌ Dashboard init error:', error);
        UTILS.showError(error.message);
    }
}

function updateUserInfo() {
    const userNameElement = document.getElementById('user-name');
    const userRoleElement = document.getElementById('user-role');
    const userAvatarElement = document.getElementById('user-avatar');

    if (userNameElement) userNameElement.textContent = currentUser.nome || 'Usuário';
    if (userRoleElement) userRoleElement.textContent = currentUser.role || 'Membro';
    if (userAvatarElement) userAvatarElement.textContent = (currentUser.nome || 'U').charAt(0).toUpperCase();
}

async function loadDashboardData() {
    try {
        // Load tasks
        const tasks = await UTILS.supabaseQuery('tasks', {
            order: { column: 'created_at', ascending: false },
            limit: 5
        });
        tasksData = tasks || [];
        renderRecentTasks();

        // Load events
        const events = await UTILS.supabaseQuery('events', {
            order: { column: 'date', ascending: true },
            limit: 5
        });
        eventsData = events || [];
        renderUpcomingEvents();

        // Update counters
        updateCounters();

    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        UTILS.showError('Erro ao carregar dados do dashboard');
    }
}

async function updateCounters() {
    try {
        // Count pending tasks
        const pendingTasks = await UTILS.supabaseQuery('tasks', {
            where: { status: CONFIG.STATUS.PENDING }
        });
        const pendingCount = pendingTasks ? pendingTasks.length : 0;
        const pendingElement = document.getElementById('pending-tasks-count');
        if (pendingElement) pendingElement.textContent = pendingCount;

        // Count upcoming events
        const today = new Date().toISOString().split('T')[0];
        const upcomingEvents = await UTILS.supabaseQuery('events', {
            where: { date: today }
        });
        const upcomingCount = upcomingEvents ? upcomingEvents.length : 0;
        const upcomingElement = document.getElementById('upcoming-events-count');
        if (upcomingElement) upcomingElement.textContent = upcomingCount;

        // Count members
        const members = await UTILS.supabaseQuery('profiles');
        const memberCount = members ? members.length : 0;
        const memberElement = document.getElementById('members-count');
        if (memberElement) memberElement.textContent = memberCount;

    } catch (error) {
        console.error('❌ Error updating counters:', error);
    }
}

function renderRecentTasks() {
    const container = document.getElementById('recent-tasks');
    if (!container) return;

    if (tasksData.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma tarefa recente</p>';
        return;
    }

    container.innerHTML = tasksData.map(task => `
        <div class="task-item">
            <div class="task-header">
                <h3 class="task-title">${task.title || 'Sem título'}</h3>
                <span class="task-status status-${task.status || 'pendente'}">${task.status || 'Pendente'}</span>
            </div>
            <p class="task-description">${task.description || ''}</p>
            <div class="task-meta">
                <span>Prioridade: ${task.priority || 'Média'}</span>
                <span>Data: ${UTILS.formatDate(task.due_date) || 'Sem data'}</span>
            </div>
        </div>
    `).join('');
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcoming-events');
    if (!container) return;

    if (eventsData.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum evento próximo</p>';
        return;
    }

    container.innerHTML = eventsData.map(event => `
        <div class="event-item">
            <div class="event-header">
                <h3 class="event-title">${event.name || 'Sem título'}</h3>
            </div>
            <p class="event-description">${event.description || ''}</p>
            <div class="event-meta">
                <span>📅 ${UTILS.formatDate(event.date)}</span>
                <span>📍 ${event.location || 'Local não informado'}</span>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // New task button
    const newTaskBtn = document.getElementById('btn-new-task');
    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', () => {
            window.location.href = 'tasks.html';
        });
    }

    // New event button
    const newEventBtn = document.getElementById('btn-new-event');
    if (newEventBtn) {
        newEventBtn.addEventListener('click', () => {
            window.location.href = 'calendario.html';
        });
    }

    // Navigation links
    const navLinks = document.querySelectorAll('[data-nav]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const page = e.target.dataset.nav;
            navigateToPage(page);
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja sair?')) {
                logout();
            }
        });
    }
}

function navigateToPage(page) {
    const pages = {
        'dashboard': 'dashboard.html',
        'tasks': 'tasks.html',
        'calendar': 'calendario.html',
        'diary': 'diario.html',
        'members': 'mapa_membros.html',
        'profile': 'perfil.html',
        'admin': 'admin.html',
        'diretoria': 'diretoria.html'
    };

    const url = pages[page];
    if (url) {
        window.location.href = url;
    }
}

function logout() {
    UTILS.clearStorageUser();
    window.location.href = '../index.html';
}

console.log('✅ Dashboard module loaded');
