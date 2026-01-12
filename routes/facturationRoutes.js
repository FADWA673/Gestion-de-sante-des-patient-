const express = require('express');
const router = express.Router();
const Facturation = require('../models/Facturation');

// 🧪 ROUTE DE TEST
router.post('/test', async (req, res) => {
  console.log('🧪 Route de test appelée');
  console.log('🧪 Body:', req.body);
  res.json({ 
    success: true, 
    message: 'Route de test fonctionne',
    body: req.body
  });
});

// ✅ CRÉER UNE NOUVELLE FACTURE
router.post('/', async (req, res) => {
  try {
    console.log('📝 === DÉBUT CRÉATION FACTURE (VERSION CORRIGÉE) ===');
    console.log('📝 Body reçu:', req.body);
    
    // Vérifier que consultationId est présent
    if (!req.body.consultationId) {
      console.log('❌ consultationId manquant');
      return res.status(400).json({ 
        success: false, 
        error: 'consultationId est requis' 
      });
    }
    
    // Utiliser le modèle Facturation pour créer la facture
    const factureData = await Facturation.create(req.body);
    
    console.log('✅ Facture créée avec succès via le modèle !');
    
    res.json({ 
      success: true, 
      data: factureData,
      message: 'Facture créée avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur création facture:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📋 RÉCUPÉRER TOUTES LES FACTURES
router.get('/', async (req, res) => {
  try {
    const factures = await Facturation.findAll();
    res.json({ 
      success: true, 
      data: factures 
    });
  } catch (error) {
    console.error('❌ Erreur récupération factures:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🔍 RÉCUPÉRER UNE FACTURE PAR ID
router.get('/:id', async (req, res) => {
  try {
    const facture = await Facturation.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ 
        success: false, 
        message: 'Facture non trouvée' 
      });
    }
    res.json({ 
      success: true, 
      data: facture 
    });
  } catch (error) {
    console.error('❌ Erreur récupération facture:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 👤 RÉCUPÉRER LES FACTURES D'UN PATIENT
router.get('/patient/:patientId', async (req, res) => {
  try {
    const factures = await Facturation.getByPatient(req.params.patientId);
    res.json({ 
      success: true, 
      data: factures 
    });
  } catch (error) {
    console.error('❌ Erreur récupération factures patient:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 💰 ENREGISTRER UN PAIEMENT PARTIEL (NOUVELLE ROUTE)
router.post('/:id/paiement', async (req, res) => {
  try {
    const { montant, methodePaiement } = req.body;
    
    if (!montant || !methodePaiement) {
      return res.status(400).json({ 
        success: false, 
        message: 'Montant et méthode de paiement requis' 
      });
    }
    
    console.log(`💳 Enregistrement paiement - Facture: ${req.params.id}, Montant: ${montant} DH, Méthode: ${methodePaiement}`);
    
    const facture = await Facturation.enregistrerPaiementV2(
      req.params.id, 
      montant, 
      methodePaiement
    );
    
    res.json({ 
      success: true, 
      data: facture,
      message: `Paiement de ${montant} DH enregistré avec succès`
    });
  } catch (error) {
    console.error('❌ Erreur enregistrement paiement:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🔄 METTRE À JOUR LE STATUT D'UNE FACTURE
router.put('/:id/statut', async (req, res) => {
  try {
    const facture = await Facturation.updateStatut(req.params.id, req.body);
    if (!facture) {
      return res.status(404).json({ 
        success: false, 
        message: 'Facture non trouvée' 
      });
    }
    res.json({ 
      success: true, 
      data: facture,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🔄 METTRE À JOUR UNE FACTURE
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 === DÉBUT MODIFICATION FACTURE ===');
    console.log('📝 ID facture:', req.params.id);
    console.log('📝 Body reçu:', req.body);
    
    // Vérifier que l'ID est présent
    if (!req.params.id) {
      console.log('❌ ID facture manquant');
      return res.status(400).json({ 
        success: false, 
        error: 'ID facture requis' 
      });
    }
    
    // Vérifier que consultationId est présent
    if (!req.body.consultationId) {
      console.log('❌ consultationId manquant');
      return res.status(400).json({ 
        success: false, 
        error: 'consultationId est requis' 
      });
    }
    
    console.log('✅ Données valides, appel du modèle pour modification...');
    const facture = await Facturation.updateV2(req.params.id, req.body);
    console.log('✅ Facture modifiée par le modèle:', facture);
    
    res.json({ 
      success: true, 
      data: facture,
      message: 'Facture modifiée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur modification facture:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📊 OBTENIR LES STATISTIQUES FINANCIÈRES
router.get('/stats/financieres', async (req, res) => {
  try {
    const stats = await Facturation.getStatistiques();
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📄 OBTENIR L'HISTORIQUE DES PAIEMENTS D'UNE FACTURE
router.get('/:id/historique', async (req, res) => {
  try {
    const historique = await Facturation.getHistoriquePaiements(req.params.id);
    res.json({ 
      success: true, 
      data: historique 
    });
  } catch (error) {
    console.error('❌ Erreur récupération historique:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 💰 MARQUER UNE FACTURE COMME PAYÉE
router.put('/:id/payer', async (req, res) => {
  try {
    console.log('💰 Marquer facture comme payée:', req.params.id);
    
    const facture = await Facturation.updateStatut(req.params.id, {
      statut: 'Payée',
      datePaiement: new Date().toISOString()
    });
    
    if (!facture) {
      return res.status(404).json({ 
        success: false, 
        message: 'Facture non trouvée' 
      });
    }
    
    res.json({ 
      success: true, 
      data: facture,
      message: 'Facture marquée comme payée'
    });
  } catch (error) {
    console.error('❌ Erreur marquer payée:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📧 ENVOYER UNE FACTURE PAR EMAIL
router.post('/:id/email', async (req, res) => {
  try {
    console.log('📧 Envoi email facture:', req.params.id);
    
    // Pour l'instant, simuler l'envoi d'email
    // Dans une vraie application, vous intégreriez un service d'email
    
    const facture = await Facturation.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ 
        success: false, 
        message: 'Facture non trouvée' 
      });
    }
    
    // Simuler l'envoi d'email
    console.log('📧 Email simulé envoyé pour facture:', req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Email envoyé avec succès (simulé)'
    });
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📋 DUPLIQUER UNE FACTURE
router.post('/:id/dupliquer', async (req, res) => {
  try {
    console.log('📋 Duplication facture:', req.params.id);
    
    const factureOriginale = await Facturation.findById(req.params.id);
    if (!factureOriginale) {
      return res.status(404).json({ 
        success: false, 
        message: 'Facture originale non trouvée' 
      });
    }
    
    // Créer une copie de la facture avec un nouveau numéro
    const nouvelleFacture = {
      consultationId: factureOriginale.facture.consultationId,
      montant: factureOriginale.facture.montantTotal || factureOriginale.facture.montant,
      methodePaiement: factureOriginale.facture.methodePaiement,
      detailsPaiement: factureOriginale.facture.detailsPaiement,
      statut: 'En attente' // Nouvelle facture en attente
    };
    
    const factureDupliquee = await Facturation.create(nouvelleFacture);
    
    res.json({ 
      success: true, 
      data: factureDupliquee,
      message: 'Facture dupliquée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur duplication facture:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 🗑️ SUPPRIMER UNE FACTURE
router.delete('/:id', async (req, res) => {
  try {
    await Facturation.delete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Facture supprimée avec succès' 
    });
  } catch (error) {
    console.error('❌ Erreur suppression facture:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📄 EXPORTER UNE FACTURE EN PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    console.log('📄 Export PDF facture:', req.params.id);
    
    const facture = await Facturation.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ 
        success: false, 
        message: 'Facture non trouvée' 
      });
    }
    
    // Retourner les données pour génération PDF côté client
    res.json({ 
      success: true, 
      data: facture,
      message: 'Données facture récupérées pour PDF'
    });
  } catch (error) {
    console.error('❌ Erreur export PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 📋 OBTENIR LES OPTIONS (STATUTS ET MÉTHODES DE PAIEMENT)
router.get('/options/liste', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        statuts: Facturation.STATUTS_FACTURE,
        methodesPaiement: Facturation.METHODES_PAIEMENT
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération options:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;