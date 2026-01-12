const express = require('express');
const router = express.Router();
const traitementController = require('../controllers/traitementController');

// Routes CRUD pour les traitements
router.post('/', traitementController.createTraitement);
router.get('/', traitementController.getAllTraitements);
router.get('/search', traitementController.searchTraitements);
router.get('/statistiques', traitementController.getStatistiques);
router.get('/actifs', traitementController.getTraitementsActifs);
router.get('/patient/:patientId', traitementController.getTraitementsByPatient);
router.get('/diagnostic/:diagnosticId', traitementController.getTraitementsByDiagnostic);
router.get('/:id', traitementController.getTraitementById);
router.put('/:id', traitementController.updateTraitement);
router.delete('/:id', traitementController.deleteTraitement);

module.exports = router;