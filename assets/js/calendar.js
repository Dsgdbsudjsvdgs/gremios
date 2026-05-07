// ============================================================================
// 📅 CALENDÁRIO - Grêmio Estudantil v3 (Corrigido)
// ============================================================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let eventsMap = {};

document.addEventListener('DOMContentLoaded', async () => {
    CONFIG.initSupabase();
    await initCalendar();
});

async function initCalendar() {
    if (!UTILS.requireAuth()) return;

    try {
        await loadEvents();
        renderCalendar();
        setupEventListeners();
    } catch (error) {
        console.error('❌ Calendar init error:', error);
        UTILS.showError('Erro ao carregar calendário');
    }
}

async function loadEvents() {
    try {
        const events = await UTILS.supabaseQuery('events');
        eventsMap = {};
        
        if (events) {
            events.forEach(event => {
                const date = event.date.split('T')[0];
                if (!eventsMap[date]) eventsMap[date] = [];
                eventsMap[date].push(event);
            });
        }
    } catch (error) {
        console.error('❌ Error loading events:', error);
    }
}

function renderCalendar() {
    const monthName = UTILS.getMonthName(currentMonth);
    const monthElement = document.getElementById('current-month');
    if (monthElement) {
        monthElement.textContent = `${monthName} ${currentYear}`;
    }

    const daysContainer = document.getElementById('calendar-days');
    if (!daysContainer) return;

    daysContainer.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true);
        daysContainer.appendChild(dayElement);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayElement = createDayElement(day, false, dateStr);
        
        // Mark today
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        // Mark days with events
        if (eventsMap[dateStr]) {
            dayElement.classList.add('has-events');
        }
        
        dayElement.addEventListener('click', () => showDayEvents(dateStr));
        daysContainer.appendChild(dayElement);
    }

    // Next month days
    const totalCells = daysContainer.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true);
        daysContainer.appendChild(dayElement);
    }
}

function createDayElement(day, isOtherMonth = false, dateStr = '') {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    if (isOtherMonth) div.classList.add('other-month');
    div.textContent = day;
    return div;
}

function showDayEvents(dateStr) {
    const events = eventsMap[dateStr] || [];
    const eventsContainer = document.getElementById('day-events');
    
    if (!eventsContainer) return;

    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="empty-state">Nenhum evento neste dia</p>';
        return;
    }

    eventsContainer.innerHTML = events.map(event => `
        <div class="event-item">
            <h4>${event.name}</h4>
            <p>${event.description || ''}</p>
            <small>📍 ${event.location || 'Local não informado'}</small>
        </div>
    `).join('');
}

function setupEventListeners() {
    const prevBtn = document.getElementById('btn-prev-month');
    const nextBtn = document.getElementById('btn-next-month');
    const addEventBtn = document.getElementById('btn-add-event');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }

    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            const modal = document.getElementById('event-modal');
            if (modal) modal.style.display = 'flex';
        });
    }

    const eventForm = document.getElementById('event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddEvent(e.target);
        });
    }

    const closeModalBtn = document.getElementById('btn-close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('event-modal');
            if (modal) modal.style.display = 'none';
        });
    }
}

async function handleAddEvent(form) {
    try {
        const eventData = {
            name: form.querySelector('[name="event-title"]')?.value,
            date: form.querySelector('[name="event-date"]')?.value,
            location: form.querySelector('[name="event-location"]')?.value,
            description: form.querySelector('[name="event-desc"]')?.value,
            created_by: UTILS.getStorageUser().id
        };

        if (!eventData.name || !eventData.date) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        await UTILS.supabaseInsert('events', eventData);
        UTILS.showSuccess('Evento adicionado com sucesso!');
        
        form.reset();
        const modal = document.getElementById('event-modal');
        if (modal) modal.style.display = 'none';
        
        await loadEvents();
        renderCalendar();

    } catch (error) {
        console.error('❌ Error adding event:', error);
        UTILS.showError(error.message);
    }
}

console.log('✅ Calendar module loaded');
