// Notification System - Lembretes e alertas
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.loadNotifications();
        this.startCheckingReminders();
    }

    // Adicionar notificação
    add(title, message, type = 'info', duration = 5000) {
        const id = Date.now();
        const notification = {
            id,
            title,
            message,
            type, // 'info', 'success', 'warning', 'error'
            timestamp: new Date(),
            read: false
        };
        
        this.notifications.push(notification);
        localStorage.setItem('gremio_notifications', JSON.stringify(this.notifications));
        
        // Mostrar na tela
        this.show(notification, duration);
        
        return id;
    }

    // Mostrar notificação na tela
    show(notification, duration = 5000) {
        const container = document.getElementById('notification-container') || this.createContainer();
        
        const el = document.createElement('div');
        el.className = `notification notification-${notification.type}`;
        el.innerHTML = `
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
        `;
        
        container.appendChild(el);
        
        // Auto-remover após duration
        if (duration > 0) {
            setTimeout(() => el.remove(), duration);
        }
    }

    // Criar container de notificações
    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    // Carregar notificações do localStorage
    loadNotifications() {
        const saved = localStorage.getItem('gremio_notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
    }

    // Iniciar verificação de lembretes
    startCheckingReminders() {
        // Verificar a cada 1 minuto
        setInterval(() => {
            this.checkTaskReminders();
            this.checkEventReminders();
            this.checkBirthdayReminders();
        }, 60000);
    }

    // Verificar lembretes de tarefas
    checkTaskReminders() {
        const tasks = JSON.parse(localStorage.getItem('gremio_tasks') || '[]');
        const now = new Date();
        
        tasks.forEach(task => {
            if (task.status !== 'concluído' && task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
                
                // Lembrete 24 horas antes
                if (hoursUntilDue > 0 && hoursUntilDue <= 24 && !task.reminderSent24h) {
                    this.add(
                        '⏰ Tarefa Próxima',
                        `"${task.title}" vence em menos de 24 horas`,
                        'warning'
                    );
                    task.reminderSent24h = true;
                }
                
                // Lembrete 1 hora antes
                if (hoursUntilDue > 0 && hoursUntilDue <= 1 && !task.reminderSent1h) {
                    this.add(
                        '🔔 Tarefa Vencendo',
                        `"${task.title}" vence em menos de 1 hora!`,
                        'error'
                    );
                    task.reminderSent1h = true;
                }
            }
        });
        
        localStorage.setItem('gremio_tasks', JSON.stringify(tasks));
    }

    // Verificar lembretes de eventos
    checkEventReminders() {
        const events = JSON.parse(localStorage.getItem('gremio_events') || '[]');
        const now = new Date();
        
        events.forEach(event => {
            if (event.date) {
                const eventDate = new Date(event.date);
                const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
                
                // Lembrete 24 horas antes
                if (hoursUntilEvent > 0 && hoursUntilEvent <= 24 && !event.reminderSent24h) {
                    this.add(
                        '📅 Evento Próximo',
                        `"${event.title}" acontece em menos de 24 horas`,
                        'info'
                    );
                    event.reminderSent24h = true;
                }
            }
        });
        
        localStorage.setItem('gremio_events', JSON.stringify(events));
    }

    // Verificar aniversários
    checkBirthdayReminders() {
        const members = JSON.parse(localStorage.getItem('gremio_members') || '[]');
        const today = new Date();
        
        members.forEach(member => {
            if (member.birthDate) {
                const birthDate = new Date(member.birthDate);
                if (birthDate.getMonth() === today.getMonth() && 
                    birthDate.getDate() === today.getDate()) {
                    this.add(
                        '🎂 Aniversário',
                        `Hoje é aniversário de ${member.name}!`,
                        'success'
                    );
                }
            }
        });
    }

    // Limpar notificações antigas
    clearOld(daysOld = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysOld);
        
        this.notifications = this.notifications.filter(n => 
            new Date(n.timestamp) > cutoff
        );
        
        localStorage.setItem('gremio_notifications', JSON.stringify(this.notifications));
    }
}

// Inicializar sistema de notificações
const notificationSystem = new NotificationSystem();
