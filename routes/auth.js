const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route de connexion
router.post('/login', authController.login);

// Route pour créer le premier admin (à utiliser UNE SEULE FOIS)
router.post('/setup-admin', authController.createFirstAdmin);

// Route pour vérifier si un admin existe
router.get('/check-admin', authController.checkAdmin);

// Routes pour la gestion des comptes (Admin uniquement)
router.post('/create-patient-account', authController.createPatientAccount);
router.post('/create-medecin-account', authController.createMedecinAccount);
router.get('/users', authController.getAllUsers);

// Routes pour créer des comptes pour des patients/médecins existants
router.post('/create-account-existing-patient', authController.createAccountForExistingPatient);
router.post('/create-account-existing-medecin', authController.createAccountForExistingMedecin);

// Routes pour obtenir les patients/médecins sans compte
router.get('/patients-without-account', authController.getPatientsWithoutAccount);
router.get('/medecins-without-account', authController.getMedecinsWithoutAccount);

// Routes pour les dashboards
router.get('/patient-dashboard/:userId', authController.getPatientDashboardData);
router.get('/medecin-dashboard/:userId', authController.getMedecinDashboardData);

// Route pour supprimer un utilisateur
router.delete('/users/:userId', authController.deleteUser);

// Routes pour la réinitialisation des mots de passe
router.post('/reset-password/:userId', authController.resetUserPassword);
router.post('/reset-all-passwords', authController.resetAllPasswords);

module.exports = router;