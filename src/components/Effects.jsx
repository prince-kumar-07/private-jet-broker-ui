import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { JetIcon } from './ui';
import { introSeen, markIntroSeen } from '../lib/hooks';
import { APP_NAME } from '../config';

export function Preloader() {
  const [show, setShow] = useState(() => !introSeen() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => { setShow(false); markIntroSeen(); document.body.style.overflow = ''; }, 2300);
    return () => { clearTimeout(t); document.body.style.overflow = ''; };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="pre" className="fixed inset-0 z-[100] grid place-items-center bg-ink" exit={{ y: '-100%' }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}>
          <div className="text-center">
            <motion.div initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
              <JetIcon className="mx-auto h-10 w-auto text-gold" />
            </motion.div>
            <div className="mt-6 overflow-hidden font-display text-2xl tracking-[0.35em] sm:text-4xl">
              {APP_NAME.toUpperCase().split('').map((c, i) => (
                <motion.span key={i} className="inline-block" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ delay: 0.3 + i * 0.035, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                  {c === ' ' ? ' ' : c}
                </motion.span>
              ))}
            </div>
            <div className="mx-auto mt-8 h-px w-48 overflow-hidden bg-white/10 sm:w-72">
              <motion.div className="h-full bg-gradient-to-r from-gold-soft to-gold" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.7, delay: 0.2, ease: 'easeInOut' }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-gold-soft via-gold to-gold-soft" />;
}

export function Grain() {
  return <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[60]" />;
}
