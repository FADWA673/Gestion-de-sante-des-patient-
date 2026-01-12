const RendezVous = require('../models/RendezVous');

// Créer un rendez-vous
exports.createRendezVous = async (req, res) => {
  try {
    console.log('📅 Création RDV:', req.body);
    const rdv = await RendezVous.create(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Rendez-vous créé avec succès',
      data: rdv 
    });
  } catch (error) {
    console.error('❌ Erreur création RDV:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir tous les rendez-vous
exports.getAllRendezVous = async (req, res) => {
  try {
    const rdvs = await RendezVous.findAll();
    res.json({ 
      success: true, 
      count: rdvs.length,
      data: rdvs 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Par date
exports.getRendezVousByDate = async (req, res) => {
  try {
    const rdvs = await RendezVous.findByDate(req.params.date);
    res.json({ 
      success: true, 
      data: rdvs 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Par médecin
exports.getRendezVousByMedecin = async (req, res) => {
  try {
    const rdvs = await RendezVous.findByMedecin(req.params.medecinId);
    res.json({ 
      success: true, 
      data: rdvs 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Par mois
exports.getRendezVousByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const rdvs = await RendezVous.findByMonth(year, month);
    res.json({ 
      success: true, 
      data: rdvs 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mettre à jour le statut
exports.updateStatut = async (req, res) => {
  try {
    const rdv = await RendezVous.updateStatut(req.params.id, req.body.statut);
    if (!rdv) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rendez-vous non trouvé' 
      });
    }
    res.json({ 
      success: true, 
      data: rdv 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mettre à jour un rendez-vous complet
exports.updateRendezVous = async (req, res) => {
  try {
    const rdv = await RendezVous.update(req.params.id, req.body);
    if (!rdv) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rendez-vous non trouvé' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Rendez-vous modifié avec succès',
      data: rdv 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Supprimer
exports.deleteRendezVous = async (req, res) => {
  try {
    await RendezVous.delete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Rendez-vous supprimé' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};