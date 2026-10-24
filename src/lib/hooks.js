import { useEffect, useState } from 'react';

export function useMedia(query) {
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

const KEY = 'iac_intro';
export const introSeen = () => {
  try { return !!sessionStorage.getItem(KEY); } catch { return false; }
};
export const markIntroSeen = () => {
  try { sessionStorage.setItem(KEY, '1'); } catch { /* storage unavailable */ }
};
// Seconds the hero should wait so its entrance plays after the splash screen.
export const INTRO_DELAY = introSeen() || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 0 : 1.9;
