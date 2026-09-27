import { Reveal, SplitText } from '../components/ui';
import EnquiryForm from '../components/EnquiryForm';
import { CONTACT_EMAIL, CONTACT_PHONE } from '../config';

export function ContactDetails() {
  if (!CONTACT_EMAIL && !CONTACT_PHONE) return null;
  return (
    <div className="mt-8 space-y-2 text-sm">
      {CONTACT_PHONE && <p><span className="text-white/40">Call </span><a className="text-gold hover:underline" href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}>{CONTACT_PHONE}</a></p>}
      {CONTACT_EMAIL && <p><span className="text-white/40">Email </span><a className="text-gold hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>}
    </div>
  );
}

export default function Contact() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 pt-32 sm:px-8 sm:pt-40 md:grid-cols-[1fr_1.2fr]">
      <div>
        <Reveal y={16}><p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">Get in touch</p></Reveal>
        <h1 className="font-display text-5xl font-semibold sm:text-6xl"><SplitText text="Ask us" immediate delay={0.4} className="block" /><SplitText text="anything." immediate delay={0.55} wordClass="gold-text" className="block" /></h1>
        <Reveal delay={0.3}><p className="mt-5 max-w-md text-white/60">Questions about pricing, aircraft, helicopters or how charter works? Send us a message. No account needed.</p></Reveal>
        <ContactDetails />
      </div>
      <Reveal delay={0.2}><EnquiryForm /></Reveal>
    </div>
  );
}
