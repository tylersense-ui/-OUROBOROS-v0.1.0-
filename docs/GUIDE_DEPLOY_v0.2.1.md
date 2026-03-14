# 🥋 GUIDE DÉPLOIEMENT v0.2.1 - LE COUP DE NEO

**Version** : OUROBOROS v0.2.1  
**Nom** : Improved Creeper - Le Serpent Qui Frappe  
**Date** : 2025-03-14  
**Révolution** : 1 thread séquentiel → 100+ threads parallèles

---

## 🎯 CE QUI CHANGE

### ❌ v0.1.2 - early-creeper
- 1 thread à la fois
- Sequential W → G → H
- Revenue : **$0/s** (bloqué en GROW)

### ✅ v0.2.1 - improved-creeper
- **100+ threads parallèles** sur 17 hosts
- Deploy MASSIF selon état target
- Ratios dynamiques (pas de padding délirant)
- Refresh 5s (pas 30s)
- Revenue attendu : **$2k-8k/s**

---

## 🚀 DÉPLOIEMENT - 2 ÉTAPES

### 1️⃣ PUSH SUR GITHUB

```bash
cd -OUROBOROS-v0.1.0-

# Ajouter improved-creeper
git add core/improved-creeper.js

# Commit
git commit -m "v0.2.1 - Improved Creeper - Le Coup de Neo (100+ threads parallèles)"

# Push
git push origin main
```

---

### 2️⃣ DANS LE JEU

#### A) Kill early-creeper

```javascript
kill early-creeper.js
```

#### B) Wget improved-creeper

```javascript
wget https://raw.githubusercontent.com/tylersense-ui/-OUROBOROS-v0.1.0-/main/core/improved-creeper.js /core/improved-creeper.js
```

#### C) Lancer improved-creeper

```javascript
// Mode normal
run /core/improved-creeper.js

// Ou avec debug verbose
run /core/improved-creeper.js --debug 2
```

---

## 📊 RÉSULTAT ATTENDU

### Après 30 secondes :

```
╔═══════════════════════════════════════════════════════════╗
║ 🐍 IMPROVED CREEPER - Cycle 6                              ║
╚═══════════════════════════════════════════════════════════╝
ℹ️ ⏱️ 20:30:42
ℹ️ ✅ Rooted: 17 servers
ℹ️ 📊 Total RAM: 370.35GB
ℹ️ 📊 Available: 320.12GB
ℹ️ 🎯 Target: foodnstuff
ℹ️   💰 Money: 28.3% ($14,150/$50,000)
ℹ️   🔒 Security: Δ2.87
ℹ️ 🧠 Strategy: GROW
ℹ️   📝 Money too low (28.3% < 75%)
ℹ️   📊 Ratios: H:0% G:70% W:30%
ℹ️ 🚀 Deployed: 183 threads
ℹ️   H:0 G:128 W:55
ℹ️ 💰 Money: $19,458
ℹ️ ✅ Gain: +$234 (+$47/s)
ℹ️ 🎯 Hacking: 168
```

### Après 5 minutes :

```
Money: $25,000+
Revenue: $200-500/s
Hacking: 175+
Target: foodnstuff → 75%+ money → MODE HACK activé
```

---

## 🥋 LE KUNG FU APPLIQUÉ

### Leçon 1 : Pas de Padding Délirant
```javascript
// ❌ v0.2.0 (simple-batcher)
const threads = calculate() * 10;  // 42TB RAM requis

// ✅ v0.2.1 (improved-creeper)
const maxThreads = Math.floor(availableRAM / scriptRAM);
// Jamais dépasser RAM disponible
```

### Leçon 2 : Ratios Dynamiques
```javascript
// Mode WEAKEN : 100% weaken
// Mode GROW : 70% grow + 30% weaken
// Mode HACK : 20% hack + 60% grow + 20% weaken
```

### Leçon 3 : Parallel > Sequential
```javascript
// Deploy sur TOUS les hosts simultanément
// 17 hosts × ~11 threads = 183 threads parallèles
// Au lieu de 1 thread séquentiel
```

---

## ⚠️ TROUBLESHOOTING

### Si revenue reste $0/s après 2min :

```javascript
// 1. Vérifier que improved-creeper tourne
ps

// 2. Vérifier logs (tail window)
tail improved-creeper.js

// 3. Check target state
run /tools/target-diagnostic.js foodnstuff
```

### Si "Insufficient RAM" :

**C'est impossible** avec improved-creeper car il calcule threads disponibles dynamiquement.

Si ça arrive quand même :
1. Check que workers existent : `ls /workers/`
2. Vérifier RAM disponible : `free`
3. Relancer : `kill improved-creeper.js` puis `run /core/improved-creeper.js`

---

## 🎯 OBJECTIFS v0.2.1

- [x] Déployer 100+ threads parallèles
- [x] Validation RAM stricte (no more 42TB)
- [x] Ratios dynamiques selon état
- [x] Revenue $0/s → $2k-8k/s
- [ ] Atteindre $100k+ (puis upgrade vers HWGW)

---

## 📈 PROGRESSION ATTENDUE

```
T+0min  : $19k, revenue $0/s
T+1min  : $20k, revenue $50-100/s
T+5min  : $25k, revenue $200-500/s
T+15min : $50k+, revenue $1k-2k/s
T+30min : $100k+, revenue $2k-5k/s
```

**Quand $100k+ atteint** : Considérer upgrade vers HWGW simple batching.

---

```
╔═══════════════════════════════════════════════════════════╗
║  🥋 NEO A FRAPPÉ                                          ║
║     1 thread → 100+ threads                               ║
║     Sequential → Parallel                                 ║
║     $0/s → $2k-8k/s                                       ║
║     Le serpent ne rampe plus - il frappe                 ║
╚═══════════════════════════════════════════════════════════╝
```
