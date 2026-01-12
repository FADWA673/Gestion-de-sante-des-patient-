const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');

// Routes CRUD pour les consultations
router.post('/', consultationController.createConsultation);
router.get('/', consultationController.getAllConsultations);
router.get('/search', consultationController.searchConsultations);
router.get('/statistiques', consultationController.getStatistiques);
router.get('/patient/:patientId', consultationController.getConsultationsByPatient);
router.get('/medecin/:medecinId', consultationController.getConsultationsByMedecin);
router.get('/:id', consultationController.getConsultationById);
router.put('/:id', consultationController.updateConsultation);
router.delete('/:id', consultationController.deleteConsultation);

module.exports = router;