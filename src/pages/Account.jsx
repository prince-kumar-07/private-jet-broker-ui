import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';

export default function Account() {
  const { user, changePassword } = useAuth();
  const toast = useToast();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const f = new FormData(e.target);
    const newPassword = f.get('newPassword');
    if (newPassword !== f.get('confirm')) { setError('New passwords do not match'); setBusy(false); return; }
    try {
      await changePassword(f.get('currentPassword'), newPassword);
      toast.success('Your password has been changed', { title: 'Account updated' });
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">My Account</h1>

      <div className="card mt-8 grid gap-4 p-6 text-sm sm:grid-cols-2 sm:p-8">
        <div><div className="text-[11px] uppercase tracking-widest text-white/40">Name</div><div className="mt-1">{user?.name}</div></div>
        <div><div className="text-[11px] uppercase tracking-widest text-white/40">Email</div><div className="mt-1">{user?.email}</div></div>
        <div><div className="text-[11px] uppercase tracking-widest text-white/40">Phone</div><div className="mt-1">{user?.phone || '-'}</div></div>
      </div>

      <form onSubmit={submit} className="card mt-6 space-y-5 p-6 sm:p-8">
        <h2 className="font-display text-2xl">Change password</h2>
        <div><label className="label" htmlFor="currentPassword">Current password</label><input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className="field" /></div>
        <div><label className="label" htmlFor="newPassword">New password (8+ characters)</label><input id="newPassword" name="newPassword" type="password" minLength={8} required autoComplete="new-password" className="field" /></div>
        <div><label className="label" htmlFor="confirm">Confirm new password</label><input id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" className="field" /></div>
        {error && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        <button className="btn-gold w-full sm:w-auto" disabled={busy}>{busy ? 'Saving...' : 'Update password'}</button>
      </form>
    </div>
  );
}
