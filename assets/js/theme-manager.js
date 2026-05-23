// assets/js/theme-manager.js
// Gerenciador de Tema — Dark default, light toggle (exceto login)

const ThemeManager = {
  init() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.body.classList.add('light');
    }
    // Login page nunca tem toggle
    if (!document.body.classList.contains('login-page')) {
      this.createToggleButton();
    }
  },

  toggle() {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  },

  createToggleButton() {
    // Não duplica se já existe
    if (document.querySelector('.btn-theme-toggle')) return;

    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fa-solid fa-circle-half-stroke"></i>';
    btn.className = 'btn-theme-toggle';
    btn.setAttribute('aria-label', 'Alternar tema');
    btn.onclick = () => this.toggle();
    document.body.appendChild(btn);
  }
};

document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
