import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { JetIcon } from './ui';
import { useServerState } from '../lib/server';
import { APP_SHORT_NAME } from '../config';

const EST = 50; // seconds a Render cold start typically takes
const STAGES = ['Fuelling the engines', 'Running pre-flight checks', 'Clearing the runway', 'Cleared for take-off'];

function Elapsed({ since }) {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setS((Date.now() - since) / 1000), 250);
    return () => clearInterval(t);
  }, [since]);
  // ease toward 92% so the bar never looks stuck or finishes early
  const pct = 92 * (1 - Math.exp(-s / (EST / 2.2)));
  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor((pct / 92) * STAGES.length))];
  return (
    <>
      <p className="mt-1 text-xs text-white/55">{stage}<span className="text-gold/70"> · {Math.floor(s)}s</span></p>
      <div className="relative mt-4 h-px w-full bg-white/10">
        <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-soft to-gold" animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: 'linear' }} />
        <motion.div className="absolute -top-[9px] w-8 text-gold" animate={{ left: `calc(${pct}% - 16px)` }} transition={{ duration: 0.4, ease: 'linear' }}>
          <JetIcon className="w-full drop-shadow-[0_0_10px_rgba(230,190,120,.7)]" />
        </motion.div>
      </div>
    </>
  );
}

export default function ColdStart() {
  const { waking, since, ready } = useServerState();
  const show = waking || ready;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="cold"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-0 z-[90] mx-auto w-auto max-w-md pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-[calc(2rem+env(safe-area-inset-bottom))]"
        >
          <div className="glass-bar relative overflow-hidden rounded-2xl border border-gold/25 bg-[#0b1220]/85 p-5 backdrop-blur-xl">
            <div aria-hidden="true" className="pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{ready ? 'Cleared for take-off' : 'Preparing your flight desk'}</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-white">
                {ready ? `${APP_SHORT_NAME} is ready` : 'Our concierge is getting ready'}
              </h3>
              {ready ? (
                <p className="mt-1 text-xs text-white/55">Thank you for your patience.</p>
              ) : (
                <>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">We are waking our secure servers after a quiet spell. This takes up to a minute, only the first time. Your request will continue automatically.</p>
                  <Elapsed since={since} />
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
