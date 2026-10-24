import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Lenis from 'lenis';
import { useAuth } from '../lib/auth';
import { useToast } from './Toast';
import { APP_NAME, APP_SHORT_NAME, CONTACT_EMAIL, CONTACT_PHONE, COMPANY_LEGAL_NAME, COMPANY_ADDRESS, COMPANY_REG } from '../config';
import { JetIcon, Spinner } from './ui';
import { Grain, Preloader, ScrollProgress } from './Effects';
import ErrorBoundary from './ErrorBoundary';

export function Layout() {
  const { pathname } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  useEffect(() => { window.scrollTo(0, 0); first.current = false; }, [pathname]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2 focus:text-sm focus:text-black">Skip to content</a>
      <Preloader />
      <Grain />
      <ScrollProgress />
      <motion.div
        key={'curtain' + pathname}
        initial={{ scaleY: first.current ? 0 : 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        className="pointer-events-none fixed inset-0 z-[80] origin-top bg-navy"
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-gold" />
      </motion.div>
      <Navbar />
      <motion.main id="main" key={pathname} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: first.current ? 0 : 0.1 }} className="min-h-screen">
        <ErrorBoundary key={pathname}><Suspense fallback={<div className="grid min-h-[60vh] place-items-center"><Spinner /></div>}><Outlet /></Suspense></ErrorBoundary>
      </motion.main>
      <Footer />
    </>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > 240 && y > prev);
  });
  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/fleet', label: 'Fleet' },
    { to: '/empty-legs', label: 'Empty Legs' },
    { to: '/track', label: 'Track Flight' },
    { to: '/contact', label: 'Contact' },
    ...(user?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin' }]
      : user
        ? [{ to: '/request', label: 'Request a Flight' }, { to: '/my-requests', label: 'My Requests' }, { to: '/account', label: 'Account' }]
        : [{ to: '/request', label: 'Check Availability' }]),
  ];
  const linkCls = ({ isActive }) => `navlink relative py-1 text-sm tracking-wide transition-colors hover:text-gold ${isActive ? 'text-gold active' : 'text-white/80'}`;

  return (
    <motion.header
      animate={{ y: hidden && !open ? '-100%' : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-500 ${solid || open ? 'border-b border-white/10 bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent'}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <JetIcon className="h-5 w-auto text-gold sm:h-6" />
          <span className="font-display text-xl font-semibold uppercase tracking-[0.18em] sm:text-2xl">{APP_SHORT_NAME.split(' ')[0]} <span className="gold-text">{APP_SHORT_NAME.split(' ').slice(1).join(' ')}</span></span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>)}
          {user ? (
            <button onClick={() => { logout(); toast.info('You have been signed out'); nav('/'); }} className="btn-ghost !px-5 !py-2 text-sm">Sign out</button>
          ) : (
            <>
              <NavLink to="/login" className={linkCls}>Sign in</NavLink>
              <Link to="/register" className="btn-gold !px-5 !py-2 text-sm">Get Started</Link>
            </>
          )}
        </nav>

        <button className="grid h-11 w-11 place-items-center md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          <span className="relative block h-4 w-6">
            <span className={`absolute left-0 h-0.5 w-6 bg-white transition-all duration-300 ${open ? 'top-2 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 top-2 h-0.5 w-6 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 h-0.5 w-6 bg-white transition-all duration-300 ${open ? 'top-2 -rotate-45' : 'top-4'}`} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border-t border-white/10 md:hidden">
            <div className="flex flex-col gap-1 px-5 py-5">
              {links.map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}>
                  <NavLink to={l.to} end={l.end} className={({ isActive }) => `block rounded-lg px-3 py-3 font-display text-2xl ${isActive ? 'text-gold' : 'text-white/85'}`}>{l.label}</NavLink>
                </motion.div>
              ))}
              {user ? (
                <button onClick={() => { logout(); toast.info('You have been signed out'); nav('/'); }} className="rounded-lg px-3 py-3 text-left font-display text-2xl text-white/85">Sign out</button>
              ) : (
                <>
                  <NavLink to="/login" className="block rounded-lg px-3 py-3 font-display text-2xl text-white/85">Sign in</NavLink>
                  <Link to="/register" className="btn-gold mt-3">Get Started</Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Footer() {
  const col = 'space-y-2.5 text-sm text-white/55';
  const lnk = 'transition-colors hover:text-gold';
  return (
    <footer className="relative border-t border-white/10 bg-navy/60">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3"><JetIcon className="h-5 w-auto text-gold" /><span className="font-display text-xl uppercase tracking-[0.2em] text-white/90">{APP_NAME}</span></div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/50">An aircraft-agnostic private jet and helicopter charter broker. Every flight is operated by a licensed operator.</p>
        </div>
        <nav aria-label="Explore">
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-gold">Explore</p>
          <ul className={col}>
            <li><Link to="/fleet" className={lnk}>Fleet</Link></li>
            <li><Link to="/empty-legs" className={lnk}>Empty Legs</Link></li>
            <li><Link to="/track" className={lnk}>Track a Flight</Link></li>
            <li><Link to="/request" className={lnk}>Request a Quote</Link></li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-gold">Legal</p>
          <ul className={col}>
            <li><Link to="/terms" className={lnk}>Terms of Service</Link></li>
            <li><Link to="/privacy" className={lnk}>Privacy Policy</Link></li>
            <li><Link to="/cancellation-policy" className={lnk}>Cancellation Policy</Link></li>
          </ul>
        </nav>
        <div>
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-gold">Contact</p>
          <ul className={col}>
            {CONTACT_PHONE && <li><a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className={lnk}>{CONTACT_PHONE}</a></li>}
            {CONTACT_EMAIL && <li><a href={`mailto:${CONTACT_EMAIL}`} className={lnk}>{CONTACT_EMAIL}</a></li>}
            <li><Link to="/contact" className={lnk}>Send us a message</Link></li>
            <li className="text-white/40">Concierge available 24/7</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} {COMPANY_LEGAL_NAME || APP_NAME}. All rights reserved.{COMPANY_REG && ` ${COMPANY_REG}.`}{COMPANY_ADDRESS && ` ${COMPANY_ADDRESS}.`}</p>
          <p className="flex items-center gap-2"><svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gold/70" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 11V8a5 5 0 0110 0v3M5 11h14v10H5V11z" /></svg>Encrypted connection · Payments processed by Razorpay</p>
        </div>
      </div>
    </footer>
  );
}

export function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname + loc.search }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
