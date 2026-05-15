// ============================================================================
// 🛡️ CORE GUARD - Grêmio Estudantil v3
// Responsável por: Autenticação Global, Persistência de Perfil e UI Dinâmica
// ============================================================================

(function() {
    const STORAGE_KEY = 'gremio_user'; // Use the key from utils.js if defined, otherwise fallback

    function initGuard() {
        console.log('🛡️ Core Guard: Validating session...');
        
        // 1. Obter usuário do storage
        const userData = JSON.parse(localStorage.getItem(CONFIG.APP.STORAGE_KEY || STORAGE_KEY));

        // 2. Validação de Autenticação
        if (!userData || !userData.token) {
            console.warn('⚠️ No active session found. Redirecting to login...');
            window.location.href = '/index.html';
            return;
        }

        // 3. Injeção de Perfil no Header (UI Física)
        updateUIProfile(userData);
        
        // 4. Aplicar Cor de Destaque do Usuário
        applyUserTheme(userData.color_hex);
        
        console.log('✅ Session validated: Welcome, ' + userData.nome);
    }

    function updateUIProfile(user) {
        const nameElem = document.getElementById('user-name');
        const roleElem = document.getElementById('user-role-badge');
        
        if (nameElem) nameElem.textContent = user.nome;
        if (roleElem) {
            roleElem.textContent = user.role;
            roleElem.style.backgroundColor = user.color_hex || 'var(--primary)';
            roleElem.style.color = '#fff';
        }
    }

    function applyUserTheme(color) {
        if (color && color.startsWith('#')) {
            document.documentElement.style.setProperty('--primary', color);
        }
    }

    // Executa imediatamente para evitar flash de conteúdo não autorizado
    initGuard();
})();
