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

class Diagnostic {
  // Créer un nouveau diagnostic lié à une consultation
  static async create(data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const crypto = require('crypto');
      const id = crypto.randomUUID();
      
      const result = await session.run(
        `MATCH (c:Consultation {id: $consultationId})
         CREATE (d:Diagnostic {
           id: $id,
           maladie: $maladie,
           description: $description,
           gravite: $gravite,
           symptomes: $symptomes,
           pronostic: $pronostic,
           dateCreation: datetime()
         })
         CREATE (c)-[:A_DIAGNOSTIC]->(d)
         RETURN d, c`,
        { id, ...data }
      );
      
      const record = result.records[0];
      return {
        diagnostic: toJavaScriptObject(record.get('d').properties),
        consultation: toJavaScriptObject(record.get('c').properties)
      };
    } catch (error) {
      console.error('❌ Erreur dans Diagnostic.create:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Récupérer tous les diagnostics avec leurs consultations
  static async findAll() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      // Récupérer tous les diagnostics directement
      const result = await session.run(
        `MATCH (d:Diagnostic)
         OPTIONAL MATCH (d)-[:A_DIAGNOSTIC]->(c:Consultation)
         OPTIONAL MATCH (c)<-[:A_CONSULTE]-(p:Patient)
         OPTIONAL MATCH (c)<-[:A_EFFECTUE]-(m:Medecin)
         RETURN d, c, p, m
         ORDER BY d.dateCreation DESC`
      );
      
      return result.records.map(record => {
        const diagnostic = record.get('d') ? toJavaScriptObject(record.get('d').properties) : null;
        const consultation = record.get('c') ? toJavaScriptObject(record.get('c').properties) : null;
        const patient = record.get('p') ? toJavaScriptObject(record.get('p').properties) : null;
        const medecin = record.get('m') ? toJavaScriptObject(record.get('m').properties) : null;
        
        return {
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

  // Trouver un diagnostic par ID
  static async findById(id) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d:Diagnostic {id: $id})
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         RETURN d, c, p, m`,
        { id }
      );
      
      if (result.records.length === 0) return null;
      
      const record = result.records[0];
      return {
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

  // Mettre à jour un diagnostic
  static async update(id, data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d:Diagnostic {id: $id})
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         SET d.maladie = $maladie,
             d.description = $description,
             d.gravite = $gravite,
             d.symptomes = $symptomes,
             d.pronostic = $pronostic
         RETURN d, c, p, m`,
        { id, ...data }
      );
      
      if (result.records.length === 0) return null;
      
      const record = result.records[0];
      return {
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

  // Supprimer un diagnostic
  static async delete(id) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      await session.run(
        'MATCH (d:Diagnostic {id: $id}) DETACH DELETE d',
        { id }
      );
      return true;
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Rechercher des diagnostics
  static async search(term) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (c:Consultation)-[:A_DIAGNOSTIC]->(d:Diagnostic)
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         WHERE toLower(d.maladie) CONTAINS toLower($term)
            OR toLower(d.description) CONTAINS toLower($term)
            OR toLower(d.symptomes) CONTAINS toLower($term)
            OR toLower(p.nom) CONTAINS toLower($term)
            OR toLower(p.prenom) CONTAINS toLower($term)
         RETURN d, c, p, m
         ORDER BY d.dateCreation DESC`,
        { term }
      );
      
      return result.records.map(record => ({
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

  // Obtenir les diagnostics d'un patient
  static async getByPatient(patientId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (p:Patient {id: $patientId})-[:A_CONSULTE]->(c:Consultation)-[:A_DIAGNOSTIC]->(d:Diagnostic)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         RETURN d, c, p, m
         ORDER BY d.dateCreation DESC`,
        { patientId }
      );
      
      return result.records.map(record => ({
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

  // Obtenir les diagnostics par consultation
  static async getByConsultation(consultationId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (c:Consultation {id: $consultationId})-[:A_DIAGNOSTIC]->(d:Diagnostic)
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         MATCH (m:Medecin)-[:A_EFFECTUE]->(c)
         RETURN d, c, p, m
         ORDER BY d.dateCreation DESC`,
        { consultationId }
      );
      
      return result.records.map(record => ({
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
      const result = await session.run(
        `MATCH (d:Diagnostic)
         OPTIONAL MATCH (d)<-[:A_DIAGNOSTIC]-(c:Consultation)
         OPTIONAL MATCH (p:Patient)-[:A_CONSULTE]->(c)
         WITH count(DISTINCT d) as totalDiagnostics,
              count(DISTINCT p) as patientsAvecDiagnostic,
              collect(DISTINCT d.gravite) as gravites
         RETURN totalDiagnostics,
                patientsAvecDiagnostic,
                gravites`
      );
      
      const record = result.records[0];
      return {
        totalDiagnostics: record.get('totalDiagnostics').toNumber(),
        patientsAvecDiagnostic: record.get('patientsAvecDiagnostic').toNumber(),
        gravites: record.get('gravites')
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = Diagnostic;