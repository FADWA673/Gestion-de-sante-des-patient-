const Medecin = require('../models/Medecin');

// Créer un médecin
exports.createMedecin = async (req, res) => {
  try {
    console.log('📥 Données reçues:', req.body); // Pour déboguer
    const medecin = await Medecin.create(req.body);
       console.log('✅ Médecin créé dans Neo4j:', medecin); 
    res.status(201).json({ 
      success: true, 
      message: 'Médecin créé avec succès',
      data: medecin 
    });
  } catch (error) {
    console.error('❌ Erreur création médecin:', error); // Pour déboguer
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du médecin',
      error: error.message 
    });
  }
};

// Obtenir tous les médecins
exports.getAllMedecins = async (req, res) => {
  try {
    const medecins = await Medecin.findAll();
    res.json({ 
      success: true, 
      count: medecins.length,
      data: medecins 
    });
  } catch (error) {
    console.error('❌ Erreur getAllMedecins:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir un médecin par ID
exports.getMedecinById = async (req, res) => {
  try {
    const medecin = await Medecin.findById(req.params.id);
    if (!medecin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Médecin non trouvé' 
      });
    }
    res.json({ 
      success: true, 
      data: medecin 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mettre à jour un médecin
exports.updateMedecin = async (req, res) => {
  try {
    const medecin = await Medecin.update(req.params.id, req.body);
    if (!medecin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Médecin non trouvé' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Médecin mis à jour avec succès',
      data: medecin 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Supprimer un médecin
exports.deleteMedecin = async (req, res) => {
  try {
    await Medecin.delete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Médecin supprimé avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Rechercher des médecins
exports.searchMedecins = async (req, res) => {
  try {
    const term = req.query.term || '';
    const medecins = await Medecin.search(term);
    res.json({ 
      success: true, 
      count: medecins.length,
      data: medecins 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les consultations d'un médecin
exports.getConsultations = async (req, res) => {
  try {
    const consultations = await Medecin.getConsultations(req.params.id);
    res.json({ 
      success: true, 
      count: consultations.length,
      data: consultations 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les statistiques d'un médecin
exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Medecin.getStatistiques(req.params.id);
    if (!stats) {
      return res.status(404).json({ 
        success: false, 
        message: 'Médecin non trouvé' 
      });
    }
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