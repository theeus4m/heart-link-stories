import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";

const OPTIONS: { code: Lang; label: string; short: string }[] = [
  { code: "pt", label: "Português", short: "PT" },
  { code: "en", label: "English", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.code === lang)!;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-cream/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-plum transition hover:border-gold/60 hover:text-vinho"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Idioma"
      >
        <Globe className="h-3.5 w-3.5 text-gold" />
        <span className="font-medium">{current.short}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-sm border border-gold/30 bg-cream/95 shadow-[0_18px_30px_-12px_rgba(107,39,55,0.25)] backdrop-blur"
        >
          {OPTIONS.map((o) => (
            <li key={o.code}>
              <button
                type="button"
                role="option"
                aria-selected={o.code === lang}
                onClick={() => { setLang(o.code); setOpen(false); }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs tracking-wide transition ${
                  o.code === lang ? "bg-gold/10 text-vinho" : "text-plum hover:bg-gold/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gold">{o.short}</span>
                  <span className="font-display italic">{o.label}</span>
                </span>
                {o.code === lang && <Check className="h-3 w-3 text-gold" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
