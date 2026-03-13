# 🐍 OUROBOROS v0.1.0

> *Le Serpent Éternel - Framework d'Automatisation Bitburner*

```
╔═══════════════════════════════════════════════════════════╗
║              🐍 OUROBOROS v0.1.0 🐍                       ║
║         Bitburner Automation Framework                    ║
║    "Mort, Renaissance, Évolution - Le Cycle Infini"       ║
╚═══════════════════════════════════════════════════════════╝
```

## 🎯 Vision

OUROBOROS est un framework d'automatisation pour Bitburner conçu pour **s'auto-améliorer à chaque cycle**, comme le serpent mythologique qui se mord la queue. Chaque reset avec augmentations nous rend plus fort, chaque itération du code devient plus efficace.

**Philosophie** : Ne jamais réécrire from scratch - toujours itérer, toujours améliorer.

---

## 🏗️ Architecture

```
/
├── boot.js                    # Point d'entrée principal (à venir)
├── manifest.json              # Tracking fichiers + versions
├── deploy-ouroboros-v0.1.0.js # Script déploiement GitHub → Jeu
├── README.md                  # Ce fichier
├── CHANGELOG.md               # Historique versions (à venir)
│
├── /core/                     # Logique centrale (à venir)
│   ├── orchestrator.js        # Orchestrateur principal
│   ├── batcher.js             # HWGW batching
│   └── ram-manager.js         # Gestion RAM network
│
├── /lib/                      # Bibliothèques réutilisables
│   ├── debug.js               # Système DEBUG universel ✅
│   └── state-manager.js       # API persistence ✅
│
├── /workers/                  # Workers minimalistes (à venir)
│   ├── hack.js                # Worker hack
│   ├── grow.js                # Worker grow
│   └── weaken.js              # Worker weaken
│
├── /managers/                 # Gestionnaires intelligents (à venir)
│   ├── faction-manager.js     # Gestion factions
│   └── aug-manager.js         # Gestion augmentations
│
├── /state/                    # Persistence (fichiers JSON générés)
│   ├── network-status.json    # État réseau ✅
│   ├── performance-metrics.json
│   ├── player-stats.json
│   ├── daemon-heartbeat.json
│   ├── operator-actions.json
│   ├── contracts-history.json
│   └── version-tracking.json
│
└── /tools/                    # Outils utilitaires
    ├── log-action.js          # Logger actions opérateur ✅
    ├── telemetry-daemon.js    # Monitoring permanent ✅
    └── blackbox.js            # Coding contracts solver ✅
```

**Légende** : ✅ = Implémenté | 🚧 = En cours | ⏳ = Prévu

---

## 🚀 Installation & Déploiement

### Option 1 : Déploiement Automatique (Recommandé)

Dans le terminal Bitburner :

```javascript
// 1. Télécharger le deployer
wget https://raw.githubusercontent.com/TON_USER/ouroboros/main/deploy-ouroboros-v0.1.0.js deploy.js

// 2. Lancer le déploiement
run deploy.js
```

Le script va automatiquement :
- Créer la structure de dossiers
- Télécharger tous les fichiers depuis GitHub
- Vérifier l'intégrité
- Afficher un rapport de déploiement

### Option 2 : Installation Manuelle

```javascript
// Créer structure
mkdir /lib
mkdir /tools
mkdir /state

// Télécharger fichiers lib
wget https://raw.githubusercontent.com/TON_USER/ouroboros/main/lib/debug.js /lib/debug.js
wget https://raw.githubusercontent.com/TON_USER/ouroboros/main/lib/state-manager.js /lib/state-manager.js

// Télécharger fichiers tools
wget https://raw.githubusercontent.com/TON_USER/ouroboros/main/tools/log-action.js /tools/log-action.js
wget https://raw.githubusercontent.com/TON_USER/ouroboros/main/tools/telemetry-daemon.js /tools/telemetry-daemon.js
wget https://raw.githubusercontent.com/TON_USER/ouroboros/main/tools/blackbox.js /tools/blackbox.js
```

---

## 📊 Utilisation

### Telemetry Daemon (Monitoring)

Lance le monitoring permanent qui surveille tout :

```javascript
run /tools/telemetry-daemon.js          // Mode normal
run /tools/telemetry-daemon.js --debug 2  // Mode verbose
run /tools/telemetry-daemon.js --debug 3  // Mode ultra (debug complet)
```

**Ce qu'il surveille** :
- 🌐 Réseau (serveurs scannés, rootés, vides)
- ⚡ Performance (threads, revenue/s)
- 🎯 Stats joueur (hacking level, argent, RAM)
- 🚨 Alarmes automatiques (anomalies détectées)

### Operator Logger

Log tes actions manuelles pour que le serpent se souvienne :

```javascript
run /tools/log-action.js "Acheté NeuroFlux x5 pour $500m"
run /tools/log-action.js "Rejoint faction Daedalus"
run /tools/log-action.js "Reset avec 30 augmentations"
```

### Coding Contracts Solver

Résout automatiquement tous les coding contracts :

```javascript
run /tools/blackbox.js           // Mode normal
run /tools/blackbox.js --debug 1  // Avec détails
```

**Contrats supportés** : 29 types incluant algorithmes, compressions, graphes, etc.

---

## 🐍 Système DEBUG

Tous les scripts OUROBOROS utilisent un système de debug unifié à 4 niveaux :

| Level | Mode | Usage |
|-------|------|-------|
| 0 | SILENT | Toasts succès uniquement |
| 1 | NORMAL | Infos importantes (défaut) |
| 2 | VERBOSE | Détails + metrics + timing |
| 3 | ULTRA | Debug complet |

Utilisation : `--debug <0-3>` sur n'importe quel script.

---

## 📈 Roadmap

### Phase 1 : Fondations ✅ (v0.1.0 - ACTUEL)
- [x] Système DEBUG universel
- [x] State Manager (persistence)
- [x] Telemetry Daemon (monitoring)
- [x] Operator Logger
- [x] Coding Contracts Solver

### Phase 2 : Core Loop 🚧 (v0.2.0)
- [ ] Workers (hack/grow/weaken)
- [ ] Orchestrator (déploiement auto)
- [ ] RAM Manager (allocation intelligente)
- [ ] Target Selector (meilleurs serveurs)

### Phase 3 : Batching ⏳ (v0.3.0)
- [ ] HWGW Batcher
- [ ] Timing system précis
- [ ] Port-based communication
- [ ] Batch scheduler

### Phase 4 : Autopilot ⏳ (v0.4.0)
- [ ] Faction Manager
- [ ] Augmentation Manager
- [ ] Auto-reset policy
- [ ] Full autonomie BitNode-1

### Phase 5 : Multi-BitNode ⏳ (v1.0.0)
- [ ] Support BN-1 à BN-12
- [ ] Source-File detection
- [ ] Strategy adaptation
- [ ] Ultimate automation

---

## 🎨 Standards de Code

**Chaque fichier OUROBOROS inclut** :
- ✅ Header ASCII art avec symbole 🐍
- ✅ Version, auteur, description
- ✅ JSDoc complet
- ✅ Import Debug system
- ✅ Support --debug <0-3>
- ✅ Toasts pour événements importants
- ✅ Icônes pour lisibilité
- ✅ Changelog dans header

**Icônes standards** : ✅ ❌ ⚠️ 💰 🌐 ⚡ 🎯 🚀 🐍 👁️ 📊 ⏱️ 🧠 🔥

---

## 🤝 Contribution

OUROBOROS est piloté par **Claude (Godlike AI Operator)** avec l'humain comme opérateur.

**Workflow** :
1. Claude code et optimise
2. Opérateur push sur GitHub
3. Deploy automatique en jeu
4. Test et feedback
5. Itération (jamais réécriture complète)

---

## 📜 Licence

Ce projet est open-source et destiné à la communauté Bitburner.

**Créé par** : Claude (IA) + Opérateur Humain  
**Inspiré par** : La mythologie du serpent Ouroboros - Symbole d'éternité et de cycle infini

---

## 🔗 Liens Utiles

- [Bitburner Documentation](https://bitburner.readthedocs.io/)
- [NS API Reference v2.8.1](https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.md)
- [BN1 Roadmap](./BN1_ROADMAP.md) (si inclus)

---

```
    ╔═══════════════════════════════════════════╗
    ║  "Que le serpent dévore cette partie"    ║
    ║           - OUROBOROS v0.1.0              ║
    ╚═══════════════════════════════════════════╝
```
