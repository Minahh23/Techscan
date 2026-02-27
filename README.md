# TechScan — Guide de déploiement Vercel

## Structure du projet
```
techscan/
├── api/
│   └── analyze.js       ← Fonction serverless (clé API sécurisée ici)
├── public/
│   └── index.html       ← Interface utilisateur
├── vercel.json          ← Configuration Vercel
├── package.json
└── README.md
```

---

## Déploiement sur Vercel (étape par étape)

### 1. Installer Vercel CLI
```bash
npm install -g vercel
```

### 2. Se connecter
```bash
vercel login
```

### 3. Déployer depuis le dossier techscan/
```bash
vercel
```
Répondre : Y / votre compte / N / techscan / ./

### 4. OBLIGATOIRE — Ajouter la clé API Anthropic
Dashboard Vercel → votre projet → Settings → Environment Variables :
- Name  : ANTHROPIC_API_KEY
- Value : sk-ant-... (votre clé)
- Environment : Production + Preview + Development → Save

### 5. Redéployer
```bash
vercel --prod
```

---

## Obtenir une clé API Anthropic
https://console.anthropic.com → API Keys → Create Key

---

## Sécurité
La clé API n'est JAMAIS exposée dans le frontend.
Toutes les requêtes passent par /api/analyze.js (serveur Vercel).

---

## Développement local
```bash
vercel dev
```
Créer .env.local :
```
ANTHROPIC_API_KEY=sk-ant-votre-clé-ici
```

---

## Problèmes courants
- "Configuration serveur manquante" → Ajouter ANTHROPIC_API_KEY dans Vercel Settings
- "Clé API invalide" → Vérifier que la clé commence par sk-ant-
- "Limite de requêtes" → Attendre quelques secondes
- Page blanche → Vérifier que public/index.html existe
