// =============================================================================
// 👤 GESTÃO DE PERFIL - Grêmio Estudantil v3 (Sincronizado com SQL e CoreGuard)
// =============================================================================

async function initProfile() {
    // Sincronização TOTAL: Usa a função global do utils.js para pegar o usuário
    const user = UTILS.getStorageUser();
    
    if (!user) {
        console.error('Sessão expirada ou usuário não encontrado.');
        window.location.href = '../index.html';
        return;
    }

    // Elementos da UI
    const nameDisplay = document.getElementById('profile-name');
    const roleDisplay = document.getElementById('profile-role');
    const editName = document.getElementById('edit-name');
    const editColor = document.getElementById('edit-color');
    const editColorHex = document.getElementById('edit-color-hex');
    const profilePic = document.getElementById('profile-pic');

    // Preencher dados iniciais
    if (nameDisplay) nameDisplay.textContent = user.nome || 'Usuário';
    if (roleDisplay) roleDisplay.textContent = user.role || 'Membro';
    if (editName) editName.value = user.nome || '';
    if (editColor) editColor.value = user.color_hex || '#0062ff';
    if (editColorHex) editColorHex.value = user.color_hex || '#0062ff';
    
    // Avatar: Tenta usar a URL do avatar do banco, senão usa a inicial do nome
    if (profilePic) {
        if (user.avatar && user.avatar.startsWith('http')) {
            profilePic.innerHTML = `<img src="${user.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            profilePic.textContent = (user.nome || 'U').charAt(0).toUpperCase();
        }
    }

    // Atualizar cor do badge visualmente
    if (roleDisplay) roleDisplay.style.backgroundColor = user.color_hex || '#0062ff';

    // --- SINCRONIZAÇÃO DE CORES EM TEMPO REAL ---
    if (editColor && editColorHex) {
        editColor.oninput = () => { 
            editColorHex.value = editColor.value.toUpperCase(); 
            if (roleDisplay) roleDisplay.style.backgroundColor = editColor.value;
            document.documentElement.style.setProperty('--primary', editColor.value);
        };
        editColorHex.oninput = () => { 
            let val = editColorHex.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                editColor.value = val;
                if (roleDisplay) roleDisplay.style.backgroundColor = val;
                document.documentElement.style.setProperty('--primary', val);
            }
        };
    }

    // --- SALVAMENTO DE DADOS ---
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            if (!btn) return;
            
            btn.disabled = true;
            btn.textContent = 'Salvando...';

            let finalColor = editColorHex?.value || user.color_hex;
            if (!finalColor.startsWith('#')) finalColor = '#' + finalColor;
            
            const updates = {
                full_name: editName?.value || user.nome,
                color_hex: finalColor.toUpperCase()
            };

            try {
                // USANDO PADRÃO UTILS PARA SINCRONIZAÇÃO TOTAL
                await UTILS.supabaseUpdate('profiles', user.id, updates);
                
                // Atualiza o storage usando a função global do utils.js para manter consistência
                const updatedUser = { ...user, ...updates };
                UTILS.setStorageUser(updatedUser);
                
                UTILS.showSuccess('Perfil atualizado com sucesso!');
            } catch (err) {
                console.error('Erro ao atualizar perfil:', err);
                UTILS.showError('Erro ao atualizar perfil: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Salvar Alterações';
            }
        };
    }
}

// Inicia o processo
initProfile();
