// ============================================================================
// 📔 DIÁRIO PÚBLICO - Grêmio Estudantil v4
// Anotações de todos os membros — qualquer um pode criar e ver
// ============================================================================

let diaryEntries = [];

document.addEventListener('DOMContentLoaded', async () => {
  CONFIG.initSupabase();
  await initDiary();
});

async function initDiary() {
  if (!UTILS.requireAuth()) return;

  try {
    await loadDiaryEntries();
    setupEventListeners();
  } catch (error) {
    console.error('❌ Diary init error:', error);
    UTILS.showError('Erro ao carregar anotações');
  }
}

async function loadDiaryEntries() {
  try {
    const entries = await UTILS.supabaseQuery('diary_entries', {
      order: { column: 'created_at', ascending: false }
    });
    
    diaryEntries = entries || [];

    // Resolver nome do autor de cada entrada
    diaryEntries = await Promise.all(diaryEntries.map(async (entry) => {
      if (entry.created_by) {
        const author = await UTILS.supabaseQuery('profiles', {
          where: { id: entry.created_by }
        });
        entry.author_name = (author && author[0]) ? author[0].full_name : 'Desconhecido';
      } else {
        entry.author_name = 'Anônimo';
      }
      return entry;
    }));

    renderDiaryEntries();
  } catch (error) {
    console.error('❌ Error loading diary entries:', error);
    UTILS.showError('Erro ao carregar anotações');
  }
}

function renderDiaryEntries() {
  const container = document.getElementById('diary-entries');
  if (!container) return;

  if (diaryEntries.length === 0) {
    container.innerHTML = '<p class="empty-state"><i class="fa-solid fa-pen-to-square"></i>Nenhuma anotação ainda. Crie a primeira!</p>';
    return;
  }

  const currentUser = UTILS.getStorageUser();

  container.innerHTML = diaryEntries.map(entry => {
    const isOwner = currentUser && entry.created_by === currentUser.id;
    return `
    <div class="glass-card diary-item">
      <div class="diary-header">
        <h3 class="diary-title">${entry.title || 'Sem título'}</h3>
        <small style="color:var(--text-muted);font-size:0.75rem;">✍️ ${entry.author_name} · ${UTILS.formatDateTime(entry.created_at)}</small>
      </div>
      <p class="diary-content">${entry.content || ''}</p>
      ${entry.tags ? `<div class="diary-tags">${entry.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}</div>` : ''}
      ${isOwner ? `
      <div class="diary-actions">
        <button onclick="deleteEntry('${entry.id}')" class="btn-delete">Deletar</button>
      </div>` : ''}
    </div>
  `}).join('');
}

function setupEventListeners() {
  const addEntryBtn = document.getElementById('btn-add-entry');
  if (addEntryBtn) {
    addEntryBtn.addEventListener('click', () => {
      const modal = document.getElementById('entry-modal');
      if (modal) modal.classList.add('active');
    });
  }

  const entryForm = document.getElementById('entry-form');
  if (entryForm) {
    entryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleAddEntry(e.target);
    });
  }

  const closeModalBtn = document.getElementById('btn-close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('entry-modal');
      if (modal) modal.classList.remove('active');
    });
  }
}

async function handleAddEntry(form) {
 try {
 const user = UTILS.getStorageUser();
 if (!user?.id) throw new Error('Sessão expirada. Faça login novamente.');

 // Verifica se o perfil existe no banco antes de inserir
 const { data: profile, error: profileError } = await CONFIG.getSupabase()
 .from('profiles')
 .select('id')
 .eq('id', user.id)
 .limit(1);

 if (profileError || !profile?.length) {
 console.warn('⚠️ Profile not found, inserting diary entry without created_by');
 var createdBy = null;
 } else {
 var createdBy = user.id;
 }

 const entryData = {
 title: form.querySelector('[name="entry-title"]')?.value,
 content: form.querySelector('[name="entry-content"]')?.value,
 tags: form.querySelector('[name="entry-tags"]')?.value,
 created_by: createdBy
 };

 if (!entryData.title || !entryData.content) {
 throw new Error('Preencha título e conteúdo');
 }

 await UTILS.supabaseInsert('diary_entries', entryData);
    UTILS.showSuccess('Anotação criada com sucesso!');
    
    form.reset();
    const modal = document.getElementById('entry-modal');
    if (modal) modal.classList.remove('active');
    
    await loadDiaryEntries();

  } catch (error) {
    console.error('❌ Error adding entry:', error);
    UTILS.showError(error.message);
  }
}

async function deleteEntry(id) {
  if (!confirm('Tem certeza que deseja deletar esta anotação?')) return;

  try {
    await UTILS.supabaseDelete('diary_entries', id);
    UTILS.showSuccess('Anotação deletada!');
    await loadDiaryEntries();
  } catch (error) {
    console.error('❌ Error deleting entry:', error);
    UTILS.showError('Erro ao deletar anotação');
  }
}

console.log('✅ Diary module loaded');
