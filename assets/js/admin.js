// Configurações do Supabase
const SUPABASE_URL = 'https://wearihgeytywbhhtvwlg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYXrgbaGdleXR5d2JoaHR2d2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDgsImV4cCI6MjA5MjM5MDY0OH0.5pz5JCKUEC5y7GuKt4OnSNW-VF_hrYUB4teoucHBNqY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function initAdmin() {
    const user = JSON.parse(localStorage.getItem('gremio_user'));
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    // Segurança: Apenas Presidente ou Tecnologia podem acessar
    const allowedRoles = ['Presidente', 'Tecnologia e Inovação'];
    if (!allowedRoles.includes(user.role)) {
        alert('Acesso negado. Você não tem permissão de administrador.');
        window.location.href = 'dashboard.html';
        return;
    }

    loadMembers();

    // Formulário de Cadastro
    document.getElementById('add-member-form').onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Cadastrando...';

        const memberData = {
            full_name: document.getElementById('new-name').value,
            cpf: document.getElementById('new-cpf').value,
            birth_date: document.getElementById('new-birth').value,
            role: document.getElementById('new-role').value,
            color_hex: '#ffffff' // Valor default, o usuário altera no perfil dele
        };

        const { error } = await supabaseClient
            .from('profiles')
            .insert([memberData]);

        if (error) {
            alert('Erro ao cadastrar: ' + error.message);
        } else {
            alert('Membro cadastrado com sucesso!');
            e.target.reset();
            loadMembers();
        }

        btn.disabled = false;
        btn.textContent = 'Cadastrar Membro';
    };
}

async function loadMembers() {
    const container = document.getElementById('members-list');
    container.innerHTML = '<<pp style="text-align:center; grid-column: 1/-1;">Carregando membros...</p>';

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

    if (error) {
        container.innerHTML = `<<pp class="error">Erro ao carregar: ${error.message}</p>`;
        return;
    }

    container.innerHTML = data.map(m => `
        <<divdiv class="card fade-in" style="text-align: left; border-left: 5px solid ${m.color_hex || '#ddd'}">
            <strong>${m.full_name}</strong>
            <<divdiv style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 10px;">
                ${m.role} | CPF: ${m.cpf}
            </div>
            <<buttonbutton onclick="deleteMember('${m.id}')" class="btn-card" style="color: var(--error-color); border-color: var(--error-color);">Excluir</button>
        </div>
    `).join('');
}

async function deleteMember(id) {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    const { error } = await supabaseClient
        .from('profiles')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Erro ao excluir: ' + error.message);
    } else {
        loadMembers();
    }
}

// Globalizar a função de deletar para o HTML conseguir chamar
window.deleteMember = deleteMember;

initAdmin();
