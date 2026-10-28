# Minijogos e features — investigação de carreira completa

Data: 28/10/2026. Referência: https://www.potrerofutbol.ar/el-idolo?lang=pt. Implementação: `rea-maggio-games-n-features`, iniciada no commit `dfa517c` da UI aprovada. A folha `app/rea-maggio.css` foi preservada; os controles necessários às mecânicas usam folhas próprias.

## Carreira percorrida

A sessão temporária jogou a carreira de história iniciada pelo cartão Messi, com o atacante gerado Marcelo Luna e identidade mista. Foram percorridas 25 temporadas, de 2026 a 2050, dos 16 aos 40 anos: Newell's, Barcelona, PSG e Inter Miami. A despedida foi jogada e a tela de aposentadoria terminou com a homenagem do Barcelona. A carreira foi retomada do save do próprio navegador depois de uma interrupção.

As ações usaram botões, teclado, gestos e informações visíveis, incluindo a revelação de memória e a repetição permitida do sinal. Não se alteraram o estado interno da carreira nem o relógio do site. Algumas tentativas foram perdidas ou expiraram durante a inspeção dos controles; esta pesquisa não representa uma campanha perfeita. No teste separado do O REI local foi usado relógio controlado para validar os estados.

O registro identificou **50 entradas em contextos de competição/temporada e 24 famílias de desafios**. Uma entrada de Mundial pode conter diversos jogos de grupos e mata-mata; esses jogos não são somados novamente nesse número. É uma contagem limitada às famílias identificadas, não o total absoluto de partidas. A amostra é uma carreira guiada de atacante excepcional, não uma estimativa da frequência em todas as carreiras.

Evidências: [frequência e cronologia](evidence/games-2026-10-28/career-frequency.json), [duelo da Champions](evidence/games-2026-10-28/champions-one-on-one.json), [aposentadoria observada pelo REA](evidence/games-2026-10-28/retirement.json) e [análise estática](evidence/games-2026-10-28/static-mechanics.json). O REA registrou a aposentadoria em `ev_88336ccb8251cf3ae63dc5b55293189c33e892687b4641d7014bf66b9e5fc287`.

## Quando os desafios aparecem

- A quantidade varia com classificação, títulos, convocação e calendário. Houve temporadas sem entradas identificadas e temporadas com quatro contextos diferentes. Não há evidência de um intervalo universal como um minijogo a cada duas temporadas.
- Finais comuns geram uma decisão. Supercopas e Finalíssima acrescentam oportunidades quando o clube ou seleção se classifica. Na temporada 2028 foram observadas Copa América, Champions e uma final de Mundial de Clubes.
- Campanhas mundiais encadeiam partidas de grupos e mata-mata, mantendo a modalidade e aumentando a pressão. Foram observadas sequências, timing, goleiro móvel, grade de resultados, torre e memorização de espaço livre. As instruções da referência exigem quatro pontos nos grupos; algumas modalidades oferecem pênaltis ou repetição limitada. As variantes não têm todas a mesma regra de resgate.
- O REI mantém seus regulamentos esportivos existentes, inclusive critérios de grupos e resgate. Esta entrega modifica o desafio oferecido e sua variedade, sem inventar uma probabilidade global de chegar à final.

## Cartas e decisões de desenvolvimento

As instruções e os artefatos públicos mostram uma escolha entre três cartas de pré-temporada. Foram registradas explicitamente 22 mãos durante o percurso, além da especialização inicial; a captura não estabelece ausência de cartas nos dois anos restantes. A análise estática situa a oferta no avanço anual. Houve cartas com ganho e custo: uma mão em 2031 continha aumento de potência com perda de velocidade. As cartas podem priorizar atributos diferentes e o gerador tenta evitar repetições.

A referência oferece nova mão ligada a anúncio, com limite de três usos na carreira e intervalo de duas temporadas. No O REI foi adotada uma **troca gratuita limitada**, sem anúncio e sem garantia de elevar a raridade. Os valores e as três raridades próprias do O REI foram mantidos. Também foi corrigido o esgotamento do catálogo: as três opções continuam únicas e elegíveis para a posição, mesmo quando todas as cartas estão no histórico recente.

## Mecânicas verificadas e adaptação

- **Código:** três etapas de cinco dígitos distintos. Revelação explícita em cada etapa, com janelas de 2.000, 1.300 e 800 ms, e possibilidade de apagar antes de completar a entrada. Um código completo errado encerra a tentativa. A duração total agora soma as etapas no O REI.
- **Pares:** oito pares, cinco erros; exposição inicial e fechamento de par incorreto de um segundo. A final de Copa América foi concluída com sucesso pela leitura da revelação inicial.
- **Copos:** quatro alvos. A quantidade e velocidade das trocas variam; velocidade elevada do atleta reduz uma troca. O alvo acompanha o mesmo copo ao longo das permutações.
- **Quatro em linha:** tabuleiro 5 × 5. O primeiro empate reinicia com o rival abrindo; o segundo concede a vitória ao jogador. A partida de Copa do Rei foi jogada até a derrota.
- **Timing:** o atributo relevante modifica a janela real de acerto, não apenas o desenho. A referência trabalha com faixas e pressão contextual. A implementação aplica uma janela de uma a quatro divisões entre 14, com limite mínimo jogável.
- **Duelo com goleiro — novo:** três cantos e uma pista sobre o movimento. O REI usa um alvo fixado antes do chute; a confiabilidade da pista melhora com o atributo. As probabilidades são balanceamento próprio, não uma fórmula original recuperada.
- **Escolha da chuteira — novo:** escolha uma entre três opções; uma perdedora é aberta; depois decida entre ficar e trocar. As duas etapas foram observadas na Finalíssima. O alvo permanece fixo entre as escolhas.
- **Passe entre linhas — novo:** dois acertos em até três tentativas, encerrando também quando já não há chance de alcançar dois. A referência usa arrastar e soltar num campo; a adaptação oferece botão e Espaço sobre um corredor móvel, mantendo a lógica de timing e contagem de tentativas. Foram observadas tentativas perdidas na referência e vitória no teste do O REI.

Também foram observados slalom, força de chute, roleta, cartas de maior/menor, cabeceio, falta, escolha tática, bola com desvios e variantes de Mundial. Eles estão registrados na cronologia, mas **não foram todos reconstruídos**. O catálogo desta entrega tem os dez modos anteriores e três novos; não corresponde ao catálogo integral da referência. Goleiros não foram o foco da carreira pesquisada.

## Integração no O REI

- Escolha persistente entre habilidade, intuição e misto na criação. Ela filtra finais comuns e respeita a posição. Mundiais conservam o conjunto próprio de desafios e o bloqueio de modalidade por campanha.
- A seleção prioriza modalidades ainda não vistas, depois as não usadas na temporada, evitando repetição imediata quando o conjunto permite. Temporada sem final deixa de consumir o histórico de minijogos.
- Atributos, identidade, pressão e índice da partida chegam ao motor. A sequência de campanha aumenta até um limite de 12 itens, definido como balanceamento do O REI.
- A mão de cartas e seu contador de trocas permanecem determinísticos após salvar e recarregar. Saves legados continuam aceitos; os campos novos são opcionais e validados.
- Tentativas de pênaltis têm identidade de persistência distinta da tentativa regular, evitando restaurar automaticamente um resultado já encerrado.

Arquivos principais: `game/decision-selection.ts`, `game/minigame-engine.ts`, `game/minigames.ts`, `game/engine.ts`, `game/persistence.ts`, `app/page.tsx` e `components/minigame-arena.tsx`. As folhas adicionais são `app/game-features.css` e `components/minigame-features.css`.

## Verificação e limites

Os testes de carreira, saves, cartas e regulamentos passaram, assim como as regressões das mecânicas. O teste de navegador exercitou as 13 modalidades com toque, teclado, pausa, confirmação e ausência de rolagem horizontal no celular. Houve vitórias positivas em código, copos, pares e passe; outras modalidades também tiveram seus estados de derrota e confirmação exercitados. Uma carreira local separada chegou à aposentadoria após 26 temporadas e 39 tentativas de decisão confirmadas (incluindo pênaltis), com duas transferências, loja, restauração após reload e exportação PNG, sem erros JavaScript.

Resultados e imagens ficam em `docs/qa/games-features/`. O teste reutilizável é `scripts/browser-game-features.mjs`; ele aceita `O_REI_PLAYWRIGHT_MODULE`, `O_REI_CHROME`, `O_REI_QA_URL` e `O_REI_QA_OUTPUT` para adequar o ambiente de execução.

A análise estática do REA leu três bundles selecionados sem executá-los, sem falhas de parsing. Evidência `ev_626d87e4bc0870c288c4d3e2987b2043a6af1541192b8f67286657c836b1a047`; o grafo semântico é parcial, com limites de 10.000 nós globais e 4.000 por arquivo. Dependências não selecionadas, relações dinâmicas e código de backend permanecem desconhecidos. Os arquivos públicos usados como referência ficam em `work/potrero-mechanics-reference/`, ignorados pelo Git; a implementação usa código próprio.
