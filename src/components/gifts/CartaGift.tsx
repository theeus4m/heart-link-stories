import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Heart, Mail } from "lucide-react";

export type CartaData = {
  recipient: string;
  message: string;
  signature: string;
  photos?: string[]; // urls
  song?: string;
};

export function CartaGift({ data, title }: { data: CartaData; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden gradient-romance">
      {/* Petals */}
      {open && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {[...Array(28)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{ left: `${Math.random() * 100}%`, top: "-10%" }}
              initial={{ y: -50, rotate: 0, opacity: 0 }}
              animate={{ y: "110vh", rotate: 360 * (Math.random() > 0.5 ? 1 : -1), opacity: [0, 1, 1, 0] }}
              transition={{ duration: 6 + Math.random() * 4, delay: Math.random() * 3, repeat: Infinity }}
            >
              🌹
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 mx-auto grid min-h-screen max-w-3xl place-items-center px-5 py-12">
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.button
              key="closed"
              onClick={() => setOpen(true)}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 90 }}
              whileHover={{ scale: 1.05 }}
              className="group relative aspect-[4/3] w-full max-w-md rounded-2xl bg-cream shadow-2xl"
              style={{ perspective: 1000 }}
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
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-full rounded-3xl bg-cream p-8 shadow-2xl md:p-12"
            >
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

              {data.song && (
                <div className="mt-8 overflow-hidden rounded-xl">
                  {data.song.includes("spotify.com") ? (
                    <iframe
                      src={data.song.replace("/track/", "/embed/track/").replace("open.spotify.com", "open.spotify.com")}
                      width="100%"
                      height="80"
                      allow="encrypted-media"
                      className="border-0"
                    />
                  ) : null}
                </div>
              )}

              <div className="mt-10 flex justify-center">
                <Heart className="h-6 w-6 fill-coral text-coral animate-heartbeat" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
