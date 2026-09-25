import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useToast } from './Toast';
import PhoneInput, { isValidPhone } from './PhoneInput';

const TOPICS = [['general', 'General question'], ['pricing', 'Pricing and quotes'], ['fleet', 'Aircraft and fleet'], ['partnership', 'Partnership or operators'], ['other', 'Something else']];

export default function EnquiryForm() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const f = new FormData(e.target);
    if (!isValidPhone(f.get('phone'))) return setError('Enter a valid phone number for the selected country');
    setBusy(true);
    try {
      await api('/public/enquiries', {
        method: 'POST',
        body: { name: f.get('name'), email: f.get('email'), phone: f.get('phone'), topic: f.get('topic'), message: f.get('message'), website: f.get('website') },
      });
      toast.success('We will reply by email or phone shortly.', { title: 'Message sent' });
      setDone(true);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="card p-8 text-center sm:p-12">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
        </span>
        <h3 className="mt-5 font-display text-3xl font-semibold">Thank you</h3>
        <p className="mt-2 text-white/60">Your message is with our team. We will get back to you shortly.</p>
        <button onClick={() => setDone(false)} className="btn-ghost mt-6">Send another message</button>
      </div>
    );
  }

  return (
    <motion.form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="q-name">Your name</label><input id="q-name" name="name" required minLength={2} autoComplete="name" className="field" /></div>
        <div><label className="label" htmlFor="q-email">Email</label><input id="q-email" name="email" type="email" required autoComplete="email" className="field" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="q-phone">Phone</label><PhoneInput id="q-phone" name="phone" required /></div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="q-topic">Topic</label>
          <select id="q-topic" name="topic" className="field">{TOPICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </div>
      </div>
      <div><label className="label" htmlFor="q-message">Your question</label><textarea id="q-message" name="message" required minLength={10} maxLength={3000} rows={5} className="field resize-y" placeholder="How can we help?" /></div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      {error && <p role="alert" className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
      <button className="btn-gold w-full" disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button>
    </motion.form>
  );
}
