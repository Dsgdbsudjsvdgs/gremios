// Configurações do Supabase
const SUPABASE_URL = 'https://wearihgeytywbhhtvwlg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYXJpaGdleXR5d2JoaHR2d2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDgsImV4cCI6MjA5MjM5MDY0OH0.5pz5JCKUEC5y7GuKt4OnSNW-VF_hrYUB4teoucHBNqY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function initDashboard() {
    const user = JSON.parse(localStorage.getItem('gremio_user'));
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    // UI Setup
    document.getElementById('user-name').textContent = user.full_name;
    const badge = document.getElementById('user-role-badge');
    badge.textContent = user.role;
    badge.style.backgroundColor = user.color_hex || '#ddd';
    badge.style.color = (user.color_hex === '#FFFFFF' || user.color_hex === '#FFFF00') ? '#000' : '#fff';

    // Mostrar financeiro se for Tesoureira ou Presidência
    if (user.role === 'Tesoureira' || user.role === 'Presidente' || user.role === 'Vice-Presidente') {
        document.getElementById('card-financeiro').style.display = 'block';
        loadFinanceTotal();
    }

    loadTasks();
    setupDeptFilter();
    
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('pt-BR');
}

async function loadTasks(deptFilter = 'all') {
    const container = document.getElementById('tasks-list');
    container.innerHTML = '<<pp>Carregando tarefas...</p>';

    let query = supabase.from('tasks').select('*');
    if (deptFilter !== 'all') {
        query = query.eq('department', deptFilter);
    }

    const { data, error } = await query;

    if (error) {
        container.innerHTML = `<<pp class="error">Erro ao carregar tarefas: ${error.message}</p>`;
        return;
    }

    if (data.length === 0) {
        container.innerHTML = '<<pp>Nenhuma tarefa encontrada.</p>';
        return;
    }

    container.innerHTML = data.map(task => `
        <<divdiv class="task-card" style="border-left: 5px solid ${getDeptColor(task.department)}">
            <<divdiv class="task-info">
                <strong>${task.title}</strong>
                <span>${task.department}</span>
            </div>
            <<divdiv class="task-status ${task.status}">${task.status}</div>
        </div>
    `).join('');
    
    document.getElementById('count-tasks').textContent = data.length;
}

async function loadFinanceTotal() {
    const { data, error } = await supabase.from('finances').select('amount, type');
    if (error) return;

    const total = data.reduce((acc, curr) => {
        return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);

    document.getElementById('finance-total').textContent = `R$ ${total.toFixed(2)}`;
}

function setupDeptFilter() {
    const filter = document.getElementById('filter-dept');
    const depts = ['Cultura', 'Esportes', 'Eventos', 'Comunicação', 'Resp. Social', 'Meio Ambiente', 'Protagonismo', 'Tecnologia e Inovação', 'Ouvidoria'];
    
    depts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        filter.appendChild(opt);
    });

    filter.onchange = (e) => loadTasks(e.target.value);
}

function getDeptColor(dept) {
    const colors = {
        'Cultura': '#A52A2A',
        'Esportes': '#ccc',
        'Eventos': '#FFC0CB',
        'Comunicação': '#FF0000',
        'Resp. Social': '#00FFFF',
        'Meio Ambiente': '#ccc',
        'Protagonismo': '#800080',
        'Tecnologia e Inovação': '#FFD700',
        'Ouvidoria': '#FFFF00'
    };
    return colors[dept] || '#ddd';
}

document.getElementById('btn-logout').onclick = () => {
    localStorage.removeItem('gremio_user');
    window.location.href = '../index.html';
};

initDashboard();
