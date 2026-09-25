import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import 'flag-icons/css/flag-icons.min.css';

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const POPULAR = ['BOM', 'DEL', 'BLR', 'HYD', 'MAA', 'CCU', 'GOX', 'JAI', 'DXB', 'LHR', 'JFK', 'SIN'];

let cache;
function loadAirports() {
  cache ??= import('../data/airports.json').then(({ default: rows }) =>
    rows.map(([code, name, city, iso, type]) => {
      const country = regionNames.of(iso) || iso;
      // Source cities are messy ("Luton, Luton", "Ferno (VA)"), so build a tidy display label from city + airport name.
      const cleanCity = city.split(/[,(]/)[0].trim() || city;
      const short = name.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\b(International|Intl\.?|Domestic|Regional|Municipal|Airport|Aerodrome|Airfield|Air Base|Airbase|Heliport|Civil Enclave)\b/gi, '').replace(/\s+/g, ' ').trim() || cleanCity;
      const label = short.toLowerCase().includes(cleanCity.toLowerCase()) ? short : `${cleanCity} - ${short}`;
      return { code, name, city: cleanCity, iso, type, country, label, codeL: code.toLowerCase(), cityL: city.toLowerCase(), nameL: name.toLowerCase(), countryL: country.toLowerCase() };
    })
  );
  return cache;
}

const wordStart = (s, t) => s.split(/[\s(),/.-]+/).some((w) => w.startsWith(t));

function search(all, raw) {
  const t = raw.trim().toLowerCase();
  if (!t) return POPULAR.map((c) => all.find((a) => a.code === c && (a.iso === 'IN' || c.length === 3))).filter(Boolean);
  const scored = [];
  for (const a of all) {
    let s = 0;
    if (a.codeL === t) s = 100;
    else if (a.codeL.startsWith(t) && t.length >= 2) s = 80;
    else if (a.cityL.startsWith(t)) s = 70;
    else if (wordStart(a.cityL, t)) s = 55;
    else if (t.length >= 3 && wordStart(a.nameL, t)) s = 45;
    else if (t.length >= 3 && a.countryL.startsWith(t)) s = 30;
    if (!s) continue;
    scored.push([s + (a.iso === 'IN' ? 6 : 0) + (a.type === 'L' ? 3 : a.type === 'M' ? 1 : 0), a]);
  }
  return scored.sort((x, y) => y[0] - x[0]).slice(0, 8).map((x) => x[1]);
}

export const airportLabel = (a) => `${a.label} (${a.code})`;

// Free text is always allowed (private strips and helipads are not in the database);
// picking a suggestion fills in "City (CODE)".
export default function AirportInput({ id, name, defaultValue = '', placeholder = 'City or airport', required = false, className = 'field', dropUp = false }) {
  const [value, setValue] = useState(defaultValue);
  const [all, setAll] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [alignRight, setAlignRight] = useState(false);
  const wrap = useRef(null);
  const listId = useId();

  const load = () => { if (!all) loadAirports().then(setAll); };
  const results = useMemo(() => (all ? search(all, value) : []), [all, value]);

  useEffect(() => { setActive(0); }, [value]);
  useEffect(() => {
    if (!open) return;
    const rect = wrap.current.getBoundingClientRect();
    setAlignRight(rect.left + Math.min(480, window.innerWidth - 40) > window.innerWidth - 16);
    const away = (e) => !wrap.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  const pick = (a) => { setValue(airportLabel(a)); setOpen(false); };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') return setOpen(false);
    if (!open && e.key === 'ArrowDown') return setOpen(true);
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + results.length) % results.length); }
    else if (e.key === 'Enter' && open) { e.preventDefault(); pick(results[active]); }
  };

  return (
    <div ref={wrap} className="relative min-w-0">
      <input
        id={id} name={name} value={value} required={required} placeholder={placeholder} className={className}
        autoComplete="off" role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
        onChange={(e) => { setValue(e.target.value); setOpen(true); load(); }}
        onFocus={() => { load(); setOpen(true); }}
        onKeyDown={onKeyDown}
      />
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            id={listId} role="listbox" data-lenis-prevent
            initial={{ opacity: 0, y: dropUp ? 8 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: dropUp ? 8 : -8 }} transition={{ duration: 0.15 }}
            className={`absolute ${alignRight ? 'right-0' : 'left-0'} z-40 max-h-72 w-full min-w-[17rem] overflow-y-auto sm:w-[min(30rem,calc(100vw-2.5rem))] overscroll-contain rounded-2xl border border-white/12 bg-[#0d1526] py-1 text-left shadow-[0_24px_60px_-15px_rgba(0,0,0,.9)] ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          >
            {!value.trim() && <li className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">Popular</li>}
            {results.map((a, i) => (
              <li key={a.code + a.iso} role="option" aria-selected={i === active}>
                <button type="button" onMouseEnter={() => setActive(i)} onClick={() => pick(a)}
                  className={`flex min-h-[48px] w-full items-center gap-3 px-4 py-2 text-left transition-colors ${i === active ? 'bg-white/8' : ''}`}>
                  <span className={`fi fi-${a.iso.toLowerCase()} shrink-0 rounded-[2px]`} style={{ width: '1.35em', height: '1em' }} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-white">{a.label}<span className="text-white/50"> · {a.country}</span></span>
                    <span className="block truncate text-xs text-white/50">{a.name}</span>
                  </span>
                  <span className="rounded-md border border-gold/40 px-2 py-0.5 font-mono text-xs text-gold">{a.code}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
