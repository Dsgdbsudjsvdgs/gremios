// ============================================================================
// 📱 APP BANNER — Banner discreto no login pra Android
// Direciona pra página "Instalar App" em vez de baixar direto
// ============================================================================

(function() {
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = ua.includes('android');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const isWebView = /wv/.test(ua) || typeof window.AndroidBridge !== 'undefined';
  const dismissed = localStorage.getItem('app_banner_dismissed');

  // Só mostra no Android, no navegador (não app), e não foi dispensado
  if (!isAndroid || isStandalone || isWebView || dismissed) return;

  function createBanner() {
    if (document.getElementById('app-banner')) return;

    const inPages = window.location.pathname.includes('/pages/');
    const installPage = inPages ? 'instalar.html' : 'pages/instalar.html';

    const banner = document.createElement('div');
    banner.id = 'app-banner';
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg,#000,#111);border-top:2px solid #00E5FF;padding:12px 16px;z-index:9999;backdrop-filter:blur(10px);';

    banner.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div style="flex:1;">
          <div style="font-size:0.85rem;font-weight:700;color:#00E5FF;">📱 App Grêmio disponível!</div>
          <div style="font-size:0.75rem;color:#aaa;margin-top:2px;">Mais rápido, funciona offline</div>
        </div>
        <a href="${installPage}" style="padding:8px 16px;background:#00E5FF;color:#000;border-radius:20px;font-size:0.8rem;font-weight:700;text-decoration:none;white-space:nowrap;">Saiba mais</a>
        <button id="app-banner-close" style="background:none;border:none;color:#666;font-size:1.2rem;cursor:pointer;padding:4px;">✕</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('app-banner-close').onclick = function() {
      banner.style.display = 'none';
      localStorage.setItem('app_banner_dismissed', '1');
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBanner);
  } else {
    createBanner();
  }
})();
