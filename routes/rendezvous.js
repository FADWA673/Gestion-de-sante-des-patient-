const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');

router.post('/', rendezVousController.createRendezVous);
router.get('/', rendezVousController.getAllRendezVous);
router.get('/date/:date', rendezVousController.getRendezVousByDate);
router.get('/medecin/:medecinId', rendezVousController.getRendezVousByMedecin);
router.get('/month/:year/:month', rendezVousController.getRendezVousByMonth);
router.put('/:id', rendezVousController.updateRendezVous);
router.put('/:id/statut', rendezVousController.updateStatut);
router.delete('/:id', rendezVousController.deleteRendezVous);

module.exports = router;