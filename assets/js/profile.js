     1|// =============================================================================
     2|// 👤 GESTÃO DE PERFIL - GRÊMIO v2 (Sincronizado com full_setup.sql)
     3|// =============================================================================
     4|
     5|// Configurações do Supabase
     6|const SUPABASE_URL = 'https://wearihgeytywbhhtvwlg.supabase.co';
     7|const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYXJpaGdleXR5d2JoaHR2d2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDgsImV4cCI6MjA5MjM5MDY0OH0.5pz5JCKUEC5y7GuKt4OnSNW-VF_hrYUB4teoucHBNqY';
     8|const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
     9|
    10|async function initProfile() {
    11|    // Sincronização de chave: usando 'gremio_usuario_atual' para bater com auth.js e app.js
    12|    const user = JSON.parse(localStorage.getItem('gremio_usuario_atual'));
    13|    
    14|    if (!user) {
    15|        console.error('Sessão expirada ou usuário não encontrado.');
    16|        window.location.href = '../index.html';
    17|        return;
    18|    }
    19|
    20|    // Preencher dados iniciais nos elementos da página
    21|    const nameDisplay = document.getElementById('profile-name');
    22|    const roleDisplay = document.getElementById('profile-role');
    23|    const editName = document.getElementById('edit-name');
    24|    const editColor = document.getElementById('edit-color');
    25|    const editColorHex = document.getElementById('edit-color-hex');
    26|
    27|    if (nameDisplay) nameDisplay.textContent = user.nome || 'Usuário';
    28|    if (roleDisplay) roleDisplay.textContent = user.role || 'Membro';
    29|    if (editName) editName.value = user.nome || '';
    30|    if (editColor) editColor.value = user.color_hex || '#0062ff';
    31|    if (editColorHex) editColorHex.value = user.color_hex || '#0062ff';
    32|    
    33|    // Atualizar cor do badge visualmente
    34|    if (roleDisplay) roleDisplay.style.backgroundColor = user.color_hex || '#0062ff';
    35|
    36|    // --- SINCRONIZAÇÃO DE CORES EM TEMPO REAL ---
    37|    if (editColor && editColorHex) {
    38|        // Quando muda o seletor de cor (picker), atualiza o texto do Hex
    39|        editColor.oninput = () => { 
    40|            editColorHex.value = editColor.value.toUpperCase(); 
    41|            if (roleDisplay) roleDisplay.style.backgroundColor = editColor.value;
    42|        };
    43|        // Quando muda o texto do Hex, atualiza o seletor (com validação básica)
    44|        editColorHex.oninput = () => { 
    45|            let val = editColorHex.value;
    46|            if (!val.startsWith('#')) val = '#' + val;
    47|            if (/^#[0-9A-F]{6}$/i.test(val)) {
    48|                editColor.value = val;
    49|                if (roleDisplay) roleDisplay.style.backgroundColor = val;
    50|            }
    51|        };
    52|    }
    53|
    54|    // --- SALVAMENTO DE DADOS ---
    55|    const profileForm = document.getElementById('profile-form');
    56|    if (profileForm) {
    57|        profileForm.onsubmit = async (e) => {
    58|            e.preventDefault();
    59|            const btn = e.target.querySelector('button');
    60|            if (!btn) return;
    61|            
    62|            btn.disabled = true;
    63|            btn.textContent = 'Salvando...';
    64|
    65|            // Validação de cor Hexadecimal
    66|            let finalColor = editColorHex?.value || user.color_hex;
    67|            if (!finalColor.startsWith('#')) finalColor = '#' + finalColor;
    68|            
    69|            const updates = {
    70|                full_name: editName?.value || user.nome,
    71|                color_hex: finalColor.toUpperCase()
    72|            };
    73|
    74|            try {
    75|                // Atualiza no Supabase usando o ID (UUID) do usuário
    76|                const { error } = await supabaseClient
    77|                    .from('profiles')
    78|                    .update(updates)
    79|                    .eq('id', user.id);
    80|
    81|                if (error) throw error;
    82|
    83|                // Atualiza o localStorage para refletir a mudança instantaneamente no Dashboard
    84|                const updatedUser = { ...user, ...updates };
    85|                localStorage.setItem('gremio_usuario_atual', JSON.stringify(updatedUser));
    86|                
    87|                alert('Perfil atualizado com sucesso!');
    88|            } catch (err) {
    89|                console.error('Erro ao atualizar perfil:', err);
    90|                alert('Erro ao atualizar perfil: ' + err.message);
    91|            } finally {
    92|                btn.disabled = false;
    93|                btn.textContent = 'Salvar Alterações';
    94|            }
    95|        };
    96|    }
    97|}
    98|
    99|// Inicia o processo
   100|initProfile();
   101|