require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');  // ← AJOUTÉ ICI
const driver = require('./config/database');
const facturationRoutes = require('./routes/facturationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static('public'));

// Routes API
app.use('/api/patients', require('./routes/patients'));
app.use('/api/medecins', require('./routes/medecins'));
app.use('/api/consultations', require('./routes/consultationRoutes')); // Nouvelle implémentation
app.use('/api/diagnostics', require('./routes/diagnostics'));
app.use('/api/traitements', require('./routes/traitements'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rendezvous', require('./routes/rendezvous'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/factures', facturationRoutes);

// Routes spéciales pour diagnostics et traitements depuis Neo4j
app.get('/api/diagnostics/patient/:patientId', async (req, res) => {
    const session = driver.session({
        database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    
    try {
        const { patientId } = req.params;
        
        console.log('🔍 Récupération diagnostics Neo4j pour patient:', patientId);
        
        // Récupérer tous les diagnostics liés au patient
        const result = await session.run(`
            MATCH (p:Patient {id: $patientId})-[:A_CONSULTATION]->(c:Consultation)
            OPTIONAL MATCH (c)-[:A_DIAGNOSTIC]->(d:Diagnostic)
            OPTIONAL MATCH (c)<-[:CONSULTE]-(m:Medecin)
            WHERE d IS NOT NULL
            RETURN d, c, m
            ORDER BY c.date DESC
        `, { patientId });
        
        const diagnostics = result.records.map(record => {
            const diagnostic = record.get('d') ? record.get('d').properties : null;
            const consultation = record.get('c') ? record.get('c').properties : null;
            const medecin = record.get('m') ? record.get('m').properties : null;
            
            return {
                diagnostic,
                consultation,
                medecin
            };
        });
        
        console.log('✅ Diagnostics Neo4j trouvés:', diagnostics.length);
        
        res.json({
            success: true,
            count: diagnostics.length,
            data: diagnostics
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération diagnostics Neo4j:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des diagnostics',
            error: error.message
        });
    } finally {
        await session.close();
    }
});

app.get('/api/traitements/patient/:patientId', async (req, res) => {
    const session = driver.session({
        database: process.env.NEO4J_DATABASE || 'sgsp-db'
    });
    
    try {
        const { patientId } = req.params;
        
        console.log('🔍 Récupération traitements Neo4j pour patient:', patientId);
        
        // Récupérer tous les traitements liés au patient
        const result = await session.run(`
            MATCH (p:Patient {id: $patientId})-[:A_CONSULTATION]->(c:Consultation)
            OPTIONAL MATCH (c)-[:A_TRAITEMENT]->(t:Traitement)
            OPTIONAL MATCH (c)<-[:CONSULTE]-(m:Medecin)
            WHERE t IS NOT NULL
            RETURN t, c, m
            ORDER BY c.date DESC
        `, { patientId });
        
        const traitements = result.records.map(record => {
            const traitement = record.get('t') ? record.get('t').properties : null;
            const consultation = record.get('c') ? record.get('c').properties : null;
            const medecin = record.get('m') ? record.get('m').properties : null;
            
            return {
                traitement,
                consultation,
                medecin
            };
        });
        
        console.log('✅ Traitements Neo4j trouvés:', traitements.length);
        
        res.json({
            success: true,
            count: traitements.length,
            data: traitements
        });
        
    } catch (error) {
        console.error('❌ Erreur récupération traitements Neo4j:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des traitements',
            error: error.message
        });
    } finally {
        await session.close();
    }
});

// Route racine - REDIRIGER vers la page d'accueil de l'hôpital
app.get('/', (req, res) => {
  console.log('📍 Accès à la racine - Redirection vers la page d\'accueil de l\'hôpital');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route de test Neo4j
app.get('/test-db', async (req, res) => {
  const session = driver.session({ database: 'sgsp-db' });
  try {
    const result = await session.run('RETURN "Connexion réussie!" as message');
    res.json({ 
      success: true,
      message: result.records[0].get('message') 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  } finally {
    await session.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Page d'accueil: http://localhost:${PORT}`);
  console.log(`🔐 Page de connexion: http://localhost:${PORT}/login.html`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
});

// Fermeture propre
process.on('SIGINT', async () => {
  //await driver.close();
  console.log('👋 Connexion Neo4j fermée');
  process.exit(0);
});