// ============================================================================
// 🛡️ CORE GUARD - Grêmio Estudantil v3
// Responsável por: Autenticação Global, Persistência de Perfil e UI Dinâmica
// ============================================================================

(function() {
 const STORAGE_KEY = 'gremio_user';

 function initGuard() {
 console.log('🛡️ Core Guard: Validating session...');
 
 // 1. Obter usuário do storage (login customizado, NÃO usa Supabase Auth)
 const userData = JSON.parse(localStorage.getItem(CONFIG.APP.STORAGE_KEY || STORAGE_KEY));

 // 2. Validação de Autenticação
 if (!userData || !userData.token) {
 console.warn('⚠️ No active session found. Redirecting to login...');
 const depth = window.location.pathname.split('/').length - 1;
 window.location.href = (depth > 1 ? '../' : '') + 'index.html';
 return;
 }

 // 3. Sessão expirada? (24h)
 const elapsed = Date.now() - (userData.timestamp || 0);
 if (elapsed > CONFIG.APP.SESSION_TIMEOUT) {
 console.warn('⚠️ Session expired. Redirecting to login...');
 localStorage.removeItem(CONFIG.APP.STORAGE_KEY || STORAGE_KEY);
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

 // Executa imediatamente para evitar flash de conteúdo não autorizado
 initGuard();
})();
