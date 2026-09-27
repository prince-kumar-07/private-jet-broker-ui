import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Typewriter, Reveal, SectionTitle, SplitText, Magnetic, SpotCard, Counter, JetIcon, AircraftIcon } from '../components/ui';
import { FLEET, ROUTES, STEPS, FAQ, MARQUEE_CITIES } from '../data/content';
import AirportInput from '../components/AirportInput';
import { useMedia, INTRO_DELAY } from '../lib/hooks';
import { APP_NAME, HERO_VIDEOS } from '../config';
import HeroVideo from '../components/HeroVideo';
import EnquiryForm from '../components/EnquiryForm';
import { ContactDetails } from './Contact';

const EASE = [0.22, 1, 0.36, 1];

function QuickBar() {
  const nav = useNavigate();
  const go = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const qs = new URLSearchParams(Object.fromEntries([...f].filter(([, v]) => v)));
    nav(`/request?${qs}`);
  };
  return (
    <motion.form
      onSubmit={go}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: INTRO_DELAY + 1.5, duration: 1, ease: EASE }}
      className="mt-10 grid w-full min-w-0 max-w-4xl grid-cols-1 gap-2 glass-bar rounded-3xl border border-white/15 bg-white/[0.06] p-3 text-left backdrop-blur-xl sm:mt-12 sm:grid-cols-[1fr_1fr_170px_auto] sm:gap-3"
    >
      {[['from', 'From', 'text'], ['to', 'To', 'text'], ['date', 'Date', 'date']].map(([n, l, t]) => {
        const bare = 'w-full min-w-0 bg-transparent py-1 text-base text-white placeholder:text-white/30 focus:outline-none';
        return (
          <div key={n} className="block min-w-0 rounded-2xl px-4 py-2 transition-colors focus-within:bg-white/[0.06]">
            <label htmlFor={`hero-${n}`} className="block text-[10px] uppercase tracking-[0.2em] text-white/45">{l}</label>
            {t === 'text'
              ? <AirportInput id={`hero-${n}`} name={n} className={bare} dropUp />
              : <input id={`hero-${n}`} name={n} type="date" min={new Date().toISOString().slice(0, 10)} className={bare} />}
          </div>
        );
      })}
      <button className="btn-gold sm:px-8">Check availability</button>
    </motion.form>
  );
}

function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 20 });
  const sy = useSpring(my, { stiffness: 45, damping: 20 });
  useEffect(() => {
    if (reduce) return;
    const h = (e) => { mx.set(e.clientX / window.innerWidth - 0.5); my.set(e.clientY / window.innerHeight - 0.5); };
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, [reduce, mx, my]);

  const skyY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.6]);
  const starsY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const farY = useTransform(scrollYProgress, [0, 1], ['0%', '55%']);
  const nearY = useTransform(scrollYProgress, [0, 1], ['0%', '95%']);
  const jetX = useTransform(scrollYProgress, [0, 1], ['-8%', '78%']);
  const jetY = useTransform(scrollYProgress, [0, 1], ['0%', '-70%']);
  const jetRot = useTransform(scrollYProgress, [0, 1], [0, -9]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '45%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const starsMX = useTransform(sx, (v) => v * -16);
  const starsMY = useTransform(sy, (v) => v * -16);
  const farMX = useTransform(sx, (v) => v * 30);
  const nearMX = useTransform(sx, (v) => v * -46);
  const jetMX = useTransform(sx, (v) => v * -34);
  const jetMY = useTransform(sy, (v) => v * -24);

  const stars = useMemo(() => Array.from({ length: 48 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 75, s: Math.random() * 2 + 0.8, d: Math.random() * 5 })), []);
  const on = (v) => (reduce ? undefined : v);

  const wantVideo = HERO_VIDEOS.length > 0 && !reduce && !navigator.connection?.saveData;
  const [videoOn, setVideoOn] = useState(false);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-[1400ms] ${videoOn ? 'opacity-0' : 'opacity-100'}`}>
      <motion.div style={{ y: on(skyY) }} className="absolute inset-0 -top-[10%] h-[125%] bg-[linear-gradient(to_bottom,#05070d_0%,#0b1226_45%,#1a2038_70%,#2b2233_86%,#4a3521_100%)]" />
      <motion.div style={{ scale: on(glowScale) }} className="absolute inset-x-0 bottom-[-25%] mx-auto h-[70%] w-[130%] max-w-[1600px] -translate-x-[8%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(230,190,120,.55),rgba(201,164,92,.16)_40%,transparent_68%)]" aria-hidden="true" />
      <div className="absolute -left-[10%] top-[8%] h-[50%] w-[60%] rounded-full bg-indigo-500/10 blur-[120px]" style={{ animation: 'float-slow 20s ease-in-out infinite' }} aria-hidden="true" />
      <div className="absolute -right-[10%] top-[20%] h-[45%] w-[50%] rounded-full bg-amber-500/10 blur-[120px]" style={{ animation: 'float-slow 26s ease-in-out infinite reverse' }} aria-hidden="true" />

      <motion.div style={{ y: on(starsY) }} className="absolute inset-0" aria-hidden="true">
        <motion.div style={{ x: on(starsMX), y: on(starsMY) }} className="absolute inset-0">
          {stars.map((s) => <span key={s.id} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animation: `twinkle ${3 + s.d}s ease-in-out ${s.d}s infinite` }} />)}
        </motion.div>
      </motion.div>

      <motion.div style={{ y: on(farY) }} className="absolute inset-x-0 bottom-[10%] h-64 opacity-45" aria-hidden="true">
        <motion.div style={{ x: on(farMX) }} className="absolute inset-0">
          <div className="absolute -left-20 bottom-0 h-40 w-[70%] rounded-full bg-slate-300/25 blur-3xl" style={{ animation: 'drift 18s ease-in-out infinite alternate' }} />
          <div className="absolute -right-20 bottom-10 h-44 w-[60%] rounded-full bg-amber-100/15 blur-3xl" style={{ animation: 'drift 24s ease-in-out infinite alternate-reverse' }} />
        </motion.div>
      </motion.div>

      <motion.div style={{ x: on(jetX), y: on(jetY) }} className="pointer-events-none absolute left-0 top-[10%] z-[5] w-[58vw] max-w-[520px] opacity-70 sm:top-[79%] sm:w-[38vw] sm:opacity-100" aria-hidden="true">
        <motion.div style={{ x: on(jetMX), y: on(jetMY), rotate: on(jetRot) }}>
          <motion.div initial={{ x: '-120%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: INTRO_DELAY + 0.2, duration: 2.2, ease: EASE }} className="relative">
            <div className="absolute right-[92%] top-[52%] h-[3px] w-[90%] -translate-y-1/2 bg-gradient-to-l from-white/70 via-white/20 to-transparent blur-[1px]" />
            <motion.div animate={reduce ? undefined : { y: [0, -10, 0], rotate: [-1.2, 0.6, -1.2] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              <JetIcon className="w-full text-white drop-shadow-[0_0_45px_rgba(230,190,120,.55)]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      </div>

      {wantVideo && (
        <>
          <motion.div style={{ y: on(skyY) }} className="absolute inset-0 -top-[10%] h-[125%] overflow-hidden bg-ink">
            <HeroVideo clips={HERO_VIDEOS} onReady={() => setVideoOn(true)} />
          </motion.div>
          <div className={`pointer-events-none absolute inset-0 z-[2] transition-opacity duration-[1400ms] ${videoOn ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,7,13,.62),rgba(7,12,26,.2)_35%,rgba(7,12,26,.38)_72%,#07090f)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(7,9,15,.42),transparent_62%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(201,164,92,.22),transparent_60%)]" />
          </div>
        </>
      )}

      <motion.div style={{ y: on(nearY) }} className="absolute inset-x-0 bottom-0 z-[6] h-56" aria-hidden="true">
        <motion.div style={{ x: on(nearMX) }} className="absolute inset-0">
          <div className="absolute -left-10 -bottom-20 h-56 w-[65%] rounded-full bg-slate-100/20 blur-2xl" />
          <div className="absolute -right-10 -bottom-24 h-60 w-[70%] rounded-full bg-amber-50/15 blur-2xl" />
        </motion.div>
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 z-[7] h-40 bg-gradient-to-t from-ink to-transparent" />

      <motion.div style={{ y: on(textY), opacity: on(textOpacity) }} className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col items-center justify-center px-5 pb-20 pt-28 text-center [text-shadow:0_2px_28px_rgba(0,0,0,.55)] sm:px-8">
        <motion.p initial={{ opacity: 0, letterSpacing: '0.7em' }} animate={{ opacity: 1, letterSpacing: '0.4em' }} transition={{ delay: INTRO_DELAY + 0.2, duration: 1.6, ease: EASE }} className="mb-6 text-[10px] uppercase text-gold sm:text-xs">
          Private Jet &amp; Helicopter Charter
        </motion.p>
        <h1 className="font-display text-[2.8rem] font-semibold leading-[1.02] sm:text-7xl lg:text-[7.5rem]">
          <SplitText text="Fly Private." immediate delay={INTRO_DELAY + 0.35} stagger={0.14} className="block" />
          <span className="gold-text block min-h-[1.1em]">
            <Typewriter startDelay={INTRO_DELAY + 1.3} phrases={['On your schedule.', 'To anywhere.', `The ${APP_NAME.split(' ')[0]} way.`]} />
          </span>
        </h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: INTRO_DELAY + 1.2, duration: 1, ease: EASE }} className="mt-6 max-w-xl text-base text-white/70 sm:text-lg">
          Request availability for any route and receive a tailored quote from our charter specialists.
        </motion.p>
        <QuickBar />
        <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: INTRO_DELAY + 2.1, duration: 1.2 }} className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.25em] text-white/45 sm:text-[11px]">
          {['No obligation', 'Quote in under 2 hours', '24/7 concierge'].map((t) => <li key={t} className="flex items-center gap-2"><span className="text-gold/70">✦</span>{t}</li>)}
        </motion.ul>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: INTRO_DELAY + 2.2 }} className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-white/50 sm:flex">
        Scroll
        <span className="relative block h-10 w-px overflow-hidden bg-white/15"><motion.span className="absolute inset-x-0 h-4 bg-gold" animate={reduce ? undefined : { y: [-16, 40] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} /></span>
      </motion.div>
    </section>
  );
}

function Marquee() {
  return (
    <div className="fade-x overflow-hidden border-y border-white/10 bg-ink py-7" aria-hidden="true">
      <div className="marquee flex w-max">
        {[...MARQUEE_CITIES, ...MARQUEE_CITIES].map((c, i) => (
          <span key={i} className="flex items-center whitespace-nowrap pr-12 font-display text-5xl font-semibold sm:text-7xl">
            <span className={i % 2 ? 'outline-text' : 'gold-text'}>{c}</span>
            <span className="ml-12 text-2xl text-gold/60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  const items = [
    { node: <Counter to={5000} suffix="+" />, l: 'Aircraft worldwide' },
    { node: '24/7', l: 'Dedicated concierge' },
    { node: <Counter to={190} suffix="+" />, l: 'Countries served' },
    { node: <Counter to={2} prefix="< " suffix="h" />, l: 'Average quote time' },
  ];
  return (
    <section className="bg-navy/60 shadow-[inset_0_1px_0_rgba(230,207,156,.12)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-16 sm:px-8 md:grid-cols-4">
        {items.map((s, i) => (
          <Reveal key={s.l} delay={i * 0.1} className={`text-center ${i % 4 ? 'md:border-l md:border-white/10' : ''}`}>
            <div className="gold-text font-display text-5xl font-semibold sm:text-6xl">{s.node}</div>
            <div className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/55">{s.l}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FleetCard({ f, i, wide }) {
  return (
    <SpotCard className={`group flex flex-col p-8 ${wide ? 'h-[420px] w-[380px] shrink-0' : 'h-full'}`}>
      <div className="flex items-start justify-between">
        <AircraftIcon kind={f.kind} className="h-11 w-auto text-gold transition-transform duration-700 ease-out group-hover:translate-x-4" />
        <span className="font-display text-5xl text-white/10">{String(i + 1).padStart(2, '0')}</span>
      </div>
      <h3 className="mt-auto font-display text-3xl font-semibold">{f.name}</h3>
      <p className="mt-1 text-sm text-gold/80">{f.example}</p>
      <p className="mt-4 text-sm leading-relaxed text-white/60">{f.blurb}</p>
      <div className="mt-6 flex gap-6 border-t border-white/10 pt-4 text-xs text-white/55"><span>{f.seats} seats</span><span>{f.range}</span><span>{f.speed}</span></div>
    </SpotCard>
  );
}

function FleetShowcase() {
  // xl, not lg: below this, landscape tablets (iPad Pro is 1024-1194px) get the plain grid
  // instead of the pinned horizontal scroll-jack, which is easy to make feel janky on touch.
  const desktop = useMedia('(min-width: 1280px) and (prefers-reduced-motion: no-preference)');
  const wrap = useRef(null);
  const track = useRef(null);
  const [max, setMax] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (p) => -p * max);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useLayoutEffect(() => {
    if (!desktop) return;
    const measure = () => setMax(Math.max(0, track.current.scrollWidth - window.innerWidth));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [desktop]);

  if (!desktop) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <SectionTitle eyebrow="The Fleet" title="An Aircraft for Every Journey" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FLEET.map((f, i) => <Reveal key={f.id} delay={(i % 2) * 0.1} className="h-full"><FleetCard f={f} i={i} /></Reveal>)}
        </div>
      </section>
    );
  }

  return (
    <section ref={wrap} style={{ height: max + window.innerHeight }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex items-center gap-6 pl-[8vw] pr-[8vw] will-change-transform">
          <div className="w-[440px] shrink-0 pr-10">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">The Fleet</p>
            <h2 className="font-display text-6xl font-semibold leading-[1.05]"><SplitText text="An Aircraft for Every Journey" /></h2>
            <p className="mt-6 text-white/55">Keep scrolling <span className="text-gold">→</span></p>
          </div>
          {FLEET.map((f, i) => <FleetCard key={f.id} f={f} i={i} wide />)}
        </motion.div>
        <div className="absolute inset-x-[8vw] bottom-12 h-px bg-white/10"><motion.div style={{ width: bar }} className="h-full bg-gold" /></div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="defer bg-navy/50 py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle eyebrow="How It Works" title="From Request to Runway" />
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: EASE }} className="absolute left-[12%] right-[12%] top-[52px] hidden h-px origin-left bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0 lg:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.15} className="h-full">
              <SpotCard className="h-full p-7">
                <div className="gold-text font-display text-6xl font-semibold">{s.n}</div>
                <h3 className="mt-5 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{s.text}</p>
              </SpotCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const PT = {
  DEL: [600, 105], JAI: [545, 150], AMD: [478, 212], BOM: [470, 288], GOX: [492, 345], HYD: [578, 318], BLR: [556, 388], MAA: [640, 376], CCU: [705, 228],
  LON: [110, 92], DXB: [290, 200], SIN: [840, 418], MLE: [470, 444],
};
const ARCS = [
  ['DEL', 'BOM'], ['DEL', 'BLR'], ['DEL', 'CCU'], ['DEL', 'JAI'], ['JAI', 'AMD'], ['AMD', 'BOM'], ['BOM', 'GOX'], ['BOM', 'HYD'], ['BOM', 'BLR'],
  ['HYD', 'MAA'], ['BLR', 'MAA'], ['DEL', 'DXB'], ['BOM', 'DXB'], ['DXB', 'LON'], ['BOM', 'LON'], ['BLR', 'SIN'], ['BOM', 'MLE'],
];
// Curve each route sideways in proportion to its length so short hops stay tight and long hauls arc wide.
const arc = (a, b) => {
  const [x1, y1] = PT[a], [x2, y2] = PT[b];
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  let px = -dy / len, py = dx / len;
  if (py > 0) { px = -px; py = -py; } // always bow upwards
  const k = len * 0.2;
  return `M${x1} ${y1} Q${(x1 + x2) / 2 + px * k} ${(y1 + y2) / 2 + py * k} ${x2} ${y2}`;
};

function GlobalReach() {
  return (
    <section className="defer relative overflow-hidden py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle eyebrow="Our Network" title="Across India and Beyond" />
        <Reveal>
          <svg viewBox="0 0 1000 480" className="w-full" role="img" aria-label="Network of popular charter routes across India and to major global cities">
            <defs>
              <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="rgba(255,255,255,.14)" /></pattern>
              <radialGradient id="fade"><stop offset="55%" stopColor="#fff" /><stop offset="100%" stopColor="#000" /></radialGradient>
              <mask id="m"><rect width="1000" height="480" fill="url(#fade)" /></mask>
              <linearGradient id="g" x1="0" x2="1"><stop offset="0" stopColor="#e6cf9c" /><stop offset="1" stopColor="#c9a45c" /></linearGradient>
            </defs>
            <rect width="1000" height="480" fill="url(#dots)" mask="url(#m)" />
            {ARCS.map(([a, b], i) => (
              <g key={a + b}>
                <motion.path d={arc(a, b)} fill="none" stroke="url(#g)" strokeWidth="1.4" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.9 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1.8, delay: i * 0.18, ease: 'easeInOut' }} />
                <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ delay: 2 + i * 0.18, duration: 0.6 }}>
                  <circle r="2.6" fill="#fff"><animateMotion dur={`${5 + (i % 4)}s`} begin={`${i * 0.6}s`} repeatCount="indefinite" path={arc(a, b)} /></circle>
                </motion.g>
              </g>
            ))}
            {Object.entries(PT).map(([k, [x, y]], i) => (
              <g key={k}>
                <circle cx={x} cy={y} r="3" fill="none" stroke="#c9a45c" className="pulse-ring" style={{ animationDelay: `${i * 0.3}s` }} />
                <circle cx={x} cy={y} r="4" fill="#c9a45c" />
                <text x={x} y={y + 20} textAnchor="middle" fontSize="11" letterSpacing="2" fill="rgba(255,255,255,.7)">{k}</text>
              </g>
            ))}
          </svg>
        </Reveal>
      </div>
    </section>
  );
}

function Routes() {
  return (
    <section className="defer mx-auto max-w-7xl px-5 pb-28 sm:px-8">
      <SectionTitle eyebrow="Popular Routes" title="Where Our Clients Fly" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROUTES.map((r, i) => (
          <Reveal key={r.from + r.to} delay={(i % 3) * 0.08}>
            <SpotCard as="div" className="!p-0">
              <Link to={`/request?from=${encodeURIComponent(`${r.from} (${r.fromCode})`)}&to=${encodeURIComponent(`${r.to} (${r.toCode})`)}`} className="group flex items-center justify-between p-6">
                <div>
                  <div className="font-display text-2xl">{r.from} <span className="text-gold">→</span> {r.to}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-white/50">Approx. {r.time}</div>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-gold transition-all duration-500 group-hover:translate-x-1 group-hover:border-gold group-hover:bg-gold group-hover:text-black">→</span>
              </Link>
            </SpotCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Enquire() {
  return (
    <section id="contact" className="defer border-t border-white/10 bg-navy/40 py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 md:grid-cols-[1fr_1.2fr]">
        <div>
          <Reveal y={16}><p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">General Enquiries</p></Reveal>
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-6xl"><SplitText text="Questions before you fly?" /></h2>
          <Reveal delay={0.2}><p className="mt-5 max-w-md text-white/60">Ask about pricing, aircraft, helicopters or how charter works. No account needed. Leave your email and phone and a specialist will reply.</p></Reveal>
          <ContactDetails />
        </div>
        <Reveal delay={0.15}><EnquiryForm /></Reveal>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="defer mx-auto max-w-3xl px-5 pb-28 sm:px-8">
      <SectionTitle eyebrow="FAQ" title="Good to Know" />
      <div className="space-y-3">
        {FAQ.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.06}>
            <div className={`card overflow-hidden transition-colors duration-500 ${open === i ? '!border-gold/40 shadow-[0_20px_50px_-30px_rgba(201,164,92,.35)]' : 'hover:border-white/20'}`}>
              <button className="flex min-h-[60px] w-full items-center justify-between gap-4 px-6 text-left" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span className="font-medium">{f.q}</span>
                <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.4, ease: EASE }} className="text-2xl text-gold">+</motion.span>
              </button>
              <motion.div initial={false} animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-white/60">{f.a}</p>
              </motion.div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,.18),transparent_65%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" style={{ animation: 'spin-slow 90s linear infinite' }}>
        <span className="absolute -top-1 left-1/2 h-2 w-2 rounded-full bg-gold shadow-[0_0_18px_4px_rgba(201,164,92,.6)]" />
      </div>
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <h2 className="font-display text-5xl font-semibold sm:text-7xl">
          <SplitText text="Ready when" className="block" />
          <SplitText text="you are." wordClass="gold-text" delay={0.3} className="block" />
        </h2>
        <Reveal delay={0.4}><p className="mt-6 text-white/60">Tell us your route and dates. We will handle everything else.</p></Reveal>
        <Reveal delay={0.55} className="mt-10"><Magnetic><Link to="/request" className="btn-gold">Request Availability</Link></Magnetic></Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Stats />
      <FleetShowcase />
      <div className="hairline" />
      <HowItWorks />
      <GlobalReach />
      <Routes />
      <Enquire />
      <Faq />
      <Cta />
    </>
  );
}
