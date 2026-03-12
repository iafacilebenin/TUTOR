# Le Mentor Béninois 🎓

**Système de Formation aux Examens Nationaux - République du Bénin**

Un tuteur IA intelligent pour accompagner les élèves béninois dans leur préparation aux examens CEP, BEPC et BAC.

## 🌟 Fonctionnalités

- **Exercices interactifs** : Pratique guidée pour CEP, BEPC et BAC
- **Correction IA** : Feedback intelligent et personnalisé sur 20 points
- **Carnet de notes** : Suivi complet de la progression
- **Méthodologie** : Guides pour la dissertation, le commentaire composé, et les problèmes de mathématiques
- **Système d'identité** : Profil élève persistant avec synchronisation cloud

## 📁 Architecture du Projet

```
TUTOR/
├── index.html              # Page principale (CDN React)
├── styles.css              # Styles CSS
├── favicon.png             # Icône
│
├── src/
│   ├── App.jsx             # Application React principale
│   ├── services/
│   │   ├── identityService.js   # Gestion identité élève (localStorage)
│   │   └── dbService.js         # Communication API serveur
│   └── hooks/
│       └── useStudentIdentity.js # Hook React pour l'identité
│
├── worker/
│   └── index.js            # Cloudflare Worker (API + D1)
│
├── schema/
│   └── d1_schema.sql       # Schéma base de données D1
│
└── README.md
```

## 🚀 Déploiement

### Frontend (GitHub Pages ou Cloudflare Pages)

Le frontend est une application React côté client utilisant les CDN. Il suffit de servir les fichiers statiques.

```bash
# Déploiement sur GitHub Pages
git push origin main
# Puis activer GitHub Pages dans les paramètres du repo
```

### Backend (Cloudflare Worker avec D1)

#### 1. Créer la base de données D1

```bash
# Installer Wrangler CLI
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login

# Créer la base de données D1
wrangler d1 create mentor-beninois-db

# Exécuter le schéma SQL
wrangler d1 execute mentor-beninois-db --file=./schema/d1_schema.sql
```

#### 2. Configurer wrangler.toml

Créer un fichier `wrangler.toml` dans le dossier `worker/` :

```toml
name = "iabeninois-api"
main = "index.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "mentor-beninois-db"
database_id = "VOTRE_DATABASE_ID"  # Obtenu après wrangler d1 create

[vars]
# Variables d'environnement (à définir dans le dashboard Cloudflare)
# ROUTELLM_API_KEY = "..."
# HF_API = "..."
```

#### 3. Déployer le Worker

```bash
cd worker
wrangler deploy
```

## 📊 API Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/` | Correction IA d'un exercice |
| `POST` | `/student/register` | Enregistrer un nouvel élève |
| `POST` | `/student/session` | Logger une session |
| `POST` | `/grade/save` | Sauvegarder une note |
| `GET` | `/student/:id/progress` | Récupérer la progression |

### Exemples d'appels API

**Enregistrer un élève :**
```json
POST /student/register
{
  "id": "uuid-eleve",
  "name": "KOSSOU Jean-Baptiste",
  "school": "CEG Gbégamey",
  "city": "Cotonou",
  "targetLevel": "BEPC"
}
```

**Sauvegarder une note :**
```json
POST /grade/save
{
  "studentId": "uuid-eleve",
  "exerciseId": "bepc-math-1",
  "level": "BEPC",
  "subject": "Mathématiques",
  "score": 15.5,
  "hintsUsed": 1,
  "studentAnswer": "...",
  "aiFeedback": "..."
}
```

## 🗄️ Schéma Base de Données

### Table `students`
- `id` (TEXT, PRIMARY KEY) - UUID généré côté client
- `name` (TEXT) - Nom complet
- `school` (TEXT) - École
- `city` (TEXT) - Ville
- `target_level` (TEXT) - CEP, BEPC, ou BAC
- `created_at` (TEXT) - Date de création
- `last_seen_at` (TEXT) - Dernière connexion

### Table `exercise_attempts`
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `student_id` (TEXT) - Référence élève
- `exercise_id` (TEXT) - ID exercice
- `level` (TEXT) - Niveau
- `subject` (TEXT) - Matière
- `score` (REAL) - Note sur 20
- `hints_used` (INTEGER) - Indices utilisés
- `student_answer` (TEXT) - Réponse
- `ai_feedback` (TEXT) - Feedback IA
- `attempted_at` (TEXT) - Date

### Table `student_sessions`
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `student_id` (TEXT) - Référence élève
- `started_at` (TEXT) - Début session
- `device_hint` (TEXT) - User-Agent

## 🔧 Variables d'Environnement

Configurer dans le dashboard Cloudflare Workers :

- `ROUTELLM_API_KEY` - Clé API RouteLLM/Abacus
- `HF_API` - Clé API Hugging Face (optionnel)

## 📱 Utilisation

1. **Premier accès** : L'élève remplit un formulaire rapide (nom, école, ville, niveau visé)
2. **Auto-login** : Les sessions suivantes reconnaissent automatiquement l'élève
3. **Exercices** : Choisir un exercice, répondre, obtenir une correction IA
4. **Carnet de notes** : Consulter l'historique et la progression

## 🛡️ Confidentialité

- Les données sont stockées localement (localStorage) et sur Cloudflare D1
- UUID anonyme pour identifier les élèves
- Pas de données personnelles sensibles collectées

## 📄 Licence

Ce projet est développé pour l'éducation au Bénin.

---

**IA Facile Bénin** - Rendre l'IA accessible à tous 🇧🇯
