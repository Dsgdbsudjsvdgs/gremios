// Configurações do Supabase
const SUPABASE_URL = 'https://wearihgeytywbhhtvwlg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYXJpaGdleXR5d2JoaHR2d2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDgsImV4cCI6MjA5MjM5MDY0OH0.5pz5JCKUEC5y7GuKt4OnSNW-VF_hrYUB4teoucHBNqY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function initProfile() {
    const user = JSON.parse(localStorage.getItem('gremio_user'));
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    // Preencher dados iniciais
    document.getElementById('profile-name').textContent = user.full_name || 'Usuário';
    document.getElementById('profile-role').textContent = user.role || 'Membro';
    document.getElementById('edit-name').value = user.full_name || '';
    document.getElementById('edit-color').value = user.color_hex || '#0062ff';
    document.getElementById('edit-color-hex').value = user.color_hex || '#0062ff';
    
    // Atualizar cor do badge visualmente
    document.getElementById('profile-role').style.backgroundColor = user.color_hex || '#0062ff';

    // Sincronizar seletor de cor com campo de texto
    const colorInput = document.getElementById('edit-color');
    const colorText = document.getElementById('edit-color-hex');

    colorInput.oninput = () => { colorText.value = colorInput.value.toUpperCase(); };
    colorText.oninput = () => { colorInput.value = colorText.value; };

    // Formulário de salvamento
    document.getElementById('profile-form').onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        const updates = {
            full_name: document.getElementById('edit-name').value,
            color_hex: document.getElementById('edit-color-hex').value.toUpperCase()
        };

        const { error } = await supabaseClient
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            alert('Erro ao atualizar perfil: ' + error.message);
        } else {
            // Atualizar localStorage para refletir a mudança imediatamente
            const updatedUser = { ...user, ...updates };
            localStorage.setItem('gremio_user', JSON.stringify(updatedUser));
            alert('Perfil atualizado com sucesso!');
        }

        btn.disabled = false;
        btn.textContent = 'Salvar Alterações';
    };
}

initProfile();
