const Traitement = require('../models/Traitement');

// Créer un traitement
exports.createTraitement = async (req, res) => {
  try {
    console.log('📥 Données traitement reçues:', req.body);
    const traitement = await Traitement.create(req.body);
    console.log('✅ Traitement créé:', traitement);
    res.status(201).json({ 
      success: true, 
      message: 'Traitement créé avec succès',
      data: traitement 
    });
  } catch (error) {
    console.error('❌ Erreur création traitement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du traitement',
      error: error.message 
    });
  }
};

// Obtenir tous les traitements
exports.getAllTraitements = async (req, res) => {
  try {
    const traitements = await Traitement.findAll();
    res.json({ 
      success: true, 
      count: traitements.length,
      data: traitements 
    });
  } catch (error) {
    console.error('❌ Erreur getAllTraitements:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir un traitement par ID
exports.getTraitementById = async (req, res) => {
  try {
    const traitement = await Traitement.findById(req.params.id);
    if (!traitement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Traitement non trouvé' 
      });
    }
    res.json({ 
      success: true, 
      data: traitement 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mettre à jour un traitement
exports.updateTraitement = async (req, res) => {
  try {
    const traitement = await Traitement.update(req.params.id, req.body);
    if (!traitement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Traitement non trouvé' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Traitement mis à jour avec succès',
      data: traitement 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Supprimer un traitement
exports.deleteTraitement = async (req, res) => {
  try {
    await Traitement.delete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Traitement supprimé avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Rechercher des traitements
exports.searchTraitements = async (req, res) => {
  try {
    const term = req.query.term || '';
    const traitements = await Traitement.search(term);
    res.json({ 
      success: true, 
      count: traitements.length,
      data: traitements 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les traitements d'un patient
exports.getTraitementsByPatient = async (req, res) => {
  try {
    const traitements = await Traitement.getByPatient(req.params.patientId);
    res.json({ 
      success: true, 
      count: traitements.length,
      data: traitements 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les traitements d'un diagnostic
exports.getTraitementsByDiagnostic = async (req, res) => {
  try {
    const traitements = await Traitement.getByDiagnostic(req.params.diagnosticId);
    res.json({ 
      success: true, 
      count: traitements.length,
      data: traitements 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les traitements actifs
exports.getTraitementsActifs = async (req, res) => {
  try {
    const traitements = await Traitement.getActifs();
    res.json({ 
      success: true, 
      count: traitements.length,
      data: traitements 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les statistiques
exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Traitement.getStatistiques();
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};