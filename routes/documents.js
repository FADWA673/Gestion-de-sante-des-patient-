const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// Ordonnance
router.get('/ordonnance/:consultationId', documentController.generateOrdonnance);

// Certificat médical
router.post('/certificat', documentController.generateCertificat);

// Rapport de consultation
router.get('/rapport/:consultationId', documentController.generateRapportConsultation);

// Historique médical complet
router.get('/historique/:patientId', documentController.generateHistoriqueMedical);

module.exports = router;