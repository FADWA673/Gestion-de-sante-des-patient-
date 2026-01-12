// Script de vérification d'authentification
(function() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Si pas connecté, rediriger vers login
    if (!isAuthenticated || !user.id) {
        console.log('❌ Non authentifié - redirection vers login');
        window.location.href = '/login.html';
        return;
    }
    
    console.log('✅ Authentifié:', user.username);
    
    // Fonction de déconnexion globale
    window.logout = function() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            window.location.href = '/login.html';
        }
    };
    
    // Afficher le nom de l'utilisateur si l'élément existe
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = `${user.prenom} ${user.nom}`;
    }
})();