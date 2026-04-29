document.addEventListener('DOMContentLoaded', async () => {
    const plansList = document.getElementById('plans-list');
    
    try {
        const response = await fetch('../assets/json/planos.json');
        const plans = await response.json();
        
        plans.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'plan-card fade-in';
            
            card.innerHTML = `
                <div class="plan-header">
                    <div class="plan-title">
                        <h2>${plan.diretoria}</h2>
                        <p>${plan.objetivo}</p>
                    </div>
                    <span class="plan-member-badge" style="background-color: ${plan.cor}">
                        ${plan.membro}
                    </span>
                </div>
                <div class="plan-content">
                    <div class="semester-box">
                        <div class="semester-title">📅 1º Semestre</div>
                        ${plan.semestre1.map(action => `
                            <div class="action-item">
                                <div class="action-check"></div>
                                <span>${action}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="semester-box">
                        <div class="semester-title">📅 2º Semestre</div>
                        ${plan.semestre2.map(action => `
                            <div class="action-item">
                                <div class="action-check"></div>
                                <span>${action}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            plansList.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar planos:', error);
        plansList.innerHTML = `<p style="color: red; text-align: center;">Erro ao carregar planos de ação.</p>`;
    }
});
