import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MapPin } from "lucide-react";

export type MapaData = {
  coupleNames: string;
  startDate: string;
  personA: { name: string; city: string; lat?: number; lng?: number };
  personB: { name: string; city: string; lat?: number; lng?: number };
  photo?: string;
  message: string;
  themeColor?: string; // hex
  finalMessage?: string;
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function diff(start: Date) {
  const now = new Date();
  let s = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));
  const years = Math.floor(s / (365.25 * 24 * 3600)); s -= years * 365.25 * 24 * 3600;
  const months = Math.floor(s / (30.44 * 24 * 3600)); s -= months * 30.44 * 24 * 3600;
  const days = Math.floor(s / 86400); s -= days * 86400;
  const hours = Math.floor(s / 3600); s -= hours * 3600;
  const minutes = Math.floor(s / 60); s -= minutes * 60;
  return { years, months: Math.floor(months), days, hours, minutes, seconds: Math.floor(s) };
}

// Equirectangular projection into a 800x400 viewBox
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 800;
  const y = ((90 - lat) / 180) * 400;
  return { x, y };
}

export function MapaGift({ data, title }: { data: MapaData; title: string }) {
  const theme = data.themeColor || "#f47975";
  const start = new Date(data.startDate || new Date().toISOString());
  const [t, setT] = useState(() => diff(start));
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setT(diff(start)), 1000);
    return () => clearInterval(i);
  }, [data.startDate]);

  const a = data.personA;
  const b = data.personB;
  const hasCoords =
    typeof a?.lat === "number" && typeof a?.lng === "number" &&
    typeof b?.lat === "number" && typeof b?.lng === "number";

  const distanceKm = useMemo(
    () => (hasCoords ? haversineKm(a as any, b as any) : 0),
    [hasCoords, a, b],
  );

  const { pA, pB, pathD } = useMemo(() => {
    if (!hasCoords) return { pA: { x: 250, y: 200 }, pB: { x: 550, y: 200 }, pathD: "" };
    const pA = project(a!.lat!, a!.lng!);
    const pB = project(b!.lat!, b!.lng!);
    // heart-arched curve: two control points pulled up
    const mx = (pA.x + pB.x) / 2;
    const my = (pA.y + pB.y) / 2;
    const dx = pB.x - pA.x;
    const lift = Math.max(60, Math.abs(dx) * 0.35);
    const c1x = pA.x + (mx - pA.x) * 0.4;
    const c2x = pB.x - (pB.x - mx) * 0.4;
    const c1y = my - lift;
    const c2y = my - lift;
    const pathD = `M ${pA.x} ${pA.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${pB.x} ${pB.y}`;
    return { pA, pB, pathD };
  }, [hasCoords, a, b]);

  return (
    <div
      className="relative min-h-screen overflow-hidden text-cream"
      style={{
        background: `radial-gradient(ellipse at top, ${theme}33, transparent 60%), linear-gradient(180deg, #1a0f2e 0%, #2b1747 50%, #0b0617 100%)`,
      }}
    >
      {/* Stars */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              opacity: 0.6,
            }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.05 }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-4xl px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: theme }}>
            Mapa do amor
          </p>
          <h1 className="mt-3 font-display text-5xl">{title || data.coupleNames}</h1>
          {data.coupleNames && (
            <p className="mt-1 text-cream/70 font-display text-2xl italic">{data.coupleNames}</p>
          )}
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-black/30 backdrop-blur shadow-romance"
        >
          <svg viewBox="0 0 800 400" className="block w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="lineGrad" x1="0" x2="1">
                <stop offset="0%" stopColor={theme} />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor={theme} />
              </linearGradient>
              <radialGradient id="pinGlow">
                <stop offset="0%" stopColor={theme} stopOpacity="0.7" />
                <stop offset="100%" stopColor={theme} stopOpacity="0" />
              </radialGradient>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="800" height="400" fill="url(#grid)" />
            {/* Stylized continents (simple blobs) */}
            <g fill="white" fillOpacity="0.08">
              <ellipse cx="180" cy="170" rx="90" ry="55" />
              <ellipse cx="200" cy="290" rx="55" ry="80" />
              <ellipse cx="420" cy="170" rx="70" ry="50" />
              <ellipse cx="470" cy="280" rx="45" ry="60" />
              <ellipse cx="600" cy="180" rx="100" ry="70" />
              <ellipse cx="650" cy="310" rx="50" ry="35" />
            </g>

            {hasCoords && (
              <>
                {/* Glow pulses */}
                <circle cx={pA.x} cy={pA.y} r="30" fill="url(#pinGlow)">
                  <animate attributeName="r" values="20;45;20" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx={pB.x} cy={pB.y} r="30" fill="url(#pinGlow)">
                  <animate attributeName="r" values="20;45;20" dur="2.5s" repeatCount="indefinite" />
                </circle>
                {/* Animated path */}
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.5, delay: 0.8, ease: "easeInOut" }}
                />
                {/* Pins */}
                {[{ p: pA, who: a }, { p: pB, who: b }].map((it, i) => (
                  <g key={i}>
                    <circle cx={it.p.x} cy={it.p.y} r="6" fill={theme} stroke="white" strokeWidth="2" />
                    <text
                      x={it.p.x}
                      y={it.p.y - 14}
                      textAnchor="middle"
                      fill="white"
                      fontSize="13"
                      fontFamily="DM Serif Display, serif"
                    >
                      {it.who?.name}
                    </text>
                    <text
                      x={it.p.x}
                      y={it.p.y + 20}
                      textAnchor="middle"
                      fill="white"
                      fillOpacity="0.7"
                      fontSize="10"
                    >
                      {it.who?.city}
                    </text>
                  </g>
                ))}
              </>
            )}
          </svg>

          {hasCoords ? (
            <div className="border-t border-white/10 px-6 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-cream/60">Distância entre nós</p>
              <p className="mt-1 font-display text-3xl" style={{ color: theme }}>
                {Math.round(distanceKm).toLocaleString("pt-BR")} km
              </p>
            </div>
          ) : (
            <div className="border-t border-white/10 px-6 py-4 text-center text-sm text-cream/60">
              Preencha as cidades para calcular a distância.
            </div>
          )}
        </motion.div>

        {/* Couple photo */}
        {data.photo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mx-auto mt-8 max-w-sm"
          >
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-romance">
              <img src={data.photo} alt="" className="block aspect-square w-full object-cover" />
            </div>
          </motion.div>
        )}

        {/* Counter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10">
          <p className="text-center text-sm uppercase tracking-widest" style={{ color: theme }}>
            Estamos juntos há
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              { v: t.years, l: "anos" },
              { v: t.months, l: "meses" },
              { v: t.days, l: "dias" },
              { v: t.hours, l: "h" },
              { v: t.minutes, l: "min" },
              { v: t.seconds, l: "seg" },
            ].map((b) => (
              <div key={b.l} className="rounded-2xl bg-white/5 p-3 text-center backdrop-blur">
                <p className="font-display text-2xl tabular-nums">{b.v}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-cream/60">{b.l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dynamic romantic message */}
        {data.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mx-auto mt-10 max-w-xl text-center font-display text-2xl italic text-cream/90"
          >
            "{hasCoords
              ? data.message.replace(/\{km\}/g, Math.round(distanceKm).toLocaleString("pt-BR"))
              : data.message}"
          </motion.p>
        )}

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-3xl p-10 text-center shadow-romance"
          style={{ background: `linear-gradient(135deg, ${theme}, #8c54a3)` }}
        >
          <Heart className="mx-auto h-8 w-8 fill-white text-white animate-heartbeat" />
          <p className="mt-4 font-display text-2xl italic">
            "Cada quilômetro entre nós é apenas uma prova de que nosso amor é forte o suficiente para superar qualquer distância."
          </p>
          <button
            onClick={() => setShowHearts(true)}
            className="mt-8 rounded-full bg-white px-8 py-3 font-medium text-plum shadow-romance transition hover:scale-105"
          >
            ❤️ Eu Te Amo
          </button>
        </motion.div>

        <div className="py-10 text-center text-xs text-cream/40">Love Link</div>
      </div>

      {/* Heart rain overlay */}
      <AnimatePresence>
        {showHearts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur"
            onClick={() => setShowHearts(false)}
          >
            {Array.from({ length: 80 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ x: `${(i * 53) % 100}%`, y: "-10%", opacity: 0 }}
                animate={{ y: "110%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 3 + (i % 4), delay: (i % 10) * 0.1, repeat: Infinity }}
                style={{ left: `${(i * 13) % 100}%` }}
              >
                <Heart
                  className="fill-current"
                  style={{ color: theme, width: 12 + (i % 5) * 6, height: 12 + (i % 5) * 6 }}
                />
              </motion.div>
            ))}
            <div className="relative z-10 mx-5 max-w-lg rounded-3xl bg-white/10 p-8 text-center backdrop-blur-xl">
              <Heart className="mx-auto h-10 w-10 fill-current animate-heartbeat" style={{ color: theme }} />
              <p className="mt-4 font-display text-3xl text-white">
                {data.finalMessage || "Eu te amo, infinitamente."}
              </p>
              <button
                onClick={() => setShowHearts(false)}
                className="mt-6 rounded-full bg-white/20 px-6 py-2 text-sm text-white hover:bg-white/30"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
