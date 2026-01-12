const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');

// Créer une nouvelle consultation
router.post('/', async (req, res) => {
    try {
        console.log('📝 Création nouvelle consultation:', req.body);
        
        const { medecinId, patientId, date, motif, diagnostic, traitement, notes, statut } = req.body;
        
        // Validation des champs obligatoires
        if (!medecinId || !patientId || !date || !motif) {
            return res.status(400).json({
                success: false,
                message: 'Champs obligatoires manquants: medecinId, patientId, date, motif'
            });
        }
        
        const consultationData = {
            medecinId,
            patientId,
            date,
            motif,
            diagnostic: diagnostic || '',
            traitement: traitement || '',
            notes: notes || '',
            statut: statut || 'terminee'
        };
        
        const result = await Consultation.create(consultationData);
        
        console.log('✅ Consultation créée:', result.consultation.id);
        
        res.status(201).json({
            success: true,
            message: 'Consultation créée avec succès',
            data: result
        });
        
    } catch (error) {
        console.error('❌ Erreur création consultation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la consultation',
            error: error.message
        });
    }
});

// Obtenir toutes les consultations (pour admin)
router.get('/', async (req, res) => {
    try {
        console.log('📋 Récupération de toutes les consultations');
        
        const consultations = await Consultation.getAll();
        
        res.json({
            success: true,
            count: consultations.length,
            data: consultations
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération consultations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des consultations',
            error: error.message
        });
    }
});

// Obtenir les consultations d'un médecin
router.get('/medecin/:medecinId', async (req, res) => {
    try {
        const { medecinId } = req.params;
        console.log('👨‍⚕️ Récupération consultations médecin:', medecinId);
        
        const consultations = await Consultation.getByMedecin(medecinId);
        
        res.json({
            success: true,
            count: consultations.length,
            data: consultations
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération consultations médecin:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des consultations du médecin',
            error: error.message
        });
    }
});

// Obtenir les consultations d'un patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        console.log('👤 Récupération consultations patient:', patientId);
        
        const consultations = await Consultation.getByPatient(patientId);
        
        res.json({
            success: true,
            count: consultations.length,
            data: consultations
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération consultations patient:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des consultations du patient',
            error: error.message
        });
    }
});

// Obtenir une consultation par ID
router.get('/:consultationId', async (req, res) => {
    try {
        const { consultationId } = req.params;
        console.log('🔍 Récupération consultation:', consultationId);
        
        const consultation = await Consultation.getById(consultationId);
        
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
        console.error('❌ Erreur récupération consultation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la consultation',
            error: error.message
        });
    }
});

// Modifier une consultation
router.put('/:consultationId', async (req, res) => {
    try {
        const { consultationId } = req.params;
        const { date, motif, diagnostic, traitement, notes, statut } = req.body;
        
        console.log('✏️ Modification consultation:', consultationId);
        
        // Validation des champs obligatoires
        if (!date || !motif) {
            return res.status(400).json({
                success: false,
                message: 'Champs obligatoires manquants: date, motif'
            });
        }
        
        const updateData = {
            date,
            motif,
            diagnostic: diagnostic || '',
            traitement: traitement || '',
            notes: notes || '',
            statut: statut || 'terminee'
        };
        
        const result = await Consultation.update(consultationId, updateData);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Consultation non trouvée'
            });
        }
        
        console.log('✅ Consultation modifiée:', consultationId);
        
        res.json({
            success: true,
            message: 'Consultation modifiée avec succès',
            data: result
        });
        
    } catch (error) {
        console.error('❌ Erreur modification consultation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de la consultation',
            error: error.message
        });
    }
});

// Supprimer une consultation
router.delete('/:consultationId', async (req, res) => {
    try {
        const { consultationId } = req.params;
        console.log('🗑️ Suppression consultation:', consultationId);
        
        const deleted = await Consultation.delete(consultationId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Consultation non trouvée'
            });
        }
        
        console.log('✅ Consultation supprimée:', consultationId);
        
        res.json({
            success: true,
            message: 'Consultation supprimée avec succès'
        });
        
    } catch (error) {
        console.error('❌ Erreur suppression consultation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la consultation',
            error: error.message
        });
    }
});

// Obtenir les statistiques des consultations
router.get('/stats/general', async (req, res) => {
    try {
        console.log('📊 Récupération statistiques consultations');
        
        const stats = await Consultation.getStats();
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
});

module.exports = router;