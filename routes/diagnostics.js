const express = require('express');
const router = express.Router();
const diagnosticController = require('../controllers/diagnosticController');

// Routes CRUD pour les diagnostics
router.post('/', diagnosticController.createDiagnostic);
router.get('/', diagnosticController.getAllDiagnostics);
router.get('/search', diagnosticController.searchDiagnostics);
router.get('/statistiques', diagnosticController.getStatistiques);
router.get('/patient/:patientId', diagnosticController.getDiagnosticsByPatient);
router.get('/consultation/:consultationId', diagnosticController.getDiagnosticsByConsultation);
router.get('/:id', diagnosticController.getDiagnosticById);
router.put('/:id', diagnosticController.updateDiagnostic);
router.delete('/:id', diagnosticController.deleteDiagnostic);

module.exports = router;