import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import PhoneInput, { isValidPhone } from '../components/PhoneInput';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top,#1a2440,#07090f_70%)] px-5 pb-16 pt-28">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="card w-full max-w-md p-7 sm:p-10">
        <h1 className="font-display text-4xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-white/55">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-center text-sm text-white/55">{footer}</p>
      </motion.div>
    </div>
  );
}

function useSubmit(fn) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try { await fn(new FormData(e.target)); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return { error, busy, submit };
}

const ErrorBox = ({ msg }) => msg ? <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{msg}</p> : null;

export function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const from = useLocation().state?.from;
  const { error, busy, submit } = useSubmit(async (f) => {
    try {
      const u = await login(f.get('email'), f.get('password'));
      toast.success('Signed in successfully', { title: `Welcome back, ${u.name.split(' ')[0]}` });
      nav(u.role === 'admin' ? '/admin' : from || '/my-requests', { replace: true });
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') { toast.info('Verify your email to continue. We are sending a fresh code.'); return nav('/verify-email', { state: { email: err.email, from, resend: true } }); }
      throw err;
    }
  });
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your flight requests." footer={<>New here? <Link to="/register" className="text-gold hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-5">
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
        <ErrorBox msg={error} />
        <button className="btn-gold w-full" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const { error, busy, submit } = useSubmit(async (f) => {
    const email = f.get('email');
    const phone = f.get('phone');
    if (phone && !isValidPhone(phone)) throw new Error('Enter a valid phone number for the selected country');
    await register({ name: f.get('name'), email, phone, password: f.get('password') });
    toast.info(`We emailed a 6-digit code to ${email}`, { title: 'Check your inbox' });
    nav('/verify-email', { state: { email } });
  });
  return (
    <AuthShell title="Create account" subtitle="Request flights and track quotes in one place." footer={<>Already registered? <Link to="/login" className="text-gold hover:underline">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-5">
        <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" className="field" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
        <div><label className="label" htmlFor="phone">Phone</label><PhoneInput id="phone" /></div>
        <div><label className="label" htmlFor="password">Password (8+ characters)</label><input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" className="field" /></div>
        <ErrorBox msg={error} />
        <button className="btn-gold w-full" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}

const LEN = 6;

export function VerifyEmail() {
  const { state } = useLocation();
  const { verifyEmail, resendOtp } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const email = state?.email;
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(state?.resend ? 0 : 60);
  const refs = useRef([]);
  const autoSent = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    setError(''); setInfo('');
    try { await resendOtp(email); toast.success('A new code is on its way'); setCooldown(60); }
    catch (err) { toast.error(err.message); }
  };

  useEffect(() => {
    if (state?.resend && email && !autoSent.current) { autoSent.current = true; resend(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!email) return <Navigate to="/register" replace />;

  const submit = async (code) => {
    setError(''); setBusy(true);
    try {
      const u = await verifyEmail(email, code);
      toast.success('Your email is verified. Let us plan your first flight.', { title: 'Welcome aboard' });
      nav(u.role === 'admin' ? '/admin' : state?.from || '/request', { replace: true });
    } catch (err) {
      setError(err.message); setDigits(Array(LEN).fill('')); refs.current[0]?.focus();
    } finally { setBusy(false); }
  };

  const setAt = (i, v) => {
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < LEN - 1) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) submit(next.join(''));
  };

  const onPaste = (e) => {
    const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!t) return;
    e.preventDefault();
    const next = Array.from({ length: LEN }, (_, i) => t[i] || '');
    setDigits(next);
    refs.current[Math.min(t.length, LEN - 1)]?.focus();
    if (t.length === LEN) submit(t);
  };

  return (
    <AuthShell title="Check your email" subtitle={<>We sent a 6-digit code to <span className="text-white">{email}</span>. It expires in 10 minutes.</>} footer={<>Wrong email? <Link to="/register" className="text-gold hover:underline">Start over</Link></>}>
      <div className="flex justify-between gap-2" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            autoFocus={i === 0}
            aria-label={`Digit ${i + 1}`}
            disabled={busy}
            onChange={(e) => /^\d?$/.test(e.target.value) && setAt(i, e.target.value)}
            onKeyDown={(e) => e.key === 'Backspace' && !d && i > 0 && refs.current[i - 1]?.focus()}
            className="field !px-0 h-14 w-full text-center font-display text-3xl"
          />
        ))}
      </div>
      <div className="mt-5 space-y-4">
        <ErrorBox msg={error} />
        {info && <p className="text-sm text-emerald-300">{info}</p>}
        <button onClick={() => submit(digits.join(''))} disabled={busy || digits.some((d) => !d)} className="btn-gold w-full">{busy ? 'Verifying...' : 'Verify email'}</button>
        <button type="button" onClick={resend} disabled={cooldown > 0} className="block w-full text-center text-sm text-gold disabled:text-white/40">
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </AuthShell>
  );
}
