# Treze minijogos do O REI

O catálogo conserva os dez desafios anteriores e acrescenta três decisões de futebol. Motor em `game/minigame-engine.ts`, apresentação em `components/minigame-arena.tsx`, catálogo em `game/minigames.ts`.

## Contrato comum

Tutorial → execução → pausa/retomada → resultado → confirmação. No treino, é possível reiniciar; na carreira, confirmar consome o resultado da decisão. Ocultar a aba pausa o relógio. Seed opcional na propriedade `seed`; embaralhamento Fisher–Yates e gerador determinístico. Nada muda a vitória depois de executar a regra.

Resultado: `id`, `gameId`, `seed`, `difficulty`, `won`, `elapsedMs`, `context`. A decisão é estritamente binária: vitória ou derrota. Tempo e erros servem apenas para feedback local; não há pontuação nem recompensa numérica do minijogo. O Código exige três etapas para vencer; uma sequência completa incorreta encerra a tentativa. O tempo soma todas as etapas.

Três níveis de pressão ajustam observação, tempo, tolerância a erros, velocidade e tamanho da janela. Na carreira, o nível é calculado pela força relativa dos clubes, prestígio e fase da competição; só no treino o jogador pode selecioná-lo. Configuração central em `tuning` e `game/minigame-context.ts`. Treino não altera estatísticas da carreira. Áudio é opcional e falha silenciosamente quando indisponível.

| Modalidade | Regra e controle | Testes principais |
|---|---|---|
| Código da Prancheta | Revelar cinco dígitos distintos em três etapas (2000/1300/800 ms); teclas 1–9 e Backspace ou botões | Revelação, correção e duração total nas três etapas |
| Copos Embaralhados | Observar a bola e acompanhar quatro copos nas trocas | Identidade da bola preservada, ordem reproduzível |
| Marca Vermelha | Parar o marcador na faixa; Espaço, Enter ou toque | Acerto/erro nos limites, relógio por tempo decorrido |
| Labirinto | Memorizar rota 5×5 e escolher as casas até o gol | Rota sempre alcançável, erros limitados |
| Jogo da Velha | Quatro em linha no tabuleiro 5×5; primeiro empate reinicia com o rival, segundo concede vitória | Linhas/diagonais, casas ocupadas e dois empates |
| Pareamento | Oito pares, cinco erros; exposição inicial e fechamento de erro de um segundo | Pares completos e bloqueio durante revelação de erro |
| Quebra-cabeça | Deslizar peças adjacentes até ordenar 1–8 | Embaralhamento sempre solucionável, limite de tempo |
| Mapa de Pressão | Observar e repetir uma sequência de casas | Sequência determinística e limite de entrada |
| Zona de Ouro | Janela menor de timing | Mesma avaliação temporal, janela própria |
| Rastrear a Bola | Acompanhar a bola entre seis posições e indicar a última | Sequência visível, alvo final determinístico |

Teclado: Tab/Enter em todos os botões, setas nos tabuleiros, Esc para pausa. Toque usa os mesmos elementos e regras. Foco visível e redução de movimento estão no CSS. Para modalidades de memória visual não há equivalência completa para pessoas cegas; isso permanece uma melhoria de acessibilidade, não uma capacidade alegada.

## Novas decisões e integração

- **Duelo com o goleiro:** três cantos, alvo fixado antes do chute e pista probabilística influenciada pelo atributo. Disponível para atacante e meia.
- **A escolha da chuteira:** escolha uma entre três opções; uma perdedora não selecionada é aberta; decida entre ficar e trocar. O prêmio não muda entre as etapas.
- **Passe entre linhas:** dois acertos em até três tentativas. Solte no corredor móvel por botão ou Espaço. Dois erros encerram quando não é mais possível alcançar a meta. Disponível para atacante e meia.

`ChallengeContext` leva atributo, identidade, pressão e índice de partida à arena. O alvo desenhado e a avaliação usam o mesmo helper. A janela contextual de timing ocupa uma a quatro das 14 faixas; a sequência do Mapa de Pressão cresce com a campanha até 12 itens. A disputa de pênaltis tem chave de persistência distinta da tentativa regular. Saves antigos continuam aceitos sem os campos opcionais novos.

Habilidade, intuição e misto filtram finais comuns; Mundiais mantêm seu conjunto próprio. `game/decision-selection.ts` prioriza desafios ainda não vistos e evita repetição na temporada quando possível. Temporadas sem final não consomem esse histórico. A frequência vem do calendário e da classificação esportiva.

As três cartas permanecem únicas e da posição correta mesmo quando o catálogo recente está esgotado. A troca gratuita de mão tem três usos por carreira e intervalo de duas temporadas, sem garantia de raridade. A semente e o contador ficam no save.

`npm test` verifica as regras e integrações. `scripts/browser-game-features.mjs` exercita as 13 modalidades no celular com toque, teclado, pausa e confirmação; aceita `O_REI_PLAYWRIGHT_MODULE` para localizar Playwright e `O_REI_QA_URL` para a prévia. O estudo e as diferenças de adaptação estão em `research/rea-games-features.md`.

O REA foi usado para observar a carreira completa, os tutoriais e artefatos públicos. O O REI usa código, sequências e balanceamento próprios. Nos desafios de chance, o alvo é fixado antes da escolha; o resultado não é sorteado novamente após a jogada.
