// App Global Logic - Grêmio Educa V2
document.addEventListener('DOMContentLoaded', () => {
    console.log('Grêmio V2: Sistema Inicializado ☸️');
    
    // Update active nav link based on current URL
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Utility for glass effects or dynamic loading
const UI = {
    showToast: (msg) => {
        // Implementation for a modern toast notification
        console.log(`Toast: ${msg}`);
    }
};
