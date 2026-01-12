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

class RendezVous {
  // Créer un rendez-vous
  static async create(data) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const id = crypto.randomUUID();
      
      const result = await session.run(
        `MATCH (p:Patient {id: $patientId})
         MATCH (m:Medecin {id: $medecinId})
         CREATE (r:RendezVous {
           id: $id,
           dateHeure: datetime($dateHeure),
           motif: $motif,
           statut: $statut,
           notes: $notes,
           duree: $duree,
           dateCreation: datetime()
         })
         CREATE (p)-[:A_RDV]->(r)
         CREATE (m)-[:RECU_PAR]->(r)
         RETURN r, p, m`,
        { 
          id,
          patientId: data.patientId,
          medecinId: data.medecinId,
          dateHeure: data.dateHeure,
          motif: data.motif,
          statut: data.statut || 'Planifié',
          notes: data.notes || '',
          duree: data.duree || 30
        }
      );
      
      const record = result.records[0];
      return {
        rendezVous: toJavaScriptObject(record.get('r').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      };
    } catch (error) {
      console.error('❌ Erreur création RDV:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Récupérer tous les rendez-vous
  static async findAll() {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (p:Patient)-[:A_RDV]->(r:RendezVous)
         MATCH (m:Medecin)-[:RECU_PAR]->(r)
         RETURN r, p, m
         ORDER BY r.dateHeure DESC`
      );
      
      return result.records.map(record => {
        const rdv = toJavaScriptObject(record.get('r').properties);
        const patient = toJavaScriptObject(record.get('p').properties);
        const medecin = toJavaScriptObject(record.get('m').properties);
        
        // Utiliser date et heure existantes ou extraire de dateHeure
        let date = rdv.date, heure = rdv.heure;
        if (rdv.dateHeure && !date && !heure) {
          const dateTime = new Date(rdv.dateHeure);
          date = dateTime.toISOString().split('T')[0];
          heure = dateTime.toTimeString().split(' ')[0].substring(0, 5);
        }
        
        return {
          id: rdv.id,
          date: date,
          heure: heure,
          motif: rdv.motif,
          statut: rdv.statut,
          notes: rdv.notes,
          duree: rdv.duree,
          dateCreation: rdv.dateCreation,
          patient: patient,
          medecin: medecin
        };
      });
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Trouver par date
  static async findByDate(date) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (p:Patient)-[:A_RDV]->(r:RendezVous)
         MATCH (m:Medecin)-[:RECU_PAR]->(r)
         WHERE date(r.dateHeure) = date($date)
         RETURN r, p, m
         ORDER BY r.dateHeure`,
        { date }
      );
      
      return result.records.map(record => ({
        rendezVous: toJavaScriptObject(record.get('r').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      }));
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Trouver par médecin
  static async findByMedecin(medecinId) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (m:Medecin {id: $medecinId})-[:RECU_PAR]->(r:RendezVous)
         MATCH (p:Patient)-[:A_RDV]->(r)
         RETURN r, p, m
         ORDER BY r.dateHeure`,
        { medecinId }
      );
      
      return result.records.map(record => {
        const rdv = toJavaScriptObject(record.get('r').properties);
        const patient = toJavaScriptObject(record.get('p').properties);
        const medecin = toJavaScriptObject(record.get('m').properties);
        
        // Utiliser date et heure existantes ou extraire de dateHeure
        let date = rdv.date, heure = rdv.heure;
        if (rdv.dateHeure && !date && !heure) {
          const dateTime = new Date(rdv.dateHeure);
          date = dateTime.toISOString().split('T')[0];
          heure = dateTime.toTimeString().split(' ')[0].substring(0, 5);
        }
        
        return {
          id: rdv.id,
          date: date,
          heure: heure,
          motif: rdv.motif,
          statut: rdv.statut,
          notes: rdv.notes,
          duree: rdv.duree,
          dateCreation: rdv.dateCreation,
          patient: patient,
          medecin: medecin
        };
      });
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Trouver par mois
  static async findByMonth(year, month) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (p:Patient)-[:A_RDV]->(r:RendezVous)
         MATCH (m:Medecin)-[:RECU_PAR]->(r)
         WHERE r.dateHeure.year = $year AND r.dateHeure.month = $month
         RETURN r, p, m
         ORDER BY r.dateHeure`,
        { year: parseInt(year), month: parseInt(month) }
      );
      
      return result.records.map(record => ({
        rendezVous: toJavaScriptObject(record.get('r').properties),
        patient: toJavaScriptObject(record.get('p').properties),
        medecin: toJavaScriptObject(record.get('m').properties)
      }));
    } catch (error) {
      throw error;
    } finally {
      await session.close();
    }
  }

  // Mettre à jour le statut
  static async updateStatut(id, statut) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      const result = await session.run(
        `MATCH (p:Patient)-[:A_RDV]->(r:RendezVous {id: $id})
         MATCH (m:Medecin)-[:RECU_PAR]->(r)
         SET r.statut = $statut
         RETURN r, p, m`,
        { id, statut }
      );
      
      if (result.records.length === 0) return null;
      
      const record = result.records[0];
      const rdv = toJavaScriptObject(record.get('r').properties);
      const patient = toJavaScriptObject(record.get('p').properties);
      const medecin = toJavaScriptObject(record.get('m').properties);
      
      // Utiliser date et heure existantes ou extraire de dateHeure
      let date = rdv.date, heure = rdv.heure;
      if (rdv.dateHeure && !date && !heure) {
        const dateTime = new Date(rdv.dateHeure);
        date = dateTime.toISOString().split('T')[0];
        heure = dateTime.toTimeString().split(' ')[0].substring(0, 5);
      }
      
      return {
        id: rdv.id,
        date: date,
        heure: heure,
        motif: rdv.motif,
        statut: rdv.statut,
        notes: rdv.notes,
        duree: rdv.duree,
        dateCreation: rdv.dateCreation,
        patient: patient,
        medecin: medecin
      };
    } finally {
      await session.close();
    }
  }

  // Mettre à jour un rendez-vous complet
  static async update(id, updateData) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      console.log('🔄 Mise à jour RDV:', id, updateData);
      
      const result = await session.run(
        `MATCH (p:Patient)-[:A_RDV]->(r:RendezVous {id: $id})
         MATCH (m:Medecin)-[:RECU_PAR]->(r)
         SET r.dateHeure = datetime($dateHeure),
             r.motif = $motif,
             r.statut = $statut,
             r.notes = $notes,
             r.duree = $duree
         RETURN r, p, m`,
        { 
          id, 
          dateHeure: updateData.dateHeure,
          motif: updateData.motif || '',
          statut: updateData.statut || 'En attente',
          notes: updateData.notes || '',
          duree: updateData.duree || 30
        }
      );
      
      if (result.records.length === 0) {
        console.log('❌ RDV non trouvé:', id);
        return null;
      }
      
      console.log('✅ RDV mis à jour avec succès');
      
      const record = result.records[0];
      const rdv = toJavaScriptObject(record.get('r').properties);
      const patient = toJavaScriptObject(record.get('p').properties);
      const medecin = toJavaScriptObject(record.get('m').properties);
      
      // Utiliser date et heure existantes ou extraire de dateHeure
      let date = rdv.date, heure = rdv.heure;
      if (rdv.dateHeure && !date && !heure) {
        const dateTime = new Date(rdv.dateHeure);
        date = dateTime.toISOString().split('T')[0];
        heure = dateTime.toTimeString().split(' ')[0].substring(0, 5);
      }
      
      return {
        id: rdv.id,
        date: date,
        heure: heure,
        motif: rdv.motif,
        statut: rdv.statut,
        notes: rdv.notes,
        duree: rdv.duree,
        dateCreation: rdv.dateCreation,
        patient: patient,
        medecin: medecin
      };
    } finally {
      await session.close();
    }
  }

  // Supprimer
  static async delete(id) {
    const session = driver.session({
      database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    try {
      await session.run(
        'MATCH (r:RendezVous {id: $id}) DETACH DELETE r',
        { id }
      );
      return true;
    } finally {
      await session.close();
    }
  }
}

module.exports = RendezVous;