// Configurações do Supabase
const SUPABASE_URL = 'https://wearihgeytywbhhtvwlg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYXrgbaHdleXR5d2JoaHR2d2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDgsImV4cCI6MjA5MjM5MDY0OH0.5pz5JCKUEC5y7GuKt4OnSNW-VF_hrYUB4teoucHBNqY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function initDashboard() {
    const user = JSON.parse(localStorage.getItem('gremio_user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    // UI Setup
    document.getElementById('user-name').textContent = user.full_name;
    const badge = document.getElementById('user-role-badge');
    badge.textContent = user.role;
    badge.style.backgroundColor = user.color_hex || '#ddd';
    badge.style.color = (user.color_hex === '#FFFFFF' || user.color_hex === '#FFFF00') ? '#000' : '#fff';

    // Conectar Cargo ao link da Diretoria
    const roleLink = document.getElementById('user-role-link');
    if (roleLink) {
        roleLink.href = `/pages/diretoria.html?id=${user.id}`;
    }

    // Mostrar Financeiro e Admin baseado no Cargo
    const allowedFinance = ['Tesoureira', 'Presidente', 'Vice-Presidente'];
    if (allowedFinance.includes(user.role)) {
        document.getElementById('card-financeiro').style.display = 'block';
        loadFinanceTotal();
    }

    const allowedAdmin = ['Presidente', 'Tecnologia e Inovação'];
    if (allowedAdmin.includes(user.role)) {
        document.getElementById('card-admin').style.display = 'block';
    }

    loadTasks();
    setupDeptFilter();

    document.getElementById('btn-logout').onclick = () => {
        localStorage.removeItem('gremio_user');
        window.location.href = '/index.html';
    };
}

async function loadTasks(deptFilter = 'all') {
    const container = document.getElementById('tasks-list');
    container.innerHTML = '<<pp style="text-align:center; grid-column: 1/-1; color: var(--text-dim);">Carregando tarefas...</p>';

    let query = supabaseClient.from('tasks').select('*');
    if (deptFilter !== 'all') {
        query = query.eq('department', deptFilter);
    }

    const { data, error } = await query;

    if (error) {
        container.innerHTML = `<<pp class="error" style="text-align:center; grid-column: 1/-1; color: var(--error-color);">Erro ao carregar tarefas: ${error.message}</p>`;
        return;
    }

    if (data.length === 0) {
        container.innerHTML = '<<pp style="text-align:center; grid-column: 1/-1; color: var(--text-dim);">Nenhuma tarefa encontrada.</p>';
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
    
    const countTasks = document.getElementById('count-tasks');
    if (countTasks) countTasks.textContent = data.length;
}

async function loadFinanceTotal() {
    const { data, error } = await supabaseClient.from('finances').select('amount, type');
    if (error) return;

    const total = data.reduce((acc, curr) => {
        return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);

    const financeTotal = document.getElementById('finance-total');
    if (financeTotal) financeTotal.textContent = `R$ ${total.toFixed(2)}`;
}

function setupDeptFilter() {
    const filter = document.getElementById('filter-dept');
    if (!filter) return;
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
        'Cultura': '#A569BD',
        'Esportes': '#5499C7',
        'Eventos': '#F5B7B1',
        'Comunicação': '#F8C471',
        'Resp. Social': '#82E0AA',
        'Meio Ambiente': '#ABEBC6',
        'Protagonismo': '#AED6F1',
        'Tecnologia e Inovação': '#D5A6BD',
        'Ouvidoria': '#D7BDE2'
    };
    return colors[dept] || '#ddd';
}

initDashboard();
