# Plano de Redesign — Chronelo

Mantendo a paleta oficial (Marfim #FDFBF7, Vinho #6B2737, Terracota #C4714A, Ouro #C9A84C, Ink #2E2520) e tipografia Cormorant Garamond + DM Sans.

## 1. Nossa Linha do Tempo — `src/components/gifts/MomentosGift.tsx`

Transformar a galeria em um álbum de memórias com molduras Polaroid premium.

- **Moldura Polaroid**: fundo marfim, borda larga inferior (estilo revelação analógica), sombra dupla suave (`drop-shadow` + sombra projetada), cantos com leve textura, fita adesiva washi no topo (SVG diagonal translúcido em tons de ouro/rosé), pequena legenda manuscrita (data ou índice) em Cormorant italic.
- **Disposição**: grid responsivo (`grid-cols-2 md:grid-cols-3`) com cada item recebendo rotação determinística entre -6° e +6° derivada do índice; hover eleva (`scale 1.04`, rotate→0, sombra mais intensa) com `transition-transform`.
- **Foto interna**: leve filtro vintage (`saturate-[0.92] contrast-[1.05]`) e um overlay sutil cor sépia/rosé com `mix-blend-multiply` em opacidade baixa.
- **Zoom ao clicar**: lightbox com `framer-motion` + `AnimatePresence` usando `layoutId` para transição contínua da polaroid pequena para a versão ampliada centrada; fundo `bg-ink/80` com blur, ESC e clique-fora fecham.
- **Detalhes vintage**: pequenas marcas (cantinho de álbum em SVG dourado nas quatro pontas opcionais), divisor "Fio do Tempo" entre seções de datas se houver agrupamento.

## 2. Home — Exemplos discretos dos presentes — `src/routes/index.tsx`

Nova seção logo após o hero, antes do CTA principal.

- **Layout**: 4 cards em `grid md:grid-cols-4` com bastante respiro (`gap-8`, `py-24`), título editorial discreto ("Presentes Chronelo") em Cormorant + linha-fio dourada curta.
- **Card**: fundo marfim, borda hairline ouro a 20%, preview minimalista de cada tipo (ícone/ilustração SVG sutil — envelope para Carta, mapa para Mapa, disco para Mixtape, polaroid para Momentos), título em Cormorant, descrição curta em DM Sans 13px tracking amplo.
- **Interação**: hover apenas eleva 2px e revela link "Ver exemplo →" em terracota; sem cores fortes, sem badges.

## 3. Mixtape — `src/components/gifts/MusicaGift.tsx`

Reformular como um toca-discos vintage de luxo.

- **Cena**: fundo gradiente vinho profundo → ink com vinheta, plataforma de madeira (gradiente terracota→sombra) e marca d'água "Chronelo" em ouro.
- **Disco de vinil**: SVG circular com sulcos concêntricos finos, label central com a capa do álbum (ou monograma Ch dourado), reflexo radial; girando lentamente (`animate-spin` 8s) somente durante reprodução.
- **Braço/agulha**: SVG do braço do toca-discos pousando sobre o disco quando o play é acionado (rotação suave via motion).
- **Controles**: botão Play/Pause grande em ouro escovado, info da música (título/artista em Cormorant), barra de progresso fina em ouro.
- **Equalizador**: 5 barras verticais em ouro com altura animada (keyframes) enquanto toca, posicionadas elegantemente abaixo do disco.
- **Partículas**: pequenas faíscas douradas (motion divs) flutuando ao redor do disco quando ativo.
- **Embed**: o iframe do Spotify continua disponível mas com altura mínima abaixo da arte do toca-discos, ou usado apenas para áudio (mantemos visual + iframe estilizado em ring ouro).

## 4. Carta — refino de pétalas — `src/components/gifts/CartaGift.tsx`

O componente já usa pétalas SVG realistas (peônia/rosa) com 4 variações de tom; ajustes finos:

- Garantir que **nenhuma** pétala se pareça com balão/círculo — revisar formas e remover qualquer círculo decorativo remanescente que pareça confete (manter apenas as partículas douradas como pontos brilhantes minúsculos — `1.5–3px` com `blur-[0.5px]` e box-shadow ouro).
- **Profundidade**: dividir as pétalas em duas camadas — `z-20` atrás da carta e `z-40` à frente, com tamanhos maiores na camada da frente e desfoque leve (`blur-[0.5px]`) na de trás.
- **Burst inicial mais cinematográfico**: aumentar para 26 pétalas, easing `[0.16, 1, 0.3, 1]`, escalas finais variando, rotação 3D (`rotateY`) durante o voo.
- **Chuva contínua**: já existente — refinar duração (10–16s), adicionar 6 pétalas extra "de frente" maiores e mais lentas para parallax.
- **Faíscas douradas**: aumentar contraste e reduzir quantidade (20) para não competir; misturadas no mesmo plano da chuva.

## Detalhes técnicos

- Reutilizar utilidades existentes em `src/styles.css` (`font-display`, cores tokens). Não introduzir cores hard-coded fora da paleta oficial.
- `framer-motion` já está instalado e em uso; usar `AnimatePresence` + `layoutId` para lightbox da Polaroid.
- Nenhuma alteração de schema ou backend. Apenas UI.
- Sem novas dependências.

## Arquivos a editar

- `src/components/gifts/MomentosGift.tsx` (Polaroid + lightbox)
- `src/routes/index.tsx` (seção de exemplos)
- `src/components/gifts/MusicaGift.tsx` (toca-discos vintage)
- `src/components/gifts/CartaGift.tsx` (refino pétalas + camadas)
