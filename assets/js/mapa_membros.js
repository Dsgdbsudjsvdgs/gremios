// ============================================================================
// 👥 MAPA DE MEMBROS - Grêmio Estudantil v3 (Corrigido)
// ============================================================================

let members = [];
let filteredMembers = [];

// Fallbacks de departamento (sem access_code — REVOKE bloqueia leitura)
const ROLE_DEPT_MAP = {
 'Presidente': 'Presidência',
 'Vice-Presidente': 'Vice-Presidência',
 'Secretário Geral': 'Secretaria Geral',
 'Secretária': 'Secretaria',
 'Tesoureira': 'Tesouraria',
 'Ouvidoria': 'Ouvidoria'
};

const MEMBER_DEPT_MAP = {
 'Agatha': 'Cultura',
 'Junior': 'Esportes',
 'Maria Eduarda': 'Eventos',
 'Atyla': 'Comunicação',
 'Maria Fernanda': 'Responsabilidade Social',
 'Kaylane': 'Meio Ambiente',
 'Paulo Henrique': 'Protagonismo',
 'Elvey': 'Tecnologia e Inovação',
 'João Guilherme': 'Ouvidoria',
 'Lohanna': 'Presidência',
 'Raphaella': 'Vice-Presidência',
 'David': 'Secretaria Geral',
 'Bianca': 'Secretaria',
 'Luzia': 'Tesouraria'
};

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

function resolveDepartment(member, deptMap, allDepts) {
 // 1. Pelo department_id
 if (member.department_id && deptMap[member.department_id]) {
  return deptMap[member.department_id];
 }
 // 2. Pelo role
 if (ROLE_DEPT_MAP[member.role]) {
  return ROLE_DEPT_MAP[member.role];
 }
 // 3. Pelo nome do membro ( Diretores)
 if (member.full_name && MEMBER_DEPT_MAP[member.full_name]) {
  return MEMBER_DEPT_MAP[member.full_name];
 }
 // 4. Buscar dept pelo nome que bate com o role
 if (allDepts) {
  const match = allDepts.find(d =>
   d.name.toLowerCase().includes(member.role.toLowerCase()) ||
   member.role.toLowerCase().includes(d.name.toLowerCase())
  );
  if (match) return match.name;
 }
 return 'Sem departamento';
}

async function loadMembers() {
 try {
  const [allMembers, allDepts] = await Promise.all([
   UTILS.supabaseQuery('profiles', { order: { column: 'full_name', ascending: true } }),
   UTILS.supabaseQuery('departments', { order: { column: 'name', ascending: true } })
  ]);

  if (!allMembers) {
   members = [];
   renderMembers();
   return;
  }

  // Popular filtro de departamentos
  const deptFilter = document.getElementById('dept-filter');
  if (deptFilter && allDepts) {
   deptFilter.innerHTML = '<option value="">Todos os Departamentos</option>' +
    allDepts.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  }

  // Mapa dept_id → dept_name
  const deptMap = {};
  if (allDepts) allDepts.forEach(d => { deptMap[d.id] = d.name; });

  // Resolver departamento com fallback
  members = allMembers.map(m => ({
   ...m,
   department_name: resolveDepartment(m, deptMap, allDepts)
  }));

  filteredMembers = members;
  renderMembers();
 } catch (error) {
  console.error('❌ Error loading members:', error);
  UTILS.showError('Erro ao carregar membros');
 }
}

function renderMembers() {
 const container = document.getElementById('members-map');
 if (!container) return;

 if (filteredMembers.length === 0) {
  container.innerHTML = '<p class="empty-state">Nenhum membro encontrado</p>';
  return;
 }

 container.innerHTML = filteredMembers.map(member => {
 const personalColor = member.color_hex || null;
 const deptColor = UTILS.getDeptColorByName(member.department_name) || '#6366f1';
 const avatarColor = personalColor || deptColor;
 const hasPersonalColor = personalColor && personalColor !== '#D0D0D0' && personalColor !== '#FFFFFF';
 const colorSource = hasPersonalColor ? 'personal' : 'dept';
 return `
 <div class="member-card" style="--dept-color:${deptColor};--member-color:${avatarColor}">
 <div class="member-avatar has-dept-color" style="background:${avatarColor};--dept-color:${avatarColor}">
 ${(member.full_name || 'M').charAt(0).toUpperCase()}
 </div>
 <h3 class="member-name">${member.full_name || 'Sem nome'}</h3>
 <p class="member-position">${member.role || 'Membro'}</p>
 <p class="member-department" style="color:${deptColor}">${member.department_name || 'Sem departamento'}</p>
 <span class="color-hex" style="color:${avatarColor}">${avatarColor}</span>
 <button onclick="viewMemberProfile('${member.id}')" class="btn-view">Ver Perfil</button>
 </div>
 `;
 }).join('');
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
 window.location.href = `perfil_membro.html#id=${memberId}`;
}

console.log('✅ Members module loaded');
