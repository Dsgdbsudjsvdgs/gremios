// ============================================================================
// 🛠️ UTILITÁRIOS - Grêmio Estudantil v3
// ============================================================================

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

function getStorageUser() {
    try {
        const userData = localStorage.getItem(CONFIG.APP.STORAGE_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('❌ Error reading user from storage:', error);
        return null;
    }
}

function setStorageUser(userData) {
    try {
        localStorage.setItem(CONFIG.APP.STORAGE_KEY, JSON.stringify(userData));
        return true;
    } catch (error) {
        console.error('❌ Error saving user to storage:', error);
        return false;
    }
}

function clearStorageUser() {
    try {
        localStorage.removeItem(CONFIG.APP.STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('❌ Error clearing user from storage:', error);
        return false;
    }
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

function isUserAuthenticated() {
    const user = getStorageUser();
    return user && user.id && user.nome && user.role;
}

function requireAuth() {
    if (!isUserAuthenticated()) {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    const user = getStorageUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
        alert('❌ Acesso negado! Apenas administradores podem acessar esta página.');
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

// ============================================================================
// DATE FUNCTIONS
// ============================================================================

function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function getMonthName(month) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateAccessCode(code) {
    if (!code || code.trim().length === 0) {
        return { valid: false, error: 'Código de acesso é obrigatório' };
    }
    if (code.length < 3) {
        return { valid: false, error: 'Código deve ter pelo menos 3 caracteres' };
    }
    return { valid: true };
}

function validateBirthDate(dateString) {
    if (!dateString) {
        return { valid: false, error: 'Data de nascimento é obrigatória' };
    }
    if (!isValidDate(dateString)) {
        return { valid: false, error: 'Data inválida' };
    }
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 10 || age > 100) {
        return { valid: false, error: 'Data de nascimento inválida' };
    }
    
    return { valid: true };
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateTaskTitle(title) {
    if (!title || title.trim().length === 0) {
        return { valid: false, error: 'Título da tarefa é obrigatório' };
    }
    if (title.length > 200) {
        return { valid: false, error: 'Título não pode ter mais de 200 caracteres' };
    }
    return { valid: true };
}

// ============================================================================
// UI FUNCTIONS
// ============================================================================

function showError(message, duration = 5000) {
    const errorElement = document.getElementById('error-message') || createErrorElement();
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    if (duration > 0) {
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, duration);
    }
}

function showSuccess(message, duration = 3000) {
    const successElement = document.getElementById('success-message') || createSuccessElement();
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    if (duration > 0) {
        setTimeout(() => {
            successElement.style.display = 'none';
        }, duration);
    }
}

function createErrorElement() {
    const div = document.createElement('div');
    div.id = 'error-message';
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ef4444;
        color: white;
        padding: 16px;
        border-radius: 8px;
        z-index: 9999;
        max-width: 400px;
        display: none;
    `;
    document.body.appendChild(div);
    return div;
}

function createSuccessElement() {
    const div = document.createElement('div');
    div.id = 'success-message';
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #10b981;
        color: white;
        padding: 16px;
        border-radius: 8px;
        z-index: 9999;
        max-width: 400px;
        display: none;
    `;
    document.body.appendChild(div);
    return div;
}

// ============================================================================
// SUPABASE FUNCTIONS
// ============================================================================

async function supabaseQuery(table, options = {}) {
    try {
        const supabase = CONFIG.getSupabase();
        let query = supabase.from(table).select('*');
        
        if (options.where) {
            Object.entries(options.where).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        if (options.order) {
            query = query.order(options.order.column, { ascending: options.order.ascending !== false });
        }
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error(`❌ Query error on ${table}:`, error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('❌ Supabase query error:', error);
        return null;
    }
}

async function supabaseInsert(table, data) {
    try {
        const supabase = CONFIG.getSupabase();
        const { data: result, error } = await supabase
            .from(table)
            .insert([data]);
        
        if (error) {
            console.error(`❌ Insert error on ${table}:`, error);
            throw error;
        }
        
        return result;
    } catch (error) {
        console.error('❌ Supabase insert error:', error);
        throw error;
    }
}

async function supabaseUpdate(table, id, data) {
    try {
        const supabase = CONFIG.getSupabase();
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id);
        
        if (error) {
            console.error(`❌ Update error on ${table}:`, error);
            throw error;
        }
        
        return result;
    } catch (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
    }
}

async function supabaseDelete(table, id) {
    try {
        const supabase = CONFIG.getSupabase();
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error(`❌ Delete error on ${table}:`, error);
            throw error;
        }
        
        return true;
    } catch (error) {
        console.error('❌ Supabase delete error:', error);
        throw error;
    }
}

// ============================================================================
// DEPARTMENT FUNCTIONS
// ============================================================================

function getDepartmentSlug(role) {
    if (!role) return 'diretoria';
    
    const normalized = role.toLowerCase()
        .replace(/ã/g, 'a')
        .replace(/ç/g, 'c')
        .replace(/é/g, 'e')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    
    return 'dept_' + normalized;
}

function getDepartmentColor(role) {
    const dept = Object.values(CONFIG.DEPARTMENTS).find(d => d.slug === getDepartmentSlug(role));
    return dept ? dept.color : '#6366f1';
}

// ============================================================================
// EXPORT
// ============================================================================

window.UTILS = {
    // Storage
    getStorageUser,
    setStorageUser,
    clearStorageUser,
    
    // Auth
    isUserAuthenticated,
    requireAuth,
    requireAdmin,
    
    // Date
    formatDate,
    formatDateTime,
    isValidDate,
    getMonthName,
    
    // Validation
    validateAccessCode,
    validateBirthDate,
    validateEmail,
    validateTaskTitle,
    
    // UI
    showError,
    showSuccess,
    
    // Supabase
    supabaseQuery,
    supabaseInsert,
    supabaseUpdate,
    supabaseDelete,
    
    // Department
    getDepartmentSlug,
    getDepartmentColor
};

console.log('✅ Utils loaded');
