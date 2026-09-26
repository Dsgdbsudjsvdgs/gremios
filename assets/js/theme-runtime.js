// ============================================================================
// 🎨 THEME RUNTIME — aplica o tema customizado do localStorage em TODAS as
// páginas do app. Carregar em TODA página (antes do CSS renderizar melhor:
// coloque <script src="../assets/js/theme-runtime.js"></script> no <head>).
// Storage: localStorage 'gremio_theme_custom'
// ============================================================================

(function () {
  try {
    var saved = localStorage.getItem('gremio_theme_custom');
    if (!saved) return;
    var t = JSON.parse(saved);
    if (!t || !t.primary) return;
    var r = document.documentElement.style;
    if (t.primary)     r.setProperty('--primary', t.primary);
    if (t.primaryDark) r.setProperty('--primary-dark', t.primaryDark);
    if (t.bg)          r.setProperty('--bg-dark', t.bg);
    if (t.accent)      r.setProperty('--accent', t.accent);
    if (t.text)        r.setProperty('--text-main', t.text);
    r.setProperty('--gradient-main', 'linear-gradient(135deg, ' + (t.primary || '#8f1212') + ', ' + (t.primaryDark || '#380808') + ')');
    // Sinaliza pro theme-manager que ha customizacao ativa
    window.__gremioCustomTheme = true;
  } catch (e) { /* tema custom ausente/invalido — usa o padrao */ }
})();
