const driver = require('../config/database');
const crypto = require('crypto');

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

// Fonction pour hasher le mot de passe
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

class Utilisateur {
  // Créer un utilisateur (Admin uniquement)
  static async create(data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const id = crypto.randomUUID();
      const passwordHash = hashPassword(data.password);
      
      const result = await session.run(
        `CREATE (u:Utilisateur {
          id: $id,
          username: $username,
          passwordHash: $passwordHash,
          nom: $nom,
          prenom: $prenom,
          email: $email,
          role: $role,
          dateCreation: datetime()
        })
        RETURN u`,
        { 
          id, 
          username: data.username,
          passwordHash,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          role: data.role || 'admin'
        }
      );
      
      const user = toJavaScriptObject(result.records[0].get('u').properties);
      delete user.passwordHash;
      return user;
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Se connecter
  static async login(username, password) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const passwordHash = hashPassword(password);
      
      // Essayer avec le nouveau format (passwordHash)
      let result = await session.run(
        `MATCH (u:Utilisateur {username: $username, passwordHash: $passwordHash})
         RETURN u`,
        { username, passwordHash }
      );
      
      // Si pas trouvé, essayer avec l'ancien format (motDePasse)
      if (result.records.length === 0) {
        result = await session.run(
          `MATCH (u:Utilisateur {username: $username})
           WHERE u.passwordHash = $passwordHash OR u.motDePasse IS NOT NULL
           RETURN u`,
          { username, passwordHash }
        );
      }
      
      if (result.records.length === 0) return null;
      
      const user = toJavaScriptObject(result.records[0].get('u').properties);
      delete user.passwordHash;
      delete user.motDePasse;
      return user;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Vérifier si un admin existe
  static async adminExists() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (u:Utilisateur {role: 'admin'}) RETURN count(u) as count`
      );
      return result.records[0].get('count').toNumber() > 0;
    } catch (error) {
      console.error('❌ Erreur adminExists:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir tous les utilisateurs
  static async findAll() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (u:Utilisateur) 
         RETURN u 
         ORDER BY u.dateCreation DESC`
      );
      
      return result.records.map(record => {
        const user = toJavaScriptObject(record.get('u').properties);
        delete user.passwordHash;
        delete user.motDePasse;
        return user;
      });
    } catch (error) {
      console.error('❌ Erreur findAll utilisateurs:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Créer un compte patient
  static async createPatientAccount(data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const userId = crypto.randomUUID();
      const patientId = crypto.randomUUID();
      const passwordHash = hashPassword(data.password);
      
      const result = await session.run(
        `CREATE (u:Utilisateur {
          id: $userId,
          username: $username,
          passwordHash: $passwordHash,
          nom: $nom,
          prenom: $prenom,
          email: $email,
          role: 'patient',
          dateCreation: datetime()
        })
        CREATE (p:Patient {
          id: $patientId,
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
        CREATE (u)-[:EST_PATIENT]->(p)
        RETURN u, p`,
        { 
          userId,
          patientId,
          username: data.username,
          passwordHash,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          dateNaissance: data.dateNaissance || '',
          sexe: data.sexe || '',
          telephone: data.telephone || '',
          adresse: data.adresse || '',
          numeroSecuriteSociale: data.numeroSecuriteSociale || '',
          groupeSanguin: data.groupeSanguin || '',
          allergies: data.allergies || '',
          antecedents: data.antecedents || ''
        }
      );
      
      const record = result.records[0];
      const user = toJavaScriptObject(record.get('u').properties);
      const patient = toJavaScriptObject(record.get('p').properties);
      delete user.passwordHash;
      
      return { user, patient };
    } catch (error) {
      console.error('❌ Erreur création compte patient:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Créer un compte médecin
  static async createMedecinAccount(data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const userId = crypto.randomUUID();
      const medecinId = crypto.randomUUID();
      const passwordHash = hashPassword(data.password);
      
      const result = await session.run(
        `CREATE (u:Utilisateur {
          id: $userId,
          username: $username,
          passwordHash: $passwordHash,
          nom: $nom,
          prenom: $prenom,
          email: $email,
          role: 'medecin',
          dateCreation: datetime()
        })
        CREATE (m:Medecin {
          id: $medecinId,
          nom: $nom,
          prenom: $prenom,
          specialite: $specialite,
          telephone: $telephone,
          email: $email,
          numeroOrdre: $numeroOrdre,
          adresse: $adresse,
          dateCreation: datetime()
        })
        CREATE (u)-[:EST_MEDECIN]->(m)
        RETURN u, m`,
        { 
          userId,
          medecinId,
          username: data.username,
          passwordHash,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          specialite: data.specialite || '',
          telephone: data.telephone || '',
          numeroOrdre: data.numeroOrdre || '',
          adresse: data.adresse || ''
        }
      );
      
      const record = result.records[0];
      const user = toJavaScriptObject(record.get('u').properties);
      const medecin = toJavaScriptObject(record.get('m').properties);
      delete user.passwordHash;
      
      return { user, medecin };
    } catch (error) {
      console.error('❌ Erreur création compte médecin:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir les données complètes d'un utilisateur selon son rôle
  static async getFullUserData(userId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (u:Utilisateur {id: $userId})
         OPTIONAL MATCH (u)-[:EST_PATIENT]->(p:Patient)
         OPTIONAL MATCH (u)-[:EST_MEDECIN]->(m:Medecin)
         RETURN u, p, m`,
        { userId }
      );
      
      if (result.records.length === 0) return null;
      
      const record = result.records[0];
      const user = toJavaScriptObject(record.get('u').properties);
      delete user.passwordHash;
      delete user.motDePasse;
      
      const userData = { user };
      
      if (record.get('p')) {
        userData.patient = toJavaScriptObject(record.get('p').properties);
      }
      
      if (record.get('m')) {
        userData.medecin = toJavaScriptObject(record.get('m').properties);
      }
      
      return userData;
    } catch (error) {
      console.error('❌ Erreur getFullUserData:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = Utilisateur;