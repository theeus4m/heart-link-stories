import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/20 bg-cream/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:gap-16">
        <div className="min-w-0">
          <span className="font-display text-3xl tracking-[0.04em] text-plum">
            Chr<em className="text-gold">o</em>nelo
          </span>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{t("footer.tagline")}</p>
          <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold">
            <span className="h-px w-8 bg-gold/50" />
            {t("footer.tag")}
          </div>
        </div>




        <div className="min-w-0">
          <h2 className="caption uppercase tracking-[0.28em] text-plum">{t("footer.company")}</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/auth" className="focus-ring rounded transition-colors hover:text-vinho">
                {t("nav.create")}
              </Link>
            </li>
            <li>
              <a href="mailto:ciao@chronelo.com" className="focus-ring rounded transition-colors hover:text-vinho">
                ciao@chronelo.com
              </a>
            </li>
          </ul>
          <div className="mt-6">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="border-t border-gold/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-2">
            <Heart className="h-3 w-3 fill-coral text-coral" aria-hidden="true" />
            © {year} Chronelo · {t("footer.rights")}
          </p>
          <p className="uppercase tracking-[0.28em]">{t("footer.sub")}</p>
        </div>
      </div>
    </footer>
  );
}
