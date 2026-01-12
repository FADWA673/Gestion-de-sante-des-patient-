const driver = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Consultation {
    // Créer une nouvelle consultation
    static async create(consultationData) {
        const session = driver.session({
            database: process.env.NEO4J_DATABASE || 'sgsp-db'
        });
        
        try {
            const consultationId = uuidv4();
            const now = new Date().toISOString();
            
            const result = await session.run(`
                MATCH (m:Medecin {id: $medecinId})
                MATCH (p:Patient {id: $patientId})
                CREATE (c:Consultation {
                    id: $consultationId,
                    date: $date,
                    motif: $motif,
                    diagnostic: $diagnostic,
                    traitement: $traitement,
                    notes: $notes,
                    statut: $statut,
                    dateCreation: $dateCreation,
                    dateModification: $dateModification
                })
                CREATE (m)-[:A_CONSULTE]->(c)
                CREATE (p)-[:A_EU_CONSULTATION]->(c)
                CREATE (c)-[:CONCERNE]->(p)
                CREATE (c)-[:EFFECTUEE_PAR]->(m)
                RETURN c, m, p
            `, {
                consultationId,
                medecinId: consultationData.medecinId,
                patientId: consultationData.patientId,
                date: consultationData.date,
                motif: consultationData.motif || '',
                diagnostic: consultationData.diagnostic || '',
                traitement: consultationData.traitement || '',
                notes: consultationData.notes || '',
                statut: consultationData.statut || 'terminee',
                dateCreation: now,
                dateModification: now
            });
            
            if (result.records.length === 0) {
                throw new Error('Impossible de créer la consultation');
            }
            
            const record = result.records[0];
            return {
                consultation: record.get('c').properties,
                medecin: record.get('m').properties,
                patient: record.get('p').properties
            };
            
        } finally {
            await session.close();
        }
    }
    
    // Obtenir toutes les consultations (pour admin)
    static async getAll() {
        const session = driver.session({
            database: process.env.NEO4J_DATABASE || 'sgsp-db'
        });
        
        try {
            const result = await session.run(`
                MATCH (c:Consultation)-[:EFFECTUEE_PAR]->(m:Medecin)
                MATCH (c)-[:CONCERNE]->(p:Patient)
                RETURN c, m, p
                ORDER BY c.dateCreation DESC
            `);
            
            return result.records.map(record => ({
                consultation: record.get('c').properties,
                medecin: record.get('m').properties,
                patient: record.get('p').properties
            }));
            
        } finally {
            await session.close();
        }
    }
    
    // Obtenir les consultations d'un médecin
    static async getByMedecin(medecinId) {
        const session = driver.session({
            database: process.env.NEO4J_DATABASE || 'sgsp-db'
        });
        
        try {
            const result = await session.run(`
                MATCH (m:Medecin {id: $medecinId})-[:A_CONSULTE]->(c:Consultation)
                MATCH (c)-[:CONCERNE]->(p:Patient)
                RETURN c, m, p
                ORDER BY c.dateCreation DESC
            `, { medecinId });
            
            return result.records.map(record => ({
                consultation: record.get('c').properties,
                medecin: record.get('m').properties,
                patient: record.get('p').properties
            }));
            
        } finally {
            await session.close();
        }
    }
    
    // Obtenir les consultations d'un patient
    static async getByPatient(patientId) {
        const session = driver.session({
            database: process.env.NEO4J_DATABASE || 'sgsp-db'
        });
        
        try {
            const result = await session.run(`
                MATCH (p:Patient {id: $patientId})-[:A_EU_CONSULTATION]->(c:Consultation)
                MATCH (c)-[:EFFECTUEE_PAR]->(m:Medecin)
                RETURN c, m, p
                ORDER BY c.dateCreation DESC
            `, { patientId });
            
            return result.records.map(record => ({
                consultation: record.get('c').properties,
                medecin: record.get('m').properties,
                patient: record.get('p').properties
            }));
            
        } finally {
            await session.close();
        }
    }
    
    // Obtenir une consultation par ID
    static async getById(consultationId) {
        const session = driver.session({
            database: process.env.NEO4J_DATABASE || 'sgsp-db'
        });
        
        try {
            const result = await session.run(`
                MATCH (c:Consultation {id: $consultationId})
                MATCH (c)-[:EFFECTUEE_PAR]->(m:Medecin)
                MATCH (c)-[:CONCERNE]->(p:Patient)
                RETURN c, m, p
            `, { consultationId });
            
            if (result.records.length === 0) {
                return null;
            }
            
            const record = result.records[0];
            return {
                consultation: record.get('c').properties,
                medecin: record.get('m').properties,
                patient: record.get('p').properties
            };
            
        } finally {
            await session.close();
        }
    }
    
    // Modifier une consultation
    static async update(consultationId, updateData) {
        const session = driver.session({
            database: process.env.NEO4J_DATABASE || 'sgsp-db'
        });
        
        try {
            const now = new Date().toISOString();
            
            const result = await session.run(`
                MATCH (c:Consultation {id: $consultationId})
                SET c.date = $date,
                    c.motif = $motif,
                    c.diagnostic = $diagnostic,
                    c.traitement = $traitement,
                    c.notes = $notes,
                    c.statut = $statut,
                    c.dateModification = $dateModification
                WITH c
                MATCH (c)-[:EFFECTUEE_PAR]->(m:Medecin)
                MATCH (c)-[:CONCERNE]->(p:Patient)
                RETURN c, m, p
            `, {
                consultationId,
                date: updateData.date,
                motif: updateData.motif || '',
                diagnostic: updateData.diagnostic || '',
                traitement: updateData.traitement || '',
                notes: updateData.notes || '',
                statut: updateData.statut || 'terminee',
                dateModification: now
            });
            
            if (result.records.length === 0) {
                return null;
            }
            
            const record = result.records[0];
            return {
                consultation: record.get('c').properties,
                medecin: record.get('m').properties,
                patient: record.get('p').properties
            };
            
        } finally {
            await session.close();
        }
    }
    
    // Supprimer une consultation
    static async delete(consultationId) {
        const session = driver.session({
            database: process.env.NEO4J_DATABASE || 'sgsp-db'
        });
        
        try {
            const result = await session.run(`
                MATCH (c:Consultation {id: $consultationId})
                OPTIONAL MATCH (c)-[r]-()
                DELETE r, c
                RETURN count(c) as deleted
            `, { consultationId });
            
            const deleted = result.records[0].get('deleted').toNumber();
            return deleted > 0;
            
        } finally {
            await session.close();
        }
    }
    
    // Obtenir les statistiques des consultations
    static async getStats() {
        const session = driver.session({
            database: process.env.NEO4J_DATABASE || 'sgsp-db'
        });
        
        try {
            const result = await session.run(`
                MATCH (c:Consultation)
                OPTIONAL MATCH (c)-[:EFFECTUEE_PAR]->(m:Medecin)
                OPTIONAL MATCH (c)-[:CONCERNE]->(p:Patient)
                RETURN 
                    count(c) as totalConsultations,
                    count(DISTINCT m) as medecinsActifs,
                    count(DISTINCT p) as patientsConsultes,
                    count(CASE WHEN c.diagnostic <> '' THEN 1 END) as consultationsAvecDiagnostic,
                    count(CASE WHEN c.traitement <> '' THEN 1 END) as consultationsAvecTraitement
            `);
            
            const record = result.records[0];
            return {
                totalConsultations: record.get('totalConsultations').toNumber(),
                medecinsActifs: record.get('medecinsActifs').toNumber(),
                patientsConsultes: record.get('patientsConsultes').toNumber(),
                consultationsAvecDiagnostic: record.get('consultationsAvecDiagnostic').toNumber(),
                consultationsAvecTraitement: record.get('consultationsAvecTraitement').toNumber()
            };
            
        } finally {
            await session.close();
        }
    }
}

module.exports = Consultation;