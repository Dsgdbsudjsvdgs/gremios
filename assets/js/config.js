// ============================================================================
// ⚙️ CONFIGURAÇÃO CENTRALIZADA - Grêmio Estudantil v3
// ============================================================================

// Supabase Configuration (Modo Público - Chaves Anon)
const SUPABASE_CONFIG = {
    URL: 'https://wearihgeytywbhhtvwlg.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYXJpaGdleXR5d2JoaHR2d2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDgsImV4cCI6MjA5MjM5MDY0OH0.5pz5JCKUEC5y7GuKt4OnSNW-VF_hrYUB4teoucHBNqY'
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

// Departamentos Mapping
const DEPARTMENTS = {
    'Presidente': { slug: 'presidente', color: '#FF6B6B' },
    'Vice-Presidente': { slug: 'vice-presidente', color: '#4ECDC4' },
    'Secretário Geral': { slug: 'secretario_geral', color: '#45B7D1' },
    'Secretária': { slug: 'secretaria', color: '#FFA07A' },
    'Tesoureira': { slug: 'tesoureira', color: '#98D8C8' },
    'Tecnologia e Inovação': { slug: 'tecnologia_e_inovacao', color: '#F7DC6F' },
    'Eventos': { slug: 'eventos', color: '#BB8FCE' },
    'Esportes': { slug: 'esportes', color: '#85C1E2' },
    'Cultura': { slug: 'cultura', color: '#52C9A0' },
    'Ouvidoria': { slug: 'ouvidoria', color: '#F8B739' },
    'Responsabilidade Social': { slug: 'resp_social', color: '#52C9A0' },
    'Protagonismo': { slug: 'protagonismo', color: '#A8D8EA' },
    'Meio Ambiente': { slug: 'meio_ambiente', color: '#7FD8BE' },
    'Diretoria': { slug: 'diretoria', color: '#E8A0BF' }
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

// Status Codes
const STATUS = {
    PENDING: 'pendente',
    IN_PROGRESS: 'em_andamento',
    COMPLETED: 'concluido'
};

// Priority Levels
const PRIORITY = {
    LOW: 'baixa',
    MEDIUM: 'media',
    HIGH: 'alta'
};

// Roles
const ROLES = {
    ADMIN: 'admin',
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
