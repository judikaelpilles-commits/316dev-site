# 316 Développement — v4 Google Sheets
## Variables d'environnement à ajouter dans Vercel

Allez sur votre projet Vercel → Settings → Environment Variables
Ajoutez ces 5 variables :

---

### 1. ANTHROPIC_API_KEY
Votre clé API Anthropic (déjà configurée normalement)
```
sk-ant-api03-XXXX...
```

### 2. STRIPE_SECRET_KEY
Votre clé secrète Stripe
```
sk_live_XXXX... (ou sk_test_XXXX... pour les tests)
```

### 3. GOOGLE_SHEET_ID
```
1q1WNeuDTUIUBb4t95kRYz6nWFMof6W8EzmhPtq4z_mM
```

### 4. GOOGLE_CLIENT_EMAIL
```
id-16dev-sheet@dev-494312.iam.gserviceaccount.com
```

### 5. GOOGLE_PRIVATE_KEY
Copiez exactement cette valeur (avec les \n) :
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDxpVWyi3hdYu4o\nh26SVsltALGKUBmTwNkwBdtgY41EIps5z8m+GUlXQX8bPZmzh4ZvLsOoVuBj1Oc+\nWrhrL6j3HEmbCehVB1otXWg2GKt6npRKo59mps4xoFFiuT7FdMicu05NotNGQkCq\njg4LuhYEw1SPmhrUgCf0yvQlr/zLFuwOq1YCNEUof9SKUZbKVgoooHHAE0Q4+2cM\nIP7XmwBPepd7G5jJcrhaSYsC3YawxPMlLIGAqzEFuFef8H/Cmwr6uMlMVqYi0D2s\nNl1h9sh+8olPUp1XJGnR7yNpD2PYoIEGKq+5QW6tBpGUC9gYst7oLWxZGm44FKCQ\nyFaJ6m31AgMBAAECggEAHnyFuJIkhCGqWtYlUtScsoIbJBBRfcTfkdG3WOyOYsl7\n7HoE4ZUmndnPS7REmzQOt6G+gRM+2ZF/gCwpZqp7Znu85JDGLU4RaDZH4sVPgxeV\nLWqBvo1uZ6/qfKpS204NzkpKSXywq4VJy8rCxmN6iizLkxd16Zfmkpl1Xnjay5NQ\nv6Z5WoQwwpqz91zkwQcPhNB1CX2H2V+PC34fpN3Ab6exSkyO/+Dd1aZIUs/OAsi8\no1M9uYQsvNmWrjTgFPD1owwRlcm5n4IVnqo3fxokR6QxuQWfPJ+a0RRfv/RhPZ82\nYMPvFOypdDlzNDey1XCe1VxB5GXVjeHnBqYOrhDsWQKBgQD6oza3q9zfVE1CLDHn\n1em/bLAXzY/uIb7fgH/9zjnM6V8t61LR4b4EoPhMs55SOiiQY1w9n5XjKxg5XOLz\nSLB+y1WdyFm7FhinepUAdIp2+Lcr04X7RtlHHeerb5J/93QNYkzys7vXhfhqTmgr\nbEdeRU7ZgpSlkJ8NVrCubcvKyQKBgQD20N8uYyx36MHgVdCac+gBk0N3F3yxNOSZ\nt+ohsaUXNgT3e63kk4Jl4qnJirpyOL3TsjRs0XlNiyrXd2Jn+F7mUJJzyulwLaF/\nzP53yOBMHNymQqgJMpSz4pzxLBFUnIpd2/Ge3oCd+bT6VWDzQSGEvT7/D2hs/iNh\nz28jCDszzQKBgQCsg2zlLUlA+vCWjH7pOSbD2Ja4O4hG+zk682Klmq3UKgmWPLRr\nvDqjSvy9JqDhriA/ifRyggaULxRkX1fi5nR9QY2zpbSFfmcH1+r5Pj4UN4s0gkpl\nM1XYim/sY0ZuCC/8Cl42a5nudcsPuNogkU3qSEBGnIeeEhY4AyRnWzF7aQKBgG6T\nOzm8AqMh6yIHMDLSNKHoCPSk2B9H9BaOF93KiYzxjZ4Wkdxy3ZupxaledpNPqnPa\nRbRu0GqWK7ZmbPbphhKnDEXGJXk1aEIqY+LkYuCWmZ//AutD9uz0XJ2LwaPnkfHk\n5MXpJzQfOB5i+9FfX5XpdvysOXuDC/T5CvBl8qgNAoGBALhbHPyyiA4Q5yZhlXT8\n/jDvpUbfCrdwmpzNr68fqCAQZyzHVKTS5zxyp8723KjjSC7axwVDbufJFEgfeBQi\nXQnq0bNNTi+uc5956xsivS+KRPgQxOFTDVcnF38HozcYwGV/JHB9HKN5GMC4H7nm\nRrsIb/4ogqg49lZdQDdbkJM0\n-----END PRIVATE KEY-----\n
```

---

## Partage du Google Sheet

⚠️ IMPORTANT : partagez votre Google Sheet avec cet email (rôle Éditeur) :
```
id-16dev-sheet@dev-494312.iam.gserviceaccount.com
```

1. Ouvrez votre Google Sheet
2. Bouton "Partager" (en haut à droite)
3. Collez l'email ci-dessus
4. Rôle : Éditeur
5. Décochez "Notifier" → Partager

---

## Ce qui se passe ensuite

Chaque fois qu'un visiteur remplit le formulaire sur votre site :
✅ Une ligne s'ajoute automatiquement dans votre Google Sheet
✅ Colonnes : Date | Nom | Email | Téléphone | Société | Source | Statut
