import { useSyncExternalStore } from 'react';
import { API_URL } from '../config';

// Render's free tier sleeps idle services; the first request can take 30-60s.
// This tiny store tracks whether the API is currently "waking up" so the UI can show a themed wait screen.
const SLOW_MS = 2500;      // only show the notice if the server hasn't answered by then
const GIVE_UP_MS = 100000; // stop retrying after this long

let state = { waking: false, since: 0, ready: false };
const subs = new Set();
const set = (next) => { state = { ...state, ...next }; subs.forEach((f) => f()); };

let pending = 0;
let timer = null;
let shown = false;

export function beginRequest() {
  pending++;
  if (pending === 1 && !timer) {
    timer = setTimeout(() => { timer = null; if (pending > 0) { shown = true; set({ waking: true, since: Date.now(), ready: false }); } }, SLOW_MS);
  }
}

export function endRequest() {
  pending = Math.max(0, pending - 1);
  if (pending > 0) return;
  clearTimeout(timer);
  timer = null;
  if (shown) {
    shown = false;
    set({ waking: false, ready: true });
    setTimeout(() => set({ ready: false }), 2200);
  }
}

// Fire-and-forget ping so the server starts booting while the visitor reads the hero.
// Any HTTP response (even 404) means the instance is awake.
export function wakeServer() {
  const ctrl = new AbortController();
  beginRequest();
  const t = setTimeout(() => ctrl.abort(), GIVE_UP_MS);
  fetch(`${API_URL}/health`, { signal: ctrl.signal, cache: 'no-store' }).catch(() => {}).finally(() => { clearTimeout(t); endRequest(); });
}

export const GIVE_UP = GIVE_UP_MS;
export const useServerState = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state);
