// ============================================================================
// 🔐 PAINEL ADMINISTRATIVO - Grêmio Estudantil v3 (Corrigido)
// ============================================================================

let members = [];

document.addEventListener('DOMContentLoaded', async () => {
    CONFIG.initSupabase();
    await initAdmin();
});

async function initAdmin() {
    if (!UTILS.requireAdmin()) return;
    try {
        await loadMembers();
        setupEventListeners();
    } catch (error) {
        console.error('❌ Admin init error:', error);
        UTILS.showError('Erro ao carregar painel administrativo');
    }
}

async function loadMembers() {
    try {
        const { data: members, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) {
            console.error('❌ Error loading members:', error);
            throw error;
        }

        renderMembers(members);
    } catch (error) {
        console.error('❌ Error loading members:', error);
    }
}

function renderMembers(members) {
    const container = document.getElementById('members-list');
    if (!container) return;

    if (members.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum membro encontrado</p>';
        return;
    }

    container.innerHTML = members.map(member => `
        <div class="admin-item">
            <div class="admin-item-info">
                <h4>${member.full_name || 'Sem nome'}</h4>
                <p>${member.role || 'Membro'} - ${member.department_name || 'Sem departamento'}</p>
                <small>${member.email || 'Sem email'}</small>
            </div>
            <div class="admin-item-actions">
                <button onclick="editMember(${member.id})" class="btn-edit">Editar</button>
                <button onclick="deleteMember(${member.id})" class="btn-delete">Deletar</button>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    const addMemberBtn = document.getElementById('btn-add-member');
    addMemberBtn.addEventListener('click', () => {
        const modal = document.getElementById('member-modal');
        modal.style.display = 'flex';
    });

    const memberForm = document.getElementById('member-form');
    memberForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddMember(e.target);
    });

    const closeModalBtn = document.getElementById('btn-close-modal');
    closeModalBtn.addEventListener('click', () => {
        const modal = document.getElementById('member-modal');
        modal.style.display = 'none';
    });
}

async function handleAddMember(form) {
    try {
        const memberData = {
            full_name: form.querySelector('[name="member-name"]')?.value,
            email: form.querySelector('[name="member-email"]')?.value,
            role: form.querySelector('[name="member-role"]')?.value,
            department_id: form.querySelector('[name="member-dept"]')?.value,
            access_code: form.querySelector('[name="member-code"]')?.value
        };

        await UTILS.supabaseInsert('profiles', memberData);
        UTILS.showSuccess('Membro adicionado com sucesso!');
        form.reset();
        loadMembers();
    } catch (error) {
        console.error('❌ Error adding member:', error);
        UTILS.showError(error.message);
    }
}

async function deleteMember(id) {
    if (!confirm('Tem certeza que deseja deletar este membro?')) return;

    try {
        await UTILS.supabaseDelete('profiles', id);
        UTILS.showSuccess('Membro deletado com sucesso!');
        loadMembers();
    } catch (error) {
        console.error('❌ Error deleting member:', error);
        UTILS.showError('Erro ao deletar membro');
    }
}

function editMember(id) {
    UTILS.showError('Funcionalidade de edição em desenvolvimento');
}

console.log('✅ Admin module loaded');