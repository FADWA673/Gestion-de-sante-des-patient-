
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
      
      // Vérifier que la consultation existe
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
      
      // Récupérer les informations de la consultation pour le retour
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
        facture: toJavaScriptObject(record.get('f').properties),
        consultation: consultation || { id: data.consultationId },
        patient: patient || { nom: 'Patient', prenom: 'Inconnu' },
        medecin: medecin || { nom: 'Médecin', prenom: 'Inconnu' }
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
      
      const result = await session.run(
        `MATCH (f:Facture)
         OPTIONAL MATCH (c:Consultation {id: f.consultationId})
         OPTIONAL MATCH (p:Patient)-[:A_CONSULTE]-(c)
         OPTIONAL MATCH (m:Medecin)-[:A_EFFECTUE]-(c)
         RETURN f, c, p, m
         ORDER BY f.dateEmission DESC`
      );
      
      console.log(`📊 Trouvé ${result.records.length} facture(s)`);
      
      return result.records.map(record => {
        const facture = record.get('f') ? toJavaScriptObject(record.get('f').properties) : null;
        const consultation = record.get('c') ? toJavaScriptObject(record.get('c').properties) : null;
        const patient = record.get('p') ? toJavaScriptObject(record.get('p').properties) : null;
        const medecin = record.get('m') ? toJavaScriptObject(record.get('m').properties) : null;
        
        return {
          facture: facture,
          consultation: consultation,
          patient: patient || { nom: 'Patient', prenom: 'Inconnu' },
          medecin: medecin || { nom: 'Médecin', prenom: 'Inconnu' }
        };
      });
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
      const result = await session.run(
        'MATCH (f:Facture {id: $identifier}) DETACH DELETE f RETURN count(f) as deleted',
        { identifier }
      );
      
      const deletedCount = result.records[0].get('deleted').toNumber();
      
      if (deletedCount === 0) {
        throw new Error('Facture non trouvée');
      }
      
      return true;
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = Facturation;
module.exports.STATUTS_FACTURE = STATUTS_FACTURE;
module.exports.METHODES_PAIEMENT = METHODES_PAIEMENT;
