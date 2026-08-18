// ============================================================================
// ⚙️ CONFIGURAÇÃO CENTRALIZADA - Grêmio Estudantil v3
// ============================================================================

// Supabase Configuration (Modo Público - Chaves Anon)
const SUPABASE_CONFIG = {
    URL: 'https://wearihgeytywbhhtvwlg.supabase.co',
    KEY: 'sb_publishable_RRZHT83pEDzTUrWaJU0pqQ_6BOize63'
};

// Initialize Supabase Client
let supabaseClient = null;

function initSupabase() {
    if (!window.supabase) {
        console.error('❌ Supabase library not loaded');
        return null;
    }
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.KEY);
    console.log('✅ Supabase initialized');
    return supabaseClient;
}

// Get Supabase Client
function getSupabase() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

// App Configuration
const APP_CONFIG = {
    APP_NAME: 'Grêmio Estudantil',
    VERSION: '3.0.0',
    DEBUG: true,
    STORAGE_KEY: 'gremio_usuario_atual',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
};

// Departamentos Mapping (Sincronizado com nomes de arquivos em /pages)
const DEPARTMENTS = {
 // Nomes do banco (departments.name) — usados por getDeptColorByName()
 'Presidência': { slug: 'dept_presidente', color: '#FF6B6B' },
 'Vice-Presidência': { slug: 'dept_vice-presidente', color: '#4ECDC4' },
 'Secretaria': { slug: 'dept_secretaria', color: '#FFA07A' },
 'Secretaria Geral': { slug: 'dept_secretario_geral', color: '#45B7D1' },
 'Tesouraria': { slug: 'dept_tesoureira', color: '#FFA07A' },
 'Responsabilidade Social': { slug: 'dept_resp_social', color: '#52C9A0' },
 'Tecnologia e Inovação': { slug: 'dept_tecnologia_e_inovacao', color: '#F7DC6F' },
 'Eventos': { slug: 'dept_eventos', color: '#BB8FCE' },
 'Esportes': { slug: 'dept_esportes', color: '#85C1E2' },
 'Cultura': { slug: 'dept_cultura', color: '#52C9A0' },
 'Ouvidoria': { slug: 'dept_ouvidoria', color: '#F8B739' },
 'Protagonismo': { slug: 'dept_protagonismo', color: '#A8D8EA' },
 'Meio Ambiente': { slug: 'dept_meio_ambiente', color: '#7FD8BE' },
 'Comunicação': { slug: 'dept_comunicacao', color: '#E8A0BF' },
 // Aliases (role names → department names) para compatibilidade
 'Presidente': { slug: 'dept_presidente', color: '#FF6B6B' },
 'Vice-Presidente': { slug: 'dept_vice-presidente', color: '#4ECDC4' },
 'Secretária': { slug: 'dept_secretaria', color: '#FFA07A' },
 'Secretário Geral': { slug: 'dept_secretario_geral', color: '#45B7D1' },
 'Tesoureira': { slug: 'dept_tesoureira', color: '#FFA07A' },
 'Diretoria': { slug: 'diretoria', color: '#E8A0BF' },
 'Diretor': { slug: 'diretoria', color: '#E8A0BF' }
};

// API Endpoints
const API_ENDPOINTS = {
    VALIDATE_CODE: 'validate_access_code',
    GET_PROFILE: 'get_profile',
    GET_TASKS: 'get_tasks',
    GET_EVENTS: 'get_events',
    GET_DIARY: 'get_diary_entries',
    GET_MEMBERS: 'get_members'
};

// Status Codes (sincronizado com SQL v4)
const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// Priority Levels (sincronizado com SQL v4)
const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Roles (sincronizado com ENUM user_role do SQL)
const ROLES = {
  ADMIN: 'Presidente',        // Presidente = admin do sistema
  VICE_ADMIN: 'Vice-Presidente',
  TECH: 'Diretor',            // Diretores (inclui Tech)
  USER: 'user'
};

// Export for use
window.CONFIG = {
    SUPABASE: SUPABASE_CONFIG,
    APP: APP_CONFIG,
    DEPARTMENTS,
    API_ENDPOINTS,
    STATUS,
    PRIORITY,
    ROLES,
    initSupabase,
    getSupabase
};

console.log('✅ Config loaded:', APP_CONFIG.APP_NAME, APP_CONFIG.VERSION);
