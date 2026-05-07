// ============================================================================
// 👥 MAPA DE MEMBROS - Grêmio Estudantil v3 (Corrigido)
// ============================================================================

let members = [];
let filteredMembers = [];

document.addEventListener('DOMContentLoaded', async () => {
    CONFIG.initSupabase();
    await initMembers();
});

async function initMembers() {
    if (!UTILS.requireAuth()) return;

    try {
        await loadMembers();
        setupEventListeners();
    } catch (error) {
        console.error('❌ Members init error:', error);
        UTILS.showError('Erro ao carregar membros');
    }
}

async function loadMembers() {
    try {
        const allMembers = await UTILS.supabaseQuery('profiles', {
            order: { column: 'full_name', ascending: true }
        });
        
        members = allMembers || [];
        filteredMembers = members;
        renderMembers();
    } catch (error) {
        console.error('❌ Error loading members:', error);
    }
}

function renderMembers() {
    const container = document.getElementById('members-grid');
    if (!container) return;

    if (filteredMembers.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum membro encontrado</p>';
        return;
    }

    container.innerHTML = filteredMembers.map(member => `
        <div class="member-card">
            <div class="member-avatar">${(member.full_name || 'M').charAt(0).toUpperCase()}</div>
            <h3 class="member-name">${member.full_name || 'Sem nome'}</h3>
            <p class="member-position">${member.role || 'Membro'}</p>
            <p class="member-department">${member.department_name || 'Sem departamento'}</p>
            <button onclick="viewMemberProfile(${member.id})" class="btn-view">Ver Perfil</button>
        </div>
    `).join('');
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-members');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterMembers(e.target.value);
        });
    }

    const deptFilter = document.getElementById('dept-filter');
    if (deptFilter) {
        deptFilter.addEventListener('change', (e) => {
            filterMembers(e.target.value);
        });
    }
}

function filterMembers(query) {
    const searchValue = query.toLowerCase();
    
    filteredMembers = members.filter(member => {
        const matchesName = (member.full_name || '').toLowerCase().includes(searchValue);
        const matchesRole = (member.role || '').toLowerCase().includes(searchValue);
        const matchesDept = (member.department_name || '').toLowerCase().includes(searchValue);
        
        return matchesName || matchesRole || matchesDept;
    });
    
    renderMembers();
}

function viewMemberProfile(memberId) {
    window.location.href = `perfil.html?id=${memberId}`;
}

console.log('✅ Members module loaded');
