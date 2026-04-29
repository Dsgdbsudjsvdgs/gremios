// Agenda Logic - Grêmio Educa V2
document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('event-list');
    const modal = document.getElementById('modal-overlay');
    const openModalBtn = document.getElementById('open-modal');
    const closeBtn = document.getElementById('btn-close');
    const eventForm = document.getElementById('event-form');

    // Load Events from LocalStorage (Fallback to Mock)
    function loadEvents() {
        let events = JSON.parse(localStorage.getItem('gremio_events')) || [
            { title: 'Reunião Geral', date: '2026-05-15', cat: 'Executiva', desc: 'Alinhamento de metas' },
            { title: 'Interclasse Vôlei', date: '2026-05-22', cat: 'Esportes', desc: 'Início das eliminatórias' }
        ];
        
        eventList.innerHTML = '';
        
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        events.forEach(ev => {
            const dateObj = new Date(ev.date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

            const item = document.createElement('div');
            item.className = 'event-item';
            item.innerHTML = `
                <div class="event-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="event-info">
                    <h4>${ev.title}</h4>
                    <p>${ev.desc}</p>
                </div>
                <span class="event-category">${ev.cat}</span>
            `;
            eventList.appendChild(item);
        });
    }

    // Modal Controls
    openModalBtn.onclick = () => modal.style.display = 'flex';
    closeBtn.onclick = () => modal.style.display = 'none';

    // Save Event
    eventForm.onsubmit = (e) => {
        e.preventDefault();
        
        const newEvent = {
            title: document.getElementById('event-title').value,
            date: document.getElementById('event-date').value,
            cat: document.getElementById('event-cat').value,
            desc: document.getElementById('event-desc').value
        };

        let events = JSON.parse(localStorage.getItem('gremio_events')) || [];
        events.push(newEvent);
        localStorage.setItem('gremio_events', JSON.stringify(events));

        loadEvents();
        modal.style.display = 'none';
        eventForm.reset();
    };

    loadEvents();
});
