import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { HeaderInfoDialogs } from "@/components/HeaderInfoDialogs";
import { cn } from "@/lib/utils";

function LogoTipo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display tracking-[0.04em] ${className}`}>
      Chr<em className="text-gold">o</em>nelo
    </span>
  );
}

/** Transparent at the top, frosted on scroll, hides going down and returns going up. */
function useHeaderChrome() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 120 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { scrolled, hidden };
}

export function SiteHeader() {
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();
  const { scrolled, hidden } = useHeaderChrome();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  const anchors = [
    { href: "#como-funciona", label: t("nav.how") },
    { href: "#presentes", label: t("nav.presents") },
    { href: "#precos", label: t("nav.pricing") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled
          ? "border-b border-gold/25 bg-background/75 backdrop-blur-xl shadow-[0_1px_0_0_color-mix(in_oklab,var(--gold)_12%,transparent)]"
          : "border-b border-transparent bg-transparent",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5 focus-ring rounded-md" aria-label="Chronelo">
          <LogoTipo className="text-2xl text-plum transition-colors duration-500 group-hover:text-vinho" />
        </Link>

        <nav className="flex items-center gap-1.5">



          {authed ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden text-plum hover:text-vinho sm:inline-flex">
                <Link to="/dashboard">{t("nav.gifts")}</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-plum hover:text-vinho"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.signout")}</span>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden text-plum hover:text-vinho sm:inline-flex">
                <Link to="/auth">{t("nav.signin")}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full bg-plum px-5 text-[11px] uppercase tracking-[0.18em] text-cream hover:bg-vinho-escuro"
              >
                <Link to="/auth">{t("nav.create")}</Link>
              </Button>
            </>
          )}

          <div className="mx-1 hidden h-5 w-px bg-gold/30 sm:block" aria-hidden="true" />
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("nav.menu")}>
                <Menu className="h-5 w-5 text-plum" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(88vw,20rem)] border-l border-gold/25 bg-background/95 backdrop-blur-xl"
            >
              <div className="mt-8 flex flex-col gap-1">
                <LogoTipo className="mb-6 text-3xl text-plum" />
                {anchors.map((a) => (
                  <a
                    key={a.href}
                    href={a.href}
                    onClick={() => setMenuOpen(false)}
                    className="focus-ring rounded-md px-1 py-3 font-display text-2xl text-plum transition-colors hover:text-vinho"
                  >
                    {a.label}
                  </a>
                ))}
                <div className="mt-4 flex flex-col items-start gap-2 border-t border-gold/20 pt-5">
                  <HeaderInfoDialogs />
                </div>
                <div className="mt-6 sm:hidden">
                  <LanguageSwitcher />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
