# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.6.0] - 2026-10-16

### Added
- **Star Sparks Duplicate Protection & Atelier Exchange System** (`game_modules/items_db.js`, `game_modules/minigames/cases.js`):
  - Dynamic duplicate reward calculation based on item rarity (`common`, `rare`, `epic`, `halloween`, `legendary`, `mythic`) and drop chance percentage ($\le 10\%$, $\le 5\%$).
  - Full bundle breakdown logic: individual evaluation of elements in multi-item sets, granting new items and accumulating Star Sparks for duplicates.
  - Interactive «✨ Ателье» tab embedded in the Wardrobe modal with 3 exchange recipes: coins, guaranteed missing outfit (pity protection), and secret wish coupon.
  - Royal pet treat (+40% hunger, +30% happy) and romantic compliment generator from Alexey upon rolling duplicate items.
  - Live spark balance badges integrated into App Header, Wardrobe Modal, and Casino Hub.
- **Macroeconomy Balance & AI Advisor Integration** (`admin_modules/admin_economy.js`):
  - Expected duplicate value ($1 \text{ ✨} \approx 20 \text{ 🪙}$) factored into case RTP equations, ensuring stable 75–82% return even with collected wardrobes.
  - Comprehensive Halloween Crypt RTP audit added to LiveOps engine.
  - AI Economy Advisor monitors player Star Sparks stockpile ($\ge 20 \text{ ✨}$) and suggests Atelier promotions.
- **Support Desk (Tier-1 CRM Decision Tree) Enhancements** (`admin_modules/admin_main.js`, `dashboard.html`):
  - Added «✨ Звёздные Искры и Повторки» node under the Drops branch with 1-click spark compensation (+2, +6, +10 ✨) and 1C Ledger audit trails.
  - Added `editPetSparks` input in Mission Control dashboard.
  - Added canned response templates for duplicate compensations and Atelier invitations.

---

## [2.4.1] - 2026-10-16


### Added
- **Support Desk Live Chats & Auto-Archive** (`admin/dashboard_main.js`, `dashboard.html`):
  - Strictly separated active chats (`⚡ В работе`) and completed/archived chats (`📜 История`) in Support Desk.
  - Resolved tickets (`status === "done"`, `resolved`, `closed`, or `claimed === true`) now immediately and automatically fly out of the active chats bar into History.
  - Added mode switcher tabs in Support Desk header with live ticket counts: `⚡ В работе (N)` and `📜 История (M)`.
  - Added Zero Inbox completion screen when all active inquiries are handled.
  - Added `reopenDeskTicket` action allowing historical tickets to be reopened and restored into the active queue.
  - Linked `badgeSupportDeskCount` on the Mission Control top navigation bar to the live count of active support tickets.

---

## [2.4.0] - 2026-10-16

### Added
- **Tier-1 CRM Support Decision Tree** (`admin/dashboard_main.js`):
  - Comprehensive 5-branch resolution tree in Support Desk:
    - 💰 **Finances & Ledger**: Audit transaction history, verify 1C ledger hashes, 1-click compensation grants (+50, +100, +250 🪙).
    - 🎁 **Drops & Lootboxes**: Black Box, Halloween, standard/premium drops, item resend.
    - 🐾 **Pet Care Emergency**: Rapid health/energy recovery, `wakeUpPetSupport` (instant wake-up from sleep), `cleanPoopSupport` (instant room sanitization and mood boost).
    - 💌 **Wishes Vault**: Coupon status resolution, `redeemWishCouponSupport` (mark used / issue replacement gift coupon).
    - ⚙️ **Technical Operations**: Local sandbox vs Cloud conflict resolution, browser log buffer telemetry analysis.
  - 5 pre-configured canned response templates matching common support scenarios.
- **Conversational Quick Chips** (`index.html`, `app.js`):
  - Interactive player chat chips for common customer inquiries: «Не начислились монеты», «Котик застрял во сне», «Как использовать купон?», «Сообщить об ошибке».
  - Real-time pet status and wishes count reflection inside support drawer header.
- **Single Source of Truth Versioning**:
  - Central `version.json` and `package.json` specifying `v2.4.0`.
  - Version badges embedded in Mission Control (`dashboard.html`) and Mobile Pet App (`index.html`).

### Fixed
- **Critical Stack Overflow**: Resolved `RangeError: Maximum call stack size exceeded at escapeHtml` in `admin/dashboard_kanban.js` by centralizing canonical HTML escaping in `admin/dashboard_api.js` (`window.escapeHtml`).
- **Repository Hygiene**: Purged untracked development skills and temporary directories from Git tracking, preventing repository bloat.

---

## [2.3.0] - 2026-10-15

### Added
- **Support Chat Intercom / Crisp UI Overhaul** (`admin/dashboard_chat.js`, `index.html`, `app.js`):
  - Mobile slide-over drawer with chat bubble alignment, sender avatars, and relative timestamps.
  - Optimistic UI updates with instant message delivery and server echo deduplication (`msg.id`).
  - Image attachment previews with full-screen Lightbox viewer (`modalChatLightbox`).
  - Interactive 5★ CSAT customer satisfaction rating prompt upon ticket resolution.

### Fixed
- Auto-scroll lock issue preventing message feed from jumping to newest messages.
- Polling flickers caused by full container re-renders on background intervals.

---

## [2.2.0] - 2026-10-14

### Added
- **AI Economy Advisor Model** (`admin/dashboard_economy.js`):
  - Macro-economic balance algorithm targeting an 88% casino RTP corridor (84% – 92%).
  - Soft automated adjustments to game bet amounts and drop probabilities to prevent runaway inflation.
- **IRL Budget Guard Module**:
  - Strict 5 000 ₽/month real-money expenditure cap safeguarding wish redemption economics.
  - Wish cost classification categories: Small (400 ₽), Medium (1 200 ₽), Epic (2 500 ₽).

---

## [2.1.0] - 2026-10-13

### Added
- **Unified Wardrobe & Showcase Grid** (`app.js`, `index.html`):
  - Harmonized responsive grid layout (2 columns mobile, 3 columns desktop) for Outfits, Items, Fur styles, and Room themes.
  - Tiered rarity badges (Common, Rare, Legendary) with luminous glow effects.
  - Standardized price action buttons with active outfit indicators.

---

## [2.0.0] - 2026-10-12

### Changed
- **Enterprise Modular Architecture**:
  - Decoupled monolithic codebase into clean modular namespaces:
    - `admin/`: `dashboard_api.js`, `dashboard_chat.js`, `dashboard_economy.js`, `dashboard_kanban.js`, `dashboard_main.js`.
    - `game/`: `items.js`, `renderMap.js`, `cases.js`, `casino.js`, `games.js`.
  - Linear / Vercel dark mode redesign for Mission Control portal.
- **1C-Style Immutable Audit Ledger**:
  - Cryptographically hashed double-entry bookkeeping ledger tracking all coin minting, spending, and admin adjustments.

---

## [1.0.0] - 2026-10-01

### Added
- Initial production release:
  - Virtual pet Tamagotchi simulation (hunger, happiness, hygiene, energy cycles).
  - Food delivery decision roulette wheel with customizable slots.
  - Mini-games: Subway Cat runner, Catch delicious food, Rhythm Cat.
  - JSONBin cloud persistence and local offline fallback storage.
