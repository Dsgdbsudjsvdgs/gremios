// ============================================================================
// 📅 CALENDÁRIO - Grêmio Estudantil v4 (Completo)
// Visualizações: Mês, Semana, Lista | CRUD completo | Recorrência | Categorias
// ============================================================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentWeekStart = new Date(); // Monday of current week
let currentView = 'month'; // 'month', 'week', 'list'
let eventsMap = {}; // by date string
let allEvents = []; // flat array
let selectedDateStr = '';
let editingEventId = null;

const CATEGORY_CONFIG = {
  reuniao: { label: 'Reunião', color: '#4ECDC4', icon: 'fa-solid fa-users' },
  evento: { label: 'Evento', color: '#F7DC6F', icon: 'fa-solid fa-calendar-star' },
  prazo: { label: 'Prazo', color: '#FF6B6B', icon: 'fa-solid fa-hourglass-half' },
  outro: { label: 'Outro', color: '#00E5FF', icon: 'fa-solid fa-ellipsis-h' }
};

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
        updateStats();
    } catch (error) {
        console.error('❌ Calendar init error:', error);
        UTILS.showError('Erro ao carregar calendário');
    }
}

async function loadEvents() {
    try {
        const events = await UTILS.supabaseQuery('events');
        allEvents = events || [];
        eventsMap = {};

        if (allEvents.length) {
            allEvents.forEach(event => {
                const date = event.date ? event.date.split('T')[0] : null;
                if (date) {
                    if (!eventsMap[date]) eventsMap[date] = [];
                    eventsMap[date].push(event);
                }
            });
        }
    } catch (error) {
        console.error('❌ Error loading events:', error);
        allEvents = [];
        eventsMap = {};
    }
}

function renderCalendar() {
    // Update month/week header
    updateHeader();

    // Render based on current view
    switch (currentView) {
        case 'month':
            renderMonthView();
            break;
        case 'week':
            renderWeekView();
            break;
        case 'list':
            renderListView();
            break;
    }

    // Update stats
    updateStats();

    // Show/hide view containers
    document.getElementById('calendar-month-view').style.display = currentView === 'month' ? 'block' : 'none';
    document.getElementById('calendar-week-view').style.display = currentView === 'week' ? 'block' : 'none';
    document.getElementById('calendar-list-view').style.display = currentView === 'list' ? 'block' : 'none';

    // Update active button
    document.getElementById('view-month').classList.toggle('active', currentView === 'month');
    document.getElementById('view-week').classList.toggle('active', currentView === 'week');
    document.getElementById('view-list').classList.toggle('active', currentView === 'list');
}

function updateHeader() {
    const monthElement = document.getElementById('current-month');
    if (!monthElement) return;

    if (currentView === 'month') {
        const monthName = UTILS.getMonthName(currentMonth);
        monthElement.textContent = `${monthName} ${currentYear}`;
    } else if (currentView === 'week') {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        monthElement.textContent = `${UTILS.formatDate(currentWeekStart)} - ${UTILS.formatDate(weekEnd)}`;
    } else {
        monthElement.textContent = 'Lista de Eventos';
    }
}

function renderMonthView() {
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
            addEventDots(dayElement, eventsMap[dateStr]);
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

function addEventDots(dayElement, events) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'event-dots';
    events.slice(0, 4).forEach(event => {
        const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.outro;
        const dot = document.createElement('span');
        dot.className = 'event-dot';
        dot.style.background = cat.color;
        dot.title = `${cat.label}: ${event.name}`;
        dotsContainer.appendChild(dot);
    });
    if (events.length > 4) {
        const more = document.createElement('span');
        more.className = 'event-dot';
        more.style.background = 'var(--text-muted)';
        more.textContent = `+${events.length - 4}`;
        more.style.fontSize = '6px';
        more.style.lineHeight = '8px';
        dotsContainer.appendChild(more);
    }
    dayElement.appendChild(dotsContainer);
}

function renderWeekView() {
    // Calculate week start (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday
    currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() + diff);

    const weekHeader = document.getElementById('week-header');
    const weekDays = document.getElementById('week-days');
    if (!weekHeader || !weekDays) return;

    weekHeader.innerHTML = '';
    weekDays.innerHTML = '';

    const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = date.toDateString() === today.toDateString();

        // Header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'calendar-weekday';
        headerDiv.textContent = `${weekdays[i]} ${date.getDate()}/${date.getMonth() + 1}`;
        if (isToday) headerDiv.style.color = 'var(--primary)';
        weekHeader.appendChild(headerDiv);

        // Day column
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.style.minHeight = '400px';
        dayDiv.style.padding = '8px';
        dayDiv.style.display = 'flex';
        dayDiv.style.flexDirection = 'column';
        dayDiv.style.gap = '4px';
        if (isToday) dayDiv.classList.add('today');

        // Day number
        const dayNum = document.createElement('div');
        dayNum.style.fontWeight = '700';
        dayNum.style.fontSize = '1.1rem';
        dayNum.style.color = isToday ? 'var(--primary)' : 'var(--text-main)';
        dayNum.textContent = date.getDate();
        dayDiv.appendChild(dayNum);

        // Events for this day
        const events = eventsMap[dateStr] || [];
        if (events.length) {
            dayDiv.classList.add('has-events');
            events.slice(0, 6).forEach(event => {
                const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.outro;
                const evDiv = document.createElement('div');
                evDiv.className = 'event-item';
                evDiv.style.fontSize = '0.75rem';
                evDiv.style.padding = '6px 8px';
                evDiv.style.marginBottom = '4px';
                evDiv.style.borderLeft = `3px solid ${cat.color}`;
                evDiv.innerHTML = `
                    <div class="event-title">${event.name}</div>
                    ${event.time_start ? `<div class="event-time">${event.time_start}${event.time_end ? ' - ' + event.time_end : ''}</div>` : ''}
                    ${event.location ? `<div class="event-location">📍 ${event.location}</div>` : ''}
                `;
                evDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditEventModal(event);
                });
                dayDiv.appendChild(evDiv);
            });
            if (events.length > 6) {
                const moreDiv = document.createElement('div');
                moreDiv.style.fontSize = '0.7rem';
                moreDiv.style.color = 'var(--text-muted)';
                moreDiv.style.textAlign = 'center';
                moreDiv.style.marginTop = '4px';
                moreDiv.textContent = `+${events.length - 6} mais...`;
                moreDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showDayEvents(dateStr);
                });
                dayDiv.appendChild(moreDiv);
            }
        }

        dayDiv.addEventListener('click', () => showDayEvents(dateStr));
        weekDays.appendChild(dayDiv);
    }
}

function renderListView() {
    const container = document.getElementById('events-list');
    if (!container) return;

    const search = document.getElementById('search-events')?.value.toLowerCase() || '';
    const filterCat = document.getElementById('filter-category')?.value || '';

    let filtered = allEvents.filter(event => {
        const matchesSearch = !search || event.name.toLowerCase().includes(search) || (event.description || '').toLowerCase().includes(search);
        const matchesCat = !filterCat || event.category === filterCat;
        return matchesSearch && matchesCat;
    });

    // Sort by date
    filtered.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum evento encontrado</p>';
        return;
    }

    container.innerHTML = filtered.map(event => {
        const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.outro;
        const date = event.date ? event.date.split('T')[0] : '';
        return `
            <div class="event-item" data-id="${event.id}">
                <div class="event-header">
                    <div>
                        <span class="event-category" style="background:${cat.color}20;color:${cat.color};border:1px solid ${cat.color}40;">${cat.icon} ${cat.label}</span>
                        <span class="event-title">${event.name}</span>
                    </div>
                    <span class="event-time">${UTILS.formatDate(date)}${event.time_start ? ' ' + event.time_start : ''}</span>
                </div>
                ${event.location ? `<div class="event-location"><i class="fa-solid fa-location-dot"></i> ${event.location}</div>` : ''}
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                <div class="event-actions">
                    <button class="btn-edit" onclick="openEditEventModal(${JSON.stringify(event).replace(/"/g, '"')})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-delete" onclick="deleteEvent('${event.id}')"><i class="fa-solid fa-trash"></i> Excluir</button>
                </div>
            </div>
        `;
    }).join('');
}

function showDayEvents(dateStr) {
    selectedDateStr = dateStr;
    const events = eventsMap[dateStr] || [];
    const eventsContainer = document.getElementById('day-events');
    const label = document.getElementById('selected-date-label');

    if (label) label.textContent = `(${UTILS.formatDate(dateStr)})`;

    if (!eventsContainer) return;

    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="empty-state">Nenhum evento neste dia</p>';
        return;
    }

    eventsContainer.innerHTML = events.map(event => {
        const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.outro;
        return `
            <div class="event-item" data-id="${event.id}">
                <div class="event-header">
                    <div>
                        <span class="event-category" style="background:${cat.color}20;color:${cat.color};border:1px solid ${cat.color}40;">${cat.icon} ${cat.label}</span>
                        <span class="event-title">${event.name}</span>
                    </div>
                    <span class="event-time">${event.time_start || ''}${event.time_end ? ' - ' + event.time_end : ''}</span>
                </div>
                ${event.location ? `<div class="event-location"><i class="fa-solid fa-location-dot"></i> ${event.location}</div>` : ''}
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                ${event.recurring && event.recurring !== 'none' ? `<div class="event-category" style="background:#F7DC6F20;color:#F7DC6F;border:1px solid #F7DC6F40;font-size:0.65rem;"><i class="fa-solid fa-rotate"></i> ${event.recurring.charAt(0).toUpperCase() + event.recurring.slice(1)}</div>` : ''}
                <div class="event-actions">
                    <button class="btn-edit" onclick="openEditEventModal(${JSON.stringify(event).replace(/"/g, '"')})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-delete" onclick="deleteEvent('${event.id}')"><i class="fa-solid fa-trash"></i> Excluir</button>
                </div>
            </div>
        `;
    }).join('');
}

function openEditEventModal(event) {
    editingEventId = event.id;
    const modal = document.getElementById('event-modal');
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('btn-submit-event');
    const deleteBtn = document.getElementById('btn-delete-event');

    if (!modal) return;

    title.innerHTML = '<i class="fa-solid fa-calendar-pen"></i> Editar Evento';
    submitBtn.textContent = 'Salvar Alterações';
    deleteBtn.style.display = 'inline-flex';

    // Fill form
    document.getElementById('event-id').value = event.id;
    document.querySelector('[name="event-title"]').value = event.name || '';
    document.querySelector('[name="event-date"]').value = event.date ? event.date.split('T')[0] : '';
    document.querySelector('[name="event-category"]').value = event.category || 'outro';
    document.querySelector('[name="event-time-start"]').value = event.time_start || '';
    document.querySelector('[name="event-time-end"]').value = event.time_end || '';
    document.querySelector('[name="event-location"]').value = event.location || '';
    document.querySelector('[name="event-desc"]').value = event.description || '';
    document.querySelector(`[name="recurring"][value="${event.recurring || 'none'}"]`).checked = true;
    updateRecurringOptions(event.recurring || 'none');

    modal.classList.add('active');
}

function updateRecurringOptions(value) {
    document.querySelectorAll('.recurring-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === value);
        opt.querySelector('input').checked = opt.dataset.value === value;
    });
}

async function handleAddEvent(form) {
    try {
        const user = UTILS.getStorageUser();
        if (!user?.id) throw new Error('Sessão expirada. Faça login novamente.');

        const { data: profile, error: profileError } = await CONFIG.getSupabase()
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .limit(1);

        var createdBy = (profileError || !profile?.length) ? null : user.id;

        const eventData = {
            name: form.querySelector('[name="event-title"]')?.value,
            date: form.querySelector('[name="event-date"]')?.value,
            category: form.querySelector('[name="event-category"]')?.value || 'outro',
            time_start: form.querySelector('[name="event-time-start"]')?.value || null,
            time_end: form.querySelector('[name="event-time-end"]')?.value || null,
            location: form.querySelector('[name="event-location"]')?.value || null,
            description: form.querySelector('[name="event-desc"]')?.value || null,
            recurring: form.querySelector('[name="recurring"]:checked')?.value || 'none',
            created_by: createdBy
        };

        const eventId = form.querySelector('[name="event-id"]')?.value;

        if (!eventData.name || !eventData.date) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        if (eventId && editingEventId) {
            // Update
            await UTILS.supabaseUpdate('events', eventId, eventData);
            UTILS.showSuccess('Evento atualizado com sucesso!');
        } else {
            // Create
            await UTILS.supabaseInsert('events', eventData);
            UTILS.showSuccess('Evento criado com sucesso!');
        }

        form.reset();
        const modal = document.getElementById('event-modal');
        if (modal) modal.classList.remove('active');
        editingEventId = null;

        await loadEvents();
        renderCalendar();

    } catch (error) {
        console.error('❌ Error saving event:', error);
        UTILS.showError(error.message);
    }
}

async function deleteEvent(id) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
        await UTILS.supabaseDelete('events', id);
        UTILS.showSuccess('Evento excluído!');
        await loadEvents();
        renderCalendar();
        if (selectedDateStr) showDayEvents(selectedDateStr);
    } catch (error) {
        console.error('❌ Error deleting event:', error);
        UTILS.showError('Erro ao excluir evento');
    }
}

function setupEventListeners() {
    const prevBtn = document.getElementById('btn-prev-month');
    const nextBtn = document.getElementById('btn-next-month');
    const addEventBtn = document.getElementById('btn-add-event');
    const viewMonthBtn = document.getElementById('view-month');
    const viewWeekBtn = document.getElementById('view-week');
    const viewListBtn = document.getElementById('view-list');
    const searchEvents = document.getElementById('search-events');
    const filterCategory = document.getElementById('filter-category');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentView === 'month') {
                currentMonth--;
                if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            } else if (currentView === 'week') {
                currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            }
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentView === 'month') {
                currentMonth++;
                if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            } else if (currentView === 'week') {
                currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            }
            renderCalendar();
        });
    }

    if (viewMonthBtn) {
        viewMonthBtn.addEventListener('click', () => {
            currentView = 'month';
            renderCalendar();
        });
    }
    if (viewWeekBtn) {
        viewWeekBtn.addEventListener('click', () => {
            currentView = 'week';
            renderCalendar();
        });
    }
    if (viewListBtn) {
        viewListBtn.addEventListener('click', () => {
            currentView = 'list';
            renderCalendar();
        });
    }

    if (searchEvents) {
        searchEvents.addEventListener('input', () => {
            if (currentView === 'list') renderListView();
        });
    }
    if (filterCategory) {
        filterCategory.addEventListener('change', () => {
            if (currentView === 'list') renderListView();
        });
    }

    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            editingEventId = null;
            const modal = document.getElementById('event-modal');
            const title = document.getElementById('modal-title');
            const submitBtn = document.getElementById('btn-submit-event');
            const deleteBtn = document.getElementById('btn-delete-event');

            title.innerHTML = '<i class="fa-solid fa-calendar-plus"></i> Novo Evento';
            submitBtn.textContent = 'Criar Evento';
            deleteBtn.style.display = 'none';

            // Pre-fill date if a day is selected
            if (selectedDateStr) {
                document.querySelector('[name="event-date"]').value = selectedDateStr;
            } else {
                const today = new Date().toISOString().split('T')[0];
                document.querySelector('[name="event-date"]').value = today;
            }

            document.getElementById('event-id').value = '';
            modal.classList.add('active');
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
            if (modal) modal.classList.remove('active');
            editingEventId = null;
        });
    }

    const deleteBtn = document.getElementById('btn-delete-event');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (editingEventId) {
                deleteEvent(editingEventId);
                const modal = document.getElementById('event-modal');
                if (modal) modal.classList.remove('active');
                editingEventId = null;
            }
        });
    }

    // Recurring option clicks
    document.querySelectorAll('.recurring-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const value = opt.dataset.value;
            opt.querySelector('input').checked = true;
            updateRecurringOptions(value);
        });
    });

    // Close modal on outside click
    const modal = document.getElementById('event-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                editingEventId = null;
            }
        });
    }
}

function updateStats() {
    const total = allEvents.length;
    const thisMonth = allEvents.filter(e => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const recurring = allEvents.filter(e => e.recurring && e.recurring !== 'none').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-this-month').textContent = thisMonth;
    document.getElementById('stat-recurring').textContent = recurring;
}

console.log('✅ Calendar module v4 loaded');