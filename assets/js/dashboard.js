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
        await loadDashboardData(); // Carregar dados do dashboard

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

        // Load events (FIX: gte hoje — antes só mostrava eventos do dia exato)
        const todayISO = new Date().toISOString().split('T')[0];
        const events = await UTILS.supabaseQuery('events', {
            gte: { date: todayISO },
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
        const today = new Date().toISOString().split('T')[0];

        // FIX: 3 queries em paralelo (era sequencial = 3x mais lento)
        // + eventos com gte hoje (antes só contava eventos do dia exato)
        const [pendingTasks, upcomingEvents, members] = await Promise.all([
            UTILS.supabaseQuery('tasks', { where: { status: CONFIG.STATUS.PENDING } }),
            UTILS.supabaseQuery('events', { gte: { date: today }, order: { column: 'date', ascending: true }, limit: 10 }),
            UTILS.supabaseQuery('profiles')
        ]);

        const pendingCount = pendingTasks ? pendingTasks.length : 0;
        const pendingElement = document.getElementById('pending-tasks-count');
        if (pendingElement) pendingElement.textContent = pendingCount;

        const upcomingCount = upcomingEvents ? upcomingEvents.length : 0;
        const upcomingElement = document.getElementById('upcoming-events-count');
        if (upcomingElement) upcomingElement.textContent = upcomingCount;

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
        container.innerHTML = '<p class="dash-empty">Nenhuma tarefa por aqui</p>';
        return;
    }

    const statusIcon = { 'pendente': 'fa-clock', 'em andamento': 'fa-spinner', 'concluida': 'fa-circle-check', 'concluída': 'fa-circle-check' };
    container.innerHTML = tasksData.map(task => {
        const st = (task.status || 'pendente').toLowerCase();
        const icon = statusIcon[st] || 'fa-clock';
        const prio = task.priority ? ` · ${task.priority}` : '';
        return `
        <div class="glass-card dash-item">
            <div class="dash-item-icon"><i class="fa-solid ${icon}"></i></div>
            <div class="dash-item-body">
                <h4 class="dash-item-title">${UTILS.escapeHtml(task.title || 'Sem título')}</h4>
                <p class="dash-item-sub">${UTILS.escapeHtml(task.description || '')}${prio}</p>
            </div>
            <div class="dash-item-date">${UTILS.formatDate(task.due_date) || '—'}<small>${st}</small></div>
        </div>`;
    }).join('');
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcoming-events');
    if (!container) return;

    if (eventsData.length === 0) {
        container.innerHTML = '<p class="dash-empty">Nenhum evento próximo</p>';
        return;
    }

    const catIcon = { 'reuniao': 'fa-users', 'evento': 'fa-star', 'prazo': 'fa-flag', 'feriado': 'fa-flag-checkered' };
    container.innerHTML = eventsData.map(event => {
        const icon = catIcon[(event.category || 'evento').toLowerCase()] || 'fa-calendar-day';
        const d = event.date ? new Date(event.date + 'T12:00:00') : null;
        const day = d ? d.getDate() : '—';
        const mon = d ? d.toLocaleDateString('pt-br', { month: 'short' }).replace('.', '') : '';
        const loc = event.location ? ` · ${event.location}` : '';
        return `
        <div class="glass-card dash-item">
            <div class="dash-item-icon"><i class="fa-solid ${icon}"></i></div>
            <div class="dash-item-body">
                <h4 class="dash-item-title">${UTILS.escapeHtml(event.name || 'Sem título')}</h4>
                <p class="dash-item-sub">${UTILS.escapeHtml((event.time_start ? event.time_start + 'h' : '') + loc)}</p>
            </div>
            <div class="dash-item-date">${day} ${mon}<small>${event.status === 'planned' ? 'planejado' : ''}</small></div>
        </div>`;
    }).join('');
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
        'members': 'diretoria.html',
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
