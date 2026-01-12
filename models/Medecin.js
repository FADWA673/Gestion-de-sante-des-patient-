const driver = require('../config/database');

// Fonction helper pour convertir les propriétés Neo4j en objet JS pur
function toJavaScriptObject(properties) {
  const obj = {};
  for (const [key, value] of Object.entries(properties)) {
    // Convertir les types Neo4j en types JavaScript
    if (value && typeof value === 'object' && value.toString) {
      obj[key] = value.toString();
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

class Medecin {
  // Créer un nouveau médecin
  static async create(data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const crypto = require('crypto');
      const id = crypto.randomUUID();
      
      const result = await session.run(
        `CREATE (m:Medecin {
          id: $id,
          nom: $nom,
          prenom: $prenom,
          specialite: $specialite,
          telephone: $telephone,
          email: $email,
          numeroOrdre: $numeroOrdre,
          adresse: $adresse,
          dateCreation: datetime()
        })
        RETURN m`,
        { id, ...data }
      );
      
      const properties = result.records[0].get('m').properties;
      const medecin = toJavaScriptObject(properties); // ← CONVERTIR ICI
      console.log('✅ Médecin créé:', medecin);
      return medecin;
    } catch (error) {
      console.error('❌ Erreur dans Medecin.create:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Récupérer tous les médecins
  static async findAll() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        'MATCH (m:Medecin) RETURN m ORDER BY m.nom, m.prenom'
      );
      return result.records.map(record => 
        toJavaScriptObject(record.get('m').properties) // ← CONVERTIR ICI
      );
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Trouver un médecin par ID
  static async findById(id) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        'MATCH (m:Medecin {id: $id}) RETURN m',
        { id }
      );
      if (result.records.length === 0) return null;
      return toJavaScriptObject(result.records[0].get('m').properties); // ← CONVERTIR ICI
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Mettre à jour un médecin
  static async update(id, data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (m:Medecin {id: $id})
         SET m.nom = $nom,
             m.prenom = $prenom,
             m.specialite = $specialite,
             m.telephone = $telephone,
             m.email = $email,
             m.numeroOrdre = $numeroOrdre,
             m.adresse = $adresse
         RETURN m`,
        { id, ...data }
      );
      if (result.records.length === 0) return null;
      return toJavaScriptObject(result.records[0].get('m').properties); // ← CONVERTIR ICI
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Supprimer un médecin
  static async delete(id) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      console.log('🗑️ Suppression médecin ID:', id);
      const result = await session.run(
        'MATCH (m:Medecin {id: $id}) DETACH DELETE m RETURN count(m) as deleted',
        { id }
      );
      
      const deletedCount = result.records[0]?.get('deleted').toNumber() || 0;
      console.log('✅ Médecins supprimés:', deletedCount);
      
      if (deletedCount === 0) {
        throw new Error('Médecin non trouvé');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression médecin:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Rechercher des médecins
  static async search(term) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (m:Medecin)
         WHERE toLower(m.nom) CONTAINS toLower($term)
            OR toLower(m.prenom) CONTAINS toLower($term)
            OR toLower(m.specialite) CONTAINS toLower($term)
            OR m.telephone CONTAINS $term
         RETURN m
         ORDER BY m.nom, m.prenom`,
        { term }
      );
      return result.records.map(record => 
        toJavaScriptObject(record.get('m').properties) // ← CONVERTIR ICI
      );
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir les consultations d'un médecin
  static async getConsultations(medecinId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (m:Medecin {id: $medecinId})-[:A_EFFECTUE]->(c:Consultation)
         MATCH (p:Patient)-[:A_CONSULTE]->(c)
         RETURN c, p
         ORDER BY c.date DESC`,
        { medecinId }
      );
      
      return result.records.map(record => ({
        consultation: toJavaScriptObject(record.get('c').properties), // ← CONVERTIR ICI
        patient: toJavaScriptObject(record.get('p').properties) // ← CONVERTIR ICI
      }));
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir les statistiques d'un médecin
  static async getStatistiques(medecinId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (m:Medecin {id: $medecinId})
         OPTIONAL MATCH (m)-[:A_EFFECTUE]->(c:Consultation)
         OPTIONAL MATCH (c)-[:A_DIAGNOSTIC]->(d:Diagnostic)
         RETURN m,
                count(DISTINCT c) as totalConsultations,
                count(DISTINCT d) as totalDiagnostics`,
        { medecinId }
      );
      
      if (result.records.length === 0) return null;
      
      const record = result.records[0];
      return {
        medecin: toJavaScriptObject(record.get('m').properties), // ← CONVERTIR ICI
        totalConsultations: record.get('totalConsultations').toNumber(),
        totalDiagnostics: record.get('totalDiagnostics').toNumber()
      };
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = Medecin;