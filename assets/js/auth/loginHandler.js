import { signInWithCpf, signUp } from './authService.js'

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerBtn = document.getElementById('register-btn'); // Ajustando IDs conforme UI comum
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cpf = loginForm.querySelector('input[name="cpf"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            try {
                await signInWithCpf(cpf, password);
                window.location.href = 'index.html';
            } catch (error) {
                alert('Erro ao fazer login: ' + error.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;
            const full_name = registerForm.querySelector('input[name="full_name"]').value;
            const cpf = registerForm.querySelector('input[name="cpf"]').value;

            try {
                await signUp(email, password, full_name, cpf);
                alert('Conta criada com sucesso! Verifique seu e-mail.');
                window.location.href = 'login.html';
            } catch (error) {
                alert('Erro ao cadastrar: ' + error.message);
            }
        });
    }
});
