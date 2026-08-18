// ============================================================================
// 👑 DIRETORIA - Grêmio Estudantil v4
// Renderiza a diretoria organizada por hierarquia e departamentos
// ============================================================================

let allMembers = [];

document.addEventListener('DOMContentLoaded', async () => {
  CONFIG.initSupabase();
  await initDiretoria();
});

async function initDiretoria() {
  try {
    await loadAllMembers();
    renderAllSections();
  } catch (error) {
    console.error('❌ Diretoria init error:', error);
    UTILS.showError('Erro ao carregar diretoria');
  }
}

async function loadAllMembers() {
  try {
    const data = await UTILS.supabaseQuery('profiles', {
      order: { column: 'full_name', ascending: true }
    });

    allMembers = data || [];

    // Resolve department names for each member
    allMembers = await Promise.all(allMembers.map(async (member) => {
      if (member.department_id) {
        const dept = await UTILS.supabaseQuery('departments', {
          where: { id: member.department_id }
        });
        return { ...member, department_name: dept && dept[0] ? dept[0].name : 'Sem departamento' };
      }
      return { ...member, department_name: 'Sem departamento' };
    }));

    // Sort by hierarchy: Presidente > Vice-Presidente > Secretaria/Tesouraria > Diretores > Ouvidoria
    const roleOrder = {
      'Presidente': 1,
      'Vice-Presidente': 2,
      'Secretário Geral': 3,
      'Secretária': 4,
      'Tesoureira': 5,
      'Diretor': 6,
      'Ouvidoria': 7
    };
    allMembers.sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));

  } catch (error) {
    console.error('❌ Error loading members:', error);
    allMembers = [];
  }
}

function getAvatarInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getRoleColor(role) {
  const colors = {
    'Presidente': '#FF6B6B',
    'Vice-Presidente': '#4ECDC4',
    'Secretário Geral': '#FFA07A',
    'Secretária': '#FFA07A',
    'Tesoureira': '#FFA07A',
    'Diretor': '#F7DC6F',
    'Ouvidoria': '#F8B739'
  };
  return colors[role] || '#00E5FF';
}

function getRoleIcon(role) {
  const icons = {
    'Presidente': 'fa-solid fa-crown',
    'Vice-Presidente': 'fa-solid fa-user-check',
    'Secretário Geral': 'fa-solid fa-pen-to-square',
    'Secretária': 'fa-solid fa-pen-to-square',
    'Tesoureira': 'fa-solid fa-coins',
    'Diretor': 'fa-solid fa-sitemap',
    'Ouvidoria': 'fa-solid fa-ear-listen'
  };
  return icons[role] || 'fa-solid fa-user';
}

function createDirectorCard(member) {
  const color = getRoleColor(member.role);
  const icon = getRoleIcon(member.role);
  const initials = getAvatarInitials(member.full_name);
  
  return `
    <div class="director-card">
      <div class="director-avatar" style="background:${color};border-color:${color};">
        ${initials}
      </div>
      <div class="director-name">${member.full_name || 'Sem nome'}</div>
      <div class="director-role"><i class="${icon}"></i> ${member.role}</div>
      <div class="director-dept">${member.department_name || 'Sem departamento'}</div>
      <span class="director-badge">${initials}</span>
    </div>
  `;
}

function renderSection(containerId, members, fallbackMessage) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (members.length === 0) {
    container.innerHTML = `<div class="empty-director">${fallbackMessage}</div>`;
    return;
  }
  
  container.innerHTML = members.map(createDirectorCard).join('');
}

function renderAllSections() {
  // Presidência
  const presidencia = allMembers.filter(m => m.role === 'Presidente');
  renderSection('dir-presidencia', presidencia, 'Nenhum Presidente cadastrado');

  // Vice-Presidência
  const vice = allMembers.filter(m => m.role === 'Vice-Presidente');
  renderSection('dir-vice', vice, 'Nenhum Vice-Presidente cadastrado');

  // Secretaria & Tesouraria
  const secretaria = allMembers.filter(m => 
    m.role === 'Secretário Geral' || m.role === 'Secretária' || m.role === 'Tesoureira'
  );
  renderSection('dir-secretaria', secretaria, 'Nenhum cargo de Secretaria/Tesouraria');

  // Diretores de Departamento
  const diretores = allMembers.filter(m => m.role === 'Diretor');
  renderSection('dir-departamentos', diretores, 'Nenhum Diretor cadastrado');

  // Ouvidoria
  const ouvidoria = allMembers.filter(m => m.role === 'Ouvidoria');
  renderSection('dir-ouvidoria', ouvidoria, 'Nenhum Ouvidor cadastrado');
}