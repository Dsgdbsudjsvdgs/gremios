document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ov-form');
    const history = document.getElementById('ov-history');

    form.onsubmit = (e) => {
        e.preventDefault();
        
        const type = document.getElementById('ov-type').value;
        const msg = document.getElementById('ov-msg').value;

        // Adicionar ao histórico localmente para demo
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-info">
                <h4>${type}</h4>
                <p>${msg}</p>
            </div>
            <span class="status-pill" style="font-size: 0.6rem; padding: 4px 8px; background: var(--primary); border-radius: 10px; color: white;">Enviado</span>
        `;
        
        history.prepend(item);
        form.reset();
        alert('Manifestação enviada com sucesso ao Grêmio!');
    };
});
