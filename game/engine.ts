import { clubs, competitions } from "./catalog";
import type { AttributeKey, Attributes, CareerEvent, CareerState, Club, CupFinal, Player, Position, SeasonResult, UpgradeCard } from "./types";

const weights: Record<Position, Partial<Record<AttributeKey, number>>> = {
  GOL: { reflexos: 0.28, saidaGol: 0.2, posicionamento: 0.2, agilidade: 0.16, impulsao: 0.1, lideranca: 0.06 },
  ZAG: { marcacao: 0.24, dividida: 0.2, posicionamento: 0.2, forca: 0.16, impulsao: 0.1, velocidade: 0.1 },
  LD: { velocidade: 0.19, aceleracao: 0.18, resistencia: 0.16, cruzamento: 0.16, marcacao: 0.16, dividida: 0.15 },
  LE: { velocidade: 0.19, aceleracao: 0.18, resistencia: 0.16, cruzamento: 0.16, marcacao: 0.16, dividida: 0.15 },
  VOL: { marcacao: 0.22, dividida: 0.17, passe: 0.16, posicionamento: 0.16, resistencia: 0.15, forca: 0.14 },
  MC: { passe: 0.22, visao: 0.18, dominio: 0.16, resistencia: 0.15, posicionamento: 0.14, chuteLonge: 0.15 },
  MEI: { passe: 0.22, visao: 0.22, dominio: 0.18, drible: 0.16, finalizacao: 0.12, chuteLonge: 0.1 },
  PD: { velocidade: 0.22, aceleracao: 0.2, drible: 0.2, agilidade: 0.16, finalizacao: 0.12, cruzamento: 0.1 },
  PE: { velocidade: 0.22, aceleracao: 0.2, drible: 0.2, agilidade: 0.16, finalizacao: 0.12, cruzamento: 0.1 },
  SA: { finalizacao: 0.2, dominio: 0.17, agilidade: 0.16, aceleracao: 0.15, posicionamento: 0.15, drible: 0.17 },
  CA: { finalizacao: 0.3, posicionamento: 0.2, potenciaChute: 0.16, forca: 0.13, impulsao: 0.11, velocidade: 0.1 },
};

/** Cartas sempre aumentam atributos de futebol mensuráveis — nunca bônus narrativos vagos. */
export const upgradeCards: UpgradeCard[] = [
  { id: "gol-reflexo", rarity: "raro", name: "Reflexo Rápido", changes: { reflexos: 2, agilidade: 1 }, eligible: ["GOL"] },
  { id: "gol-saida", rarity: "epico", name: "Domínio da Área", changes: { saidaGol: 2, impulsao: 2, posicionamento: 1 }, eligible: ["GOL"] },
  { id: "gol-seguranca", rarity: "lendario", name: "Segurança Defensiva", changes: { reflexos: 3, saidaGol: 2, posicionamento: 2, lideranca: 1 }, eligible: ["GOL"] },
  { id: "def-dividida", rarity: "raro", name: "Tempo de Bote", changes: { dividida: 2, marcacao: 1 }, eligible: ["ZAG", "VOL"] },
  { id: "def-corpo", rarity: "epico", name: "Corpo a Corpo", changes: { forca: 2, impulsao: 2, dividida: 1 }, eligible: ["ZAG", "VOL"] },
  { id: "def-regular", rarity: "lendario", name: "Regularidade Defensiva", changes: { marcacao: 3, posicionamento: 2, resistencia: 2, lideranca: 1 }, eligible: ["ZAG", "VOL"] },
  { id: "lat-arranque", rarity: "raro", name: "Arranque", changes: { aceleracao: 2, velocidade: 1 }, eligible: ["LD", "LE"] },
  { id: "lat-fundo", rarity: "epico", name: "Fôlego de Linha", changes: { resistencia: 2, velocidade: 2, cruzamento: 1 }, eligible: ["LD", "LE"] },
  { id: "lat-incansavel", rarity: "lendario", name: "Faixa Incansável", changes: { resistencia: 3, velocidade: 3, aceleracao: 2, cruzamento: 1 }, eligible: ["LD", "LE"] },
  { id: "mc-passe", rarity: "raro", name: "Passe Vertical", changes: { passe: 2, visao: 1 }, eligible: ["MC", "MEI"] },
  { id: "mc-giro", rarity: "epico", name: "Giro Curto", changes: { dominio: 2, agilidade: 2, passe: 1 }, eligible: ["MC", "MEI"] },
  { id: "mc-frieza", rarity: "lendario", name: "Frieza em Decisão", changes: { visao: 3, passe: 2, finalizacao: 2, chuteLonge: 1 }, eligible: ["MC", "MEI"] },
  { id: "ponta-umcontraum", rarity: "raro", name: "Um Contra Um", changes: { drible: 2, agilidade: 1 }, eligible: ["PD", "PE"] },
  { id: "ponta-explosao", rarity: "epico", name: "Explosão Curta", changes: { aceleracao: 2, velocidade: 2, drible: 1 }, eligible: ["PD", "PE"] },
  { id: "ponta-imparavel", rarity: "lendario", name: "Ponta Imparável", changes: { velocidade: 3, aceleracao: 3, agilidade: 2, finalizacao: 1 }, eligible: ["PD", "PE"] },
  { id: "ataque-chute", rarity: "raro", name: "Técnica de Chute", changes: { finalizacao: 2, potenciaChute: 1 }, eligible: ["SA", "CA"] },
  { id: "ataque-area", rarity: "epico", name: "Ataque à Área", changes: { posicionamento: 2, impulsao: 2, finalizacao: 1 }, eligible: ["SA", "CA"] },
  { id: "ataque-artilheiro", rarity: "lendario", name: "Finalizador Completo", changes: { finalizacao: 3, potenciaChute: 2, posicionamento: 2, forca: 1 }, eligible: ["SA", "CA"] },
  { id: "geral-resistencia", rarity: "raro", name: "Base Física", changes: { resistencia: 2, forca: 1 }, eligible: ["GOL", "ZAG", "LD", "LE", "VOL", "MC", "MEI", "PD", "PE", "SA", "CA"] },
  { id: "geral-lideranca", rarity: "epico", name: "Voz de Campo", changes: { lideranca: 2, resistencia: 1, posicionamento: 1 }, eligible: ["GOL", "ZAG", "LD", "LE", "VOL", "MC", "MEI", "PD", "PE", "SA", "CA"] },
  { id: "geral-atleta", rarity: "lendario", name: "Atleta de Elite", changes: { velocidade: 2, aceleracao: 2, resistencia: 2, forca: 1 }, eligible: ["ZAG", "LD", "LE", "VOL", "MC", "MEI", "PD", "PE", "SA", "CA"] },

];

const sponsorBrands = [
  { name: "Pumaro", logo: "/sponsors/pumaro.svg", fame: 8, salary: 3500 },
  { name: "Nykon", logo: "/sponsors/nykon.svg", fame: 7, salary: 3200 },
  { name: "Adirax", logo: "/sponsors/adirax.svg", fame: 6, salary: 3000 },
  { name: "Nova Balance", logo: "/sponsors/nova-balance.png", fame: 6, salary: 2800 }
];

function createSponsorEvent(random: () => number): CareerEvent {
  const brand = sponsorBrands[Math.floor(random() * sponsorBrands.length)];
  return {
    id: `patrocinio-${brand.name.toLowerCase()}`,
    title: `Proposta de patrocínio: ${brand.name}`,
    copy: `Com 50 ou mais de fama, sua carreira chamou a atenção da ${brand.name}. A marca quer vincular a sua imagem a uma campanha.`,
    sponsor: { name: brand.name, logo: brand.logo },
    choices: [
      { label: "Assinar a campanha principal", fame: brand.fame, salary: brand.salary },
      { label: "Fechar uma ação menor", fame: Math.max(3, brand.fame - 3), salary: Math.floor(brand.salary * 0.6) },
      { label: "Recusar a proposta", form: 1 }
    ]
  };
}

const goalkeeperFinalEvents: CareerEvent[] = [
  {
    id: "gol-final-penalti",
    title: "Pênalti no último lance",
    copy: "A final está empatada. O adversário coloca a bola na marca da cal e o estádio inteiro prende a respiração.",
    choices: [
      { label: "Pular no canto esquerdo" },
      { label: "Pular no canto direito" },
      { label: "Ficar parado no meio" }
    ]
  },
  {
    id: "gol-final-cruzamento",
    title: "Cruzamento na área",
    copy: "Nos acréscimos da final, um cruzamento fechado viaja em direção ao gol. Uma decisão define a taça.",
    choices: [
      { label: "Sair socando a bola" },
      { label: "Espalmar no reflexo" },
      { label: "Esperar a bola quicar" }
    ]
  },
  {
    id: "gol-final-rebote",
    title: "Rebote na pequena área",
    copy: "A bola sobra viva na pequena área no último ataque da final. O atacante vem sozinho para finalizar.",
    choices: [
      { label: "Abafar o atacante" },
      { label: "Fechar o ângulo rapidamente" },
      { label: "Recuar para a linha" }
    ]
  }
];

const attackerFinalEvents: CareerEvent[] = [
  {
    id: "ataque-final-penalti",
    title: "Pênalti da taça",
    copy: "A final está empatada e você assume a última cobrança. Um gol coloca a taça nas suas mãos.",
    choices: [
      { label: "Bater no canto esquerdo" },
      { label: "Bater no canto direito" },
      { label: "Tentar uma cavadinha" }
    ]
  },
  {
    id: "ataque-final-contra-ataque",
    title: "Último contra-ataque",
    copy: "O cronômetro está acabando. Você recebe livre na entrada da área e só o goleiro está à frente.",
    choices: [
      { label: "Finalizar cruzado" },
      { label: "Driblar o goleiro" },
      { label: "Tentar um chute de longe" }
    ]
  },
  {
    id: "ataque-final-bola-viva",
    title: "Bola viva na área",
    copy: "Nos segundos finais da decisão, a bola sobra na pequena área. Você tem uma última chance de decidir a taça.",
    choices: [
      { label: "Bater de primeira" },
      { label: "Dominar e deslocar o goleiro" },
      { label: "Tentar uma bicicleta" }
    ]
  }
];

function createAttackerFinalEvent(random: () => number): CareerEvent {
  const scenario = attackerFinalEvents[Math.floor(random() * attackerFinalEvents.length)];
  const losingChoiceIndex = Math.floor(random() * scenario.choices.length);
  return {
    ...scenario,
    choices: scenario.choices.map((choice, index) => ({
      ...choice,
      finalOutcome: index === losingChoiceIndex ? "lose" : "win"
    }))
  };
}

const midfieldFinalEvents: CareerEvent[] = [
  {
    id: "meio-final-falta",
    title: "Falta na entrada da área",
    copy: "No último lance da final, o árbitro marca uma falta perigosa. A bola está na posição perfeita para decidir a taça.",
    choices: [
      { label: "Bater colocado no ângulo" },
      { label: "Levantar na área" },
      { label: "Tentar uma bomba direta" }
    ]
  },
  {
    id: "meio-final-passe",
    title: "Passe entre linhas",
    copy: "Você recebe de frente para a defesa na última jogada da final. Um companheiro invade a área em velocidade.",
    choices: [
      { label: "Enfiar o passe para o atacante" },
      { label: "Conduzir e abrir espaço" },
      { label: "Tentar um lançamento longo" }
    ]
  },
  {
    id: "meio-final-escanteio",
    title: "Escanteio decisivo",
    copy: "O relógio se aproxima do fim. Você vai cobrar o escanteio que pode definir a final.",
    choices: [
      { label: "Fechar na primeira trave" },
      { label: "Achar o segundo pau" },
      { label: "Cobrar curto para segurar a bola" }
    ]
  }
];

const defenseFinalEvents: CareerEvent[] = [
  {
    id: "defesa-final-linha",
    title: "Corte em cima da linha",
    copy: "No último ataque da final, a bola passa pelo goleiro e segue em direção ao gol. Você chega para decidir.",
    choices: [
      { label: "Dar um carrinho para cortar" },
      { label: "Afastar de bico" },
      { label: "Tentar dominar a bola" }
    ]
  },
  {
    id: "defesa-final-cruzamento",
    title: "Cruzamento do último lance",
    copy: "Um cruzamento perigoso atravessa a área no fim da final. O atacante adversário aparece livre.",
    choices: [
      { label: "Antecipar de cabeça" },
      { label: "Cortar para escanteio" },
      { label: "Deixar a bola passar" }
    ]
  },
  {
    id: "defesa-final-dividida",
    title: "Última dividida",
    copy: "O atacante dispara em direção à área no último minuto. Você tem uma chance de impedir o gol da final.",
    choices: [
      { label: "Fechar o espaço e desarmar" },
      { label: "Acompanhar até a linha de fundo" },
      { label: "Tentar o bote de longe" }
    ]
  }
];

function createMidfieldFinalEvent(random: () => number): CareerEvent {
  const scenario = midfieldFinalEvents[Math.floor(random() * midfieldFinalEvents.length)];
  const losingChoiceIndex = Math.floor(random() * scenario.choices.length);
  return { ...scenario, choices: scenario.choices.map((choice, index) => ({ ...choice, finalOutcome: index === losingChoiceIndex ? "lose" : "win" })) };
}

function createDefenseFinalEvent(random: () => number): CareerEvent {
  const scenario = defenseFinalEvents[Math.floor(random() * defenseFinalEvents.length)];
  const losingChoiceIndex = Math.floor(random() * scenario.choices.length);
  return { ...scenario, choices: scenario.choices.map((choice, index) => ({ ...choice, finalOutcome: index === losingChoiceIndex ? "lose" : "win" })) };
}

function createGoalkeeperFinalEvent(random: () => number): CareerEvent {
  const scenario = goalkeeperFinalEvents[Math.floor(random() * goalkeeperFinalEvents.length)];
  const losingChoiceIndex = Math.floor(random() * scenario.choices.length);
  return {
    ...scenario,
    choices: scenario.choices.map((choice, index) => ({
      ...choice,
      finalOutcome: index === losingChoiceIndex ? "lose" : "win"
    }))
  };
}

function pickSeasonEvents(random: () => number, fame: number, position: Position, cupFinal?: CupFinal) {
  const available = [...events];
  if (fame >= 50) available.push(createSponsorEvent(random));
  const count = Math.max(1, Math.floor(random() * 6));
  const selected: CareerEvent[] = [];
  while (selected.length < count && available.length > 0) {
    const index = Math.floor(random() * available.length);
    selected.push(available.splice(index, 1)[0]);
  }
  if (position === "GOL" && cupFinal) selected.push(createGoalkeeperFinalEvent(random));
  if (["CA", "SA", "PD", "PE"].includes(position) && cupFinal) selected.push(createAttackerFinalEvent(random));
  if (["VOL", "MC", "MEI"].includes(position) && cupFinal) selected.push(createMidfieldFinalEvent(random));
  if (["ZAG", "LD", "LE"].includes(position) && cupFinal) selected.push(createDefenseFinalEvent(random));
  return selected;
}

/** Uma opção de cada raridade, com desempate determinístico por semente. */
export function chooseUpgradeCards(position: Position, seed: number): UpgradeCard[] {
  const random = mulberry32(seed);
  return (["raro", "epico", "lendario"] as const).map((rarity) => {
    const pool = upgradeCards.filter((card) => card.rarity === rarity && card.eligible.includes(position));
    return pool[Math.floor(random() * pool.length)] ?? upgradeCards[0];
  });
}

export function computeOvr(player: Pick<Player, "position" | "attributes">) {
  return Math.round(Object.entries(weights[player.position]).reduce((total, [key, weight]) => total + player.attributes[key as AttributeKey] * (weight ?? 0), 0));
}

export function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number) { return Math.max(1, Math.min(99, Math.round(value))); }

export function applyCard(player: Player, card: UpgradeCard): Player {
  if (!card.eligible.includes(player.position)) return player;
  const attributes = { ...player.attributes };
  Object.entries(card.changes).forEach(([key, value]) => { attributes[key as AttributeKey] = clamp(attributes[key as AttributeKey] + (value ?? 0)); });
  return { ...player, attributes };
}

const events: CareerEvent[] = [
  { id: "camisa", title: "Um torcedor pediu sua camisa", copy: "Na saída do estádio, uma criança pede sua camisa e a torcida observa.", choices: [{ label: "Entregar a camisa", fame: 2, idolatry: 4 }, { label: "Tirar foto e prometer outra", fame: 1, idolatry: 1 }, { label: "Recusar com educação", idolatry: -1 }] },
  { id: "entrevista", title: "A pergunta sobre o rival", copy: "Na véspera do clássico, perguntam se você jogaria no rival.", choices: [{ label: "Reafirmar compromisso", idolatry: 3, fame: 1 }, { label: "Evitar polêmica", fame: 0 }, { label: "Deixar o futuro aberto", fame: 1, idolatry: -3 }] },
  { id: "familia", title: "Pedido da família", copy: "Uma decisão fora de campo mexe com sua concentração.", choices: [{ label: "Resolver agora", form: -2, fame: 1 }, { label: "Pedir tempo", form: 1 }, { label: "Delegar a alguém", fame: -1 }] },
  { id: "base", title: "Convite para visitar a base", copy: "Jovens do clube pedem sua presença no treino de formação.", choices: [{ label: "Passar a tarde com a base", fame: 2, idolatry: 3 }, { label: "Enviar uma mensagem", fame: 1, idolatry: 1 }, { label: "Manter a rotina de recuperação", form: 2 }] },
  { id: "critica", title: "Crítica de um ex-jogador", copy: "Um comentarista questiona sua entrega em jogos grandes.", choices: [{ label: "Responder no campo", form: 2, fame: 1 }, { label: "Dar uma entrevista", fame: 2, idolatry: -1 }, { label: "Ignorar o assunto", form: 1 }] },
  { id: "selecao", title: "Pré-lista da seleção", copy: "Seu nome aparece entre os observados para a próxima convocação.", choices: [{ label: "Treinar finalização extra", form: 2, fame: 2 }, { label: "Concentrar no clube", idolatry: 2, form: 1 }, { label: "Falar sobre o sonho", fame: 2, idolatry: -1 }] },
  { id: "comunidade", title: "Ação no bairro", copy: "Uma iniciativa local convida o elenco para um dia com a comunidade.", choices: [{ label: "Participar com discrição", fame: 1, idolatry: 3 }, { label: "Levar doações", fame: 2, idolatry: 2, salary: -2000 }, { label: "Não conseguir comparecer", form: 1 }] },
  { id: "recuperacao", title: "Dia extra de recuperação", copy: "Seu corpo acusa a sequência de viagens e decisões.", choices: [{ label: "Fazer recuperação completa", form: 3, fame: -1 }, { label: "Treino leve com bola", form: 1 }, { label: "Ignorar os sinais", fame: 1, form: -3 }] },
  { id: "faixa", title: "A braçadeira fica vaga", copy: "O capitão não joga a próxima partida e seu nome surge na conversa.", choices: [{ label: "Assumir a responsabilidade", fame: 1, idolatry: 3 }, { label: "Indicar um veterano", idolatry: 1, form: 1 }, { label: "Dizer que ainda não é a hora", form: 1 }] },

  { id: "imprensa", title: "Coletiva polêmica", copy: "Uma pergunta maldosa tenta colocar você contra o técnico.", choices: [{ label: "Defender o grupo", fame: 2, idolatry: 2, form: 1 }, { label: "Responder com provocação", fame: 5, idolatry: -2, form: -1 }] },
  { id: "lesao-leve", title: "Desconforto muscular", copy: "Você sentiu um incômodo no treino. O departamento médico recomenda cuidado.", choices: [{ label: "Seguir o tratamento", form: -1, injuryWeeks: 1 }, { label: "Forçar presença no próximo jogo", fame: 2, form: -4, injuryWeeks: 3 }] },

  { id: "tecnico-fama", title: "Confiança do técnico", copy: "O técnico quer elogiar sua evolução em uma entrevista nacional.", choices: [{ label: "Aceitar a entrevista", fame: 5 }, { label: "Dividir o mérito com o elenco", fame: 2 }] },
  { id: "tecnico-forma", title: "Plano tático especial", copy: "A comissão criou um treino específico para o seu próximo adversário.", choices: [{ label: "Ficar após o treino", form: 4 }, { label: "Seguir a rotina normal", form: 1 }] },
  { id: "tecnico-idolatria", title: "Voto de liderança", copy: "O técnico cogita entregar a braçadeira a você em um clássico.", choices: [{ label: "Assumir a braçadeira", idolatry: 5 }, { label: "Indicar um veterano", idolatry: 2 }] },
  { id: "tecnico-salario", title: "Renovação antecipada", copy: "A diretoria, por indicação do técnico, propõe reajustar seu contrato.", choices: [{ label: "Renovar agora", salary: 3000 }, { label: "Esperar o fim da temporada", salary: 1000 }] },
  { id: "tecnico-lesao", title: "Treino no limite", copy: "O técnico pede intensidade máxima mesmo com o calendário apertado.", choices: [{ label: "Forçar o treino", form: 2, injuryWeeks: 2 }, { label: "Conversar e controlar a carga", form: -1 }] },

  { id: "torcida-fama", title: "Mural da torcida", copy: "Uma foto sua em um mural de torcedores viraliza nas redes.", choices: [{ label: "Compartilhar a homenagem", fame: 5 }, { label: "Agradecer discretamente", fame: 2 }] },
  { id: "torcida-forma", title: "Arquibancada em festa", copy: "A torcida prepara uma recepção especial para o próximo jogo.", choices: [{ label: "Entrar no clima", form: 4 }, { label: "Manter o foco em silêncio", form: 1 }] },
  { id: "torcida-idolatria", title: "Organizada pede presença", copy: "A torcida organizada convida você para um encontro no bairro.", choices: [{ label: "Participar do encontro", idolatry: 5 }, { label: "Mandar uma mensagem em vídeo", idolatry: 2 }] },
  { id: "torcida-salario", title: "Evento com sócios", copy: "O clube oferece uma participação remunerada em um evento para sócios.", choices: [{ label: "Comparecer ao evento", salary: 1800 }, { label: "Recusar para descansar", form: 1 }] },
  { id: "torcida-lesao", title: "Desafio beneficente", copy: "Em um jogo beneficente com torcedores, uma dividida pode custar caro.", choices: [{ label: "Entrar em campo", fame: 2, injuryWeeks: 2 }, { label: "Apoiar fora do gramado", idolatry: 2 }] },

  { id: "extra-fama", title: "Programa de TV", copy: "Um programa popular quer mostrar um dia da sua rotina.", choices: [{ label: "Abrir as portas", fame: 5 }, { label: "Dar uma entrevista curta", fame: 2 }] },
  { id: "extra-forma", title: "Noite antes do jogo", copy: "Amigos chamam você para uma comemoração na véspera de uma partida.", choices: [{ label: "Ficar em casa e descansar", form: 4 }, { label: "Ir por pouco tempo", form: -2, fame: 1 }] },
  { id: "extra-idolatria", title: "Raízes da carreira", copy: "Seu primeiro clube amador pede sua presença em uma homenagem.", choices: [{ label: "Voltar para agradecer", idolatry: 4 }, { label: "Enviar uma camisa autografada", idolatry: 2 }] },
  { id: "extra-salario", title: "Campanha publicitária", copy: "Uma empresa local quer você em uma campanha fora do futebol.", choices: [{ label: "Fechar a campanha", salary: 2500 }, { label: "Negociar só uma aparição", salary: 1200 }] },
  { id: "extra-lesao", title: "Aventura de folga", copy: "Nas férias curtas, você recebe convite para uma atividade radical.", choices: [{ label: "Participar da aventura", fame: 2, injuryWeeks: 3 }, { label: "Escolher um passeio tranquilo", form: 1 }] },

];

/**
 * Cups are not tied to a frozen bracket. A club only enters competitions it
 * could plausibly play in; the season simulation then creates a credible
 * opponent from that same eligible pool when it reaches a final.
 */
const SOUTH_AMERICAN_COUNTRIES = ["Brasil", "Argentina", "Chile", "Colômbia", "Uruguai", "Paraguai", "Peru", "Bolívia", "Equador", "Venezuela"];
const EUROPEAN_COUNTRIES = ["Inglaterra", "Espanha", "Itália", "Alemanha", "França", "Portugal", "Holanda", "Bélgica", "Turquia", "Grécia", "Suíça", "Áustria", "Dinamarca", "Noruega", "Polônia", "Croácia", "Escócia", "Irlanda"];
const NORTH_AMERICAN_LEAGUES = ["mex-liga", "usa-mls"];
const ASIAN_LEAGUES = ["sau-pro", "jpn-j1", "aus-al"];
// Norte, Centro-Oeste e Espírito Santo. A divisão nacional não limita a vaga:
// se o clube atua em um destes estaduais, ele pode sonhar com a Copa Verde.
const COPA_VERDE_STATE_IDS = [
  "bra-state-10", // Goiás
  "bra-state-11", "bra-state-12", "bra-state-13", // Pará, Amazonas, DF
  "bra-state-20", "bra-state-21", "bra-state-22", // MT, MS, ES
  "bra-state-23", "bra-state-24", "bra-state-25", "bra-state-26", "bra-state-27", // AC, RO, RR, AP, TO
];

function cupEligible(club: Club, competitionId: string) {
  const domestic = competitions.find((entry) => entry.id === competitionId);
  if (!domestic) return false;
  // Each Brazilian club has at most one state championship in its catalogue
  // membership. The state title is seasonal, never a separate starting league.
  if (domestic.kind === "state") return club.competitionIds?.includes(competitionId) === true;
  if (competitionId === "copa-verde") return club.competitionIds?.some((id) => COPA_VERDE_STATE_IDS.includes(id)) === true;
  if (competitionId === "lib" || competitionId === "sula") return SOUTH_AMERICAN_COUNTRIES.includes(club.country);
  if (["ucl", "uel", "uecl", "uefa-super"].includes(competitionId)) return EUROPEAN_COUNTRIES.includes(club.country);
  if (competitionId === "concacaf" || competitionId === "leagues-cup") return NORTH_AMERICAN_LEAGUES.includes(club.leagueId);
  if (competitionId === "afc-cl") return ASIAN_LEAGUES.includes(club.leagueId);
  if (competitionId === "cwc") return club.strength >= 64;
  // National cups accept clubs from the same country. Supercups are restricted
  // to stronger clubs, which keeps their finalists credible without a bracket.
  if (domestic.country !== club.country) return false;
  return !competitionId.includes("super") && !competitionId.endsWith("-cs") && !competitionId.endsWith("-tc")
    ? true
    : club.strength >= 67;
}

function pickCupFinal(club: Club, ovr: number, form: number, random: () => number): CupFinal | undefined {
  const available = competitions.filter((competition) =>
    ["cup", "continental", "international", "state"].includes(competition.kind)
    && competition.id !== "wc"
    && cupEligible(club, competition.id),
  );
  if (!available.length) return undefined;
  const chance = Math.min(0.29, 0.035 + Math.max(0, club.strength + ovr * 0.2 - 78) / 210);
  if (random() > chance) return undefined;
  const competition = available[Math.floor(random() * available.length)];
  const opponents = clubs.filter((candidate) => candidate.id !== club.id && cupEligible(candidate, competition.id));
  if (!opponents.length) return undefined;
  // Bias toward opponents with enough strength to make a final feel important.
  const credible = opponents.filter((candidate) => candidate.strength >= Math.max(50, club.strength - 16));
  const pool = credible.length ? credible : opponents;
  const opponent = pool[Math.floor(random() * pool.length)];
  return { competitionId: competition.id, competitionName: competition.name, opponentClubId: opponent.id, opponentClubName: opponent.name };
}

export function simulateSeason(state: CareerState): { state: CareerState; result: SeasonResult } {
  const random = mulberry32(state.seed + state.season * 7919);
  const player = { ...state.player, attributes: { ...state.player.attributes }, clubIdolatry: { ...state.player.clubIdolatry } };
  const club = clubs.find((entry) => entry.id === player.clubId) ?? clubs[0];
  const ovr = computeOvr(player);
  const agePenalty = Math.max(0, player.age - 31) * 1.7;
  const role = Math.max(0.18, Math.min(0.96, (ovr - club.strength + 18 - agePenalty) / 30));
  const games = Math.round(14 + role * 28 - player.injuries * 0.4);
  const attacking = (player.attributes.finalizacao + player.attributes.posicionamento + player.attributes.drible) / 300;
  const creative = (player.attributes.passe + player.attributes.visao + player.attributes.cruzamento) / 300;
  const defensive = (player.attributes.marcacao + player.attributes.dividida + player.attributes.posicionamento) / 300;
  const goals = ["CA", "SA", "PD", "PE", "MEI"].includes(player.position) ? Math.max(0, Math.round(games * attacking * (0.26 + random() * 0.22))) : 0;
  const assists = ["MC", "MEI", "PD", "PE", "LD", "LE"].includes(player.position) ? Math.max(0, Math.round(games * creative * (0.2 + random() * 0.18))) : 0;
  const cleanSheets = ["GOL", "ZAG", "VOL", "LD", "LE"].includes(player.position) ? Math.max(0, Math.round(games * defensive * 0.45)) : 0;
  const injuryWeeks = random() < Math.max(0.04, 0.2 - player.attributes.resistencia / 700) ? Math.round(1 + random() * 7) : 0;
  const league = competitions.find((entry) => entry.id === club.leagueId);
  const winsTitle = club.strength + ovr * 0.24 + random() * 19 > 104;
  const promotion = club.leagueId === "bra-b" ? "Acesso à Série A" : club.leagueId === "bra-c" ? "Acesso à Série B" : club.leagueId === "bra-d" ? "Acesso à Série C" : undefined;
  const title = winsTitle ? (promotion ?? league?.name ?? "Campeonato Nacional") : undefined;
  const cupFinal = pickCupFinal(club, ovr, player.form, random);
  const seasonEvents = pickSeasonEvents(random, player.fame, player.position, cupFinal);
  const event = seasonEvents[0];
  const award = goals >= 24 ? "Chuteira de Ouro" : player.position === "GOL" && cleanSheets >= 16 ? "Melhor Goleiro da Liga" : goals >= 18 ? "Artilheiro da temporada" : (ovr > 88 && random() > 0.78 ? "Bola de Ouro" : (ovr > 84 && random() > 0.62 ? "Melhor jogador da liga" : undefined));
  player.games += games; player.goals += goals; player.assists += assists; player.cleanSheets += cleanSheets; player.saves += player.position === "GOL" ? Math.round(games * (2.4 + random() * 1.6)) : 0;
  player.injuries = injuryWeeks; player.age += 1; player.form = clamp(52 + random() * 42 - injuryWeeks * 2); player.marketValue = Math.max(50_000, Math.round(player.marketValue * (1 + (ovr - 62) / 380 - agePenalty / 300)));
  player.clubIdolatry[player.clubId] = clamp((player.clubIdolatry[player.clubId] ?? 25) + games / 12 + (title ? 9 : 0) + goals / 9);
  if (title) player.titles = [...player.titles, title]; if (award) player.awards = [...player.awards, award];
  const result: SeasonResult = { season: state.season, games, goals, assists, cleanSheets, title, award, injuryWeeks, event, events: seasonEvents, cupFinal, finalOpportunity: Boolean(title) || Boolean(cupFinal) || random() > 0.84 };
  return { state: { ...state, season: state.season + 1, player, history: [...state.history, result] }, result };
}

export function legacy(player: Player) {
  const ovr = computeOvr(player);
  const performance = Math.min(300, Math.round(player.games * 0.22 + player.goals * 1.1 + player.assists * 0.9 + player.cleanSheets * 0.8 + player.saves * 0.14));
  const trophies = Math.min(180, player.titles.length * 14);
  const awards = Math.min(130, player.awards.length * 10);
  const longevity = Math.min(110, Math.max(0, (player.age - 16) * 4));
  const clubLegacy = Math.min(100, Math.max(...Object.values(player.clubIdolatry), 0));
  const score = Math.min(1000, performance + trophies + awards + longevity + clubLegacy + Math.round(ovr * 1.4));
  const global = score >= 950 ? "Lenda Eterna" : score >= 880 ? "Craque Geracional" : score >= 780 ? "Ícone Mundial" : score >= 650 ? "Estrela Continental" : score >= 500 ? "Destaque Nacional" : "Nome de Respeito";
  return { score, global };
}

export function shouldRetire(player: Player, seed: number) {
  const random = mulberry32(seed + player.age * 97)();
  const ovr = computeOvr(player);
  const threshold = player.position === "GOL" || player.position === "ZAG" || player.position === "VOL" ? 39 : 37;
  return player.age >= threshold && (ovr < 72 || random < (player.age - threshold + 1) * 0.24);
}

export function baseAttributes(): Attributes {
  return { velocidade: 58, aceleracao: 58, resistencia: 58, forca: 56, potenciaChute: 55, impulsao: 55, agilidade: 58, dominio: 57, drible: 56, passe: 56, cruzamento: 54, finalizacao: 55, chuteLonge: 54, marcacao: 54, dividida: 53, posicionamento: 56, visao: 55, reflexos: 55, saidaGol: 53, lideranca: 50 };
}
