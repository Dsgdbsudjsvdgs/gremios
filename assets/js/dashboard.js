// ============================================================================
// 📊 DASHBOARD — layout Student Space (Lovable)
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
        if (!UTILS.requireAuth()) return;
        currentUser = UTILS.getStorageUser();
        if (!currentUser) throw new Error('Usuário não autenticado');

        updateUserInfo();
        await loadDashboardData();
    } catch (error) {
        console.error('❌ Dashboard init error:', error);
        UTILS.showError(error.message);
    }
}

function updateUserInfo() {
    const userNameElement = document.getElementById('user-name');
    const userRoleElement = document.getElementById('user-role');
    const userAvatarElement = document.getElementById('user-avatar');
    const avatarLetter = document.getElementById('avatar-letter');

    if (userNameElement) userNameElement.textContent = currentUser.nome || 'Usuário';
    if (userRoleElement) userRoleElement.textContent = currentUser.role || 'Membro';
    if (avatarLetter) avatarLetter.textContent = (currentUser.nome || 'U').charAt(0).toUpperCase();

    // foto de perfil se existir
    if (userAvatarElement && currentUser.avatar_url && String(currentUser.avatar_url).startsWith('http')) {
        userAvatarElement.innerHTML = `<img src="${currentUser.avatar_url}" alt="avatar">`;
    }
}

async function loadDashboardData() {
    try {
        const todayISO = new Date().toISOString().split('T')[0];
        const [tasks, events, members] = await Promise.all([
            UTILS.supabaseQuery('tasks', { order: { column: 'created_at', ascending: false }, limit: 4 }),
            UTILS.supabaseQuery('events', { gte: { date: todayISO }, order: { column: 'date', ascending: true }, limit: 4 }),
            UTILS.supabaseQuery('profiles', { select: 'id' })
        ]);
        tasksData = tasks || [];
        eventsData = events || [];

        renderUpcomingEvents();
        renderRecentTasks();
        renderMembers(members ? members.length : 0);
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        const ev = document.getElementById('upcoming-events');
        const tk = document.getElementById('recent-tasks');
        if (ev) ev.innerHTML = '<p class="ss-empty">⚠️ Erro ao carregar — verifique a conexão</p>';
        if (tk) tk.innerHTML = '<p class="ss-empty">⚠️</p>';
    }
}

function renderMembers(count) {
    const el = document.getElementById('members-count');
    const fill = document.getElementById('members-fill');
    if (el) el.textContent = count;
    if (fill) fill.style.width = Math.min(100, Math.round((count / 60) * 100)) + '%';
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcoming-events');
    if (!container) return;

    const monthEl = document.getElementById('agenda-month');
    if (monthEl) {
        const now = new Date();
        monthEl.textContent = now.toLocaleDateString('pt-br', { month: 'short' }).replace('.', '').toUpperCase()
            + ' · ' + now.getFullYear();
    }

    if (eventsData.length === 0) {
        container.innerHTML = '<p class="ss-empty">Nenhum evento próximo</p>';
        return;
    }

    const catTag = {
        'reuniao': ['equipe', 'Equipe'],
        'evento': ['destaque', 'Destaque'],
        'prazo': ['urgente', 'Urgente'],
        'feriado': ['aberto', 'Aberto']
    };

    container.innerHTML = eventsData.map(event => {
        const d = event.date ? new Date(event.date + 'T12:00:00') : null;
        const day = d ? d.getDate() : '—';
        const mon = d ? d.toLocaleDateString('pt-br', { month: 'short' }).replace('.', '').toUpperCase() : '';
        const tag = catTag[(event.category || 'evento').toLowerCase()] || ['destaque', 'Destaque'];
        const hour = event.time_start ? event.time_start + 'h' : 'Dia inteiro';
        const loc = event.location ? ' · ' + event.location : '';
        return `
        <div class="ss-event">
            <div class="ss-date"><b>${day}</b><span>${mon}</span></div>
            <div class="ss-ev-body">
                <h4 class="ss-ev-title">${UTILS.escapeHtml(event.name || 'Sem título')}</h4>
                <p class="ss-ev-meta">${UTILS.escapeHtml(hour + loc)}</p>
            </div>
            <span class="ss-ev-tag ${tag[0]}">${tag[1]}</span>
        </div>`;
    }).join('');
}

function renderRecentTasks() {
    const container = document.getElementById('recent-tasks');
    if (!container) return;

    if (tasksData.length === 0) {
        container.innerHTML = '<p class="ss-empty">Nenhuma tarefa por aqui</p>';
        return;
    }

    container.innerHTML = tasksData.map(task => {
        const done = (task.status === 'completed' || task.status === 'concluida' || task.status === 'concluída');
        const prio = task.priority ? ' · ' + task.priority : '';
        return `
        <div class="ss-task">
            <div class="ss-check ${done ? 'done' : ''}">${done ? '✓' : ''}</div>
            <div class="ss-tk-body">
                <h4 class="ss-tk-title" ${done ? 'style="text-decoration:line-through;opacity:0.55;"' : ''}>${UTILS.escapeHtml(task.title || 'Sem título')}</h4>
                <p class="ss-tk-meta">${done ? 'concluída' : 'pendente'}${UTILS.escapeHtml(prio)}</p>
            </div>
        </div>`;
    }).join('');
}

console.log('✅ Dashboard Student Space loaded');
