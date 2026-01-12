// auth.js - Système d'authentification côté client

// Vérifier si l'utilisateur est authentifié
function checkAuth() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const currentPath = window.location.pathname;
    
    console.log('🔒 Vérification auth - Path:', currentPath, '| Auth:', isAuthenticated);
    
    // Pages publiques (accessibles sans connexion)
    const publicPages = ['/login.html', '/', '/index.html', '/acces-interfaces.html', '/test-comptes.html'];
    
    // Si on est sur une page protégée et pas authentifié
    const isPublicPage = publicPages.some(page => currentPath.includes(page) || currentPath === '/');
    
    if (!isPublicPage && isAuthenticated !== 'true') {
        console.log('❌ Non authentifié - Redirection vers login.html');
        window.location.href = '/login.html';
        return false;
    }
    
    console.log('✅ Authentification OK');
    return true;
}

// Fonction de déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        console.log('👋 Déconnexion...');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
}

// Redirection selon le rôle après connexion
function redirectAfterLogin(user) {
    console.log('🔄 Redirection selon le rôle:', user.role);
    
    switch(user.role) {
        case 'admin':
            window.location.href = '/admin-dashboard.html';
            break;
        case 'medecin':
            window.location.href = '/medecin-dashboard.html';
            break;
        case 'patient':
            window.location.href = '/patient-dashboard.html';
            break;
        default:
            window.location.href = '/dashboard.html';
    }
}

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Désactiver la vérification automatique pour les dashboards
    const currentPath = window.location.pathname;
    const isDashboard = currentPath.includes('dashboard.html');
    
    if (!isDashboard) {
        checkAuth();
    }
    
    // Afficher les infos utilisateur si connecté
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameElements = document.querySelectorAll('.user-name');
    
    userNameElements.forEach(element => {
        if (user.username) {
            element.textContent = user.username;
        }
    });
    
    console.log('👤 Utilisateur:', user);
});