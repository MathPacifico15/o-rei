export type MiniGameId =
  | "memoria-tatica" | "sequencia-sinais" | "rastrear-bola" | "zonas-goleiro"
  | "timing-chute" | "finta-defensor" | "corrida-faixas" | "quatro-em-linha"
  | "grade-segura" | "codigo-senha";

export interface MiniGameDefinition {
  id: MiniGameId;
  name: string;
  mode: "sequence" | "lanes" | "timing" | "grid" | "connect" | "code";
  description: string;
  tutorial: string;
  rounds: number;
}

export const minigames: MiniGameDefinition[] = [
  { id: "memoria-tatica", name: "Memória tática", mode: "sequence", description: "O padrão de pressão precisa ser lembrado antes do apito.", tutorial: "Repita a sequência de posições indicada.", rounds: 4 },
  { id: "sequencia-sinais", name: "Sequência de sinais", mode: "sequence", description: "O banco passa a jogada por sinais discretos.", tutorial: "Toque os sinais na ordem certa.", rounds: 5 },
  { id: "rastrear-bola", name: "Rastrear a bola", mode: "lanes", description: "A bola sumiu entre pernas e sombras na área.", tutorial: "Escolha a faixa em que a bola termina.", rounds: 5 },
  { id: "zonas-goleiro", name: "Zonas do goleiro", mode: "lanes", description: "O goleiro fecha o canto antes da cobrança.", tutorial: "Escolha a melhor zona para finalizar.", rounds: 5 },
  { id: "timing-chute", name: "Timing de chute", mode: "timing", description: "A finalização pede precisão no último toque.", tutorial: "Pare o marcador dentro da faixa dourada.", rounds: 3 },
  { id: "finta-defensor", name: "Finta do defensor", mode: "lanes", description: "O marcador entrega um lado. Você precisa ler o corpo.", tutorial: "Escolha o lado oposto ao bote.", rounds: 4 },
  { id: "corrida-faixas", name: "Corrida de faixas", mode: "lanes", description: "O corredor está abrindo e fechando em segundos.", tutorial: "Escolha a faixa livre para avançar.", rounds: 5 },
  { id: "quatro-em-linha", name: "Quatro em linha", mode: "connect", description: "Na concentração, o duelo mental decide a confiança.", tutorial: "Conecte quatro peças antes do adversário.", rounds: 1 },
  { id: "grade-segura", name: "Grade segura", mode: "grid", description: "O vestiário montou um treino de leitura de espaços.", tutorial: "Encontre os espaços seguros sem errar.", rounds: 3 },
  { id: "codigo-senha", name: "Código e senha", mode: "code", description: "A prancheta foi protegida antes da decisão.", tutorial: "Observe o código e repita os algarismos.", rounds: 1 },
];

export function miniGameForSeed(seed: number): MiniGameDefinition {
  return minigames[Math.abs(seed) % minigames.length];
}
