// ============================================================================
// 📱 APP BANNER — Detecta Android e sugere baixar o app
// iOS: não mostra, deixa no navegador
// ============================================================================

(function() {
 const ua = navigator.userAgent.toLowerCase();
 const isAndroid = ua.includes('android');
 const isIOS = /iphone|ipad|ipod/.test(ua);
 // standalone = já tá no app (TWA ou PWA instalado)
 const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
 const dismissed = localStorage.getItem('app_banner_dismissed');

 // Só mostra no Android, no navegador (não no app), e se não foi dispensado
 if (!isAndroid || isStandalone || dismissed) return;

 function injectBanner() {
 // Não injeta na página de login (já tem lá)
 if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) return;

 const banner = document.createElement('div');
 banner.id = 'app-banner';
 banner.style.cssText = 'display:block;position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg,#000 0%,#111 100%);border-top:2px solid #00E5FF;padding:12px 16px;z-index:9999;backdrop-filter:blur(10px);';
 banner.innerHTML = `
 <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
 <div style="flex:1;">
 <div style="font-size:0.85rem;font-weight:700;color:#00E5FF;">📱 App Grêmio disponível!</div>
 <div style="font-size:0.75rem;color:#aaa;margin-top:2px;">Mais rápido, funciona offline</div>
 </div>
 <a href="https://github.com/Dsgdbsudjsvdgs/gremios/releases/latest/download/app-debug.apk" 
    style="padding:8px 16px;background:#00E5FF;color:#000;border-radius:20px;font-size:0.8rem;font-weight:700;text-decoration:none;white-space:nowrap;">Baixar</a>
 <button onclick="document.getElementById('app-banner').style.display='none';localStorage.setItem('app_banner_dismissed','1')" 
    style="background:none;border:none;color:#666;font-size:1.2rem;cursor:pointer;padding:4px;">✕</button>
 </div>
 `;
 document.body.appendChild(banner);
 }

 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', injectBanner);
 } else {
 injectBanner();
 }
})();
