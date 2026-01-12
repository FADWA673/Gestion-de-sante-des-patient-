const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

// Tester la connexion avec la base de données spécifique
const testConnection = async () => {
  const session = driver.session({
    database: process.env.NEO4J_DATABASE || 'sgsp-db'
  });
  
  try {
    const result = await session.run('RETURN 1 as test');
    console.log('✅ Connexion à Neo4j réussie (base: ' + (process.env.NEO4J_DATABASE || 'sgsp-db') + ')');
    console.log('📊 Database:', process.env.NEO4J_DATABASE || 'sgsp-db');
    
    // Afficher un résumé des données
    const nodesResult = await session.run('MATCH (n) RETURN labels(n) as labels, count(n) as count');
    console.log('📈 Données existantes :');
    nodesResult.records.forEach(record => {
      const labels = record.get('labels');
      const count = record.get('count').toString();
      console.log(`   - ${labels.join(', ')}: ${count} nœud(s)`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à Neo4j:', error.message);
    console.error('🔍 Vérifiez que Neo4j est démarré et que les identifiants sont corrects');
    return false;
  } finally {
    await session.close();
  }
};

// Exécuter le test au démarrage
testConnection();

module.exports = driver;