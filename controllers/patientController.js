const Patient = require('../models/patient'); // ← Tout en minuscule

exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient non trouvé' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.update(req.params.id, req.body);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient non trouvé' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    await Patient.delete(req.params.id);
    res.json({ success: true, message: 'Patient supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchPatients = async (req, res) => {
  try {
    const patients = await Patient.search(req.query.term);
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};