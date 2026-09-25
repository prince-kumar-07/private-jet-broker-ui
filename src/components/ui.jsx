import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring, useInView, animate } from 'framer-motion';
import { STATUS } from '../data/content';

const EASE = [0.22, 1, 0.36, 1];

export function Typewriter({ phrases, speed = 70, pause = 1800, startDelay = 0, className = '' }) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(reduce ? phrases[0] : '');
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [started, setStarted] = useState(startDelay === 0);

  useEffect(() => {
    if (started) return;
    const t = setTimeout(() => setStarted(true), startDelay * 1000);
    return () => clearTimeout(t);
  }, [started, startDelay]);

  useEffect(() => {
    if (reduce || !started) return;
    const full = phrases[i % phrases.length];
    let delay = deleting ? speed / 2 : speed;
    if (!deleting && text === full) delay = pause;
    if (deleting && text === '') delay = 400;
    const t = setTimeout(() => {
      if (!deleting && text === full) return setDeleting(true);
      if (deleting && text === '') { setDeleting(false); return setI((n) => n + 1); }
      setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, i, phrases, speed, pause, reduce, started]);

  return (
    <span className={className}>
      {text}
      {!reduce && <span className="caret" aria-hidden="true" />}
    </span>
  );
}

export function Reveal({ children, delay = 0, y = 40, className = '', as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, delay, ease: EASE }}>
      {children}
    </Tag>
  );
}

export function SplitText({ text, className = '', wordClass = '', delay = 0, stagger = 0.07, immediate = false }) {
  const words = text.split(' ');
  const trigger = immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '-60px' } };
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.15em] align-bottom -mb-[0.15em]" aria-hidden="true">
          <motion.span
            className={`inline-block will-change-transform ${wordClass}`}
            variants={{ hidden: { y: '115%', rotate: 5 }, show: { y: 0, rotate: 0 } }}
            initial="hidden"
            {...trigger}
            transition={{ duration: 1.1, delay: delay + i * stagger, ease: EASE }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, className = '' }) {
  return (
    <div className={`mb-14 text-center ${className}`}>
      <Reveal y={16}><p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">{eyebrow}</p></Reveal>
      <h2 className="font-display text-4xl font-semibold leading-tight sm:text-6xl"><SplitText text={title} /></h2>
      <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.4, ease: EASE }} className="mx-auto mt-6 h-px w-24 origin-center bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  );
}

export function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15, mass: 0.4 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} style={{ x, y }} onPointerMove={(e) => e.pointerType === 'mouse' && onMove(e)} onPointerLeave={reset} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}

export function SpotCard({ children, className = '', as = 'div', ...rest }) {
  const Tag = motion[as];
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return <Tag onPointerMove={onMove} className={`card spot ${className}`} {...rest}>{children}</Tag>;
}

export function Counter({ to, prefix = '', suffix = '', duration = 2.2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration, ease: EASE, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to, duration, reduce]);
  return <span ref={ref}>{prefix}{v.toLocaleString()}{suffix}</span>;
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.submitted;
  return <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${s.cls}`}>{s.label}</span>;
}

export function JetIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 300 100" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22 44C64 38 150 34 232 38c32 2 58 10 66 18-8 6-34 14-66 14L62 67C40 65 26 58 22 44z" />
      <path d="M22 44 8 6h24l34 34z" opacity=".92" />
      <path d="M4 5h40v4H4z" opacity=".8" />
      <path d="M128 64 92 93h18l70-28z" opacity=".85" />
      <rect x="50" y="48" width="38" height="11" rx="5.5" opacity=".75" />
      <g fill="#0b1220" opacity=".7">
        {[120, 140, 160, 180, 200].map((x) => <circle key={x} cx={x} cy="50" r="3" />)}
        <path d="M240 46c10 1 20 4 26 8-8 1-18 0-26-2z" />
      </g>
    </svg>
  );
}

export function HeliIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 300 100" className={className} fill="currentColor" aria-hidden="true">
      <rect x="34" y="10" width="212" height="4" rx="2" opacity=".9" />
      <rect x="146" y="14" width="8" height="14" />
      <path d="M72 62C72 40 102 30 152 30c48 0 80 14 84 32 0 14-16 20-36 20H102c-18 0-30-8-30-20z" />
      <path d="M72 55 12 46v8l62 14zM12 46 4 28h12l6 18z" opacity=".9" />
      <circle cx="9" cy="32" r="9" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7" />
      <path d="M170 40c28 0 50 8 56 20h-56z" fill="#0b1220" opacity=".7" />
      <rect x="82" y="90" width="150" height="3.5" rx="1.75" />
      <rect x="112" y="82" width="4" height="9" />
      <rect x="196" y="82" width="4" height="9" />
    </svg>
  );
}

export const AircraftIcon = ({ kind, className }) => (kind === 'helicopter' ? <HeliIcon className={className} /> : <JetIcon className={className} />);

export function Spinner() {
  return <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" role="status" aria-label="Loading" />;
}

export const fmtDate = (d) => (d ? new Date(d.includes('T') || d.includes(' ') ? d.replace(' ', 'T') + (d.endsWith('Z') ? '' : 'Z') : d + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const fmtMoney = (n, c = 'USD') => (n == null ? '-' : new Intl.NumberFormat(undefined, { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n));
