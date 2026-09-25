import { Link } from 'react-router-dom';
import { FLEET } from '../data/content';
import { Reveal, AircraftIcon, SpotCard, Magnetic, SplitText } from '../components/ui';

export default function Fleet() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Reveal className="mb-16 max-w-2xl">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">Our Fleet</p>
        <h1 className="font-display text-5xl font-semibold sm:text-7xl"><SplitText text="Aircraft," immediate delay={0.5} className="block" /><SplitText text="curated." immediate delay={0.7} wordClass="gold-text" className="block" /></h1>
        <p className="mt-5 text-white/60">We are aircraft-agnostic. We source the best-fit operator and cabin for your trip, not the one we own.</p>
      </Reveal>
      <div className="space-y-6">
        {FLEET.map((f) => (
          <Reveal key={f.id} delay={0.05}>
            <SpotCard className="group grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[220px_1fr_auto]">
              <AircraftIcon kind={f.kind} className="h-14 w-auto text-gold transition-transform duration-700 ease-out group-hover:translate-x-4" />
              <div>
                <h2 className="font-display text-3xl font-semibold">{f.name}</h2>
                <p className="mt-1 text-sm text-gold/80">{f.example}</p>
                <p className="mt-3 max-w-xl text-sm text-white/60">{f.blurb}</p>
              </div>
              <dl className="grid grid-cols-3 gap-6 text-center md:text-right">
                {[['Seats', f.seats], ['Range', f.range], ['Speed', f.speed]].map(([k, v]) => (
                  <div key={k}><dt className="text-[10px] uppercase tracking-widest text-white/40">{k}</dt><dd className="mt-1 text-sm">{v}</dd></div>
                ))}
              </dl>
            </SpotCard>
          </Reveal>
        ))}
      </div>
      <div className="mt-16 text-center">
        <Magnetic><Link to="/request" className="btn-gold">Request a Quote</Link></Magnetic>
      </div>
    </div>
  );
}
