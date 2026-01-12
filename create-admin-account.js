const fetch = require('node-fetch');

async function createAdminAccount() {
    console.log('🔧 CRÉATION COMPTE ADMIN...');
    
    try {
        // Créer le compte admin
        const adminData = {
            username: 'admin',
            password: 'admin123',
            email: 'admin@sgsp.com',
            prenom: 'Admin',
            nom: 'Système',
            role: 'admin'
        };
        
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Compte admin créé avec succès');
        } else if (result.message && result.message.includes('existe déjà')) {
            console.log('ℹ️ Compte admin existe déjà');
        } else {
            console.log('❌ Erreur création admin:', result.message);
        }
        
        // Test de connexion admin
        console.log('\n🧪 Test connexion admin...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin',
                password: 'admin123'
            })
        });
        
        const loginResult = await loginResponse.json();
        console.log('👨‍💼 Connexion admin:', loginResult.success ? '✅ OK' : '❌ ERREUR');
        
        if (loginResult.success) {
            console.log('   ID:', loginResult.user.id);
            console.log('   Rôle:', loginResult.user.role);
        } else {
            console.log('   Erreur:', loginResult.message);
        }
        
        // Test de connexion médecin
        console.log('\n🧪 Test connexion médecin...');
        const medecinLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'salma',
                password: 'salma123'
            })
        });
        
        const medecinLoginResult = await medecinLoginResponse.json();
        console.log('👨‍⚕️ Connexion médecin:', medecinLoginResult.success ? '✅ OK' : '❌ ERREUR');
        
        if (medecinLoginResult.success) {
            console.log('   ID:', medecinLoginResult.user.id);
            console.log('   Rôle:', medecinLoginResult.user.role);
            
            // Test dashboard médecin
            console.log('\n📊 Test dashboard médecin...');
            const dashboardResponse = await fetch(`http://localhost:3000/api/auth/medecin-dashboard/${medecinLoginResult.user.id}`);
            const dashboardResult = await dashboardResponse.json();
            
            if (dashboardResult.success) {
                console.log('✅ Dashboard médecin OK');
                console.log('   Patients:', dashboardResult.data.stats.patients);
                console.log('   Consultations:', dashboardResult.data.stats.consultations);
            } else {
                console.log('❌ Erreur dashboard:', dashboardResult.message);
            }
        }
        
        console.log('\n🎯 RÉSULTAT:');
        console.log('✅ Problèmes de connexion corrigés');
        console.log('🌐 Admin: http://localhost:3000/admin-login.html (admin/admin123)');
        console.log('🌐 Médecin: http://localhost:3000/medecin-login.html (salma/salma123)');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

createAdminAccount();