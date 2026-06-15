import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Heart,
  Pause,
  Play,
  Power,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

export type Track = { url: string; title?: string; artist?: string };

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

/* ─────────────────────── helpers ─────────────────────── */

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

let ytPromise: Promise<any> | null = null;
function loadYT(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject();
  // @ts-expect-error YT global
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytPromise) return ytPromise;
  ytPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    // @ts-expect-error global callback
    window.onYouTubeIframeAPIReady = () => {
      // @ts-expect-error YT global
      resolve(window.YT);
    };
  });
  return ytPromise;
}

/* ─────────────────────── main ─────────────────────── */

export function MusicaGift({ data, title }: { data: MusicaData; title: string }) {
  const tracks: Track[] = useMemo(() => {
    const arr = (data.tracks ?? []).filter((t) => extractYouTubeId(t?.url));
    if (arr.length === 0 && data.songUrl) {
      arr.push({ url: data.songUrl, title: data.songTitle, artist: data.songArtist });
    }
    return arr.slice(0, 5);
  }, [data.tracks, data.songUrl, data.songTitle, data.songArtist]);

  const mixtapeName = data.mixtapeName || data.songTitle || "Nossa Mixtape";
  const created = data.createdDate || new Date().toISOString();

  const reduceMotion = useReducedMotion();

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [repeat, setRepeat] = useState(true);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hearts, setHearts] = useState(false);

  const playerRef = useRef<any>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const tickRef = useRef<number | null>(null);

  const current = tracks[idx];
  const currentId = extractYouTubeId(current?.url);

  /* ───── Player lifecycle ───── */
  useEffect(() => {
    if (!started || !currentId || !mountRef.current) return;
    let cancelled = false;
    loadYT().then((YT) => {
      if (cancelled || !mountRef.current) return;
      if (playerRef.current) {
        playerRef.current.loadVideoById(currentId);
        return;
      }
      playerRef.current = new YT.Player(mountRef.current, {
        height: "0",
        width: "0",
        videoId: currentId,
        playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume);
            e.target.playVideo();
            setPlaying(true);
            setDuration(e.target.getDuration() || 0);
          },
          onStateChange: (e: any) => {
            const YTPS = (window as any).YT.PlayerState;
            if (e.data === YTPS.PLAYING) {
              setPlaying(true);
              setDuration(playerRef.current?.getDuration?.() || 0);
            } else if (e.data === YTPS.PAUSED) {
              setPlaying(false);
            } else if (e.data === YTPS.ENDED) {
              nextRef.current?.();
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  useEffect(() => {
    if (!playerRef.current || !currentId) return;
    try {
      playerRef.current.loadVideoById(currentId);
      setPlaying(true);
      setProgress(0);
    } catch {}
  }, [idx, currentId]);

  useEffect(() => {
    if (!playing) {
      if (tickRef.current) window.clearInterval(tickRef.current);
      return;
    }
    tickRef.current = window.setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      setProgress(p.getCurrentTime() || 0);
      const d = p.getDuration?.() || 0;
      if (d && d !== duration) setDuration(d);
    }, 250);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [playing, duration]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.setVolume(muted ? 0 : volume);
      muted ? p.mute?.() : p.unMute?.();
    } catch {}
  }, [volume, muted]);

  /* ───── actions ───── */
  const start = useCallback(() => setStarted(true), []);
  const togglePlay = useCallback(() => {
    if (!started) {
      setStarted(true);
      return;
    }
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  }, [playing, started]);

  const next = useCallback(() => {
    if (tracks.length === 0) return;
    if (idx + 1 >= tracks.length) {
      if (repeat) setIdx(0);
      else {
        setPlaying(false);
        playerRef.current?.pauseVideo?.();
      }
    } else setIdx(idx + 1);
  }, [idx, tracks.length, repeat]);

  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const prev = useCallback(() => {
    if (tracks.length === 0) return;
    if (progress > 3) {
      playerRef.current?.seekTo?.(0, true);
      setProgress(0);
      return;
    }
    setIdx((i) => (i - 1 + tracks.length) % tracks.length);
  }, [tracks.length, progress]);

  const seek = useCallback(
    (pct: number) => {
      const p = playerRef.current;
      if (!p?.seekTo || !duration) return;
      const t = Math.max(0, Math.min(1, pct)) * duration;
      p.seekTo(t, true);
      setProgress(t);
    },
    [duration],
  );

  const toggleLike = useCallback(() => {
    setLiked((m) => ({ ...m, [idx]: !m[idx] }));
    setHearts(true);
    window.setTimeout(() => setHearts(false), 1800);
  }, [idx]);

  const prettyDate = useMemo(
    () =>
      new Date(created).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [created],
  );

  const pct = duration > 0 ? progress / duration : 0;

  // golden particles drifting around the turntable while playing
  const particles = useMemo(
    () =>
      [...Array(14)].map((_, i) => ({
        id: i,
        angle: (i / 14) * Math.PI * 2,
        radius: 160 + Math.random() * 80,
        size: 2 + Math.random() * 2.5,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a0a10] text-[#FDFBF7]">
      {/* atmospheric backdrop — wine to ink with gold vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.22),transparent_55%),radial-gradient(ellipse_at_center,rgba(107,39,55,0.5),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(26,10,16,1),transparent_80%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />

      <div className="relative mx-auto grid max-w-3xl gap-10 px-5 py-12 sm:py-16">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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

        {/* Hidden YouTube mount */}
        <div className="absolute -z-10 h-0 w-0 overflow-hidden">
          <div ref={mountRef} />
        </div>

        {/* Turntable scene */}
        <div className="relative mx-auto w-full max-w-md">
          {/* golden particles around the deck */}
          {started && playing && !reduceMotion && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-0 w-0">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full bg-[#F0D78C]"
                  style={{
                    width: p.size,
                    height: p.size,
                    boxShadow: "0 0 10px 1px rgba(240,215,140,0.9)",
                    filter: "blur(0.3px)",
                    marginLeft: -p.size / 2,
                    marginTop: -p.size / 2,
                  }}
                  animate={{
                    x: [
                      Math.cos(p.angle) * p.radius,
                      Math.cos(p.angle + 0.6) * p.radius,
                      Math.cos(p.angle + 1.2) * p.radius,
                    ],
                    y: [
                      Math.sin(p.angle) * p.radius - 20,
                      Math.sin(p.angle + 0.6) * p.radius - 40,
                      Math.sin(p.angle + 1.2) * p.radius - 60,
                    ],
                    opacity: [0, 1, 0],
                    scale: [0.4, 1.2, 0.4],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}

          <Turntable
            playing={playing && started}
            started={started}
            coverUrl={data.coverUrl}
            mixtapeName={mixtapeName}
            couple={data.coupleNames}
            reduceMotion={!!reduceMotion}
            onStart={start}
          />
        </div>

        {/* Now playing display */}
        {started && (
          <NowPlaying
            current={current}
            idx={idx}
            total={tracks.length}
            progress={progress}
            duration={duration}
            pct={pct}
            playing={playing}
            onSeek={seek}
          />
        )}

        {/* Controls */}
        {tracks.length === 0 ? (
          <p className="text-center text-[#FDFBF7]/60">
            Nenhuma música foi adicionada nesta mixtape.
          </p>
        ) : !started ? (
          <div className="text-center">
            <motion.button
              onClick={start}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#C9A84C]/60 bg-gradient-to-br from-[#C9A84C] to-[#9C7E2C] px-8 py-3 font-display text-lg italic text-[#1a0a10] shadow-[0_18px_40px_-12px_rgba(201,168,76,0.6)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Play className="h-5 w-5 fill-[#1a0a10]" />
              Tocar o disco
            </motion.button>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.4em] text-[#FDFBF7]/40">
              pouse a agulha
            </p>
          </div>
        ) : (
          <PlayerControls
            playing={playing}
            onPrev={prev}
            onNext={next}
            onTogglePlay={togglePlay}
            onLike={toggleLike}
            liked={!!liked[idx]}
            volume={volume}
            muted={muted}
            onVolume={setVolume}
            onToggleMute={() => setMuted((m) => !m)}
            repeat={repeat}
            onToggleRepeat={() => setRepeat((r) => !r)}
          />
        )}

        {/* Tracklist */}
        {tracks.length > 0 && (
          <Tracklist
            tracks={tracks}
            currentIdx={idx}
            playing={playing && started}
            liked={liked}
            onSelect={(i) => {
              setIdx(i);
              if (!started) setStarted(true);
            }}
          />
        )}

        {/* Optional dedication */}
        {data.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9 }}
            className="mx-auto max-w-xl text-center font-display text-xl italic text-[#FDFBF7]/80 sm:text-2xl"
          >
            "{data.message}"
          </motion.p>
        )}

        {/* Floating hearts on like */}
        <AnimatePresence>
          {hearts &&
            Array.from({ length: 16 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 320,
                  y: -200 - Math.random() * 220,
                  scale: [0.6, 1.15, 0.9],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.7, delay: i * 0.04 }}
                className="pointer-events-none fixed bottom-24 left-1/2 z-50"
              >
                <Heart className="h-6 w-6 fill-[#C4714A] text-[#C4714A] drop-shadow" />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <p className="pb-6 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-[#FDFBF7]/30">
        {title}
      </p>
    </div>
  );
}

/* ─────────────────────── Turntable ─────────────────────── */

function Turntable({
  playing,
  started,
  coverUrl,
  mixtapeName,
  couple,
  reduceMotion,
  onStart,
}: {
  playing: boolean;
  started: boolean;
  coverUrl?: string;
  mixtapeName: string;
  couple: string;
  reduceMotion: boolean;
  onStart: () => void;
}) {
  return (
    <div
      className="relative aspect-square w-full rounded-[2rem] p-6 shadow-[0_50px_90px_-30px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,220,170,0.15),inset_0_-4px_10px_rgba(0,0,0,0.5)]"
      style={{
        background:
          "linear-gradient(160deg,#3a1a22 0%,#2a0f17 35%,#1a0710 65%,#0d030a 100%)",
      }}
    >
      {/* fine grain wood / leather overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(92deg,rgba(0,0,0,.4) 0 2px,transparent 2px 6px),repeating-linear-gradient(180deg,rgba(255,210,150,.16) 0 1px,transparent 1px 10px)",
        }}
      />
      {/* gold inner frame */}
      <div className="pointer-events-none absolute inset-3 rounded-[1.6rem] border border-[#C9A84C]/35" />
      <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-[#C9A84C]/15" />

      {/* brass screws */}
      {["left-4 top-4", "right-4 top-4", "left-4 bottom-4", "right-4 bottom-4"].map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos} h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#F0D78C] via-[#C9A84C] to-[#6B5020] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)] ring-1 ring-black/40`}
        >
          <span className="absolute inset-x-[3px] top-1/2 h-px -translate-y-1/2 bg-black/40" />
        </span>
      ))}

      {/* watermark monogram */}
      <p className="pointer-events-none absolute right-6 top-5 font-display text-xs italic tracking-[0.3em] text-[#C9A84C]/40">
        Chronelo
      </p>

      {/* Vinyl platter */}
      <div className="relative grid h-full w-full place-items-center">
        <button
          type="button"
          onClick={!started ? onStart : undefined}
          aria-label={started ? "Vinil" : "Tocar disco"}
          className="relative aspect-square w-[88%] cursor-pointer"
          style={{ cursor: started ? "default" : "pointer" }}
        >
          {/* outer halo */}
          <div className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.18),transparent_70%)] blur-xl" />

          <motion.div
            className="relative h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, #1a0a10 0%, #0a0407 65%, #000 100%)",
              boxShadow:
                "0 25px 50px -15px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(201,168,76,0.18), inset 0 4px 8px rgba(255,210,150,0.08)",
            }}
            animate={playing && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
            transition={
              playing && !reduceMotion
                ? { duration: 6, repeat: Infinity, ease: "linear" }
                : { duration: 0.6 }
            }
          >
            {/* vinyl grooves — concentric rings */}
            {Array.from({ length: 22 }).map((_, i) => {
              const inset = 6 + i * 1.6;
              return (
                <div
                  key={i}
                  className="pointer-events-none absolute rounded-full border border-[#FDFBF7]/[0.04]"
                  style={{ inset: `${inset}%` }}
                />
              );
            })}
            {/* highlight reflection */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_140deg,transparent_0deg,rgba(255,220,170,0.06)_60deg,transparent_120deg,transparent_240deg,rgba(255,220,170,0.04)_300deg,transparent_360deg)]" />

            {/* center label */}
            <div
              className="absolute left-1/2 top-1/2 grid aspect-square w-[36%] -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_4px_10px_rgba(0,0,0,0.4)]"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #9B3344 0%, #6B2737 55%, #3F1620 100%)",
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
                <p className="font-display text-[10px] italic tracking-[0.3em] text-[#C9A84C]">
                  CHRONELO
                </p>
                <p className="mt-1 line-clamp-2 font-display text-xs italic leading-tight text-[#FDFBF7]">
                  {mixtapeName}
                </p>
                <p className="mt-1 truncate font-mono text-[8px] uppercase tracking-[0.25em] text-[#FDFBF7]/60">
                  {couple}
                </p>
              </div>
              {/* spindle */}
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a0a10] ring-1 ring-[#C9A84C]/40" />
            </div>
          </motion.div>

          {/* Tonearm */}
          <motion.div
            className="pointer-events-none absolute -right-2 -top-2 h-[55%] w-[55%] origin-top-right"
            animate={{ rotate: started ? 28 : 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-[0_8px_14px_rgba(0,0,0,0.6)]">
              <defs>
                <linearGradient id="arm" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#F0D78C" />
                  <stop offset="50%" stopColor="#C9A84C" />
                  <stop offset="100%" stopColor="#6B5020" />
                </linearGradient>
              </defs>
              {/* pivot base */}
              <circle cx="170" cy="30" r="18" fill="url(#arm)" stroke="#3a2510" strokeWidth="1.5" />
              <circle cx="170" cy="30" r="9" fill="#1a0a10" />
              {/* arm */}
              <rect
                x="50"
                y="26"
                width="120"
                height="8"
                rx="3"
                fill="url(#arm)"
                stroke="#3a2510"
                strokeOpacity="0.5"
                strokeWidth="0.8"
                transform="rotate(35 170 30)"
              />
              {/* headshell */}
              <g transform="rotate(35 170 30) translate(50 22)">
                <rect x="-12" y="-2" width="20" height="16" rx="2" fill="#1a0a10" stroke="#C9A84C" strokeWidth="0.8" />
                <rect x="-9" y="10" width="14" height="6" rx="1" fill="#3a1a22" />
              </g>
            </svg>
          </motion.div>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── Now playing display ─────────────────────── */

function NowPlaying({
  current,
  idx,
  total,
  progress,
  duration,
  pct,
  playing,
  onSeek,
}: {
  current?: Track;
  idx: number;
  total: number;
  progress: number;
  duration: number;
  pct: number;
  playing: boolean;
  onSeek: (pct: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !duration) return;
    const r = el.getBoundingClientRect();
    const p = (e.clientX - r.left) / r.width;
    onSeek(p);
  };
  return (
    <div className="relative mx-auto w-full max-w-md rounded-2xl border border-[#C9A84C]/25 bg-[#1a0a10]/70 p-5 shadow-[inset_0_1px_0_rgba(255,220,170,0.08),0_20px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.35em] text-[#C9A84C]/70">
        <span>Faixa {Math.min(idx + 1, Math.max(total, 1)).toString().padStart(2, "0")} / {Math.max(total, 1).toString().padStart(2, "0")}</span>
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
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FDFBF7] opacity-0 shadow-[0_0_8px_rgba(201,168,76,0.7)] ring-2 ring-[#C9A84C] transition-opacity group-hover:opacity-100"
          style={{ left: `${Math.min(100, pct * 100)}%` }}
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

function PlayerControls({
  playing,
  onPrev,
  onNext,
  onTogglePlay,
  onLike,
  liked,
  volume,
  muted,
  onVolume,
  onToggleMute,
  repeat,
  onToggleRepeat,
}: {
  playing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onLike: () => void;
  liked: boolean;
  volume: number;
  muted: boolean;
  onVolume: (v: number) => void;
  onToggleMute: () => void;
  repeat: boolean;
  onToggleRepeat: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-4">
        <IconBtn onClick={onToggleRepeat} label="Repetir" active={repeat}>
          <Repeat className="h-4 w-4" />
        </IconBtn>
        <IconBtn onClick={onPrev} label="Anterior">
          <SkipBack className="h-5 w-5 fill-current" />
        </IconBtn>

        <motion.button
          onClick={onTogglePlay}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative grid h-16 w-16 place-items-center rounded-full border border-[#C9A84C]/60 bg-gradient-to-br from-[#C9A84C] to-[#9C7E2C] text-[#1a0a10] shadow-[0_20px_40px_-12px_rgba(201,168,76,0.55),inset_0_1px_0_rgba(255,235,200,0.4)]"
          aria-label={playing ? "Pausar" : "Tocar"}
        >
          {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-0.5 h-6 w-6 fill-current" />}
        </motion.button>

        <IconBtn onClick={onNext} label="Próxima">
          <SkipForward className="h-5 w-5 fill-current" />
        </IconBtn>
        <IconBtn onClick={onLike} label="Favoritar" active={liked}>
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </IconBtn>
      </div>

      <div className="flex w-full items-center gap-3 px-4">
        <button
          onClick={onToggleMute}
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
          onChange={(e) => onVolume(Number(e.target.value))}
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

function Tracklist({
  tracks,
  currentIdx,
  playing,
  liked,
  onSelect,
}: {
  tracks: Track[];
  currentIdx: number;
  playing: boolean;
  liked: Record<number, boolean>;
  onSelect: (i: number) => void;
}) {
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
          const active = i === currentIdx;
          return (
            <li key={i}>
              <motion.button
                onClick={() => onSelect(i)}
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
                  {t.artist && (
                    <span className="ml-2 text-xs text-[#FDFBF7]/45">· {t.artist}</span>
                  )}
                </span>
                {liked[i] && <Heart className="h-3.5 w-3.5 fill-[#C4714A] text-[#C4714A]" />}
                {active && playing && <EqBars />}
              </motion.button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
