// Auth Extended - Google Logic
document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('google-login');
    if (googleBtn) {
        googleBtn.onclick = async () => {
            console.log('Iniciando Login via Google (Supabase Integration)...');
            
            // No Supabase Real:
            // await supabase.auth.signInWithOAuth({ provider: 'google' });
            
            alert('Integração Google via Supabase: Redirecionando para autenticação segura...');
            
            // Simulação de sucesso no login via Google para demo
            setTimeout(() => {
                const googleUser = { 
                    nome: 'Usuário Google', 
                    cpf: '000.000.000-00', 
                    nascimento: '2000-01-01', 
                    role: 'Visitante', 
                    cor: '#ffffff' 
                };
                localStorage.setItem('gremio_user', JSON.stringify(googleUser));
                window.location.href = 'index.html';
            }, 1500);
        };
    }
});
