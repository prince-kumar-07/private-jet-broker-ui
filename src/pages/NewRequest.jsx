import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../lib/auth';
import PhoneInput, { isValidPhone } from '../components/PhoneInput';
import { AIRCRAFT_OPTIONS } from '../data/content';
import { Spinner } from '../components/ui';
import AirportInput from '../components/AirportInput';

const TRIPS = [['one_way', 'One way'], ['round_trip', 'Round trip'], ['multi_leg', 'Multi-leg']];
const today = new Date().toISOString().slice(0, 10);

export default function NewRequest() {
  const nav = useNavigate();
  const toast = useToast();
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const [trip, setTrip] = useState('one_way');
  const [pax, setPax] = useState(2);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);
  const guest = !user;

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const f = new FormData(e.target);
    if (!isValidPhone(f.get('contact_phone'))) {
      setError('Enter a valid contact phone number for the selected country');
      setBusy(false);
      return;
    }
    try {
      const body = {
        trip_type: trip,
        origin: f.get('origin'), destination: f.get('destination'),
        depart_date: f.get('depart_date'), depart_time: f.get('depart_time'),
        return_date: f.get('return_date'),
        passengers: pax,
        aircraft_pref: f.get('aircraft_pref'), luggage: f.get('luggage'),
        pets: f.get('pets') === 'on', notes: f.get('notes'), contact_phone: f.get('contact_phone'),
      };
      if (guest) {
        const created = await api('/public/availability', { method: 'POST', body: { ...body, name: f.get('name'), email: f.get('email'), website: f.get('website') } });
        toast.success(`Reference ${created.ref}. We emailed you a confirmation.`, { title: 'Request received' });
        setSent({ ref: created.ref, email: f.get('email') });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const created = await api('/requests', { method: 'POST', body });
      toast.success(`Reference ${created.ref}. We emailed you a confirmation.`, { title: 'Request received' });
      nav('/my-requests', { state: { openId: created.id } });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-32 text-center sm:px-8 sm:pt-44">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="card p-8 sm:p-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">Request received</h1>
          <p className="mt-3 text-white/60">Reference <span className="font-mono text-gold">{sent.ref}</span></p>
          <p className="mx-auto mt-4 max-w-md text-white/60">We sent a confirmation to <span className="text-white">{sent.email}</span>. Our charter team will reply there, or call you, with availability and a quote.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn-gold">Create an account</Link>
            <Link to="/" className="btn-ghost">Back to home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">Availability Request</p>
        <h1 className="font-display text-4xl font-semibold sm:text-6xl">Where to next?</h1>
        <p className="mt-4 text-white/60">Share your itinerary and our team will respond with availability and a quote.{guest && ' No account needed. Just tell us how to reach you.'}</p>
      </motion.div>

      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="card mt-10 space-y-6 p-6 sm:p-10">
        <div role="tablist" className="grid grid-cols-3 gap-2 rounded-xl bg-white/5 p-1">
          {TRIPS.map(([v, l]) => (
            <button type="button" key={v} role="tab" aria-selected={trip === v} onClick={() => setTrip(v)}
              className={`min-h-[44px] rounded-lg px-2 text-sm transition-colors ${trip === v ? 'bg-gold text-black font-medium' : 'text-white/70 hover:text-white'}`}>{l}</button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="label" htmlFor="origin">From</label><AirportInput id="origin" name="origin" defaultValue={params.get('from') || ''} required /></div>
          <div><label className="label" htmlFor="destination">To</label><AirportInput id="destination" name="destination" defaultValue={params.get('to') || ''} required /></div>
          <div><label className="label" htmlFor="depart_date">Departure date</label><input id="depart_date" name="depart_date" defaultValue={params.get('date') || ''} type="date" min={today} required className="field" /></div>
          <div><label className="label" htmlFor="depart_time">Preferred time</label><input id="depart_time" name="depart_time" type="time" className="field" /></div>
          <AnimatePresence>
            {trip === 'round_trip' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="sm:col-span-2">
                <label className="label" htmlFor="return_date">Return date</label>
                <input id="return_date" name="return_date" type="date" min={today} required className="field" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {trip === 'multi_leg' && <p className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-soft">Add your additional legs in the notes below and we will build the full itinerary.</p>}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className="label">Passengers</span>
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Fewer passengers" onClick={() => setPax((p) => Math.max(1, p - 1))} className="grid h-12 w-12 place-items-center rounded-full border border-white/15 text-xl hover:border-gold">−</button>
              <span className="w-10 text-center font-display text-3xl" aria-live="polite">{pax}</span>
              <button type="button" aria-label="More passengers" onClick={() => setPax((p) => Math.min(50, p + 1))} className="grid h-12 w-12 place-items-center rounded-full border border-white/15 text-xl hover:border-gold">+</button>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="aircraft_pref">Aircraft preference</label>
            <select id="aircraft_pref" name="aircraft_pref" className="field">{AIRCRAFT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          </div>
          <div className="sm:col-span-2"><label className="label" htmlFor="luggage">Luggage</label><input id="luggage" name="luggage" placeholder="e.g. 4 suitcases, 2 golf bags" className="field" /></div>
          {guest && (
            <>
              <div><label className="label" htmlFor="name">Your name</label><input id="name" name="name" required minLength={2} autoComplete="name" className="field" /></div>
              <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            </>
          )}
          <div className="sm:col-span-2">
            <label className="label" htmlFor="contact_phone">Contact phone (we may call to confirm details)</label>
            <PhoneInput id="contact_phone" name="contact_phone" required defaultValue={user?.phone || ''} />
          </div>
        </div>

        <label className="flex min-h-[44px] items-center gap-3 text-sm text-white/80"><input type="checkbox" name="pets" className="h-5 w-5 accent-[#c9a45c]" /> Travelling with pets</label>
        <div><label className="label" htmlFor="notes">Special requests</label><textarea id="notes" name="notes" rows={4} maxLength={2000} placeholder="Catering, ground transport, additional legs..." className="field resize-y" /></div>

        {error && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        <button className="btn-gold w-full" disabled={busy}>{busy ? 'Sending...' : guest ? 'Check Availability' : 'Submit Request'}</button>
      </motion.form>
    </div>
  );
}
