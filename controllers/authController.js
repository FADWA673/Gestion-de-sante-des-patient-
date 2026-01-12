const Utilisateur = require('../models/Utilisateur');

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Tentative de connexion:', username);
    
    const user = await Utilisateur.login(username, password);
    
    if (!user) {
      console.log('❌ Échec connexion: identifiants incorrects');
      return res.status(401).json({ 
        success: false, 
        message: 'Nom d\'utilisateur ou mot de passe incorrect' 
      });
    }
    
    // Obtenir les données complètes selon le rôle
    const fullUserData = await Utilisateur.getFullUserData(user.id);
    
    console.log('✅ Connexion réussie:', user.username, '- Rôle:', user.role);
    
    res.json({ 
      success: true, 
      message: 'Connexion réussie',
      data: fullUserData || user,
      role: user.role
    });
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// Créer le premier admin (UNIQUEMENT si aucun admin n'existe)
exports.createFirstAdmin = async (req, res) => {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await Utilisateur.adminExists();
    
    if (adminExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Un administrateur existe déjà' 
      });
    }
    
    // Créer le premier admin
    const adminData = {
      username: 'admin',
      password: 'admin123',
      nom: 'Administrateur',
      prenom: 'Système',
      email: 'admin@sgsp.ma',
      role: 'admin'
    };
    
    const user = await Utilisateur.create(adminData);
    
    console.log('✅ Premier admin créé:', user.username);
    
    res.json({ 
      success: true, 
      message: 'Premier administrateur créé avec succès',
      data: user 
    });
  } catch (error) {
    console.error('❌ Erreur createFirstAdmin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de l\'administrateur',
      error: error.message 
    });
  }
};

// Vérifier si un admin existe
exports.checkAdmin = async (req, res) => {
  try {
    const adminExists = await Utilisateur.adminExists();
    res.json({ 
      success: true, 
      adminExists 
    });
  } catch (error) {
    console.error('❌ Erreur checkAdmin:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Créer un compte patient (Admin uniquement)
exports.createPatientAccount = async (req, res) => {
  try {
    const result = await Utilisateur.createPatientAccount(req.body);
    
    console.log('✅ Compte patient créé:', result.user.username);
    
    res.status(201).json({ 
      success: true, 
      message: 'Compte patient créé avec succès',
      data: result 
    });
  } catch (error) {
    console.error('❌ Erreur création compte patient:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du compte patient',
      error: error.message 
    });
  }
};

// Créer un compte médecin (Admin uniquement)
exports.createMedecinAccount = async (req, res) => {
  try {
    const result = await Utilisateur.createMedecinAccount(req.body);
    
    console.log('✅ Compte médecin créé:', result.user.username);
    
    res.status(201).json({ 
      success: true, 
      message: 'Compte médecin créé avec succès',
      data: result 
    });
  } catch (error) {
    console.error('❌ Erreur création compte médecin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du compte médecin',
      error: error.message 
    });
  }
};

// Créer un compte pour un patient existant (Admin uniquement)
exports.createAccountForExistingPatient = async (req, res) => {
  try {
    const { patientId, username, password } = req.body;
    
    const result = await Utilisateur.createAccountForExistingPatient(patientId, {
      username,
      password
    });
    
    console.log('✅ Compte créé pour patient existant:', result.user.username);
    
    res.status(201).json({ 
      success: true, 
      message: 'Compte créé pour le patient existant',
      data: result 
    });
  } catch (error) {
    console.error('❌ Erreur création compte patient existant:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du compte',
      error: error.message 
    });
  }
};

// Créer un compte pour un médecin existant (Admin uniquement)
exports.createAccountForExistingMedecin = async (req, res) => {
  try {
    const { medecinId, username, password } = req.body;
    
    const result = await Utilisateur.createAccountForExistingMedecin(medecinId, {
      username,
      password
    });
    
    console.log('✅ Compte créé pour médecin existant:', result.user.username);
    
    res.status(201).json({ 
      success: true, 
      message: 'Compte créé pour le médecin existant',
      data: result 
    });
  } catch (error) {
    console.error('❌ Erreur création compte médecin existant:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du compte',
      error: error.message 
    });
  }
};

// Obtenir les patients sans compte
exports.getPatientsWithoutAccount = async (req, res) => {
  try {
    const patients = await Utilisateur.getPatientsWithoutAccount();
    res.json({ 
      success: true, 
      count: patients.length,
      data: patients 
    });
  } catch (error) {
    console.error('❌ Erreur getPatientsWithoutAccount:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les médecins sans compte
exports.getMedecinsWithoutAccount = async (req, res) => {
  try {
    const medecins = await Utilisateur.getMedecinsWithoutAccount();
    res.json({ 
      success: true, 
      count: medecins.length,
      data: medecins 
    });
  } catch (error) {
    console.error('❌ Erreur getMedecinsWithoutAccount:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir tous les utilisateurs (Admin uniquement)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Utilisateur.findAll();
    res.json({ 
      success: true, 
      count: users.length,
      data: users 
    });
  } catch (error) {
    console.error('❌ Erreur getAllUsers:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les données du dashboard patient
exports.getPatientDashboardData = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Obtenir les données complètes de l'utilisateur
    const userData = await Utilisateur.getFullUserData(userId);
    if (!userData || !userData.patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient non trouvé' 
      });
    }

    const patientId = userData.patient.id;
    
    // Obtenir les consultations du patient
    const Consultation = require('../models/Consultation');
    const consultations = await Consultation.getByPatient(patientId);
    
    // Obtenir les traitements du patient
    const Traitement = require('../models/Traitement');
    let traitements = [];
    try {
      traitements = await Traitement.getByPatient(patientId);
    } catch (error) {
      console.error('❌ Erreur récupération traitements:', error);
      traitements = [];
    }
    
    // Obtenir les rendez-vous du patient depuis Neo4j
    const driver = require('../config/database');
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    
    let rendezVous = [];
    
    try {
      // Récupérer les rendez-vous
      const rdvResult = await session.run(
        `MATCH (p:Patient {id: $patientId})-[:A_RDV]->(r:RendezVous)
         OPTIONAL MATCH (r)<-[:CONSULTE]-(m:Medecin)
         RETURN r, m
         ORDER BY r.date DESC`,
        { patientId }
      );
      
      rendezVous = rdvResult.records.map(record => {
        const rdv = record.get('r') ? record.get('r').properties : {};
        const medecin = record.get('m') ? record.get('m').properties : null;
        return {
          ...rdv,
          medecin: medecin
        };
      });
      
    } catch (error) {
      console.error('❌ Erreur Neo4j rendez-vous:', error);
    } finally {
      await session.close();
    }
    
    res.json({
      success: true,
      data: {
        patient: userData.patient,
        user: userData.user,
        stats: {
          consultations: consultations.length,
          rendezVous: rendezVous.length,
          traitements: traitements.length
        },
        consultations: consultations.slice(0, 5), // 5 dernières consultations
        rendezVous: rendezVous.slice(0, 3), // 3 prochains RDV
        traitements: traitements // Traitements complets avec toutes les informations
      }
    });
  } catch (error) {
    console.error('❌ Erreur getPatientDashboardData:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les données du dashboard médecin
exports.getMedecinDashboardData = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Obtenir les données complètes de l'utilisateur
    const userData = await Utilisateur.getFullUserData(userId);
    if (!userData || !userData.medecin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Médecin non trouvé' 
      });
    }

    const medecinId = userData.medecin.id;
    
    // Obtenir les consultations du médecin
    const Consultation = require('../models/Consultation');
    const consultations = await Consultation.getByMedecin(medecinId);
    
    // Obtenir TOUS les patients disponibles (pas seulement ceux avec consultations)
    const Patient = require('../models/Patient');
    const tousLesPatients = await Patient.findAll();
    
    // Obtenir les patients uniques du médecin (depuis les consultations)
    const patientsUniques = [...new Set(consultations.map(c => c.patient.id))];
    
    // Utiliser tous les patients comme patients récents si pas de consultations
    const patientsRecents = consultations.length > 0 
      ? consultations.slice(0, 5).map(c => c.patient)
      : tousLesPatients.slice(0, 5);
    
    // Obtenir les rendez-vous du médecin depuis Neo4j
    const driver = require('../config/database');
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    
    let rendezVous = [];
    let prescriptions = [];
    
    try {
      // Récupérer les rendez-vous du médecin
      const rdvResult = await session.run(
        `MATCH (m:Medecin {id: $medecinId})-[:CONSULTE]->(r:RendezVous)
         OPTIONAL MATCH (r)<-[:A_RDV]-(p:Patient)
         RETURN r, p
         ORDER BY r.date DESC`,
        { medecinId }
      );
      
      rendezVous = rdvResult.records.map(record => {
        const rdv = record.get('r') ? record.get('r').properties : {};
        const patient = record.get('p') ? record.get('p').properties : null;
        return {
          ...rdv,
          patient: patient
        };
      });
      
      // Récupérer les prescriptions/traitements du médecin
      const prescriptionResult = await session.run(
        `MATCH (m:Medecin {id: $medecinId})-[:A_PRESCRIT]->(t:Traitement)
         RETURN t
         ORDER BY t.dateDebut DESC`,
        { medecinId }
      );
      
      prescriptions = prescriptionResult.records.map(record => 
        record.get('t').properties
      );
      
    } catch (error) {
      console.error('Erreur Neo4j:', error);
    } finally {
      await session.close();
    }
    
    // Calculer les RDV d'aujourd'hui
    const today = new Date().toDateString();
    const rdvToday = rendezVous.filter(rdv => 
      new Date(rdv.date).toDateString() === today
    ).length;
    
    res.json({
      success: true,
      data: {
        medecin: userData.medecin,
        user: userData.user,
        stats: {
          patients: Math.max(patientsUniques.length, tousLesPatients.length),
          consultations: consultations.length,
          rendezVousToday: rdvToday,
          prescriptions: prescriptions.length
        },
        consultations: consultations.slice(0, 5), // 5 dernières consultations
        rendezVous: rendezVous.slice(0, 3), // 3 prochains RDV
        patientsRecents: patientsRecents
      }
    });
  } catch (error) {
    console.error('❌ Erreur getMedecinDashboardData:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Supprimer un utilisateur (Admin uniquement)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🗑️ Tentative de suppression utilisateur ID:', userId);
    
    // Vérifier que l'utilisateur existe et obtenir ses informations
    const user = await Utilisateur.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Empêcher la suppression des administrateurs
    if (user.role === 'admin') {
      console.log('❌ Tentative de suppression d\'un admin bloquée');
      return res.status(403).json({ 
        success: false, 
        message: 'Impossible de supprimer un administrateur' 
      });
    }
    
    console.log('👤 Suppression de l\'utilisateur:', user.username, '- Rôle:', user.role);
    
    // Supprimer l'utilisateur
    await Utilisateur.delete(userId);
    
    console.log('✅ Utilisateur supprimé avec succès:', user.username);
    
    res.json({ 
      success: true, 
      message: `Utilisateur ${user.prenom} ${user.nom} supprimé avec succès` 
    });
  } catch (error) {
    console.error('❌ Erreur deleteUser:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message 
    });
  }
};
// Réinitialiser le mot de passe d'un utilisateur (Admin uniquement)
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    console.log('🔐 Tentative de réinitialisation mot de passe pour utilisateur ID:', userId);
    
    // Vérifier que l'utilisateur existe
    const user = await Utilisateur.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Valider le nouveau mot de passe
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }
    
    console.log('🔄 Réinitialisation du mot de passe pour:', user.username, '- Rôle:', user.role);
    
    // Réinitialiser le mot de passe
    await Utilisateur.updatePassword(userId, newPassword);
    
    console.log('✅ Mot de passe réinitialisé avec succès pour:', user.username);
    
    res.json({ 
      success: true, 
      message: `Mot de passe réinitialisé pour ${user.prenom} ${user.nom}`,
      data: {
        userId: userId,
        username: user.username,
        newPassword: newPassword
      }
    });
  } catch (error) {
    console.error('❌ Erreur resetUserPassword:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la réinitialisation du mot de passe',
      error: error.message 
    });
  }
};

// Réinitialiser tous les mots de passe (Admin uniquement)
exports.resetAllPasswords = async (req, res) => {
  try {
    const { passwords } = req.body; // Array d'objets {userId, newPassword}
    
    console.log('🔐 Tentative de réinitialisation globale des mots de passe');
    
    if (!passwords || !Array.isArray(passwords) || passwords.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun mot de passe fourni' 
      });
    }
    
    const results = [];
    const errors = [];
    
    for (const { userId, newPassword } of passwords) {
      try {
        // Vérifier que l'utilisateur existe
        const user = await Utilisateur.findById(userId);
        if (!user) {
          errors.push({ userId, error: 'Utilisateur non trouvé' });
          continue;
        }
        
        // Valider le nouveau mot de passe
        if (!newPassword || newPassword.length < 6) {
          errors.push({ userId, error: 'Mot de passe trop court' });
          continue;
        }
        
        // Réinitialiser le mot de passe
        await Utilisateur.updatePassword(userId, newPassword);
        
        results.push({
          userId: userId,
          username: user.username,
          name: `${user.prenom} ${user.nom}`,
          newPassword: newPassword,
          success: true
        });
        
        console.log('✅ Mot de passe réinitialisé pour:', user.username);
        
      } catch (error) {
        console.error('❌ Erreur pour utilisateur', userId, ':', error);
        errors.push({ userId, error: error.message });
      }
    }
    
    console.log(`🔐 Réinitialisation globale terminée: ${results.length} succès, ${errors.length} erreurs`);
    
    res.json({ 
      success: true, 
      message: `${results.length} mots de passe réinitialisés avec succès`,
      data: {
        successful: results,
        errors: errors,
        totalProcessed: passwords.length,
        successCount: results.length,
        errorCount: errors.length
      }
    });
  } catch (error) {
    console.error('❌ Erreur resetAllPasswords:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la réinitialisation globale',
      error: error.message 
    });
  }
};