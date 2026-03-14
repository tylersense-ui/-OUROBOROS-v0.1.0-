# 🥋 FORMATION BITBURNER - LE KUNG FU DE NEO

**Status** : Formation COMPLÈTE  
**Date** : 2026-03-14  
**Version Bitburner** : 2.8.1  
**Erreur initiale** : 42.33TB RAM requis vs 370GB disponible (facteur 114x)  
**Raison** : Incompréhension fondamentale des mécaniques du jeu

---

## 📚 TABLE DES MATIÈRES

1. [Mécaniques Fondamentales](#1-mécaniques-fondamentales)
2. [Mathématiques du Hacking](#2-mathématiques-du-hacking)
3. [Erreurs Communes](#3-erreurs-communes)
4. [Techniques HWGW Réalistes](#4-techniques-hwgw-réalistes)
5. [Formulas.exe API](#5-formulasexe-api)
6. [Stratégies Early-Game vs Late-Game](#6-stratégies-early-game-vs-late-game)
7. [Lessons Learned](#7-lessons-learned)

---

## 1. MÉCANIQUES FONDAMENTALES

### 1.1 Les 3 Actions de Base

#### hack(target)
- **Effet** : Vole un % de l'argent actuel du serveur
- **Side-effect** : Augmente la sécurité de +0.002 par thread
- **Temps** : Variable selon security et hacking level
- **RAM** : 1.70GB

#### grow(target)
- **Effet** : Multiplie l'argent du serveur par un facteur
- **Formule** : `(currentMoney + threads) * growthMultiplier`
- **Side-effect** : Augmente la sécurité de +0.004 par thread
- **Temps** : Variable (3.2× plus lent que hack)
- **RAM** : 1.75GB
- **⚠️ CRITIQUE** : Ajoute $1 par thread AVANT de multiplier

#### weaken(target)
- **Effet** : Réduit la sécurité de 0.05 par thread
- **Side-effect** : Aucun
- **Temps** : Variable (4× plus lent que hack)
- **RAM** : 1.75GB

### 1.2 États du Serveur

Chaque serveur a :
- **moneyAvailable** : Argent actuel ($0 à moneyMax)
- **moneyMax** : Argent maximum possible
- **hackDifficulty** : Niveau de sécurité actuel
- **minDifficulty** : Niveau de sécurité minimum
- **serverGrowth** : Facteur de croissance (1-100)

### 1.3 Règle CRITIQUE : Timing vs Effects

**TIMING déterminé au START** :
- `ns.hack()`, `ns.grow()`, `ns.weaken()` calculent leur durée au moment où ils sont **appelés**
- Cette durée dépend de la security **au moment du start**

**EFFECTS déterminés à la FIN** :
- Les effets (argent volé, croissance, réduction security) sont calculés quand le script **finit**
- Ils dépendent de la security **au moment de la fin**

**Conséquence** :
```javascript
// ❌ MAUVAIS
await ns.weaken(target);  // Security baisse
await ns.hack(target);    // Hack calcule avec security faible

// ✅ BON (HWGW batching)
// Tous démarrent avec security min
// Mais finissent dans l'ordre : H → W → G → W
```

---

## 2. MATHÉMATIQUES DU HACKING

### 2.1 Formule grow() - LA CLEF

**Formule complète** :
```javascript
finalMoney = (currentMoney + threads) * growthMultiplier^threads
```

**⚠️ PIÈGES MORTELS** :

#### Piège 1 : Le +1 par thread
```javascript
// Si server a $100 et tu grow avec 50 threads :
finalMoney = (100 + 50) * mult^50
           = 150 * mult^50

// PAS 100 * mult^50 !
```

#### Piège 2 : Croissance exponentielle
```javascript
// Pour doubler l'argent d'un serveur à $1 :
threads_needed = Math.log(2) / Math.log(growthMultiplier)

// Mais pour doubler de $1000 à $2000 :
threads_needed = Math.log(2000/1000) / Math.log(growthMultiplier)
// Même résultat ! C'est un multiplicateur

// MAIS pour passer de $10 à $2000 :
threads_needed = Math.log(2000/10) / Math.log(growthMultiplier)
// Beaucoup plus de threads !
```

#### Piège 3 : growthAnalyze() avec $0
```javascript
// Si server a $0 :
ns.growthAnalyze(target, 2)  // Pour doubler
// → Le jeu fait comme si c'était $1

// Donc pour passer de $0 à maxMoney :
const threads = ns.growthAnalyze(target, maxMoney / 1)
// threads peut être ÉNORME (des millions)
```

### 2.2 Formule hack() - Plus simple

```javascript
// hack() vole un % FIXE de l'argent actuel
percentStolen = hackPercent * threads

// hackPercent dépend de :
// - ton hacking level
// - security du serveur
// - difficulté du serveur

// Exemple :
// hackPercent = 0.001 (0.1% per thread)
// 100 threads → 10% de l'argent volé
// 1000 threads → 100% (tout le serveur)
```

**⚠️ IMPORTANT** : hack() vole un % de l'argent **au moment où il finit**, pas au start.

### 2.3 Formule weaken() - Linéaire

```javascript
securityReduction = 0.05 * threads

// Pour réduire security de 10 :
threads = 10 / 0.05 = 200 threads
```

### 2.4 Ratios HWGW Théoriques

Pour un batch HWGW qui maintient l'état :

```javascript
// Si hack vole X% :
hackThreads = calculé pour voler X%

// Grow doit restaurer X%
// growThreads dépend de growthAnalyze()

// Weaken pour hack :
weakenForHack = (hackThreads * 0.002) / 0.05

// Weaken pour grow :
weakenForGrow = (growThreads * 0.004) / 0.05
```

**Exemple réaliste** :
```javascript
// Hack 5% avec 10 threads
hackThreads = 10

// Grow pour restaurer 5%
growThreads = ns.growthAnalyze(target, 1.05263)  // 1 / (1 - 0.05)
// Résultat : ~50 threads (dépend du serverGrowth)

// Weaken hack : 10 * 0.002 / 0.05 = 0.4 threads → 1 thread
weakenForHack = 1

// Weaken grow : 50 * 0.004 / 0.05 = 4 threads
weakenForGrow = 4

// TOTAL : 10 + 1 + 50 + 4 = 65 threads
```

---

## 3. ERREURS COMMUNES

### 3.1 Mon Erreur : Padding 10x Sans Validation

```javascript
// ❌ CE QUE J'AI FAIT
const RECOVERY_PADDING = 10;
growThreads = Math.ceil(ns.growthAnalyze(target, growthNeeded)) * 10;

// Résultat :
// growthAnalyze() retourne 423,000 threads
// × 10 = 4,230,000 threads
// × 1.75GB = 7.4TB RAM
```

**Pourquoi c'est catastrophique** :
1. `growthAnalyze()` peut retourner des valeurs **énormes** si l'argent est bas
2. Le padding 10x multiplie cette erreur
3. Aucune validation vs RAM disponible

### 3.2 Erreur : Ne Pas Comprendre grow() Exponentiel

```javascript
// ❌ MAUVAIS
// "Je veux passer de $10 à $1000, donc ×100"
const threads = ns.growthAnalyze(target, 100)

// Résultat : Des millions de threads si serverGrowth faible
```

**Pourquoi** : `growthAnalyze()` calcule :
```
threads = log(multiplier) / log(serverGrowth parameter)
```

Si `serverGrowth` est faible (e.g., 1.01), alors :
```
threads = log(100) / log(1.01) = 4.605 / 0.00995 = 463 threads
```

Mais si l'argent est à $1 et max est $1M :
```
multiplier = 1,000,000 / 1 = 1,000,000
threads = log(1,000,000) / log(1.01) = 13.82 / 0.00995 = 1,388 threads
```

**PUIS avec padding 10x** : 13,880 threads = 24GB RAM  
**Acceptable** pour un prep.

Mais si j'ai mal calculé et que c'est 138,800 threads → 240GB  
Ou 1,388,000 threads → 2.4TB ← **MON ERREUR**

### 3.3 Erreur : Prep Simultané au Lieu de Séquentiel

```javascript
// ❌ MAUVAIS (ce que j'ai fait)
// Lancer W, G, W tous en même temps
ns.exec("weaken.js", host, weakenThreads, target, 0);
ns.exec("grow.js", host, growThreads, target, growDelay);
ns.exec("weaken.js", host, weakenThreads2, target, weakDelay);
```

**Problème** :
- Weaken #1 finit → security baisse
- Grow démarre avec security min mais finit avec security élevée (car grow augmente security)
- Résultat : grow moins efficace

**Solution réaliste** :
```javascript
// ✅ BON : Séquentiel simple pour prep
// Phase 1 : Weaken à min
while (currentSec > minSec) {
    await ns.weaken(target);
}

// Phase 2 : Grow à max
while (currentMoney < maxMoney * 0.99) {
    await ns.grow(target);
    await ns.weaken(target);  // Contrer le grow
}
```

### 3.4 Erreur : Oublier RAM Costs

```javascript
// ❌ MAUVAIS
const threads = calculateThreads(target);
ns.exec("hack.js", host, threads, target);

// Si threads = 1000 et hack.js = 1.70GB
// RAM needed = 1700GB
// Mais host a 16GB → ÉCHEC
```

**Solution** :
```javascript
// ✅ BON
const maxThreads = Math.floor(availableRAM / scriptRAM);
const threads = Math.min(calculateThreads(target), maxThreads);

if (threads === 0) {
    // Pas assez de RAM, skip
    return;
}
```

---

## 4. TECHNIQUES HWGW RÉALISTES

### 4.1 Principe de Base

HWGW = 4 scripts qui finissent dans l'ordre :
1. **Hack** (vole argent, security +0.002/t)
2. **Weaken** (réduit security du hack)
3. **Grow** (restaure argent, security +0.004/t)
4. **Weaken** (réduit security du grow)

**Timing** : Espacement de 200-1000ms entre chaque fin.

### 4.2 Stratégie Progressive (Early-Game)

**Phase 1 : Sequential WGH** (ce que early-creeper fait)
```javascript
while (true) {
    if (security > min + threshold) {
        await ns.weaken(target);
    } else if (money < max * 0.75) {
        await ns.grow(target);
    } else {
        await ns.hack(target);
    }
}
```

**Problème** : Un seul thread à la fois, lent.

**Phase 2 : Parallel WGH** (amélioration)
```javascript
// Calculer threads disponibles
const totalThreads = calculateAvailableThreads();

// Ratio approximatif
const weakenThreads = Math.floor(totalThreads * 0.15);
const growThreads = Math.floor(totalThreads * 0.70);
const hackThreads = Math.floor(totalThreads * 0.15);

// Lancer en parallèle
deployWorkers(weakenThreads, growThreads, hackThreads);
```

**Avantage** : Utilise toute la RAM, mais ratio fixe.

### 4.3 Simple HWGW Batcher (Mid-Game)

```javascript
// 1. Prep server (sequential)
while (notReady) {
    await prepServer(target);
}

// 2. Calculate batch threads
const hackPercent = 0.05;  // Voler 5%
const hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, maxMoney * hackPercent));

// Security increase from hack
const hackSecIncrease = hackThreads * 0.002;
const weakenForHack = Math.ceil(hackSecIncrease / 0.05);

// Grow to restore
const growThreads = Math.ceil(ns.growthAnalyze(target, 1 / (1 - hackPercent)));

// Security increase from grow
const growSecIncrease = growThreads * 0.004;
const weakenForGrow = Math.ceil(growSecIncrease / 0.05);

// TOTAL threads
const batchThreads = hackThreads + weakenForHack + growThreads + weakenForGrow;

// 3. Check if enough RAM
if (batchThreads * maxScriptRAM > availableRAM) {
    // Pas assez de RAM, réduire hackPercent ou skip
    return;
}

// 4. Launch batch avec timing
const weakenTime = ns.getWeakenTime(target);
const growTime = ns.getGrowTime(target);
const hackTime = ns.getHackTime(target);

const SPACER = 200;  // 200ms entre chaque fin

// Delays pour que tout finisse dans l'ordre
const hackDelay = weakenTime - hackTime - 3*SPACER;
const weakenDelay = 0;  // Weaken finit en premier du groupe
const growDelay = weakenTime - growTime - SPACER;
const weakenDelay2 = SPACER;

// Exec avec delays
ns.exec("hack.js", host, hackThreads, target, hackDelay);
ns.exec("weaken.js", host, weakenForHack, target, weakenDelay);
ns.exec("grow.js", host, growThreads, target, growDelay);
ns.exec("weaken.js", host, weakenForGrow, target, weakenDelay2);
```

### 4.4 Batching Avancé (Late-Game)

**Features** :
- Multiple batches simultanés
- Dynamic hackPercent calculation
- Adaptive timing (hacking level increases)
- Recovery from misfires

**Complexité** : Nécessite Formulas.exe ($5B).

---

## 5. FORMULAS.EXE API

### 5.1 Qu'est-ce que c'est ?

**Prix** : $5 milliards  
**Achat** : Darkweb (TOR Router)  
**Usage** : Calculs exacts sans side-effects

### 5.2 Avantages

```javascript
// Sans Formulas.exe
const hackTime = ns.getHackTime(target);  // Basé sur état actuel

// Avec Formulas.exe
const server = ns.getServer(target);
server.hackDifficulty = server.minDifficulty;  // Simuler min sec
server.moneyAvailable = server.moneyMax;  // Simuler max money

const hackTime = ns.formulas.hacking.hackTime(server, ns.getPlayer());
// Temps exact avec min sec / max money sans modifier le serveur !
```

### 5.3 Fonctions Clés

```javascript
// Hack
ns.formulas.hacking.hackPercent(server, player)  // % volé par 1 thread
ns.formulas.hacking.hackTime(server, player)     // Durée
ns.formulas.hacking.hackChance(server, player)   // Probabilité succès

// Grow
ns.formulas.hacking.growPercent(server, threads, player, cores)
ns.formulas.hacking.growAmount(server, player, threads, cores)
ns.formulas.hacking.growThreads(server, player, targetMoney, cores)
ns.formulas.hacking.growTime(server, player)

// Weaken
ns.formulas.hacking.weakenTime(server, player)
```

### 5.4 Quand l'acheter ?

**Early-game** : NON, trop cher  
**Mid-game** : Si tu as $5B+ et veux optimiser  
**Late-game** : ESSENTIEL pour batching avancé

**Alternative early-game** : Approximations avec `hackAnalyze()`, `growthAnalyze()`, etc.

---

## 6. STRATÉGIES EARLY-GAME VS LATE-GAME

### 6.1 Early-Game (<$1M, <100 hacking)

**Objectif** : Gagner de l'argent rapidement, pas d'optimisation.

**Stratégie** : Sequential WGH
```javascript
while (true) {
    if (security > min + 5) weaken();
    else if (money < max * 0.75) grow();
    else hack();
}
```

**Pourquoi** :
- Simple à coder
- Pas de calcul complexe
- Fonctionne avec 8GB RAM
- Progression stable

**RAM** : Home 8GB suffit  
**Revenue** : $0 → $1k/s

### 6.2 Mid-Game ($1M-$100M, 100-500 hacking)

**Objectif** : Maximiser RAM usage, prep optimisé.

**Stratégie** : Parallel deployment + simple batching
```javascript
// 1. Deploy WGH sur tous les serveurs rootés
// 2. Ratio calculé (15% weaken, 70% grow, 15% hack)
// 3. Refresh toutes les 30s
```

**Pourquoi** :
- Utilise toute la RAM réseau
- Pas besoin de Formulas.exe
- Ratios approximatifs suffisent
- Revenue stable

**RAM** : 200GB-2TB réseau  
**Revenue** : $1k-$100k/s

### 6.3 Late-Game ($100M+, 500+ hacking, Formulas.exe)

**Objectif** : Batching HWGW multi-target, EV/s optimization.

**Stratégie** : Advanced batcher
```javascript
// 1. Target selection (EV/s calculation)
// 2. Prep avec timing précis
// 3. Multiple batches (5-20 simultanés)
// 4. Dynamic hackPercent (1-10%)
// 5. Recovery from timing drift
```

**Pourquoi** :
- Formulas.exe permet calculs exacts
- RAM suffisante pour multiple batches
- Hacking level élevé → temps courts
- Optimisation max

**RAM** : 5TB-50TB réseau  
**Revenue** : $100k-$1M+/s

---

## 7. LESSONS LEARNED

### 7.1 Ce Que J'ai Mal Compris

1. **grow() n'est pas linéaire** - C'est exponentiel + $1/thread
2. **Padding 10x sans validation** - Catastrophique avec grow
3. **Prep parallel vs sequential** - Timing matters
4. **RAM disponible vs RAM requise** - Toujours valider
5. **Early-game ≠ Late-game** - Stratégies différentes

### 7.2 Ce Que Je Dois Faire

1. **Start simple** - Sequential WGH d'abord
2. **Validate everything** - RAM, threads, timing
3. **Test incrementally** - 1 batch, puis 2, puis 3...
4. **Monitor closely** - Logs, telemetry, alarms
5. **Iterate carefully** - Pas de refonte totale sans test

### 7.3 Réalité des Threads

**Exemple réaliste (foodnstuff, early-game)** :

```javascript
// Server : foodnstuff
maxMoney = $50,000
currentMoney = $12,500  // 25%
minSecurity = 3
currentSecurity = 5.5  // Δ 2.5

// Prep : Weaken à min
weakenThreads = 2.5 / 0.05 = 50 threads
RAM = 50 * 1.75GB = 87.5GB  ← Acceptable

// Prep : Grow à max
growMultiplier = 50,000 / 12,500 = 4
growThreads = Math.ceil(ns.growthAnalyze(target, 4))
// Avec serverGrowth moyen : ~30-50 threads
RAM = 50 * 1.75GB = 87.5GB  ← Acceptable

// TOTAL prep : ~175GB
```

**Avec padding 10x** :
```
weakenThreads = 500
growThreads = 500
TOTAL = 1000 threads = 1.75TB  ← TROP !
```

**Conclusion** : Padding doit être **conditionnel** et **validé**.

### 7.4 Formule Réaliste pour Prep

```javascript
function prepareServer(ns, target, availableRAM) {
    const maxMoney = ns.getServerMaxMoney(target);
    const currentMoney = ns.getServerMoneyAvailable(target);
    const minSec = ns.getServerMinSecurityLevel(target);
    const currentSec = ns.getServerSecurityLevel(target);
    
    // 1. Weaken threads
    const secDelta = currentSec - minSec;
    let weakenThreads = Math.ceil(secDelta / 0.05);
    
    // 2. Grow threads (conservative)
    const moneyRatio = maxMoney / Math.max(currentMoney, 1);
    let growThreads = Math.ceil(ns.growthAnalyze(target, moneyRatio));
    
    // 3. Weaken for grow
    const growSecIncrease = growThreads * 0.004;
    let weakenForGrow = Math.ceil(growSecIncrease / 0.05);
    
    // 4. TOTAL
    const totalThreads = weakenThreads + growThreads + weakenForGrow;
    const ramNeeded = totalThreads * 1.75;  // Max RAM script
    
    // 5. VALIDATION
    if (ramNeeded > availableRAM) {
        // ⚠️ PAS ASSEZ DE RAM
        // Option 1 : Réduire threads proportionnellement
        const ratio = availableRAM / ramNeeded;
        weakenThreads = Math.floor(weakenThreads * ratio);
        growThreads = Math.floor(growThreads * ratio);
        weakenForGrow = Math.floor(weakenForGrow * ratio);
        
        // Option 2 : Faire prep en plusieurs cycles
        return { success: false, ramNeeded, availableRAM };
    }
    
    return {
        success: true,
        weakenThreads,
        growThreads,
        weakenForGrow,
        ramNeeded
    };
}
```

---

## 8. ACTION PLAN

### 8.1 Prochaines Étapes

1. **Abandonner simple-batcher.js v0.2.0** - Cassé, mauvais design
2. **Revenir à early-creeper.js** - Il fonctionne ($0/s mais stable)
3. **Améliorer early-creeper** - Parallel deployment intelligent
4. **Créer improved-creeper.js** - Ratios dynamiques sans batching
5. **Tester extensively** - Logs, telemetry, validation
6. **Quand revenue $10k+/s** - Considérer simple HWGW batching

### 8.2 Design improved-creeper.js

**Features** :
- ✅ Scan réseau continu
- ✅ Auto-root progressif
- ✅ Deploy workers sur tous les hosts
- ✅ **Ratio calculation dynamique** (nouveau)
- ✅ **RAM validation stricte** (nouveau)
- ✅ **Incremental scaling** (nouveau)
- ✅ Target sélection par score

**Stratégie** :
```javascript
// Pour chaque serveur rooté :
const availableRAM = maxRAM - usedRAM;
const totalThreads = Math.floor(availableRAM / 1.75);

// Calculer ratio optimal
const targetInfo = analyzeTarget(ns, target);

if (targetInfo.needsWeaken) {
    // Mode prep : priorité weaken
    weakenThreads = Math.min(totalThreads, calculateWeakenNeeded());
    deployWeaken(host, weakenThreads, target);
    
} else if (targetInfo.needsGrow) {
    // Mode grow : ratio 85% grow, 15% weaken
    const growThreads = Math.floor(totalThreads * 0.85);
    const weakenThreads = Math.floor(totalThreads * 0.15);
    deployGrow(host, growThreads, target);
    deployWeaken(host, weakenThreads, target);
    
} else {
    // Mode hack : ratio 15% hack, 70% grow, 15% weaken
    const hackThreads = Math.floor(totalThreads * 0.15);
    const growThreads = Math.floor(totalThreads * 0.70);
    const weakenThreads = Math.floor(totalThreads * 0.15);
    deployHack(host, hackThreads, target);
    deployGrow(host, growThreads, target);
    deployWeaken(host, weakenThreads, target);
}
```

---

## 9. RESSOURCES

### 9.1 Documentation Officielle
- Bitburner Docs : https://bitburner-fork-oddiz.readthedocs.io/
- API Reference : https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.md
- Hacking Algorithms : https://bitburner-fork-oddiz.readthedocs.io/en/stable/advancedgameplay/hackingalgorithms.html

### 9.2 Expert Scripts (Inspirations)
- alainbryden : https://github.com/alainbryden/bitburner-scripts (⭐⭐⭐⭐⭐)
- Kupos HWGW Manager : https://steamcommunity.com/sharedfiles/filedetails/?id=2825770722

### 9.3 Guides Communauté
- Steam Guide "Hacking for Dummies" : https://steamcommunity.com/sharedfiles/filedetails/?id=2860828429
- Bitburner Autopsy : https://krate.hashnode.dev/bitburner-autopsy-1-hacking

---

## 10. CONCLUSION

**Ce que j'ai appris** :
- grow() est exponentiel, pas linéaire
- Padding doit être validé contre RAM disponible
- Early-game ≠ Late-game (stratégies différentes)
- HWGW batching est complexe, pas pour day 1
- Sequential WGH → Parallel WGH → Simple HWGW → Advanced HWGW

**Prochaine action** :
Créer **improved-creeper.js** avec ratios dynamiques et validation stricte.

Pas de batching avant d'avoir :
- $5B+ (Formulas.exe)
- 500+ hacking level
- 2TB+ RAM réseau
- Revenue stable $10k+/s

**Le serpent a appris le kung fu. Maintenant il doit pratiquer.** 🐍🥋

---

```
╔═══════════════════════════════════════════════════════════╗
║  🥋 NEO CONNAÎT MAINTENANT LE KUNG FU                     ║
║     Mais connaître ≠ maîtriser                            ║
║     Il faut pratiquer, tester, itérer                     ║
║     Le serpent rampe avant de frapper                     ║
╚═══════════════════════════════════════════════════════════╝
```
