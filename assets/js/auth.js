// Auth System - Grêmio Educa V2 (Supabase Integration)
import { supabase } from './lib/supabaseClient.js';

const auth = {
    async login(cpf, birthDate) {
        console.log(`Tentando login via Supabase: ${cpf}, ${birthDate}`);
        
        try {
            // 1. Chama a função RPC no Supabase para validar CPF e Data de Nascimento
            const { data, error } = await supabase.rpc('validate_cpf_birthdate', { 
                input_cpf: cpf, 
                input_birthdate: birthDate 
            });

            if (error) throw error;

            if (data && data.length > 0) {
                const userDetails = data[0]; // { email, user_id }
                
                // 2. Como o Supabase Auth exige email/password ou OAuth, 
                // e queremos um login simplificado por CPF/Data, 
                // vamos salvar a sessão localmente para simular a autenticação 
                // (ou usar o email retornado para fazer sign-in se houvesse senha).
                
                // Para manter a simplicidade do fluxo do Elvey:
                const userSession = {
                    id: userDetails.user_id,
                    email: userDetails.email,
                    cpf: cpf,
                    birthDate: birthDate,
                    authenticated: true
                };

                localStorage.setItem('gremio_user', JSON.stringify(userSession));
                window.location.href = 'index.html';
                return { success: true };
            } else {
                alert('CPF ou Data de Nascimento não encontrados!');
                return { success: false };
            }
        } catch (error) {
            console.error('Erro no login Supabase:', error);
            alert('Erro no sistema de autenticação: ' + error.message);
            return { success: false };
        }
    },

    logout() {
        localStorage.removeItem('gremio_user');
        window.location.href = 'login.html';
    },

    getUser() {
        const user = localStorage.getItem('gremio_user');
        return user ? JSON.parse(user) : null;
    },

    checkAuth() {
        if (!this.getUser() && window.location.pathname.indexOf('login.html') === -1) {
            window.location.href = 'login.html';
        }
    }
};

// Event listener for login form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cpf = document.getElementById('cpf').value;
            const birth = document.getElementById('data-nasc').value;
            await auth.login(cpf, birth);
        });
    }
});

window.auth = auth; // Global exposure
