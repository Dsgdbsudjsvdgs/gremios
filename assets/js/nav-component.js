// ============================================================================
// 🚀 NAV COMPONENT — Sistema de navegação reutilizável do Grêmio
// Elimina a duplicação de HTML em todas as páginas internas
// ============================================================================

const NavComponent = {
  links: [
    { href: 'dashboard.html', icon: 'fa-solid fa-house', label: 'Dashboard' },
 { href: 'mapa_membros.html', icon: 'fa-solid fa-users', label: 'Membros' },
 { href: 'calendario.html', icon: 'fa-solid fa-calendar-days', label: 'Calendário' },
 { href: 'diario.html', icon: 'fa-solid fa-book', label: 'Diário' },
 { href: 'tasks.html', icon: 'fa-solid fa-list-check', label: 'Tarefas' },
 { href: 'perfil.html', icon: 'fa-solid fa-user', label: 'Perfil' },
 { href: 'sobre.html', icon: 'fa-solid fa-circle-info', label: 'Sobre' },
  ],

  // Detecta a página atual pelo filename
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
  },

  // Renderiza a side-nav + mobile trigger
  render() {
    const current = this.getCurrentPage();

    // Detecta se tá em /pages/ ou na raiz
    const inPages = window.location.pathname.includes('/pages/');
    const prefix = inPages ? '' : 'pages/';
    const logoutHref = inPages ? '../index.html' : 'index.html';

    // Mobile trigger (hamburger)
    const trigger = document.createElement('div');
    trigger.className = 'mobile-nav-trigger';
    trigger.innerHTML = `<i class="fa-solid fa-bars"></i>`;

    // Side nav
    const nav = document.createElement('nav');
    nav.className = 'side-nav';
    nav.innerHTML = `
      <div class="nav-header">
        <div class="nav-logo">
          <img src="${inPages ? '../' : ''}assets/img/logo-da-escola/mais_gremios_sem_fundo.svg" alt="Grêmio">
        </div>
        <span class="nav-brand">Conecta Jovem</span>
      </div>
      <ul class="nav-links">
        ${this.links.map(link => {
          const pageName = link.href.replace('.html', '');
          const isActive = pageName === current ? ' active' : '';
          return `<li class="nav-item">
            <a href="${prefix}${link.href}" class="nav-link${isActive}">
              <i class="${link.icon}"></i>
              <span>${link.label}</span>
            </a>
          </li>`;
        }).join('')}
 <li class="nav-item nav-item-logout">
 <a href="#" class="nav-link nav-logout" onclick="handleLogout(event)">
 <i class="fa-solid fa-right-from-bracket"></i>
 <span>Sair</span>
 </a>
 </li>
      </ul>
    `;

    // Insert no começo do body
    document.body.prepend(nav);
    document.body.prepend(trigger);

    // Setup interações
    this.setupInteractions(trigger, nav);
  },

  setupInteractions(trigger, nav) {
    // Toggle menu mobile
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('open');
      trigger.classList.toggle('active');
    });

    // Fecha ao clicar num link (mobile)
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          nav.classList.remove('open');
          trigger.classList.remove('active');
        }
      });
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !trigger.contains(e.target)) {
        nav.classList.remove('open');
        trigger.classList.remove('active');
      }
    });

    // Swipe pra fechar
    let touchStartX = 0;
    nav.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });
    nav.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (diff > 50) {
        nav.classList.remove('open');
        trigger.classList.remove('active');
      }
    });
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => NavComponent.render());
