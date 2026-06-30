const fs = require('fs');
const path = require('path');

const ENTRIES_PATH = path.join(__dirname, 'data', 'entries.json');
const OUT_DIR = path.join(__dirname, 'public', 'images', 'floorplans');

const W = 600;
const H = 760;

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function compassRose(cx, cy) {
  return `
  <g transform="translate(${cx},${cy})">
    <path d="M0 -32 L5 -20 L0 -24 L-5 -20 Z" fill="#1A1A1A"/>
    <text x="0" y="-37" class="tiny" text-anchor="middle">N</text>
    <text x="34" y="3" class="tiny" text-anchor="middle">E</text>
    <text x="0" y="38" class="tiny" text-anchor="middle">S</text>
    <text x="-34" y="3" class="tiny" text-anchor="middle">W</text>
    <circle r="22" fill="none" stroke="#1A1A1A" stroke-width="1.5"/>
  </g>`;
}

function scaleBar(x, y) {
  return `
  <g transform="translate(${x},${y})">
    <line x1="0" y1="0" x2="120" y2="0" class="thin"/>
    <line x1="0" y1="-5" x2="0" y2="5" class="thin"/>
    <line x1="120" y1="-5" x2="120" y2="5" class="thin"/>
    <text x="60" y="18" class="tiny" text-anchor="middle">NOT TO SCALE</text>
  </g>`;
}

function room(x, y, w, h, label) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F5F5F3" stroke="#1A1A1A" stroke-width="3"/>
  <text x="${x + w / 2}" y="${y + h / 2}" class="roomlabel" text-anchor="middle">${esc(label)}</text>`;
}

function highlightBox(x, y, w, h, calloutLabel, calloutX, calloutY) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#C0392B" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="${calloutX}" y="${calloutY}" class="callout" text-anchor="start">${esc(calloutLabel)}</text>`;
}

const TEMPLATES = {
  traffic_flow: (e) => stackedRooms(e, ['LIVING ROOM', 'KITCHEN', 'BEDROOM', 'BATHROOM'], 2, 'FORCED ROOM SEQUENCE'),
  storage: (e) => stackedRooms(e, ['LIVING ROOM', 'KITCHEN', 'BEDROOM'], 2, 'NO CLOSET'),
  ventilation: (e) => stackedRooms(e, ['LIVING ROOM', 'KITCHEN', 'BEDROOM', 'BATHROOM'], 1, 'NO VENTILATION'),
  privacy: (e) => stackedRooms(e, ['BEDROOM', 'LIVING ROOM', 'KITCHEN', 'BATHROOM'], 0, 'NO PRIVACY BUFFER'),
  legal: (e) => stackedRooms(e, ['LIVING ROOM', 'KITCHEN', 'BEDROOM (NO WINDOW)', 'BATHROOM'], 2, 'EGRESS / CODE ISSUE'),
  acoustics: (e) => sideBySideRooms(e, ['BEDROOM A', 'BEDROOM B'], 'SHARED WALL, NO BUFFER'),
  proportion: (e) => proportionRooms(e, 'PRIMARY SUITE', 'COMMON AREA', 'IMBALANCED PROPORTIONS'),
  climate: (e) => stackedRooms(e, ['LIVING ROOM', 'BEDROOM', 'KITCHEN'], 1, 'POOR SUN ORIENTATION'),
  utility_conflict: (e) => stackedRooms(e, ['LIVING ROOM', 'KITCHEN', 'BEDROOM'], 2, 'UTILITY CONFLICT'),
  below_grade: (e) => stackedRooms(e, ['LIVING ROOM', 'KITCHEN', 'BEDROOM (BELOW GRADE)'], 2, 'BELOW GRADE'),
  accessibility: (e) => stackedRooms(e, ['ENTRY', 'LIVING ROOM', 'BEDROOM (LADDER ACCESS)'], 2, 'ACCESS PROBLEM'),
  furniture_conflict: (e) => stackedRooms(e, ['LIVING ROOM', 'BEDROOM'], 1, 'FURNITURE CONFLICT'),
  illegal_conversion: (e) => stackedRooms(e, ['LIVING ROOM', 'BEDROOM (CONVERTED)', 'KITCHEN'], 1, 'CONVERSION FLAG'),
  orientation: (e) => stackedRooms(e, ['LIVING ROOM', 'BEDROOM', 'KITCHEN'], 1, 'POOR ORIENTATION'),
  safety: (e) => stackedRooms(e, ['ENTRY / KITCHEN', 'LIVING ROOM', 'BEDROOM'], 0, 'SAFETY CONFLICT'),
  layout_logic: (e) => stackedRooms(e, ['LIVING ROOM', 'KITCHEN', 'BEDROOM'], 1, 'POOR LAYOUT LOGIC'),
  sanitation: (e) => stackedRooms(e, ['KITCHEN', 'BATHROOM', 'BEDROOM'], 1, 'SANITATION ISSUE'),
  zoning: (e) => stackedRooms(e, ['ENTRY', 'LIVING / SLEEP ZONE', 'KITCHEN'], 1, 'NO ZONING SEPARATION'),
};

function stackedRooms(entry, labels, highlightIndex, highlightTag) {
  const margin = 90;
  const top = 130;
  const totalH = 760;
  const roomH = (totalH - top - 60) / labels.length;
  const roomW = 250;
  let body = `<rect x="${margin}" y="${top - 30}" width="${roomW}" height="20" fill="#1A1A1A"/><text x="${margin + roomW / 2}" y="${top - 15}" class="tiny" fill="#FFFFFF" text-anchor="middle">FRONT DOOR</text>`;
  labels.forEach((label, i) => {
    const y = top + i * roomH;
    body += room(margin, y, roomW, roomH, label);
    if (i === highlightIndex) {
      body += highlightBox(margin, y, roomW, roomH, highlightTag, margin + roomW + 30, y + roomH / 2);
    }
  });
  return body;
}

function sideBySideRooms(entry, labels, highlightTag) {
  const top = 160;
  const roomW = 130;
  const roomH = 420;
  const margin = 90;
  let body = '';
  labels.forEach((label, i) => {
    const x = margin + i * roomW;
    body += room(x, top, roomW, roomH, label);
  });
  body += highlightBox(margin + roomW - 2, top, 4, roomH, highlightTag, margin + roomW * 2 + 20, top + roomH / 2);
  return body;
}

function proportionRooms(entry, bigLabel, smallLabel, highlightTag) {
  const margin = 90;
  const top = 130;
  const bigH = 420;
  const smallH = 150;
  const roomW = 250;
  let body = room(margin, top, roomW, bigH, bigLabel);
  body += room(margin, top + bigH + 20, roomW, smallH, smallLabel);
  body += highlightBox(margin, top, roomW, bigH, highlightTag, margin + roomW + 30, top + bigH / 2);
  return body;
}

function buildSVG(entry) {
  const template = TEMPLATES[entry.flaw_category] || TEMPLATES.layout_logic;
  const body = template(entry);
  const caption = `${(entry.city || '').toUpperCase()} / ${(entry.apartment_type || '').toUpperCase()}`;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .tiny { font-family: monospace; font-size: 11px; fill: #1A1A1A; }
    .roomlabel { font-family: monospace; font-size: 13px; fill: #1A1A1A; }
    .small { font-family: monospace; font-size: 13px; fill: #1A1A1A; }
    .callout { font-family: monospace; font-size: 11px; fill: #C0392B; }
    .thin { stroke: #1A1A1A; stroke-width: 1; }
  </style>
  <rect x="0" y="0" width="${W}" height="${H}" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="3"/>
  ${body}
  ${compassRose(W - 90, 165)}
  ${scaleBar(W - 220, H - 70)}
  <text x="40" y="${H - 40}" class="small">${esc(caption)}</text>
</svg>`;
}

function main() {
  const entries = JSON.parse(fs.readFileSync(ENTRIES_PATH, 'utf8'));
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let created = 0;
  let skipped = 0;

  entries.forEach((entry) => {
    if (!entry.slug) return;
    const filePath = path.join(OUT_DIR, `${entry.slug}.svg`);
    if (fs.existsSync(filePath)) {
      skipped++;
      return;
    }
    const svg = buildSVG(entry);
    fs.writeFileSync(filePath, svg);
    created++;
  });

  console.log(`Created ${created} new floor plan SVGs.`);
  console.log(`Skipped ${skipped} entries that already had a file.`);
}

main();

