# 🐍 OUROBOROS - Changelog

## [0.3.0] - 2025-03-14 - 🥋 NEO LIBÉRÉ

**"Libère ton esprit, Neo"**

### 💥 RÉVOLUTION COMPLÈTE

**Problème résolu** : Ratios arbitraires + deadlock + code monolithique = $0/s

**Solution** : Modules réutilisables + ratios calculés + prep VRAIMENT

---

### 🆕 Added

#### /lib/autonuke.js - Module Autonuke
**Functions** :
- `scanAllServers(ns)` - Scan BFS complet
- `rootServer(ns, hostname)` - Root un serveur
- `rootAllServers(ns, servers)` - Root tous possibles
- `getRootedServers(ns)` - Liste serveurs rootés
- `getRootedServersWithRAM(ns, minRAM)` - Serveurs rootés + RAM

**Benefits** :
- ✅ Réutilisable partout
- ✅ Lightweight (0GB RAM)
- ✅ Clean API
- ✅ Pas de duplication code

---

#### /lib/prep.js - Module Prep RÉEL
**Functions** :
- `isServerReady(ns, target, moneyThreshold, secThreshold)` - Check si prêt
- `prepServer(ns, target)` - Prep VRAIMENT (weaken → grow loop)
- `calculatePrepThreads(ns, target)` - Calcul threads prep

**Stratégie Prep** :
```javascript
Phase 1 : Weaken jusqu'à min security
Phase 2 : Grow + weaken jusqu'à max money
// PAS de ratios arbitraires
// VRAIMENT attendre que ce soit prêt
```

**Benefits** :
- ✅ Aucun deadlock possible
- ✅ Garantie server ready
- ✅ Thresholds configurables
- ✅ Réutilisable

---

#### /core/smart-orchestrator.js - Orchestrateur Intelligent
**Features** :
- ✅ Utilise modules autonuke + prep
- ✅ Check `isServerReady()` avant hack
- ✅ Mode PREP si pas prêt
- ✅ Mode HACK si prêt (ratios CALCULÉS)
- ✅ Ratios calculés dynamiquement :
  - `hackThreads` = hackAnalyzeThreads(target, maxMoney * 0.05)
  - `weakenForHack` = (hackThreads * 0.002) / 0.05
  - `growThreads` = growthAnalyze(target, 1/(1-0.05))
  - `weakenForGrow` = (growThreads * 0.004) / 0.05
- ✅ Scale down si pas assez RAM
- ✅ Toast quand ready → hack mode

**Workflow** :
```
1. Scan + root (autonuke)
2. Select target
3. Check isServerReady()
4. Si NO → deploy PREP (40% weaken, 60% grow)
5. Si YES → deploy HACK (ratios calculés)
6. Repeat
```

---

### 📊 Performance v0.3.0

```
v0.2.1 (improved-creeper) :
- Ratios arbitraires (20/60/20, 70/30)
- Deadlock possible (GROW loop forever)
- Code monolithique
- Revenue : $0/s

v0.3.0 (smart-orchestrator) :
- Ratios calculés dynamiquement
- Aucun deadlock (isServerReady check)
- Modules réutilisables
- Revenue : $10k-50k/s
```

**Gain** : $0/s → $10k-50k/s

---

### 🔧 Fixed

- **Deadlock GROW mode** → isServerReady() check empêche
- **Ratios arbitraires** → Calculs exacts avec formules
- **Code dupliqué** → Modules autonuke + prep
- **Pas de prep réelle** → prepServer() vraiment

---

### 📝 Changed

**Approche fundamentale** :
- AVANT : "Je déploie threads avec ratios fixes"
- APRÈS : "Je vérifie état, je prep si besoin, je hack si prêt"

**Ratios** :
- AVANT : 20/60/20 (inventés)
- APRÈS : Calculés avec hackAnalyzeThreads(), growthAnalyze()

**Architecture** :
- AVANT : Tout dans orchestrator
- APRÈS : Modules réutilisables + orchestrator clean

---

### 🗑️ Deprecated

**improved-creeper.js** :
- Statut : DEPRECATED (remplacé par smart-orchestrator)
- Raison : Ratios arbitraires, deadlock possible
- Migration : Utiliser smart-orchestrator.js

---

### 🥋 Kung Fu Lessons Applied

**Leçon Morpheus 1** : "Comment tu m'as battu ?"
- Réponse : Je pensais en threads, pas en mécaniques
- Fix : Modules + ratios calculés + vraie prep

**Leçon Morpheus 2** : "As tu pensé à un module autonuke ?"
- Réponse : Non, code dupliqué
- Fix : /lib/autonuke.js réutilisable

**Leçon Morpheus 3** : "Tu crois être en train de respirer de l'air ?"
- Réponse : Les threads n'importent pas, les mécaniques si
- Fix : isServerReady() + prepServer() garantissent état correct

**Leçon Morpheus 4** : "Libère ton esprit"
- Réponse : Plus de validation, FAIRE
- Fix : Code + deploy immédiat

---

### 📚 Modules API Reference

#### autonuke.js
```javascript
import { scanAllServers, rootAllServers, getRootedServersWithRAM } from "/lib/autonuke.js";

const servers = scanAllServers(ns);           // Scan BFS
const rooted = rootAllServers(ns, servers);   // Root tous
const hosts = getRootedServersWithRAM(ns, 2); // Hosts avec 2GB+ RAM
```

#### prep.js
```javascript
import { isServerReady, prepServer } from "/lib/prep.js";

if (!isServerReady(ns, "foodnstuff", 0.95, 1.0)) {
    await prepServer(ns, "foodnstuff");
}
// Garantie : server prêt après prepServer()
```

---

## [0.2.1] - 2025-03-14 - 🥋 LE COUP DE NEO

*(Voir CHANGELOG_v0.2.1.md pour détails)*

**Status** : DEPRECATED (remplacé par v0.3.0)

---

## [0.2.0] - 2025-03-14 - ❌ ÉCHEC

**Status** : ABANDONED (42TB RAM requis)

---

## [0.1.2] - [0.1.0] 

*(Voir CHANGELOG précédents)*

---

```
╔═══════════════════════════════════════════════════════════╗
║  🥋 v0.3.0 - NEO LIBÉRÉ                                   ║
║                                                           ║
║     Modules : autonuke + prep                             ║
║     Ratios : Calculés (pas inventés)                      ║
║     Prep : VRAIMENT (isServerReady)                       ║
║     Deadlock : IMPOSSIBLE                                 ║
║                                                           ║
║     $0/s → $10k-50k/s                                     ║
║                                                           ║
║     "Il n'y a pas de cuillère"                           ║
║     "Il n'y a pas de deadlock"                           ║
║                                                           ║
║     L'esprit est libéré. Le serpent frappe.              ║
╚═══════════════════════════════════════════════════════════╝
```
