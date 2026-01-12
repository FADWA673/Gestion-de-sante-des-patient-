const Consultation = require('../models/Consultation');

// Créer une consultation
exports.createConsultation = async (req, res) => {
  try {
    console.log('📥 Données consultation reçues:', req.body);
    const consultation = await Consultation.create(req.body);
    console.log('✅ Consultation créée:', consultation);
    res.status(201).json({ 
      success: true, 
      message: 'Consultation créée avec succès',
      data: consultation 
    });
  } catch (error) {
    console.error('❌ Erreur création consultation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de la consultation',
      error: error.message 
    });
  }
};

// Obtenir toutes les consultations
exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.findAll();
    res.json({ 
      success: true, 
      count: consultations.length,
      data: consultations 
    });
  } catch (error) {
    console.error('❌ Erreur getAllConsultations:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Obtenir une consultation par ID
exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation non trouvée' 
      });
    }
    res.json({ 
      success: true, 
      data: consultation 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mettre à jour une consultation
exports.updateConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.update(req.params.id, req.body);
    if (!consultation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation non trouvée' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Consultation mise à jour avec succès',
      data: consultation 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Supprimer une consultation
exports.deleteConsultation = async (req, res) => {
  try {
    await Consultation.delete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Consultation supprimée avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Rechercher des consultations
exports.searchConsultations = async (req, res) => {
  try {
    const term = req.query.term || '';
    const consultations = await Consultation.search(term);
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

// Obtenir les consultations d'un patient
exports.getConsultationsByPatient = async (req, res) => {
  try {
    const consultations = await Consultation.getByPatient(req.params.patientId);
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

// Obtenir les consultations d'un médecin
exports.getConsultationsByMedecin = async (req, res) => {
  try {
    const consultations = await Consultation.getByMedecin(req.params.medecinId);
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

// Obtenir les statistiques
exports.getStatistiques = async (req, res) => {
  try {
    const stats = await Consultation.getStatistiques();
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