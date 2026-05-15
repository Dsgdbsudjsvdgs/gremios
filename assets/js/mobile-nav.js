/* 
=============================================================================
🚀 NAVEGAÇÃO MOBILE INTERATIVA (Sincronizado com Logo Pulsante)
=============================================================================
*/
(function() {
    console.log('⚡ Hermes Mobile Nav Initializing...');

    function setupNav() {
        // Tenta encontrar o gatilho por várias formas para garantir que funcione
        const trigger = document.querySelector('.mobile-nav-trigger') || 
                        document.querySelector('.logo-pulse-btn') || 
                        document.querySelector('.logo-container');
        
        const sideNav = document.querySelector('.side-nav');
        
        if (!trigger) {
            console.error('❌ Mobile Nav Trigger not found!');
            return;
        }

        if (!sideNav) {
            console.error('❌ Side Nav not found!');
            return;
        }

        console.log('✅ Mobile Nav Trigger attached to:', trigger);

        trigger.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            sideNav.classList.toggle('open');
            console.log('Menu Toggled: ', sideNav.classList.contains('open'));
        };

        // Fecha o menu ao clicar em qualquer link
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.onclick = () => {
                if (window.innerWidth <= 768) {
                    sideNav.classList.remove('open');
                }
            };
        });

        // Fecha o menu ao clicar fora dele
        document.addEventListener('click', (e) => {
            if (sideNav && !sideNav.contains(e.target) && !trigger.contains(e.target)) {
                sideNav.classList.remove('open');
            }
        });
    }

    // Executa no carregamento e também após um pequeno delay para garantir que o DOM está pronto
    document.addEventListener('DOMContentLoaded', setupNav);
    window.addEventListener('load', setupNav);
    
    // Fallback para casos onde o DOM já carregou
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setupNav();
    }
})();
