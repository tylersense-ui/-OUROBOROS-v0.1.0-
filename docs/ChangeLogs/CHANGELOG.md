# 🐍 OUROBOROS - Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.1] - 2025-01-XX

### 🆕 Added
- **Workers** : `/workers/hack.js`, `/workers/grow.js`, `/workers/weaken.js`
  - Workers minimalistes (1.70-1.75GB RAM chacun)
  - Utilisables par tous les orchestrateurs
  - Design réutilisable (early-creeper → batcher)

- **Core** : `/core/early-creeper.js`
  - Orchestrateur early-game complet
  - Sequential WGH loop intelligent
  - Auto-root progressif (unlock avec hacking level)
  - Target sélection par score (money × chance / security × difficulty)
  - Deployment automatique workers sur réseau
  - Adaptation dynamique au hacking level
  - State tracking `/state/creeper-status.json`
  - Support --debug 0-3

- **CHANGELOG.md** : Historique versions

### 🔧 Fixed
- **Deprecation warnings Bitburner 2.8.1** :
  - `ns.tail()` → `ns.ui.openTail()` dans tous les fichiers
  - `ns.getTimeSinceLastAug()` → `Date.now() - ns.getResetInfo().lastAugReset`
  
- **Fichiers corrigés** :
  - `/tools/telemetry-daemon.js` v0.1.1
  - `/tools/log-action.js` v0.1.1
  - `/tools/blackbox.js` v0.1.1

### 📦 Updated
- `manifest.json` → v0.1.1
  - Ajout workers (hack/grow/weaken)
  - Ajout early-creeper
  - Mise à jour dépendances
  - Ajout `/state/creeper-status.json`

### 📝 Notes
- **Stratégie early-game** maintenant opérationnelle
- **Phase 1** (Hacking 1-50) : Sequential WGH sur n00dles
- **Phase 2** (Hacking 50+) : Progressive target upgrade
- Early-creeper sera remplacé par batcher en v0.2.0+

---

## [0.1.0] - 2025-01-XX

### 🎉 Initial Release

### 🆕 Added
- **Framework OUROBOROS** : Création initiale
  
- **Libraries** (`/lib/`) :
  - `debug.js` : Système DEBUG universel (4 niveaux : SILENT, NORMAL, VERBOSE, ULTRA)
  - `state-manager.js` : API persistence complète pour `/state/`

- **Tools** (`/tools/`) :
  - `log-action.js` : Logger actions manuelles opérateur
  - `telemetry-daemon.js` : Daemon monitoring permanent (L'Œil d'OUROBOROS)
  - `blackbox.js` : Coding contracts solver (29 types supportés)

- **Documentation** :
  - `README.md` : Documentation complète projet
  - `manifest.json` : Tracking fichiers + versions
  - `deploy-ouroboros-v0.1.0.js` : Script déploiement auto GitHub

- **State files** (`/state/` - auto-générés) :
  - `network-status.json` : État réseau temps réel
  - `performance-metrics.json` : Métriques performance
  - `player-stats.json` : Stats joueur
  - `daemon-heartbeat.json` : Heartbeat telemetry
  - `operator-actions.json` : Historique actions opérateur
  - `contracts-history.json` : Historique coding contracts
  - `version-tracking.json` : Versions fichiers actifs

### ✨ Features
- **Système DEBUG universel** :
  - 4 niveaux de verbosité (0-3)
  - Toasts automatiques (succès/erreur/warning/info)
  - Timers pour profiling
  - Metrics display (money, RAM, threads)
  - Icons intégrés (✅ ❌ ⚠️ 💰 🌐 ⚡ 🎯 🚀 🐍 👁️)

- **State Manager** :
  - Auto-création `/state/` si absent
  - Validation JSON avant save
  - Méthodes : save, load, update, delete, list, backup, restore, cleanup, append
  - Support erreurs robuste

- **Telemetry Daemon** :
  - Monitoring continu (30s interval)
  - Scan réseau complet (BFS)
  - Détection anomalies (serveurs vides, RAM élevée, revenue=0)
  - Alarmes automatiques
  - Version tracking

- **BlackBox Solver** :
  - 29 types de contracts supportés
  - Scan automatique réseau (30s)
  - Historique succès/échecs
  - Stats cumulées
  - Toast par résolution

### 🎨 Standards
- **Headers ASCII art** sur tous les fichiers (🐍 symbole)
- **JSDoc** complet partout
- **Support --debug <0-3>** standard sur tous les scripts
- **Version tracking** unifié (v0.1.0)
- **Auteur** : Claude (Godlike AI Operator)
- **Icônes** standardisées partout

### 🏗️ Architecture
```
/lib/      - Bibliothèques réutilisables
/core/     - Logique centrale (à venir)
/workers/  - Workers minimalistes (à venir)
/managers/ - Gestionnaires (à venir)
/state/    - Fichiers JSON générés
/tools/    - Outils utilitaires
```

### 📋 Roadmap
- **v0.2.0** : Core loop complet (workers + orchestrator + RAM manager)
- **v0.3.0** : HWGW Batcher
- **v0.4.0** : Autopilot (factions + augs + reset policy)
- **v1.0.0** : Multi-BitNode support

---

## Format

### Types de changements
- `🆕 Added` : Nouvelles fonctionnalités
- `📝 Changed` : Modifications de fonctionnalités existantes
- `🔧 Fixed` : Corrections de bugs
- `🗑️ Removed` : Fonctionnalités supprimées
- `⚠️ Deprecated` : Fonctionnalités dépréciées (à supprimer prochainement)
- `🔒 Security` : Corrections de sécurité

### Versioning
- **MAJOR** : Changements incompatibles
- **MINOR** : Ajout fonctionnalités (rétrocompatible)
- **PATCH** : Corrections bugs (rétrocompatible)

---

```
╔═══════════════════════════════════════════════════════════╗
║  "Le Serpent Éternel dévore le passé pour construire      ║
║   un futur plus fort à chaque cycle"                      ║
║               - OUROBOROS Philosophy                      ║
╚═══════════════════════════════════════════════════════════╝
```
