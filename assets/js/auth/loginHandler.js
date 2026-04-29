     1|import { signInWithCpf, signUp } from './authService.js'
     2|
     3|document.addEventListener('DOMContentLoaded', () => {
     4|    const loginForm = document.getElementById('login-form');
     5|    const registerBtn = document.getElementById('register-btn'); // Ajustando IDs conforme UI comum
     6|    const registerForm = document.getElementById('register-form');
     7|
     8|    if (loginForm) {
     9|        loginForm.addEventListener('submit', async (e) => {
    10|            e.preventDefault();
    11|            const cpf = loginForm.querySelector('input[name="cpf"]').value;
    12|            const password = loginForm.querySelector('input[type="password"]').value;
    13|
    14|            try {
    15|                await signInWithCpf(cpf, password);
    16|                window.location.href = 'index.html';
    17|            } catch (error) {
    18|                alert('Erro ao fazer login: ' + error.message);
    19|            }
    20|        });
    21|    }
    22|
    23|    if (registerForm) {
    24|        registerForm.addEventListener('submit', async (e) => {
    25|            e.preventDefault();
    26|            const email = registerForm.querySelector('input[type="email"]').value;
    27|            const password = registerForm.querySelector('input[type="password"]').value;
    28|            const full_name = registerForm.querySelector('input[name="full_name"]').value;
    29|            const cpf = registerForm.querySelector('input[name="cpf"]').value;
    30|
    31|            try {
    32|                await signUp(email, password, full_name, cpf);
    33|                alert('Conta criada com sucesso! Verifique seu e-mail.');
    34|                window.location.href = 'login.html';
    35|            } catch (error) {
    36|                alert('Erro ao cadastrar: ' + error.message);
    37|            }
    38|        });
    39|    }
    40|});
    41|