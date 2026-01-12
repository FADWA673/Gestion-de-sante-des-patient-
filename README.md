# SGSP - Système de Gestion de Santé des Patients

## 🏥 Description

SGSP est un système complet de gestion hospitalière avec des interfaces dédiées pour les administrateurs, médecins et patients. Le système permet la gestion des comptes utilisateurs, consultations, diagnostics, traitements et rendez-vous.

## 🚀 Fonctionnalités Principales

### 👨‍💼 Interface Administrateur
- **Tableau de bord** avec statistiques globales
- **Gestion des comptes** : Création de comptes patients et médecins
- **Gestion des patients** : CRUD complet
- **Gestion des médecins** : CRUD complet
- **Gestion des consultations** : Suivi des consultations
- **Gestion des diagnostics** : Suivi des diagnostics
- **Gestion des traitements** : Suivi des traitements
- **Calendrier** : Gestion des rendez-vous
- **Facturation** : Gestion des factures

### 👨‍⚕️ Interface Médecin
- **Tableau de bord médecin** avec statistiques personnelles
- **Mes patients** : Liste des patients suivis
- **Consultations** : Historique et gestion des consultations
- **Planning** : Gestion du planning personnel
- **Diagnostics** : Gestion des diagnostics établis
- **Prescriptions** : Gestion des prescriptions médicales
- **Profil** : Informations professionnelles

### 👤 Interface Patient
- **Tableau de bord patient** avec informations personnelles
- **Mes consultations** : Historique des consultations
- **Mes rendez-vous** : Rendez-vous programmés
- **Mes traitements** : Traitements en cours
- **Mon profil** : Informations personnelles et médicales

## 🔐 Système d'Authentification

### Rôles et Permissions
- **Admin** : Accès complet au système + gestion des comptes
- **Médecin** : Interface médicale spécialisée
- **Patient** : Interface patient avec accès limité aux données personnelles

### Redirection Automatique
Après connexion, l'utilisateur est automatiquement redirigé vers son interface :
- Admin → `/dashboard.html`
- Médecin → `/medecin-dashboard.html`
- Patient → `/patient-dashboard.html`

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js (v14+)
- Neo4j (optionnel pour la version complète)

### Installation
```bash
npm install
```

### Démarrage

#### Mode Démonstration (sans Neo4j)
```bash
node server-demo.js
```

#### Mode Complet (avec Neo4j)
```bash
# Assurez-vous que Neo4j est démarré
node server.js
```

### Accès au Système
- **Page d'accueil** : http://localhost:3000
- **Connexion** : http://localhost:3000/login.html
- **Test API** : http://localhost:3000/test-db

## 👥 Comptes par Défaut

### Premier Démarrage
Au premier démarrage, aucun administrateur n'existe. La page de connexion affichera un message pour créer le premier admin avec les identifiants :
- **Username** : `admin`
- **Password** : `admin123`

### Création de Comptes
Seul l'administrateur peut créer des comptes :
1. Se connecter en tant qu'admin
2. Aller dans "Gestion des Comptes"
3. Créer des comptes patients ou médecins

## 🎨 Interface Utilisateur

### Design
- **Framework CSS** : Tailwind CSS
- **Style** : Design moderne et professionnel
- **Responsive** : Compatible mobile et desktop
- **Navigation** : Sidebar avec navigation contextuelle selon le rôle

### Couleurs par Rôle
- **Admin** : Bleu (Sky)
- **Médecin** : Vert (Green)
- **Patient** : Bleu (Blue)

## 📁 Structure du Projet

```
SGSP/
├── public/                     # Fichiers statiques
│   ├── css/                   # Styles CSS
│   ├── js/                    # Scripts JavaScript
│   ├── images/                # Images
│   ├── index.html             # Page d'accueil
│   ├── login.html             # Page de connexion
│   ├── dashboard.html         # Tableau de bord admin
│   ├── patient-dashboard.html # Interface patient
│   ├── medecin-dashboard.html # Interface médecin
│   ├── gestion-comptes.html   # Gestion des comptes
│   └── ...                    # Autres pages
├── models/                    # Modèles de données
├── controllers/               # Contrôleurs
├── routes/                    # Routes API
├── config/                    # Configuration
├── server.js                  # Serveur principal (avec Neo4j)
├── server-demo.js            # Serveur de démonstration
└── README.md                 # Documentation
```

## 🔧 Configuration

### Variables d'Environnement (.env)
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=votre_mot_de_passe
NEO4J_DATABASE=sgsp-db
PORT=3000
```

## 🧪 Test du Système

### Test de l'API
```bash
curl http://localhost:3000/test-db
```

### Test de Connexion
1. Aller sur http://localhost:3000/login.html
2. Créer le premier admin si nécessaire
3. Se connecter avec `admin` / `admin123`
4. Tester la création de comptes dans "Gestion des Comptes"

## 📊 Base de Données

### Mode Démonstration
- Base de données en mémoire (JavaScript)
- Données perdues au redémarrage
- Parfait pour les tests et démonstrations

### Mode Production
- Neo4j (base de données graphique)
- Persistance des données
- Relations complexes entre entités

## 🔮 Fonctionnalités Futures

- [ ] Système de notifications en temps réel
- [ ] Intégration avec des équipements médicaux
- [ ] Rapports et statistiques avancées
- [ ] API mobile
- [ ] Système de messagerie interne
- [ ] Gestion des stocks de médicaments

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou support, contactez l'équipe de développement.

---

**SGSP** - Système de Gestion de Santé des Patients
*Développé avec ❤️ pour améliorer les soins de santé*