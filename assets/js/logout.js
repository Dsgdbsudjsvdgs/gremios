// ============================================================================
// 🚪 LOGOUT MODULE - Grêmio Estudantil v3
// ============================================================================

function handleLogout(e) {
    if (e) e.preventDefault();
    
    // Limpa a sessão via Utils global
    if (typeof UTILS !== 'undefined' && UTILS.clearStorageUser) {
        UTILS.clearStorageUser();
    } else {
        localStorage.removeItem(CONFIG.APP.STORAGE_KEY || 'gremio_user');
    }
    
    // Redireciona para o login
    window.location.href = '/index.html';
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
