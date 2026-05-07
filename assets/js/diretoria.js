// ============================================================================
// 🎓 DIRETORIA - Grêmio Estudantil v3 (Corrigido)
// ============================================================================

let directors = [];

document.addEventListener('DOMContentLoaded', async () => {
    CONFIG.initSupabase();
    await initDiretoria();
});

async function initDiretoria() {
    if (!UTILS.requireAuth()) return;

    try {
        await loadDirectors();
        setupEventListeners();
    } catch (error) {
        console.error('❌ Diretoria init error:', error);
        UTILS.showError('Erro ao carregar diretoria');
    }
}

async function loadDirectors() {
    try {
        const allMembers = await UTILS.supabaseQuery('profiles', {
            where: { role: 'admin' },
            order: { column: 'full_name', ascending: true }
        });
        
        directors = allMembers || [];
        renderDirectors();
    } catch (error) {
        console.error('❌ Error loading directors:', error);
    }
}

function renderDirectors() {
    const container = document.getElementById('directors-grid');
    if (!container) return;

    if (directors.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum diretor</p>';
        return;
    }

    container.innerHTML = directors.map(director => `
        <div class="director-card">
            <div class="director-avatar" style="background-color: ${director.color_hex || '#6366f1'}">${(director.full_name || 'D').charAt(0).toUpperCase()}</div>
            <h3 class="director-name">${director.full_name || 'Sem nome'}</h3>
            <p class="director-position">${director.role || 'Diretor'}</p>
            <p class="director-department">${director.department_name || 'Sem departamento'}</p>
            <p class="director-email">${director.email || 'Sem email'}</p>
            <button onclick="viewDirectorProfile(${director.id})" class="btn-view">Ver Perfil</button>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Setup any additional event listeners if needed
}

function viewDirectorProfile(directorId) {
    window.location.href = `perfil.html?id=${directorId}`;
}

console.log('✅ Diretoria module loaded');
