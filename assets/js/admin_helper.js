// Adição ao dashboard.js para controlar a visibilidade do card admin
// Adicionar este bloco dentro da função initDashboard() ou logo após ela:

async function checkAdminAccess(user) {
    const adminCard = document.getElementById('card-admin');
    if (!adminCard) return;

    const allowedRoles = ['Presidente', 'Tecnologia e Inovação'];
    if (allowedRoles.includes(user.role)) {
        adminCard.style.display = 'block';
    } else {
        adminCard.style.display = 'none';
    }
}

// Integrate this into the main init flow:
// const user = JSON.parse(localStorage.getItem('gremio_user'));
// checkAdminAccess(user);
