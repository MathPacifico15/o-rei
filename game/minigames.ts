export type MiniGameId = "codigo-prancheta" | "copos-embaralhados" | "marca-vermelha" | "labirinto" | "jogo-velha" | "pareamento" | "quebra-cabeca" | "mapa-pressao" | "zona-ouro" | "rastrear-bola";

export interface MiniGameDefinition {
  id: MiniGameId;
  name: string;
  mode: "code" | "cups" | "timing" | "maze" | "ticTacToe" | "pairs" | "puzzle" | "pressureMap" | "goldZone" | "ballTrack";
  description: string; tutorial: string; rounds: number; exclusive?: boolean;
  /** Dificuldade contextual; usada nas campanhas de Copa do Mundo. */
  difficulty?: "easy" | "standard" | "hard" | "veryHard";
}
const generic: MiniGameDefinition[] = [
  { id:"codigo-prancheta",name:"Código da prancheta",mode:"code",description:"O auxiliar protegeu a jogada decisiva com um código.",tutorial:"Memorize cinco números de 1 a 9. A terceira fase desaparece mais rápido.",rounds:3 },
  { id:"copos-embaralhados",name:"Copos embaralhados",mode:"cups",description:"A bola desapareceu sob quatro copos antes da decisão.",tutorial:"Acompanhe a bola durante 6 a 8 trocas e escolha um copo.",rounds:1 },
  { id:"marca-vermelha",name:"Marca vermelha",mode:"timing",description:"O último toque precisa parar no momento exato.",tutorial:"Pare o marcador dentro da faixa vermelha.",rounds:1 },
  { id:"labirinto",name:"Labirinto",mode:"maze",description:"Você enxerga a rota por segundos antes de ela desaparecer.",tutorial:"Revele o caminho, memorize e leve a bola até o gol.",rounds:1 },
  { id:"jogo-velha",name:"Jogo da Velha",mode:"ticTacToe",description:"Um duelo tático 5×5 decide a confiança do elenco.",tutorial:"Conecte quatro X. Primeiro empate reinicia; segundo empate é seu.",rounds:1 },
  { id:"pareamento",name:"Pareamento rápido",mode:"pairs",description:"A concentração pede memória visual sob pressão.",tutorial:"Memorize 8 pares por 1,35 segundo. Cinco erros encerram o jogo.",rounds:1 },
  { id:"quebra-cabeca",name:"Quebra-cabeça",mode:"puzzle",description:"O plano de jogo foi desmontado no vestiário.",tutorial:"Organize 1 a 8 antes do relógio acabar.",rounds:1 },
];
export const exclusiveMinigames: MiniGameDefinition[] = [
  { id:"mapa-pressao",name:"Mapa de pressão",mode:"pressureMap",description:"Cada jogo ocupa um quadrado do caminho até a taça.",tutorial:"Repita a sequência. Ela cresce a cada jogo da campanha.",rounds:1,exclusive:true },
  { id:"zona-ouro",name:"Zona de ouro",mode:"goldZone",description:"A janela decisiva fica menor no caminho até a final.",tutorial:"Pare o marcador na zona de ouro.",rounds:1,exclusive:true },
  { id:"rastrear-bola",name:"Rastrear a bola",mode:"ballTrack",description:"A bola corre entre jogadores em uma sequência veloz.",tutorial:"Acompanhe os passes e encontre quem terminou com a bola.",rounds:1,exclusive:true },
];
export const minigames=[...generic,...exclusiveMinigames];
export function miniGameForFinal(seed:number, options?:{access?:boolean;campaign?:boolean}) {
  if(options?.access)return generic.find(game=>game.id==="marca-vermelha")!;
  const pool=options?.campaign?exclusiveMinigames:generic;
  return pool[Math.abs(seed)%pool.length];
}
export function miniGameForSeed(seed:number){return miniGameForFinal(seed);}
