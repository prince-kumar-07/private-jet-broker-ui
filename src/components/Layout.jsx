import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Lenis from 'lenis';
import { useAuth } from '../lib/auth';
import { useToast } from './Toast';
import { APP_NAME, APP_SHORT_NAME } from '../config';
import { JetIcon, Spinner } from './ui';
import { Grain, Preloader, ScrollProgress } from './Effects';

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
      <Preloader />
      <Grain />
      <ScrollProgress />
      <motion.div
        key={'curtain' + pathname}
        initial={{ scaleY: first.current ? 0 : 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="pointer-events-none fixed inset-0 z-[80] origin-top bg-navy"
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-gold" />
      </motion.div>
      <Navbar />
      <motion.main key={pathname} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: first.current ? 0 : 0.25 }} className="min-h-screen">
        <Outlet />
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
    { to: '/contact', label: 'Contact' },
    ...(user?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin' }]
      : user
        ? [{ to: '/request', label: 'Request a Flight' }, { to: '/my-requests', label: 'My Requests' }]
        : [{ to: '/request', label: 'Check Availability' }]),
  ];
  const linkCls = ({ isActive }) => `navlink relative py-1 text-sm tracking-wide transition-colors hover:text-gold ${isActive ? 'text-gold active' : 'text-white/80'}`;

  return (
    <motion.header
      animate={{ y: hidden && !open ? '-100%' : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${solid || open ? 'border-b border-white/10 bg-ink/80 backdrop-blur-xl' : 'border-b border-transparent'}`}
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
  return (
    <footer className="border-t border-white/10 bg-navy/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-white/50 sm:flex-row sm:px-8">
        <div className="flex items-center gap-3"><JetIcon className="h-4 w-auto text-gold" /><span className="font-display uppercase tracking-[0.2em] text-white/80">{APP_NAME}</span></div>
        <p>© {new Date().getFullYear()} {APP_NAME}. Private jet brokerage.</p>
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
