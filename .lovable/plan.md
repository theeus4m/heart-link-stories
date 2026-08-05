## Objetivo

Revisar o Chronelo de ponta a ponta para reduzir tempo de carregamento e travamentos na home, editor, dashboard e presentes, preservando a aparência e as interações atuais. A capa escolhida para a Mixtape deverá aparecer imediatamente no editor e na prévia do vinil, sem aguardar o envio terminar.

## Diagnóstico confirmado

- As consultas do banco estão rápidas (médias abaixo de 1 ms); não há evidência de gargalo no banco.
- O upload atual envia arquivos de até 5 MB sem otimização, um por vez, e só atualiza a interface depois de concluir o envio de todos.
- Depois do upload, a miniatura e a prévia solicitam novas URLs temporárias, adicionando outra espera de rede.
- A rota pública carrega estaticamente os quatro presentes. Na medição atual, Bundle, Mixtape e Mapa estão entre os recursos mais demorados, mesmo antes de o usuário abrir todos os capítulos.
- O Mapa inicia WebGL, 1.200 estrelas, timers e texturas externas; vários presentes também mantêm animações infinitas, filtros de blur e atualizações frequentes.

## Implementação

### 1. Foto instantânea e upload eficiente

- Mostrar a imagem selecionada imediatamente com uma URL local temporária (`URL.createObjectURL`), tanto na miniatura quanto na capa, selo central e ambiente do vinil.
- Separar o estado de prévia local do caminho persistido no armazenamento: o editor usa a imagem local durante o envio e troca silenciosamente pela URL final quando concluir.
- Redimensionar e comprimir fotos grandes no navegador antes do upload, preservando qualidade visual adequada para celular, tablet e desktop.
- Enviar múltiplas fotos em paralelo com limite de concorrência, em vez do laço sequencial atual.
- Reutilizar URLs temporárias já resolvidas em memória para evitar solicitações repetidas ao alternar abas ou abrir a prévia.
- Revogar URLs locais ao substituir/remover imagens e apresentar progresso/erro por arquivo sem bloquear o restante do formulário.

### 2. Carregamento sob demanda dos presentes

- Dividir Carta, Mixtape, Momentos, Mapa e Bundle em chunks carregados apenas quando necessários na rota pública e na prévia do editor.
- No Bundle, carregar o conteúdo pesado do capítulo somente ao entrar nele; manter apenas capa, navegação e player persistente no carregamento inicial.
- Adicionar estados de transição leves para que o usuário receba resposta visual imediata enquanto um capítulo é preparado.
- Pré-carregar discretamente apenas o próximo capítulo provável após a primeira tela ficar interativa.

### 3. Redução de trabalho visual e travamentos

- Pausar animações, timers e reprodução visual quando o capítulo estiver oculto ou a aba do navegador estiver em segundo plano.
- Reduzir a frequência de atualização do progresso musical e do contador sem alterar a percepção de fluidez.
- Simplificar partículas, blurs grandes e camadas animadas em aparelhos menores ou com preferência por movimento reduzido.
- No globo 3D, diminuir a carga gráfica conforme o dispositivo, cancelar todos os timers ao sair e evitar baixar/recriar recursos antes de o usuário abrir o Mapa.
- Declarar dimensões e política de carregamento/decodificação nas imagens para evitar saltos de layout e trabalho desnecessário.

### 4. Home, editor e dashboard

- Evitar montar componentes abaixo da dobra antes de se aproximarem da área visível, mantendo os conteúdos e o design existentes.
- Remover renders e cálculos repetidos no editor ao digitar ou alternar presentes.
- Fazer a prévia resolver somente as fotos do presente/capítulo aberto, em vez de aguardar as quatro experiências.
- Revisar feedbacks de carregamento, botões desabilitados e estados de erro para que nenhuma ação pareça travada.

### 5. Validação

- Comparar antes/depois em home, dashboard, editor e link público.
- Testar seleção de capa do vinil com foto grande e confirmar que ela aparece imediatamente antes do upload terminar.
- Validar troca de capítulos, música persistente, globo, galeria e publicação do link sem regressões.
- Verificar celular (390 px), tablet (768 px) e desktop, incluindo rede mais lenta, redução de movimento, console e requisições.
- Registrar métricas de navegação, quantidade de recursos e recursos mais lentos para confirmar a melhoria.

## Detalhes técnicos

As otimizações usarão APIs nativas do navegador e os recursos já instalados. Os caminhos persistidos no banco continuarão iguais; URLs locais existirão apenas durante a edição. A prioridade será melhorar o carregamento percebido primeiro e, em seguida, reduzir bytes, CPU/GPU e trabalho em segundo plano sem remover a experiência premium.
