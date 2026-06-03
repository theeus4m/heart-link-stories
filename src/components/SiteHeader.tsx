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
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-romance shadow-romance">
            <Heart className="h-4 w-4 fill-white text-white" />
          </span>
          <span className="font-display text-xl text-plum">Love Link</span>
        </Link>
        <nav className="flex items-center gap-2">
          {authed ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Meus presentes</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
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
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="gradient-romance border-0 text-primary-foreground shadow-romance">
                <Link to="/auth">Criar presente</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
