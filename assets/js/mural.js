document.addEventListener('DOMContentLoaded', async () => {
    const mural = document.getElementById('mural-cargos');
    
    try {
        const response = await fetch('assets/json/membros.json');
        const members = await response.json();
        
        members.forEach(member => {
            const item = document.createElement('div');
            item.className = 'mural-item fade-in';
            
            item.innerHTML = `
                <div class="mural-avatar" style="background-color: ${member.cor}; box-shadow: 0 0 10px ${member.cor}66;">
                    ${member.nome.charAt(0).toUpperCase()}
                </div>
                <span class="mural-name">${member.nome}</span>
                <span class="mural-role">${member.role}</span>
            `;
            mural.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar mural de membros:', error);
    }
});
