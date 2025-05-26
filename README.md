# Visualiseur de Revêtement

Application Next.js pour visualiser des revêtements de terrasse avec l'IA OpenAI.

## 🚀 Déploiement sur Netlify

### 1. Préparer le repository GitHub

\`\`\`bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
\`\`\`

### 2. Configurer Netlify

1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez "New site from Git"
3. Choisissez GitHub et sélectionnez votre repository
4. Build settings (automatiquement détectés) :
   - **Build command** : `npm run build`
   - **Publish directory** : `.next`

### 3. Configurer les variables d'environnement

Dans Netlify Dashboard → Site settings → Environment variables :

- **Key** : `OPENAI_API_KEY`
- **Value** : Votre clé API OpenAI (sk-...)
- **Scopes** : All deploy contexts

### 4. Tester le déploiement

Après le déploiement, testez avec :

\`\`\`bash
npm run deploy-test https://votre-site.netlify.app
\`\`\`

## 🧪 Tests en développement

### Test local
\`\`\`bash
npm run dev
npm run test-api
\`\`\`

### Test de l'API OpenAI
Visitez : `http://localhost:3000/api/test-openai`

### Health check
Visitez : `http://localhost:3000/api/health`

## 📋 Checklist de déploiement

### Avant le déploiement
- [ ] Clé API OpenAI valide
- [ ] Code testé localement
- [ ] Repository GitHub à jour

### Configuration Netlify
- [ ] Site connecté au repository GitHub
- [ ] Variable `OPENAI_API_KEY` configurée
- [ ] Build settings corrects

### Après le déploiement
- [ ] Site accessible
- [ ] Test API réussi (`/api/test-openai`)
- [ ] Upload d'image fonctionne
- [ ] Traitement d'image fonctionne

## 🔧 Développement

\`\`\`bash
# Installation
npm install

# Développement
npm run dev

# Test de l'API
npm run test-api

# Build
npm run build
\`\`\`

## 📁 Structure du projet

\`\`\`
├── app/
│   ├── actions.ts          # Server actions
│   ├── page.tsx           # Page principale
│   └── api/
│       ├── health/        # Health check
│       └── test-openai/   # Test API OpenAI
├── components/
│   ├── image-edit-form.tsx
│   └── before-after-slider.tsx
├── scripts/
│   ├── test-api.js        # Test local
│   └── deploy-test.js     # Test déploiement
├── next.config.js         # Configuration Next.js
├── netlify.toml          # Configuration Netlify
└── package.json
\`\`\`

## 🆘 Dépannage

### Erreur "OPENAI_API_KEY not configured"
- Vérifiez que la variable est bien définie dans Netlify
- Redéployez le site après avoir ajouté la variable

### Erreur "Invalid API key"
- Vérifiez que votre clé OpenAI est valide
- Testez la clé avec : `curl -H "Authorization: Bearer YOUR_KEY" https://api.openai.com/v1/models`

### Site ne se charge pas
- Vérifiez les logs de build dans Netlify
- Assurez-vous que `next.config.js` et `netlify.toml` sont corrects
