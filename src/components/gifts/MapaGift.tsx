import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MapPin, Plane, Sparkles } from "lucide-react";

export type MapaData = {
  coupleNames: string;
  startDate: string;
  personA: { name: string; city: string; country?: string; lat?: number; lng?: number };
  personB: { name: string; city: string; country?: string; lat?: number; lng?: number };
  photo?: string;
  message: string;
  themeColor?: string;
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

function midpoint(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const λ1 = toRad(a.lng), λ2 = toRad(b.lng);
  const Bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
  const By = Math.cos(φ2) * Math.sin(λ2 - λ1);
  const φ3 = Math.atan2(
    Math.sin(φ1) + Math.sin(φ2),
    Math.sqrt((Math.cos(φ1) + Bx) ** 2 + By ** 2),
  );
  const λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
  return { lat: toDeg(φ3), lng: toDeg(λ3) };
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

function GlobeStage({
  a,
  b,
  theme,
  onHover,
}: {
  a: { lat: number; lng: number; label: string; sub: string; whisper: string };
  b: { lat: number; lng: number; label: string; sub: string; whisper: string };
  theme: string;
  onHover: (p: null | { label: string; sub: string; whisper: string }) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let globe: any;
    let resizeObs: ResizeObserver | null = null;
    let particleTimer: any;

    (async () => {
      const GlobeMod = await import("globe.gl");
      const THREE = await import("three");
      if (disposed || !containerRef.current) return;

      const Globe = (GlobeMod as any).default;
      globe = Globe()(containerRef.current)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundColor("rgba(0,0,0,0)")
        .atmosphereColor(theme)
        .atmosphereAltitude(0.28)
        .showGraticules(false);

      globeRef.current = globe;

      // Heart-shaped HTML markers
      const heartHTML = (color: string, label: string) => `
        <div class="lovelink-pin" data-label="${label}">
          <svg viewBox="0 0 32 32" width="34" height="34" style="filter: drop-shadow(0 0 12px ${color}); transform: translate(-50%, -100%);">
            <defs>
              <radialGradient id="hg-${label.replace(/\W/g, "")}" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#fff7fa"/>
                <stop offset="55%" stop-color="${color}"/>
                <stop offset="100%" stop-color="#7a1430"/>
              </radialGradient>
            </defs>
            <path d="M16 28 C 6 20, 2 14, 6 8 C 9 4, 14 5, 16 9 C 18 5, 23 4, 26 8 C 30 14, 26 20, 16 28 Z"
              fill="url(#hg-${label.replace(/\W/g, "")})" stroke="#fff" stroke-width="0.8" stroke-opacity="0.7"/>
          </svg>
          <div style="position:absolute; left:50%; top:0; transform:translate(-50%,-160%); white-space:nowrap;
            font-family: 'DM Serif Display', serif; font-size: 13px; color:#fff;
            text-shadow: 0 2px 12px rgba(0,0,0,.8); letter-spacing:.04em;">
            ${label}
          </div>
        </div>`;

      globe
        .htmlElementsData([
          { lat: a.lat, lng: a.lng, label: a.label, sub: a.sub, whisper: a.whisper },
          { lat: b.lat, lng: b.lng, label: b.label, sub: b.sub, whisper: b.whisper },
        ])
        .htmlAltitude(0.012)
        .htmlElement((d: any) => {
          const el = document.createElement("div");
          el.style.pointerEvents = "auto";
          el.style.cursor = "pointer";
          el.innerHTML = heartHTML(theme, d.label);
          el.addEventListener("mouseenter", () => onHover({ label: d.label, sub: d.sub, whisper: d.whisper }));
          el.addEventListener("mouseleave", () => onHover(null));
          return el;
        });

      // Curved arc connecting the two locations
      globe
        .arcsData([{ startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng }])
        .arcColor(() => [`${theme}`, "#ffd6e2", `${theme}`])
        .arcStroke(0.7)
        .arcAltitudeAutoScale(0.55)
        .arcDashLength(0.35)
        .arcDashGap(0.15)
        .arcDashAnimateTime(4500);

      // Heart particles travelling along the arc as moving rings
      globe
        .ringsData([])
        .ringColor(() => (t: number) => `rgba(255, 180, 200, ${1 - t})`)
        .ringMaxRadius(2.2)
        .ringPropagationSpeed(2)
        .ringRepeatPeriod(900);

      const steps = 24;
      const interpPoints: Array<{ lat: number; lng: number }> = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        interpPoints.push({
          lat: a.lat + (b.lat - a.lat) * t,
          lng: a.lng + (b.lng - a.lng) * t,
        });
      }
      let idx = 0;
      particleTimer = setInterval(() => {
        const p = interpPoints[idx % interpPoints.length];
        globe.ringsData([{ lat: p.lat, lng: p.lng }]);
        idx++;
      }, 220);

      // Controls + cinematic intro
      const controls = globe.controls();
      controls.autoRotate = false;
      controls.enableZoom = true;
      controls.enablePan = false;

      const mid = midpoint(a, b);
      // Start far + spinning
      globe.pointOfView({ lat: 0, lng: a.lng, altitude: 4 }, 0);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.4;

      setTimeout(() => {
        if (disposed) return;
        controls.autoRotate = false;
        globe.pointOfView({ lat: mid.lat, lng: mid.lng, altitude: 2.4 }, 3500);
      }, 800);

      // Add starfield + soft pink lighting
      const scene = globe.scene();
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1200;
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const r = 600 + Math.random() * 400;
        const θ = Math.random() * Math.PI * 2;
        const φ = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(φ) * Math.cos(θ);
        positions[i * 3 + 1] = r * Math.sin(φ) * Math.sin(θ);
        positions[i * 3 + 2] = r * Math.cos(φ);
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xffe6f0,
        size: 1.6,
        transparent: true,
        opacity: 0.85,
      });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      const pinkLight = new THREE.PointLight(new THREE.Color(theme), 1.2, 1200);
      pinkLight.position.set(200, 100, 300);
      scene.add(pinkLight);
      const goldLight = new THREE.PointLight(0xffd27a, 0.8, 1200);
      goldLight.position.set(-300, -80, -200);
      scene.add(goldLight);

      // Sizing
      const resize = () => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;
        globe.width(clientWidth).height(clientHeight);
      };
      resize();
      resizeObs = new ResizeObserver(resize);
      resizeObs.observe(containerRef.current);

      setReady(true);
    })();

    return () => {
      disposed = true;
      if (particleTimer) clearInterval(particleTimer);
      if (resizeObs) resizeObs.disconnect();
      if (globe && containerRef.current) {
        try {
          globe._destructor?.();
        } catch {}
        containerRef.current.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.lat, a.lng, b.lat, b.lng, theme]);

  return (
    <div className="relative h-[60vh] min-h-[420px] w-full sm:h-[70vh]">
      <div ref={containerRef} className="absolute inset-0" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-cream/60">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 animate-pulse" style={{ color: theme }} />
            Preparando o globo do amor…
          </div>
        </div>
      )}
    </div>
  );
}

export function MapaGift({ data, title }: { data: MapaData; title: string }) {
  const theme = data.themeColor || "#f47975";
  const start = new Date(data.startDate || new Date().toISOString());
  const [t, setT] = useState(() => diff(start));
  const [hover, setHover] = useState<null | { label: string; sub: string; whisper: string }>(null);
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

  // Approx commercial flight time (avg 850 km/h cruise + 30 min taxi/climb)
  const flightHours = hasCoords ? distanceKm / 850 + 0.5 : 0;
  const flightH = Math.floor(flightHours);
  const flightM = Math.round((flightHours - flightH) * 60);

  return (
    <div
      className="relative min-h-screen overflow-hidden text-cream"
      style={{
        background: `
          radial-gradient(ellipse at 20% 0%, ${theme}33, transparent 55%),
          radial-gradient(ellipse at 80% 100%, #c8923a22, transparent 55%),
          linear-gradient(180deg, #150821 0%, #2a1140 45%, #08030f 100%)`,
      }}
    >
      {/* Ambient stars */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 70 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              opacity: 0.5,
            }}
            animate={{ opacity: [0.15, 0.8, 0.15] }}
            transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.04 }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p
            className="text-[11px] uppercase tracking-[0.4em]"
            style={{ color: theme }}
          >
            Mapa do amor
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl">
            {title || data.coupleNames}
          </h1>
          {data.coupleNames && (
            <p className="mt-2 font-display text-xl italic text-cream/70 sm:text-2xl">
              {data.coupleNames}
            </p>
          )}
        </motion.div>

        {/* Globe stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 shadow-romance"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4))",
          }}
        >
          {hasCoords ? (
            <GlobeStage
              a={{
                lat: a.lat!,
                lng: a.lng!,
                label: a.name,
                sub: `${a.city}${a.country ? `, ${a.country}` : ""}`,
                whisper: "onde tudo começou em pensamento",
              }}
              b={{
                lat: b.lat!,
                lng: b.lng!,
                label: b.name,
                sub: `${b.city}${b.country ? `, ${b.country}` : ""}`,
                whisper: "onde meu coração mora",
              }}
              theme={theme}
              onHover={setHover}
            />
          ) : (
            <div className="grid h-[50vh] place-items-center px-6 text-center text-cream/70">
              <div>
                <MapPin className="mx-auto h-8 w-8" style={{ color: theme }} />
                <p className="mt-3 font-display text-2xl">
                  Preencha as cidades para abrir o globo do amor
                </p>
              </div>
            </div>
          )}

          {/* Floating hover card */}
          <AnimatePresence>
            {hover && (
              <motion.div
                key={hover.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="pointer-events-none absolute left-1/2 top-4 z-10 w-[min(90%,360px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-xl"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-cream/60">
                  {hover.sub}
                </p>
                <p className="mt-1 font-display text-2xl">{hover.label}</p>
                <p className="mt-1 text-sm italic text-cream/80">
                  "{hover.whisper}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Glass info cards */}
        {hasCoords && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.3em] text-cream/60">
                Distância entre nós
              </p>
              <p
                className="mt-2 font-display text-4xl tabular-nums"
                style={{ color: theme }}
              >
                {Math.round(distanceKm).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs uppercase tracking-widest text-cream/60">
                quilômetros
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl">
              <Plane className="mx-auto h-5 w-5" style={{ color: theme }} />
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-cream/60">
                Em um voo até você
              </p>
              <p className="mt-1 font-display text-2xl">
                {flightH}h {flightM.toString().padStart(2, "0")}min
              </p>
              <p className="text-[11px] italic text-cream/60">
                e meu coração já chegou primeiro
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl">
              <Heart
                className="mx-auto h-5 w-5 fill-current animate-heartbeat"
                style={{ color: theme }}
              />
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-cream/60">
                Há
              </p>
              <p className="mt-1 font-display text-2xl tabular-nums">
                {t.years}a {t.months}m {t.days}d
              </p>
              <p className="text-[11px] italic text-cream/60">
                {String(t.hours).padStart(2, "0")}:
                {String(t.minutes).padStart(2, "0")}:
                {String(t.seconds).padStart(2, "0")} amando você
              </p>
            </div>
          </motion.div>
        )}

        {/* Couple photo */}
        {data.photo && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mx-auto mt-10 max-w-sm"
          >
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-romance">
              <img
                src={data.photo}
                alt=""
                className="block aspect-square w-full object-cover"
              />
            </div>
          </motion.div>
        )}

        {/* Message */}
        {data.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mx-auto mt-10 max-w-2xl text-center font-display text-2xl italic text-cream/90 sm:text-3xl"
          >
            "{hasCoords
              ? data.message.replace(
                  /\{km\}/g,
                  Math.round(distanceKm).toLocaleString("pt-BR"),
                )
              : data.message}"
          </motion.p>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 rounded-3xl p-10 text-center shadow-romance"
          style={{
            background: `linear-gradient(135deg, ${theme}, #b65a8c 55%, #8c54a3)`,
          }}
        >
          <Heart className="mx-auto h-8 w-8 fill-white text-white animate-heartbeat" />
          <p className="mt-4 font-display text-2xl italic sm:text-3xl">
            "Cada quilômetro entre nós é apenas mais uma prova de que o nosso amor atravessa o mundo."
          </p>
          <button
            onClick={() => setShowHearts(true)}
            className="mt-8 rounded-full bg-white px-8 py-3 font-medium text-plum shadow-romance transition hover:scale-105"
          >
            ❤️ Eu Te Amo
          </button>
        </motion.div>

        <div className="py-10 text-center text-xs text-cream/40">Chronelo</div>
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
                initial={{ y: "-10%", opacity: 0 }}
                animate={{ y: "110%", opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 3 + (i % 4),
                  delay: (i % 10) * 0.1,
                  repeat: Infinity,
                }}
                style={{ left: `${(i * 13) % 100}%` }}
              >
                <Heart
                  className="fill-current"
                  style={{
                    color: theme,
                    width: 12 + (i % 5) * 6,
                    height: 12 + (i % 5) * 6,
                  }}
                />
              </motion.div>
            ))}
            <div className="relative z-10 mx-5 max-w-lg rounded-3xl bg-white/10 p-8 text-center backdrop-blur-xl">
              <Heart
                className="mx-auto h-10 w-10 fill-current animate-heartbeat"
                style={{ color: theme }}
              />
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
