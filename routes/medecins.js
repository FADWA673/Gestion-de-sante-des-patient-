const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');

// Routes CRUD pour les médecins
router.post('/', medecinController.createMedecin);
router.get('/', medecinController.getAllMedecins);
router.get('/search', medecinController.searchMedecins);
router.get('/:id', medecinController.getMedecinById);
router.get('/:id/consultations', medecinController.getConsultations);
router.get('/:id/statistiques', medecinController.getStatistiques);
router.put('/:id', medecinController.updateMedecin);
router.delete('/:id', medecinController.deleteMedecin);

module.exports = router;