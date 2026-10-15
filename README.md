# Lex Labs: Kotya Pet & Mission Control

[![Version](https://img.shields.io/badge/version-2.4.0-indigo.svg)](version.json)
[![Status](https://img.shields.io/badge/status-production-emerald.svg)](dashboard.html)
[![SemVer](https://img.shields.io/badge/semver-2.0.0-blue.svg)](https://semver.org)
[![License](https://img.shields.io/badge/license-private-slate.svg)](#)

> Modern Cozy Virtual Pet & Food Roulette Game paired with an Enterprise Linear/Vercel-style Mission Control Dashboard.

---

## 🧭 Architecture Overview

The system is organized into modular decoupled subsystems:

```
TestKate/
├── index.html                   # Mobile-first Cozy Pet & Food Delivery Game
├── app.js                       # Client-side Core Game Engine & Tamagotchi Loops
├── game/
│   ├── items.js                 # Wardrobe, outfits, furs, and room catalog
│   ├── renderMap.js             # Pet canvas renderer and visual layers
│   ├── cases.js                 # Standard, Premium, and Black Box loot boxes
│   ├── casino.js                # Slots, Scratch cards, Crash, and Dice games
│   └── games.js                 # Subway Cat, Catch food, Rhythm Osu mini-games
├── dashboard.html               # Lex Labs Mission Control (Linear/Vercel Dark Theme)
├── admin/
│   ├── dashboard_api.js         # Cloud Gateway, LocalStorage cache & sanitizers
│   ├── dashboard_main.js        # Mission Control UI, Tier-1 Decision Tree, Metrics
│   ├── dashboard_economy.js     # Macro AI Economy Advisor & IRL Budget Guard
│   ├── dashboard_chat.js        # Real-time Support Chat & Ticket Management
│   └── dashboard_kanban.js      # QA Bug Tracker Kanban & 1C Audit Ledger
├── version.json                 # Single Source of Truth for application version
├── package.json                 # Project configuration & npm validation scripts
└── CHANGELOG.md                 # Keep a Changelog historical release notes
```

---

## 🏷️ Versioning Policy (SemVer & Conventional Commits)

This project strictly adheres to **[Semantic Versioning 2.0.0](https://semver.org/)**:
- **MAJOR (`X.0.0`)**: Incompatible API changes, major architectural redesigns (e.g. monolithic to modular split in `v2.0.0`).
- **MINOR (`0.X.0`)**: New feature sets, game mechanics, or administrative capabilities added in a backwards-compatible manner (e.g. `v2.4.0` Tier-1 Decision Tree).
- **PATCH (`0.0.X`)**: Backwards-compatible bug fixes, styling polishes, and hotfixes.

### Release Workflow

1. Update version number in `version.json`, `package.json`, `index.html`, and `dashboard.html`.
2. Document new features, fixes, and changes in `CHANGELOG.md`.
3. Validate JavaScript syntax:
   ```powershell
   node --check app.js admin/*.js game/*.js
   ```
4. Commit using Conventional Commits:
   ```bash
   git add .
   git commit -m "chore(release): vX.Y.Z — Short descriptive release summary"
   git tag -a vX.Y.Z -m "Release vX.Y.Z: Detailed description"
   git push origin main --tags
   ```

---

## 🛠️ Verification & Local Development

To launch the local development server:
```powershell
python -m http.server 8080
```
- **Game URL**: `http://localhost:8080/index.html`
- **Mission Control**: `http://localhost:8080/dashboard.html`

To run static syntax verification across all modules:
```powershell
node --check app.js admin/dashboard_api.js admin/dashboard_chat.js admin/dashboard_economy.js admin/dashboard_kanban.js admin/dashboard_main.js game/cases.js game/casino.js game/games.js game/items.js game/renderMap.js
```
