// ============================================================================
// 📔 DIÁRIO - Grêmio Estudantil v3 (Corrigido)
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
        UTILS.showError('Erro ao carregar diário');
    }
}

async function loadDiaryEntries() {
    try {
        const user = UTILS.getStorageUser();
        if (!user) throw new Error('Usuário não autenticado');

        const entries = await UTILS.supabaseQuery('diary_entries', {
            where: { created_by: user.id },
            order: { column: 'created_at', ascending: false }
        });
        
        diaryEntries = entries || [];
        renderDiaryEntries();
    } catch (error) {
        console.error('❌ Error loading diary entries:', error);
        UTILS.showError('Erro ao carregar diário');
    }
}

function renderDiaryEntries() {
    const container = document.getElementById('diary-entries');
    if (!container) return;

    if (diaryEntries.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma entrada no diário</p>';
        return;
    }

    container.innerHTML = diaryEntries.map(entry => `
        <div class="diary-item">
            <div class="diary-header">
                <h3 class="diary-title">${entry.title || 'Sem título'}</h3>
                <small>${UTILS.formatDateTime(entry.created_at)}</small>
            </div>
            <p class="diary-content">${entry.content || ''}</p>
            ${entry.tags ? `<div class="diary-tags">${entry.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}</div>` : ''}
            <div class="diary-actions">
                <button onclick="editEntry(${entry.id})" class="btn-edit">Editar</button>
                <button onclick="deleteEntry(${entry.id})" class="btn-delete">Deletar</button>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    const addEntryBtn = document.getElementById('btn-add-entry');
    if (addEntryBtn) {
        addEntryBtn.addEventListener('click', () => {
            const modal = document.getElementById('entry-modal');
            if (modal) modal.style.display = 'flex';
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
            if (modal) modal.style.display = 'none';
        });
    }
}

async function handleAddEntry(form) {
    try {
        const user = UTILS.getStorageUser();
        const entryData = {
            title: form.querySelector('[name="entry-title"]')?.value,
            content: form.querySelector('[name="entry-content"]')?.value,
            tags: form.querySelector('[name="entry-tags"]')?.value,
            created_by: user.id
        };

        if (!entryData.title || !entryData.content) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        await UTILS.supabaseInsert('diary_entries', entryData);
        UTILS.showSuccess('Entrada adicionada com sucesso!');
        
        form.reset();
        const modal = document.getElementById('entry-modal');
        if (modal) modal.style.display = 'none';
        
        await loadDiaryEntries();

    } catch (error) {
        console.error('❌ Error adding entry:', error);
        UTILS.showError(error.message);
    }
}

async function deleteEntry(id) {
    if (!confirm('Tem certeza que deseja deletar esta entrada?')) return;

    try {
        await UTILS.supabaseDelete('diary_entries', id);
        UTILS.showSuccess('Entrada deletada com sucesso!');
        await loadDiaryEntries();
    } catch (error) {
        console.error('❌ Error deleting entry:', error);
        UTILS.showError('Erro ao deletar entrada');
    }
}

function editEntry(id) {
    UTILS.showError('Funcionalidade de edição em desenvolvimento');
}

console.log('✅ Diary module loaded');
