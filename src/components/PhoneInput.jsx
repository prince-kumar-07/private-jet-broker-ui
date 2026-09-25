import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';
import 'flag-icons/css/flag-icons.min.css';

const PINNED = 'IN';
const names = new Intl.DisplayNames(['en'], { type: 'region' });

const ALL = getCountries()
  .map((iso) => ({ iso, name: names.of(iso) || iso, dial: `+${getCountryCallingCode(iso)}` }))
  .sort((a, b) => a.name.localeCompare(b.name));
const INDIA = ALL.find((c) => c.iso === PINNED);
const REST = ALL.filter((c) => c.iso !== PINNED);

const Flag = ({ iso, className = '' }) => (
  <span className={`fi fi-${iso.toLowerCase()} shrink-0 rounded-[2px] ${className}`} style={{ width: '1.35em', height: '1em', lineHeight: 1 }} aria-hidden="true" />
);

export function isValidPhone(value) {
  return parsePhoneNumberFromString(value)?.isValid() ?? false;
}

// Renders a hidden input named `name` holding the full number in E.164 form (e.g. +919876543210), or '' when empty.
export default function PhoneInput({ id, name = 'phone', required = false, defaultValue = '' }) {
  const initial = useMemo(() => {
    const p = defaultValue ? parsePhoneNumberFromString(defaultValue) : null;
    return { country: (p?.country && ALL.find((c) => c.iso === p.country)) || INDIA, digits: p?.nationalNumber || '' };
  }, [defaultValue]);
  const [country, setCountry] = useState(initial.country);
  const [digits, setDigits] = useState(initial.digits);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wrap = useRef(null);
  const search = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => !wrap.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    search.current?.focus();
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/^\+/, '');
    if (!t) return null;
    const wordStart = (name) => name.toLowerCase().split(/[\s(),-]+/).some((w) => w.startsWith(t));
    return ALL.filter((c) => wordStart(c.name) || c.dial.slice(1).startsWith(t) || c.iso.toLowerCase() === t);
  }, [q]);

  const pick = (c) => { setCountry(c); setOpen(false); setQ(''); };
  const full = digits ? `${country.dial}${digits}` : '';

  const Row = ({ c }) => (
    <li>
      <button type="button" onClick={() => pick(c)} role="option" aria-selected={c.iso === country.iso}
        className={`flex min-h-[44px] w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-white/8 ${c.iso === country.iso ? 'bg-gold/10 text-gold' : ''}`}>
        <Flag iso={c.iso} className="text-lg" />
        <span className="min-w-0 flex-1 truncate">{c.name}</span>
        <span className="text-white/50">{c.dial}</span>
      </button>
    </li>
  );

  return (
    <div ref={wrap} className="relative">
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={`Country code: ${country.name} ${country.dial}`}
          className="field flex !w-auto shrink-0 items-center gap-2 !px-3">
          <Flag iso={country.iso} className="text-lg" />
          <span className="text-sm">{country.dial}</span>
          <svg viewBox="0 0 24 24" className={`h-4 w-4 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <input id={id} type="tel" inputMode="numeric" autoComplete="tel-national" required={required} value={digits} placeholder="Phone number" maxLength={15}
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, ''))} className="field min-w-0 flex-1" />
      </div>
      <input type="hidden" name={name} value={full} />

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/12 bg-[#0d1526] shadow-[0_24px_60px_-15px_rgba(0,0,0,.9)]">
            <div className="border-b border-white/10 p-3">
              <input ref={search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search country or code" aria-label="Search countries" className="field !py-2.5" />
            </div>
            <ul role="listbox" className="max-h-64 overflow-y-auto overscroll-contain py-1" data-lenis-prevent>
              {filtered ? (
                filtered.length ? filtered.map((c) => <Row key={c.iso} c={c} />) : <li className="px-4 py-6 text-center text-sm text-white/50">No matching country</li>
              ) : (
                <>
                  <Row c={INDIA} />
                  <li aria-hidden="true" className="mx-4 my-1 border-t border-white/10" />
                  {REST.map((c) => <Row key={c.iso} c={c} />)}
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
