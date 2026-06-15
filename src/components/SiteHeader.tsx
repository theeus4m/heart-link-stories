import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

function LogoTipo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display tracking-[0.04em] ${className}`}>
      Chr<em className="text-gold">o</em>nelo
    </span>
  );
}

export function SiteHeader() {
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-cream/85 border-b border-gold/30">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Chronelo">
          <LogoTipo className="text-2xl text-plum group-hover:text-vinho transition-colors duration-500" />
        </Link>
        <nav className="flex items-center gap-1">
          {authed ? (
            <>
              <Button asChild variant="ghost" size="sm" className="text-plum hover:text-gold transition-colors duration-300">
                <Link to="/dashboard">Meus presentes</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-plum hover:text-gold transition-colors duration-300"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-plum hover:text-gold transition-colors duration-300">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="rounded-none bg-plum text-cream hover:bg-vinho-escuro hover:text-gold border border-plum hover:border-gold transition-all duration-500 px-6 tracking-wider uppercase text-xs">
                <Link to="/auth">Criar presente</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
