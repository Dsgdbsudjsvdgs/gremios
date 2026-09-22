// ============================================================================
// 🛡️ CORE GUARD - Grêmio Estudantil v4
// Responsável por: Autenticação Global, Persistência de Perfil e UI Dinâmica
// FIX v4: usa SEMPRE CONFIG.APP.STORAGE_KEY (fonte única de verdade)
// ============================================================================

(function() {
    // Fonte única de verdade: config.js define STORAGE_KEY = 'gremio_usuario_atual'
    // NUNCA usar key hardcoded diferente — era a causa do redirect infinito.
    function getSessionKey() {
        return (typeof CONFIG !== 'undefined' && CONFIG.APP && CONFIG.APP.STORAGE_KEY)
            ? CONFIG.APP.STORAGE_KEY
            : 'gremio_usuario_atual';
    }

    function initGuard() {
        const SESSION_KEY = getSessionKey();
        console.log('🛡️ Core Guard: Validating session... (key: ' + SESSION_KEY + ')');

        // 1. Obter usuário do storage (login customizado, NÃO usa Supabase Auth)
        let userData = null;
        try {
            userData = JSON.parse(localStorage.getItem(SESSION_KEY));
        } catch (e) {
            console.warn('⚠️ Session JSON corrompido. Limpando...');
            localStorage.removeItem(SESSION_KEY);
        }

        // 2. Validação de Autenticação
        if (!userData || !userData.token) {
            console.warn('⚠️ No active session found. Redirecting to login...');
            const depth = window.location.pathname.split('/').length - 1;
            window.location.href = (depth > 1 ? '../' : '') + 'index.html';
            return;
        }

        // 3. Sessão expirada? (24h default)
        const timeout = (typeof CONFIG !== 'undefined' && CONFIG.APP && CONFIG.APP.SESSION_TIMEOUT)
            ? CONFIG.APP.SESSION_TIMEOUT
            : 86400000;
        const elapsed = Date.now() - (userData.timestamp || 0);
        if (elapsed > timeout) {
            console.warn('⚠️ Session expired. Redirecting to login...');
            localStorage.removeItem(SESSION_KEY);
            const depth = window.location.pathname.split('/').length - 1;
            window.location.href = (depth > 1 ? '../' : '') + 'index.html';
            return;
        }

        // 4. Injeção de Perfil no Header (UI Física)
        updateUIProfile(userData);

        // 5. Aplicar Cor de Destaque do Usuário
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

    // Expõe globalmente pra outras páginas usarem a MESMA key
    window.CORE_GUARD = {
        getSessionKey: getSessionKey
    };

    // Executa imediatamente para evitar flash de conteúdo não autorizado
    initGuard();
})();
