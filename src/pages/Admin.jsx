import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { STATUS } from '../data/content';
import { StatusBadge, Spinner, fmtDate, fmtMoney } from '../components/ui';
import Timeline from '../components/Timeline';

export function AdminDashboard() {
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('requests');
  const [enquiries, setEnquiries] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (tab === 'enquiries') api('/admin/enquiries').then(setEnquiries).catch((e) => setError(e.message));
  }, [tab]);

  const toggleEnquiry = async (en) => {
    try {
      const updated = await api(`/admin/enquiries/${en.id}`, { method: 'PATCH', body: { status: en.status === 'new' ? 'handled' : 'new' } });
      setEnquiries((l) => l.map((x) => (x.id === en.id ? updated : x)));
      api('/admin/stats').then(setStats).catch(() => {});
    } catch (e) { toast.error(e.message); }
  };

  useEffect(() => { api('/admin/stats').then(setStats).catch((e) => setError(e.message)); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ ...(status && { status }), ...(q && { q }) });
      api(`/admin/requests?${qs}`).then(setRows).catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [status, q]);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Admin <span className="gold-text">Dashboard</span></h1>

      <div role="tablist" className="mt-8 inline-grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
        {[['requests', 'Flight requests'], ['enquiries', 'General enquiries']].map(([v, l]) => (
          <button key={v} role="tab" aria-selected={tab === v} onClick={() => setTab(v)}
            className={`relative min-h-[44px] rounded-lg px-4 text-sm transition-colors ${tab === v ? 'bg-gold font-medium text-black' : 'text-white/70 hover:text-white'}`}>
            {l}{v === 'enquiries' && stats?.newEnquiries > 0 && <span className="ml-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">{stats.newEnquiries}</span>}
          </button>
        ))}
      </div>

      {tab === 'enquiries' ? (
        <div className="mt-8">
          {error && <p role="alert" className="text-rose-300">{error}</p>}
          {!enquiries && !error && <Spinner />}
          {enquiries?.length === 0 && <div className="card p-10 text-center text-white/60">No enquiries yet.</div>}
          <div className="space-y-4">
            {enquiries?.map((en) => (
              <div key={en.id} className={`card p-5 sm:p-6 ${en.status === 'new' ? '!border-gold/40' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-2xl">{en.name}</div>
                    <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <a className="text-gold hover:underline" href={`mailto:${en.email}`}>{en.email}</a>
                      <a className="text-gold hover:underline" href={`tel:${en.phone}`}>{en.phone}</a>
                    </div>
                  </div>
                  <div className="text-right text-xs text-white/45">
                    <div className="uppercase tracking-widest">{en.topic}</div>
                    <div className="mt-1">{fmtDate(en.created_at)}</div>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap break-words text-sm text-white/75">{en.message}</p>
                <button onClick={() => toggleEnquiry(en)} className={`mt-4 rounded-full border px-4 py-1.5 text-xs ${en.status === 'new' ? 'border-gold/50 text-gold hover:bg-gold/10' : 'border-emerald-400/30 text-emerald-300'}`}>
                  {en.status === 'new' ? 'Mark as handled' : 'Handled (undo)'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
      <>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {Object.entries(STATUS).map(([k, s], i) => (
          <motion.button key={k} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setStatus(status === k ? '' : k)}
            className={`card p-4 text-left transition-colors ${status === k ? '!border-gold' : 'hover:border-white/25'}`}>
            <div className="font-display text-3xl">{stats?.counts[k] ?? '-'}</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">{s.label}</div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ref, route, customer..." className="field max-w-md" aria-label="Search requests" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field max-w-[200px]" aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
      </div>

      {error && <p role="alert" className="mt-6 text-rose-300">{error}</p>}
      {!rows && !error && <div className="mt-10"><Spinner /></div>}

      {rows && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-widest text-white/45">
              <tr><th className="p-4">Ref</th><th className="p-4">Customer</th><th className="p-4">Route</th><th className="p-4">Date</th><th className="p-4">Pax</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} onClick={() => nav(`/admin/requests/${r.id}`)} className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5">
                  <td className="p-4 font-mono text-xs text-gold">{r.ref}{r.source === 'guest' && <span className="ml-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 font-sans text-[10px] text-sky-300">Guest</span>}</td>
                  <td className="p-4">{r.customer_name}<div className="text-xs text-white/40">{r.customer_email}</div></td>
                  <td className="p-4">{r.origin} → {r.destination}</td>
                  <td className="p-4 whitespace-nowrap">{fmtDate(r.depart_date)}</td>
                  <td className="p-4">{r.passengers}</td>
                  <td className="p-4"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-white/50">No requests found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export function AdminRequest() {
  const { id } = useParams();
  const toast = useToast();
  const [r, setR] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const hydrate = useCallback((d) => {
    setR(d);
    setForm({ status: d.status, quote_amount: d.quote_amount ?? '', quote_currency: d.quote_currency || 'USD', quote_aircraft: d.quote_aircraft || '', admin_note: d.admin_note || '' });
  }, []);
  useEffect(() => { api(`/admin/requests/${id}`).then(hydrate).catch((e) => setError(e.message)); }, [id, hydrate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    setError(''); setSaved(false); setBusy(true);
    try { hydrate(await api(`/admin/requests/${id}`, { method: 'PATCH', body: form })); setSaved(true); toast.success('Changes saved', { title: 'Request updated' }); }
    catch (err) { setError(err.message); toast.error(err.message); }
    finally { setBusy(false); }
  };

  if (!r) return <div className="pt-40">{error ? <p className="text-center text-rose-300">{error}</p> : <Spinner />}</div>;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <Link to="/admin" className="text-sm text-gold hover:underline">← All requests</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold sm:text-5xl">{r.origin} <span className="text-gold">→</span> {r.destination}</h1>
        <StatusBadge status={r.status} />
      </div>
      <p className="mt-2 font-mono text-xs text-white/45">{r.ref}</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="card grid gap-4 p-6 text-sm sm:grid-cols-2">
            <Info k="Customer" v={r.customer_name} />
            <Info k="Source" v={r.source === 'guest' ? 'Guest, no account' : 'Registered account'} />
            <Info k="Email" v={<a className="text-gold" href={`mailto:${r.customer_email}`}>{r.customer_email}</a>} />
            <Info k="Contact phone" v={(r.contact_phone || r.customer_phone) ? <a className="text-gold" href={`tel:${r.contact_phone || r.customer_phone}`}>{r.contact_phone || r.customer_phone}</a> : '-'} />
            {r.customer_phone && r.contact_phone && r.customer_phone !== r.contact_phone && <Info k="Account phone" v={<a className="text-gold" href={`tel:${r.customer_phone}`}>{r.customer_phone}</a>} />}
            <Info k="Trip type" v={r.trip_type.replace('_', ' ')} />
            <Info k="Departure" v={`${fmtDate(r.depart_date)} ${r.depart_time || ''}`} />
            <Info k="Return" v={fmtDate(r.return_date)} />
            <Info k="Passengers" v={r.passengers} />
            <Info k="Aircraft pref." v={r.aircraft_pref || 'None'} />
            <Info k="Luggage" v={r.luggage || '-'} />
            <Info k="Pets" v={r.pets ? 'Yes' : 'No'} />
            {r.notes && <div className="sm:col-span-2"><Info k="Notes" v={r.notes} /></div>}
          </div>
          <div className="card p-6"><h2 className="mb-5 font-display text-2xl">History</h2><Timeline history={r.history} /></div>
        </div>

        <form onSubmit={save} className="card h-fit space-y-5 p-6">
          <h2 className="font-display text-2xl">Update request</h2>
          <div><label className="label" htmlFor="st">Status</label>
            <select id="st" value={form.status} onChange={set('status')} className="field">{Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}</select></div>
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div><label className="label" htmlFor="qa">Quote amount</label><input id="qa" type="number" min="0" step="any" value={form.quote_amount} onChange={set('quote_amount')} className="field" /></div>
            <div><label className="label" htmlFor="qc">Currency</label>
              <select id="qc" value={form.quote_currency} onChange={set('quote_currency')} className="field">{['USD', 'EUR', 'GBP', 'INR', 'AED'].map((c) => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="label" htmlFor="qj">Quoted aircraft</label><input id="qj" value={form.quote_aircraft} onChange={set('quote_aircraft')} placeholder="e.g. Gulfstream G550" className="field" /></div>
          <div><label className="label" htmlFor="an">Note to customer</label><textarea id="an" rows={4} value={form.admin_note} onChange={set('admin_note')} className="field" /></div>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          {saved && <p className="text-sm text-emerald-300">Saved.</p>}
          <button className="btn-gold w-full" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
          {r.quote_amount != null && <p className="text-center text-xs text-white/40">Current quote: {fmtMoney(r.quote_amount, r.quote_currency)}</p>}
        </form>
      </div>
    </div>
  );
}

const Info = ({ k, v }) => <div><div className="text-[11px] uppercase tracking-widest text-white/40">{k}</div><div className="mt-1 break-words">{v}</div></div>;
