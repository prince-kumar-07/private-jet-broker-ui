import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { StatusBadge, Spinner, fmtDate, fmtMoney } from '../components/ui';
import Timeline from '../components/Timeline';

export default function MyRequests() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const openId = useLocation().state?.openId;
  const toast = useToast();

  useEffect(() => {
    api('/requests/mine').then((d) => { setRows(d); if (openId) setOpen(openId); }).catch((e) => setError(e.message));
  }, [openId]);

  const cancel = async (id) => {
    if (!confirm('Cancel this request?')) return;
    try {
      const updated = await api(`/requests/${id}/cancel`, { method: 'PATCH' });
      setRows((r) => r.map((x) => (x.id === id ? updated : x)));
      toast.info('Your request has been cancelled', { title: updated.ref });
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">My Requests</h1>
        <Link to="/request" className="btn-gold !py-2.5 text-sm">+ New Request</Link>
      </div>

      {error && <p role="alert" className="text-rose-300">{error}</p>}
      {!rows && !error && <Spinner />}
      {rows?.length === 0 && (
        <div className="card p-10 text-center text-white/60">No requests yet. <Link to="/request" className="text-gold hover:underline">Request your first flight</Link>.</div>
      )}

      <div className="space-y-4">
        {rows?.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card overflow-hidden">
            <button onClick={() => setOpen(open === r.id ? null : r.id)} className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left sm:p-6" aria-expanded={open === r.id}>
              <div>
                <div className="font-display text-2xl">{r.origin} <span className="text-gold">→</span> {r.destination}</div>
                <div className="mt-1 text-xs text-white/50">{r.ref} · {fmtDate(r.depart_date)} · {r.passengers} pax</div>
              </div>
              <StatusBadge status={r.status} />
            </button>
            <AnimatePresence initial={false}>
              {open === r.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="grid gap-8 border-t border-white/10 p-5 sm:p-6 md:grid-cols-2">
                    <div className="space-y-3 text-sm">
                      <Row k="Trip" v={r.trip_type.replace('_', ' ')} />
                      <Row k="Departure" v={`${fmtDate(r.depart_date)} ${r.depart_time || ''}`} />
                      {r.return_date && <Row k="Return" v={fmtDate(r.return_date)} />}
                      <Row k="Aircraft" v={r.aircraft_pref || 'No preference'} />
                      {r.contact_phone && <Row k="Contact" v={r.contact_phone} />}
                      {r.notes && <Row k="Notes" v={r.notes} />}
                      {r.quote_amount != null && (
                        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4">
                          <div className="text-xs uppercase tracking-widest text-gold">Your quote</div>
                          <div className="gold-text font-display text-3xl">{fmtMoney(r.quote_amount, r.quote_currency)}</div>
                          {r.quote_aircraft && <div className="text-white/70">{r.quote_aircraft}</div>}
                          {r.admin_note && <p className="mt-2 text-white/60">{r.admin_note}</p>}
                        </div>
                      )}
                      {['submitted', 'under_review', 'quoted'].includes(r.status) && (
                        <button onClick={() => cancel(r.id)} className="text-sm text-rose-300 hover:underline">Cancel request</button>
                      )}
                    </div>
                    <Timeline history={r.history} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const Row = ({ k, v }) => <div className="flex gap-3"><span className="w-24 shrink-0 text-white/40">{k}</span><span className="capitalize-first break-words">{v}</span></div>;
