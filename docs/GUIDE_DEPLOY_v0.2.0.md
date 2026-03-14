# 🐍 GUIDE DÉPLOIEMENT - OUROBOROS v0.2.0

**LE SERPENT FRAPPE ENFIN EN PARALLÈLE !**

---

## 🎯 OBJECTIF

Passer de **$0/s → $10k-50k/s** revenue sur foodnstuff avec HWGW batching.

---

## 📦 FICHIERS À PUSH SUR GITHUB

### Nouveaux fichiers (v0.2.0)
```
/lib/prep-module.js          # Module prep réutilisable
/core/simple-batcher.js      # Orchestrateur HWGW
```

### Documentation mise à jour
```
CHANGELOG.md                 # v0.2.0
manifest.json                # v0.2.0
```

### Fichiers existants (pas de modif)
```
/lib/debug.js
/lib/state-manager.js
/workers/hack.js
/workers/grow.js
/workers/weaken.js
/tools/*
```

---

## 🚀 DÉPLOIEMENT ULTRA SIMPLE

### 1️⃣ PUSH SUR GITHUB

```bash
# Dans ton repo local
cd -OUROBOROS-v0.1.0-

# Ajouter nouveaux fichiers
git add lib/prep-module.js
git add core/simple-batcher.js
git add CHANGELOG.md
git add manifest.json
git add deploy-ouroboros-v0.2.0.js

# Commit
git commit -m "v0.2.0 - HWGW Batching - Le Serpent frappe enfin !"

# Push
git push origin main
```

---

### 2️⃣ DANS LE JEU - SEULEMENT 2 COMMANDES ! 🎯

#### Commande 1 : Télécharger le deployer

```javascript
wget https://raw.githubusercontent.com/tylersense-ui/-OUROBOROS-v0.1.0-/main/deploy-ouroboros-v0.2.0.js deploy.js
```

#### Commande 2 : Lancer le déploiement automatique

```javascript
run deploy.js
```

**C'EST TOUT !** Le script va automatiquement :
- ✅ Créer tous les dossiers
- ✅ Télécharger TOUS les fichiers v0.2.0
- ✅ Vérifier l'intégrité
- ✅ Afficher un rapport complet

---

### 3️⃣ LANCER LE BATCHER

Une fois le déploiement terminé :

```javascript
// 1. Kill early-creeper (si actif)
kill early-creeper.js

// 2. Lancer simple-batcher
run /core/simple-batcher.js --debug 2
```

**Options disponibles** :
```javascript
// Mode normal
run /core/simple-batcher.js

// Avec debug verbose
run /core/simple-batcher.js --debug 2

// Forcer target spécifique
run /core/simple-batcher.js --target foodnstuff --debug 2
```

---

## 📊 CE QUI VA SE PASSER

### Phase 1 : PREP (première fois, ~48s)
```
🚀 Preparing foodnstuff...
📊 Prep threads:
   Weaken: 150 + 80 threads
   Grow: 500 threads
⏱️ Prep in progress (48.0s)...
✅ foodnstuff prepped successfully!
🎉 foodnstuff ready to batch!
```

### Phase 2 : HWGW LOOP (en continu)
```
🔥 Launching HWGW batch...
📊 Batch threads: H10 W50 G500 W80
⏱️ Batch running (48.5s)...
✅ Batch completed!
💰 Money: $35.847k
✅ Gain this batch: +$16.617k
⚡ Revenue: ~$342/s
📊 Total earned: $16.617k
```

**Chaque batch** :
- Duration : ~48s (weaken time)
- Gain : $10k-30k par batch
- Revenue : $200-600/s

**Après 10 batches** :
- Total earned : $100k-300k
- XP gain : +500-1000 hacking XP
- foodnstuff : 100% money / min security constant

---

## ⚙️ PARAMÈTRES AJUSTABLES

### Dans simple-batcher.js

```javascript
// Ligne 23 : Hack percent (actuellement 5%)
const TARGET_HACK_PERCENT = 0.05; // Réduire à 0.01 si misfires

// Ligne 26 : Recovery padding (actuellement 10x)
const RECOVERY_PADDING = 10; // Augmenter à 15-20 si instable

// Ligne 20 : Batch spacing (actuellement 200ms)
const BATCH_SPACING = 200; // Augmenter à 500 si timing serré
```

---

## 🔍 MONITORING

### Vérifier revenue

```javascript
// Terminal stats
run /tools/target-diagnostic.js foodnstuff

// Ou check batcher status
cat /state/batcher-status.json
```

### Stats attendues après 5 minutes

```
Money earned (Servers): $500k-1M
Hacking level: 200-250
foodnstuff:
  Money: 100% constant
  Security: min constant
```

---

## 🐛 TROUBLESHOOTING

### Problème : "Insufficient RAM for batch"

**Solution** :
1. Tuer scripts inutiles : `ps` puis `kill <PID>`
2. Réduire TARGET_HACK_PERCENT à 0.01
3. Acheter un purchased server : `run /managers/server-manager.js --once`

### Problème : "Prep failed"

**Solution** :
1. Vérifier que workers existent : `ls /workers`
2. Vérifier RAM dispo : `free`
3. Augmenter RECOVERY_PADDING à 15-20

### Problème : Revenue faible (<$100/s)

**Normal si** :
- Hacking level bas (<100)
- Peu de RAM disponible (<32GB total)
- Target trop difficile

**Solutions** :
- Attendre quelques batches (revenue monte progressivement)
- Laisser tourner 10-15 minutes
- Acheter plus de RAM : `run /managers/server-manager.js`

---

## 📈 PROGRESSION ATTENDUE

| Temps | Money Total | Hacking Level | Revenue/s |
|-------|-------------|---------------|-----------|
| 0min  | $19k        | 168           | $0/s      |
| 5min  | $200k       | 200           | $300/s    |
| 15min | $800k       | 250           | $500/s    |
| 30min | $2M         | 320           | $700/s    |
| 1h    | $5M         | 400           | $1k/s     |

**Objectif** : Atteindre **$5B pour Formulas.exe** avec cette stratégie.

---

## 🎯 PROCHAINES ÉTAPES

### Court terme (cette session)
1. Lancer simple-batcher
2. Vérifier revenue > $0
3. Laisser tourner 30min-1h
4. Acheter purchased servers avec gains

### Moyen terme (prochaines sessions)
1. Farm jusqu'à $5B
2. Acheter Formulas.exe
3. Upgrade vers advanced-batcher v0.3.0
4. Optimiser EV/s dynamique

### Long terme
1. Multi-target orchestration
2. Stock market manipulation
3. Full autopilot BN-1

---

## ✅ CHECKLIST DÉPLOIEMENT

- [ ] Push nouveaux fichiers sur GitHub
- [ ] Kill early-creeper.js
- [ ] Wget prep-module.js
- [ ] Wget simple-batcher.js
- [ ] Wget CHANGELOG.md + manifest.json
- [ ] Run simple-batcher.js --debug 2
- [ ] Vérifier tail window (batches en cours)
- [ ] Attendre 5 min
- [ ] Vérifier revenue > $0 dans stats
- [ ] Logger action : `run /tools/log-action.js "HWGW batching déployé !"`

---

```
╔═══════════════════════════════════════════════════════════╗
║  🐍 Le Serpent ne rampe plus - Il FRAPPE ! 🐍            ║
║     v0.2.0 - HWGW Batching Activated                     ║
╚═══════════════════════════════════════════════════════════╝
```

**Que le revenue monte, Architecte.** 🚀💰
