// Configurações do Supabase
const SUPABASE_URL = 'https://wearihgeytywbhhtvwlg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYXJpaGdleXR5d2JoaHR2d2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDgsImV4cCI6MjA5MjM5MDY0OH0.5pz5JCKUEC5y7GuKt4OnSNW-VF_hrYUB4teoucHBNqY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    const errorMsg = document.getElementById('login-error');
    
    const cpf = document.getElementById('cpf').value;
    const birthDate = document.getElementById('birth-date').value;

    btn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        // Validação customizada contra a tabela 'profiles'
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('cpf', cpf)
            .eq('birth_date', birthDate)
            .single();

        if (error || !data) {
            throw new Error('Usuário não encontrado');
        }

        // Salva a sessão localmente
        localStorage.setItem('gremio_user', JSON.stringify(data));
        window.location.href = 'pages/dashboard.html';

    } catch (err) {
        errorMsg.style.display = 'block';
        console.error('Erro de login:', err.message);
    } finally {
        btn.disabled = false;
    }
});
