import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../lib/api';
import { Reveal, Spinner } from '../components/ui';

const M_TO_FT = 3.28084;
const MS_TO_KT = 1.94384;
const MS_TO_FPM = 196.85;

const MODES = [['tail', 'Tail number'], ['flight', 'Flight number']];

const planeIcon = (heading) => L.divIcon({
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  html: `<div style="transform:rotate(${(heading ?? 0) - 45}deg)" class="grid h-[30px] w-[30px] place-items-center rounded-full border border-gold/60 bg-navy/90 text-gold shadow-lg">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2.5 1.8V22l3.5-1 3.5 1v-1.2L13 19v-5.5z"/></svg>
  </div>`,
});

export default function TrackFlight() {
  const [mode, setMode] = useState('tail');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const switchMode = (m) => {
    if (m === mode) return;
    setMode(m); setQuery(''); setResult(null); setError(''); setSearched(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setBusy(true); setError(''); setSearched(true); setResult(null);
    try {
      const path = mode === 'flight' ? `/public/track/flight/${encodeURIComponent(q)}` : `/public/track/${encodeURIComponent(q)}`;
      setResult(await api(path));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">Live Position</p>
        <h1 className="font-display text-5xl font-semibold sm:text-6xl">Track a <span className="gold-text">Flight</span></h1>
        <p className="mt-4 text-white/60">{mode === 'flight' ? "Enter a scheduled flight's number to see its route and, if it's airborne, live position." : "Enter an aircraft's tail number to see its current position, if it's airborne and broadcasting."}</p>
      </Reveal>

      <div role="tablist" className="mx-auto mt-8 grid w-full max-w-xs grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
        {MODES.map(([v, l]) => (
          <button key={v} role="tab" aria-selected={mode === v} onClick={() => switchMode(v)}
            className={`min-h-[40px] rounded-lg px-2 text-sm transition-colors ${mode === v ? 'bg-gold font-medium text-black' : 'text-white/70 hover:text-white'}`}>
            {l}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === 'flight' ? 'e.g. AI 2933' : 'e.g. N123AB'}
          aria-label={mode === 'flight' ? 'Flight number' : 'Tail number'}
          maxLength={10}
          className="field flex-1 uppercase"
        />
        <button className="btn-gold !px-6" disabled={busy}>{busy ? 'Searching...' : 'Track'}</button>
      </form>

      <div className="mt-10">
        {busy && <div className="grid place-items-center py-10"><Spinner /></div>}
        {!busy && error && <p role="alert" className="text-center text-rose-300">{error}</p>}
        {!busy && !error && searched && result && (mode === 'flight' ? <FlightResult flight={result} /> : <AircraftResult aircraft={result} />)}
      </div>
    </div>
  );
}

function LiveMap({ position, label }) {
  const pos = [position.latitude, position.longitude];
  return (
    <div className="h-[420px] w-full">
      <MapContainer center={pos} zoom={8} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pos} icon={planeIcon(position.heading)}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

function AircraftResult({ aircraft }) {
  const altitudeFt = aircraft.baro_altitude != null ? Math.round(aircraft.baro_altitude * M_TO_FT) : null;
  const speedKt = aircraft.velocity != null ? Math.round(aircraft.velocity * MS_TO_KT) : null;
  const climbFpm = aircraft.vertical_rate != null ? Math.round(aircraft.vertical_rate * MS_TO_FPM) : null;
  const hasPos = aircraft.latitude != null && aircraft.longitude != null;

  return (
    <div className="card overflow-hidden">
      {hasPos
        ? <LiveMap position={{ latitude: aircraft.latitude, longitude: aircraft.longitude, heading: aircraft.true_track }} label={aircraft.callsign?.trim() || 'Aircraft'} />
        : <div className="grid h-[420px] place-items-center text-white/50">Position unavailable</div>}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 text-sm sm:grid-cols-4 sm:p-8">
        <Stat label="Callsign" value={aircraft.callsign?.trim() || '—'} />
        <Stat label="Origin country" value={aircraft.origin_country || '—'} />
        <Stat label="Altitude" value={altitudeFt != null ? `${altitudeFt.toLocaleString()} ft` : '—'} />
        <Stat label="Ground speed" value={speedKt != null ? `${speedKt} kt` : '—'} />
        <Stat label="Heading" value={aircraft.true_track != null ? `${Math.round(aircraft.true_track)}°` : '—'} />
        <Stat label="Vertical rate" value={climbFpm != null ? `${climbFpm > 0 ? '+' : ''}${climbFpm} ft/min` : '—'} />
        <Stat label="On ground" value={aircraft.on_ground ? 'Yes' : 'No'} />
        <Stat label="Last update" value={aircraft.last_contact ? new Date(aircraft.last_contact * 1000).toLocaleTimeString() : '—'} />
      </div>
    </div>
  );
}

const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : null);

function FlightResult({ flight }) {
  const hasPos = flight.position?.latitude != null && flight.position?.longitude != null;
  const dep = flight.departure || {};
  const arr = flight.arrival || {};

  return (
    <div className="card overflow-hidden">
      {hasPos && <LiveMap position={flight.position} label={flight.number || 'Flight'} />}
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-xs text-gold">{flight.number || '—'}{flight.airline && ` · ${flight.airline}`}</div>
            <div className="mt-1 font-display text-3xl font-semibold">
              {dep.airport?.iata || dep.airport?.city || '—'} <span className="text-gold">→</span> {arr.airport?.iata || arr.airport?.city || '—'}
            </div>
          </div>
          {flight.status && <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs uppercase tracking-widest text-gold">{flight.status}</span>}
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <AirportBlock label="Departs" airport={dep.airport} time={dep.actual || dep.scheduled} terminal={dep.terminal} gate={dep.gate} />
          <AirportBlock label="Arrives" airport={arr.airport} time={arr.actual || arr.scheduled} terminal={arr.terminal} gate={arr.gate} />
        </div>

        {flight.aircraft && <p className="mt-6 text-sm text-white/55">Aircraft <span className="text-white/85">{flight.aircraft}</span></p>}
        {!hasPos && <p className="mt-4 text-xs text-white/40">Live position isn't available for this flight right now.</p>}
      </div>
    </div>
  );
}

function AirportBlock({ label, airport, time, terminal, gate }) {
  const when = fmtTime(time);
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="mt-1 font-display text-xl">
        {airport?.city || airport?.name || '—'}{airport?.iata && <span className="text-gold"> ({airport.iata})</span>}
      </div>
      {when && <div className="mt-1 text-sm text-white/70">{when}</div>}
      {(terminal || gate) && (
        <div className="mt-1 text-xs text-white/45">{terminal && `Terminal ${terminal}`}{terminal && gate && ' · '}{gate && `Gate ${gate}`}</div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="mt-1 text-white/85">{value}</div>
    </div>
  );
}
