import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ParallaxLayer, ParallaxSection } from './Parallax';
import { Reveal, SectionTitle, SpotCard } from './ui';
import { TRUST_BAR, PRINCIPLES, FLIGHT_PROMISES } from '../data/content';

const ICONS = {
  shield: <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5" />,
  receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6" />,
  lock: <path d="M7 11V8a5 5 0 0110 0v3M5 11h14v10H5V11zM12 15v2" />,
  card: <path d="M3 6h18v12H3V6zM3 10h18M7 15h3" />,
  clock: <path d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2" />,
};

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
);

// Slim assurance strip directly under the hero, so reassurance is visible before the first scroll.
export function TrustBar() {
  return (
    <div className="border-b border-white/10 bg-navy/70 backdrop-blur">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-4 px-5 py-5 sm:px-8 md:grid-cols-5">
        {TRUST_BAR.map((t, i) => (
          <motion.li
            key={t.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={`flex items-center gap-3 text-xs tracking-wide text-white/70 ${i === TRUST_BAR.length - 1 ? 'col-span-2 justify-center md:col-span-1 md:justify-start' : ''}`}
          >
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// The "why trust us" chapter: four principles over a layered, scroll-driven backdrop.
export function Principles() {
  return (
    <ParallaxSection
      className="py-28 sm:py-36"
      bg={
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(99,102,241,.10),transparent_55%),radial-gradient(ellipse_at_80%_70%,rgba(201,164,92,.14),transparent_55%)]" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </>
      }
    >
      <ParallaxLayer speed={0.35} aria-hidden="true" className="pointer-events-none absolute -left-6 top-10 select-none font-display text-[22vw] font-semibold leading-none text-white/[0.025] sm:text-[16rem]">
        Trust
      </ParallaxLayer>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionTitle eyebrow="Our Standard" title="Built on Four Principles" />

        <div className="grid gap-6 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <ParallaxLayer key={p.n} speed={i % 2 ? -0.04 : 0.04}>
              <Reveal delay={(i % 2) * 0.12} className="h-full">
                <SpotCard className="group relative h-full overflow-hidden p-8 sm:p-10">
                  <span aria-hidden="true" className="absolute -right-2 -top-6 font-display text-[9rem] font-semibold leading-none text-gold/[0.07] transition-transform duration-700 group-hover:-translate-y-2">{p.n}</span>
                  <h3 className="relative font-display text-3xl font-semibold">{p.title}</h3>
                  <p className="relative mt-4 max-w-md text-[15px] leading-relaxed text-white/65">{p.text}</p>
                </SpotCard>
              </Reveal>
            </ParallaxLayer>
          ))}
        </div>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
          {FLIGHT_PROMISES.map(([t, d]) => (
            <li key={t} className="bg-ink/90 p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.25em] text-gold">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{d}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs text-white/40">
          Read the full <Link to="/terms" className="text-gold/80 hover:underline">Terms</Link>, <Link to="/privacy" className="text-gold/80 hover:underline">Privacy Policy</Link> and <Link to="/cancellation-policy" className="text-gold/80 hover:underline">Cancellation Policy</Link>.
        </p>
      </div>
    </ParallaxSection>
  );
}

// Full-bleed quote band that slides over the page on scroll. Pure typography, so it stays light.
export function ScrollBand({ children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  return (
    <div ref={ref} className="overflow-hidden border-y border-white/10 bg-ink py-10" aria-hidden="true">
      <motion.p style={{ x: reduce ? 0 : x }} className="whitespace-nowrap font-display text-5xl font-semibold uppercase tracking-[0.2em] text-white/[0.06] sm:text-8xl">
        {children}
      </motion.p>
    </div>
  );
}
