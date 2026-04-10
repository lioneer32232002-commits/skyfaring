#!/usr/bin/env node
/**
 * Generates og-default.png (1200x630) using @resvg/resvg-js (WASM, no native deps).
 * Requires Noto CJK fonts installed on the system (CI: fonts-noto-cjk).
 * Run: node scripts/generate_og.js
 */

const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "images");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="70%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Sky blue left accent bar -->
  <rect x="0" y="0" width="8" height="630" fill="#38bdf8"/>

  <!-- Airplane icon -->
  <g transform="translate(72, 72) scale(2.4)">
    <circle cx="16" cy="16" r="16" fill="#1e293b"/>
    <path d="M26 16L6 9l3 7-3 7 20-7z" fill="#38bdf8"/>
    <path d="M17 16L10 11v10l7-5z" fill="#0ea5e9"/>
  </g>

  <!-- Site name (English, large) -->
  <text x="80" y="185"
    font-family="'Noto Sans CJK TC', 'Noto Sans TC', 'Noto Sans', sans-serif"
    font-size="88" font-weight="700" fill="#f8fafc" letter-spacing="3">Skyfaring</text>

  <!-- Divider line -->
  <line x1="80" y1="215" x2="580" y2="215" stroke="#38bdf860" stroke-width="2"/>

  <!-- Chinese tagline (big, bold) -->
  <text x="80" y="310"
    font-family="'Noto Sans CJK TC', 'Noto Sans TC', 'Noto Sans', sans-serif"
    font-size="56" font-weight="700" fill="#e2e8f0">用數據觀察世界</text>

  <!-- Sub-description -->
  <text x="80" y="390"
    font-family="'Noto Sans CJK TC', 'Noto Sans TC', 'Noto Sans', sans-serif"
    font-size="28" fill="#94a3b8">運動數據 · 飛航安全 · 詠春拳 · 歷史軍事</text>

  <!-- URL -->
  <text x="80" y="560"
    font-family="'Noto Sans CJK TC', 'Noto Sans TC', 'Noto Sans', sans-serif"
    font-size="22" fill="#38bdf8">lioneer32232002-commits.github.io/skyfaring</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { loadSystemFonts: true },
});
const png = resvg.render().asPng();
const outPath = path.join(outDir, "og-default.png");
fs.writeFileSync(outPath, png);
console.log(`✓ Generated: ${outPath}`);
