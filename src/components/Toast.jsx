import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const KINDS = {
  success: { accent: '#34d399', icon: <path d="M5 13l4 4L19 7" /> },
  error: { accent: '#fb7185', icon: <path d="M6 6l12 12M18 6L6 18" /> },
  info: { accent: '#c9a45c', icon: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v5h1" /></> },
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setItems((l) => l.filter((t) => t.id !== id)), []);

  const push = useCallback((kind, message, opts = {}) => {
    const id = ++nextId.current;
    const duration = opts.duration ?? (kind === 'error' ? 6000 : 4200);
    setItems((l) => [...l.slice(-3), { id, kind, message, title: opts.title, duration }]);
    return id;
  }, []);

  const api = useMemo(() => ({
    success: (m, o) => push('success', m, o),
    error: (m, o) => push('error', m, o),
    info: (m, o) => push('info', m, o),
    dismiss,
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[95] flex flex-col items-center gap-3 p-4 sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-20 sm:items-end sm:p-6">
        <AnimatePresence initial={false}>
          {items.map((t) => <Toast key={t.id} t={t} onClose={() => dismiss(t.id)} />)}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ t, onClose }) {
  const k = KINDS[t.kind];
  return (
    <motion.div
      layout
      role={t.kind === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.96, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/12 bg-[#0d1526]/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,.8)] backdrop-blur-xl"
      style={{ borderLeft: `3px solid ${k.accent}` }}
    >
      <div className="flex items-start gap-3 p-4 pr-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ background: `${k.accent}22`, color: k.accent }}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{k.icon}</svg>
        </span>
        <div className="min-w-0 flex-1">
          {t.title && <p className="font-display text-lg font-semibold leading-tight">{t.title}</p>}
          <p className={`break-words text-sm ${t.title ? 'mt-0.5 text-white/65' : 'text-white/90'}`}>{t.message}</p>
        </div>
        <button onClick={onClose} aria-label="Dismiss notification" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <motion.div
        className="h-[2px] origin-left"
        style={{ background: k.accent }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: t.duration / 1000, ease: 'linear' }}
        onAnimationComplete={onClose}
      />
    </motion.div>
  );
}
