ouroboros/
├── README.md
├── manifest.json                       ← MIS À JOUR v0.1.1
├── CHANGELOG.md                        ← NOUVEAU
├── deploy-ouroboros-v0.1.0.js          ← Existant (v0.1.0 ok pour l'instant)
│
├── lib/
│   ├── debug.js                        ← Existant v0.1.0
│   └── state-manager.js                ← Existant v0.1.0
│
├── workers/                            ← NOUVEAU DOSSIER
│   ├── hack.js                         ← NOUVEAU
│   ├── grow.js                         ← NOUVEAU
│   └── weaken.js                       ← NOUVEAU
│
├── core/                               ← NOUVEAU DOSSIER
│   └── early-creeper.js                ← NOUVEAU
│
└── tools/
    ├── log-action.js                   ← REMPLACER par v0.1.1
    ├── telemetry-daemon.js             ← REMPLACER par v0.1.1
    └── blackbox.js                     ← REMPLACER par v0.1.1