# 316 Développement — Site + Agent CIR/CII
## Guide de déploiement Vercel (15 minutes)

---

## Structure du projet

```
316dev-site/
├── api/
│   └── chat.js          ← Proxy sécurisé (clé API côté serveur)
├── public/
│   ├── index.html       ← Page d'accueil du site
│   ├── agent.html       ← Page dédiée à l'agent IA
│   └── agent-widget.js  ← Code partagé (widget flottant + agent complet)
├── vercel.json          ← Config déploiement
├── package.json
└── README.md
```

---

## Étape 1 — Créer votre clé API Anthropic

1. Allez sur **https://console.anthropic.com**
2. Créez un compte (ou connectez-vous)
3. Menu **API Keys** → **Create Key**
4. Copiez la clé (commence par `sk-ant-api03-...`)
5. Ajoutez un moyen de paiement (facturation à l'usage, ~1-3€/mois pour un usage modéré)

---

## Étape 2 — Créer un compte Vercel

1. Allez sur **https://vercel.com**
2. **Sign Up** → choisissez "Continue with GitHub" (créez un compte GitHub gratuit si besoin)
3. Plan gratuit suffisant pour commencer

---

## Étape 3 — Déployer le site

### Option A — Via l'interface web (plus simple)

1. Allez sur **https://vercel.com/new**
2. Cliquez **"Browse"** ou glissez-déposez le dossier `316dev-site/`
3. Vercel détecte automatiquement la configuration
4. Cliquez **Deploy**
5. ⚠️ **Avant de finaliser**, ajoutez la variable d'environnement :
   - Nom : `ANTHROPIC_API_KEY`
   - Valeur : votre clé `sk-ant-api03-...`
6. Cliquez **Deploy** → votre site est en ligne !

### Option B — Via GitHub (recommandé pour les mises à jour)

```bash
# Installez Git si besoin : https://git-scm.com
cd 316dev-site
git init
git add .
git commit -m "Initial deploy"

# Créez un repo sur github.com puis :
git remote add origin https://github.com/VOTRE-USERNAME/316dev-site.git
git push -u origin main
```

Puis sur Vercel :
1. **New Project** → **Import Git Repository**
2. Sélectionnez votre repo `316dev-site`
3. **Environment Variables** → ajoutez `ANTHROPIC_API_KEY`
4. **Deploy**

---

## Étape 4 — Ajouter votre domaine personnalisé (optionnel)

1. Dans Vercel → votre projet → **Settings** → **Domains**
2. Ajoutez `316developpement.fr` (ou votre domaine)
3. Suivez les instructions DNS chez votre registrar (OVH, Gandi, etc.)
4. Vercel configure le HTTPS automatiquement

---

## Ce que vous obtenez

| URL | Contenu |
|-----|---------|
| `votre-site.vercel.app/` | Page d'accueil 316 Développement |
| `votre-site.vercel.app/agent` | Agent CIR/CII pleine page |
| Sur toutes les pages | 💬 Bouton flottant "Expert CIR/CII" |

---

## Personnalisation

### Changer l'adresse email de contact
Dans `public/index.html`, remplacez `contact@316developpement.fr` par votre vraie adresse.

### Modifier le texte d'accueil de l'agent
Dans `public/agent-widget.js`, cherchez `SYSTEM_316` et adaptez le prompt système.

### Changer le modèle IA (économies)
Dans `api/chat.js`, la ligne `model: "claude-haiku-4-5-20251001"` utilise le modèle le plus économique.
Pour des réponses plus élaborées : remplacez par `claude-sonnet-4-6`.

---

## Coûts estimés

| Usage | Coût mensuel estimé |
|-------|---------------------|
| 50 conversations/mois | ~2-5 € |
| 200 conversations/mois | ~8-15 € |
| Hébergement Vercel | Gratuit (plan Hobby) |

---

## Support

En cas de problème, vérifiez :
1. La variable `ANTHROPIC_API_KEY` est bien renseignée dans Vercel (Settings → Environment Variables)
2. Votre compte Anthropic a un solde suffisant
3. Les logs Vercel (onglet **Functions** dans votre projet)
