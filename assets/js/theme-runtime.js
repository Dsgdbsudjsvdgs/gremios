// ============================================================================
// 🎨 THEME RUNTIME — aplica o tema customizado em TODAS as páginas.
// Prioridade: tema salvo na CONTA (profiles.theme, vem no storage user) >
// localStorage (fallback) > padrão do CSS.
// Colocar <script src="...theme-runtime.js"></script> no <head> de toda página.
// ============================================================================

(function () {
  try {
    var t = null;
    // 1) tema da conta (sincronizado)
    try {
      var u = JSON.parse(localStorage.getItem('gremio_usuario_atual') || 'null');
      if (u && u.theme && u.theme.primary) t = u.theme;
    } catch (e) {}
    // 2) fallback: localStorage do device
    if (!t) {
      var saved = localStorage.getItem('gremio_theme_custom');
      if (saved) t = JSON.parse(saved);
    }
    if (!t || !t.primary) return;
    var r = document.documentElement.style;
    r.setProperty('--primary', t.primary);
    if (t.primaryDark) r.setProperty('--primary-dark', t.primaryDark);
    if (t.bg) r.setProperty('--bg-dark', t.bg);
    if (t.accent) r.setProperty('--accent', t.accent);
    if (t.text) r.setProperty('--text-main', t.text);
    r.setProperty('--gradient-main', 'linear-gradient(135deg, ' + t.primary + ', ' + (t.primaryDark || '#380808') + ')');
    window.__gremioCustomTheme = true;
  } catch (e) { /* tema ausente/inválido — usa o padrão */ }
})();
