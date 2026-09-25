const required = (key) => {
  const v = import.meta.env[key];
  if (!v) throw new Error(`Missing ${key}. Copy .env.example to .env and set it.`);
  return v;
};

export const API_URL = required('VITE_API_URL').replace(/\/+$/, '');
export const APP_NAME = required('VITE_APP_NAME');
// "Imperial Air Charter" -> "Imperial Air" for compact spots like the navbar
export const APP_SHORT_NAME = import.meta.env.VITE_APP_SHORT_NAME || APP_NAME.split(' ').slice(0, 2).join(' ');

// Optional hero background clips: comma-separated paths/URLs (mp4/webm). Leave empty for the animated sky only.
export const HERO_VIDEOS = (import.meta.env.VITE_HERO_VIDEOS || '').split(',').map((s) => s.trim()).filter(Boolean);

// Optional public contact details shown next to the enquiry form
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || '';
export const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || '';
