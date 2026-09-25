import { API_URL } from '../config';
import { beginRequest, endRequest, GIVE_UP } from './server';

const BASE = API_URL;
const TOKEN_KEY = 'iac_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// A sleeping Render service answers with a proxy 502/503/504 (or a network error) until it has booted.
const COLD = new Set([502, 503, 504]);

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const started = Date.now();
  let res;
  beginRequest();
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        res = await fetch(BASE + path, {
          method,
          headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!COLD.has(res.status)) break;
      } catch {
        res = null;
      }
      if (Date.now() - started > GIVE_UP) {
        if (res) break;
        throw new Error('Cannot reach the server. Please try again.');
      }
      await sleep(Math.min(1500 + attempt * 500, 4000));
    }
  } finally {
    endRequest();
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong');
    err.status = res.status;
    err.code = data.code;
    err.email = data.email;
    throw err;
  }
  return data;
}
