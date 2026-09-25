// Builds src/data/airports.json from the OurAirports CSV (public domain):
//   curl -L -o airports.csv https://davidmegginson.github.io/ourairports-data/airports.csv
//   node scripts/build-airports.mjs airports.csv
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) { console.error('Usage: node scripts/build-airports.mjs <airports.csv>'); process.exit(1); }

function parseCsv(text) {
  const rows = [];
  let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const [head, ...data] = parseCsv(readFileSync(src, 'utf8'));
const col = Object.fromEntries(head.map((h, i) => [h, i]));

const out = [];
for (const r of data) {
  const type = r[col.type];
  const iso = r[col.iso_country];
  const iata = r[col.iata_code];
  const scheduled = r[col.scheduled_service] === 'yes';
  const name = r[col.name];
  if (!name || type === 'closed' || type === 'balloonport' || type === 'seaplane_base') continue;

  let keep = false;
  if (iso === 'IN') {
    // Every Indian airport, airstrip and heliport that has an official code (IATA or ICAO)
    keep = ['large_airport', 'medium_airport', 'small_airport'].includes(type) || (type === 'heliport' && (iata || /^VO|^VA|^VE|^VI/.test(r[col.ident])));
  } else {
    // Rest of the world: every commercial-service airport with an IATA code
    keep = !!iata && (type === 'large_airport' || type === 'medium_airport' || (type === 'small_airport' && scheduled));
  }
  if (!keep) continue;

  const code = iata || r[col.icao_code] || r[col.ident];
  const city = r[col.municipality] || name;
  const t = type === 'heliport' ? 'H' : type === 'large_airport' ? 'L' : type === 'medium_airport' ? 'M' : 'S';
  out.push([code, name.replace(/\s+/g, ' ').trim(), city.trim(), iso, t]);
}

// India first is handled in the UI; here just keep a stable, deduplicated order
const seen = new Set();
const unique = out.filter((a) => (seen.has(a[0] + a[3]) ? false : seen.add(a[0] + a[3])));
unique.sort((a, b) => a[2].localeCompare(b[2]) || a[0].localeCompare(b[0]));

writeFileSync(new URL('../src/data/airports.json', import.meta.url), JSON.stringify(unique));
const india = unique.filter((a) => a[3] === 'IN');
console.log(`airports: ${unique.length} (India: ${india.length}, heliports: ${unique.filter((a) => a[4] === 'H').length})`);
console.log('countries:', new Set(unique.map((a) => a[3])).size);
