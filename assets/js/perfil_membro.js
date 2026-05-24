// ============================================================================
// 👤 PERFIL DO MEMBRO - Grêmio Estudantil v3
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
 CONFIG.initSupabase();
 await initMemberProfile();
});

function getMemberIdFromUrl() {
 const hash = window.location.hash;
 if (hash.startsWith('#id=')) {
  return decodeURIComponent(hash.replace('#id=', ''));
 }
 return null;
}

// Fallbacks de departamento
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

function resolveDeptName(member, deptMap, allDepts) {
 // 1. Pelo department_id
 if (member.department_id && deptMap[member.department_id]) {
  return deptMap[member.department_id];
 }
 // 2. Pelo role (cargos únicos)
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

async function initMemberProfile() {
 if (!UTILS.requireAuth()) return;

 const memberId = getMemberIdFromUrl();
 if (!memberId) {
  document.getElementById('profile-content').innerHTML = `
   <div class="empty-tasks">
    <i class="fa-solid fa-user-xmark"></i>
    <p>Membro não encontrado</p>
    <button class="back-btn" onclick="history.back()" style="margin-top:16px">
     <i class="fa-solid fa-arrow-left"></i> Voltar
    </button>
   </div>`;
  return;
 }

 try {
  const [profiles, allDepts, allTasks] = await Promise.all([
   UTILS.supabaseQuery('profiles', { where: { id: memberId } }),
   UTILS.supabaseQuery('departments', {}),
   UTILS.supabaseQuery('tasks', { where: { assigned_to: memberId } })
  ]);

  if (!profiles || profiles.length === 0) {
   document.getElementById('profile-content').innerHTML = `
    <div class="empty-tasks">
     <i class="fa-solid fa-user-xmark"></i>
     <p>Membro não encontrado no banco</p>
     <button class="back-btn" onclick="history.back()" style="margin-top:16px">
      <i class="fa-solid fa-arrow-left"></i> Voltar
     </button>
    </div>`;
   return;
  }

  const member = profiles[0];

  // Resolver departamento
  const deptMap = {};
  if (allDepts) allDepts.forEach(d => { deptMap[d.id] = d.name; });
  const deptName = resolveDeptName(member, deptMap, allDepts);
  const deptColor = UTILS.getDeptColorByName(deptName) || member.color_hex || '#6366f1';

  const statusLabels = { pending: 'Pendente', in_progress: 'Em Progresso', completed: 'Concluída' };
  const priorityLabels = { low: 'Baixa', medium: 'Média', high: 'Alta' };

  // Render
  document.getElementById('profile-content').innerHTML = `
   <div class="profile-header">
    <div class="profile-avatar-lg" style="background:${deptColor}; color:#000; border-color:${deptColor}">
     ${(member.full_name || 'M').charAt(0).toUpperCase()}
    </div>
    <h2 class="profile-name-lg">${member.full_name || 'Sem nome'}</h2>
    <span class="profile-role-badge" style="background:${deptColor}22; color:${deptColor}">
     ${member.role || 'Membro'}
    </span>
    <p class="profile-dept-name">${deptName}</p>
   </div>

   <div class="profile-info-card">
    <h3><i class="fa-solid fa-circle-info"></i> Informações</h3>
    <div class="info-row">
     <span class="info-label">Cargo</span>
     <span class="info-value">${member.role || 'Membro'}</span>
    </div>
    <div class="info-row">
     <span class="info-label">Departamento</span>
     <span class="info-value">${deptName}</span>
    </div>
    <div class="info-row">
     <span class="info-label">Membro desde</span>
     <span class="info-value">${member.created_at ? UTILS.formatDate(member.created_at) : '—'}</span>
    </div>
    <div class="info-row">
     <span class="info-label">Cor</span>
     <span class="info-value" style="display:flex;align-items:center;gap:6px">
      <span style="width:14px;height:14px;border-radius:50%;background:${deptColor};display:inline-block"></span>
      ${deptColor}
     </span>
    </div>
   </div>

   <div style="margin-top:8px">
    <h3 class="section-title">
     <i class="fa-solid fa-list-check"></i> Tarefas Atribuídas
     ${allTasks && allTasks.length > 0 ? `<span style="font-size:0.75rem;color:var(--text-muted);font-weight:400">(${allTasks.length})</span>` : ''}
    </h3>
    ${allTasks && allTasks.length > 0 ? allTasks.map(t => `
     <div class="task-card">
      <div class="task-header">
       <span class="task-title">${t.title || 'Sem título'}</span>
       <span class="task-status status-${t.status || 'pending'}">${statusLabels[t.status] || t.status || 'Pendente'}</span>
      </div>
      ${t.description ? `<p class="task-desc">${t.description}</p>` : ''}
      <div class="task-meta">
       ${t.priority ? `<span><i class="fa-solid fa-flag"></i> ${priorityLabels[t.priority] || t.priority}</span>` : ''}
       ${t.due_date ? `<span><i class="fa-regular fa-calendar"></i> ${UTILS.formatDate(t.due_date)}</span>` : ''}
      </div>
     </div>
    `).join('') : `
     <div class="empty-tasks">
      <i class="fa-solid fa-clipboard-check"></i>
      <p>Nenhuma tarefa atribuída</p>
     </div>
    `}
   </div>
  `;

 } catch (error) {
  console.error('❌ Erro ao carregar perfil:', error);
  document.getElementById('profile-content').innerHTML = `
   <div class="empty-tasks">
    <i class="fa-solid fa-triangle-exclamation"></i>
    <p>Erro ao carregar perfil: ${error.message}</p>
    <button class="back-btn" onclick="history.back()" style="margin-top:16px">
     <i class="fa-solid fa-arrow-left"></i> Voltar
    </button>
   </div>`;
 }
}

console.log('✅ Perfil Membro module loaded');
