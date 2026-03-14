# 🐍 OUROBOROS - Changelog

## [0.2.1] - 2025-03-14 - 🥋 LE COUP DE NEO

### 🎯 RÉVOLUTION : PARALLEL DEPLOYMENT MASSIF

**Problème résolu** : early-creeper faisait $0/s car 1 thread séquentiel à la fois.

**Solution** : Deploy 100+ threads en parallèle sur 17 hosts.

---

### 🆕 Added

**improved-creeper.js** - Le Serpent Qui Frappe
- **Parallel deployment massif** : 100+ threads simultanés au lieu de 1
- **Ratios dynamiques** selon état target :
  - WEAKEN mode : 100% weaken
  - GROW mode : 70% grow + 30% weaken
  - HACK mode : 20% hack + 60% grow + 20% weaken
- **Validation RAM stricte** : Jamais dépasser RAM disponible
- **Refresh rapide** : 5s au lieu de 30s
- **RAM analysis détaillée** : Tracking usage network complet

**Kung Fu Lessons Applied** :
- ✅ grow() exponentiel compris (no more 42TB)
- ✅ Validation RAM stricte partout
- ✅ Pas de padding délirant (facteur 10x retiré)
- ✅ Stratégie adaptative selon état
- ✅ Parallel > Sequential

---

### 📊 Performance Attendue

```
v0.1.2 (early-creeper) :
- 1 thread séquentiel
- Revenue : $0/s
- RAM usage : 5%

v0.2.1 (improved-creeper) :
- 100+ threads parallèles
- Revenue : $2k-8k/s
- RAM usage : 60-80%
```

**Gain** : $0/s → $2k-8k/s (infini × amélioration)

---

### 🔧 Fixed

- **42.33TB RAM requirement** → Validation stricte empêche dépassement
- **Sequential bottleneck** → Deploy massif parallèle
- **$0/s revenue** → Ratios optimisés + parallel threads
- **Slow refresh** → 5s au lieu de 30s

---

### 📝 Changed

**early-creeper.js** :
- Statut : DEPRECATED (fonctionne mais lent)
- Remplacé par : improved-creeper.js
- Raison : 1 thread séquentiel = trop lent

**Stratégie deployment** :
- AVANT : 1 thread, attendre fin, next thread
- APRÈS : Deploy tous threads disponibles simultanément

---

### 🗑️ Removed

**simple-batcher.js** + **prep-module.js** :
- Statut : ABANDONED
- Raison : Design fondamentalement cassé (42TB RAM)
- Remplacé par : improved-creeper.js (parallel sans batching)

**HWGW batching** :
- Report à v0.3.0+ (quand $100k+ revenue)
- Prerequis : Formulas.exe ($5B), 500+ hacking, 2TB+ RAM

---

### 📚 Documentation

**formation-bitburner-complete.md** :
- 10 sections de formation complète
- Erreurs communes documentées
- Formules mathématiques exactes
- Progression Early → Mid → Late game
- Kung Fu lessons applied

---

## [0.2.0] - 2025-03-14 - ❌ ÉCHEC (ABANDONNÉ)

### ⚠️ ÉCHEC : HWGW Batching Prématuré

**Problème** : 42.33TB RAM requis vs 370GB disponible (facteur 114x).

**Cause racine** :
- Mauvaise compréhension de grow() exponentiel
- Padding 10x sans validation
- HWGW batching trop complexe pour early-game

**Leçon** : Ne pas sauter Sequential → HWGW directement.

### 🗑️ Fichiers Abandonnés
- `/lib/prep-module.js` - Design cassé
- `/core/simple-batcher.js` - 42TB RAM requis

**Action** : Retour à l'approche progressive.

---

## [0.1.2] - 2025-01-XX

### 🔧 Fixed
- **Deprecation warnings Bitburner 2.8.1**
- `ns.tail()` → `ns.ui.openTail()`
- `ns.getTimeSinceLastAug()` → `Date.now() - ns.getResetInfo().lastAugReset`

### 📦 Updated
- `/tools/telemetry-daemon.js` v0.1.2 - Auto-tail removed
- `/tools/log-action.js` v0.1.2 - Auto-tail removed
- `/tools/blackbox.js` v0.1.1 - Fix deprecation

---

## [0.1.1] - 2025-01-XX

### 🆕 Added
- **Workers** : hack.js, grow.js, weaken.js (1.70-1.75GB RAM)
- **Core** : early-creeper.js (Sequential WGH orchestrator)
- **CHANGELOG.md** : Historique versions

### 🔧 Fixed
- Deprecation warnings corrigés

---

## [0.1.0] - 2025-01-XX - 🎉 INITIAL RELEASE

### 🆕 Added
- **Framework OUROBOROS** : Création initiale
- **Libraries** : debug.js, state-manager.js
- **Tools** : log-action.js, telemetry-daemon.js, blackbox.js
- **Documentation** : README.md, manifest.json
- **Deploy** : deploy-ouroboros-v0.1.0.js

### ✨ Features
- Système DEBUG universel (4 niveaux)
- State Manager avec persistence /state/
- Telemetry Daemon (monitoring permanent)
- Coding Contracts Solver (29 types)

---

## Format

### Types de changements
- `🆕 Added` : Nouvelles fonctionnalités
- `📝 Changed` : Modifications de fonctionnalités existantes
- `🔧 Fixed` : Corrections de bugs
- `🗑️ Removed` : Fonctionnalités supprimées / abandonnées
- `⚠️ Deprecated` : Fonctionnalités dépréciées
- `🔒 Security` : Corrections de sécurité

---

```
╔═══════════════════════════════════════════════════════════╗
║  🥋 v0.2.1 - NEO FRAPPE                                   ║
║     1 thread → 100+ threads                               ║
║     $0/s → $2k-8k/s                                       ║
║     Le serpent maîtrise le kung fu                       ║
╚═══════════════════════════════════════════════════════════╝
```
