import { useEffect, useRef, useState } from 'react';

const FADE_MS = 1400;

// Plays the given clips one after another with a crossfade. Two <video> elements alternate:
// while one plays, the other preloads the next clip so the swap is seamless.
export default function HeroVideo({ clips, onReady }) {
  const n = clips.length;
  const [{ slot, idx }, setState] = useState({ slot: 0, idx: 0 });
  const refs = [useRef(null), useRef(null)];
  const readyFired = useRef(false);

  const srcFor = (s) => (s === slot ? clips[idx] : clips[(idx + 1) % n]);

  useEffect(() => {
    const active = refs[slot].current;
    active?.play().catch(() => {});
    if (n < 2) return;
    const other = refs[1 - slot].current;
    const t = setTimeout(() => other?.pause(), FADE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot, idx]);

  const onEnded = () => {
    if (n < 2) return;
    const next = refs[1 - slot].current;
    if (next) next.currentTime = 0;
    setState({ slot: 1 - slot, idx: (idx + 1) % n });
  };

  const fireReady = () => { if (!readyFired.current) { readyFired.current = true; onReady?.(); } };

  return (
    <>
      {[0, 1].map((s) => (
        <video
          key={s}
          ref={refs[s]}
          src={srcFor(s)}
          muted
          playsInline
          autoPlay={s === 0}
          loop={n < 2}
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={s === slot ? fireReady : undefined}
          onEnded={s === slot ? onEnded : undefined}
          onError={s === slot ? onEnded : undefined}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: s === slot ? 1 : 0, transition: `opacity ${FADE_MS}ms ease`, filter: 'saturate(.92) brightness(.9) contrast(1.05)' }}
        />
      ))}
    </>
  );
}
