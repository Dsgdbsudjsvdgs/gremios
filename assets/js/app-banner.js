// ============================================================================
// 📱 APP BANNER — Sugere download do app no Android (não no iOS, não no WebView)
// ============================================================================

(function() {
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = ua.includes('android');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const dismissed = localStorage.getItem('app_banner_dismissed');
  const DOWNLOAD_URL = 'https://github.com/Dsgdbsudjsvdgs/gremios/releases/latest/download/app-debug.apk';

  // Só mostra no Android, no navegador (não standalone), e não foi dispensado
  if (!isAndroid || isStandalone || dismissed) return;

  // Espera DOM carregar
  function createBanner() {
    // Não duplica
    if (document.getElementById('app-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'app-banner';
    banner.style.cssText = 'display:flex;position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg,#000,#111);border-top:2px solid #00E5FF;padding:12px 16px;z-index:9999;backdrop-filter:blur(10px);align-items:center;justify-content:space-between;gap:12px;';

    banner.innerHTML = `
      <div style="flex:1;">
        <div style="font-size:0.85rem;font-weight:700;color:#00E5FF;">📱 App Grêmio disponível!</div>
        <div style="font-size:0.75rem;color:#aaa;margin-top:2px;">Mais rápido, funciona offline</div>
      </div>
      <a href="${DOWNLOAD_URL}" style="padding:8px 16px;background:#00E5FF;color:#000;border-radius:20px;font-size:0.8rem;font-weight:700;text-decoration:none;white-space:nowrap;">Baixar</a>
      <button id="app-banner-close" style="background:none;border:none;color:#666;font-size:1.2rem;cursor:pointer;padding:4px;">✕</button>
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
