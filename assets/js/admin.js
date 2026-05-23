// ============================================================================
// 🔐 PAINEL ADMINISTRATIVO - Grêmio Estudantil v4
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
    await loadDepartments();
    setupEventListeners();
  } catch (error) {
    console.error('❌ Admin init error:', error);
    UTILS.showError('Erro ao carregar painel administrativo');
  }
}

async function loadDepartments() {
  try {
    const depts = await UTILS.supabaseQuery('departments', {
      order: { column: 'name', ascending: true }
    });
    const select = document.querySelector('[name="member-dept"]');
    if (select && depts) {
      select.innerHTML = '<option value="">Selecione...</option>' +
        depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
  } catch (error) {
    console.error('❌ Error loading departments:', error);
  }
}

async function loadMembers() {
  try {
    const data = await UTILS.supabaseQuery('profiles', {
      order: { column: 'full_name', ascending: true }
    });

    members = data || [];

    // Resolve department names
    members = await Promise.all(members.map(async (member) => {
      if (member.department_id) {
        const dept = await UTILS.supabaseQuery('departments', {
          where: { id: member.department_id }
        });
        return { ...member, department_name: dept && dept[0] ? dept[0].name : 'Sem departamento' };
      }
      return { ...member, department_name: 'Sem departamento' };
    }));

    renderMembers(members);
  } catch (error) {
    console.error('❌ Error loading members:', error);
  }
}

function renderMembers(memberList) {
  const container = document.getElementById('members-list');
  if (!container) return;

  if (memberList.length === 0) {
    container.innerHTML = '<p class="empty-state">Nenhum membro encontrado</p>';
    return;
  }

  const currentUser = UTILS.getStorageUser();

  container.innerHTML = memberList.map(member => `
    <div class="admin-item">
      <div class="admin-item-info">
        <h4>${member.full_name || 'Sem nome'}</h4>
        <p>${member.role || 'Membro'} — ${member.department_name || 'Sem departamento'}</p>
      </div>
      <div class="admin-item-actions">
        <button onclick="deleteMember('${member.id}')" class="btn-delete">Deletar</button>
      </div>
    </div>
  `).join('');
}

function setupEventListeners() {
  const addMemberBtn = document.getElementById('btn-add-member');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', () => {
      const modal = document.getElementById('member-modal');
      if (modal) modal.classList.add('active');
    });
  }

  const memberForm = document.getElementById('member-form');
  if (memberForm) {
    memberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleAddMember(e.target);
    });
  }

  const closeModalBtn = document.getElementById('btn-close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('member-modal');
      if (modal) modal.classList.remove('active');
    });
  }
}

async function handleAddMember(form) {
  try {
    const memberData = {
      full_name: form.querySelector('[name="member-name"]')?.value,
      role: form.querySelector('[name="member-role"]')?.value,
      department_id: form.querySelector('[name="member-dept"]')?.value || null,
      access_code: form.querySelector('[name="member-code"]')?.value?.toUpperCase()
    };

    if (!memberData.full_name || !memberData.access_code) {
      throw new Error('Nome e código de acesso são obrigatórios');
    }

    await UTILS.supabaseInsert('profiles', memberData);
    UTILS.showSuccess('Membro adicionado com sucesso!');
    form.reset();
    const modal = document.getElementById('member-modal');
    if (modal) modal.classList.remove('active');
    await loadMembers();
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
    await loadMembers();
  } catch (error) {
    console.error('❌ Error deleting member:', error);
    UTILS.showError('Erro ao deletar membro');
  }
}

console.log('✅ Admin module loaded');
