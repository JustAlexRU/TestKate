/* =========================================================================
 * LEX LABS ENTERPRISE: FULL VECTOR RENDER MAP FOR ALL ITEMS
 * Файл: renderMap.js (Анатомические векторные SVG-шаблоны для 100% предметов)
 * Координатная сетка котика: viewBox="0 0 200 200"
 * Центр головы: (100, 92) | Глаза: (80, 90) и (120, 90)
 * Центр тела: (100, 142) | Лапки: (60, 174) и (140, 174)
 * ========================================================================= */

window.ITEM_SVG_TEMPLATES = {

  /* =======================================================================
   * 1. ГОЛОВНЫЕ УБОРЫ (HEAD) — 20 предметов
   * ======================================================================= */
  flower: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <circle cx="70" cy="46" r="6" fill="#f472b6"/>
      <circle cx="63" cy="51" r="6" fill="#f472b6"/>
      <circle cx="66" cy="58" r="6" fill="#f472b6"/>
      <circle cx="76" cy="56" r="6" fill="#f472b6"/>
      <circle cx="76" cy="48" r="6" fill="#f472b6"/>
      <circle cx="70" cy="52" r="4" fill="#fde047"/>
    </g>
  `,

  leaf: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))">
      <path d="M 100 44 Q 85 20 100 12 Q 115 20 100 44 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
      <line x1="100" y1="44" x2="100" y2="16" stroke="#15803d" stroke-width="1.2"/>
    </g>
  `,

  cap_red: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))">
      <path d="M 64 54 Q 100 24 136 54 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/>
      <ellipse cx="124" cy="54" rx="28" ry="7" fill="#dc2626"/>
      <circle cx="100" cy="28" r="3" fill="#b91c1c"/>
    </g>
  `,

  beanie: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))">
      <path d="M 60 56 Q 100 16 140 56 Z" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
      <rect x="58" y="50" width="84" height="10" rx="4" fill="#d97706"/>
      <circle cx="100" cy="18" r="7" fill="#fef08a"/>
    </g>
  `,

  beret: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.35))">
      <ellipse cx="94" cy="42" rx="44" ry="16" fill="#db2777" stroke="#9d174d" stroke-width="2" transform="rotate(-8 94 42)"/>
      <circle cx="92" cy="24" r="2.5" fill="#9d174d"/>
    </g>
  `,

  straw_hat: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))">
      <ellipse cx="100" cy="50" rx="58" ry="14" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
      <path d="M 74 48 Q 100 22 126 48 Z" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <path d="M 76 46 Q 100 42 124 46" stroke="#ef4444" stroke-width="4" fill="none"/>
    </g>
  `,

  party_hat: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.35))">
      <polygon points="80,52 100,10 120,52" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
      <polygon points="87,38 100,10 113,38" fill="#f43f5e"/>
      <circle cx="100" cy="8" r="5" fill="#facc15"/>
    </g>
  `,

  headphones: `
    <g filter="drop-shadow(0 3px 8px rgba(56,189,248,0.5))">
      <path d="M 52 70 A 50 50 0 0 1 148 70" fill="none" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>
      <rect x="46" y="58" width="12" height="26" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <rect x="142" y="58" width="12" height="26" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
    </g>
  `,

  detective_hat: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))">
      <ellipse cx="100" cy="50" rx="52" ry="12" fill="#78350f" stroke="#451a03" stroke-width="2"/>
      <path d="M 70 48 Q 100 20 130 48 Z" fill="#92400e" stroke="#451a03" stroke-width="2"/>
      <path d="M 68 50 Q 56 54 48 52" stroke="#78350f" stroke-width="4" fill="none"/>
      <path d="M 132 50 Q 144 54 152 52" stroke="#78350f" stroke-width="4" fill="none"/>
    </g>
  `,

  crown: `
    <g filter="drop-shadow(0 0 8px #fbbf24)">
      <polygon points="76,50 86,28 100,42 114,28 124,50" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <circle cx="86" cy="28" r="3" fill="#ef4444"/>
      <circle cx="100" cy="42" r="3" fill="#3b82f6"/>
      <circle cx="114" cy="28" r="3" fill="#10b981"/>
    </g>
  `,

  wizard: `
    <g filter="drop-shadow(0 0 8px #c084fc)">
      <polygon points="66,54 100,8 134,54" fill="#6d28d9" stroke="#4c1d95" stroke-width="2"/>
      <ellipse cx="100" cy="54" rx="42" ry="8" fill="#7c3aed"/>
      <polygon points="98,28 102,28 100,24" fill="#fde047"/>
    </g>
  `,

  chef_hat: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))">
      <rect x="76" y="44" width="48" height="12" rx="2" fill="#e2e8f0"/>
      <circle cx="76" cy="34" r="14" fill="#ffffff"/>
      <circle cx="100" cy="24" r="18" fill="#ffffff"/>
      <circle cx="124" cy="34" r="14" fill="#ffffff"/>
    </g>
  `,

  tiara: `
    <g filter="drop-shadow(0 0 8px #38bdf8)">
      <path d="M 78 50 Q 100 32 122 50" fill="none" stroke="#e2e8f0" stroke-width="3"/>
      <polygon points="94,44 100,32 106,44" fill="#38bdf8"/>
      <polygon points="84,48 88,40 92,48" fill="#bae6fd"/>
      <polygon points="108,48 112,40 116,48" fill="#bae6fd"/>
    </g>
  `,

  halo_gold: `
    <ellipse cx="100" cy="24" rx="38" ry="9" fill="none" stroke="#fbbf24" stroke-width="4.5" filter="drop-shadow(0 0 10px #f59e0b)"/>
  `,

  astronaut_helm: `
    <g filter="drop-shadow(0 0 8px #38bdf8)">
      <ellipse cx="100" cy="74" rx="54" ry="46" fill="rgba(56,189,248,0.22)" stroke="#94a3b8" stroke-width="4"/>
      <path d="M 68 56 Q 100 44 126 52" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.6"/>
    </g>
  `,

  cyber_crown: `
    <g filter="drop-shadow(0 0 10px #f43f5e)">
      <polygon points="70,48 82,18 94,40 100,12 106,40 118,18 130,48" fill="none" stroke="#f43f5e" stroke-width="3.5"/>
      <line x1="82" y1="18" x2="118" y2="18" stroke="#38bdf8" stroke-width="2"/>
    </g>
  `,

  hw_witch_hat: `
    <g filter="drop-shadow(0 0 8px #a855f7)">
      <ellipse cx="100" cy="50" rx="46" ry="12" fill="#150a24" stroke="#581c87" stroke-width="2"/>
      <path d="M 66 48 Q 85 10 118 2 Q 106 18 128 48 Z" fill="#24123d" stroke="#581c87" stroke-width="2"/>
      <path d="M 76 47 Q 95 42 120 47" stroke="#f97316" stroke-width="5" fill="none"/>
      <rect x="94" y="42" width="10" height="9" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
    </g>
  `,

  hw_pumpkin_helm: `
    <g filter="drop-shadow(0 0 10px #ea580c)">
      <ellipse cx="100" cy="42" rx="40" ry="28" fill="#ea580c" stroke="#c2410c" stroke-width="2.5"/>
      <ellipse cx="100" cy="42" rx="24" ry="28" fill="#f97316"/>
      <path d="M 100 16 Q 106 8 112 10" stroke="#15803d" stroke-width="4" fill="none" stroke-linecap="round"/>
      <polygon points="86,34 94,34 90,26" fill="#451a03"/>
      <polygon points="106,34 114,34 110,26" fill="#451a03"/>
      <path d="M 88 44 Q 100 52 112 44" stroke="#451a03" stroke-width="3" fill="none"/>
    </g>
  `,

  hw_bat_ears: `
    <g filter="drop-shadow(0 0 8px #c084fc)">
      <path d="M 68 56 Q 44 32 16 6 Q 36 24 32 40 Q 52 46 62 60 Z" fill="#170d26" stroke="#a855f7" stroke-width="2.5"/>
      <path d="M 32 40 Q 44 26 16 6" stroke="#c084fc" stroke-width="1.5" fill="none"/>
      <polygon points="50,48 34,22 58,40" fill="#3b0764" opacity="0.85"/>
      <path d="M 132 56 Q 156 32 184 6 Q 164 24 168 40 Q 148 46 138 60 Z" fill="#170d26" stroke="#a855f7" stroke-width="2.5"/>
      <path d="M 168 40 Q 156 26 184 6" stroke="#c084fc" stroke-width="1.5" fill="none"/>
      <polygon points="150,48 166,22 142,40" fill="#3b0764" opacity="0.85"/>
    </g>
  `,

  hw_demon_horns: `
    <g filter="drop-shadow(0 0 8px #ef4444)">
      <path d="M 68 52 Q 48 18 34 20 Q 52 34 66 56 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
      <path d="M 132 52 Q 152 18 166 20 Q 148 34 134 56 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
    </g>
  `,

  /* =======================================================================
   * 2. ЛИЦО И ГЛАЗА (EYES) — 20 предметов
   * ======================================================================= */
  glasses: `
    <g>
      <rect x="68" y="82" width="25" height="15" rx="3" fill="#11111b" opacity="0.95"/>
      <rect x="107" y="82" width="25" height="15" rx="3" fill="#11111b" opacity="0.95"/>
      <line x1="93" y1="89" x2="107" y2="89" stroke="#fab387" stroke-width="2.5"/>
    </g>
  `,

  sunglasses: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))">
      <polygon points="66,80 94,80 90,98 70,98" fill="#0f172a"/>
      <polygon points="106,80 134,80 130,98 110,98" fill="#0f172a"/>
      <line x1="94" y1="84" x2="106" y2="84" stroke="#0f172a" stroke-width="3"/>
    </g>
  `,

  blush_pink: `
    <g>
      <ellipse cx="64" cy="98" rx="8" ry="5" fill="#f43f5e" opacity="0.6"/>
      <ellipse cx="136" cy="98" rx="8" ry="5" fill="#f43f5e" opacity="0.6"/>
    </g>
  `,

  sleep_mask: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <rect x="64" y="80" width="72" height="20" rx="8" fill="#c084fc" stroke="#9333ea" stroke-width="2"/>
      <path d="M 74 92 Q 80 86 86 92" stroke="#4c1d95" stroke-width="2" fill="none"/>
      <path d="M 114 92 Q 120 86 126 92" stroke="#4c1d95" stroke-width="2" fill="none"/>
    </g>
  `,

  monocle: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <circle cx="78" cy="90" r="12" fill="rgba(56,189,248,0.2)" stroke="#facc15" stroke-width="2.5"/>
      <path d="M 78 102 Q 82 120 90 128" stroke="#facc15" stroke-width="1.5" fill="none"/>
    </g>
  `,

  heart_glasses: `
    <g filter="drop-shadow(0 0 6px #f43f5e)">
      <path d="M 70 82 A 6 6 0 0 1 80 82 A 6 6 0 0 1 90 82 Q 90 92 80 98 Q 70 92 70 82 Z" fill="#f43f5e" opacity="0.9"/>
      <path d="M 110 82 A 6 6 0 0 1 120 82 A 6 6 0 0 1 130 82 Q 130 92 120 98 Q 110 92 110 82 Z" fill="#f43f5e" opacity="0.9"/>
      <line x1="90" y1="86" x2="110" y2="86" stroke="#be123c" stroke-width="2"/>
    </g>
  `,

  pixel_glasses: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))">
      <rect x="66" y="84" width="28" height="12" fill="#000000"/>
      <rect x="106" y="84" width="28" height="12" fill="#000000"/>
      <rect x="94" y="86" width="12" height="4" fill="#000000"/>
      <rect x="70" y="86" width="4" height="4" fill="#ffffff"/>
      <rect x="110" y="86" width="4" height="4" fill="#ffffff"/>
    </g>
  `,

  star_glasses: `
    <g filter="drop-shadow(0 0 6px #facc15)">
      <polygon points="80,78 84,88 94,88 86,94 89,104 80,98 71,104 74,94 66,88 76,88" fill="#facc15" opacity="0.9"/>
      <polygon points="120,78 124,88 134,88 126,94 129,104 120,98 111,104 114,94 106,88 116,88" fill="#facc15" opacity="0.9"/>
      <line x1="94" y1="88" x2="106" y2="88" stroke="#ca8a04" stroke-width="2"/>
    </g>
  `,

  anime_sparkle: `
    <g filter="drop-shadow(0 0 6px #fde047)">
      <polygon points="80,82 82,88 88,90 82,92 80,98 78,92 72,90 78,88" fill="#fde047"/>
      <polygon points="120,82 122,88 128,90 122,92 120,98 118,92 112,90 118,88" fill="#fde047"/>
    </g>
  `,

  pirate_patch: `
    <g>
      <line x1="55" y1="76" x2="145" y2="106" stroke="#0f172a" stroke-width="2.5"/>
      <circle cx="80" cy="90" r="9" fill="#0f172a"/>
      <polygon points="78,88 82,88 80,93" fill="#ffffff"/>
    </g>
  `,

  steampunk_goggles: `
    <g filter="drop-shadow(0 2px 5px rgba(0,0,0,0.5))">
      <circle cx="78" cy="90" r="13" fill="#1c1917" stroke="#b45309" stroke-width="3"/>
      <circle cx="122" cy="90" r="13" fill="#1c1917" stroke="#b45309" stroke-width="3"/>
      <line x1="91" y1="90" x2="109" y2="90" stroke="#78350f" stroke-width="4"/>
    </g>
  `,

  vr_headset: `
    <g filter="drop-shadow(0 0 8px #38bdf8)">
      <rect x="64" y="80" width="72" height="22" rx="6" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>
      <rect x="74" y="88" width="52" height="5" rx="2" fill="#38bdf8"/>
    </g>
  `,

  laser_eyes: `
    <g filter="drop-shadow(0 0 8px #ef4444)">
      <circle cx="80" cy="90" r="6" fill="#ef4444"/>
      <circle cx="120" cy="90" r="6" fill="#ef4444"/>
      <line x1="80" y1="90" x2="10" y2="90" stroke="#f87171" stroke-width="3"/>
      <line x1="120" y1="90" x2="190" y2="90" stroke="#f87171" stroke-width="3"/>
    </g>
  `,

  cyber_visor: `
    <g filter="drop-shadow(0 0 10px #06b6d4)">
      <polygon points="62,82 138,82 134,98 66,98" fill="#0891b2" stroke="#22d3ee" stroke-width="2"/>
      <line x1="68" y1="90" x2="132" y2="90" stroke="#a5f3fc" stroke-width="2"/>
    </g>
  `,

  galaxy_gaze: `
    <g filter="drop-shadow(0 0 8px #c084fc)">
      <circle cx="80" cy="90" r="8" fill="#581c87"/>
      <circle cx="120" cy="90" r="8" fill="#581c87"/>
      <circle cx="82" cy="88" r="2.5" fill="#f43f5e"/>
      <circle cx="122" cy="88" r="2.5" fill="#38bdf8"/>
    </g>
  `,

  hw_vamp_eyes: `
    <g filter="drop-shadow(0 0 8px #dc2626)">
      <circle cx="80" cy="90" r="8" fill="#991b1b"/>
      <ellipse cx="80" cy="90" rx="2" ry="7" fill="#fef2f2"/>
      <circle cx="120" cy="90" r="8" fill="#991b1b"/>
      <ellipse cx="120" cy="90" rx="2" ry="7" fill="#fef2f2"/>
    </g>
  `,

  hw_spider_web: `
    <g filter="drop-shadow(0 0 4px #e2e8f0)">
      <path d="M 64 78 Q 78 88 78 102" stroke="#94a3b8" stroke-width="1.2" fill="none"/>
      <path d="M 64 90 Q 72 90 78 98" stroke="#94a3b8" stroke-width="1" fill="none"/>
      <circle cx="82" cy="104" r="2" fill="#0f172a"/>
    </g>
  `,

  hw_zombie_stitches: `
    <g>
      <line x1="70" y1="74" x2="95" y2="82" stroke="#15803d" stroke-width="2"/>
      <line x1="74" y1="73" x2="72" y2="79" stroke="#0f172a" stroke-width="1.8"/>
      <line x1="82" y1="76" x2="80" y2="82" stroke="#0f172a" stroke-width="1.8"/>
      <line x1="90" y1="79" x2="88" y2="85" stroke="#0f172a" stroke-width="1.8"/>
    </g>
  `,

  hw_pumpkin_glow: `
    <g filter="drop-shadow(0 0 10px #f97316)">
      <polygon points="74,94 80,84 86,94" fill="#fbbf24"/>
      <polygon points="114,94 120,84 126,94" fill="#fbbf24"/>
    </g>
  `,

  hw_skull_mask: `
    <g filter="drop-shadow(0 2px 6px rgba(0,0,0,0.5))">
      <path d="M 66 78 Q 100 68 134 78 Q 134 100 100 106 Q 66 100 66 78 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="82" cy="88" r="6" fill="#0f172a"/>
      <circle cx="118" cy="88" r="6" fill="#0f172a"/>
    </g>
  `,

  /* =======================================================================
   * 3. ОДЕЖДА И ТЕЛО (BODY) — 20 предметов
   * ======================================================================= */
  bow: `
    <g>
      <polygon points="90,135 100,140 90,145" fill="#f38ba8"/>
      <polygon points="110,135 100,140 110,145" fill="#f38ba8"/>
      <circle cx="100" cy="140" r="3.5" fill="#fab387"/>
    </g>
  `,

  collar_bell: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <path d="M 68 128 Q 100 136 132 128" stroke="#dc2626" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="100" cy="138" r="5" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
    </g>
  `,

  bandana_blue: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
      <polygon points="70,126 130,126 100,154" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.5"/>
      <circle cx="100" cy="138" r="2.5" fill="#ffffff"/>
    </g>
  `,

  tshirt_striped: `
    <g>
      <path d="M 50 132 C 54 108, 146 108, 150 132 C 150 170, 50 170, 50 132 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <path d="M 56 126 Q 100 132 144 126" stroke="#1e3a8a" stroke-width="4" fill="none"/>
      <path d="M 54 138 Q 100 144 146 138" stroke="#1e3a8a" stroke-width="4" fill="none"/>
      <path d="M 52 150 Q 100 156 148 150" stroke="#1e3a8a" stroke-width="4" fill="none"/>
      <path d="M 54 162 Q 100 168 146 162" stroke="#1e3a8a" stroke-width="4" fill="none"/>
    </g>
  `,

  std_scarf: `
    <g>
      <rect x="75" y="128" width="50" height="12" rx="6" fill="#38bdf8"/>
      <rect x="110" y="132" width="12" height="25" rx="4" fill="#0284c7"/>
    </g>
  `,

  sweater_wool: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.35))">
      <path d="M 48 132 C 52 108, 148 108, 152 132 C 152 172, 48 172, 48 132 Z" fill="#d97706" stroke="#92400e" stroke-width="2"/>
      <rect x="74" y="122" width="52" height="8" rx="3" fill="#b45309"/>
      <line x1="60" y1="145" x2="140" y2="145" stroke="#fef3c7" stroke-width="3" stroke-dasharray="6,4"/>
    </g>
  `,

  raincoat: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))">
      <path d="M 48 130 C 52 106, 148 106, 152 130 C 152 174, 48 174, 48 130 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <line x1="100" y1="126" x2="100" y2="174" stroke="#ca8a04" stroke-width="2"/>
    </g>
  `,

  hawaiian_shirt: `
    <g>
      <path d="M 48 132 C 52 108, 148 108, 152 132 C 152 172, 48 172, 48 132 Z" fill="#f43f5e"/>
      <circle cx="80" cy="140" r="4" fill="#fef08a"/>
      <circle cx="120" cy="150" r="4" fill="#fef08a"/>
      <circle cx="95" cy="160" r="4" fill="#fef08a"/>
    </g>
  `,

  prem_hoodie: `
    <g>
      <path d="M 50 132 C 54 108, 146 108, 150 132 C 150 172, 50 172, 50 132 Z" fill="#ec4899" stroke="#db2777" stroke-width="2"/>
      <polygon points="90,118 100,128 110,118" fill="#fbcfe8"/>
      <rect x="76" y="146" width="48" height="18" rx="6" fill="#db2777"/>
    </g>
  `,

  tuxedo: `
    <g filter="drop-shadow(0 4px 8px rgba(0,0,0,0.6))">
      <path d="M 48 132 C 52 108, 148 108, 152 132 C 152 172, 48 172, 48 132 Z" fill="#0f172a" stroke="#1e293b" stroke-width="2.5"/>
      <polygon points="100,118 78,164 122,164" fill="#ffffff"/>
      <polygon points="76,116 100,164 84,164 52,126" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <polygon points="124,116 100,164 116,164 148,126" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
      <polygon points="88,122 100,128 88,134" fill="#e11d48"/>
      <polygon points="112,122 100,128 112,134" fill="#e11d48"/>
      <circle cx="100" cy="128" r="3.2" fill="#be123c"/>
      <circle cx="100" cy="142" r="2" fill="#0f172a"/>
      <circle cx="100" cy="154" r="2" fill="#0f172a"/>
    </g>
  `,

  kimono_sakura: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))">
      <path d="M 48 132 C 52 108, 148 108, 152 132 C 152 172, 48 172, 48 132 Z" fill="#fbcfe8" stroke="#f472b6" stroke-width="2"/>
      <polygon points="76,120 100,148 124,120" fill="#f43f5e"/>
      <rect x="68" y="146" width="64" height="12" rx="2" fill="#dc2626"/>
    </g>
  `,

  leather_jacket: `
    <g filter="drop-shadow(0 4px 8px rgba(0,0,0,0.6))">
      <path d="M 48 132 C 52 108, 148 108, 152 132 C 152 172, 48 172, 48 132 Z" fill="#18181b" stroke="#27272a" stroke-width="2"/>
      <line x1="88" y1="120" x2="108" y2="172" stroke="#94a3b8" stroke-width="2.5"/>
      <polygon points="74,122 88,138 68,142" fill="#27272a"/>
      <polygon points="126,122 112,138 132,142" fill="#27272a"/>
    </g>
  `,

  wings_angel: `
    <g filter="drop-shadow(0 0 10px #ffffff)">
      <path d="M 52 135 Q 10 95 18 55 Q 38 95 50 115" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5"/>
      <path d="M 148 135 Q 190 95 182 55 Q 162 95 150 115" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5"/>
    </g>
  `,

  cyber_armor: `
    <g filter="drop-shadow(0 0 10px #06b6d4)">
      <path d="M 50 132 C 54 108, 146 108, 150 132 C 150 170, 50 170, 50 132 Z" fill="#1e293b" stroke="#0ea5e9" stroke-width="2.5"/>
      <circle cx="100" cy="142" r="10" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="100" cy="142" r="4" fill="#e0f2fe"/>
    </g>
  `,

  cyber_exosuit: `
    <g filter="drop-shadow(0 0 12px #f43f5e)">
      <path d="M 48 132 C 52 108, 148 108, 152 132 C 152 172, 48 172, 48 132 Z" fill="#09090b" stroke="#f43f5e" stroke-width="3"/>
      <line x1="70" y1="130" x2="100" y2="150" stroke="#f43f5e" stroke-width="2"/>
      <line x1="130" y1="130" x2="100" y2="150" stroke="#f43f5e" stroke-width="2"/>
    </g>
  `,

  hw_witch_robe: `
    <g filter="drop-shadow(0 0 8px #9333ea)">
      <path d="M 48 132 C 52 108, 148 108, 152 132 C 152 174, 48 174, 48 132 Z" fill="#1e1b4b" stroke="#7e22ce" stroke-width="2"/>
      <circle cx="100" cy="132" r="6" fill="#a855f7"/>
    </g>
  `,

  hw_ghost_sheet: `
    <g filter="drop-shadow(0 0 12px #38bdf8)">
      <path d="M 48 122 Q 100 96 152 122 Q 156 172 144 176 Q 130 166 116 176 Q 100 166 84 176 Q 70 166 56 176 Q 44 172 48 122 Z" fill="#e0f2fe" opacity="0.9" stroke="#bae6fd" stroke-width="2"/>
      <circle cx="86" cy="138" r="4.5" fill="#0369a1"/>
      <circle cx="114" cy="138" r="4.5" fill="#0369a1"/>
    </g>
  `,

  hw_vampire_cape: `
    <g filter="drop-shadow(0 0 10px #991b1b)">
      <polygon points="56,114 34,68 68,102" fill="#7f1d1d" stroke="#991b1b" stroke-width="2"/>
      <polygon points="144,114 166,68 132,102" fill="#7f1d1d" stroke="#991b1b" stroke-width="2"/>
      <path d="M 50 126 C 54 106, 146 106, 150 126 C 150 172, 50 172, 50 126 Z" fill="#090514" stroke="#7f1d1d" stroke-width="2"/>
      <circle cx="100" cy="118" r="4.5" fill="#dc2626"/>
    </g>
  `,

  hw_skeleton_suit: `
    <g filter="drop-shadow(0 0 6px #e2e8f0)">
      <path d="M 50 132 C 54 108, 146 108, 150 132 C 150 170, 50 170, 50 132 Z" fill="#09090b"/>
      <line x1="100" y1="120" x2="100" y2="160" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <path d="M 80 130 Q 100 140 120 130" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M 82 142 Q 100 152 118 142" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M 86 154 Q 100 162 114 154" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </g>
  `,

  hw_mummy_wraps: `
    <g>
      <path d="M 52 130 Q 100 138 148 126" stroke="#fef3c7" stroke-width="5" fill="none"/>
      <path d="M 50 142 Q 100 134 150 146" stroke="#fef3c7" stroke-width="5" fill="none"/>
      <path d="M 52 154 Q 100 162 148 150" stroke="#fef3c7" stroke-width="5" fill="none"/>
    </g>
  `,

  /* =======================================================================
   * 4. НИЗ И ЛАПКИ (LEGS) — 20 предметов
   * ======================================================================= */
  socks_white: `
    <g>
      <ellipse cx="60" cy="174" rx="14" ry="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <ellipse cx="140" cy="174" rx="14" ry="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    </g>
  `,

  shorts_denim: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <path d="M 58 160 C 65 155, 135 155, 142 160 L 144 172 L 126 172 L 100 165 L 74 172 L 56 172 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="2"/>
    </g>
  `,

  skirt_pink: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <path d="M 56 158 Q 100 152 144 158 Q 152 176 142 176 Q 100 172 58 176 Q 48 176 56 158 Z" fill="#f472b6" stroke="#db2777" stroke-width="2"/>
    </g>
  `,

  slippers_fish: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <ellipse cx="60" cy="174" rx="16" ry="8" fill="#38bdf8"/>
      <polygon points="44,174 38,168 38,180" fill="#0284c7"/>
      <ellipse cx="140" cy="174" rx="16" ry="8" fill="#38bdf8"/>
      <polygon points="156,174 162,168 162,180" fill="#0284c7"/>
    </g>
  `,

  pants_jeans: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <path d="M 54 156 Q 100 152 146 156 L 148 174 L 128 174 L 100 164 L 72 174 L 52 174 Z" fill="#1d4ed8" stroke="#1e40af" stroke-width="2"/>
    </g>
  `,

  sneakers_red: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
      <ellipse cx="60" cy="174" rx="16" ry="8" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
      <ellipse cx="140" cy="174" rx="16" ry="8" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
      <rect x="46" y="176" width="28" height="4" rx="2" fill="#ffffff"/>
      <rect x="126" y="176" width="28" height="4" rx="2" fill="#ffffff"/>
    </g>
  `,

  boots_rain: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <path d="M 48 162 L 72 162 L 72 178 L 48 178 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <path d="M 128 162 L 152 162 L 152 178 L 128 178 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
    </g>
  `,

  skirt_plaid: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <path d="M 56 158 Q 100 152 144 158 L 148 174 L 52 174 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
      <line x1="75" y1="158" x2="75" y2="174" stroke="#15803d" stroke-width="2"/>
      <line x1="125" y1="158" x2="125" y2="174" stroke="#15803d" stroke-width="2"/>
    </g>
  `,

  roller_skates: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))">
      <rect x="46" y="168" width="28" height="10" rx="3" fill="#f43f5e"/>
      <circle cx="52" cy="182" r="3.5" fill="#38bdf8"/>
      <circle cx="68" cy="182" r="3.5" fill="#38bdf8"/>
      <rect x="126" y="168" width="28" height="10" rx="3" fill="#f43f5e"/>
      <circle cx="132" cy="182" r="3.5" fill="#38bdf8"/>
      <circle cx="148" cy="182" r="3.5" fill="#38bdf8"/>
    </g>
  `,

  pants_cargo: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
      <path d="M 52 156 Q 100 152 148 156 L 148 174 L 128 174 L 100 164 L 72 174 L 52 174 Z" fill="#4d7c0f" stroke="#365314" stroke-width="2"/>
    </g>
  `,

  boots_cowboy: `
    <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.4))">
      <path d="M 48 160 L 72 160 L 70 178 L 46 178 Z" fill="#78350f" stroke="#451a03" stroke-width="2"/>
      <path d="M 128 160 L 152 160 L 154 178 L 130 178 Z" fill="#78350f" stroke="#451a03" stroke-width="2"/>
    </g>
  `,

  hover_boots: `
    <g filter="drop-shadow(0 0 8px #38bdf8)">
      <ellipse cx="60" cy="172" rx="16" ry="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <ellipse cx="140" cy="172" rx="16" ry="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <ellipse cx="60" cy="182" rx="12" ry="3" fill="#38bdf8" opacity="0.8"/>
      <ellipse cx="140" cy="182" rx="12" ry="3" fill="#38bdf8" opacity="0.8"/>
    </g>
  `,

  golden_paws: `
    <g filter="drop-shadow(0 0 10px #facc15)">
      <ellipse cx="60" cy="174" rx="15" ry="9" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <ellipse cx="140" cy="174" rx="15" ry="9" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
    </g>
  `,

  cyber_runners: `
    <g filter="drop-shadow(0 0 8px #f43f5e)">
      <ellipse cx="60" cy="174" rx="16" ry="8" fill="#09090b" stroke="#f43f5e" stroke-width="2"/>
      <ellipse cx="140" cy="174" rx="16" ry="8" fill="#09090b" stroke="#f43f5e" stroke-width="2"/>
      <line x1="48" y1="174" x2="72" y2="174" stroke="#38bdf8" stroke-width="2"/>
      <line x1="128" y1="174" x2="152" y2="174" stroke="#38bdf8" stroke-width="2"/>
    </g>
  `,

  hw_witch_skirt: `
    <g filter="drop-shadow(0 0 6px #7c3aed)">
      <path d="M 54 158 Q 100 152 146 158 L 152 174 L 138 168 L 126 176 L 114 168 L 100 176 L 86 168 L 74 176 L 62 168 L 48 174 Z" fill="#1e1b4b" stroke="#6d28d9" stroke-width="2"/>
    </g>
  `,

  hw_pumpkin_shoes: `
    <g filter="drop-shadow(0 0 6px #ea580c)">
      <ellipse cx="60" cy="174" rx="15" ry="9" fill="#ea580c" stroke="#c2410c" stroke-width="2"/>
      <ellipse cx="140" cy="174" rx="15" ry="9" fill="#ea580c" stroke="#c2410c" stroke-width="2"/>
      <circle cx="60" cy="168" r="2.5" fill="#15803d"/>
      <circle cx="140" cy="168" r="2.5" fill="#15803d"/>
    </g>
  `,

  hw_bone_trousers: `
    <g filter="drop-shadow(0 0 4px #e2e8f0)">
      <path d="M 52 156 Q 100 152 148 156 L 148 174 L 128 174 L 100 164 L 72 174 L 52 174 Z" fill="#09090b"/>
      <line x1="64" y1="162" x2="64" y2="172" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <line x1="136" y1="162" x2="136" y2="172" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </g>
  `,

  hw_striped_tights: `
    <g>
      <ellipse cx="60" cy="174" rx="14" ry="8" fill="#f97316"/>
      <ellipse cx="140" cy="174" rx="14" ry="8" fill="#f97316"/>
      <line x1="50" y1="172" x2="70" y2="172" stroke="#0f172a" stroke-width="2.5"/>
      <line x1="130" y1="172" x2="150" y2="172" stroke="#0f172a" stroke-width="2.5"/>
      <line x1="50" y1="176" x2="70" y2="176" stroke="#0f172a" stroke-width="2.5"/>
      <line x1="130" y1="176" x2="150" y2="176" stroke="#0f172a" stroke-width="2.5"/>
    </g>
  `,

  hw_demon_hooves: `
    <g filter="drop-shadow(0 0 8px #dc2626)">
      <polygon points="46,170 74,170 68,180 52,180" fill="#18181b" stroke="#dc2626" stroke-width="2"/>
      <polygon points="126,170 154,170 148,180 132,180" fill="#18181b" stroke="#dc2626" stroke-width="2"/>
    </g>
  `,

  hw_ghost_chains: `
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))">
      <ellipse cx="60" cy="174" rx="16" ry="5" fill="none" stroke="#71717a" stroke-width="3"/>
      <ellipse cx="140" cy="174" rx="16" ry="5" fill="none" stroke="#71717a" stroke-width="3"/>
      <line x1="76" y1="174" x2="124" y2="174" stroke="#71717a" stroke-width="2.5" stroke-dasharray="4,3"/>
    </g>
  `
};

/* =========================================================================
 * КАРТА ВЕКТОРНЫХ ЛОКАЦИЙ (ВСЕ 21 СЦЕНА С ПОЛОМ, ОКНАМИ И ИНТЕРЬЕРОМ)
 * ========================================================================= */
window.ROOM_SCENERY_TEMPLATES = {

  // 1. Неоновая комната (Киберпанк сетка и неоновое сердечко)
  neon: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <defs>
        <linearGradient id="neonWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0b0817"/><stop offset="100%" stop-color="#1f1035"/></linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#neonWall)"/>
      <!-- Неоновая вывеска-сердечко на стене -->
      <path d="M 200 45 A 14 14 0 0 0 172 45 Q 172 65 200 85 Q 228 65 228 45 A 14 14 0 0 0 200 45 Z" fill="none" stroke="#ec4899" stroke-width="3" filter="drop-shadow(0 0 8px #f43f5e)"/>
      <!-- Неоновые лампы по бокам -->
      <line x1="30" y1="30" x2="30" y2="190" stroke="#06b6d4" stroke-width="4" filter="drop-shadow(0 0 8px #22d3ee)"/>
      <line x1="370" y1="30" x2="370" y2="190" stroke="#a855f7" stroke-width="4" filter="drop-shadow(0 0 8px #c084fc)"/>
      <!-- Перспективный неоновый пол -->
      <rect y="220" width="400" height="100" fill="#080511"/>
      <line x1="0" y1="220" x2="400" y2="220" stroke="#06b6d4" stroke-width="2" filter="drop-shadow(0 0 4px #06b6d4)"/>
      <line x1="200" y1="220" x2="40" y2="320" stroke="#a855f7" stroke-width="1.5" opacity="0.6"/>
      <line x1="200" y1="220" x2="140" y2="320" stroke="#a855f7" stroke-width="1.5" opacity="0.6"/>
      <line x1="200" y1="220" x2="260" y2="320" stroke="#a855f7" stroke-width="1.5" opacity="0.6"/>
      <line x1="200" y1="220" x2="360" y2="320" stroke="#a855f7" stroke-width="1.5" opacity="0.6"/>
    </svg>
  `,

  // 2. Солнечный балкон (Перила, теплое солнце и горшки с цветами)
  sunny_balcony: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
      </defs>
      <rect width="400" height="210" fill="url(#skyGrad)"/>
      <!-- Солнце -->
      <circle cx="70" cy="50" r="32" fill="#fef08a" filter="drop-shadow(0 0 16px #fde047)"/>
      <ellipse cx="260" cy="65" rx="45" ry="14" fill="#ffffff" opacity="0.8"/>
      <!-- Деревянный пол балкона -->
      <rect y="210" width="400" height="110" fill="#92400e"/>
      <line x1="0" y1="240" x2="400" y2="240" stroke="#78350f" stroke-width="2"/>
      <line x1="0" y1="275" x2="400" y2="275" stroke="#78350f" stroke-width="2"/>
      <!-- Перила балкона -->
      <line x1="0" y1="180" x2="400" y2="180" stroke="#ffffff" stroke-width="6"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#ffffff" stroke-width="4"/>
      <line x1="40" y1="180" x2="40" y2="210" stroke="#ffffff" stroke-width="3"/>
      <line x1="120" y1="180" x2="120" y2="210" stroke="#ffffff" stroke-width="3"/>
      <line x1="280" y1="180" x2="280" y2="210" stroke="#ffffff" stroke-width="3"/>
      <line x1="360" y1="180" x2="360" y2="210" stroke="#ffffff" stroke-width="3"/>
      <!-- Цветок в кашпо -->
      <polygon points="340,210 370,210 365,245 345,245" fill="#ea580c"/>
      <circle cx="355" cy="195" r="14" fill="#15803d"/>
      <circle cx="345" cy="188" r="8" fill="#22c55e"/>
      <circle cx="365" cy="188" r="8" fill="#22c55e"/>
    </svg>
  `,

  // 3. Коробочный замок (Картонные зубчатые стены со скотчем)
  cardboard_box: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#b45309"/>
      <!-- Зубья замка из картона -->
      <polygon points="20,70 50,70 50,100 70,100 70,70 100,70 100,100 120,100 120,70 150,70 150,110 20,110" fill="#92400e" stroke="#78350f" stroke-width="2"/>
      <polygon points="250,70 280,70 280,100 300,100 300,70 330,70 330,100 350,100 350,70 380,70 380,110 250,110" fill="#92400e" stroke="#78350f" stroke-width="2"/>
      <!-- Пол коробки -->
      <rect y="210" width="400" height="110" fill="#78350f"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#451a03" stroke-width="4"/>
      <!-- Полоски скотча -->
      <rect x="28" y="130" width="60" height="18" fill="#fef08a" opacity="0.65" transform="rotate(-15 28 130)"/>
      <rect x="310" y="140" width="60" height="18" fill="#fef08a" opacity="0.65" transform="rotate(18 310 140)"/>
      <!-- Надпись маркером -->
      <text x="35" y="195" font-family="'Comfortaa', cursive" font-size="13" font-weight="bold" fill="#451a03">📦 CAT CASTLE</text>
    </svg>
  `,

  // 4. Шале с камином (Бревенчатая стена, горящий кирпичный камин, ковер)
  cozy: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#381a06"/>
      <!-- Бревенчатые линии стены -->
      <line x1="0" y1="40" x2="400" y2="40" stroke="#231003" stroke-width="3"/>
      <line x1="0" y1="85" x2="400" y2="85" stroke="#231003" stroke-width="3"/>
      <line x1="0" y1="130" x2="400" y2="130" stroke="#231003" stroke-width="3"/>
      <line x1="0" y1="175" x2="400" y2="175" stroke="#231003" stroke-width="3"/>
      <!-- Камин слева -->
      <rect x="15" y="90" width="80" height="120" fill="#78350f" stroke="#451a03" stroke-width="2"/>
      <rect x="10" y="80" width="90" height="12" fill="#92400e"/>
      <path d="M 28 210 L 28 140 Q 55 120 82 140 L 82 210 Z" fill="#1c0a00"/>
      <!-- Огонь в камине -->
      <polygon points="45,200 55,160 65,200" fill="#ea580c" filter="drop-shadow(0 0 10px #f97316)"/>
      <polygon points="50,200 55,172 60,200" fill="#facc15"/>
      <!-- Паркет и коврик -->
      <rect y="210" width="400" height="110" fill="#451a03"/>
      <ellipse cx="200" cy="265" rx="120" ry="34" fill="#991b1b" stroke="#7f1d1d" stroke-width="3"/>
      <ellipse cx="200" cy="265" rx="100" ry="26" fill="#b91c1c"/>
    </svg>
  `,

  // 5. Кафе под дождем (Арочное окно, капли, фонари в дымке, чашка кофе)
  rainy_cafe: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <defs>
        <radialGradient id="blurLight" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fde047" stop-opacity="0.8"/><stop offset="100%" stop-color="#020617" stop-opacity="0"/></radialGradient>
      </defs>
      <!-- Улица за окном -->
      <rect width="400" height="210" fill="#090d16"/>
      <circle cx="80" cy="90" r="45" fill="url(#blurLight)"/>
      <circle cx="320" cy="70" r="50" fill="url(#blurLight)"/>
      <!-- Капли дождя по стеклу -->
      <line x1="50" y1="40" x2="45" y2="80" stroke="#38bdf8" stroke-width="1.2" opacity="0.5"/>
      <line x1="120" y1="20" x2="115" y2="70" stroke="#38bdf8" stroke-width="1.2" opacity="0.5"/>
      <line x1="280" y1="50" x2="275" y2="110" stroke="#38bdf8" stroke-width="1.2" opacity="0.5"/>
      <line x1="350" y1="30" x2="345" y2="90" stroke="#38bdf8" stroke-width="1.2" opacity="0.5"/>
      <!-- Рама арочного окна -->
      <path d="M 20 210 L 20 60 Q 200 -10 380 60 L 380 210 Z" fill="none" stroke="#1e293b" stroke-width="10"/>
      <line x1="200" y1="20" x2="200" y2="210" stroke="#1e293b" stroke-width="6"/>
      <!-- Кафельная плитка пола -->
      <rect y="210" width="400" height="110" fill="#0f172a"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#334155" stroke-width="3"/>
      <!-- Столик с дымящимся кофе справа -->
      <rect x="320" y="180" width="70" height="12" rx="3" fill="#475569"/>
      <path d="M 345 180 L 348 165 L 362 165 L 365 180 Z" fill="#ffffff"/>
      <path d="M 352 162 Q 355 152 350 144" stroke="#e2e8f0" stroke-width="1.5" fill="none" opacity="0.7"/>
    </svg>
  `,

  // 6. Палатка в лесу (Ночной лес, сосны, луна, костёр)
  forest_camp: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#03151e"/>
      <circle cx="330" cy="40" r="16" fill="#fef08a" filter="drop-shadow(0 0 10px #fef08a)"/>
      <!-- Силуэты сосен -->
      <polygon points="30,170 10,210 50,210" fill="#064e3b"/>
      <polygon points="30,135 15,175 45,175" fill="#043a2c"/>
      <polygon points="30,105 20,140 40,140" fill="#022c22"/>
      <polygon points="370,170 350,210 390,210" fill="#064e3b"/>
      <polygon points="370,135 355,175 385,175" fill="#043a2c"/>
      <!-- Земля в лагере -->
      <rect y="210" width="400" height="110" fill="#022c22"/>
      <!-- Палатка слева -->
      <polygon points="50,210 95,145 140,210" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
      <polygon points="75,210 95,160 115,210" fill="#082f49"/>
      <!-- Костёр справа -->
      <circle cx="310" cy="235" r="7" fill="#78350f"/>
      <polygon points="302,235 310,205 318,235" fill="#ea580c" filter="drop-shadow(0 0 12px #f97316)"/>
      <polygon points="306,235 310,215 314,235" fill="#facc15"/>
    </svg>
  `,

  // 7. Панорама города (Окно пентхауса, ночные небоскрёбы с огоньками)
  city: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#020617"/>
      <!-- Небоскрёбы на горизонте -->
      <rect x="25" y="70" width="55" height="140" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="95" y="45" width="65" height="165" fill="#111c33" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="240" y="55" width="60" height="155" fill="#111c33" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="315" y="80" width="55" height="130" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
      <!-- Антенна с красным маячком -->
      <line x1="127" y1="45" x2="127" y2="15" stroke="#64748b" stroke-width="2"/>
      <circle cx="127" cy="15" r="3" fill="#ef4444" filter="drop-shadow(0 0 6px #ef4444)"/>
      <!-- Светящиеся окна в домах -->
      <circle cx="45" cy="95" r="2" fill="#fef08a"/><circle cx="60" cy="95" r="2" fill="#fef08a"/>
      <circle cx="45" cy="115" r="2" fill="#38bdf8"/><circle cx="60" cy="140" r="2" fill="#fef08a"/>
      <circle cx="115" cy="75" r="2" fill="#fef08a"/><circle cx="140" cy="100" r="2" fill="#fef08a"/>
      <circle cx="260" cy="85" r="2" fill="#38bdf8"/><circle cx="280" cy="120" r="2" fill="#fef08a"/>
      <!-- Пол пентхауса (глянцевый тёмный мрамор) -->
      <rect y="210" width="400" height="110" fill="#090d16"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#334155" stroke-width="3"/>
    </svg>
  `,

  // 8. Сад цветущей сакуры (Веранда энгава, гора Фудзи, тории и падающие лепестки)
  japan: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <defs>
        <linearGradient id="sakuraSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#fdf2f8"/></linearGradient>
      </defs>
      <rect width="400" height="210" fill="url(#sakuraSky)"/>
      <!-- Силуэт горы Фудзи -->
      <polygon points="120,180 200,80 280,180" fill="#701a75" opacity="0.35"/>
      <polygon points="175,112 200,80 225,112" fill="#ffffff" opacity="0.7"/>
      <!-- Ворота Тории вдалеке -->
      <rect x="60" y="145" width="5" height="35" fill="#dc2626"/>
      <rect x="85" y="145" width="5" height="35" fill="#dc2626"/>
      <rect x="52" y="145" width="46" height="5" fill="#dc2626"/>
      <!-- Ветка сакуры сверху -->
      <path d="M 0 0 Q 60 25 110 15" stroke="#451a03" stroke-width="4" fill="none"/>
      <circle cx="50" cy="22" r="6" fill="#fbcfe8"/><circle cx="80" cy="26" r="7" fill="#f472b6"/>
      <circle cx="110" cy="16" r="6" fill="#fbcfe8"/>
      <!-- Падающие лепестки -->
      <ellipse cx="140" cy="65" rx="4" ry="2" fill="#f472b6" transform="rotate(25 140 65)"/>
      <ellipse cx="280" cy="95" rx="4" ry="2" fill="#f472b6" transform="rotate(-35 280 95)"/>
      <!-- Деревянный настил веранды (энгава) -->
      <rect y="210" width="400" height="110" fill="#78350f"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#451a03" stroke-width="4"/>
      <line x1="0" y1="245" x2="400" y2="245" stroke="#451a03" stroke-width="2"/>
    </svg>
  `,

  // 9. Тайная библиотека (Высокие шкафы с книгами, витраж)
  library_ancient: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#1c0f07"/>
      <!-- Книжные шкафы по бокам -->
      <rect x="0" y="0" width="75" height="210" fill="#2d1305" stroke="#451a03" stroke-width="2"/>
      <line x1="0" y1="50" x2="75" y2="50" stroke="#451a03" stroke-width="3"/>
      <line x1="0" y1="100" x2="75" y2="100" stroke="#451a03" stroke-width="3"/>
      <line x1="0" y1="150" x2="75" y2="150" stroke="#451a03" stroke-width="3"/>
      <!-- Книги слева -->
      <rect x="8" y="20" width="10" height="28" fill="#991b1b"/><rect x="22" y="16" width="12" height="32" fill="#1e3a8a"/><rect x="38" y="22" width="14" height="26" fill="#065f46"/>
      <rect x="8" y="70" width="14" height="28" fill="#d97706"/><rect x="26" y="66" width="11" height="32" fill="#701a75"/>
      <!-- Шкафы справа -->
      <rect x="325" y="0" width="75" height="210" fill="#2d1305" stroke="#451a03" stroke-width="2"/>
      <line x1="325" y1="50" x2="400" y2="50" stroke="#451a03" stroke-width="3"/>
      <line x1="325" y1="100" x2="400" y2="100" stroke="#451a03" stroke-width="3"/>
      <line x1="325" y1="150" x2="400" y2="150" stroke="#451a03" stroke-width="3"/>
      <rect x="335" y="20" width="12" height="28" fill="#1e3a8a"/><rect x="350" y="16" width="10" height="32" fill="#991b1b"/>
      <!-- Готический витраж в центре -->
      <path d="M 160 160 L 160 60 Q 200 10 240 60 L 240 160 Z" fill="#3b1d11" stroke="#ca8a04" stroke-width="3"/>
      <circle cx="200" cy="70" r="15" fill="#f59e0b" opacity="0.6"/>
      <!-- Пол с ковром -->
      <rect y="210" width="400" height="110" fill="#2d1305"/>
      <rect x="80" y="235" width="240" height="70" rx="10" fill="#831843" stroke="#9f1239" stroke-width="2"/>
    </svg>
  `,

  // 10. Батискаф на дне (Круглый иллюминатор, риф, кораллы, рыбы, пузыри)
  underwater_dome: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <defs>
        <radialGradient id="oceanDeep" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#03192e"/></radialGradient>
      </defs>
      <rect width="400" height="210" fill="url(#oceanDeep)"/>
      <!-- Силуэты рыб -->
      <path d="M 90 60 Q 105 52 120 60 Q 105 68 90 60 Z" fill="#38bdf8" opacity="0.65"/>
      <polygon points="120,60 128,54 128,66" fill="#38bdf8" opacity="0.65"/>
      <path d="M 280 80 Q 295 72 310 80 Q 295 88 280 80 Z" fill="#38bdf8" opacity="0.5"/>
      <!-- Пузырьки -->
      <circle cx="150" cy="110" r="4" fill="#e0f2fe" opacity="0.6"/><circle cx="153" cy="90" r="3" fill="#e0f2fe" opacity="0.6"/>
      <!-- Стальной иллюминатор батискафа с заклепками -->
      <circle cx="200" cy="110" r="140" fill="none" stroke="#1e293b" stroke-width="24"/>
      <circle cx="200" cy="110" r="128" fill="none" stroke="#0284c7" stroke-width="3" opacity="0.4"/>
      <!-- Рифленый стальной пол -->
      <rect y="210" width="400" height="110" fill="#0f172a"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#38bdf8" stroke-width="3"/>
    </svg>
  `,

  // 11. Орбитальная станция (Шлюз, вид на планету Земля, звезды)
  space: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#02010a"/>
      <!-- Звезды -->
      <circle cx="60" cy="40" r="1.5" fill="#ffffff"/><circle cx="140" cy="20" r="1" fill="#ffffff"/><circle cx="280" cy="35" r="1.5" fill="#ffffff"/><circle cx="350" cy="70" r="1" fill="#ffffff"/>
      <!-- Край планеты Земля -->
      <circle cx="200" cy="380" r="230" fill="#0284c7" stroke="#38bdf8" stroke-width="5" filter="drop-shadow(0 0 20px #38bdf8)"/>
      <ellipse cx="170" cy="190" rx="90" ry="25" fill="#22c55e" opacity="0.7"/>
      <!-- Металлическая рама шлюза -->
      <rect x="0" y="0" width="400" height="25" fill="#1e1e2e"/>
      <line x1="0" y1="25" x2="400" y2="25" stroke="#475569" stroke-width="2"/>
      <!-- Высокотехнологичный пол станции -->
      <rect y="210" width="400" height="110" fill="#11111b"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#a855f7" stroke-width="2" filter="drop-shadow(0 0 6px #a855f7)"/>
    </svg>
  `,

  // 12. Набережная Таганрога (Морской закат, волны, каменные перила)
  taganrog_sea: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <defs>
        <linearGradient id="tgnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ea580c"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fef08a"/></linearGradient>
        <linearGradient id="tgnSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9a3412"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient>
      </defs>
      <rect width="400" height="130" fill="url(#tgnSky)"/>
      <!-- Заходящее солнце -->
      <circle cx="200" cy="115" r="28" fill="#fffbeb" filter="drop-shadow(0 0 16px #fde047)"/>
      <!-- Море -->
      <rect y="130" width="400" height="80" fill="url(#tgnSea)"/>
      <ellipse cx="200" cy="145" rx="50" ry="2" fill="#fde047" opacity="0.6"/>
      <ellipse cx="200" cy="160" rx="35" ry="2" fill="#fde047" opacity="0.6"/>
      <!-- Перила набережной -->
      <line x1="0" y1="185" x2="400" y2="185" stroke="#f1f5f9" stroke-width="6"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#f1f5f9" stroke-width="4"/>
      <line x1="60" y1="185" x2="60" y2="210" stroke="#cbd5e1" stroke-width="6"/>
      <line x1="160" y1="185" x2="160" y2="210" stroke="#cbd5e1" stroke-width="6"/>
      <line x1="260" y1="185" x2="260" y2="210" stroke="#cbd5e1" stroke-width="6"/>
      <line x1="360" y1="185" x2="360" y2="210" stroke="#cbd5e1" stroke-width="6"/>
      <!-- Плитка набережной -->
      <rect y="210" width="400" height="110" fill="#334155"/>
    </svg>
  `,

  // 13. Хрустальная пещера (Своды, сталактиты, светящиеся кристаллы)
  crystal_cave: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#13091f"/>
      <!-- Сталактиты на потолке -->
      <polygon points="30,0 45,60 60,0" fill="#2e1065"/>
      <polygon points="120,0 130,45 140,0" fill="#3b0764"/>
      <polygon points="260,0 275,55 290,0" fill="#2e1065"/>
      <polygon points="340,0 355,70 370,0" fill="#3b0764"/>
      <!-- Большие кристаллы слева -->
      <polygon points="20,210 35,140 50,210" fill="#a855f7" filter="drop-shadow(0 0 8px #c084fc)"/>
      <polygon points="45,210 58,160 70,210" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)"/>
      <!-- Кристаллы справа -->
      <polygon points="330,210 345,150 360,210" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)"/>
      <polygon points="355,210 370,135 385,210" fill="#c084fc" filter="drop-shadow(0 0 8px #c084fc)"/>
      <!-- Каменный пол пещеры -->
      <rect y="210" width="400" height="110" fill="#1e1035"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#a855f7" stroke-width="2"/>
    </svg>
  `,

  // 14. Кибер-Пентхаус 2077 (Голограммы, летающие спидеры, неон)
  cyber_penthouse: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#0a0518"/>
      <!-- Летающий транспорт в небе -->
      <polygon points="70,65 95,60 110,65 85,70" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)"/>
      <line x1="60" y1="66" x2="20" y2="66" stroke="#38bdf8" stroke-width="2" opacity="0.6"/>
      <!-- Голографический иероглиф/символ -->
      <rect x="290" y="40" width="60" height="60" rx="8" fill="none" stroke="#f43f5e" stroke-width="2" filter="drop-shadow(0 0 8px #f43f5e)"/>
      <text x="303" y="78" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="bold" fill="#f43f5e">ネオ</text>
      <!-- Рама панорамного окна -->
      <line x1="200" y1="0" x2="200" y2="210" stroke="#1e1b4b" stroke-width="6"/>
      <!-- Карбоновый пол со светодиодной полосой -->
      <rect y="210" width="400" height="110" fill="#030712"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#f43f5e" stroke-width="2.5" filter="drop-shadow(0 0 6px #f43f5e)"/>
      <line x1="0" y1="260" x2="400" y2="260" stroke="#06b6d4" stroke-width="1.5" opacity="0.6"/>
    </svg>
  `,

  // 15. Ядро Белой Дыры (Гравитационная сингулярность, искажение пространства)
  singularity_core: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="320" fill="#000000"/>
      <!-- Аккреционный диск -->
      <ellipse cx="200" cy="140" rx="160" ry="40" fill="none" stroke="#f43f5e" stroke-width="12" filter="drop-shadow(0 0 25px #ec4899)" transform="rotate(-12 200 140)"/>
      <ellipse cx="200" cy="140" rx="130" ry="26" fill="none" stroke="#fde047" stroke-width="8" filter="drop-shadow(0 0 15px #fde047)" transform="rotate(-12 200 140)"/>
      <!-- Сингулярность -->
      <circle cx="200" cy="140" r="32" fill="#ffffff" filter="drop-shadow(0 0 35px #ffffff)"/>
    </svg>
  `,

  // 16. Древний Склеп (Хеллоуин: свечи, паутина, каменные стены)
  hw_room_crypt: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#0e0717"/>
      <!-- Каменные блоки склепа -->
      <line x1="0" y1="60" x2="400" y2="60" stroke="#1f1033" stroke-width="3"/>
      <line x1="0" y1="120" x2="400" y2="120" stroke="#1f1033" stroke-width="3"/>
      <line x1="0" y1="180" x2="400" y2="180" stroke="#1f1033" stroke-width="3"/>
      <!-- Паутина в углу -->
      <path d="M 0 0 Q 60 10 70 70" stroke="#6b21a8" stroke-width="1.5" fill="none"/>
      <path d="M 0 35 Q 35 35 35 70" stroke="#6b21a8" stroke-width="1.5" fill="none"/>
      <!-- Свечи на подставке слева -->
      <rect x="30" y="160" width="10" height="50" fill="#fef08a"/>
      <polygon points="32,160 35,145 38,160" fill="#f97316" filter="drop-shadow(0 0 8px #f97316)"/>
      <!-- Свечи на подставке справа -->
      <rect x="360" y="150" width="12" height="60" fill="#fef08a"/>
      <polygon points="362,150 366,132 370,150" fill="#f97316" filter="drop-shadow(0 0 8px #f97316)"/>
      <!-- Пол склепа -->
      <rect y="210" width="400" height="110" fill="#090312"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#581c87" stroke-width="2.5"/>
    </svg>
  `,

  // 17. Поляна Джека (Хеллоуин: полная луна, мертвое дерево, тыквы)
  hw_room_patch: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <defs>
        <linearGradient id="patchSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2e0f00"/><stop offset="100%" stop-color="#0a0300"/></linearGradient>
      </defs>
      <rect width="400" height="210" fill="url(#patchSky)"/>
      <!-- Огромная зловещая луна -->
      <circle cx="200" cy="75" r="48" fill="#fef08a" filter="drop-shadow(0 0 20px #ea580c)"/>
      <!-- Кривое сухое дерево слева -->
      <path d="M 0 210 Q 30 140 25 80 Q 45 60 70 50 M 25 80 Q 5 60 0 45" stroke="#1c0700" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- Земля холма -->
      <path d="M 0 210 Q 200 190 400 210 L 400 320 L 0 320 Z" fill="#140600"/>
      <!-- Светящиеся тыквы по краям -->
      <ellipse cx="65" cy="225" rx="22" ry="16" fill="#ea580c" filter="drop-shadow(0 0 8px #f97316)"/>
      <polygon points="58,222 62,217 66,222" fill="#fef08a"/>
      <polygon points="72,222 76,217 80,222" fill="#fef08a"/>
      <ellipse cx="335" cy="225" rx="22" ry="16" fill="#ea580c" filter="drop-shadow(0 0 8px #f97316)"/>
      <polygon points="328,222 332,217 336,222" fill="#fef08a"/>
      <polygon points="342,222 346,217 350,222" fill="#fef08a"/>
    </svg>
  `,

  // 18. Замок Дракулы (Хеллоуин: готические окна, кровавая луна, портьеры)
  hw_room_castle: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#180202"/>
      <!-- Кровавая луна за окном -->
      <circle cx="200" cy="70" r="38" fill="#ef4444" filter="drop-shadow(0 0 20px #dc2626)"/>
      <!-- Готические стрельчатые окна -->
      <path d="M 160 210 L 160 80 Q 200 30 240 80 L 240 210 Z" fill="none" stroke="#2a0404" stroke-width="8"/>
      <line x1="200" y1="50" x2="200" y2="210" stroke="#2a0404" stroke-width="4"/>
      <!-- Тяжелые бархатные портьеры по бокам -->
      <path d="M 0 0 L 70 0 Q 50 100 20 210 L 0 210 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="2"/>
      <path d="M 400 0 L 330 0 Q 350 100 380 210 L 400 210 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="2"/>
      <!-- Каменный пол замка -->
      <rect y="210" width="400" height="110" fill="#0d0101"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#991b1b" stroke-width="2.5"/>
    </svg>
  `,

  // 19. Кладбищенский туман (Хеллоуин: надгробия, ограда, холодный туман)
  hw_room_mist: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#080d12"/>
      <circle cx="200" cy="50" r="24" fill="#e2e8f0" opacity="0.65" filter="drop-shadow(0 0 16px #94a3b8)"/>
      <!-- Кованая ограда -->
      <line x1="0" y1="180" x2="400" y2="180" stroke="#1e293b" stroke-width="3"/>
      <line x1="40" y1="160" x2="40" y2="210" stroke="#1e293b" stroke-width="3"/>
      <line x1="120" y1="160" x2="120" y2="210" stroke="#1e293b" stroke-width="3"/>
      <line x1="280" y1="160" x2="280" y2="210" stroke="#1e293b" stroke-width="3"/>
      <line x1="360" y1="160" x2="360" y2="210" stroke="#1e293b" stroke-width="3"/>
      <!-- Надгробие с крестом слева -->
      <path d="M 50 210 L 50 160 Q 65 150 80 160 L 80 210 Z" fill="#334155"/>
      <line x1="65" y1="165" x2="65" y2="185" stroke="#1e293b" stroke-width="2"/>
      <line x1="58" y1="172" x2="72" y2="172" stroke="#1e293b" stroke-width="2"/>
      <!-- Холодный пол и слой тумана -->
      <rect y="210" width="400" height="110" fill="#05080c"/>
      <ellipse cx="200" cy="210" rx="200" ry="25" fill="#475569" opacity="0.45" filter="blur(6px)"/>
    </svg>
  `,

  // 20. Хижина Ведьмы (Хеллоуин: полки с зельями, бурлящий котёл)
  hw_room_cauldron: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#081c0f"/>
      <!-- Полки с ядами и зельями справа -->
      <rect x="300" y="70" width="90" height="8" fill="#3f2305"/>
      <rect x="315" y="50" width="12" height="20" rx="3" fill="#22c55e" filter="drop-shadow(0 0 4px #22c55e)"/>
      <circle cx="340" cy="60" r="8" fill="#a855f7" filter="drop-shadow(0 0 4px #a855f7)"/>
      <rect x="360" y="46" width="14" height="24" rx="2" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)"/>
      <!-- Деревянный пол -->
      <rect y="210" width="400" height="110" fill="#140a02"/>
      <!-- Бурлящий котёл слева -->
      <ellipse cx="70" cy="190" rx="35" ry="22" fill="#1c1917" stroke="#0f172a" stroke-width="3"/>
      <ellipse cx="70" cy="180" rx="30" ry="12" fill="#15803d"/>
      <ellipse cx="70" cy="180" rx="24" ry="8" fill="#22c55e" filter="drop-shadow(0 0 10px #4ade80)"/>
      <circle cx="65" cy="165" r="4" fill="#86efac" opacity="0.8"/>
      <circle cx="78" cy="155" r="3" fill="#86efac" opacity="0.8"/>
    </svg>
  `,

  // 21. Чердак с пауками (Хеллоуин: стропила, паутина, сундук)
  hw_room_web: `
    <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" class="w-full h-full block">
      <rect width="400" height="210" fill="#1a1412"/>
      <!-- Балки чердака -->
      <polygon points="0,0 200,80 200,100 0,20" fill="#3e2723"/>
      <polygon points="400,0 200,80 200,100 400,20" fill="#2e1c18"/>
      <!-- Паутина в углу со свисающим паучком -->
      <path d="M 330 0 L 400 70 M 355 0 L 400 45 M 375 0 L 400 25" stroke="#9ca3af" stroke-width="1.2" opacity="0.6"/>
      <line x1="365" y1="20" x2="365" y2="70" stroke="#9ca3af" stroke-width="1"/>
      <circle cx="365" cy="74" r="5" fill="#000000"/>
      <!-- Старинный сундук слева -->
      <rect x="25" y="170" width="60" height="40" rx="6" fill="#451a03" stroke="#291202" stroke-width="2"/>
      <rect x="25" y="186" width="60" height="5" fill="#ca8a04"/>
      <circle cx="55" cy="192" r="3" fill="#ca8a04"/>
      <!-- Дощатый пол чердака -->
      <rect y="210" width="400" height="110" fill="#271914"/>
      <line x1="0" y1="210" x2="400" y2="210" stroke="#170c08" stroke-width="3"/>
    </svg>
  `
};