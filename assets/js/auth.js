// Auth System - Grêmio Educa V2
const auth = {
    async login(cpf, birthDate) {
        console.log(`Tentando login: ${cpf}, ${birthDate}`);
        
        try {
            const response = await fetch('assets/json/membros.json');
            const members = await response.json();
            
            // Normalize birthDate from DD/MM/AAAA to YYYY-MM-DD for comparison if needed
            // or just compare raw strings if the JSON is updated.
            const user = members.find(u => u.cpf === cpf);

            if (user) {
                localStorage.setItem('gremio_user', JSON.stringify(user));
                window.location.href = 'index.html';
                return { success: true };
            } else {
                alert('CPF ou Data de Nascimento incorretos!');
                return { success: false };
            }
        } catch (error) {
            console.error('Erro ao carregar membros:', error);
            alert('Erro no sistema de autenticação!');
            return { success: false };
        }
    },

    logout() {
        localStorage.removeItem('gremio_user');
        window.location.href = '/login.html';
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
