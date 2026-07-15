import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import { Heart, Pause, Play, Repeat, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useMusicPlayer, type Track } from "./MusicPlayerContext";

export type { Track } from "./MusicPlayerContext";

export type MusicaData = {
  mixtapeName: string;
  coupleNames: string;
  message?: string;
  coverUrl?: string;
  createdDate?: string;
  tracks: Track[];
  // legacy fallback
  songTitle?: string;
  songArtist?: string;
  songUrl?: string;
};

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

type Phase = "sleeve" | "opening" | "draggable" | "placed" | "playing";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────── Main ─────────────────────── */

export function MusicaGift({ data, title }: { data: MusicaData; title: string }) {
  const reduceMotion = useReducedMotion();
  const player = useMusicPlayer();

  const mixtapeName = data.mixtapeName || data.songTitle || "Nossa Mixtape";
  const created = data.createdDate || new Date().toISOString();

  const [phase, setPhase] = useState<Phase>(player.started ? "playing" : "sleeve");

  // If player was already started elsewhere (persistent across chapters), skip to playing.
  useEffect(() => {
    if (player.started && phase !== "playing") setPhase("playing");
  }, [player.started, phase]);

  const prettyDate = useMemo(
    () =>
      new Date(created).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    [created],
  );

  // Vinyl drag handling
  const platterRef = useRef<HTMLDivElement | null>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [snapping, setSnapping] = useState(false);

  const tiltX = useTransform(dragX, [-200, 200], [8, -8]);
  const tiltY = useTransform(dragY, [-200, 200], [-8, 8]);

  const handleDragEnd = useCallback(
    (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const el = platterRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = info.point.x - cx;
      const dy = info.point.y - cy;
      const dist = Math.hypot(dx, dy);
      // If within platter radius, snap into place.
      if (dist < r.width * 0.55) {
        setSnapping(true);
        // Animate to platter center by adjusting motion values relative to current diff
        // We'll rely on animate={{x:0,y:0}} on the exit, actually easier: setPhase after brief snap animation
        setTimeout(() => {
          setPhase("placed");
          setSnapping(false);
          dragX.set(0);
          dragY.set(0);
        }, 550);
      } else {
        // Bounce back
        dragX.set(0);
        dragY.set(0);
      }
    },
    [dragX, dragY],
  );

  const openSleeve = () => {
    if (reduceMotion) {
      setPhase("draggable");
      return;
    }
    setPhase("opening");
    setTimeout(() => setPhase("draggable"), 900);
  };

  const dropNeedle = () => {
    // Move tonearm down, start player after arc completes
    setPhase("playing");
    // Slight delay to align with tonearm settle
    setTimeout(() => {
      if (!player.started) player.start();
    }, 700);
  };

  const hasTracks = player.tracks.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0608] text-[#FDFBF7]">
      {/* Ambient backdrop — deep wine with warm gold light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.18),transparent_55%),radial-gradient(ellipse_at_center,rgba(107,39,55,0.35),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,1),transparent_90%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />

      <div className="relative mx-auto grid max-w-5xl gap-8 px-5 py-10 sm:py-14">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.55em] text-[#C9A84C] sm:text-xs">
            ★ Chronelo Mixtape ★
          </p>
          <h1 className="mt-3 font-display text-4xl italic leading-tight text-[#FDFBF7] sm:text-6xl">
            {mixtapeName}
          </h1>
          <p className="mt-3 text-xs text-[#FDFBF7]/60 sm:text-sm">
            {data.coupleNames} · {prettyDate}
          </p>
        </motion.div>

        {!hasTracks ? (
          <p className="text-center text-[#FDFBF7]/60">
            Nenhuma música foi adicionada nesta mixtape.
          </p>
        ) : (
          <>
            {/* Stage container */}
            {phase !== "playing" ? (
              <InteractiveStage
                phase={phase}
                coverUrl={data.coverUrl}
                mixtapeName={mixtapeName}
                couple={data.coupleNames}
                onOpenSleeve={openSleeve}
                onDropNeedle={dropNeedle}
                platterRef={platterRef}
                dragX={dragX}
                dragY={dragY}
                tiltX={tiltX}
                tiltY={tiltY}
                isDragging={isDragging}
                snapping={snapping}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                reduceMotion={!!reduceMotion}
              />
            ) : (
              <PlayingStage
                coverUrl={data.coverUrl}
                mixtapeName={mixtapeName}
                couple={data.coupleNames}
                reduceMotion={!!reduceMotion}
              />
            )}

            {/* Now playing + controls only while on this chapter and playing */}
            {phase === "playing" && (
              <>
                <NowPlaying />
                <PlayerControls />
                <Tracklist />
              </>
            )}

            {/* Instructional hint per phase */}
            {phase !== "playing" && <PhaseHint phase={phase} />}
          </>
        )}

        {data.message && phase === "playing" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9 }}
            className="mx-auto max-w-xl text-center font-display text-xl italic text-[#FDFBF7]/80 sm:text-2xl"
          >
            "{data.message}"
          </motion.p>
        )}
      </div>

      <p className="pb-6 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-[#FDFBF7]/30">
        {title}
      </p>
    </div>
  );
}

/* ─────────────────────── Phase hint ─────────────────────── */

function PhaseHint({ phase }: { phase: Phase }) {
  const text =
    phase === "sleeve"
      ? "toque na capa para abrir"
      : phase === "opening"
        ? "abrindo…"
        : phase === "draggable"
          ? "arraste o vinil até o toca-discos"
          : phase === "placed"
            ? "toque na agulha para tocar"
            : "";
  return (
    <motion.p
      key={phase}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      className="text-center font-mono text-[11px] uppercase tracking-[0.5em] text-[#C9A84C]"
    >
      {text}
    </motion.p>
  );
}

/* ─────────────────────── Interactive Stage ─────────────────────── */

function InteractiveStage({
  phase,
  coverUrl,
  mixtapeName,
  couple,
  onOpenSleeve,
  onDropNeedle,
  platterRef,
  dragX,
  dragY,
  tiltX,
  tiltY,
  isDragging,
  snapping,
  onDragStart,
  onDragEnd,
  reduceMotion,
}: {
  phase: Phase;
  coverUrl?: string;
  mixtapeName: string;
  couple: string;
  onOpenSleeve: () => void;
  onDropNeedle: () => void;
  platterRef: React.RefObject<HTMLDivElement | null>;
  dragX: ReturnType<typeof useMotionValue<number>>;
  dragY: ReturnType<typeof useMotionValue<number>>;
  tiltX: any;
  tiltY: any;
  isDragging: boolean;
  snapping: boolean;
  onDragStart: () => void;
  onDragEnd: (e: any, info: PanInfo) => void;
  reduceMotion: boolean;
}) {
  const constraintsRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={constraintsRef}
      className="relative mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-2"
    >
      {/* Wooden table surface */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 rounded-b-[2rem] opacity-70"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(58,32,20,0.55) 40%, rgba(28,15,10,0.9) 100%)",
          backgroundImage:
            "repeating-linear-gradient(90deg,rgba(0,0,0,0.15) 0 2px,transparent 2px 8px)",
        }}
      />

      {/* LEFT — sleeve + vinyl (drag origin) */}
      <div className="relative flex items-center justify-center py-6">
        <Sleeve
          phase={phase}
          coverUrl={coverUrl}
          mixtapeName={mixtapeName}
          couple={couple}
          onOpen={onOpenSleeve}
        />

        {/* The draggable vinyl — only exists in draggable phase */}
        {phase === "draggable" && (
          <motion.div
            drag={!snapping}
            dragMomentum={false}
            dragElastic={0.05}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            style={{ x: dragX, y: dragY, rotateX: tiltY, rotateY: tiltX, cursor: isDragging ? "grabbing" : "grab" }}
            whileTap={{ scale: 1.04 }}
            animate={
              snapping
                ? {}
                : isDragging
                  ? { scale: 1.06 }
                  : { scale: [1, 1.015, 1], rotate: [0, 2, -2, 0] }
            }
            transition={
              isDragging || snapping
                ? { duration: 0.15 }
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
            className="absolute z-40 aspect-square w-[68%] max-w-[300px] touch-none select-none"
          >
            <VinylDisc coverUrl={coverUrl} mixtapeName={mixtapeName} couple={couple} tilt />
          </motion.div>
        )}
      </div>

      {/* RIGHT — turntable */}
      <div className="relative flex items-center justify-center py-6">
        <Turntable
          platterRef={platterRef}
          phase={phase}
          coverUrl={coverUrl}
          mixtapeName={mixtapeName}
          couple={couple}
          onDropNeedle={onDropNeedle}
          reduceMotion={reduceMotion}
        />
      </div>
    </div>
  );
}

/* ─────────────────────── Sleeve ─────────────────────── */

function Sleeve({
  phase,
  coverUrl,
  mixtapeName,
  couple,
  onOpen,
}: {
  phase: Phase;
  coverUrl?: string;
  mixtapeName: string;
  couple: string;
  onOpen: () => void;
}) {
  const opened = phase !== "sleeve";
  const showPeek = phase === "opening";
  return (
    <motion.button
      type="button"
      onClick={phase === "sleeve" ? onOpen : undefined}
      whileHover={phase === "sleeve" ? { scale: 1.02, rotate: -1 } : {}}
      whileTap={phase === "sleeve" ? { scale: 0.98 } : {}}
      animate={
        phase === "sleeve"
          ? { rotate: [-1, 1, -1] }
          : opened
            ? { rotate: -4, x: -6 }
            : {}
      }
      transition={
        phase === "sleeve"
          ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.9, ease: EASE }
      }
      className="relative aspect-square w-[80%] max-w-[300px]"
      style={{
        cursor: phase === "sleeve" ? "pointer" : "default",
        perspective: 1200,
      }}
      aria-label={phase === "sleeve" ? "Abrir capa" : "Capa"}
    >
      {/* Vinyl peeking out during 'opening' */}
      {showPeek && (
        <motion.div
          initial={{ x: 0, opacity: 0.9 }}
          animate={{ x: "45%", opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="absolute left-0 top-0 z-0 aspect-square h-full w-full"
        >
          <VinylDisc coverUrl={coverUrl} mixtapeName={mixtapeName} couple={couple} small />
        </motion.div>
      )}

      {/* Sleeve — cardboard with cover art */}
      <motion.div
        className="relative z-10 h-full w-full overflow-hidden rounded-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,220,170,0.1)]"
        style={{
          background:
            "linear-gradient(145deg,#2a1620 0%,#1a0a12 60%,#0a0308 100%)",
          transformStyle: "preserve-3d",
        }}
        animate={opened ? { rotateY: -22 } : { rotateY: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {/* cover art */}
        <div className="absolute inset-0">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover opacity-90"
              style={{ filter: "contrast(1.05) saturate(1.05)" }}
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #9B3344 0%, #6B2737 55%, #3F1620 100%)",
              }}
            />
          )}
          {/* dark vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.6)_100%)]" />
          {/* gold frame */}
          <div className="absolute inset-3 rounded-[3px] border border-[#C9A84C]/40" />
          {/* letterpress text */}
          <div className="absolute inset-0 flex flex-col items-center justify-between p-5 text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[#C9A84C]/90">
              Chronelo · Side A
            </p>
            <div>
              <p className="font-display text-2xl italic leading-tight text-[#FDFBF7] sm:text-3xl">
                {mixtapeName}
              </p>
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.35em] text-[#FDFBF7]/70">
                {couple}
              </p>
            </div>
            <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-[#FDFBF7]/45">
              33⅓ RPM · Stereo · Long Play
            </p>
          </div>
        </div>

        {/* paper grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg,rgba(255,220,170,0.2) 0 1px,transparent 1px 3px)",
          }}
        />
        {/* sleeve edge shadow */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-4 bg-gradient-to-l from-black/60 to-transparent" />
      </motion.div>
    </motion.button>
  );
}

/* ─────────────────────── Vinyl Disc ─────────────────────── */

function VinylDisc({
  coverUrl,
  mixtapeName,
  couple,
  small,
  tilt,
}: {
  coverUrl?: string;
  mixtapeName: string;
  couple: string;
  small?: boolean;
  tilt?: boolean;
}) {
  return (
    <div
      className="relative h-full w-full rounded-full"
      style={{
        background: "radial-gradient(circle at 50% 50%, #1a0a10 0%, #0a0407 65%, #000 100%)",
        boxShadow: tilt
          ? "0 30px 60px -18px rgba(0,0,0,0.9), inset 0 0 0 2px rgba(201,168,76,0.2), inset 0 6px 14px rgba(255,210,170,0.10)"
          : "0 15px 35px -12px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(201,168,76,0.15)",
      }}
    >
      {/* Concentric grooves */}
      {Array.from({ length: 26 }).map((_, i) => {
        const inset = 5 + i * 1.5;
        return (
          <div
            key={i}
            className="pointer-events-none absolute rounded-full border border-[#FDFBF7]/[0.045]"
            style={{ inset: `${inset}%` }}
          />
        );
      })}
      {/* Rotating reflection sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_140deg,transparent_0deg,rgba(255,220,170,0.08)_60deg,transparent_120deg,transparent_240deg,rgba(255,220,170,0.06)_300deg,transparent_360deg)]" />
      {/* Center label */}
      <div
        className={`absolute left-1/2 top-1/2 grid aspect-square -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_4px_10px_rgba(0,0,0,0.4)]`}
        style={{
          width: small ? "34%" : "36%",
          background: "radial-gradient(circle at 30% 25%, #9B3344 0%, #6B2737 55%, #3F1620 100%)",
        }}
      >
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
          />
        )}
        <div className="absolute inset-1 rounded-full border border-[#C9A84C]/40" />
        <div className="relative px-2">
          <p className="font-display text-[10px] italic tracking-[0.3em] text-[#C9A84C]">CHRONELO</p>
          <p className="mt-0.5 line-clamp-2 font-display text-[11px] italic leading-tight text-[#FDFBF7]">
            {mixtapeName}
          </p>
          <p className="mt-0.5 truncate font-mono text-[7px] uppercase tracking-[0.25em] text-[#FDFBF7]/60">
            {couple}
          </p>
        </div>
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a0a10] ring-1 ring-[#C9A84C]/40" />
      </div>
    </div>
  );
}

/* ─────────────────────── Turntable (modern premium) ─────────────────────── */

function Turntable({
  platterRef,
  phase,
  coverUrl,
  mixtapeName,
  couple,
  onDropNeedle,
  reduceMotion,
}: {
  platterRef: React.RefObject<HTMLDivElement | null>;
  phase: Phase;
  coverUrl?: string;
  mixtapeName: string;
  couple: string;
  onDropNeedle: () => void;
  reduceMotion: boolean;
}) {
  const showVinyl = phase === "placed" || phase === "playing";
  const playing = phase === "playing";
  const armAngle = playing ? 30 : phase === "placed" ? 8 : 0;

  return (
    <div
      className="relative aspect-square w-full max-w-[380px] rounded-[1.8rem] p-5"
      style={{
        background:
          "linear-gradient(160deg,#111 0%,#0a0a0a 40%,#050505 100%)",
        boxShadow:
          "0 45px 90px -30px rgba(0,0,0,0.9), inset 0 2px 4px rgba(255,255,255,0.08), inset 0 -6px 14px rgba(0,0,0,0.6)",
      }}
    >
      {/* Wooden side accent (right edge — walnut band) */}
      <div
        className="pointer-events-none absolute inset-y-3 right-3 w-6 rounded-r-[1.4rem] opacity-95"
        style={{
          background:
            "linear-gradient(180deg,#4a2a17 0%,#3a1e10 50%,#2a1408 100%)",
          backgroundImage:
            "repeating-linear-gradient(180deg,rgba(0,0,0,0.4) 0 1px,transparent 1px 5px)",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.6), inset 2px 0 4px rgba(255,220,170,0.06)",
        }}
      />

      {/* Brushed aluminum inner frame */}
      <div
        className="absolute inset-3 rounded-[1.4rem]"
        style={{
          background:
            "linear-gradient(155deg,#2a2a2a 0%,#1a1a1a 55%,#0f0f0f 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 6px rgba(0,0,0,0.7)",
        }}
      />
      {/* Aluminum brushed texture */}
      <div
        className="pointer-events-none absolute inset-3 rounded-[1.4rem] opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,rgba(255,255,255,0.06) 0 1px,transparent 1px 2px)",
        }}
      />

      {/* Discreet blue LED */}
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <motion.span
          animate={{ opacity: playing ? [0.6, 1, 0.6] : 0.35 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-[#7ec6ff]"
          style={{ boxShadow: "0 0 8px 2px rgba(126,198,255,0.7)" }}
        />
        <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-[#7ec6ff]/70">
          {playing ? "playing" : phase === "placed" ? "ready" : "stand-by"}
        </p>
      </div>

      {/* Brand mark */}
      <p className="absolute bottom-5 left-6 font-display text-[11px] italic tracking-[0.35em] text-[#C9A84C]/60">
        Chronelo · Audio
      </p>

      {/* Platter */}
      <div className="relative grid h-full w-full place-items-center">
        <div
          ref={platterRef}
          className="relative aspect-square w-[80%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #333 0%, #1a1a1a 55%, #0a0a0a 100%)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 6px 12px rgba(0,0,0,0.7), 0 12px 24px -6px rgba(0,0,0,0.7)",
          }}
        >
          {/* Brushed radial pattern (aluminum platter surface) */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full opacity-40 mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-conic-gradient(from 0deg,rgba(255,255,255,0.05) 0deg 1deg,transparent 1deg 3deg)",
            }}
          />
          {/* Strobe dots around rim (subtle) */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i / 36) * Math.PI * 2;
            const r = 47;
            const x = 50 + Math.cos(angle) * r;
            const y = 50 + Math.sin(angle) * r;
            return (
              <span
                key={i}
                className="absolute h-0.5 w-0.5 rounded-full bg-[#FDFBF7]/25"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              />
            );
          })}

          {/* Spindle glow (drop target hint during draggable) */}
          {phase === "draggable" && (
            <motion.div
              className="absolute inset-[18%] rounded-full border border-[#C9A84C]/40"
              animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ boxShadow: "0 0 40px rgba(201,168,76,0.4)" }}
            />
          )}

          {/* Central spindle */}
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#f3f3f3] to-[#6a6a6a] shadow-[0_0_6px_rgba(0,0,0,0.5)]" />

          {/* Vinyl in place */}
          <AnimatePresence>
            {showVinyl && (
              <motion.div
                key="placed-vinyl"
                initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
                animate={
                  playing && !reduceMotion
                    ? { scale: 1, opacity: 1, rotate: 360 }
                    : { scale: 1, opacity: 1, rotate: 0 }
                }
                exit={{ scale: 0.6, opacity: 0 }}
                transition={
                  playing && !reduceMotion
                    ? { rotate: { duration: 5, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.6 }, scale: { duration: 0.6, ease: EASE } }
                    : { duration: 0.6, ease: EASE }
                }
                className="absolute inset-[6%]"
              >
                <VinylDisc coverUrl={coverUrl} mixtapeName={mixtapeName} couple={couple} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tonearm */}
        <motion.div
          className="pointer-events-none absolute -right-1 -top-2 h-[62%] w-[62%] origin-top-right"
          animate={{ rotate: armAngle }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-[0_10px_18px_rgba(0,0,0,0.7)]">
            <defs>
              <linearGradient id="armMetal" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#e8e8e8" />
                <stop offset="40%" stopColor="#a8a8a8" />
                <stop offset="100%" stopColor="#4a4a4a" />
              </linearGradient>
              <linearGradient id="armGold" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#F0D78C" />
                <stop offset="50%" stopColor="#C9A84C" />
                <stop offset="100%" stopColor="#6B5020" />
              </linearGradient>
            </defs>
            {/* pivot base — brushed aluminum */}
            <circle cx="170" cy="30" r="20" fill="url(#armMetal)" stroke="#1a1a1a" strokeWidth="1.5" />
            <circle cx="170" cy="30" r="12" fill="#0a0a0a" />
            <circle cx="170" cy="30" r="4" fill="url(#armGold)" />
            {/* counterweight cylinder */}
            <rect x="176" y="24" width="18" height="12" rx="3" fill="url(#armMetal)" />
            {/* arm — thin brushed metal */}
            <g transform="rotate(35 170 30)">
              <rect x="50" y="27" width="120" height="4" rx="2" fill="url(#armMetal)" />
              {/* headshell */}
              <g transform="translate(48 22)">
                <rect x="-12" y="-2" width="18" height="14" rx="2" fill="#141414" stroke="#C9A84C" strokeWidth="0.6" />
                <rect x="-10" y="9" width="12" height="4" rx="1" fill="#0a0a0a" />
                <circle cx="-3" cy="12" r="1" fill="#C9A84C" />
              </g>
            </g>
          </svg>
        </motion.div>

        {/* Clickable needle "drop" hotspot — only when placed */}
        {phase === "placed" && (
          <motion.button
            type="button"
            onClick={onDropNeedle}
            className="absolute right-2 top-2 z-20 rounded-full border border-[#C9A84C]/60 bg-[#C9A84C]/15 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.35em] text-[#F0D78C] backdrop-blur"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            animate={{ boxShadow: ["0 0 0 rgba(201,168,76,0)", "0 0 24px rgba(201,168,76,0.5)", "0 0 0 rgba(201,168,76,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ▸ tocar
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Playing stage (compact turntable) ─────────────────────── */

function PlayingStage({
  coverUrl,
  mixtapeName,
  couple,
  reduceMotion,
}: {
  coverUrl?: string;
  mixtapeName: string;
  couple: string;
  reduceMotion: boolean;
}) {
  const platterRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="mx-auto w-full max-w-md">
      <Turntable
        platterRef={platterRef}
        phase="playing"
        coverUrl={coverUrl}
        mixtapeName={mixtapeName}
        couple={couple}
        onDropNeedle={() => {}}
        reduceMotion={reduceMotion}
      />
    </div>
  );
}

/* ─────────────────────── Now playing ─────────────────────── */

function NowPlaying() {
  const { current, idx, tracks, progress, duration, playing, seek } = useMusicPlayer();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pct = duration > 0 ? progress / duration : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !duration) return;
    const r = el.getBoundingClientRect();
    const p = (e.clientX - r.left) / r.width;
    seek(p);
  };
  return (
    <div className="relative mx-auto w-full max-w-md rounded-2xl border border-[#C9A84C]/25 bg-[#1a0a10]/70 p-5 shadow-[inset_0_1px_0_rgba(255,220,170,0.08),0_20px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.35em] text-[#C9A84C]/70">
        <span>
          Faixa {Math.min(idx + 1, Math.max(tracks.length, 1)).toString().padStart(2, "0")} /{" "}
          {Math.max(tracks.length, 1).toString().padStart(2, "0")}
        </span>
        <span className="flex items-center gap-2">
          {playing && <EqBars />}
          {playing ? "Tocando" : "Pausado"}
        </span>
      </div>
      <div className="relative mt-2 h-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="truncate font-display text-2xl italic text-[#FDFBF7]">
              {current?.title || `Faixa ${idx + 1}`}
            </p>
            <p className="truncate text-xs text-[#FDFBF7]/55">{current?.artist || "—"}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div
        ref={trackRef}
        onClick={handleSeek}
        role="slider"
        aria-label="Posição da faixa"
        aria-valuenow={Math.round(pct * 100)}
        tabIndex={0}
        className="group relative mt-3 h-1.5 cursor-pointer overflow-visible rounded-full bg-[#FDFBF7]/10"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#C4714A] via-[#C9A84C] to-[#F0D78C] shadow-[0_0_8px_rgba(201,168,76,0.55)] transition-[width] duration-150"
          style={{ width: `${Math.min(100, pct * 100)}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] tabular-nums text-[#FDFBF7]/55">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

/* ─────────────────────── Controls ─────────────────────── */

function PlayerControls() {
  const { playing, togglePlay, next, prev, volume, muted, setVolume, toggleMute, repeat, toggleRepeat } =
    useMusicPlayer();
  const [liked, setLiked] = useState(false);
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-4">
        <IconBtn onClick={toggleRepeat} label="Repetir" active={repeat}>
          <Repeat className="h-4 w-4" />
        </IconBtn>
        <IconBtn onClick={prev} label="Anterior">
          <SkipBack className="h-5 w-5 fill-current" />
        </IconBtn>
        <motion.button
          onClick={togglePlay}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative grid h-16 w-16 place-items-center rounded-full border border-[#C9A84C]/60 bg-gradient-to-br from-[#C9A84C] to-[#9C7E2C] text-[#1a0a10] shadow-[0_20px_40px_-12px_rgba(201,168,76,0.55),inset_0_1px_0_rgba(255,235,200,0.4)]"
          aria-label={playing ? "Pausar" : "Tocar"}
        >
          {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-0.5 h-6 w-6 fill-current" />}
        </motion.button>
        <IconBtn onClick={next} label="Próxima">
          <SkipForward className="h-5 w-5 fill-current" />
        </IconBtn>
        <IconBtn onClick={() => setLiked((v) => !v)} label="Favoritar" active={liked}>
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </IconBtn>
      </div>
      <div className="flex w-full items-center gap-3 px-4">
        <button
          onClick={toggleMute}
          aria-label={muted ? "Desmutar" : "Mutar"}
          className="text-[#C9A84C] transition hover:text-[#F0D78C]"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-[#C9A84C]"
          aria-label="Volume"
        />
        <span className="w-8 text-right font-mono text-[10px] tabular-nums text-[#FDFBF7]/55">
          {muted ? 0 : volume}
        </span>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className={`grid h-10 w-10 place-items-center rounded-full border transition-colors ${
        active
          ? "border-[#C9A84C]/70 bg-[#C9A84C]/15 text-[#F0D78C]"
          : "border-[#FDFBF7]/15 text-[#FDFBF7]/70 hover:border-[#C9A84C]/40 hover:text-[#F0D78C]"
      }`}
    >
      {children}
    </motion.button>
  );
}

function EqBars() {
  return (
    <span className="ml-1 flex h-3 items-end gap-[2px]">
      {[0, 1, 2, 3].map((b) => (
        <motion.span
          key={b}
          className="w-[2px] rounded-sm bg-[#C9A84C]"
          animate={{ height: ["4px", "12px", "5px", "10px"] }}
          transition={{ duration: 0.7 + b * 0.12, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/* ─────────────────────── Tracklist ─────────────────────── */

function Tracklist() {
  const { tracks, idx, playing, selectIdx } = useMusicPlayer();
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[#C9A84C]/20 bg-[#1a0a10]/60 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between border-b border-[#C9A84C]/20 pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C9A84C]/80">
          Lado A · Tracklist
        </p>
        <p className="font-mono text-[10px] text-[#FDFBF7]/40">
          {tracks.length.toString().padStart(2, "0")} faixas
        </p>
      </div>
      <ol className="space-y-1">
        {tracks.map((t, i) => {
          const active = i === idx;
          return (
            <li key={i}>
              <motion.button
                onClick={() => selectIdx(i)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.985 }}
                className={`group flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? "border-[#C9A84C]/55 bg-[#C9A84C]/10 text-[#FDFBF7] shadow-[inset_0_0_0_1px_rgba(201,168,76,0.18)]"
                    : "border-transparent text-[#FDFBF7]/70 hover:border-[#C9A84C]/30 hover:bg-[#C9A84C]/5 hover:text-[#FDFBF7]"
                }`}
              >
                <span className="font-mono text-[10px] tabular-nums text-[#C9A84C]/80">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-display italic">{t.title || `Faixa ${i + 1}`}</span>
                  {t.artist && <span className="ml-2 text-xs text-[#FDFBF7]/45">· {t.artist}</span>}
                </span>
                {active && playing && <EqBars />}
              </motion.button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
