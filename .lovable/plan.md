## Objetivo

Elevar o Chronelo ao acabamento de Apple/Stripe/Linear, mantendo a identidade (vinho, terracota, dourado, creme) mas com fundo mais claro, cantos suaves de 20px, sombras discretas e hierarquia tipográfica profissional. Nenhuma lógica de negócio, integração ou componente é removido — só a camada visual e de experiência.

Depoimentos, número de países e volume de presentes ficam com estrutura pronta e texto neutro até você enviar os dados reais.

---

## Fase 1 — Design system + Landing + Navegação

**Design system (`src/styles.css`)**
- `--radius: 1.25rem` (20px), com escala derivada; cantos retos ficam só em detalhes editoriais.
- Fundo evolui para creme quase-branco (#FBF9F5) com superfícies em branco puro; vinho e dourado passam a acentos, não blocos.
- Nova escala de sombras: `--shadow-xs/sm/md/lg` suaves e difusas — nada de cards achatados.
- Escala tipográfica declarada (H1→legenda) com pesos e line-height fixos, aplicada por utilitários (`.h1`, `.h2`, `.body-lg`, `.caption`).
- Gradientes discretos (creme→branco, dourado 8% de opacidade) para fundos de seção.

**Landing (`src/routes/index.tsx`)** reconstruída em seções componentizadas dentro de `src/components/landing/`:
1. Hero — headline grande, subtítulo curto, dois CTAs (criar / ver exemplo), preview do produto, gradiente suave, elementos flutuantes discretos, prova social (★ 4.9 + contadores, texto neutro até você enviar).
2. Como funciona — Escolha → Personalize → Compartilhe, três passos ilustrados.
3. Demonstração interativa — mini-preview navegável dos 4 capítulos.
4. Benefícios — grade de cards premium.
5. Galeria de exemplos — reaproveita a seção "Anteprime" existente, reformulada.
6. Depoimentos — carrossel com estrutura neutra.
7. FAQ — acordeão (mesmo conteúdo dos diálogos do header).
8. CTA final com o preço atual.

**Header/Footer**
- Header transparente no topo, blur ao rolar, esconde ao descer e reaparece ao subir; menu mobile em sheet premium.
- Novo footer completo: marca, navegação, idioma, contato, legal.

## Fase 2 — Componentes e presentes

**Componentes base** (variantes, sem quebrar API):
- Botão: hover, active, focus visível, disabled, `loading` com spinner, ripple sutil.
- Card: elevação e escala sutil no hover, borda discreta.
- Input/Textarea: estados de erro/sucesso, ícone, mensagem de validação.
- Dialog/Sheet: blur de fundo, fade + escala na entrada e saída.
- Skeletons para dashboard, `/g/$slug` e galeria.

**Presentes** (cada um com identidade própria, mecânicas atuais preservadas):
- Carta: abertura mais suave, papel com textura e sombra projetada.
- Mixtape: painel de player estilo Spotify ao lado do toca-discos (capa grande, equalizer animado, fila de faixas).
- Momentos: timeline elegante, fotos maiores, zoom e transições refinadas.
- Mapa: pins modernos, linha animada entre cidades, tema claro/escuro alternável.
- Bundle: navegação de álbum premium (capa, índice de capítulos, mini-player já existente refinado).

**Editor e dashboard** (`criar.$type.tsx`, `dashboard.tsx`, `auth.tsx`) recebem o mesmo sistema de cards, inputs e espaçamento.

## Fase 3 — Performance, SEO e acessibilidade

- Lazy loading dos presentes pesados (globo 3D, player) e code splitting por rota; imagens em WebP com dimensões declaradas; preload das fontes.
- `head()` por rota com title dinâmico, description, Open Graph, Twitter Card, canonical e JSON-LD (Organization + FAQPage + Product).
- `public/robots.txt` e `src/routes/sitemap[.]xml.ts`.
- WCAG AA: contraste revisado, `focus-visible` em todos os interativos, ARIA labels em botões só-ícone, navegação por teclado nos carrosséis e no bundle, alvos de toque ≥44px.
- Responsividade validada por captura em 360, 390, 430, 768, 1024, 1280 e 1536px.

---

## Detalhes técnicos

Tailwind v4 com tokens em `@theme inline`; animações com `motion/react` já instalada (fade/scale/slide/reveal, `whileInView` com `once`), respeitando `prefers-reduced-motion`. Nada de novas dependências de UI. Todas as strings novas passam pelo `src/lib/i18n.tsx` em PT/EN/ES. Cada fase termina com build + typecheck e captura de telas.
