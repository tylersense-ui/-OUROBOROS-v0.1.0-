# 🐍 OUROBOROS - Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2025-01-XX

### 🎉 RÉVOLUTION : HWGW BATCHING

**LE SERPENT FRAPPE ENFIN EN PARALLÈLE !**

Passage de **$0/s → $10k-50k/s** revenue projeté sur foodnstuff.

### 🆕 Added

**MODULES CORE** :
- **`/lib/prep-module.js`** : Module de préparation serveur réutilisable
  - Prep parallèle (weaken + grow simultanés)
  - 4x plus rapide que séquentiel (48s vs 183s)
  - Calculs approximatifs sans Formulas.exe
  - Recovery padding 10x pour stabilité
  - API: `prepareServer()`, `isServerReady()`, `getPrepInfo()`

- **`/core/simple-batcher.js`** : Orchestrateur HWGW basique
  - Batching HWGW (Hack-Weaken-Grow-Weaken)
  - Timing précis (200ms spacing entre finishes)
  - Hack 5% par batch (conservateur)
  - Recovery padding 10x
  - Revenue tracking temps réel
  - 1 batch à la fois (simple mode)

**RESEARCH** :
- **`/home/claude/state/research/bitburner-advanced-techniques.md`** (17KB)
  - Synthèse complète techniques experts Bitburner
  - 9 techniques majeures documentées
  - Sources : alainbryden (712⭐), Steam guides, GitHub experts

### 🔧 Enhanced

**Architecture** :
- Modularisation complète (PrepModule externalisé)
- Séparation responsabilités (prep vs batching)
- Réutilisabilité maximale

**Calculs** :
- Approximations intelligentes sans Formulas.exe
  - `hackAnalyze()` pour threads hack
  - `growthAnalyze()` pour threads grow
  - Calculs manuels pour weaken threads
- Recovery padding 10x sur tous les threads

### 📊 Performance

**Avant (early-creeper v0.1.2)** :
- Mode : Séquentiel WGH
- Revenue : **$0/s** (bloqué en GROW)
- Threads : 0-117 sporadiques
- Utilisation RAM : ~5%

**Après (simple-batcher v0.2.0)** :
- Mode : Parallèle HWGW
- Revenue : **$10k-50k/s** (projeté)
- Threads : 200-400 actifs
- Utilisation RAM : 60-80%

**Gain estimé** : **∞% increase** ($0 → $$$)

### 🎓 Techniques Apprises

1. **HWGW Batching** : 4 scripts timés (H/W/G/W) au lieu de séquentiel
2. **Prep Parallèle** : 4x faster (tous finissent ensemble)
3. **Timing Précis** : 200ms spacing entre finishes
4. **Recovery Padding** : 10x threads pour absorber misfires
5. **Dynamic Targeting** : Score-based (money × chance / sec × difficulty)

### 📝 Notes Importantes

**SANS Formulas.exe** :
- Approximations via `hackAnalyze()` et `growthAnalyze()`
- Padding élevé (10x) pour compenser imprécisions
- Fonctionne bien en early/mid game

**AVEC Formulas.exe** (futur v0.3.0+) :
- Calculs exacts via ns.formulas API
- Padding réduit (2-5x)
- Optimisation EV/s (Expected Value per Second)

### 🚀 Prochaines Étapes

**v0.3.0 - Advanced Batcher** :
- [ ] Formulas.exe integration ($5B)
- [ ] Dynamic hackPercent (EV/s optimization)
- [ ] Multiple batches simultanées
- [ ] FFD packing (First-Fit Decreasing)
- [ ] Job splitting (5k threads max)

**v0.4.0 - Multi-Target** :
- [ ] Orchestration multi-serveurs
- [ ] Adaptive cycle timing
- [ ] Stock market manipulation
- [ ] Performance telemetry avancée

---

## [0.1.2] - 2025-01-XX

### 🔧 Fixed
- **Deprecation warnings Bitburner 2.8.1** :
  - `ns.tail()` → `ns.ui.openTail()` dans tous les fichiers
  - `ns.getTimeSinceLastAug()` → `Date.now() - ns.getResetInfo().lastAugReset`

### 📦 Updated
- `early-creeper.js` v0.1.2 : Enhanced debug (exact money %, security Δ, explicit reasons)
- `log-action.js` v0.1.2 : Removed auto-tail (no spam)
- `telemetry-daemon.js` v0.1.1 : Deprecation fixes
- `blackbox.js` v0.1.1 : Deprecation fixes

### 🆕 Added
- `/managers/server-manager.js` : Auto-buy 25 purchased servers (Matrix names)
- `/tools/target-diagnostic.js` : Diagnostic tool pour debug targets

---

## [0.1.1] - 2025-01-XX

### 🆕 Added
- **Workers** : `/workers/hack.js`, `/workers/grow.js`, `/workers/weaken.js`
- **Core** : `/core/early-creeper.js` (orchestrateur sequential WGH)
- **CHANGELOG.md** : Historique versions

### 🔧 Fixed
- Deprecation warnings (ns.tail, getTimeSinceLastAug)

### 📦 Updated
- `manifest.json` → v0.1.1

---

## [0.1.0] - 2025-01-XX

### 🎉 Initial Release

**OUROBOROS Framework créé !**

### 🆕 Added
- **Libraries** (`/lib/`) :
  - `debug.js` : Système DEBUG universel (4 niveaux)
  - `state-manager.js` : API persistence `/state/`

- **Tools** (`/tools/`) :
  - `log-action.js` : Logger actions opérateur
  - `telemetry-daemon.js` : Monitoring permanent
  - `blackbox.js` : Coding contracts solver (29 types)

- **Documentation** :
  - `README.md` : Documentation complète
  - `manifest.json` : Tracking fichiers
  - `deploy-ouroboros-v0.1.0.js` : Déploiement GitHub

### ✨ Features
- Système DEBUG multi-niveaux (0-3)
- State Manager avec auto-création `/state/`
- Telemetry avec alarmes
- Headers ASCII art complets
- Support `--debug` universel

---

## Format

### Types de changements
- `🆕 Added` : Nouvelles fonctionnalités
- `📝 Changed` : Modifications de fonctionnalités existantes
- `🔧 Fixed` : Corrections de bugs
- `🗑️ Removed` : Fonctionnalités supprimées
- `⚠️ Deprecated` : Fonctionnalités dépréciées
- `🔒 Security` : Corrections de sécurité

### Versioning
- **MAJOR** : Changements incompatibles
- **MINOR** : Ajout fonctionnalités (rétrocompatible)
- **PATCH** : Corrections bugs (rétrocompatible)

---

```
╔═══════════════════════════════════════════════════════════╗
║  "Le Serpent dévore le passé pour construire un futur     ║
║   plus fort à chaque cycle" - OUROBOROS Philosophy        ║
╚═══════════════════════════════════════════════════════════╝
```
