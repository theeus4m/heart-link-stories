## Objetivo

Tornar os quatro presentes (La Mixtape, Carta, Nossos Momentos, Mapa do Amor) mais interativos, com layout que funcione bem em celular e tablet, e com acabamento visual mais refinado — mantendo a identidade Chronelo (vinho, terracota, dourado, creme).

## 1. Base responsiva (aplicada a todos)

- Trocar `min-h-screen` por `min-h-[100dvh]` (evita corte pela barra do navegador no iOS).
- Escala fluida de tipografia: títulos passam a `text-3xl sm:text-5xl md:text-6xl`; blocos `p-10` viram `p-5 sm:p-8 md:p-10`; `px-5` vira `px-4 sm:px-6`.
- Alvos de toque com no mínimo 44px; áreas arrastáveis com `touch-none`.
- Linhas com texto + ícone usam `grid-cols-[minmax(0,1fr)_auto]` no mobile, `flex` a partir de `sm:`, com `min-w-0` e `truncate`.
- Respeitar `prefers-reduced-motion`: partículas e rotações reduzidas.
- Breakpoint de tablet (`md:`) tratado explicitamente: colunas duplas onde hoje só há mobile ou desktop.

## 2. La Mixtape (`MusicaGift.tsx`)

- Cena capa + toca-discos empilha em coluna no celular e vira duas colunas a partir do tablet; disco e prato dimensionados por `min(80vw, 320px)` em vez de largura fixa.
- Arrastar o vinil: aumentar a zona de acerto no mobile, adicionar snap magnético quando o disco chega perto do prato, vibração leve (`navigator.vibrate`) ao encaixar e ao pousar a agulha.
- Novas microinterações: brilho que percorre o vinil ao girar, agulha com deriva lenta acompanhando o progresso, capa com leve tilt seguindo o cursor no desktop.
- Playlist: item ativo com barra de progresso embutida; tocar em qualquer faixa pula para ela; swipe horizontal nos controles para faixa anterior/próxima.
- Player compacto no mobile (controles em uma linha, título truncado).

## 3. Carta (`CartaGift.tsx`)

- Envelope com largura fluida (`w-[min(92vw,28rem)]`) e selo/coração escalando junto.
- Interação nova: arrastar o selo para baixo (ou tocar) para romper a cera, com pétalas reagindo ao gesto.
- Carta aberta rola dentro de um painel com altura limitada (`max-h-[80dvh]`) em vez de estourar a tela no celular.
- Galeria de fotos: grade 2 colunas no celular, 3 no tablet, com toque para ampliar.
- Botão "reler" e indicador de rolagem discreto.

## 4. Nossos Momentos (`MomentosGift.tsx`)

- Grade polaroid: 1 coluna em telas muito estreitas, 2 no celular maior, 3 no tablet, 4 no desktop.
- Lightbox responsivo (`max-h-[85dvh]`), com swipe para próxima/anterior foto e setas no desktop.
- Interação nova: leve efeito de "levantar a foto" ao pressionar, e as polaroids entram em cascata conforme o scroll.
- Momentos sem foto viram cartões de linha do tempo alinhados ao fio dourado.

## 5. Mapa do Amor (`MapaGift.tsx`)

- Altura do globo passa a ser proporcional à viewport (`h-[60dvh] md:h-[70dvh]`) com redimensionamento no `resize`/rotação de tela.
- Cards de distância/tempo viram carrossel horizontal no celular e grade no tablet.
- Interação nova: tocar num marcador abre um cartão com a cidade e a mensagem; botão para reiniciar a animação cinematográfica.
- Controles de toque (girar/zoom) habilitados com dica visual na primeira interação.

## 6. Casca do bundle (`BundleGift.tsx`)

- Setas laterais somem no celular (só swipe + rodapé), pontos de capítulo maiores e com rótulo.
- Mini-player fixo respeita `safe-area-inset-bottom` e encolhe para ícone tocável no celular.
- Capa e telas de capítulo com espaçamento fluido e sem rolagem forçada.

## Detalhes técnicos

Somente componentes de apresentação em `src/components/gifts/*` e tokens já existentes em `src/styles.css`. Sem mudança de schema, de dados ou do editor. Animações continuam com `motion/react`; nada de bibliotecas novas. Verificação final: build + captura de telas em 390px, 820px e 1280px via Playwright.
