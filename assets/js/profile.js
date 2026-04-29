// Perfil Dynamic Logic - Grêmio Educa V2
document.addEventListener('DOMContentLoaded', () => {
    const user = auth.getUser();
    
    if (!user) {
        window.location.href = '../login.html';
        return;
    }

    // Update Text Data
    document.getElementById('user-name').textContent = user.nome;
    document.getElementById('user-role').textContent = user.role;
    document.getElementById('user-cpf').textContent = user.cpf;
    document.getElementById('user-birth').textContent = user.nascimento;
    
    // Dynamic Avatar
    const avatar = document.getElementById('user-avatar');
    avatar.textContent = user.nome.charAt(0).toUpperCase();
    
    // Apply the custom member color
    const memberColor = user.cor || 'var(--primary)';
    avatar.style.backgroundColor = memberColor;
    avatar.style.boxShadow = `0 0 20px ${memberColor}66`; // Add glow with the member's color

    // Apply a global theme variable for other elements
    document.documentElement.style.setProperty('--user-accent-color', memberColor);
});
