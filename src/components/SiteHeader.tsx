import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl tracking-tight text-plum">Love</span>
          <span className="font-display italic text-2xl text-coral">Link</span>
          <Heart className="ml-1 h-3 w-3 fill-coral text-coral opacity-80" />
        </Link>
        <nav className="flex items-center gap-1">
          {authed ? (
            <>
              <Button asChild variant="ghost" size="sm" className="text-plum hover:text-coral">
                <Link to="/dashboard">Meus presentes</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-plum hover:text-coral"
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
              <Button asChild variant="ghost" size="sm" className="text-plum hover:text-coral">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-plum text-cream hover:bg-coral border-0 px-5">
                <Link to="/auth">Criar presente</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
