import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Track = { url: string; title?: string; artist?: string };

export function extractYouTubeId(url?: string): string | null {
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

type Ctx = {
  tracks: Track[];
  idx: number;
  current: Track | undefined;
  started: boolean;
  playing: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  repeat: boolean;
  start: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (pct: number) => void;
  selectIdx: (i: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
};

const MusicPlayerCtx = createContext<Ctx | null>(null);

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerCtx);
  if (!ctx) throw new Error("useMusicPlayer must be used inside MusicPlayerProvider");
  return ctx;
}

export function useMusicPlayerOptional() {
  return useContext(MusicPlayerCtx);
}

export function MusicPlayerProvider({
  tracks: rawTracks,
  children,
}: {
  tracks: Track[];
  children: React.ReactNode;
}) {
  const tracks = useMemo(
    () => (rawTracks ?? []).filter((t) => extractYouTubeId(t?.url)).slice(0, 8),
    [rawTracks],
  );

  const [idx, setIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(75);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState(true);

  const playerRef = useRef<any>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const tickRef = useRef<number | null>(null);
  const nextRef = useRef<() => void>(() => {});

  const current = tracks[idx];
  const currentId = extractYouTubeId(current?.url);

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

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  // Mount YT player once when "started" flips on
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
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
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

  // Switch track when idx changes and player already exists
  useEffect(() => {
    if (!playerRef.current || !currentId) return;
    try {
      playerRef.current.loadVideoById(currentId);
      setPlaying(true);
      setProgress(0);
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
    }, 250);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [playing, duration]);

  // Volume/mute sync
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.setVolume(muted ? 0 : volume);
      if (muted) p.mute?.();
      else p.unMute?.();
    } catch {}
  }, [volume, muted]);

  const start = useCallback(() => setStarted(true), []);

  const togglePlay = useCallback(() => {
    if (!started) {
      setStarted(true);
      return;
    }
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing, started]);

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

  const value: Ctx = {
    tracks,
    idx,
    current,
    started,
    playing,
    progress,
    duration,
    volume,
    muted,
    repeat,
    start,
    togglePlay,
    next,
    prev,
    seek,
    selectIdx: (i: number) => {
      setIdx(i);
      if (!started) setStarted(true);
    },
    setVolume: setVolumeState,
    toggleMute: () => setMuted((m) => !m),
    toggleRepeat: () => setRepeat((r) => !r),
  };

  return (
    <MusicPlayerCtx.Provider value={value}>
      {children}
      {/* Persistent hidden YT mount — survives chapter transitions */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -9999,
          top: -9999,
          width: 0,
          height: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div ref={mountRef} />
      </div>
    </MusicPlayerCtx.Provider>
  );
}
