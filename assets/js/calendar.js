// Configurações do Supabase
const SUPABASE_URL = 'https://wearihgeytywbhhtvwlg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYXrgbaGdleXR5d2JoaHR2d2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDgsImV4cCI6MjA5MjM5MDY0OH0.5pz5JCKUEC5y7GuKt4OnSNW-VF_hrYUB4teoucHBNqY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

async function initCalendar() {
    const user = JSON.parse(localStorage.getItem('gremio_user'));
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    renderCalendar();

    document.getElementById('btn-add-event').onclick = () => {
        document.getElementById('event-modal').style.display = 'flex';
    };

    document.getElementById('btn-close-modal').onclick = () => {
        document.getElementById('event-modal').style.display = 'none';
    };

    document.getElementById('event-form').onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;

        const eventData = {
            title: document.getElementById('event-title').value,
            date: document.getElementById('event-date').value,
            description: document.getElementById('event-desc').value,
            created_by: user.id
        };

        const { error } = await supabaseClient
            .from('events')
            .insert([eventData]);

        if (error) {
            alert('Erro ao salvar evento: ' + error.message);
        } else {
            alert('Evento agendado!');
            document.getElementById('event-modal').style.display = 'none';
            e.target.reset();
            renderCalendar();
        }
        btn.disabled = false;
    };
}

async function renderCalendar() {
    const daysContainer = document.getElementById('calendar-days');
    const monthDisplay = document.getElementById('month-display');
    
    const now = new Date(currentYear, currentMonth, 1);
    const monthName = now.toLocaleString('pt-BR', { month: 'long' });
    monthDisplay.textContent = `${monthName} ${currentYear}`;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    daysContainer.innerHTML = '';

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;
        
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        dayDiv.onclick = () => showEventsForDay(dateStr);
        daysContainer.appendChild(dayDiv);
    }
}

async function showEventsForDay(date) {
    const section = document.getElementById('events-section');
    const list = document.getElementById('events-list');
    const title = document.getElementById('selected-date-title');

    section.style.display = 'block';
    title.textContent = `Eventos de ${date.split('-').reverse().join('/')}`;
    list.innerHTML = 'Carregando...';

    const { data, error } = await supabaseClient
        .from('events')
        .select('*')
        .eq('date', date);

    if (error) {
        list.innerHTML = 'Erro ao carregar eventos.';
        return;
    }

    if (data.length === 0) {
        list.innerHTML = '<<pp style="color: var(--text-dim);">Nenhum evento para este dia.</p>';
    } else {
        list.innerHTML = data.map(ev => `
            <<divdiv class="event-card fade-in">
                <strong>${ev.title}</strong>
                <<pp style="font-size: 0.9rem; color: var(--text-dim); margin-top: 5px;">${ev.description}</p>
            </div>
        `).join('');
    }
    section.scrollIntoView({ behavior: 'smooth' });
}

initCalendar();
