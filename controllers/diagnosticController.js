const Diagnostic = require('../models/Diagnostic');

// Créer un diagnostic
exports.createDiagnostic = async (req, res) => {
  try {
    console.log('📥 Données diagnostic reçues:', req.body);
    const diagnostic = await Diagnostic.create(req.body);
    console.log('✅ Diagnostic créé:', diagnostic);
    res.status(201).json({ 
      success: true, 
      message: 'Diagnostic créé avec succès',
      data: diagnostic 
    });
  } catch (error) {
    console.error('❌ Erreur création diagnostic:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du diagnostic',
      error: error.message 
    });
  }
};

// Obtenir tous les diagnostics
exports.getAllDiagnostics = async (req, res) => {
  try {
    const diagnostics = await Diagnostic.findAll();
    res.json({ 
      success: true, 
      count: diagnostics.length,
      data: diagnostics 
    });
  } catch (error) {
    console.error('❌ Erreur getAllDiagnostics:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir un diagnostic par ID
exports.getDiagnosticById = async (req, res) => {
  try {
    const diagnostic = await Diagnostic.findById(req.params.id);
    if (!diagnostic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Diagnostic non trouvé' 
      });
    }
    res.json({ 
      success: true, 
      data: diagnostic 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mettre à jour un diagnostic
exports.updateDiagnostic = async (req, res) => {
  try {
    const diagnostic = await Diagnostic.update(req.params.id, req.body);
    if (!diagnostic) {
      return res.status(404).json({ 
        success: false, 
        message: 'Diagnostic non trouvé' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Diagnostic mis à jour avec succès',
      data: diagnostic 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Supprimer un diagnostic
exports.deleteDiagnostic = async (req, res) => {
  try {
    await Diagnostic.delete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Diagnostic supprimé avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Rechercher des diagnostics
exports.searchDiagnostics = async (req, res) => {
  try {
    const term = req.query.term || '';
    const diagnostics = await Diagnostic.search(term);
    res.json({ 
      success: true, 
      count: diagnostics.length,
      data: diagnostics 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les diagnostics d'un patient
exports.getDiagnosticsByPatient = async (req, res) => {
  try {
    const diagnostics = await Diagnostic.getByPatient(req.params.patientId);
    res.json({ 
      success: true, 
      count: diagnostics.length,
      data: diagnostics 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir les diagnostics d'une consultation
exports.getDiagnosticsByConsultation = async (req, res) => {
  try {
    const diagnostics = await Diagnostic.getByConsultation(req.params.consultationId);
    res.json({ 
      success: true, 
      count: diagnostics.length,
      data: diagnostics 
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
    const stats = await Diagnostic.getStatistiques();
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