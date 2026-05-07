// Dark Mode Manager - Detecção automática de preferência do sistema
class DarkModeManager {
    constructor() {
        this.isDark = this.getPreference();
        this.init();
    }

    init() {
        // Aplicar tema inicial
        this.applyTheme(this.isDark);
        
        // Ouvir mudanças de preferência do sistema
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                this.isDark = e.matches;
                this.applyTheme(this.isDark);
                localStorage.setItem('gremio_dark_mode', this.isDark);
            });
        }
        
        // Criar botão de toggle
        this.createToggleButton();
    }

    getPreference() {
        // 1. Verificar localStorage
        const saved = localStorage.getItem('gremio_dark_mode');
        if (saved !== null) return saved === 'true';
        
        // 2. Verificar preferência do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }
        
        // 3. Padrão: light
        return false;
    }

    applyTheme(isDark) {
        const html = document.documentElement;
        if (isDark) {
            html.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
        } else {
            html.setAttribute('data-theme', 'light');
            document.body.classList.remove('dark-mode');
        }
    }

    toggle() {
        this.isDark = !this.isDark;
        this.applyTheme(this.isDark);
        localStorage.setItem('gremio_dark_mode', this.isDark);
    }

    createToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'dark-mode-toggle';
        btn.className = 'dark-mode-toggle';
        btn.innerHTML = this.isDark ? '☀️' : '🌙';
        btn.setAttribute('aria-label', 'Alternar modo escuro');
        btn.onclick = () => {
            this.toggle();
            btn.innerHTML = this.isDark ? '☀️' : '🌙';
        };
        
        // Adicionar ao header
        const header = document.querySelector('header') || document.querySelector('.header');
        if (header) {
            header.appendChild(btn);
        }
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DarkModeManager();
    });
} else {
    new DarkModeManager();
}
