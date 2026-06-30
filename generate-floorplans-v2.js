const fs = require('fs');
const path = require('path');

const ENTRIES_PATH = path.join(__dirname, 'data', 'entries.json');
const OUT_DIR = path.join(__dirname, 'public', 'images', 'floorplans');

const PROTECTED = new Set([
  'studio-dc-no-separation-sleeping-living',
  'studio-la-murphy-bed-blocks-window',
  'studio-minneapolis-radiator-blocks-only-outlet',
  'studio-nyc-bathroom-through-bedroom',
  'studio-nyc-loft-no-bedroom-separation',
  'studio-seattle-bedroom-facing-alley',
  'studio-sf-kitchen-no-ventilation',
]);

const W = 600;
const H = 760;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function baseRoomsForType(apartmentType) {
  const t = (apartmentType || '').toLowerCase();
  if (t.includes('studio') || t.includes('loft')) {
    return ['LIVING ROOM', 'KITCHEN', 'BATHROOM'];
  }
  if (t.includes('1 bedroom')) {
    return ['LIVING ROOM', 'KITCHEN', 'BEDROOM', 'BATHROOM'];
  }
  if (t.includes('2 bedroom')) {
    return ['LIVING ROOM', 'KITCHEN', 'BEDROOM A', 'BEDROOM B', 'BATHROOM'];
  }
  if (t.includes('3 bedroom')) {
    return ['LIVING ROOM', 'KITCHEN', 'BEDROOM A', 'BEDROOM B', 'BEDROOM C', 'BATHROOM'];
  }
  return ['LIVING ROOM', 'KITCHEN', 'BEDROOM', 'BATHROOM'];
}

const TAG_RULES = [
  { match: ['no_closet'], room: 'BEDROOM', labelSuffix: ' (NO CLOSET)', callout: 'NO CLOSET' },
  { match: ['bathroom_access', 'bathroom_into_kitchen'], room: 'BATHROOM', callout: 'ROUTE THROUGH BEDROOM' },
  { match: ['no_window', 'illegal_bedroom', 'egress'], room: 'BEDROOM', labelSuffix: ' (NO WINDOW)', callout: 'EGRESS / CODE ISSUE' },
  { match: ['no_ventilation', 'kitchen_ventilation'], room: 'KITCHEN', labelSuffix: ' (NO VENT)', callout: 'NO VENTILATION' },
  { match: ['shared_wall', 'no_buffer', 'roommate_noise', 'sound_transmission'], room: 'BEDROOM A', callout: 'SHARED WALL, NO BUFFER' },
  { match: ['front_door', 'bedroom_entry', 'entry_flow'], room: 'BEDROOM', moveToFront: true, callout: 'FRONT DOOR INTO BEDROOM' },
  { match: ['oversized_closet', 'closet_oversized'], room: 'BEDROOM', callout: 'CLOSET LARGER THAN BEDROOM' },
  { match: ['oversized_bathroom'], room: 'LIVING ROOM', callout: 'BATHROOM OVERSIZED' },
  { match: ['below_grade', 'basement', 'window_well'], room: 'BEDROOM', labelSuffix: ' (BELOW GRADE)', callout: 'BELOW GRADE' },
  { match: ['loft_ladder', 'spiral_stair', 'stairs'], room: 'BEDROOM', labelSuffix: ' (LADDER ACCESS)', callout: 'ACCESS PROBLEM' },
  { match: ['murphy_bed', 'window_blocked'], room: 'LIVING ROOM', labelSuffix: ' (MURPHY BED BLOCKS WINDOW)', callout: 'WINDOW BLOCKED' },
  { match: ['laundry_in_kitchen'], room: 'KITCHEN', labelSuffix: ' + LAUNDRY', callout: 'LAUNDRY IN KITCHEN' },
  { match: ['hallway_kitchen', 'pullman_kitchen'], room: 'KITCHEN', moveToFront: true, callout: 'KITCHEN BLOCKS TRAFFIC' },
  { match: ['radiator', 'outlets', 'electrical_panel', 'breaker_panel'], room: 'BEDROOM', labelSuffix: ' (UTILITY CONFLICT)', callout: 'UTILITY CONFLICT' },
  { match: ['west_facing', 'south_glass', 'solar_gain', 'heat_gain'], room: 'LIVING ROOM', labelSuffix: ' (W/S FACING)', callout: 'POOR SUN ORIENTATION' },
  { match: ['alley_facing', 'loading_dock', 'parking_lot', 'brick_wall_view'], room: 'BEDROOM', labelSuffix: ' (FACES ALLEY)', callout: 'POOR WINDOW ORIENTATION' },
  { match: ['partition_wall', 'illegal_conversion', 'conversion', 'sunroom', 'dining_room_conversion'], room: 'BEDROOM B', labelSuffix: ' (CONVERTED)', callout: 'CONVERSION FLAG' },
  { match: ['toilet_location', 'sanitation', 'vanity_location'], room: 'BATHROOM', callout: 'SANITATION ISSUE' },
  { match: ['primary_suite', 'imbalance'], room: 'BEDROOM', callout: 'IMBALANCED PROPORTIONS' },
  { match: ['narrow_living_room', 'wasted_space', 'hallway'], room: 'LIVING ROOM', callout: 'WASTED / CRAMPED SPACE' },
  { match: ['stove_location', 'door_swing', 'safety'], room: 'KITCHEN', moveToFront: true, callout: 'SAFETY CONFLICT' },
  { match: ['desk', 'work_from_home', 'sight_line'], room: 'LIVING ROOM', labelSuffix: ' (NO ZONING)', callout: 'NO ZONING SEPARATION' },
];

function pickRule(flawTags) {
  const tags = (flawTags || []).map((t) => t.toLowerCase());
  for (const rule of TAG_RULES) {
    if (rule.match.some((m) => tags.includes(m))) return rule;
  }
  return null;
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

function roomRect(x, y, w, h, label, highlighted) {
  const stroke = highlighted ? '#C0392B' : '#1A1A1A';
  const dash = highlighted ? ' stroke-dasharray="6,4"' : '';
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F5F5F3" stroke="${stroke}" stroke-width="${highlighted ? 2 : 3}"${dash}/>
  <text x="${x + w / 2}" y="${y + h / 2}" class="roomlabel" text-anchor="middle">${esc(label)}</text>`;
}

function buildSVG(entry) {
  const seed = hashStr(entry.slug || entry.id || '');
  let rooms = baseRoomsForType(entry.apartment_type);
  const rule = pickRule(entry.flaw_tags);

  let highlightRoom = null;
  let callout = (rule && rule.callout) || (entry.flaw_category || '').replace(/_/g, ' ').toUpperCase();

  if (rule) {
    rooms = rooms.map((r) => {
      if (r === rule.room) {
        highlightRoom = r + (rule.labelSuffix || '');
        return highlightRoom;
      }
      return r;
    });
    if (!highlightRoom) {
      const fallbackIdx = Math.max(0, rooms.length - 2);
      highlightRoom = rooms[fallbackIdx];
    }
    if (rule.moveToFront) {
      rooms = rooms.filter((r) => r !== highlightRoom);
      rooms.unshift(highlightRoom);
    }
  } else {
    const idx = seed % rooms.length;
    highlightRoom = rooms[idx];
  }

  const useSideBySide = rooms.length <= 3 && seed % 3 === 0;

  const margin = 90;
  const top = 130;
  let body = `<rect x="${margin}" y="${top - 30}" width="250" height="20" fill="#1A1A1A"/><text x="${margin + 125}" y="${top - 15}" class="tiny" fill="#FFFFFF" text-anchor="middle">FRONT DOOR</text>`;

  if (useSideBySide && rooms.length === 2) {
    const roomW = 120;
    const roomH = 420;
    rooms.forEach((label, i) => {
      const x = margin + i * roomW;
      const isHi = label === highlightRoom;
      body += roomRect(x, top, roomW, roomH, label, isHi);
    });
  } else {
    const roomW = 250;
    const totalH = 600;
    const roomH = totalH / rooms.length;
    rooms.forEach((label, i) => {
      const y = top + i * roomH;
      const isHi = label === highlightRoom;
      body += roomRect(margin, y, roomW, roomH, label, isHi);
      if (isHi) {
        body += `<text x="${margin + roomW + 30}" y="${y + roomH / 2}" class="callout">${esc(callout)}</text>`;
      }
    });
  }

  const caption = `${(entry.city || '').toUpperCase()} / ${(entry.apartment_type || '').toUpperCase()}`;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .tiny { font-family: monospace; font-size: 11px; fill: #1A1A1A; }
    .roomlabel { font-family: monospace; font-size: 12px; fill: #1A1A1A; }
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

  let updated = 0;
  let skippedProtected = 0;

  entries.forEach((entry) => {
    if (!entry.slug) return;
    if (PROTECTED.has(entry.slug)) {
      skippedProtected++;
      return;
    }
    const filePath = path.join(OUT_DIR, `${entry.slug}.svg`);
    const svg = buildSVG(entry);
    fs.writeFileSync(filePath, svg);
    updated++;
  });

  console.log(`Regenerated ${updated} entry-specific floor plan SVGs.`);
  console.log(`Left ${skippedProtected} hand-built reference files untouched.`);
}

main();
