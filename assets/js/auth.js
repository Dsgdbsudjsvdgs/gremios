// ============================================================================
// 🛡️ AUTENTICAÇÃO - Grêmio Estudantil v3 (Corrigido)
// ============================================================================

// Initialize Supabase on page load
document.addEventListener('DOMContentLoaded', () => {
    CONFIG.initSupabase();
    setupLoginForm();
});

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    const codeInput = document.getElementById('cpf'); // Campo de código
    const dateInput = document.getElementById('birth-date');
    const loginBtn = document.getElementById('btn-login');
    const errorMsg = document.getElementById('login-error');

    if (!loginForm) return;

    // Auto-uppercase código
    if (codeInput) {
        codeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin(codeInput, dateInput, loginBtn, errorMsg);
    });
}

async function handleLogin(codeInput, dateInput, loginBtn, errorMsg) {
    try {
        // Reset UI
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Validando...';
        }
        if (errorMsg) {
            errorMsg.style.display = 'none';
        }

        // Get values
        const accessCode = codeInput?.value?.trim().toUpperCase() || '';
        const birthDate = dateInput?.value || '';

        // Validate inputs
        const codeValidation = UTILS.validateAccessCode(accessCode);
        if (!codeValidation.valid) {
            throw new Error(codeValidation.error);
        }

        const dateValidation = UTILS.validateBirthDate(birthDate);
        if (!dateValidation.valid) {
            throw new Error(dateValidation.error);
        }

        // Call Supabase Query (Direct Table Access)
        const supabase = CONFIG.getSupabase();
        if (!supabase) {
            throw new Error('Supabase não inicializado');
        }

        // Query directly from 'profiles' table instead of using RPC
        const { data: members, error: queryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('access_code', accessCode)
            .limit(1);

        if (queryError) {
            console.error('❌ Supabase Query Error Detail:', {
                message: queryError.message,
                details: queryError.details,
                hint: queryError.hint
            });
            throw new Error(`Erro no banco: ${queryError.message}`);
        }

        if (!members || members.length === 0) {
            console.log('🔍 Busca realizada. Código:', accessCode, 'Resultado: Nenhum membro encontrado.');
            throw new Error('Código de acesso inválido');
        }

        const profile = members[0];
        console.log('✅ Membro encontrado:', profile);

        // Validate birth date matches
        if (profile.birth_date && profile.birth_date !== birthDate) {
            throw new Error('Data de nascimento não corresponde ao código');
        }

        // Store user data
        const userData = {
            id: profile.profile_id || profile.id,
            nome: profile.full_name || profile.name,
            role: profile.role || 'user',
            department_id: profile.department_id,
            department_name: profile.department_name,
            color_hex: profile.color_hex || '#6366f1',
            email: profile.email,
            avatar: profile.avatar,
            timestamp: new Date().getTime()
        };

        if (!UTILS.setStorageUser(userData)) {
            throw new Error('Erro ao salvar dados. Tente novamente.');
        }

        // Redirect to dashboard
        UTILS.showSuccess('Login realizado com sucesso!');
        setTimeout(() => {
            window.location.href = 'pages/dashboard.html';
        }, 500);

    } catch (error) {
        console.error('❌ Login error:', error);
        UTILS.showError(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Entrar';
        }
    }
}

// Logout function
function logout() {
    UTILS.clearStorageUser();
    window.location.href = '../index.html';
}

// Check if already logged in
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (UTILS.isUserAuthenticated() && window.location.pathname.includes('index.html')) {
            window.location.href = 'pages/dashboard.html';
        }
    });
} else {
    if (UTILS.isUserAuthenticated() && window.location.pathname.includes('index.html')) {
        window.location.href = 'pages/dashboard.html';
    }
}

console.log('✅ Auth module loaded');
