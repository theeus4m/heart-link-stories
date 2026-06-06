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
  createdDate?: string; // ISO
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

// Loads the YouTube IFrame API once
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
  // Normalize tracks (with legacy fallback)
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

  const [inserted, setInserted] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [repeat, setRepeat] = useState(true);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hearts, setHearts] = useState(false);
  const [farewell, setFarewell] = useState(false);

  const playerRef = useRef<any>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const tickRef = useRef<number | null>(null);

  const current = tracks[idx];
  const currentId = extractYouTubeId(current?.url);

  /* ───── Player lifecycle ───── */
  useEffect(() => {
    if (!inserted || !currentId || !mountRef.current) return;
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
  }, [inserted]);

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
  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  }, [playing]);

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

  const seek = useCallback((pct: number) => {
    const p = playerRef.current;
    if (!p?.seekTo || !duration) return;
    const t = Math.max(0, Math.min(1, pct)) * duration;
    p.seekTo(t, true);
    setProgress(t);
  }, [duration]);

  const insertTape = useCallback(() => {
    if (inserted || inserting) return;
    setInserting(true);
    window.setTimeout(() => {
      setInserting(false);
      setInserted(true);
    }, reduceMotion ? 250 : 1400);
  }, [inserted, inserting, reduceMotion]);

  const eject = useCallback(() => {
    try {
      playerRef.current?.pauseVideo?.();
    } catch {}
    setPlaying(false);
    setInserted(false);
    setProgress(0);
    setFarewell(true);
    window.setTimeout(() => setFarewell(false), 4500);
  }, []);

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0805] text-cream">
      {/* atmospheric backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_15%,rgba(140,84,163,0.35)_0%,transparent_50%),radial-gradient(circle_at_85%_90%,rgba(244,121,117,0.30)_0%,transparent_55%),radial-gradient(circle_at_50%_50%,rgba(255,180,120,0.10)_0%,transparent_70%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(255,255,255,.08) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.18) 0 1px,transparent 1px 4px)",
        }}
      />
      {/* film grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.6%22/></svg>')]" />

      <div className="relative mx-auto grid max-w-3xl gap-7 px-4 py-10 sm:gap-10 sm:px-5 sm:py-14">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.55em] text-coral/90 sm:text-xs">
            ★ Mixtape ★
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{mixtapeName}</h1>
          <p className="mt-2 text-xs text-cream/60 sm:text-sm">
            {data.coupleNames} · {prettyDate}
          </p>
        </motion.div>

        {/* Hidden YouTube player mount */}
        <div className="absolute -z-10 h-0 w-0 overflow-hidden">
          <div ref={mountRef} />
        </div>

        {/* Console */}
        <div className="relative mx-auto w-full max-w-md">
          <Console
            inserted={inserted}
            inserting={inserting}
            playing={playing}
            current={current}
            idx={idx}
            total={tracks.length}
            progress={progress}
            duration={duration}
            pct={pct}
            mixtapeName={mixtapeName}
            couple={data.coupleNames}
            date={prettyDate}
            coverUrl={data.coverUrl}
            tracks={tracks}
            liked={liked}
            onSelect={(i) => {
              setIdx(i);
              if (!inserted && !inserting) insertTape();
            }}
            onSeek={seek}
            reduceMotion={!!reduceMotion}
          />
        </div>

        {/* Controls or Insert CTA */}
        {tracks.length === 0 ? (
          <p className="text-center text-cream/60">Nenhuma música foi adicionada nesta mixtape.</p>
        ) : !inserted ? (
          <div className="text-center">
            <motion.button
              onClick={insertTape}
              disabled={inserting}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-coral to-[#ff9472] px-7 py-3 font-display text-lg text-white shadow-[0_15px_40px_-10px_rgba(244,121,117,0.6)] transition disabled:opacity-70"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Play className="h-5 w-5 fill-white" />
              {inserting ? "Inserindo fita…" : "Inserir Fita"}
            </motion.button>
            <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-cream/40">
              toque para começar
            </p>
          </div>
        ) : (
          <PlayerControls
            playing={playing}
            onPrev={prev}
            onNext={next}
            onTogglePlay={togglePlay}
            onEject={eject}
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

        {/* Farewell message after eject */}
        <AnimatePresence>
          {farewell && (
            <motion.div
              key="farewell"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-xl text-center"
            >
              <p className="font-display text-xl italic text-cream/90 sm:text-2xl">
                "Cada música desta fita guarda um momento que vivi ao seu lado."
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sender message (subtle, only before insertion) */}
        <AnimatePresence>
          {!inserted && !inserting && !farewell && data.message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto max-w-xl text-center font-display text-xl italic text-cream/80 sm:text-2xl"
            >
              "{data.message}"
            </motion.p>
          )}
        </AnimatePresence>

        {/* Floating hearts */}
        <AnimatePresence>
          {hearts &&
            Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 300,
                  y: -200 - Math.random() * 200,
                  scale: [0.6, 1.1, 0.9],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, delay: i * 0.05 }}
                className="pointer-events-none fixed bottom-24 left-1/2 z-50"
              >
                <Heart className="h-6 w-6 fill-coral text-coral drop-shadow" />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <p className="pb-6 text-center text-[10px] uppercase tracking-[0.4em] text-cream/30">
        {title}
      </p>
    </div>
  );
}

/* ─────────────────────── Console (wood + radio + deck + tracklist) ─────────────────────── */

function Console(props: {
  inserted: boolean;
  inserting: boolean;
  playing: boolean;
  current?: Track;
  idx: number;
  total: number;
  progress: number;
  duration: number;
  pct: number;
  mixtapeName: string;
  couple: string;
  date: string;
  coverUrl?: string;
  tracks: Track[];
  liked: Record<number, boolean>;
  onSelect: (i: number) => void;
  onSeek: (pct: number) => void;
  reduceMotion: boolean;
}) {
  const {
    inserted,
    inserting,
    playing,
    current,
    idx,
    total,
    progress,
    duration,
    pct,
    mixtapeName,
    couple,
    date,
    coverUrl,
    tracks,
    liked,
    onSelect,
    onSeek,
    reduceMotion,
  } = props;

  return (
    <div
      className="relative rounded-[2rem] p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_15px_30px_-15px_rgba(0,0,0,0.5),inset_0_2px_6px_rgba(255,200,140,0.25)]"
      style={{
        background:
          "linear-gradient(160deg,#6b441f 0%,#8a5424 30%,#4a2f14 65%,#2a1808 100%)",
      }}
    >
      {/* faux wood grain */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(92deg,rgba(0,0,0,.5) 0 2px,transparent 2px 5px),repeating-linear-gradient(180deg,rgba(255,210,150,.18) 0 1px,transparent 1px 8px)",
        }}
      />
      {/* sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/10 via-transparent to-transparent" />

      {/* Brass screws */}
      {["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"].map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos} h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-100 via-amber-400 to-amber-800 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)] ring-1 ring-black/40`}
        >
          <span className="absolute inset-x-[3px] top-1/2 h-px -translate-y-1/2 bg-black/40" />
        </span>
      ))}

      <Radio
        inserted={inserted}
        playing={playing}
        current={current}
        idx={idx}
        total={total}
        progress={progress}
        duration={duration}
        pct={pct}
        onSeek={onSeek}
      />

      {/* Cassette deck window */}
      <div className="relative mx-3 mt-3 overflow-hidden rounded-2xl border border-amber-950/80 bg-gradient-to-b from-[#0a0604] to-[#1a0f08] p-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)]">
        {/* glass reflection */}
        <div className="pointer-events-none absolute inset-x-3 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent" />
        {/* deck slot guides */}
        <div className="pointer-events-none absolute inset-x-5 top-0 h-[1px] bg-amber-100/10" />
        <div className="pointer-events-none absolute inset-x-5 bottom-0 h-[1px] bg-amber-100/10" />

        <div className="relative h-44 sm:h-48">
          <AnimatePresence mode="wait">
            {!inserted && !inserting ? (
              <motion.div
                key="cassette-rest"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -160, rotate: -4, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 90, damping: 18 }}
                className="absolute inset-0"
              >
                <Cassette
                  spinning={false}
                  pct={0}
                  label={mixtapeName}
                  couple={couple}
                  date={date}
                  coverUrl={coverUrl}
                  reduceMotion={reduceMotion}
                />
              </motion.div>
            ) : inserting ? (
              <motion.div
                key="cassette-inserting"
                initial={{ y: -200, rotate: -3, opacity: 0.9, scale: 0.95 }}
                animate={{
                  y: [-200, -40, 6, 0],
                  rotate: [-3, -1, 0, 0],
                  opacity: 1,
                  scale: [0.95, 0.98, 1, 1],
                }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], times: [0, 0.45, 0.85, 1] }}
                className="absolute inset-0"
              >
                <Cassette
                  spinning={false}
                  pct={0}
                  label={mixtapeName}
                  couple={couple}
                  date={date}
                  coverUrl={coverUrl}
                  reduceMotion={reduceMotion}
                />
              </motion.div>
            ) : (
              <motion.div
                key="cassette-in"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Cassette
                  spinning={playing}
                  pct={pct}
                  label={current?.title || mixtapeName}
                  couple={couple}
                  date={date}
                  coverUrl={coverUrl}
                  reduceMotion={reduceMotion}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tracklist — Program Selector */}
      {tracks.length > 0 && (
        <div className="mx-3 mb-1 mt-3 rounded-2xl border border-amber-900/70 bg-[#120a05]/95 p-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
          <div className="mb-2 flex items-center justify-between border-b border-amber-900/60 pb-1.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
              Program Selector
            </p>
            <p className="font-mono text-[10px] text-amber-200/60">
              {Math.min(idx + 1, tracks.length).toString().padStart(2, "0")}/
              {tracks.length.toString().padStart(2, "0")}
            </p>
          </div>
          <ol className="space-y-1">
            {tracks.map((t, i) => {
              const active = i === idx && inserted;
              return (
                <li key={i}>
                  <motion.button
                    onClick={() => onSelect(i)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.985 }}
                    className={`group flex w-full items-center gap-3 rounded-md border px-2.5 py-1.5 text-left font-mono text-[12px] transition-colors ${
                      active
                        ? "border-amber-300/60 bg-amber-200/10 text-amber-100 shadow-[inset_0_0_0_1px_rgba(255,210,140,.2)]"
                        : "border-amber-950/60 bg-black/30 text-amber-100/70 hover:border-amber-700/70 hover:bg-amber-900/20 hover:text-amber-100"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ring-1 ring-black/60 ${
                        active
                          ? "bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)] animate-pulse"
                          : "bg-red-950"
                      }`}
                    />
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 text-[10px] font-bold tabular-nums text-amber-950 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.3)]">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      <span className="uppercase tracking-wider">
                        {t.title || `Track ${i + 1}`}
                      </span>
                      {t.artist && (
                        <span className="ml-2 normal-case text-amber-200/50">· {t.artist}</span>
                      )}
                    </span>
                    {liked[i] && <Heart className="h-3.5 w-3.5 fill-coral text-coral" />}
                    {active && playing && <EqBars />}
                  </motion.button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Radio (top panel) ─────────────────────── */

function Radio({
  inserted,
  playing,
  current,
  idx,
  total,
  progress,
  duration,
  pct,
  onSeek,
}: {
  inserted: boolean;
  playing: boolean;
  current?: Track;
  idx: number;
  total: number;
  progress: number;
  duration: number;
  pct: number;
  onSeek: (pct: number) => void;
}) {
  // deterministic VU bars driven by progress (no per-frame Math.random churn)
  const vu = useMemo(() => {
    const seed = Math.floor(progress * 4);
    return Array.from({ length: 32 }).map((_, i) => {
      const v = (Math.sin(seed * 0.6 + i * 0.7) + Math.sin(seed * 0.21 + i * 1.3)) * 0.5 + 0.5;
      return v;
    });
  }, [progress]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !duration) return;
    const r = el.getBoundingClientRect();
    const p = (e.clientX - r.left) / r.width;
    onSeek(p);
  };

  return (
    <div className="relative mx-3 mt-0">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#2a1808] via-[#1a1006] to-[#0a0503] p-4 shadow-[inset_0_2px_8px_rgba(255,200,140,0.18),inset_0_-3px_8px_rgba(0,0,0,0.7)] sm:p-5">
        {/* Top: speakers + display */}
        <div className="flex items-center gap-3 sm:gap-4">
          <SpeakerGrill animate={playing} />
          <div className="flex-1">
            <div className="rounded-lg bg-gradient-to-b from-[#0a0604] to-[#1a0f08] p-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),inset_0_-1px_2px_rgba(255,180,100,0.1)] ring-1 ring-amber-100/5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-amber-200/70">
                <span className="font-mono">FM · 98.7</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${inserted ? "bg-red-500" : "bg-red-900"} ${
                      playing ? "shadow-[0_0_6px_2px_rgba(239,68,68,0.7)] animate-pulse" : ""
                    }`}
                  />
                  REC
                </span>
              </div>

              {/* Now playing — animated swap */}
              <div className="relative mt-1 h-9 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={inserted ? idx : "rest"}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="truncate font-mono text-sm text-amber-100">
                      {inserted ? current?.title || `Faixa ${idx + 1}` : "—  insira a fita  —"}
                    </p>
                    <p className="truncate text-[11px] text-amber-200/60">
                      {inserted ? current?.artist || "" : "aguardando…"}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* tuner / VU */}
              <div className="mt-2 flex h-3 items-end gap-0.5">
                {vu.map((v, i) => {
                  const lit = playing && v > 0.35;
                  const tall = playing ? 4 + v * 8 : 3;
                  return (
                    <span
                      key={i}
                      className={`w-0.5 rounded-sm transition-all duration-150 ${
                        lit
                          ? i > 26
                            ? "bg-red-400"
                            : i > 20
                            ? "bg-amber-300"
                            : "bg-amber-400"
                          : i % 4 === 0
                          ? "bg-amber-300/30"
                          : "bg-amber-300/10"
                      }`}
                      style={{ height: `${tall}px` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <SpeakerGrill animate={playing} />
        </div>

        {/* Bottom: knobs + seek bar */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#0a0604]/60 p-3 ring-1 ring-amber-100/5 sm:mt-5 sm:gap-4">
          <Knob label="VOL" rotate={playing ? 80 : 30} />
          <div className="flex-1">
            <div
              ref={trackRef}
              onClick={handleSeek}
              role="slider"
              aria-label="Posição da faixa"
              aria-valuenow={Math.round(pct * 100)}
              tabIndex={0}
              className="group relative h-2 cursor-pointer overflow-visible rounded-full bg-amber-100/10 shadow-inner"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-coral via-amber-300 to-amber-200 shadow-[0_0_8px_rgba(255,180,100,0.5)] transition-[width] duration-150"
                style={{ width: `${Math.min(100, pct * 100)}%` }}
              />
              <span
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100 opacity-0 shadow-[0_0_8px_rgba(255,210,140,0.6)] ring-2 ring-amber-700 transition-opacity group-hover:opacity-100"
                style={{ left: `${Math.min(100, pct * 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10px] tabular-nums text-amber-200/70">
              <span>{formatTime(progress)}</span>
              <span className="text-amber-200/50">
                📼 {Math.min(idx + 1, Math.max(total, 1))} / {Math.max(total, 1)}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <Knob label="BASS" rotate={playing ? -45 : 0} />
        </div>
      </div>
    </div>
  );
}

function SpeakerGrill({ animate }: { animate: boolean }) {
  return (
    <div className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#1a0f08] to-[#0a0503] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_2px_4px_rgba(255,180,100,0.15)] sm:h-20 sm:w-20">
      <motion.div
        animate={animate ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        className="grid h-12 w-12 grid-cols-4 gap-0.5 rounded-full bg-[#1a0f08] p-1 ring-1 ring-amber-100/5 sm:h-16 sm:w-16"
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="rounded-full bg-gradient-to-br from-amber-950 to-black shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)]"
          />
        ))}
      </motion.div>
    </div>
  );
}

function Knob({ label, rotate }: { label: string; rotate: number }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="relative h-10 w-10 rounded-full bg-[#0a0604] p-[2px] shadow-[inset_0_2px_3px_rgba(0,0,0,0.7)]">
        <div
          className="relative h-full w-full rounded-full bg-gradient-to-br from-[#e8c187] via-[#a87440] to-[#5a3a1a] shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          style={{ transform: `rotate(${rotate}deg)`, transition: "transform 0.6s ease-out" }}
        >
          <span className="absolute left-1/2 top-1 h-2.5 w-0.5 -translate-x-1/2 rounded-full bg-amber-50 shadow" />
          <span className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
        </div>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-widest text-amber-200/70">{label}</span>
    </div>
  );
}

function EqBars() {
  return (
    <span className="ml-1 flex h-4 items-end gap-[2px]">
      {[0, 1, 2].map((b) => (
        <motion.span
          key={b}
          className="w-[2px] rounded-sm bg-amber-300"
          animate={{ height: ["5px", "13px", "4px", "11px"] }}
          transition={{ duration: 0.7 + b * 0.15, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/* ─────────────────────── Cassette ─────────────────────── */

function Cassette({
  spinning,
  pct,
  label,
  couple,
  date,
  coverUrl,
  reduceMotion,
}: {
  spinning: boolean;
  pct: number; // 0..1 — tape progress (drives reel sizes)
  label: string;
  couple: string;
  date: string;
  coverUrl?: string;
  reduceMotion: boolean;
}) {
  // Reel tape diameters: left shrinks as tape unwinds onto right.
  const leftR = 11 - pct * 5; // 11 → 6
  const rightR = 6 + pct * 5; // 6 → 11

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl p-3 sm:p-4"
      style={{
        background:
          "linear-gradient(180deg,#f4c8a6 0%,#e0a47c 45%,#c98762 100%)",
        boxShadow:
          "inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 8px rgba(0,0,0,0.25), 0 18px 35px -18px rgba(0,0,0,0.7)",
      }}
    >
      {/* plastic sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-black/20" />
      {/* corner screws */}
      {["left-1.5 top-1.5", "right-1.5 top-1.5", "left-1.5 bottom-1.5", "right-1.5 bottom-1.5"].map(
        (pos, i) => (
          <span
            key={i}
            className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-gradient-to-br from-amber-100 to-amber-700 ring-1 ring-black/30`}
          />
        ),
      )}

      {/* Label */}
      <div className="relative h-full overflow-hidden rounded-md bg-cream p-3 text-plum shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]">
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}
        {/* paper texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg,rgba(122,68,32,0.06) 0 1px,transparent 1px 4px)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-violet/80">
              Love Link · Side A
            </p>
            <p className="mt-1 line-clamp-1 font-display text-lg leading-tight sm:text-xl">
              {label}
            </p>
          </div>

          {/* Reels with simulated tape between them */}
          <div className="relative flex items-center justify-between">
            <Reel spinning={spinning} radius={leftR} reduceMotion={reduceMotion} />

            {/* Tape strand between reels */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 mx-9 h-[2px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#3a2510] via-[#1a0f08] to-[#3a2510] opacity-80" />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 mx-9 h-px translate-y-[2px] bg-amber-50/30" />

            <div className="relative z-10 px-2 text-center text-[10px] leading-tight">
              <span className="block font-display text-sm text-plum sm:text-base">{couple}</span>
              <span className="text-violet">{date}</span>
            </div>

            <Reel spinning={spinning} radius={rightR} reduceMotion={reduceMotion} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Reel({
  spinning,
  radius,
  reduceMotion,
}: {
  spinning: boolean;
  radius: number; // visual tape radius in arbitrary units (6..11)
  reduceMotion: boolean;
}) {
  // Faster spin when reel is smaller (just like real tape)
  const duration = 1.3 + (radius - 6) * 0.18;
  // Tape pad size — visible darker ring around the hub
  const tapeSize = 16 + (radius - 6) * 2.2; // 16..27
  return (
    <div className="relative grid h-11 w-11 place-items-center sm:h-12 sm:w-12">
      {/* Tape pad (the wound tape) */}
      <div
        className="absolute rounded-full bg-gradient-to-br from-[#2a1808] to-[#0a0503] shadow-[inset_0_0_4px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-[width,height] duration-700 ease-out"
        style={{ width: `${tapeSize}px`, height: `${tapeSize}px` }}
      />
      {/* Hub */}
      <motion.div
        animate={spinning && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration, repeat: spinning && !reduceMotion ? Infinity : 0, ease: "linear" }}
        className="relative z-10 grid h-7 w-7 place-items-center rounded-full border border-plum/30 bg-cream shadow-[0_1px_2px_rgba(0,0,0,0.3)] sm:h-8 sm:w-8"
      >
        {/* 6-tooth hub */}
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-plum/80 sm:h-6 sm:w-6">
          <circle cx="12" cy="12" r="3" />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const x = 12 + Math.cos(a) * 8;
            const y = 12 + Math.sin(a) * 8;
            return <circle key={i} cx={x} cy={y} r="1.5" />;
          })}
        </svg>
      </motion.div>
    </div>
  );
}

/* ─────────────────────── Controls ─────────────────────── */

function PlayerControls(props: {
  playing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onEject: () => void;
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
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="flex items-center justify-center gap-4">
        <CtrlBtn onClick={props.onPrev} label="Anterior">
          <SkipBack className="h-5 w-5" />
        </CtrlBtn>
        <motion.button
          onClick={props.onTogglePlay}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label={props.playing ? "Pausar" : "Tocar"}
          className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-coral to-[#ff9472] text-white shadow-[0_12px_30px_-8px_rgba(244,121,117,0.7),inset_0_2px_2px_rgba(255,255,255,0.4)]"
        >
          <span className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
          {props.playing ? (
            <Pause className="relative h-7 w-7 fill-white" />
          ) : (
            <Play className="relative h-7 w-7 fill-white" />
          )}
        </motion.button>
        <CtrlBtn onClick={props.onNext} label="Próxima">
          <SkipForward className="h-5 w-5" />
        </CtrlBtn>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-cream/10 bg-cream/[0.04] px-4 py-3 shadow-inner backdrop-blur">
        <CtrlBtn onClick={props.onToggleMute} label="Volume">
          {props.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </CtrlBtn>
        <input
          type="range"
          min={0}
          max={100}
          value={props.muted ? 0 : props.volume}
          onChange={(e) => props.onVolume(Number(e.target.value))}
          className="flex-1 accent-coral"
          aria-label="Volume"
        />
        <CtrlBtn onClick={props.onToggleRepeat} label="Repetir" active={props.repeat}>
          <Repeat className="h-4 w-4" />
        </CtrlBtn>
        <CtrlBtn onClick={props.onLike} label="Curtir" active={props.liked}>
          <Heart className={`h-4 w-4 ${props.liked ? "fill-coral text-coral" : ""}`} />
        </CtrlBtn>
      </div>

      <motion.button
        onClick={props.onEject}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        className="mx-auto flex items-center gap-2 rounded-full border border-cream/20 bg-cream/[0.04] px-5 py-2 text-sm text-cream/80 transition hover:border-cream/40 hover:bg-cream/10 hover:text-cream"
      >
        <Power className="h-3.5 w-3.5" /> Ejetar Fita
      </motion.button>
    </div>
  );
}

function CtrlBtn({
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
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      className={`grid h-10 w-10 place-items-center rounded-full border border-cream/15 bg-cream/[0.03] transition-colors hover:border-cream/30 hover:bg-cream/10 ${
        active ? "border-coral/40 bg-coral/15 text-coral" : "text-cream"
      }`}
    >
      {children}
    </motion.button>
  );
}
