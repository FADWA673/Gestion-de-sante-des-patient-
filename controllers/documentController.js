const PDFDocument = require('pdfkit');
const Patient = require('../models/patient');
const Medecin = require('../models/Medecin');
const Consultation = require('../models/Consultation');
const Diagnostic = require('../models/Diagnostic');
const Traitement = require('../models/Traitement');

// 📝 ORDONNANCE PDF
exports.generateOrdonnance = async (req, res) => {
  try {
    const { consultationId } = req.params;
    
    // Récupérer les données
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    }

    // Créer le PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ordonnance_${consultationId}.pdf`);
    
    doc.pipe(res);

    // En-tête
    doc.fontSize(20).font('Helvetica-Bold').text('ORDONNANCE MÉDICALE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text('Centre Hospitalier SGSP', { align: 'center' });
    doc.text('123 Avenue de la Santé, Casablanca', { align: 'center' });
    doc.text('Tél: +212 5XX-XXXXXX', { align: 'center' });
    doc.moveDown(2);

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Informations Médecin
    doc.fontSize(12).font('Helvetica-Bold').text('Médecin Prescripteur');
    doc.fontSize(10).font('Helvetica')
       .text(`Dr. ${consultation.medecin.nom} ${consultation.medecin.prenom}`)
       .text(`Spécialité: ${consultation.medecin.specialite}`)
       .text(`N° Ordre: ${consultation.medecin.numeroOrdre}`)
       .moveDown();

    // Informations Patient
    doc.fontSize(12).font('Helvetica-Bold').text('Patient');
    doc.fontSize(10).font('Helvetica')
       .text(`Nom: ${consultation.patient.nom} ${consultation.patient.prenom}`)
       .text(`Date de naissance: ${new Date(consultation.patient.dateNaissance).toLocaleDateString('fr-FR')}`)
       .text(`N° Sécurité Sociale: ${consultation.patient.numeroSecuriteSociale || 'N/A'}`)
       .moveDown();

    // Date de consultation
    doc.fontSize(10).text(`Date de consultation: ${new Date(consultation.consultation.date).toLocaleDateString('fr-FR')}`)
       .moveDown();

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Diagnostic
    if (consultation.consultation.diagnostic) {
      doc.fontSize(12).font('Helvetica-Bold').text('Diagnostic');
      doc.fontSize(10).font('Helvetica').text(consultation.consultation.diagnostic);
      doc.moveDown();
    }

    // Traitement prescrit
    doc.fontSize(12).font('Helvetica-Bold').text('Traitement Prescrit');
    doc.moveDown(0.5);
    
    if (consultation.consultation.traitement) {
      const traitements = consultation.consultation.traitement.split('\n');
      traitements.forEach((t, index) => {
        doc.fontSize(10).font('Helvetica').text(`${index + 1}. ${t}`);
      });
    } else {
      doc.fontSize(10).font('Helvetica').text('Aucun traitement prescrit');
    }
    
    doc.moveDown(2);

    // Notes supplémentaires
    if (consultation.consultation.notes) {
      doc.fontSize(11).font('Helvetica-Bold').text('Recommandations');
      doc.fontSize(10).font('Helvetica').text(consultation.consultation.notes);
      doc.moveDown();
    }

    // Signature
    doc.moveDown(3);
    doc.fontSize(10).font('Helvetica-Oblique')
       .text('Fait à Casablanca, le ' + new Date().toLocaleDateString('fr-FR'), { align: 'right' })
       .moveDown()
       .text('Signature et cachet du médecin', { align: 'right' });

    // Pied de page
    doc.fontSize(8).font('Helvetica')
       .text('Document généré par SGSP - Système de Gestion de Santé des Patients', 50, 750, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('❌ Erreur génération ordonnance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📋 CERTIFICAT MÉDICAL
exports.generateCertificat = async (req, res) => {
  try {
    const { consultationId, motif, duree } = req.body;
    
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificat_${consultationId}.pdf`);
    
    doc.pipe(res);

    // En-tête
    doc.fontSize(22).font('Helvetica-Bold').text('CERTIFICAT MÉDICAL', { align: 'center' });
    doc.moveDown(2);

    // Ligne décorative
    doc.moveTo(50, doc.y).lineTo(550, doc.y).lineWidth(2).stroke();
    doc.moveDown(2);

    // Corps du certificat
    doc.fontSize(12).font('Helvetica')
       .text('Je soussigné(e),', { indent: 50 })
       .moveDown(0.5)
       .font('Helvetica-Bold')
       .text(`Dr. ${consultation.medecin.nom} ${consultation.medecin.prenom}`, { indent: 50 })
       .font('Helvetica')
       .text(`${consultation.medecin.specialite}`, { indent: 50 })
       .text(`Numéro d'ordre: ${consultation.medecin.numeroOrdre}`, { indent: 50 })
       .moveDown(1.5)
       .text('Certifie avoir examiné ce jour:', { indent: 50 })
       .moveDown(0.5)
       .font('Helvetica-Bold')
       .text(`M./Mme ${consultation.patient.nom} ${consultation.patient.prenom}`, { indent: 50 })
       .font('Helvetica')
       .text(`Né(e) le: ${new Date(consultation.patient.dateNaissance).toLocaleDateString('fr-FR')}`, { indent: 50 });

    if (consultation.patient.numeroSecuriteSociale) {
      doc.text(`N° Sécurité Sociale: ${consultation.patient.numeroSecuriteSociale}`, { indent: 50 });
    }

    doc.moveDown(1.5);

    // Motif du certificat
    if (motif) {
      doc.fontSize(12).font('Helvetica')
         .text(`Et atteste que l'état de santé de l'intéressé(e) nécessite ${motif}.`, { 
           indent: 50, 
           align: 'justify' 
         });
    }

    // Durée
    if (duree) {
      doc.moveDown(1)
         .text(`Durée: ${duree}`, { indent: 50, font: 'Helvetica-Bold' });
    }

    doc.moveDown(2);

    // Date et signature
    doc.fontSize(11).font('Helvetica')
       .text(`Fait à Casablanca, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' })
       .moveDown(2)
       .font('Helvetica-Oblique')
       .text('Signature et cachet du médecin', { align: 'right' });

    // Pied de page
    doc.fontSize(8).font('Helvetica')
       .text('Centre Hospitalier SGSP - 123 Avenue de la Santé, Casablanca', 50, 750, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('❌ Erreur génération certificat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 📊 RAPPORT DE CONSULTATION
exports.generateRapportConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_consultation_${consultationId}.pdf`);
    
    doc.pipe(res);

    // En-tête
    doc.fontSize(20).font('Helvetica-Bold').text('RAPPORT DE CONSULTATION', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica')
       .text('Centre Hospitalier SGSP', { align: 'center' })
       .text('123 Avenue de la Santé, Casablanca', { align: 'center' })
       .moveDown(2);

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    // Informations de la consultation
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMATIONS GÉNÉRALES');
    doc.fontSize(10).font('Helvetica')
       .text(`Date: ${new Date(consultation.consultation.date).toLocaleDateString('fr-FR', { 
         weekday: 'long', 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       })}`)
       .moveDown();

    // Patient
    doc.fontSize(12).font('Helvetica-Bold').text('PATIENT');
    doc.fontSize(10).font('Helvetica')
       .text(`Nom complet: ${consultation.patient.nom} ${consultation.patient.prenom}`)
       .text(`Date de naissance: ${new Date(consultation.patient.dateNaissance).toLocaleDateString('fr-FR')}`)
       .text(`Sexe: ${consultation.patient.sexe}`)
       .text(`Contact: ${consultation.patient.telephone || 'N/A'}`)
       .text(`Email: ${consultation.patient.email || 'N/A'}`)
       .moveDown();

    // Médecin
    doc.fontSize(12).font('Helvetica-Bold').text('MÉDECIN TRAITANT');
    doc.fontSize(10).font('Helvetica')
       .text(`Dr. ${consultation.medecin.nom} ${consultation.medecin.prenom}`)
       .text(`Spécialité: ${consultation.medecin.specialite}`)
       .text(`N° Ordre: ${consultation.medecin.numeroOrdre}`)
       .moveDown();

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    // Motif de consultation
    doc.fontSize(12).font('Helvetica-Bold').text('MOTIF DE CONSULTATION');
    doc.fontSize(10).font('Helvetica').text(consultation.consultation.motif || 'Non spécifié');
    doc.moveDown();

    // Diagnostic
    if (consultation.consultation.diagnostic) {
      doc.fontSize(12).font('Helvetica-Bold').text('DIAGNOSTIC');
      doc.fontSize(10).font('Helvetica').text(consultation.consultation.diagnostic, { align: 'justify' });
      doc.moveDown();
    }

    // Traitement
    if (consultation.consultation.traitement) {
      doc.fontSize(12).font('Helvetica-Bold').text('TRAITEMENT PRESCRIT');
      doc.fontSize(10).font('Helvetica').text(consultation.consultation.traitement, { align: 'justify' });
      doc.moveDown();
    }

    // Notes
    if (consultation.consultation.notes) {
      doc.fontSize(12).font('Helvetica-Bold').text('OBSERVATIONS COMPLÉMENTAIRES');
      doc.fontSize(10).font('Helvetica').text(consultation.consultation.notes, { align: 'justify' });
      doc.moveDown();
    }

    // Pied de page
    doc.fontSize(8).font('Helvetica-Oblique')
       .text('Document confidentiel - Usage médical uniquement', 50, 750, { align: 'center' })
       .text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('❌ Erreur génération rapport:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// 📖 HISTORIQUE MÉDICAL COMPLET - VERSION FINALE CORRIGÉE
exports.generateHistoriqueMedical = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('📄 Génération historique pour patient:', patientId);
    
    // Récupérer le patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient non trouvé' });
    }

    console.log('✅ Patient:', patient.nom, patient.prenom);

    // Récupérer les consultations du patient
    let consultations = [];
    try {
      consultations = await Consultation.getByPatient(patientId);
      console.log('✅ Consultations:', consultations.length);
    } catch (error) {
      console.error('❌ Erreur consultations:', error);
    }

    // Récupérer TOUS les diagnostics et traitements
    let allDiagnostics = [];
    let allTraitements = [];
    
    try {
      allDiagnostics = await Diagnostic.findAll();
      console.log('✅ Total diagnostics:', allDiagnostics.length);
    } catch (error) {
      console.error('❌ Erreur diagnostics:', error);
    }

    try {
      allTraitements = await Traitement.findAll();
      console.log('✅ Total traitements:', allTraitements.length);
    } catch (error) {
      console.error('❌ Erreur traitements:', error);
    }

    // Filtrer par patient - méthode améliorée
    const patientDiagnostics = [];
    const patientTraitements = [];

    // Pour chaque consultation, trouver ses diagnostics
    consultations.forEach(c => {
      // Trouver diagnostics de cette consultation
      const consulDiags = allDiagnostics.filter(d => {
        // Essayer plusieurs méthodes de correspondance
        const diagConsultId = d.diagnostic?.consultationId;
        const consultId = c.consultation?.id;
        
        console.log('Comparaison diagnostic:', diagConsultId, 'avec consultation:', consultId);
        
        return diagConsultId === consultId;
      });
      
      patientDiagnostics.push(...consulDiags);
      
      // Pour chaque diagnostic, trouver ses traitements
      consulDiags.forEach(diag => {
        const diagTraitements = allTraitements.filter(t => {
          const traitDiagId = t.traitement?.diagnosticId;
          const diagId = diag.diagnostic?.id;
          
          console.log('Comparaison traitement:', traitDiagId, 'avec diagnostic:', diagId);
          
          return traitDiagId === diagId;
        });
        
        patientTraitements.push(...diagTraitements);
      });
    });

    console.log('📊 Résultat filtrage:', {
      consultations: consultations.length,
      diagnostics: patientDiagnostics.length,
      traitements: patientTraitements.length
    });

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      bufferPages: true
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=historique_medical_${patient.nom}_${patient.prenom}.pdf`);
    
    doc.pipe(res);

    // ================== EN-TÊTE ==================
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e40af').text('DOSSIER MÉDICAL COMPLET', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text('Centre Hospitalier SGSP - Casablanca', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(8).text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'center' });
    
    doc.moveTo(40, doc.y + 10).lineTo(555, doc.y + 10).lineWidth(2).strokeColor('#1e40af').stroke();
    doc.moveDown(1.5);

    // ================== INFORMATIONS PATIENT ==================
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('INFORMATIONS DU PATIENT');
    
    const birthDate = new Date(patient.dateNaissance);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    const startY = doc.y + 5;
    doc.fontSize(9).font('Helvetica');
    
    // Informations sur 2 colonnes
    doc.text(`Nom complet:`, 40, startY);
    doc.font('Helvetica-Bold').text(`${patient.nom} ${patient.prenom}`, 150, startY);
    
    doc.font('Helvetica').text(`Date de naissance:`, 40, startY + 15);
    doc.font('Helvetica-Bold').text(`${birthDate.toLocaleDateString('fr-FR')} (${age} ans)`, 150, startY + 15);
    
    doc.font('Helvetica').text(`Sexe:`, 40, startY + 30);
    doc.font('Helvetica-Bold').text(patient.sexe === 'M' ? 'Masculin' : 'Féminin', 150, startY + 30);
    
    doc.font('Helvetica').text(`Téléphone:`, 300, startY);
    doc.font('Helvetica-Bold').text(patient.telephone || 'N/A', 420, startY);
    
    doc.font('Helvetica').text(`Email:`, 300, startY + 15);
    doc.font('Helvetica-Bold').text(patient.email || 'N/A', 420, startY + 15);
    
    doc.font('Helvetica').text(`N° Sécurité Sociale:`, 300, startY + 30);
    doc.font('Helvetica-Bold').text(patient.numeroSecuriteSociale || 'N/A', 420, startY + 30);
    
    if (patient.adresse) {
      doc.font('Helvetica').text(`Adresse:`, 40, startY + 45);
      doc.font('Helvetica-Bold').text(patient.adresse, 150, startY + 45, { width: 400 });
      doc.moveDown(3.5);
    } else {
      doc.moveDown(2.5);
    }

    // ================== RÉSUMÉ STATISTIQUES ==================
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('RÉSUMÉ MÉDICAL');
    doc.moveDown(0.5);
    
    const statsY = doc.y;
    
    doc.roundedRect(40, statsY, 160, 50, 5).fillAndStroke('#eff6ff', '#3b82f6');
    doc.fillColor('#1e40af').fontSize(20).font('Helvetica-Bold').text(consultations.length.toString(), 50, statsY + 10, { width: 140, align: 'center' });
    doc.fillColor('#6b7280').fontSize(9).font('Helvetica').text('Consultations', 50, statsY + 35, { width: 140, align: 'center' });
    
    doc.roundedRect(210, statsY, 160, 50, 5).fillAndStroke('#fef3c7', '#f59e0b');
    doc.fillColor('#d97706').fontSize(20).font('Helvetica-Bold').text(patientDiagnostics.length.toString(), 220, statsY + 10, { width: 140, align: 'center' });
    doc.fillColor('#6b7280').fontSize(9).font('Helvetica').text('Diagnostics', 220, statsY + 35, { width: 140, align: 'center' });
    
    doc.roundedRect(380, statsY, 160, 50, 5).fillAndStroke('#f0fdf4', '#10b981');
    doc.fillColor('#059669').fontSize(20).font('Helvetica-Bold').text(patientTraitements.length.toString(), 390, statsY + 10, { width: 140, align: 'center' });
    doc.fillColor('#6b7280').fontSize(9).font('Helvetica').text('Traitements', 390, statsY + 35, { width: 140, align: 'center' });
    
    doc.moveDown(4);

    // ================== CONSULTATIONS DÉTAILLÉES ==================
    doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold').text('HISTORIQUE DES CONSULTATIONS');
    doc.moveDown(0.5);

    if (consultations.length > 0) {
      consultations.forEach((c, index) => {
        if (doc.y > 630) {
          doc.addPage();
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('HISTORIQUE DES CONSULTATIONS (suite)');
          doc.moveDown(0.5);
        }

        const consultDate = new Date(c.consultation.date);
        const consultY = doc.y;
        
        // Encadré consultation
        doc.roundedRect(40, consultY, 515, 85, 5).fillAndStroke('#f0f9ff', '#3b82f6');
        
        // En-tête consultation
        doc.fillColor('#1e40af').fontSize(10).font('Helvetica-Bold')
           .text(`📅 Consultation ${index + 1} - ${consultDate.toLocaleDateString('fr-FR')}`, 50, consultY + 10);
        
        // Médecin
        doc.fillColor('#374151').fontSize(8).font('Helvetica')
           .text(`👨‍⚕️ Dr. ${c.medecin?.nom || ''} ${c.medecin?.prenom || ''}`, 50, consultY + 28);
        doc.fillColor('#6b7280').fontSize(7)
           .text(`${c.medecin?.specialite || 'Spécialité non renseignée'}`, 50, consultY + 40);
        
        // Motif
        doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
           .text('Motif:', 280, consultY + 10);
        doc.font('Helvetica').fontSize(7).fillColor('#374151')
           .text(c.consultation?.motif || 'Non renseigné', 280, consultY + 22, { width: 260 });
        
        // Diagnostic
        doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
           .text('Diagnostic:', 50, consultY + 53);
        doc.font('Helvetica').fontSize(7).fillColor('#374151')
           .text(c.consultation?.diagnostic || 'En attente', 50, consultY + 65, { width: 230 });
        
        // Traitement
        if (c.consultation?.traitement) {
          doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
             .text('Traitement:', 280, consultY + 53);
          doc.font('Helvetica').fontSize(7).fillColor('#374151')
             .text(c.consultation.traitement, 280, consultY + 65, { width: 260 });
        }
        
        doc.moveDown(6);

        // Diagnostics liés à cette consultation
        const consulDiags = allDiagnostics.filter(d => d.diagnostic?.consultationId === c.consultation?.id);
        
        if (consulDiags.length > 0) {
          consulDiags.forEach(diag => {
            if (doc.y > 700) doc.addPage();
            
            const diagY = doc.y;
            doc.roundedRect(60, diagY, 475, 55, 5).fillAndStroke('#fef3c7', '#f59e0b');
            
            doc.fillColor('#d97706').fontSize(9).font('Helvetica-Bold')
               .text(`🏥 Diagnostic: ${diag.diagnostic.maladie}`, 70, diagY + 8);
            
            doc.fillColor('#6b7280').fontSize(7).font('Helvetica')
               .text(`Gravité: ${diag.diagnostic.gravite}`, 70, diagY + 23);
            
            if (diag.diagnostic.description) {
              doc.text(`Description: ${diag.diagnostic.description}`, 70, diagY + 35, { width: 450 });
            }
            
            doc.moveDown(4);

            // Traitements liés à ce diagnostic
            const diagTraitements = allTraitements.filter(t => t.traitement?.diagnosticId === diag.diagnostic?.id);
            
            if (diagTraitements.length > 0) {
              diagTraitements.forEach(trait => {
                if (doc.y > 700) doc.addPage();
                
                const traitY = doc.y;
                doc.roundedRect(80, traitY, 455, 60, 5).fillAndStroke('#f0fdf4', '#10b981');
                
                doc.fillColor('#059669').fontSize(8).font('Helvetica-Bold')
                   .text(`💊 Traitement: ${trait.traitement.medicament}`, 90, traitY + 8);
                
                doc.fillColor('#6b7280').fontSize(7).font('Helvetica')
                   .text(`Posologie: ${trait.traitement.posologie}`, 90, traitY + 23)
                   .text(`Fréquence: ${trait.traitement.frequence}`, 280, traitY + 23);
                
                doc.text(`Durée: ${trait.traitement.duree}`, 90, traitY + 38)
                   .text(`Du ${new Date(trait.traitement.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(trait.traitement.dateFin).toLocaleDateString('fr-FR')}`, 280, traitY + 38);
                
                if (trait.traitement.instructions) {
                  doc.fontSize(6).text(`Instructions: ${trait.traitement.instructions}`, 90, traitY + 50, { width: 430 });
                }
                
                doc.moveDown(4.5);
              });
            }
          });
        }
      });
    } else {
      doc.fontSize(9).font('Helvetica-Oblique').fillColor('#9ca3af')
         .text('📋 Aucune consultation enregistrée', { align: 'center' });
    }

    // ================== PIED DE PAGE ==================
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(7).font('Helvetica').fillColor('#9ca3af')
         .text('Document médical confidentiel - Usage médical uniquement', 40, doc.page.height - 50, { align: 'center', width: 515 })
         .text('Centre Hospitalier SGSP - 123 Avenue de la Santé, Casablanca | Tél: +212 5XX-XXXXXX', { align: 'center', width: 515 })
         .text(`Page ${i + 1} / ${pages.count}`, { align: 'center', width: 515 });
    }

    doc.end();
    console.log('✅ PDF généré avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};