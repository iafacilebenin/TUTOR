# LE MENTOR BÉNINOIS - LMS

## Description

Système de Formation aux Examens Nationaux de la République du Bénin (CEP, BEPC, BAC)

Application LMS (Learning Management System) avec méthode socratique et système de notation 0-20 conforme au système éducatif béninois.

## Fonctionnalités

### ✅ Implémentées
- **Carnet de Notes** : Système de notation 0-20 avec appréciations officielles
- **Méthode Socratique** : Jamais de réponse directe, système de "coups de pouce" avec pénalités
- **Exercices par niveau** : CEP, BEPC, BAC avec exercices authentiques
- **Tableau de bord** : Statistiques et progression par niveau
- **Méthodologie** : Guide complet pour dissertations, commentaires composés, problèmes
- **Persistance** : LocalStorage pour sauvegarder la progression
- **Évaluation automatique** : Analyse de la méthodologie et de la structure

### 🎯 Persona du Mentor

**Ton** : Sérieux, autoritaire, exigeant (comme un vrai professeur béninois)
**Langue** : Français standard du Bénin
**Philosophie** : "Revenons à nos moutons. Le temps presse."

### 📊 Système de Notation (0-20)

- **16-20** : Très Bien (Excellent)
- **14-15** : Bien
- **12-13** : Assez Bien
- **10-11** : Passable
- **08-09** : Insuffisant
- **00-07** : Médiocre

## Installation & Déploiement

### Option 1 : Déploiement Local (Développement)

1. Ouvrir le fichier `index.html` dans un navigateur moderne
2. Accepter le chargement des scripts CDN (React, ReactDOM, Babel)

**Note** : Nécessite une connexion internet pour charger React depuis unpkg.com

### Option 2 : Déploiement Netlify/Cloudflare (Production)

#### A. Netlify

1. Créer un compte sur [netlify.com](https://netlify.com)
2. Glisser-déposer le dossier `mentor-beninois-lms` dans Netlify Drop
3. Le site sera immédiatement en ligne avec HTTPS

#### B. Cloudflare Pages

1. Créer un compte sur [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connecter votre repository GitHub ou glisser-déposer les fichiers
3. Configuration :
   - Build command : (aucune)
   - Build output directory : `/`
   - Pas de framework nécessaire

### Option 3 : Serveur Local (Python)

```bash
cd mentor-beninois-lms
python3 -m http.server 8000
```

Ouvrir : http://localhost:8000

### Option 4 : Version Optimisée (Sans CDN)

Pour une version hors-ligne complète, il faudrait :
1. Télécharger React en local
2. Transpiler JSX en JS avec Babel CLI
3. Bundler avec Webpack/Rollup

## Structure des Fichiers

```
mentor-beninois-lms/
├── index.html       # Point d'entrée HTML
├── styles.css       # Styles (esthétique scolaire béninoise)
├── app.jsx          # Application React complète
└── README.md        # Ce fichier
```

## Architecture Technique

### Stack
- **React 18** (via CDN unpkg.com)
- **Vanilla CSS** (design system avec variables CSS)
- **LocalStorage API** (persistance des données)
- **Babel Standalone** (transpilation JSX côté client)

### Composants Principaux

1. **App** : Composant racine avec gestion d'état
2. **AppHeader** : En-tête avec infos élève et moyenne
3. **Navigation** : Menu 4 onglets (Dashboard, Exercices, Carnet, Méthodologie)
4. **Dashboard** : Statistiques et progression
5. **ExercisesList** : Grille d'exercices filtrables par niveau
6. **ExerciseModal** : Interface de travail avec système de hints
7. **Gradebook** : Tableau des notes style carnet scolaire
8. **Methodology** : Documentation complète méthodologie béninoise

### Logique d'Évaluation

La fonction `evaluateAnswer()` analyse :
- Longueur de la réponse
- Présence des étapes méthodologiques attendues
- Nombre d'indices utilisés (pénalités)

**Note** : Pour version production, intégrer NLP (Natural Language Processing) pour analyse sémantique plus poussée.

## Base de Données d'Exercices

### Structure

```javascript
EXERCISES_DATABASE = {
  CEP: [],    // Exercices niveau CEP
  BEPC: [],   // Exercices niveau BEPC
  BAC: []     // Exercices niveau BAC
}
```

### Format d'un Exercice

```javascript
{
  id: 'unique-id',
  level: 'CEP|BEPC|BAC',
  subject: 'Matière',
  title: 'Titre court',
  question: 'Énoncé complet',
  hints: ['Indice 1', 'Indice 2', 'Indice 3'],
  expectedSteps: ['Étape 1', 'Étape 2'],
  correctAnswer: 'Réponse attendue'
}
```

### Ajouter des Exercices

Éditer `app.jsx`, section `EXERCISES_DATABASE`, et ajouter des objets suivant le format ci-dessus.

## Personnalisation

### Couleurs (Drapeau Béninois)

Variables CSS dans `styles.css` :

```css
--color-primary: #1a472a;    /* Vert */
--color-secondary: #fcd116;   /* Jaune */
--color-accent: #e8112d;      /* Rouge */
```

### Grading Logic

Modifier la fonction `evaluateAnswer()` dans `app.jsx` pour ajuster :
- Critères d'évaluation
- Sévérité des pénalités
- Feedback automatique

### Tone of Voice

Modifier les strings de feedback dans :
- `getAppreciation()`
- `evaluateAnswer()`

## Limitations & Améliorations Futures

### Limitations Actuelles
- Évaluation basique (longueur + keywords)
- Pas d'IA pour analyse sémantique
- Pas de backend (données en LocalStorage seulement)
- Dépendance CDN pour React

### Roadmap
- [ ] Intégration Claude API pour évaluation IA
- [ ] Backend Node.js + MongoDB
- [ ] Authentification multi-utilisateurs
- [ ] Export PDF du Carnet de Notes
- [ ] Mode hors-ligne complet (PWA)
- [ ] Version mobile native (React Native)
- [ ] Exercices collaboratifs (peer review)
- [ ] Système de badges et récompenses

## Support Navigateurs

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer : Non supporté

## Performance

### Optimisations Implémentées
- CSS Variables pour thème cohérent
- LocalStorage pour éviter appels serveur
- Composants React purs (useCallback, useMemo implicites)

### Recommandations Réseau
- Fonctionne avec connexions 3G/4G au Bénin
- CDN unpkg.com généralement rapide en Afrique de l'Ouest
- Pour déploiement école : héberger React en local

## Licence

Projet éducatif - Libre d'utilisation pour écoles béninoises.

## Contact & Contribution

Pour ajouter des exercices authentiques ou améliorer l'algorithme d'évaluation, contactez le développeur.

---

**Devise du Mentor Béninois** : "Revenons à nos moutons. Le temps presse."

🇧🇯 Fait pour les élèves de la République du Bénin.
