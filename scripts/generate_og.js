#!/usr/bin/env node
/**
 * Generates og-default.png (1200x630) using @resvg/resvg-js (WASM, no native deps).
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
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative lines -->
  <line x1="0" y1="560" x2="1200" y2="560" stroke="#38bdf840" stroke-width="1"/>
  <line x1="0" y1="570" x2="1200" y2="570" stroke="#38bdf820" stroke-width="1"/>

  <!-- Airplane icon (simplified) -->
  <g transform="translate(80, 60) scale(2.8)">
    <circle cx="16" cy="16" r="16" fill="#1e293b"/>
    <path d="M26 16L6 9l3 7-3 7 20-7z" fill="#38bdf8"/>
    <path d="M17 16L10 11v10l7-5z" fill="#0ea5e9"/>
  </g>

  <!-- Site name -->
  <text x="80" y="200" font-family="system-ui, sans-serif" font-size="52" font-weight="700" fill="#f8fafc" letter-spacing="2">Skyfaring</text>

  <!-- Tagline -->
  <text x="80" y="270" font-family="system-ui, sans-serif" font-size="28" fill="#94a3b8">用數據觀察世界</text>

  <!-- Description -->
  <text x="80" y="340" font-family="system-ui, sans-serif" font-size="20" fill="#64748b">運動數據分析 · 飛航安全數據分析 · 詠春拳 · 歷史與軍事閱讀心得</text>

  <!-- URL -->
  <text x="80" y="560" font-family="system-ui, sans-serif" font-size="18" fill="#38bdf8">lioneer32232002-commits.github.io/skyfaring</text>

  <!-- Right side accent bar -->
  <rect x="1120" y="0" width="80" height="630" fill="#38bdf808"/>
  <rect x="1150" y="0" width="50" height="630" fill="#38bdf808"/>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
});
const png = resvg.render().asPng();
const outPath = path.join(outDir, "og-default.png");
fs.writeFileSync(outPath, png);
console.log(`✓ Generated: ${outPath}`);
