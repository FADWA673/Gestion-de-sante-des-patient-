// 🎨 SIDEBAR MODERNE ET PROFESSIONNELLE SGSP
function createSidebar(activePage) {
  return `
    <aside id="sidebar" class="sidebar w-64 bg-gradient-to-b from-sky-800 to-sky-900 text-white flex-shrink-0 shadow-2xl fixed left-0 top-0 h-screen overflow-y-auto transition-transform duration-300 z-50">
      <!-- En-tête Moderne -->
      <div class="p-6 border-b border-white border-opacity-10">
        <div class="flex items-center gap-3 animate-slide-right">
          <div class="bg-white p-3 rounded-2xl shadow-lg">
            <svg class="text-sky-600" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight">SGSP</h1>
            <p class="text-xs text-blue-200 mt-0.5 font-medium">Centre Hospitalier</p>
          </div>
        </div>
        <div class="mt-4 px-3 py-2 bg-white bg-opacity-10 rounded-xl">
          <div class="flex items-center gap-2 text-xs text-blue-100">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Système en ligne</span>
          </div>
        </div>
      </div>

      <!-- Navigation Moderne -->
      <nav class="p-4 space-y-2">
        <div class="text-xs font-semibold text-blue-200 uppercase tracking-wider px-4 py-2 mb-2">
          Navigation Principale
        </div>
        
        <a href="/dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group">
          <div class="w-8 h-8 rounded-lg bg-white bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          </div>
          <span>Tableau de Bord</span>
        </a>

        <a href="/patients.html" class="sidebar-link ${activePage === 'patients' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group">
          <div class="w-8 h-8 rounded-lg bg-white bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <span>Patients</span>
        </a>

        <a href="/medecins.html" class="sidebar-link ${activePage === 'medecins' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group">
          <div class="w-8 h-8 rounded-lg bg-white bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
          </div>
          <span>Médecins</span>
        </a>

        <a href="/consultations.html" class="sidebar-link ${activePage === 'consultations' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group">
          <div class="w-8 h-8 rounded-lg bg-white bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <span>Consultations</span>
        </a>

        <div class="text-xs font-semibold text-blue-200 uppercase tracking-wider px-4 py-2 mt-6 mb-2">
          Gestion Médicale
        </div>

        <a href="/calendrier.html" class="sidebar-link ${activePage === 'calendrier' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group">
          <div class="w-8 h-8 rounded-lg bg-white bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
            </svg>
          </div>
          <span>Rendez-vous</span>
        </a>

        <div class="text-xs font-semibold text-blue-200 uppercase tracking-wider px-4 py-2 mt-6 mb-2">
          Administration
        </div>

        <a href="/gestion-comptes.html" class="sidebar-link ${activePage === 'gestion-comptes' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group">
          <div class="w-8 h-8 rounded-lg bg-white bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V16L7.5 15.5C6.7 15.4 6 16 6 16.8V18.2C6 18.7 6.4 19.2 6.8 19.3L11 20V23H13V20L17.2 19.3C17.6 19.2 18 18.7 18 18.2V16.8C18 16 17.3 15.4 16.5 15.5L13 16V11C14.1 11 15 10.1 15 9H21Z"/>
            </svg>
          </div>
          <span>Gestion des Comptes</span>
        </a>





        <div class="text-xs font-semibold text-blue-200 uppercase tracking-wider px-4 py-2 mt-6 mb-2">
          Services Avancés
        </div>

        <a href="/factures.html" class="sidebar-link ${activePage === 'factures' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group">
          <div class="w-8 h-8 rounded-lg bg-white bg-opacity-10 flex items-center justify-center group-hover:bg-opacity-20 transition">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
          </div>
          <span>Facturation</span>
        </a>
      </nav>

      <!-- Profil Utilisateur -->
      <div class="mt-auto p-4 border-t border-white border-opacity-10">
        <div class="flex items-center gap-3 px-4 py-3 bg-white bg-opacity-10 rounded-xl">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            A
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-white truncate">Administrateur</div>
            <div class="text-xs text-blue-200">Système SGSP</div>
          </div>
          <button onclick="logout()" class="p-2 text-blue-200 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition" title="Déconnexion">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay pour mobile -->
    <div id="sidebarOverlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden" onclick="toggleSidebar()"></div>

    <!-- Bouton Hamburger Moderne -->
    <button id="hamburgerBtn" onclick="toggleSidebar()" class="fixed top-4 left-4 z-50 bg-sky-600 text-white p-3 rounded-2xl shadow-lg hover:bg-sky-700 transition lg:hidden">
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
      </svg>
    </button>
  `;
}

// Toggle sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  sidebar.classList.toggle('-translate-x-full');
  overlay.classList.toggle('hidden');
}

// Initialiser la sidebar au chargement
function initSidebar(activePage) {
  const sidebarContainer = document.getElementById('sidebarContainer');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = createSidebar(activePage);
  }
}

// Fonction logout
function logout() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
  window.location.href = '/landing.html';
}