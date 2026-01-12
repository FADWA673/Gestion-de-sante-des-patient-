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

class Patient {
  static async create(data) {
    const session = driver.session({ 
      database: process.env.NEO4J_DATABASE || 'sgsp-db' 
    });
    try {
      const result = await session.run(
        `CREATE (p:Patient {
          id: randomUUID(),
          nom: $nom,
          prenom: $prenom,
          dateNaissance: $dateNaissance,
          sexe: $sexe,
          telephone: $telephone,
          adresse: $adresse,
          email: $email,
          numeroSecuriteSociale: $numeroSecuriteSociale,
          groupeSanguin: $groupeSanguin,
          allergies: $allergies,
          antecedents: $antecedents,
          dateCreation: datetime()
        })
        RETURN p`,
        {
          nom: data.nom || '',
          prenom: data.prenom || '',
          dateNaissance: data.dateNaissance || '',
          sexe: data.sexe || '',
          telephone: data.telephone || '',
          adresse: data.adresse || '',
          email: data.email || '',
          numeroSecuriteSociale: data.numeroSecu || data.numeroSecuriteSociale || '',
          groupeSanguin: data.groupeSanguin || '',
          allergies: data.allergies || '',
          antecedents: data.antecedents || ''
        }
      );
      const properties = result.records[0].get('p').properties;
      const patient = toJavaScriptObject(properties);
      console.log('✅ Patient créé:', patient);
      return patient;
    } finally {
      await session.close();
    }
  }

  static async findAll() {
    const session = driver.session({ 
      database: process.env.NEO4J_DATABASE || 'sgsp-db' 
    });
    try {
      const result = await session.run('MATCH (p:Patient) RETURN p ORDER BY p.nom');
      return result.records.map(record => {
        const props = toJavaScriptObject(record.get('p').properties);
        // Convertir numeroSecuriteSociale en numeroSecu pour le frontend
        if (props.numeroSecuriteSociale) {
          props.numeroSecu = props.numeroSecuriteSociale;
        }
        return props;
      });
    } finally {
      await session.close();
    }
  }

  static async findById(id) {
    const session = driver.session({ 
      database: process.env.NEO4J_DATABASE || 'sgsp-db' 
    });
    try {
      const result = await session.run(
        'MATCH (p:Patient {id: $id}) RETURN p',
        { id }
      );
      if (result.records.length === 0) return null;
      const props = toJavaScriptObject(result.records[0].get('p').properties);
      // Convertir numeroSecuriteSociale en numeroSecu pour le frontend
      if (props.numeroSecuriteSociale) {
        props.numeroSecu = props.numeroSecuriteSociale;
      }
      return props;
    } finally {
      await session.close();
    }
  }

  static async update(id, data) {
    const session = driver.session({ 
      database: process.env.NEO4J_DATABASE || 'sgsp-db' 
    });
    try {
      // Construire dynamiquement la requête SET en fonction des données fournies
      const setClause = [];
      const params = { id };
      
      if (data.nom !== undefined) {
        setClause.push('p.nom = $nom');
        params.nom = data.nom;
      }
      if (data.prenom !== undefined) {
        setClause.push('p.prenom = $prenom');
        params.prenom = data.prenom;
      }
      if (data.dateNaissance !== undefined) {
        setClause.push('p.dateNaissance = $dateNaissance');
        params.dateNaissance = data.dateNaissance;
      }
      if (data.sexe !== undefined) {
        setClause.push('p.sexe = $sexe');
        params.sexe = data.sexe;
      }
      if (data.telephone !== undefined) {
        setClause.push('p.telephone = $telephone');
        params.telephone = data.telephone;
      }
      if (data.adresse !== undefined) {
        setClause.push('p.adresse = $adresse');
        params.adresse = data.adresse;
      }
      if (data.email !== undefined) {
        setClause.push('p.email = $email');
        params.email = data.email;
      }
      if (data.numeroSecu !== undefined || data.numeroSecuriteSociale !== undefined) {
        setClause.push('p.numeroSecuriteSociale = $numeroSecuriteSociale');
        params.numeroSecuriteSociale = data.numeroSecu || data.numeroSecuriteSociale || '';
      }
      if (data.groupeSanguin !== undefined) {
        setClause.push('p.groupeSanguin = $groupeSanguin');
        params.groupeSanguin = data.groupeSanguin;
      }
      if (data.allergies !== undefined) {
        setClause.push('p.allergies = $allergies');
        params.allergies = data.allergies;
      }
      if (data.antecedents !== undefined) {
        setClause.push('p.antecedents = $antecedents');
        params.antecedents = data.antecedents;
      }
      
      if (setClause.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      const query = `MATCH (p:Patient {id: $id}) SET ${setClause.join(', ')} RETURN p`;
      
      const result = await session.run(query, params);
      if (result.records.length === 0) return null;
      
      const props = toJavaScriptObject(result.records[0].get('p').properties);
      // Convertir numeroSecuriteSociale en numeroSecu pour le frontend
      if (props.numeroSecuriteSociale) {
        props.numeroSecu = props.numeroSecuriteSociale;
      }
      return props;
    } finally {
      await session.close();
    }
  }

  static async delete(id) {
    const session = driver.session({ 
      database: process.env.NEO4J_DATABASE || 'sgsp-db' 
    });
    try {
      console.log('🗑️ Suppression patient ID:', id);
      const result = await session.run(
        'MATCH (p:Patient {id: $id}) DETACH DELETE p RETURN count(p) as deleted',
        { id }
      );
      
      const deletedCount = result.records[0]?.get('deleted').toNumber() || 0;
      console.log('✅ Patients supprimés:', deletedCount);
      
      if (deletedCount === 0) {
        throw new Error('Patient non trouvé');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression patient:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async search(term) {
    const session = driver.session({ 
      database: process.env.NEO4J_DATABASE || 'sgsp-db' 
    });
    try {
      const result = await session.run(
        `MATCH (p:Patient)
         WHERE toLower(p.nom) CONTAINS toLower($term)
            OR toLower(p.prenom) CONTAINS toLower($term)
            OR p.telephone CONTAINS $term
         RETURN p`,
        { term }
      );
      return result.records.map(record => {
        const props = toJavaScriptObject(record.get('p').properties);
        // Convertir numeroSecuriteSociale en numeroSecu pour le frontend
        if (props.numeroSecuriteSociale) {
          props.numeroSecu = props.numeroSecuriteSociale;
        }
        return props;
      });
    } finally {
      await session.close();
    }
  }
}

module.exports = Patient;