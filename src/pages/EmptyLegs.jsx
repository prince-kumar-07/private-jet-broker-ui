import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { Reveal, Spinner, fmtDate, fmtMoney } from '../components/ui';
import PhoneInput, { isValidPhone } from '../components/PhoneInput';
import AirportInput from '../components/AirportInput';

export default function EmptyLegs() {
  const { user } = useAuth();
  const toast = useToast();
  const [legs, setLegs] = useState(null);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null); // the leg currently open in the booking modal

  useEffect(() => {
    api('/public/empty-legs').then(setLegs).catch((e) => setError(e.message));
  }, []);

  const onBooked = (legId, seatsTaken) => {
    setLegs((list) => list
      .map((l) => (l.id === legId ? { ...l, seats_available: Math.max(0, l.seats_available - seatsTaken) } : l))
      .filter((l) => l.seats_available > 0));
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">Repositioning Flights</p>
        <h1 className="font-display text-5xl font-semibold sm:text-6xl">Empty Leg <span className="gold-text">Deals</span></h1>
        <p className="mt-4 text-white/60">Aircraft already flying a route with open seats, at a fraction of the usual charter price. Availability changes fast — book directly to confirm your seat.</p>
      </Reveal>

      <RouteAlertForm user={user} />

      {error && <p role="alert" className="mt-10 text-center text-rose-300">{error}</p>}
      {!legs && !error && <div className="mt-16"><Spinner /></div>}
      {legs?.length === 0 && <div className="card mt-12 p-10 text-center text-white/60">No empty legs available right now. Check back soon, or <Link to="/request" className="text-gold hover:underline">request a custom quote</Link>.</div>}

      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {legs?.map((leg, i) => (
          <Reveal key={leg.id} delay={(i % 3) * 0.08}>
            <EmptyLegCard leg={leg} onBook={() => setBooking(leg)} />
          </Reveal>
        ))}
      </div>

      <BookingModal leg={booking} user={user} toast={toast} onClose={() => setBooking(null)} onBooked={onBooked} />
    </div>
  );
}

function RouteAlertForm({ user }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const f = new FormData(e.target);
    try {
      await api('/public/empty-legs/alerts', { method: 'POST', body: { origin: f.get('origin'), destination: f.get('destination'), email: f.get('email') } });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card mx-auto mt-10 max-w-2xl p-5 sm:p-6">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-sm text-gold hover:underline">+ Get notified when a route opens up</button>
      ) : done ? (
        <p className="text-sm text-emerald-300">You are on the list. We will email you when a matching empty leg is published.</p>
      ) : (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
          <div><label className="label" htmlFor="alert-origin">From</label><AirportInput id="alert-origin" name="origin" required /></div>
          <div><label className="label" htmlFor="alert-destination">To</label><AirportInput id="alert-destination" name="destination" required /></div>
          <div><label className="label" htmlFor="alert-email">Email</label><input id="alert-email" name="email" type="email" required defaultValue={user?.email || ''} className="field" /></div>
          {error && <p role="alert" className="text-sm text-rose-300 sm:col-span-3">{error}</p>}
          <button className="btn-gold sm:col-span-3" disabled={busy}>{busy ? 'Saving...' : 'Notify me'}</button>
        </form>
      )}
    </div>
  );
}

function EmptyLegCard({ leg, onBook }) {
  return (
    <div className="card flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="font-display text-2xl">{leg.origin} <span className="text-gold">→</span> {leg.destination}</div>
        <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] uppercase tracking-widest text-gold">{leg.seats_available} left</span>
      </div>
      <div className="mt-2 text-sm text-white/55">{fmtDate(leg.depart_date)}{leg.depart_time && ` · ${leg.depart_time}`}</div>
      {leg.aircraft && <div className="mt-1 text-sm text-gold/80">{leg.aircraft}</div>}
      {leg.notes && <p className="mt-3 text-sm leading-relaxed text-white/60">{leg.notes}</p>}
      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">Per seat</div>
            <div className="gold-text font-display text-3xl">{fmtMoney(leg.price, leg.currency)}</div>
          </div>
          <button onClick={onBook} className="btn-gold !px-6 !py-2.5 text-sm">Book now</button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ leg, user, toast, onClose, onBooked }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const guest = !user;

  useEffect(() => {
    if (leg) { setError(''); setConfirmed(null); }
  }, [leg]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const f = new FormData(e.target);
    const passengers = Number(f.get('passengers'));
    const phone = f.get('phone');
    if (!isValidPhone(phone)) { setError('Enter a valid contact phone number for the selected country'); setBusy(false); return; }
    try {
      const path = guest ? `/public/empty-legs/${leg.id}/book` : `/empty-legs/${leg.id}/book`;
      const body = guest
        ? { passengers, phone, name: f.get('name'), email: f.get('email'), website: f.get('website') }
        : { passengers, phone };
      const created = await api(path, { method: 'POST', body });
      toast.success(`Reference ${created.ref}. We emailed you a confirmation.`, { title: 'Seat booked' });
      onBooked(leg.id, passengers);
      setConfirmed({ ref: created.ref, email: created.email || f.get('email') || user?.email });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {leg && (
        <motion.div
          role="dialog" aria-modal="true" aria-labelledby="booking-title"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/60 px-4 py-10 backdrop-blur-sm"
          onPointerDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25 }} className="card relative w-full max-w-md p-6 sm:p-8"
          >
            {confirmed ? (
              <div className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
                </span>
                <h3 id="booking-title" className="mt-5 font-display text-3xl font-semibold">Booking confirmed</h3>
                <p className="mt-2 text-white/60">Reference <span className="font-mono text-gold">{confirmed.ref}</span></p>
                {confirmed.email && <p className="mx-auto mt-3 max-w-xs text-sm text-white/60">A confirmation has been emailed to <span className="text-white">{confirmed.email}</span>.</p>}
                <button onClick={onClose} className="btn-gold mt-6 w-full">Done</button>
              </div>
            ) : (
              <>
                <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
                <h3 id="booking-title" className="font-display text-2xl font-semibold sm:text-3xl">{leg.origin} <span className="text-gold">→</span> {leg.destination}</h3>
                <p className="mt-1 text-sm text-white/55">{fmtDate(leg.depart_date)}{leg.depart_time && ` · ${leg.depart_time}`} · {fmtMoney(leg.price, leg.currency)} / seat</p>

                <form onSubmit={submit} className="mt-6 space-y-5">
                  <div>
                    <label className="label" htmlFor="passengers">Passengers</label>
                    <input id="passengers" name="passengers" type="number" min={1} max={leg.seats_available} defaultValue={1} required className="field" />
                    <p className="mt-1 text-xs text-white/40">{leg.seats_available} seat{leg.seats_available === 1 ? '' : 's'} available</p>
                  </div>
                  {guest && (
                    <>
                      <div><label className="label" htmlFor="bl-name">Your name</label><input id="bl-name" name="name" required minLength={2} autoComplete="name" className="field" /></div>
                      <div><label className="label" htmlFor="bl-email">Email</label><input id="bl-email" name="email" type="email" required autoComplete="email" className="field" /></div>
                      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                    </>
                  )}
                  <div><label className="label" htmlFor="bl-phone">Contact phone</label><PhoneInput id="bl-phone" name="phone" required defaultValue={user?.phone || ''} /></div>
                  {error && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
                  <button className="btn-gold w-full" disabled={busy}>{busy ? 'Booking...' : 'Confirm booking'}</button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
