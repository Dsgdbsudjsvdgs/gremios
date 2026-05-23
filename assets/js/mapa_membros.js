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
    
    if (!allMembers) {
      members = [];
      renderMembers();
      return;
    }

    // Carregar departamentos pra popular o filtro
    const depts = await UTILS.supabaseQuery('departments', {
      order: { column: 'name', ascending: true }
    });
    const deptFilter = document.getElementById('dept-filter');
    if (deptFilter && depts) {
      deptFilter.innerHTML = '<option value="">Todos os Departamentos</option>' +
        depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    }

    // Resolve department names for each member
    const membersWithDept = await Promise.all(allMembers.map(async (member) => {
      if (member.department_id) {
        const dept = depts ? depts.find(d => d.id === member.department_id) : null;
        return { 
          ...member, 
          department_name: dept ? dept.name : 'Sem departamento' 
        };
      }
      return { ...member, department_name: 'Sem departamento' };
    }));
    
    members = membersWithDept;
    filteredMembers = members;
    renderMembers();
  } catch (error) {
    console.error('❌ Error loading members:', error);
    UTILS.showError('Erro ao carregar membros');
  }
}

function renderMembers() {
    // Atualizado para buscar no id='members-map' conforme o HTML mapa_membros.html
    const container = document.getElementById('members-map');
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
            <button onclick="viewMemberProfile('${member.id}')" class="btn-view">Ver Perfil</button>
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
  const deptFilter = document.getElementById('dept-filter');
  const selectedDept = deptFilter ? deptFilter.value : '';
  
  filteredMembers = members.filter(member => {
    const matchesName = (member.full_name || '').toLowerCase().includes(searchValue);
    const matchesRole = (member.role || '').toLowerCase().includes(searchValue);
    const matchesDept = (member.department_name || '').toLowerCase().includes(searchValue);
    const matchesSearch = matchesName || matchesRole || matchesDept;
    
    const matchesFilter = !selectedDept || member.department_name === selectedDept;
    
    return matchesSearch && matchesFilter;
  });
  
  renderMembers();
}

function viewMemberProfile(memberId) {
    // Usando formato compatível com SSH/Terminais que interpretam '?' erroneamente
    // Se o problema persistir, considere o uso de URLs hash baseadas (/#/perfil)
    window.location.href = `perfil.html/id/${memberId}`;
}

console.log('✅ Members module loaded');
