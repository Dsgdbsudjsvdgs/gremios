// ============================================================================
// 🚪 LOGOUT MODULE - Grêmio Estudantil v4
// Corrigido: limpa TUDO e redireciona com caminho relativo
// ============================================================================

function handleLogout(e) {
 if (e) e.preventDefault();
 
 // 1. Limpa sessão do usuário
 if (typeof UTILS !== 'undefined' && UTILS.clearStorageUser) {
 UTILS.clearStorageUser();
 }
 localStorage.removeItem(CONFIG.APP.STORAGE_KEY || 'gremio_user');
 
 // 2. Limpa caches de dados (tarefas, notificações, eventos, membros)
 localStorage.removeItem('gremio_tasks');
 localStorage.removeItem('gremio_notifications');
 localStorage.removeItem('gremio_events');
 localStorage.removeItem('gremio_members');
 
 // 3. Limpa Supabase session se existir
 if (typeof supabase !== 'undefined' && supabase.auth) {
 supabase.auth.signOut().catch(() => {});
 }
 
 // 4. Redireciona com caminho relativo (funciona no WebView e no site)
 const inPages = window.location.pathname.includes('/pages/');
 const loginPath = inPages ? '../index.html' : 'index.html';
 
 // Usa replace pra não poder voltar com botão voltar
 window.location.replace(loginPath);
}

// Vincula o evento ao botão de logout se ele existir na página
document.addEventListener('DOMContentLoaded', () => {
 const logoutBtn = document.getElementById('btn-logout');
 if (logoutBtn) {
 logoutBtn.onclick = handleLogout;
 }
});

// Exporta para uso global
window.handleLogout = handleLogout;
