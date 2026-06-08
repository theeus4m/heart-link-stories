import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Mail, Volume2, VolumeX, Sparkles, X } from "lucide-react";

export type CartaData = {
  recipient: string;
  message: string;
  signature: string;
  photos?: string[];
  song?: string;
  /** Data de início do relacionamento (YYYY-MM-DD) — alimenta o contador */
  startDate?: string;
  /** Mensagens reveladas ao clicar nos corações da árvore */
  secretMessages?: string[];
  /** URL .mp3 opcional para música de fundo */
  bgMusic?: string;
};

const DEFAULT_SECRETS = [
  "Te amo mais a cada dia. 💕",
  "Você é meu lugar favorito no mundo.",
  "Obrigado por existir na minha vida.",
  "Cada sorriso seu vale ouro.",
  "Quero envelhecer ao seu lado.",
  "Você é minha pessoa. ✨",
  "Nada faz sentido sem você.",
  "Meu coração escolhe você todos os dias.",
  "Você é meu para sempre.",
  "Com você, até o tempo para.",
];

/* ============================= helpers ============================= */

function useCountdown(startDate?: string) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    if (!startDate) return null;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;
    let diff = Math.max(0, now.getTime() - start.getTime());
    const totalSeconds = Math.floor(diff / 1000);
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
      const prev = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prev.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;
    return { years, months, days, hours, minutes, seconds };
  }, [now, startDate]);
}

/* ============================= scene parts ============================= */

function StarrySky({ parallax }: { parallax: { x: number; y: number } }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 70,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
        depth: Math.random() * 0.6 + 0.2,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            transform: `translate(${parallax.x * s.depth * -1}px, ${parallax.y * s.depth * -1}px)`,
            boxShadow: "0 0 6px rgba(255,255,255,0.8)",
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2 + s.delay, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </div>
  );
}

function Moon({ parallax }: { parallax: { x: number; y: number } }) {
  return (
    <motion.div
      className="pointer-events-none absolute right-[8%] top-[8%]"
      style={{ transform: `translate(${parallax.x * -0.4}px, ${parallax.y * -0.4}px)` }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="h-24 w-24 rounded-full md:h-32 md:w-32"
        style={{
          background: "radial-gradient(circle at 35% 35%, #fff7d6, #f6d97a 55%, #c79f3a 100%)",
          boxShadow: "0 0 80px 20px rgba(246,217,122,0.45), 0 0 160px 60px rgba(246,217,122,0.15)",
        }}
      />
    </motion.div>
  );
}

function Fireflies() {
  const flies = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 30 + Math.random() * 60,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 6,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {flies.map((f) => (
        <motion.span
          key={f.id}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            background: "radial-gradient(circle, #fff5b0, rgba(255,245,176,0))",
            boxShadow: "0 0 12px #fff2a0",
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 20, -10, 0],
            opacity: [0, 1, 0.6, 1, 0],
          }}
          transition={{ duration: f.duration, repeat: Infinity, delay: f.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function FloatingDust() {
  const dust = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: 12 + Math.random() * 14,
        delay: Math.random() * 10,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dust.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-white/60"
          style={{ left: `${d.left}%`, bottom: -20, width: d.size, height: d.size, filter: "blur(0.3px)" }}
          animate={{ y: [-0, -700], opacity: [0, 0.8, 0] }}
          transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ============================= the tree ============================= */

type TreeHeart = {
  id: number;
  x: number; // % from trunk center
  y: number; // % from ground up
  size: number;
  delay: number;
  clickable: boolean;
};

function buildTree(): TreeHeart[] {
  const hearts: TreeHeart[] = [];
  let id = 0;
  // canopy: concentric rings
  const rings = [
    { count: 10, radius: 22, y: 70, size: 16 },
    { count: 14, radius: 30, y: 62, size: 18 },
    { count: 18, radius: 36, y: 54, size: 20 },
    { count: 14, radius: 28, y: 46, size: 18 },
    { count: 10, radius: 18, y: 40, size: 16 },
  ];
  rings.forEach((r) => {
    for (let i = 0; i < r.count; i++) {
      const a = (i / r.count) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 6;
      hearts.push({
        id: id++,
        x: Math.cos(a) * r.radius + jitter,
        y: r.y + Math.sin(a) * 6 + (Math.random() - 0.5) * 4,
        size: r.size + (Math.random() - 0.5) * 6,
        delay: Math.random() * 1.5,
        clickable: false,
      });
    }
  });
  // pick ~6 clickable hearts spread out
  const clickIdxs = new Set<number>();
  while (clickIdxs.size < 6) clickIdxs.add(Math.floor(Math.random() * hearts.length));
  clickIdxs.forEach((i) => (hearts[i].clickable = true));
  return hearts;
}

function LoveTree({
  onHeartClick,
  goldenId,
  onGoldenClick,
}: {
  onHeartClick: (id: number) => void;
  goldenId: number | null;
  onGoldenClick: () => void;
}) {
  const hearts = useMemo(buildTree, []);
  return (
    <motion.div
      initial={{ scale: 0.2, opacity: 0, y: 60 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto h-[480px] w-[480px] max-w-[92vw] sm:h-[560px] sm:w-[560px]"
    >
      {/* glow */}
      <div
        className="absolute inset-0 -z-10 rounded-full"
        style={{ background: "radial-gradient(circle at 50% 55%, rgba(244,121,117,0.35), transparent 60%)", filter: "blur(20px)" }}
      />
      {/* trunk */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="trunk" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5b3a2a" />
            <stop offset="100%" stopColor="#2e1a10" />
          </linearGradient>
        </defs>
        <motion.path
          d="M100 200 C 96 160, 110 140, 100 100 C 92 70, 108 60, 100 40"
          stroke="url(#trunk)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
        {/* side branches */}
        {[
          "M100 130 C 80 120, 70 110, 60 90",
          "M100 130 C 120 120, 130 110, 140 90",
          "M100 110 C 85 100, 75 95, 70 80",
          "M100 110 C 115 100, 125 95, 130 80",
          "M100 90 C 90 80, 85 75, 80 65",
          "M100 90 C 110 80, 115 75, 120 65",
        ].map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="url(#trunk)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.6 + i * 0.1, ease: "easeOut" }}
          />
        ))}
      </svg>

      {/* magical sparkles around tree */}
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.span
          key={`spark-${i}`}
          className="absolute h-1 w-1 rounded-full bg-yellow-200"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${30 + Math.random() * 50}%`,
            boxShadow: "0 0 8px #ffe27a",
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      {/* hearts */}
      {hearts.map((h) => (
        <motion.button
          key={h.id}
          type="button"
          disabled={!h.clickable}
          onClick={() => h.clickable && onHeartClick(h.id)}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${h.clickable ? "cursor-pointer" : "cursor-default"}`}
          style={{ left: `${50 + h.x}%`, top: `${100 - h.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: [-4, 4, -4],
            y: [0, -2, 0],
          }}
          transition={{
            scale: { duration: 0.6, delay: 1.2 + h.delay },
            opacity: { duration: 0.6, delay: 1.2 + h.delay },
            rotate: { duration: 3 + (h.id % 3), repeat: Infinity, ease: "easeInOut" },
            y: { duration: 2.5 + (h.id % 2), repeat: Infinity, ease: "easeInOut" },
          }}
          whileHover={h.clickable ? { scale: 1.4 } : undefined}
        >
          <Heart
            className={h.clickable ? "fill-coral text-coral drop-shadow-[0_0_10px_rgba(244,121,117,0.9)]" : "fill-coral/85 text-coral/85"}
            style={{ width: h.size, height: h.size }}
          />
        </motion.button>
      ))}

      {/* golden heart */}
      <AnimatePresence>
        {goldenId !== null && (
          <motion.button
            key={goldenId}
            type="button"
            onClick={onGoldenClick}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${50 + (Math.sin(goldenId) * 25)}%`,
              top: `${45 + (Math.cos(goldenId) * 10)}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: 1, rotate: [0, 360] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { duration: 1.6, repeat: Infinity },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
            whileHover={{ scale: 1.4 }}
          >
            <Heart
              className="text-yellow-300"
              style={{
                width: 30,
                height: 30,
                fill: "#f6d97a",
                filter: "drop-shadow(0 0 14px rgba(246,217,122,0.95))",
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================= main component ============================= */

type Stage = "heart" | "falling" | "tree" | "letter";

export function CartaGift({ data, title }: { data: CartaData; title: string }) {
  const [stage, setStage] = useState<Stage>("heart");
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [openedSecret, setOpenedSecret] = useState<string | null>(null);
  const [openedGolden, setOpenedGolden] = useState<string | null>(null);
  const [goldenId, setGoldenId] = useState<number | null>(null);
  const counter = useCountdown(data.startDate);

  const secrets = data.secretMessages?.length ? data.secretMessages : DEFAULT_SECRETS;

  // After tree appears, schedule letter reveal
  useEffect(() => {
    if (stage !== "tree") return;
    const t = setTimeout(() => setStage("letter"), 7000);
    return () => clearTimeout(t);
  }, [stage]);

  // Spawn golden heart every 30s while tree is visible
  useEffect(() => {
    if (stage !== "tree" && stage !== "letter") return;
    const id = setInterval(() => {
      setGoldenId(Date.now());
    }, 30000);
    return () => clearInterval(id);
  }, [stage]);

  // Parallax
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setParallax({ x: ((e.clientX - cx) / cx) * 18, y: ((e.clientY - cy) / cy) * 18 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  function toggleMusic() {
    const a = audioRef.current;
    if (!a) return;
    if (muted) {
      a.volume = 0.4;
      a.play().catch(() => {});
      setMuted(false);
    } else {
      a.pause();
      setMuted(true);
    }
  }

  function handleHeartClick(id: number) {
    const msg = secrets[id % secrets.length];
    setOpenedSecret(msg);
  }

  function handleStart() {
    setStage("falling");
    setTimeout(() => setStage("tree"), 1900);
  }

  const musicUrl = data.bgMusic || "https://cdn.pixabay.com/audio/2022/10/30/audio_347ce11ad7.mp3";

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0a0a23 0%, #1a0b2e 35%, #2d1248 65%, #4a1d5e 90%, #1b0930 100%)",
      }}
    >
      {/* ambient */}
      <StarrySky parallax={parallax} />
      <Moon parallax={parallax} />
      <Fireflies />
      <FloatingDust />

      {/* hidden audio */}
      <audio ref={audioRef} src={musicUrl} loop preload="none" />

      {/* music toggle */}
      <button
        onClick={toggleMusic}
        aria-label={muted ? "Tocar música" : "Pausar música"}
        className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-10">
        {/* STAGE: HEART */}
        <AnimatePresence>
          {stage === "heart" && (
            <motion.button
              key="heart"
              onClick={handleStart}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="group relative grid place-items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="relative grid place-items-center"
              >
                <div
                  className="absolute h-56 w-56 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(244,121,117,0.5), transparent 70%)", filter: "blur(20px)" }}
                />
                <Heart className="relative h-40 w-40 fill-coral text-coral drop-shadow-[0_0_40px_rgba(244,121,117,0.8)] md:h-52 md:w-52" />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-8 text-center text-sm uppercase tracking-[0.3em] text-cream/90"
              >
                Toque o coração
              </motion.p>
            </motion.button>
          )}
        </AnimatePresence>

        {/* STAGE: FALLING */}
        <AnimatePresence>
          {stage === "falling" && (
            <motion.div
              key="fall"
              initial={{ y: -200, opacity: 1, scale: 1 }}
              animate={{ y: "60vh", opacity: 1, scale: 0.5, rotate: [0, -20, 15, -10, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: [0.55, 0.06, 0.68, 0.19] }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2"
            >
              <Heart className="h-32 w-32 fill-coral text-coral drop-shadow-[0_0_30px_rgba(244,121,117,0.9)]" />
              {/* trail */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-pink-200"
                  style={{ boxShadow: "0 0 8px #ffb0c8" }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 80,
                    y: -100 - Math.random() * 200,
                    opacity: 0,
                  }}
                  transition={{ duration: 1.4, delay: i * 0.04, ease: "easeOut" }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STAGE: TREE + LETTER */}
        {(stage === "tree" || stage === "letter") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex w-full flex-col items-center"
          >
            <LoveTree
              onHeartClick={handleHeartClick}
              goldenId={goldenId}
              onGoldenClick={() => {
                const msg = secrets[Math.floor(Math.random() * secrets.length)];
                setOpenedGolden(`✨ ${msg} ✨`);
                setGoldenId(null);
              }}
            />

            {/* counter */}
            {counter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.8 }}
                className="mt-2 text-center text-cream"
              >
                <p className="font-display text-lg italic opacity-90">Estamos juntos há:</p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {[
                    ["Anos", counter.years],
                    ["Meses", counter.months],
                    ["Dias", counter.days],
                    ["Horas", counter.hours],
                    ["Min", counter.minutes],
                    ["Seg", counter.seconds],
                  ].map(([label, val]) => (
                    <div
                      key={label as string}
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md"
                    >
                      <div className="font-display text-2xl text-white tabular-nums">
                        {String(val).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest opacity-70">{label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 3.5 }}
              className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cream/70"
            >
              <Sparkles className="h-3 w-3" /> toque os corações brilhantes
            </motion.p>

            {/* letter card appears between branches */}
            <AnimatePresence>
              {stage === "letter" && (
                <LetterCard data={data} title={title} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Secret message dialog */}
      <AnimatePresence>
        {openedSecret && (
          <SecretDialog message={openedSecret} onClose={() => setOpenedSecret(null)} />
        )}
        {openedGolden && (
          <SecretDialog
            golden
            message={openedGolden}
            onClose={() => setOpenedGolden(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================= letter card ============================= */

function LetterCard({ data, title }: { data: CartaData; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, y: -120 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="mt-10 w-full max-w-3xl"
    >
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="closed"
            onClick={() => setOpen(true)}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.98 }}
            exit={{ opacity: 0, rotateX: 90 }}
            className="group relative mx-auto block aspect-[4/3] w-full max-w-sm rounded-2xl bg-cream shadow-2xl"
            style={{ boxShadow: "0 30px 80px -20px rgba(244,121,117,0.5)" }}
          >
            <div className="absolute inset-0 grid place-items-center">
              <Mail className="h-20 w-20 text-coral animate-heartbeat" />
            </div>
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="font-display text-2xl text-plum">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">Toque para abrir 💌</p>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl bg-cream p-8 shadow-2xl md:p-12"
          >
            {/* petals on letter open */}
            <div className="pointer-events-none fixed inset-0 z-30">
              {[...Array(28)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{ left: `${Math.random() * 100}%`, top: "-10%" }}
                  initial={{ y: -50, rotate: 0, opacity: 0 }}
                  animate={{
                    y: "110vh",
                    rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ duration: 6 + Math.random() * 4, delay: Math.random() * 3, repeat: Infinity }}
                >
                  🌹
                </motion.div>
              ))}
            </div>

            <p className="text-center text-sm uppercase tracking-widest text-violet">Para</p>
            <h1 className="mt-1 text-center font-display text-4xl text-plum md:text-5xl">
              {data.recipient || "Meu amor"}
            </h1>
            <div className="mx-auto my-6 h-px w-32 bg-gradient-to-r from-transparent via-coral to-transparent" />
            <p className="whitespace-pre-wrap text-center font-display text-xl italic leading-relaxed text-plum md:text-2xl">
              {data.message}
            </p>
            {data.signature && (
              <p className="mt-8 text-right font-display text-lg text-violet">— {data.signature}</p>
            )}

            {data.photos && data.photos.filter(Boolean).length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
                {data.photos.filter(Boolean).map((src, i) => (
                  <motion.img
                    key={i}
                    src={src}
                    alt=""
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="aspect-square w-full rounded-xl object-cover shadow-soft"
                  />
                ))}
              </div>
            )}

            {data.song && data.song.includes("spotify.com") && (
              <div className="mt-8 overflow-hidden rounded-xl">
                <iframe
                  src={data.song.replace("/track/", "/embed/track/")}
                  width="100%"
                  height="80"
                  allow="encrypted-media"
                  className="border-0"
                />
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <Heart className="h-6 w-6 fill-coral text-coral animate-heartbeat" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================= secret dialog ============================= */

function SecretDialog({
  message,
  onClose,
  golden,
}: {
  message: string;
  onClose: () => void;
  golden?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] grid place-items-center bg-black/60 px-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-cream p-8 text-center shadow-2xl"
        style={
          golden
            ? { boxShadow: "0 0 80px rgba(246,217,122,0.7)", border: "2px solid #f6d97a" }
            : undefined
        }
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-plum/60 hover:bg-plum/10"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-romance">
          <Heart className="h-7 w-7 fill-white text-white" />
        </div>
        <p className="mt-5 font-display text-2xl italic leading-snug text-plum">{message}</p>
        {/* sparkles */}
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-coral"
            style={{ left: "50%", top: "50%" }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: (Math.random() - 0.5) * 240,
              y: (Math.random() - 0.5) * 240,
              opacity: 0,
            }}
            transition={{ duration: 1.2, delay: i * 0.03 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
