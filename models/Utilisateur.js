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
      console.log('🔐 Tentative de connexion:', username);
      const passwordHash = hashPassword(password);
      
      // Requête simple sans paramètres complexes
      const result = await session.run(
        `MATCH (u:Utilisateur)
         WHERE u.username = $username
         RETURN u`,
        { username }
      );
      
      if (result.records.length === 0) {
        console.log('❌ Utilisateur non trouvé:', username);
        return null;
      }
      
      const user = toJavaScriptObject(result.records[0].get('u').properties);
      
      // Vérifier le mot de passe
      const storedPasswordHash = user.passwordHash || user.motDePasse;
      if (storedPasswordHash !== passwordHash && storedPasswordHash !== password) {
        console.log('❌ Mot de passe incorrect pour:', username);
        return null;
      }
      
      delete user.passwordHash;
      delete user.motDePasse;
      
      console.log('✅ Connexion réussie:', user.username, '- Rôle:', user.role);
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

  // Créer un compte pour un patient existant
  static async createAccountForExistingPatient(patientId, userData) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const userId = crypto.randomUUID();
      const passwordHash = hashPassword(userData.password);
      
      // Vérifier que le patient existe
      const patientCheck = await session.run(
        `MATCH (p:Patient {id: $patientId}) RETURN p`,
        { patientId }
      );
      
      if (patientCheck.records.length === 0) {
        throw new Error('Patient non trouvé');
      }
      
      const patient = toJavaScriptObject(patientCheck.records[0].get('p').properties);
      
      // Créer l'utilisateur et la relation
      const result = await session.run(
        `MATCH (p:Patient {id: $patientId})
         CREATE (u:Utilisateur {
           id: $userId,
           username: $username,
           passwordHash: $passwordHash,
           nom: p.nom,
           prenom: p.prenom,
           email: p.email,
           role: 'patient',
           dateCreation: datetime()
         })
         CREATE (u)-[:EST_PATIENT]->(p)
         RETURN u, p`,
        { 
          patientId,
          userId,
          username: userData.username,
          passwordHash
        }
      );
      
      const record = result.records[0];
      const user = toJavaScriptObject(record.get('u').properties);
      delete user.passwordHash;
      
      return { user, patient };
    } catch (error) {
      console.error('❌ Erreur création compte patient existant:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Créer un compte pour un médecin existant
  static async createAccountForExistingMedecin(medecinId, userData) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const userId = crypto.randomUUID();
      const passwordHash = hashPassword(userData.password);
      
      // Vérifier que le médecin existe
      const medecinCheck = await session.run(
        `MATCH (m:Medecin {id: $medecinId}) RETURN m`,
        { medecinId }
      );
      
      if (medecinCheck.records.length === 0) {
        throw new Error('Médecin non trouvé');
      }
      
      const medecin = toJavaScriptObject(medecinCheck.records[0].get('m').properties);
      
      // Créer l'utilisateur et la relation
      const result = await session.run(
        `MATCH (m:Medecin {id: $medecinId})
         CREATE (u:Utilisateur {
           id: $userId,
           username: $username,
           passwordHash: $passwordHash,
           nom: m.nom,
           prenom: m.prenom,
           email: m.email,
           role: 'medecin',
           dateCreation: datetime()
         })
         CREATE (u)-[:EST_MEDECIN]->(m)
         RETURN u, m`,
        { 
          medecinId,
          userId,
          username: userData.username,
          passwordHash
        }
      );
      
      const record = result.records[0];
      const user = toJavaScriptObject(record.get('u').properties);
      delete user.passwordHash;
      
      return { user, medecin };
    } catch (error) {
      console.error('❌ Erreur création compte médecin existant:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir tous les patients sans compte utilisateur
  static async getPatientsWithoutAccount() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (p:Patient)
         WHERE NOT EXISTS {
           MATCH (u:Utilisateur)-[:EST_PATIENT]->(p)
         }
         RETURN p
         ORDER BY p.nom, p.prenom`
      );
      
      return result.records.map(record => 
        toJavaScriptObject(record.get('p').properties)
      );
    } catch (error) {
      console.error('❌ Erreur getPatientsWithoutAccount:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Obtenir tous les médecins sans compte utilisateur
  static async getMedecinsWithoutAccount() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (m:Medecin)
         WHERE NOT EXISTS {
           MATCH (u:Utilisateur)-[:EST_MEDECIN]->(m)
         }
         RETURN m
         ORDER BY m.nom, m.prenom`
      );
      
      return result.records.map(record => 
        toJavaScriptObject(record.get('m').properties)
      );
    } catch (error) {
      console.error('❌ Erreur getMedecinsWithoutAccount:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
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

  // Supprimer un utilisateur et ses relations
  static async delete(userId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      console.log('🗑️ Suppression utilisateur ID:', userId);
      
      // Supprimer l'utilisateur et toutes ses relations
      const result = await session.run(
        'MATCH (u:Utilisateur {id: $userId}) DETACH DELETE u RETURN count(u) as deleted',
        { userId }
      );
      
      const deletedCount = result.records[0]?.get('deleted').toNumber() || 0;
      console.log('✅ Utilisateurs supprimés:', deletedCount);
      
      if (deletedCount === 0) {
        throw new Error('Utilisateur non trouvé');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Trouver un utilisateur par ID
  static async findById(userId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        'MATCH (u:Utilisateur {id: $userId}) RETURN u',
        { userId }
      );
      
      if (result.records.length === 0) return null;
      return toJavaScriptObject(result.records[0].get('u').properties);
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Mettre à jour le mot de passe d'un utilisateur
  static async updatePassword(userId, newPassword) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const passwordHash = hashPassword(newPassword);
      
      console.log('🔐 Mise à jour mot de passe pour utilisateur ID:', userId);
      
      const result = await session.run(
        `MATCH (u:Utilisateur {id: $userId})
         SET u.passwordHash = $passwordHash
         RETURN u`,
        { userId, passwordHash }
      );
      
      if (result.records.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }
      
      console.log('✅ Mot de passe mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur updatePassword:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = Utilisateur;