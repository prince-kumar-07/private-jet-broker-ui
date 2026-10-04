import { Link, useLocation } from 'react-router-dom';
import { APP_NAME } from '../config';

const PAGES = [
  ['/terms', 'Terms of Service'],
  ['/privacy', 'Privacy Policy'],
  ['/cancellation-policy', 'Cancellation Policy'],
];

function LegalShell({ title, updated, children }) {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Legal</p>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mt-2 text-sm text-white/45">Last updated {updated}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {PAGES.map(([to, label]) => (
          <Link key={to} to={to} className={`rounded-full border px-4 py-1.5 text-xs ${pathname === to ? 'border-gold/50 bg-gold/10 text-gold' : 'border-white/15 text-white/60 hover:text-white'}`}>{label}</Link>
        ))}
      </div>

      <div className="prose-legal mt-10 space-y-6 text-sm leading-relaxed text-white/70">{children}</div>
    </div>
  );
}

const H2 = ({ children }) => <h2 className="pt-2 font-display text-xl text-white">{children}</h2>;

export function Terms() {
  return (
    <LegalShell title="Terms of Service" updated="27 September 2026">
      <p>These Terms govern your use of {APP_NAME} ("we", "us") as a private jet charter brokerage. By requesting a quote, booking a flight, or otherwise using our services, you agree to these Terms.</p>

      <H2>1. Our role as a broker</H2>
      <p>{APP_NAME} is aircraft-agnostic: we do not own or operate aircraft. We arrange charter flights on your behalf with FAA/DGCA-licensed (or equivalent) operators. The operator performing your flight is responsible for the safe operation of the aircraft; we are responsible for sourcing, quoting, and coordinating your trip.</p>

      <H2>2. Requests and quotes</H2>
      <p>Submitting a flight request does not guarantee availability or a fixed price. A quote is valid only for the period stated when it is issued and is subject to aircraft and slot availability at the time of confirmation.</p>

      <H2>3. Payment</H2>
      <p>Where online payment is offered, full or deposit payment may be required to confirm a booking. Prices are quoted in the currency shown and are inclusive of brokerage fees unless stated otherwise. Additional charges (de-icing, overnight crew fees, permits, catering beyond what was quoted) may apply and will be communicated before they are incurred where possible.</p>

      <H2>4. Cancellations</H2>
      <p>Cancellation terms depend on how close to departure a booking is cancelled. See our <Link to="/cancellation-policy" className="text-gold hover:underline">Cancellation Policy</Link> for details.</p>

      <H2>5. Passenger conduct and documentation</H2>
      <p>You are responsible for ensuring all passengers hold valid travel documents (passports, visas, permits for pets or firearms) required for the trip. We are not liable for denied boarding or travel due to missing or invalid documentation.</p>

      <H2>6. Limitation of liability</H2>
      <p>To the maximum extent permitted by law, {APP_NAME}'s liability is limited to the brokerage fee paid for the affected booking. We are not liable for indirect or consequential losses, including missed connections or events.</p>

      <H2>7. Changes to these terms</H2>
      <p>We may update these Terms from time to time. Continued use of our services after a change constitutes acceptance of the revised Terms.</p>

      <H2>8. Contact</H2>
      <p>Questions about these Terms can be sent through our <Link to="/contact" className="text-gold hover:underline">Contact page</Link>.</p>
    </LegalShell>
  );
}

export function Privacy() {
  return (
    <LegalShell title="Privacy Policy" updated="27 September 2026">
      <p>This Privacy Policy explains what personal data {APP_NAME} collects, why, and how it is handled.</p>

      <H2>1. What we collect</H2>
      <p>Account details (name, email, phone), flight request and booking details (itinerary, passenger counts, and where provided, passenger names and travel document numbers for manifest purposes), and messages you send us through enquiry or contact forms.</p>

      <H2>2. How we use it</H2>
      <p>To provide quotes, arrange and confirm charter flights, process payments, comply with aviation security and customs requirements, and to send you service emails (booking confirmations, status updates, receipts). We do not sell your personal data.</p>

      <H2>3. Sharing</H2>
      <p>We share the minimum necessary booking and passenger details with the operator flying your trip, and payment details with our payment processor, solely to fulfil your booking. We may disclose data where required by law or aviation security authorities.</p>

      <H2>4. Data retention</H2>
      <p>We retain booking records as required for accounting, legal, and aviation regulatory purposes. You may request deletion of your account data that is not otherwise required to be retained.</p>

      <H2>5. Your rights</H2>
      <p>You may request access to, correction of, or deletion of your personal data by contacting us through our <Link to="/contact" className="text-gold hover:underline">Contact page</Link>.</p>

      <H2>6. Security</H2>
      <p>We use industry-standard measures (encrypted connections, hashed passwords) to protect your data, but no online service can be guaranteed 100% secure.</p>
    </LegalShell>
  );
}

export function CancellationPolicy() {
  return (
    <LegalShell title="Cancellation Policy" updated="27 September 2026">
      <p>Because charter aircraft and crew are reserved specifically for your trip, cancellation fees generally increase the closer to departure a cancellation is made. Exact terms are set out in your individual quote and may vary by operator and aircraft type; the guidance below applies where your quote does not state otherwise.</p>

      <H2>Flight requests (unconfirmed)</H2>
      <p>A request that has not yet been confirmed and paid for can be cancelled at any time from your dashboard at no charge.</p>

      <H2>Confirmed and paid bookings</H2>
      <ul className="list-disc space-y-2 pl-5">
        <li>More than 7 days before departure: full refund, less any non-refundable third-party costs already incurred (e.g. permits).</li>
        <li>72 hours to 7 days before departure: 50% of the quoted amount is refundable.</li>
        <li>Within 72 hours of departure: generally non-refundable, as the aircraft and crew are already committed.</li>
      </ul>

      <H2>Empty leg bookings</H2>
      <p>Empty leg seats are offered at a reduced price precisely because the flight is already scheduled to fly; empty leg bookings are non-refundable once confirmed, though we will make reasonable efforts to accommodate changes where possible.</p>

      <H2>Operator-initiated changes</H2>
      <p>If an operator cancels or substantially changes a confirmed flight (e.g. for maintenance or safety reasons), we will offer a full refund or, where possible, source a comparable alternative aircraft at no additional cost.</p>

      <p>To cancel a request, use the "Cancel request" option on your <Link to="/my-requests" className="text-gold hover:underline">My Requests</Link> page, or contact us directly for confirmed bookings.</p>
    </LegalShell>
  );
}
