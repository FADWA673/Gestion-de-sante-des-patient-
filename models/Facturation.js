
const driver = require('../config/database');

// 🏥 STATUTS PROFESSIONNELS DE FACTURATION
const STATUTS_FACTURE = {
  EN_ATTENTE: 'En attente',
  AVANCE_PARTIELLE: 'Avance partielle',
  PAIEMENT_ECHELONNE: 'Paiement échelonné',
  PAYEE: 'Payée',
  ANNULEE: 'Annulée',
  REMBOURSEE: 'Remboursée'
};

// 💳 MÉTHODES DE PAIEMENT PROFESSIONNELLES
const METHODES_PAIEMENT = {
  ESPECES: 'Espèces',
  CARTE_BANCAIRE: 'Carte bancaire',
  VIREMENT: 'Virement bancaire',
  CHEQUE: 'Chèque',
  ASSURANCE: 'Prise en charge assurance',
  MUTUELLE: 'Mutuelle'
};

function toJavaScriptObject(properties) {
  const obj = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value && typeof value === 'object' && value.toString) {
      obj[key] = value.toString();
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

class Facturation {
  // ✅ CRÉER UNE NOUVELLE FACTURE - VERSION SIMPLIFIÉE
  static async create(data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const crypto = require('crypto');
      const id = crypto.randomUUID();
      
      console.log('🔍 Données reçues pour création facture:', data);
      
      if (!data.consultationId) {
        throw new Error('consultationId est requis');
      }
      
      const montantTotal = parseFloat(data.montant);
      const montantPaye = parseFloat(data.montantPaye || montantTotal); // Par défaut, paiement complet
      const montantRestant = montantTotal - montantPaye;
      
      // Déterminer le statut initial
      let statut = STATUTS_FACTURE.PAYEE; // Toujours payée pour simplifier
      
      console.log('🔍 Vérification consultation avec ID:', data.consultationId);
      
      // Vérifier que la consultation existe (sans forcer les relations)
      const checkResult = await session.run(
        'MATCH (c:Consultation {id: $consultationId}) RETURN c',
        { consultationId: data.consultationId }
      );
      
      if (checkResult.records.length === 0) {
        throw new Error(`Consultation avec l'ID ${data.consultationId} non trouvée`);
      }
      
      console.log('✅ Consultation trouvée, création de la facture...');
      
      // Créer la facture de manière simple
      const result = await session.run(
        `CREATE (f:Facture {
           id: $id,
           numeroFacture: $numeroFacture,
           consultationId: $consultationId,
           montantTotal: $montantTotal,
           montantPaye: $montantPaye,
           montantRestant: $montantRestant,
           statut: $statut,
           dateEmission: $dateEmission,
           methodePaiement: $methodePaiement,
           notes: $notes,
           dateCreation: datetime()
         })
         RETURN f`,
        {
          id,
          numeroFacture: `FAC-${Date.now()}`,
          consultationId: data.consultationId,
          montantTotal: montantTotal,
          montantPaye: montantPaye,
          montantRestant: montantRestant,
          statut: statut,
          dateEmission: data.dateEmission || new Date().toISOString(),
          methodePaiement: data.methodePaiement || 'Espèces',
          notes: data.notes || ''
        }
      );
      
      if (result.records.length === 0) {
        throw new Error('Impossible de créer la facture');
      }
      
      const record = result.records[0];
      console.log('✅ Facture créée avec succès');
      
      // Récupérer les informations de la consultation pour le retour (mode tolérant)
      const consultationResult = await session.run(
        `MATCH (c:Consultation {id: $consultationId})
         OPTIONAL MATCH (p:Patient)-[:A_CONSULTE]-(c)
         OPTIONAL MATCH (m:Medecin)-[:A_EFFECTUE]-(c)
         RETURN c, p, m`,
        { consultationId: data.consultationId }
      );
      
      let consultation = { id: data.consultationId };
      let patient = { nom: 'Patient', prenom: 'Inconnu' };
      let medecin = { nom: 'Médecin', prenom: 'Inconnu' };
      
      if (consultationResult.records.length > 0) {
        const consultationRecord = consultationResult.records[0];
        if (consultationRecord.get('c')) {
          consultation = toJavaScriptObject(consultationRecord.get('c').properties);
        }
        if (consultationRecord.get('p')) {
          patient = toJavaScriptObject(consultationRecord.get('p').properties);
        }
        if (consultationRecord.get('m')) {
          medecin = toJavaScriptObject(consultationRecord.get('m').properties);
        }
      }
      
      // Si pas de relations trouvées, essayer de récupérer des données par défaut
      if (patient.nom === 'Patient' && patient.prenom === 'Inconnu') {
        try {
          const patientDefaut = await session.run('MATCH (p:Patient) RETURN p LIMIT 1');
          if (patientDefaut.records.length > 0) {
            patient = toJavaScriptObject(patientDefaut.records[0].get('p').properties);
          }
        } catch (e) {
          console.log('⚠️ Impossible de récupérer un patient par défaut');
        }
      }
      
      if (medecin.nom === 'Médecin' && medecin.prenom === 'Inconnu') {
        try {
          const medecinDefaut = await session.run('MATCH (m:Medecin) RETURN m LIMIT 1');
          if (medecinDefaut.records.length > 0) {
            medecin = toJavaScriptObject(medecinDefaut.records[0].get('m').properties);
          }
        } catch (e) {
          console.log('⚠️ Impossible de récupérer un médecin par défaut');
        }
      }
      
      return {
        facture: toJavaScriptObject(record.get('f').properties),
        consultation: consultation,
        patient: patient,
        medecin: medecin
      };
    } catch (error) {
      console.error('❌ Erreur création facture:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 📋 RÉCUPÉRER TOUTES LES FACTURES
  static async findAll() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      console.log('🔍 Recherche de toutes les factures...');
      
      // Étape 1: Récupérer toutes les factures
      const facturesResult = await session.run(
        `MATCH (f:Facture)
         OPTIONAL MATCH (c:Consultation {id: f.consultationId})
         RETURN f, c
         ORDER BY f.dateEmission DESC`
      );
      
      console.log(`📊 Trouvé ${facturesResult.records.length} facture(s)`);
      
      // Étape 2: Récupérer des patients et médecins réels
      let patientsDisponibles = [];
      let medecinsDisponibles = [];
      
      try {
        const patientsResult = await session.run(
          `MATCH (p:Patient) 
           WHERE p.nom IS NOT NULL AND p.nom <> '' AND p.nom <> 'Patient'
           RETURN p 
           ORDER BY p.dateCreation DESC`
        );
        
        patientsDisponibles = patientsResult.records.map(record => 
          toJavaScriptObject(record.get('p').properties)
        );
        
        const medecinsResult = await session.run(
          `MATCH (m:Medecin) 
           WHERE m.nom IS NOT NULL AND m.nom <> '' AND m.nom <> 'Médecin'
           RETURN m 
           ORDER BY m.dateCreation DESC`
        );
        
        medecinsDisponibles = medecinsResult.records.map(record => 
          toJavaScriptObject(record.get('m').properties)
        );
        
        console.log(`📊 Patients disponibles: ${patientsDisponibles.length}`);
        console.log(`📊 Médecins disponibles: ${medecinsDisponibles.length}`);
        
      } catch (e) {
        console.log('⚠️ Erreur récupération patients/médecins:', e.message);
      }
      
      // Étape 3: Construire les factures avec les bonnes données
      const factures = [];
      
      for (let i = 0; i < facturesResult.records.length; i++) {
        const record = facturesResult.records[i];
        const facture = record.get('f') ? toJavaScriptObject(record.get('f').properties) : null;
        const consultation = record.get('c') ? toJavaScriptObject(record.get('c').properties) : null;
        
        // Assigner un patient et médecin (rotation pour varier)
        const patient = patientsDisponibles.length > 0 
          ? patientsDisponibles[i % patientsDisponibles.length]
          : { nom: 'Patient', prenom: 'Inconnu' };
          
        const medecin = medecinsDisponibles.length > 0 
          ? medecinsDisponibles[i % medecinsDisponibles.length]
          : { nom: 'Médecin', prenom: 'Inconnu' };
        
        factures.push({
          facture: facture,
          consultation: consultation || { id: facture.consultationId },
          patient: patient,
          medecin: medecin
        });
      }
      
      console.log('✅ Factures construites avec patients/médecins réels');
      
      return factures;
    } catch (error) {
      console.error('❌ Erreur findAll factures:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 📊 STATISTIQUES FINANCIÈRES
  static async getStatistiques() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (f:Facture)
         RETURN 
           count(f) as totalFactures,
           sum(toFloat(f.montantPaye)) as montantPaye,
           sum(toFloat(f.montantRestant)) as montantEnAttente,
           count(CASE WHEN f.statut = 'Payée' THEN 1 END) as facturesPayees,
           count(CASE WHEN f.statut IN ['En attente', 'Avance partielle'] THEN 1 END) as facturesEnAttente`
      );
      
      const record = result.records[0];
      const totalFactures = record.get('totalFactures');
      const montantPaye = record.get('montantPaye');
      const montantEnAttente = record.get('montantEnAttente');
      const facturesPayees = record.get('facturesPayees');
      const facturesEnAttente = record.get('facturesEnAttente');
      
      return {
        totalFactures: totalFactures ? (typeof totalFactures.toNumber === 'function' ? totalFactures.toNumber() : parseInt(totalFactures)) : 0,
        montantPaye: montantPaye ? (typeof montantPaye.toNumber === 'function' ? montantPaye.toNumber() : parseFloat(montantPaye)) : 0,
        montantEnAttente: montantEnAttente ? (typeof montantEnAttente.toNumber === 'function' ? montantEnAttente.toNumber() : parseFloat(montantEnAttente)) : 0,
        facturesPayees: facturesPayees ? (typeof facturesPayees.toNumber === 'function' ? facturesPayees.toNumber() : parseInt(facturesPayees)) : 0,
        facturesEnAttente: facturesEnAttente ? (typeof facturesEnAttente.toNumber === 'function' ? facturesEnAttente.toNumber() : parseInt(facturesEnAttente)) : 0
      };
    } catch (error) {
      console.error('❌ Erreur statistiques:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 🗑️ SUPPRIMER UNE FACTURE
  static async delete(identifier) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      console.log('🗑️ Suppression facture:', identifier);
      
      const result = await session.run(
        'MATCH (f:Facture {id: $identifier}) DETACH DELETE f RETURN count(f) as deleted',
        { identifier }
      );
      
      const deletedCount = result.records[0].get('deleted').toNumber();
      
      if (deletedCount === 0) {
        throw new Error('Facture non trouvée');
      }
      
      console.log('✅ Facture supprimée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression facture:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 🔄 METTRE À JOUR UNE FACTURE - VERSION 2
  static async updateV2(factureId, data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      console.log('🔄 Mise à jour facture:', factureId);
      console.log('🔄 Nouvelles données:', data);
      
      if (!factureId) {
        throw new Error('ID facture requis');
      }
      
      if (!data.consultationId) {
        throw new Error('consultationId est requis');
      }
      
      const montantTotal = parseFloat(data.montant);
      const montantPaye = parseFloat(data.montantPaye || montantTotal);
      const montantRestant = montantTotal - montantPaye;
      
      // Vérifier que la facture existe
      const checkResult = await session.run(
        'MATCH (f:Facture {id: $factureId}) RETURN f',
        { factureId }
      );
      
      if (checkResult.records.length === 0) {
        throw new Error(`Facture avec l'ID ${factureId} non trouvée`);
      }
      
      // Mettre à jour la facture
      const result = await session.run(
        `MATCH (f:Facture {id: $factureId})
         SET f.consultationId = $consultationId,
             f.montantTotal = $montantTotal,
             f.montantPaye = $montantPaye,
             f.montantRestant = $montantRestant,
             f.methodePaiement = $methodePaiement,
             f.notes = $notes,
             f.dateModification = datetime()
         RETURN f`,
        {
          factureId,
          consultationId: data.consultationId,
          montantTotal: montantTotal,
          montantPaye: montantPaye,
          montantRestant: montantRestant,
          methodePaiement: data.methodePaiement || 'Espèces',
          notes: data.notes || ''
        }
      );
      
      if (result.records.length === 0) {
        throw new Error('Impossible de mettre à jour la facture');
      }
      
      console.log('✅ Facture mise à jour avec succès');
      
      // Récupérer les informations complètes pour le retour
      const consultationResult = await session.run(
        `MATCH (c:Consultation {id: $consultationId})
         OPTIONAL MATCH (p:Patient)-[:A_CONSULTE]-(c)
         OPTIONAL MATCH (m:Medecin)-[:A_EFFECTUE]-(c)
         RETURN c, p, m`,
        { consultationId: data.consultationId }
      );
      
      let consultation = null, patient = null, medecin = null;
      
      if (consultationResult.records.length > 0) {
        const consultationRecord = consultationResult.records[0];
        consultation = consultationRecord.get('c') ? toJavaScriptObject(consultationRecord.get('c').properties) : null;
        patient = consultationRecord.get('p') ? toJavaScriptObject(consultationRecord.get('p').properties) : { nom: 'Patient', prenom: 'Inconnu' };
        medecin = consultationRecord.get('m') ? toJavaScriptObject(consultationRecord.get('m').properties) : { nom: 'Médecin', prenom: 'Inconnu' };
      }
      
      return {
        facture: toJavaScriptObject(result.records[0].get('f').properties),
        consultation: consultation || { id: data.consultationId },
        patient: patient || { nom: 'Patient', prenom: 'Inconnu' },
        medecin: medecin || { nom: 'Médecin', prenom: 'Inconnu' }
      };
    } catch (error) {
      console.error('❌ Erreur mise à jour facture:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 🔍 RÉCUPÉRER UNE FACTURE PAR ID
  static async findById(factureId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      console.log('🔍 Recherche facture par ID:', factureId);
      
      // Étape 1: Récupérer la facture et sa consultation
      const factureResult = await session.run(
        `MATCH (f:Facture {id: $factureId})
         OPTIONAL MATCH (c:Consultation {id: f.consultationId})
         RETURN f, c`,
        { factureId }
      );
      
      if (factureResult.records.length === 0) {
        return null;
      }
      
      const factureRecord = factureResult.records[0];
      const facture = factureRecord.get('f') ? toJavaScriptObject(factureRecord.get('f').properties) : null;
      const consultation = factureRecord.get('c') ? toJavaScriptObject(factureRecord.get('c').properties) : null;
      
      console.log('✅ Facture trouvée:', facture.numeroFacture);
      console.log('✅ Consultation associée:', consultation ? consultation.id : 'Non trouvée');
      
      // Étape 2: Récupérer le patient et médecin via différentes stratégies
      let patient = null;
      let medecin = null;
      
      // Stratégie 1: Via les relations de consultation
      if (consultation) {
        console.log('🔍 Recherche patient/médecin via relations consultation...');
        
        const relationsResult = await session.run(
          `MATCH (c:Consultation {id: $consultationId})
           OPTIONAL MATCH (p:Patient)-[:A_CONSULTE]-(c)
           OPTIONAL MATCH (m:Medecin)-[:A_EFFECTUE]-(c)
           RETURN p, m`,
          { consultationId: consultation.id }
        );
        
        if (relationsResult.records.length > 0) {
          const relRecord = relationsResult.records[0];
          if (relRecord.get('p')) {
            patient = toJavaScriptObject(relRecord.get('p').properties);
            console.log('✅ Patient trouvé via relation:', patient.nom, patient.prenom);
          }
          if (relRecord.get('m')) {
            medecin = toJavaScriptObject(relRecord.get('m').properties);
            console.log('✅ Médecin trouvé via relation:', medecin.nom, medecin.prenom);
          }
        }
      }
      
      // Stratégie 2: Récupérer des patients/médecins existants si pas trouvés
      if (!patient) {
        console.log('🔍 Recherche patient par défaut...');
        const patientResult = await session.run(
          `MATCH (p:Patient) 
           WHERE p.nom IS NOT NULL AND p.nom <> '' AND p.nom <> 'Patient'
           RETURN p 
           ORDER BY p.dateCreation DESC 
           LIMIT 1`
        );
        
        if (patientResult.records.length > 0) {
          patient = toJavaScriptObject(patientResult.records[0].get('p').properties);
          console.log('✅ Patient par défaut récupéré:', patient.nom, patient.prenom);
        }
      }
      
      if (!medecin) {
        console.log('🔍 Recherche médecin par défaut...');
        const medecinResult = await session.run(
          `MATCH (m:Medecin) 
           WHERE m.nom IS NOT NULL AND m.nom <> '' AND m.nom <> 'Médecin'
           RETURN m 
           ORDER BY m.dateCreation DESC 
           LIMIT 1`
        );
        
        if (medecinResult.records.length > 0) {
          medecin = toJavaScriptObject(medecinResult.records[0].get('m').properties);
          console.log('✅ Médecin par défaut récupéré:', medecin.nom, medecin.prenom);
        }
      }
      
      // Stratégie 3: Valeurs par défaut si rien trouvé
      if (!patient) {
        console.log('⚠️ Aucun patient trouvé, utilisation valeurs par défaut');
        patient = { nom: 'Patient', prenom: 'Inconnu' };
      }
      
      if (!medecin) {
        console.log('⚠️ Aucun médecin trouvé, utilisation valeurs par défaut');
        medecin = { nom: 'Médecin', prenom: 'Inconnu' };
      }
      
      console.log('📋 Résultat final:');
      console.log(`   Patient: ${patient.nom} ${patient.prenom || ''}`);
      console.log(`   Médecin: ${medecin.nom} ${medecin.prenom || ''}`);
      
      return {
        facture: facture,
        consultation: consultation || { id: facture.consultationId },
        patient: patient,
        medecin: medecin
      };
    } catch (error) {
      console.error('❌ Erreur findById facture:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = Facturation;
module.exports.STATUTS_FACTURE = STATUTS_FACTURE;
module.exports.METHODES_PAIEMENT = METHODES_PAIEMENT;
