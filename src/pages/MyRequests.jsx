import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { StatusBadge, Spinner, fmtDate, fmtMoney } from '../components/ui';
import { PAYMENT_STATUS } from '../data/content';
import { loadRazorpay } from '../lib/razorpay';
import Timeline from '../components/Timeline';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MyRequests() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [paying, setPaying] = useState(null);
  const openId = useLocation().state?.openId;
  const toast = useToast();

  useEffect(() => {
    api('/requests/mine').then((d) => { setRows(d); if (openId) setOpen(openId); }).catch((e) => setError(e.message));
  }, [openId]);

  const cancel = async (id) => {
    setPendingCancel(null);
    try {
      const updated = await api(`/requests/${id}/cancel`, { method: 'PATCH' });
      setRows((r) => r.map((x) => (x.id === id ? updated : x)));
      toast.info('Your request has been cancelled', { title: updated.ref });
    } catch (e) { toast.error(e.message); }
  };

  const pay = async (r) => {
    setPaying(r.id);
    try {
      const order = await api(`/requests/${r.id}/pay/order`, { method: 'POST' });
      const Razorpay = await loadRazorpay();
      const rzp = new Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency, order_id: order.order_id,
        name: 'Imperial Air Charter', description: `Charter ${r.ref}`,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#c9a45c' },
        handler: async (response) => {
          try {
            const updated = await api(`/requests/${r.id}/pay/verify`, { method: 'POST', body: response });
            setRows((rs) => rs.map((x) => (x.id === r.id ? updated : x)));
            toast.success('Payment received. We will be in touch to confirm final logistics.', { title: 'Payment successful' });
          } catch (e) { toast.error(e.message); }
        },
        modal: { ondismiss: () => setPaying(null) },
      });
      rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'));
      rzp.open();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPaying(null);
    }
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
                      {r.trip_type === 'multi_leg' && r.legs?.length > 0 ? (
                        <div className="flex gap-3">
                          <span className="w-24 shrink-0 text-white/40">Legs</span>
                          <div className="space-y-1">
                            {r.legs.map((leg, li) => (
                              <div key={li}>{leg.origin} <span className="text-gold">→</span> {leg.destination} <span className="text-white/40">· {fmtDate(leg.depart_date)}{leg.depart_time && ` ${leg.depart_time}`}</span></div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <Row k="Departure" v={`${fmtDate(r.depart_date)} ${r.depart_time || ''}`} />
                          {r.return_date && <Row k="Return" v={fmtDate(r.return_date)} />}
                        </>
                      )}
                      <Row k="Aircraft" v={r.aircraft_pref || 'No preference'} />
                      {r.contact_phone && <Row k="Contact" v={r.contact_phone} />}
                      {r.passenger_manifest?.length > 0 && (
                        <div className="flex gap-3">
                          <span className="w-24 shrink-0 text-white/40">Passengers</span>
                          <div>{r.passenger_manifest.map((p) => p.name).join(', ')}</div>
                        </div>
                      )}
                      {r.notes && <Row k="Notes" v={r.notes} />}
                      {r.quote_amount != null && (
                        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs uppercase tracking-widest text-gold">Your quote</div>
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${PAYMENT_STATUS[r.payment?.status || 'unpaid'].cls}`}>{PAYMENT_STATUS[r.payment?.status || 'unpaid'].label}</span>
                          </div>
                          <div className="gold-text font-display text-3xl">{fmtMoney(r.quote_amount, r.quote_currency)}</div>
                          {r.quote_aircraft && <div className="text-white/70">{r.quote_aircraft}</div>}
                          {r.admin_note && <p className="mt-2 text-white/60">{r.admin_note}</p>}
                          {['quoted', 'confirmed'].includes(r.status) && r.payment?.status !== 'paid' && (
                            <button onClick={() => pay(r)} disabled={paying === r.id} className="btn-gold mt-4 w-full !py-2.5 text-sm">
                              {paying === r.id ? 'Opening payment...' : `Pay ${fmtMoney(r.quote_amount, r.quote_currency)}`}
                            </button>
                          )}
                        </div>
                      )}
                      {['submitted', 'under_review', 'quoted'].includes(r.status) && (
                        <button onClick={() => setPendingCancel(r)} className="text-sm text-rose-300 hover:underline">Cancel request</button>
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

      <ConfirmDialog
        open={!!pendingCancel}
        title="Cancel this request?"
        message={pendingCancel ? `${pendingCancel.origin} → ${pendingCancel.destination} (${pendingCancel.ref}) will be cancelled. This cannot be undone.` : ''}
        confirmLabel="Cancel request"
        onConfirm={() => cancel(pendingCancel.id)}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  );
}

const Row = ({ k, v }) => <div className="flex gap-3"><span className="w-24 shrink-0 text-white/40">{k}</span><span className="capitalize-first break-words">{v}</span></div>;
