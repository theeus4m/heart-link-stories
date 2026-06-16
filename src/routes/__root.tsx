import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-gradient-romance">404</h1>
        <h2 className="mt-4 text-xl font-display text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O caminho que você procura não existe — talvez tenha sido movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full gradient-romance px-6 py-2 text-sm font-medium text-primary-foreground shadow-romance transition hover:opacity-90"
          >
            Voltar para casa
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-display text-foreground">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full gradient-romance px-5 py-2 text-sm text-primary-foreground"
          >Tentar novamente</button>
          <a href="/" className="rounded-full border border-input px-5 py-2 text-sm">Início</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Chronelo — Presentes virtuais para casais" },
      { name: "description", content: "Crie cartas, playlists e linhas do tempo românticas e envie por um link exclusivo." },
      { name: "author", content: "Chronelo" },
      { property: "og:title", content: "Chronelo — Presentes virtuais para casais" },
      { property: "og:description", content: "Transforme mensagens em experiências digitais inesquecíveis." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Chronelo" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Fio do tempo — signature golden line */}
        <div
          className="fixed left-1/2 top-0 z-0 hidden h-full w-px md:block"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--gold) 15%, var(--gold) 85%, transparent)",
            opacity: 0.35,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
        <div className="relative z-[1]">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthSync />
        <Outlet />
        <Toaster position="top-center" />
      </I18nProvider>
    </QueryClientProvider>
  );
}
