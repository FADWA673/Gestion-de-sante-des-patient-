const driver = require('../config/database');

// Fonction helper pour convertir les propriétés Neo4j en objet JS pur
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

class Traitement {
  // Créer un nouveau traitement lié à un diagnostic
  static async create(data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const crypto = require('crypto');
      const id = crypto.randomUUID();
      
      const result = await session.run(
        `MATCH (d:Diagnostic {id: $diagnosticId})
         MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d)
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         CREATE (t:Traitement {
           id: $id,
           medicament: $medicament,
           posologie: $posologie,
           frequence: $frequence,
           duree: $duree,
           dateDebut: $dateDebut,
           dateFin: $dateFin,
           instructions: $instructions,
           dateCreation: datetime()
         })
         CREATE (d)-[:NECESSITE_TRAITEMENT]->(t)
         RETURN t, d, c, p, m`,
        { id, ...data }
      );
      
      const record = result.records[0];
      return {
        traitement: toJavaScriptObject(record.get('t').properties),
        diagnostic: toJavaScriptObject(record.get('d').properties),
        consultation: toJavaScriptObject(record.get('c').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      };
    } catch (error) {
      console.error('❌ Erreur dans Traitement.create:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Récupérer tous les traitements
  static async findAll() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      // Récupérer tous les traitements directement
      const result = await session.run(
        `MATCH (t:Traitement)
         OPTIONAL MATCH (t)<-[:NECESSITE_TRAITEMENT]-(d:Diagnostic)
         OPTIONAL MATCH (d)<-[:A_DIAGNOSTIC]-(c:Consultation)
         OPTIONAL MATCH (c)<-[:A_CONSULTE]-(p:Patient)
         OPTIONAL MATCH (c)<-[:A_EFFECTUE]-(m:Medecin)
         RETURN t, d, c, p, m
         ORDER BY t.dateDebut DESC`
      );
      
      return result.records.map(record => {
        const traitement = record.get('t') ? toJavaScriptObject(record.get('t').properties) : null;
        const diagnostic = record.get('d') ? toJavaScriptObject(record.get('d').properties) : null;
        const consultation = record.get('c') ? toJavaScriptObject(record.get('c').properties) : null;
        const patient = record.get('p') ? toJavaScriptObject(record.get('p').properties) : null;
        const medecin = record.get('m') ? toJavaScriptObject(record.get('m').properties) : null;
        
        return {
          traitement,
          diagnostic,
          consultation,
          patient,
          medecin
        };
      });
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Trouver un traitement par ID
  static async findById(id) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (d:Diagnostic)-[:NECESSITE_TRAITEMENT]->(t:Traitement {id: $id})
         MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d)
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         RETURN t, d, c, p, m`,
        { id }
      );
      
      if (result.records.length === 0) return null;
      
      const record = result.records[0];
      return {
        traitement: toJavaScriptObject(record.get('t').properties),
        diagnostic: toJavaScriptObject(record.get('d').properties),
        consultation: toJavaScriptObject(record.get('c').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Mettre à jour un traitement
  static async update(id, data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (d:Diagnostic)-[:NECESSITE_TRAITEMENT]->(t:Traitement {id: $id})
         MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d)
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         SET t.medicament = $medicament,
             t.posologie = $posologie,
             t.frequence = $frequence,
             t.duree = $duree,
             t.dateDebut = $dateDebut,
             t.dateFin = $dateFin,
             t.instructions = $instructions
         RETURN t, d, c, p, m`,
        { id, ...data }
      );
      
      if (result.records.length === 0) return null;
      
      const record = result.records[0];
      return {
        traitement: toJavaScriptObject(record.get('t').properties),
        diagnostic: toJavaScriptObject(record.get('d').properties),
        consultation: toJavaScriptObject(record.get('c').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Supprimer un traitement
  static async delete(id) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      await session.run(
        'MATCH (t:Traitement {id: $id}) DETACH DELETE t',
        { id }
      );
      return true;
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Rechercher des traitements
  static async search(term) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (d:Diagnostic)-[:NECESSITE_TRAITEMENT]->(t:Traitement)
         MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d)
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         WHERE toLower(t.medicament) CONTAINS toLower($term)
            OR toLower(t.posologie) CONTAINS toLower($term)
            OR toLower(p.nom) CONTAINS toLower($term)
            OR toLower(p.prenom) CONTAINS toLower($term)
            OR toLower(d.maladie) CONTAINS toLower($term)
         RETURN t, d, c, p, m
         ORDER BY t.dateDebut DESC`,
        { term }
      );
      
      return result.records.map(record => ({
        traitement: toJavaScriptObject(record.get('t').properties),
        diagnostic: toJavaScriptObject(record.get('d').properties),
        consultation: toJavaScriptObject(record.get('c').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      }));
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir les traitements d'un patient
  static async getByPatient(patientId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (p:Patient {id: $patientId})-[:A_CONSULTE]->(c:Consultation)-[:A_DIAGNOSTIC]->(d:Diagnostic)-[:NECESSITE_TRAITEMENT]->(t:Traitement)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         RETURN t, d, c, p, m
         ORDER BY t.dateDebut DESC`,
        { patientId }
      );
      
      return result.records.map(record => ({
        traitement: toJavaScriptObject(record.get('t').properties),
        diagnostic: toJavaScriptObject(record.get('d').properties),
        consultation: toJavaScriptObject(record.get('c').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      }));
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir les traitements par diagnostic
  static async getByDiagnostic(diagnosticId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (d:Diagnostic {id: $diagnosticId})-[:NECESSITE_TRAITEMENT]->(t:Traitement)
         MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d)
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         RETURN t, d, c, p, m
         ORDER BY t.dateDebut DESC`,
        { diagnosticId }
      );
      
      return result.records.map(record => ({
        traitement: toJavaScriptObject(record.get('t').properties),
        diagnostic: toJavaScriptObject(record.get('d').properties),
        consultation: toJavaScriptObject(record.get('c').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      }));
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir les traitements actifs
  static async getActifs() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await session.run(
        `MATCH (d:Diagnostic)-[:NECESSITE_TRAITEMENT]->(t:Traitement)
         MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d)
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         WHERE t.dateDebut <= $today AND t.dateFin >= $today
         RETURN t, d, c, p, m
         ORDER BY t.dateDebut DESC`,
        { today }
      );
      
      return result.records.map(record => ({
        traitement: toJavaScriptObject(record.get('t').properties),
        diagnostic: toJavaScriptObject(record.get('d').properties),
        consultation: toJavaScriptObject(record.get('c').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      }));
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir les statistiques
  static async getStatistiques() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await session.run(
        `MATCH (t:Traitement)
         OPTIONAL MATCH (d:Diagnostic)-[:NECESSITE_TRAITEMENT]->(t)
         OPTIONAL MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d)
         OPTIONAL MATCH (p:Patient)-[:A_CONSULTE]->(c)
         WITH count(DISTINCT t) as totalTraitements,
              count(DISTINCT p) as patientsAvecTraitement,
              count(DISTINCT CASE WHEN t.dateDebut <= $today AND t.dateFin >= $today THEN t END) as traitementsActifs
         RETURN totalTraitements,
                patientsAvecTraitement,
                traitementsActifs`,
        { today }
      );
      
      const record = result.records[0];
      return {
        totalTraitements: record.get('totalTraitements').toNumber(),
        patientsAvecTraitement: record.get('patientsAvecTraitement').toNumber(),
        traitementsActifs: record.get('traitementsActifs').toNumber()
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = Traitement;