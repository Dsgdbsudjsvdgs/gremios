// =============================================================================
// 👤 GESTÃO DE PERFIL v2 — bio + avatar custom + paleta (customização de verdade)
// =============================================================================

const PROFILE_PALETTE = [
  '#00E5FF', // ciano (padrão)
  '#7C4DFF', // roxo
  '#FF4081', // rosa
  '#FF6B35', // laranja
  '#00E676', // verde
  '#FFD600', // amarelo
  '#448AFF', // azul
  '#F50057', // magenta
  '#00BFA5', // teal
  '#FF9100', // âmbar
  '#9CCC65', // lima
  '#FFFFFF', // branco
];

async function initProfile() {
    const user = UTILS.getStorageUser();
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    // Recarregar dados frescos do banco (bio/avatar podem ter mudado noutro device)
    try {
        const fresh = await UTILS.supabaseQuery('profiles', { where: { id: user.id }, limit: 1 });
        if (fresh && fresh[0] && fresh[0].id === user.id) {  // guard: confere que é o MESMO usuário
            const merged = { ...user, ...fresh[0], nome: fresh[0].full_name || user.nome, role: fresh[0].role || user.role };
            UTILS.setStorageUser(merged);
        }
    } catch (e) { console.warn('Perfil: usando dados do storage', e); }

    const u = UTILS.getStorageUser();
    const accent = u.color_hex || '#00E5FF';

    // ---- Aplicar cor no app inteiro (já é o comportamento) ----
    document.documentElement.style.setProperty('--accent-color', accent);

    // ---- Referências ----
    const nameDisplay = document.getElementById('profile-name');
    const roleDisplay = document.getElementById('profile-role');
    const bioDisplay = document.getElementById('profile-bio');
    const editName = document.getElementById('edit-name');
    const editBio = document.getElementById('edit-bio');
    const bioCount = document.getElementById('bio-count');
    const editColor = document.getElementById('edit-color');
    const editColorHex = document.getElementById('edit-color-hex');
    const profilePic = document.getElementById('profile-pic');
    const avatarLetter = document.getElementById('avatar-letter');
    const paletteGrid = document.getElementById('palette-grid');
    const avatarFile = document.getElementById('avatar-file');
    const cover = document.getElementById('profile-cover');

    // ---- Preencher ----
    if (nameDisplay) nameDisplay.textContent = u.nome || 'Usuário';
    if (roleDisplay) roleDisplay.textContent = u.role || 'Membro';
    if (bioDisplay) bioDisplay.textContent = u.bio || '';
    if (editName) editName.value = u.nome || '';
    if (editBio) {
        editBio.value = u.bio || '';
        if (bioCount) bioCount.textContent = (u.bio || '').length;
        editBio.addEventListener('input', () => { if (bioCount) bioCount.textContent = editBio.value.length; });
    }
    if (editColor) editColor.value = accent;
    if (editColorHex) editColorHex.value = accent.toUpperCase();

    // ---- Avatar (img do banco ou inicial) ----
    function renderAvatar() {
        if (u.avatar_url && u.avatar_url.startsWith('http')) {
            profilePic.innerHTML = `<img src="${u.avatar_url}" alt="avatar">`;
        } else {
            profilePic.innerHTML = `<span id="avatar-letter">${(u.nome || 'U').charAt(0).toUpperCase()}</span><div class="avatar-edit-hint"><i class="fa-solid fa-camera"></i></div>`;
        }
    }
    renderAvatar();

    // ---- Upload de avatar: 256px JPEG -> Supabase Storage (bucket público) ----
    if (profilePic && avatarFile) {
        profilePic.addEventListener('click', () => avatarFile.click());
        avatarFile.addEventListener('change', () => {
            const file = avatarFile.files && avatarFile.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) { UTILS.showError('Imagem muito grande (máx 5MB)'); return; }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const SIZE = 256;
                    const canvas = document.createElement('canvas');
                    canvas.width = SIZE; canvas.height = SIZE;
                    const ctx = canvas.getContext('2d');
                    // crop central quadrado + resize
                    const min = Math.min(img.width, img.height);
                    ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, SIZE, SIZE);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                    // dataURL -> blob -> upload pro Supabase Storage
                    (async () => {
                        try {
                            const blob = await (await fetch(dataUrl)).blob();
                            const { error: upErr } = await CONFIG.getSupabase()
                                .storage.from('avatars')
                                .upload(`${u.id}.jpg`, blob, { contentType: 'image/jpeg', upsert: true });
                            if (upErr) throw upErr;
                            const { data: pub } = CONFIG.getSupabase()
                                .storage.from('avatars')
                                .getPublicUrl(`${u.id}.jpg`);
                            u.avatar_url = pub.publicUrl + '?v=' + Date.now(); // cache-buster: força reload da nova foto
                            renderAvatar();
                            UTILS.showSuccess('Foto enviada! Salve para confirmar.');
                        } catch (err) {
                            console.error('Erro no upload do avatar:', err);
                            UTILS.showError('Erro ao enviar foto: ' + (err.message || err.error || err));
                        }
                    })();
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // ---- Paleta ----
    function markSelected(hex) {
        paletteGrid.querySelectorAll('.palette-swatch').forEach(s => {
            s.classList.toggle('selected', s.dataset.hex.toUpperCase() === hex.toUpperCase());
        });
    }
    function applyAccent(hex, save) {
        document.documentElement.style.setProperty('--accent-color', hex);
        if (roleDisplay) { roleDisplay.style.backgroundColor = hex + '1F'; roleDisplay.style.color = hex; roleDisplay.style.borderColor = hex; }
        if (cover) cover.style.background = `linear-gradient(135deg, ${hex} 0%, rgba(0,0,0,0.55) 100%)`;
        if (save !== false) markSelected(hex);
    }

    if (paletteGrid) {
        paletteGrid.innerHTML = PROFILE_PALETTE.map(c =>
            `<div class="palette-swatch" data-hex="${c}" style="background:${c}"></div>`
        ).join('');
        paletteGrid.querySelectorAll('.palette-swatch').forEach(sw => {
            sw.addEventListener('click', () => {
                const hex = sw.dataset.hex;
                if (editColor) editColor.value = hex;
                if (editColorHex) editColorHex.value = hex.toUpperCase();
                applyAccent(hex);
            });
        });
        markSelected(accent);
    }
    applyAccent(accent, false);

    if (editColor && editColorHex) {
        editColor.oninput = () => {
            editColorHex.value = editColor.value.toUpperCase();
            applyAccent(editColor.value);
        };
        editColorHex.oninput = () => {
            let val = editColorHex.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                editColor.value = val;
                applyAccent(val);
            }
        };
    }

    // ---- Salvar ----
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = profileForm.querySelector('button');
            if (!btn) return;
            btn.disabled = true;
            btn.textContent = 'Salvando...';

            let finalColor = editColorHex?.value || accent;
            if (!finalColor.startsWith('#')) finalColor = '#' + finalColor;

            const updates = {
                full_name: editName?.value || u.nome,
                bio: (editBio?.value || '').trim(),
                color_hex: finalColor.toUpperCase()
            };
            if (u.avatar_url) updates.avatar_url = u.avatar_url;

            try {
                await UTILS.supabaseUpdate('profiles', u.id, updates);
                const updated = { ...u, ...updates, nome: updates.full_name };
                UTILS.setStorageUser(updated);
                if (bioDisplay) bioDisplay.textContent = updates.bio;
                if (nameDisplay) nameDisplay.textContent = updates.full_name;
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

initProfile();
