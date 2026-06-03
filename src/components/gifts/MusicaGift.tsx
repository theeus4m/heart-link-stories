import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, Play } from "lucide-react";

export type MusicaData = {
  coupleNames: string;       // "Ana & João"
  startDate: string;         // ISO date
  songTitle: string;
  songArtist: string;
  songUrl?: string;          // spotify link
  coverUrl?: string;
  message?: string;
};

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

export function MusicaGift({ data }: { data: MusicaData; title: string }) {
  const start = new Date(data.startDate || new Date().toISOString());
  const [t, setT] = useState(() => diff(start));
  useEffect(() => {
    const i = setInterval(() => setT(diff(start)), 1000);
    return () => clearInterval(i);
  }, [data.startDate]);

  const spotifyEmbed = data.songUrl?.includes("open.spotify.com")
    ? data.songUrl.replace("open.spotify.com/", "open.spotify.com/embed/")
    : null;

  return (
    <div className="min-h-screen bg-plum text-cream">
      <div className="mx-auto grid max-w-3xl gap-8 px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-coral">Nossa música</p>
          <h1 className="mt-3 font-display text-5xl">{data.coupleNames || "Nós dois"}</h1>
        </motion.div>

        {/* Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-gradient-to-br from-violet/30 to-coral/20 p-6 shadow-romance backdrop-blur"
        >
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {data.coverUrl ? (
              <motion.img
                src={data.coverUrl}
                alt=""
                className="h-40 w-40 rounded-2xl object-cover shadow-romance"
                animate={{ rotate: [0, 2, 0, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            ) : (
              <div className="grid h-40 w-40 place-items-center rounded-2xl gradient-romance shadow-romance">
                <Play className="h-12 w-12 fill-white text-white" />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <p className="font-display text-3xl">{data.songTitle || "Sua música"}</p>
              <p className="mt-1 text-cream/70">{data.songArtist}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream/15">
                <div className="h-full w-2/3 animate-shimmer rounded-full" />
              </div>
            </div>
          </div>
          {spotifyEmbed && (
            <div className="mt-5 overflow-hidden rounded-xl">
              <iframe src={spotifyEmbed} width="100%" height="152" allow="encrypted-media" className="border-0" />
            </div>
          )}
        </motion.div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-center text-sm uppercase tracking-widest text-coral">Estamos juntos há</p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[
              { v: t.years, l: "anos" },
              { v: t.months, l: "meses" },
              { v: t.days, l: "dias" },
              { v: t.hours, l: "h" },
              { v: t.minutes, l: "min" },
              { v: t.seconds, l: "seg" },
            ].map((b) => (
              <div key={b.l} className="rounded-2xl bg-cream/5 p-4 text-center backdrop-blur">
                <p className="font-display text-3xl text-cream tabular-nums">{b.v}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-cream/60">{b.l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {data.message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mx-auto max-w-xl text-center font-display text-2xl italic text-cream/90"
          >
            "{data.message}"
          </motion.p>
        )}

        <div className="text-center">
          <Heart className="mx-auto h-6 w-6 fill-coral text-coral animate-heartbeat" />
        </div>
      </div>
    </div>
  );
}
