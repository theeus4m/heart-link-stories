import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";

export type MomentosData = {
  intro: string;
  moments: Array<{ date: string; title: string; caption: string; photo?: string }>;
  outro: string;
};

export function MomentosGift({ data, title }: { data: MomentosData; title: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cream to-secondary">
      <AnimatePresence>
        {!revealed && (
          <motion.div
            key="bear"
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-20 grid place-items-center bg-gradient-to-b from-cream to-secondary"
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-9xl"
              >
                🧸
              </motion.div>
              <h1 className="mt-6 font-display text-4xl text-plum">{title}</h1>
              <p className="mt-2 text-muted-foreground">O ursinho preparou uma surpresa…</p>
              <button
                onClick={() => setRevealed(true)}
                className="mt-8 rounded-full gradient-romance px-8 py-3 text-primary-foreground shadow-romance transition hover:opacity-90"
              >
                Puxar a cortina ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {revealed && (
        <div className="mx-auto max-w-2xl px-5 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm uppercase tracking-widest text-violet">Nossa história</p>
            <h1 className="mt-2 font-display text-4xl text-plum">{title}</h1>
            <p className="mt-4 font-display text-xl italic text-muted-foreground">{data.intro}</p>
          </motion.div>

          <div className="relative mt-12">
            <div className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-coral via-violet to-plum" />
            <div className="space-y-10">
              {data.moments?.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-16"
                >
                  <span className="absolute left-3 top-1.5 grid h-7 w-7 place-items-center rounded-full gradient-romance text-white shadow-romance">
                    <Heart className="h-3.5 w-3.5 fill-white" />
                  </span>
                  <p className="text-xs uppercase tracking-widest text-violet">{m.date}</p>
                  <h3 className="mt-1 font-display text-2xl text-plum">{m.title}</h3>
                  {m.photo && (
                    <img src={m.photo} alt="" className="mt-3 aspect-video w-full rounded-xl object-cover shadow-soft" />
                  )}
                  <p className="mt-2 text-muted-foreground">{m.caption}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {data.outro && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-16 rounded-3xl gradient-romance p-10 text-center shadow-romance"
            >
              <Heart className="mx-auto h-8 w-8 fill-white text-white animate-heartbeat" />
              <p className="mt-4 font-display text-2xl text-white italic">{data.outro}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
