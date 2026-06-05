import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Heart,
  Pause,
  Play,
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

export function MusicaGift({ data, title }: { data: MusicaData; title: string }) {
  // Normalize tracks (with legacy fallback)
  const tracks: Track[] = useMemo(() => {
    const arr = (data.tracks ?? []).filter((t) => extractYouTubeId(t?.url));
    if (arr.length === 0 && data.songUrl) {
      arr.push({ url: data.songUrl, title: data.songTitle, artist: data.songArtist });
    }
    return arr.slice(0, 5);
  }, [data.tracks, data.songUrl, data.songTitle, data.songArtist]);

  const mixtapeName = data.mixtapeName || data.songTitle || "Nossa mixtape";
  const created = data.createdDate || new Date().toISOString();

  const [inserted, setInserted] = useState(false);
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

  // Init player when fita inserida
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
              next();
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

  // Load new video when idx changes
  useEffect(() => {
    if (!playerRef.current || !currentId) return;
    try {
      playerRef.current.loadVideoById(currentId);
      setPlaying(true);
    } catch {}
  }, [idx, currentId]);

  // Progress ticker
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
    }, 500);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [playing, duration]);

  // Volume / mute sync
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.setVolume(muted ? 0 : volume);
      muted ? p.mute?.() : p.unMute?.();
    } catch {}
  }, [volume, muted]);

  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  }
  function next() {
    if (tracks.length === 0) return;
    if (idx + 1 >= tracks.length) {
      if (repeat) setIdx(0);
      else {
        setPlaying(false);
        playerRef.current?.pauseVideo?.();
      }
    } else setIdx(idx + 1);
  }
  function prev() {
    if (tracks.length === 0) return;
    if (progress > 3) {
      playerRef.current?.seekTo?.(0, true);
      return;
    }
    setIdx((i) => (i - 1 + tracks.length) % tracks.length);
  }
  function eject() {
    try {
      playerRef.current?.pauseVideo?.();
    } catch {}
    setPlaying(false);
    setInserted(false);
    setProgress(0);
  }
  function toggleLike() {
    setLiked((m) => ({ ...m, [idx]: !m[idx] }));
    setHearts(true);
    window.setTimeout(() => setHearts(false), 1800);
  }

  const prettyDate = new Date(created).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-plum via-[#2b1e4a] to-[#1a0f33] text-cream">
      {/* Ambient wood-grain glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_20%,#8c54a3_0%,transparent_45%),radial-gradient(circle_at_80%_80%,#f47975_0%,transparent_50%)]" />

      <div className="relative mx-auto grid max-w-3xl gap-8 px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-coral">Mixtape</p>
          <h1 className="mt-3 font-display text-5xl leading-tight">{mixtapeName}</h1>
          <p className="mt-2 text-sm text-cream/70">{data.coupleNames} · {prettyDate}</p>
        </motion.div>

        {/* Hidden YouTube player mount */}
        <div className="absolute -z-10 h-0 w-0 overflow-hidden">
          <div ref={mountRef} />
        </div>

        {/* Retro radio */}
        <Radio
          inserted={inserted}
          playing={playing}
          current={current}
          idx={idx}
          total={tracks.length}
          progress={progress}
          duration={duration}
        />

        {/* Cassette */}
        <div className="relative mx-auto h-44 w-full max-w-md">
          <AnimatePresence>
            {!inserted && (
              <motion.div
                key="cassette"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 120, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="absolute inset-0"
              >
                <Cassette
                  spinning={false}
                  label={mixtapeName}
                  couple={data.coupleNames}
                  date={prettyDate}
                  coverUrl={data.coverUrl}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        {tracks.length === 0 ? (
          <p className="text-center text-cream/60">Nenhuma música foi adicionada nesta mixtape.</p>
        ) : !inserted ? (
          <div className="text-center">
            <button
              onClick={() => setInserted(true)}
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-coral to-[#ff9472] px-7 py-3 font-display text-lg text-white shadow-glow transition hover:scale-[1.03]"
            >
              <Play className="h-5 w-5 fill-white" /> Inserir Fita
            </button>
            <p className="mt-3 text-xs uppercase tracking-widest text-cream/50">
              Toque para começar a tocar
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

        {/* Track list */}
        {tracks.length > 0 && (
          <ol className="mx-auto w-full max-w-md space-y-1 rounded-2xl border border-cream/10 bg-cream/5 p-3 backdrop-blur">
            {tracks.map((t, i) => {
              const active = i === idx && inserted;
              return (
                <li key={i}>
                  <button
                    onClick={() => {
                      setIdx(i);
                      if (!inserted) setInserted(true);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                      active ? "bg-coral/20 text-cream" : "hover:bg-cream/10 text-cream/80"
                    }`}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-cream/10 text-xs tabular-nums">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium">{t.title || `Faixa ${i + 1}`}</span>
                      {t.artist && <span className="ml-2 text-cream/60">— {t.artist}</span>}
                    </span>
                    {liked[i] && <Heart className="h-3.5 w-3.5 fill-coral text-coral" />}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {/* Eject message */}
        <AnimatePresence>
          {!inserted && progress === 0 && data.message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto max-w-xl text-center font-display text-2xl italic text-cream/90"
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

      <p className="pb-6 text-center text-xs text-cream/40">{title}</p>
    </div>
  );
}

/* -------------------- Radio -------------------- */
function Radio({
  inserted,
  playing,
  current,
  idx,
  total,
  progress,
  duration,
}: {
  inserted: boolean;
  playing: boolean;
  current?: Track;
  idx: number;
  total: number;
  progress: number;
  duration: number;
}) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative rounded-[2rem] bg-gradient-to-b from-[#3a2510] via-[#5a3a1a] to-[#2a1808] p-6 shadow-[inset_0_2px_8px_rgba(255,255,255,0.15),0_25px_60px_-20px_rgba(0,0,0,0.7)]">
        {/* Top speaker grills + dial */}
        <div className="flex items-center gap-4">
          <SpeakerGrill animate={playing} />
          <div className="flex-1">
            <div className="rounded-lg bg-[#1a0f08] p-3 shadow-inner">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-amber-200/70">
                <span>FM · 98.7</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      inserted ? "bg-red-500" : "bg-red-900"
                    } ${playing ? "animate-pulse" : ""}`}
                  />
                  REC
                </span>
              </div>
              <p className="mt-1 truncate font-mono text-sm text-amber-100">
                {inserted ? current?.title || `Faixa ${idx + 1}` : "—  insira a fita  —"}
              </p>
              <p className="truncate text-[11px] text-amber-200/60">
                {inserted ? current?.artist || "" : "aguardando..."}
              </p>
              {/* tuner bar */}
              <div className="mt-2 flex gap-0.5">
                {Array.from({ length: 32 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-3 w-0.5 rounded-sm ${
                      playing && i < Math.random() * 32
                        ? "bg-amber-300"
                        : i % 4 === 0
                        ? "bg-amber-300/40"
                        : "bg-amber-300/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <SpeakerGrill animate={playing} />
        </div>

        {/* Knobs */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#1a0f08]/60 p-3">
          <Knob label="VOL" rotate={playing ? 80 : 30} />
          <div className="flex-1 px-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-amber-100/10">
              <div
                className="h-full bg-gradient-to-r from-coral to-amber-300 transition-all"
                style={{ width: duration ? `${Math.min(100, (progress / duration) * 100)}%` : "0%" }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-amber-200/70">
              <span>{formatTime(progress)}</span>
              <span>
                📼 {Math.min(idx + 1, Math.max(total, 1))} / {Math.max(total, 1)}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <Knob label="BASS" rotate={playing ? -45 : 0} />
        </div>
      </div>

      {/* Sound waves */}
      <AnimatePresence>
        {playing && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: [0.5, 0], scale: [1, 1.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5 }}
                className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-coral/40"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SpeakerGrill({ animate }: { animate: boolean }) {
  return (
    <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[#1a0f08] shadow-inner">
      <motion.div
        animate={animate ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, repeat: Infinity }}
        className="grid h-16 w-16 grid-cols-4 gap-0.5 rounded-full bg-[#2a1808] p-1"
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="rounded-full bg-amber-950/80" />
        ))}
      </motion.div>
    </div>
  );
}

function Knob({ label, rotate }: { label: string; rotate: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#d4a574] to-[#7a4a20] shadow-md"
        style={{ transform: `rotate(${rotate}deg)`, transition: "transform 0.6s" }}
      >
        <span className="absolute left-1/2 top-1 h-2 w-0.5 -translate-x-1/2 rounded-full bg-amber-100" />
      </div>
      <span className="font-mono text-[9px] uppercase tracking-widest text-amber-200/70">{label}</span>
    </div>
  );
}

/* -------------------- Cassette -------------------- */
function Cassette({
  spinning,
  label,
  couple,
  date,
  coverUrl,
}: {
  spinning: boolean;
  label: string;
  couple: string;
  date: string;
  coverUrl?: string;
}) {
  return (
    <div className="relative h-full w-full rounded-2xl bg-gradient-to-b from-[#f0c1a0] to-[#c98762] p-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_15px_30px_-15px_rgba(0,0,0,0.6)]">
      {/* Label */}
      <div className="relative h-full rounded-md bg-cream p-3 text-plum">
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full rounded-md object-cover opacity-30"
          />
        )}
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-violet">Love Link · Side A</p>
            <p className="mt-1 line-clamp-1 font-display text-lg leading-tight">{label}</p>
          </div>
          <div className="flex items-center justify-between">
            {/* Reels */}
            <Reel spinning={spinning} />
            <p className="text-center text-[10px] leading-tight">
              <span className="block font-display text-sm text-plum">{couple}</span>
              <span className="text-violet">{date}</span>
            </p>
            <Reel spinning={spinning} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Reel({ spinning }: { spinning: boolean }) {
  return (
    <motion.div
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 2, repeat: spinning ? Infinity : 0, ease: "linear" }}
      className="grid h-9 w-9 place-items-center rounded-full border-2 border-plum/30 bg-cream"
    >
      <div className="grid h-6 w-6 grid-cols-3 grid-rows-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className={`rounded-full ${i === 4 ? "bg-plum" : "bg-plum/10"}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* -------------------- Controls -------------------- */
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
      <div className="flex items-center justify-center gap-3">
        <CtrlBtn onClick={props.onPrev} label="Anterior">
          <SkipBack className="h-5 w-5" />
        </CtrlBtn>
        <button
          onClick={props.onTogglePlay}
          className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-coral to-[#ff9472] text-white shadow-glow transition hover:scale-105"
        >
          {props.playing ? <Pause className="h-7 w-7 fill-white" /> : <Play className="h-7 w-7 fill-white" />}
        </button>
        <CtrlBtn onClick={props.onNext} label="Próxima">
          <SkipForward className="h-5 w-5" />
        </CtrlBtn>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-cream/5 px-4 py-3 backdrop-blur">
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
        />
        <CtrlBtn
          onClick={props.onToggleRepeat}
          label="Repetir"
          active={props.repeat}
        >
          <Repeat className="h-4 w-4" />
        </CtrlBtn>
        <CtrlBtn onClick={props.onLike} label="Curtir" active={props.liked}>
          <Heart className={`h-4 w-4 ${props.liked ? "fill-coral text-coral" : ""}`} />
        </CtrlBtn>
      </div>

      <button
        onClick={props.onEject}
        className="mx-auto block rounded-full border border-cream/20 px-5 py-2 text-sm text-cream/80 transition hover:bg-cream/10"
      >
        ⏏️ Ejetar Fita
      </button>
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
    <button
      onClick={onClick}
      aria-label={label}
      className={`grid h-10 w-10 place-items-center rounded-full border border-cream/15 transition hover:bg-cream/10 ${
        active ? "bg-coral/20 text-coral" : "text-cream"
      }`}
    >
      {children}
    </button>
  );
}
