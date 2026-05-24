// ============================================================================
// ✅ GESTOR DE TAREFAS - Grêmio Estudantil v3 (Corrigido)
// ============================================================================

let tasks = [];

document.addEventListener('DOMContentLoaded', async () => {
    CONFIG.initSupabase();
    await initTasks();
});

async function initTasks() {
    if (!UTILS.requireAuth()) return;

    try {
        await loadTasks();
        setupEventListeners();
    } catch (error) {
        console.error('❌ Tasks init error:', error);
        UTILS.showError('Erro ao carregar tarefas');
    }
}

async function loadTasks() {
    try {
        const allTasks = await UTILS.supabaseQuery('tasks', {
            order: { column: 'created_at', ascending: false }
        });
        
        tasks = allTasks || [];
        renderTasks();
    } catch (error) {
        console.error('❌ Error loading tasks:', error);
    }
}

function renderTasks() {
    const container = document.getElementById('tasks-list');
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma tarefa</p>';
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-item">
            <div class="task-header">
                <h3 class="task-title">${task.title || 'Sem título'}</h3>
                <span class="task-status status-${task.status || 'pendente'}">${task.status || 'Pendente'}</span>
            </div>
            <p class="task-description">${task.description || ''}</p>
            <div class="task-meta">
                <span>Prioridade: ${task.priority || 'Média'}</span>
                <span>Vencimento: ${UTILS.formatDate(task.due_date) || 'Sem data'}</span>
            </div>
            <div class="task-actions">
    <select onchange="updateTaskStatus('${task.id}', this.value)">
      <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pendente</option>
      <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>Em Andamento</option>
      <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Concluído</option>
    </select>
                <button onclick="deleteTask('${task.id}')" class="btn-delete">Deletar</button>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    const addTaskBtn = document.getElementById('btn-add-task');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      const modal = document.getElementById('task-modal');
      if (modal) modal.classList.add('active');
    });
  }

  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleAddTask(e.target);
    });
  }

  const closeModalBtn = document.getElementById('btn-close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('task-modal');
      if (modal) modal.classList.remove('active');
    });
  }
}

async function handleAddTask(form) {
  try {
    const user = UTILS.getStorageUser();
    if (!user?.id) throw new Error('Sessão expirada. Faça login novamente.');

    // Valida se o perfil existe no banco antes de inserir (evita FK error)
    const { data: profile, error: profileError } = await CONFIG.getSupabase()
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .limit(1);

    const assignedTo = (profileError || !profile?.length) ? null : user.id;

    const taskData = {
      title: form.querySelector('[name="task-title"]')?.value,
      description: form.querySelector('[name="task-desc"]')?.value,
      priority: form.querySelector('[name="task-priority"]')?.value || 'media',
      due_date: form.querySelector('[name="task-date"]')?.value,
      status: CONFIG.STATUS.PENDING,
      assigned_to: assignedTo
    };

        const validation = UTILS.validateTaskTitle(taskData.title);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

  await UTILS.supabaseInsert('tasks', taskData);
  UTILS.showSuccess('Tarefa adicionada com sucesso!');
  
  form.reset();
  const modal = document.getElementById('task-modal');
  if (modal) modal.classList.remove('active');
        
        await loadTasks();

    } catch (error) {
        console.error('❌ Error adding task:', error);
        UTILS.showError(error.message);
    }
}

async function updateTaskStatus(id, status) {
    try {
        await UTILS.supabaseUpdate('tasks', id, { status });
        UTILS.showSuccess('Tarefa atualizada!');
        await loadTasks();
    } catch (error) {
        console.error('❌ Error updating task:', error);
        UTILS.showError('Erro ao atualizar tarefa');
    }
}

async function deleteTask(id) {
 // Verificar se existe modal de confirmação, senão usar confirm nativo
 const confirmModal = document.getElementById('confirm-modal');
 if (confirmModal) {
  return new Promise((resolve) => {
   confirmModal.classList.add('active');
   const onConfirm = async () => {
    cleanup();
    try {
     await UTILS.supabaseDelete('tasks', id);
     UTILS.showSuccess('Tarefa deletada com sucesso!');
     await loadTasks();
    } catch (error) {
     console.error('❌ Error deleting task:', error);
     UTILS.showError('Erro ao deletar tarefa');
    }
    resolve();
   };
   const onCancel = () => { cleanup(); resolve(); };
   const cleanup = () => {
    confirmModal.classList.remove('active');
    document.getElementById('confirm-yes')?.removeEventListener('click', onConfirm);
    document.getElementById('confirm-no')?.removeEventListener('click', onCancel);
   };
   document.getElementById('confirm-yes')?.addEventListener('click', onConfirm);
   document.getElementById('confirm-no')?.addEventListener('click', onCancel);
  });
 }
 // Fallback: confirm nativo
 if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

 try {
  await UTILS.supabaseDelete('tasks', id);
  UTILS.showSuccess('Tarefa deletada com sucesso!');
  await loadTasks();
 } catch (error) {
  console.error('❌ Error deleting task:', error);
  UTILS.showError('Erro ao deletar tarefa');
 }
}

console.log('✅ Tasks module loaded');
