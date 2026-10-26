# Dez minijogos do O REI

O catálogo existente foi preservado. Motor em `game/minigame-engine.ts`, apresentação em `components/minigame-arena.tsx`, catálogo em `game/minigames.ts`.

## Contrato comum

Tutorial → execução → pausa/retomada → resultado → confirmação. No treino, é possível reiniciar; na carreira, confirmar consome o resultado da decisão. Ocultar a aba pausa o relógio. Seed opcional na propriedade `seed`; embaralhamento Fisher–Yates e gerador determinístico. Nada muda a vitória depois de executar a regra.

Resultado: `id`, `gameId`, `seed`, `difficulty`, `won`, `elapsedMs`, `context`. A decisão é estritamente binária: vitória ou derrota. Tempo e erros servem apenas para feedback local; não há pontuação nem recompensa numérica do minijogo. O Código só entrega resultado após a terceira etapa, que é indicada na interface.

Três níveis de pressão ajustam observação, tempo, tolerância a erros, velocidade e tamanho da janela. Na carreira, o nível é calculado pela força relativa dos clubes, prestígio e fase da competição; só no treino o jogador pode selecioná-lo. Configuração central em `tuning` e `game/minigame-context.ts`. Treino não altera estatísticas da carreira. Áudio é opcional e falha silenciosamente quando indisponível.

| Modalidade | Regra e controle | Testes principais |
|---|---|---|
| Código da Prancheta | Memorizar cinco dígitos, repetir três fases; teclas 1–9 ou botões | Semente e vitória nas três fases pelo teclado |
| Copos Embaralhados | Observar a bola e acompanhar quatro copos nas trocas | Identidade da bola preservada, ordem reproduzível |
| Marca Vermelha | Parar o marcador na faixa; Espaço, Enter ou toque | Acerto/erro nos limites, relógio por tempo decorrido |
| Labirinto | Memorizar rota 5×5 e escolher as casas até o gol | Rota sempre alcançável, erros limitados |
| Jogo da Velha | Quatro em linha no tabuleiro 5×5 contra resposta local | Linhas/diagonais, casas ocupadas, vitória/derrota/empate |
| Pareamento | Oito pares com tolerância de erros por dificuldade | Pares completos, bloqueio durante revelação de erro |
| Quebra-cabeça | Deslizar peças adjacentes até ordenar 1–8 | Embaralhamento sempre solucionável, limite de tempo |
| Mapa de Pressão | Observar e repetir uma sequência de casas | Sequência determinística e limite de entrada |
| Zona de Ouro | Janela menor de timing | Mesma avaliação temporal, janela própria |
| Rastrear a Bola | Acompanhar a bola entre seis posições e indicar a última | Sequência visível, alvo final determinístico |

Teclado: Tab/Enter em todos os botões, setas nos tabuleiros, Esc para pausa. Toque usa os mesmos elementos e regras. Foco visível e redução de movimento estão no CSS. Para modalidades de memória visual não há equivalência completa para pessoas cegas; isso permanece uma melhoria de acessibilidade, não uma capacidade alegada.

O REA foi usado para observar seleção de dificuldade no treino e tutoriais públicos. A regra de pressão contextual na carreira é uma decisão original do O REI, não uma fórmula inferida da referência. A implementação preserva as modalidades fornecidas no repositório, com código e sequências próprios. Não há RNG para reverter acertos ou derrotas.
