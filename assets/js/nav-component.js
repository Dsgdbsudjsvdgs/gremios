// ============================================================================
// 🚀 NAV COMPONENT — Sistema de navegação reutilizável do Grêmio
// Elimina a duplicação de HTML em todas as páginas internas
// v4.1: overlay mobile funcional, logout com fallback seguro,
//       atalho Admin visível p/ Pres/VP, badges de contexto
// ============================================================================

const NavComponent = {
  links: [
      { href: 'dashboard.html', icon: 'fa-solid fa-house', label: 'Dashboard' },
      { href: 'diretoria.html', icon: 'fa-solid fa-crown', label: 'Diretoria' },
      { href: 'calendario.html', icon: 'fa-solid fa-calendar-days', label: 'Calendário' },
      { href: 'diario.html', icon: 'fa-solid fa-book', label: 'Diário' },
      { href: 'tasks.html', icon: 'fa-solid fa-list-check', label: 'Tarefas' },
      { href: 'suporte.html', icon: 'fa-solid fa-headset', label: 'Suporte' },
      { href: 'perfil.html', icon: 'fa-solid fa-user', label: 'Perfil' },
      { href: 'admin.html', icon: 'fa-solid fa-shield-halved', label: 'Admin', adminOnly: true },
      { href: 'sobre.html', icon: 'fa-solid fa-circle-info', label: 'Sobre' },
      { href: 'instalar.html', icon: 'fa-solid fa-mobile-screen-button', label: 'Instalar App', browserOnly: true },
    ],

  // Detecta a página atual pelo filename
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
  },

  // v4.1: Pres/VP/Tech podem ver o Admin na nav
  isAdminUser() {
    try {
      const user = UTILS.getStorageUser();
      if (!user) return false;
      const adminRoles = ['Presidente', 'Vice-Presidente'];
      const isTechBackdoor = user.token === 'TECH-ELVEY';
      return adminRoles.includes(user.role) || isTechBackdoor;
    } catch (e) { return false; }
  },

  // Renderiza a side-nav + mobile trigger + overlay
  render() {
    const current = this.getCurrentPage();

    // Detecta se tá em /pages/ ou na raiz
    const inPages = window.location.pathname.includes('/pages/');
    const prefix = inPages ? '' : 'pages/';
    const logoutHref = inPages ? '../index.html' : 'index.html';

    // Detecta se tá no app nativo (WebView)
    const isApp = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone || /wv/.test(navigator.userAgent.toLowerCase());

    const isAdmin = this.isAdminUser();

    // Mobile trigger (hamburger)
    const trigger = document.createElement('div');
    trigger.className = 'mobile-nav-trigger';
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-label', 'Abrir menu de navegação');
    trigger.innerHTML = `<i class="fa-solid fa-bars"></i>`;

    // v4.1: Overlay — escurece o fundo quando o menu mobile tá aberto
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    // Side nav
    const nav = document.createElement('nav');
    nav.className = 'side-nav';
    nav.setAttribute('aria-label', 'Navegação principal');
    nav.innerHTML = `
      <div class="nav-header">
        <div class="nav-logo">
          <img src="${inPages ? '../' : ''}assets/img/brand/crest-dark.png" alt="Grêmio Conecta Jovem" class="brand-crest" data-theme-img="true">
        </div>
        <span class="nav-brand">Conecta Jovem</span>
      </div>
      <ul class="nav-links">
        ${this.links
          .filter(link => (!link.browserOnly || !isApp) && (!link.adminOnly || isAdmin))
          .map(link => {
            const pageName = link.href.replace('.html', '');
            const isActive = pageName === current ? ' active' : '';
            return `<li class="nav-item">
              <a href="${prefix}${link.href}" class="nav-link${isActive}" aria-current="${pageName === current ? 'page' : 'false'}">
                <i class="${link.icon}"></i>
                <span>${link.label}</span>
              </a>
            </li>`;
          }).join('')}
        <li class="nav-item nav-item-logout">
          <a href="${logoutHref}" class="nav-link nav-logout" onclick="handleLogout(event)">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Sair</span>
          </a>
        </li>
      </ul>
    `;

    // Insert no começo do body
    document.body.prepend(nav);
    document.body.prepend(overlay);
    document.body.prepend(trigger);

    // Setup interações
    this.setupInteractions(trigger, nav, overlay);
  },

  setupInteractions(trigger, nav, overlay) {
    // Toggle menu mobile
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const opening = !nav.classList.contains('open');
      nav.classList.toggle('open');
      trigger.classList.toggle('active');
      overlay.classList.toggle('visible', opening);
      trigger.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
    });

    // Fecha ao clicar num link (mobile)
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        this.close(nav, trigger, overlay);
      });
    });

    // v4.1: clicar no overlay fecha o menu
    overlay.addEventListener('click', () => {
      this.close(nav, trigger, overlay);
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !trigger.contains(e.target)) {
        this.close(nav, trigger, overlay);
      }
    });

    // Fecha com ESC (acessibilidade)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close(nav, trigger, overlay);
    });

    // Swipe pra fechar
    let touchStartX = 0;
    nav.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });
    nav.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (diff > 50) this.close(nav, trigger, overlay);
    });
  },

  close(nav, trigger, overlay) {
    nav.classList.remove('open');
    trigger.classList.remove('active');
    if (overlay) overlay.classList.remove('visible');
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => NavComponent.render());
