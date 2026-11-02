import { rememberClubMilestones } from "./career-history";
import { selectCareerEvents } from "./career-events";
import { clubs, competitions } from "./catalog";
import { countries } from "./countries";
import { COUNTRY_COMPETITION_RULES, competitionRuleFor, qualifiesForWorldCup, SUPER_MUNDIAL_CONTINENTAL_SOURCES, SUPER_MUNDIAL_RANKING_SLOTS, worldCupEligibilityFor, worldCupMiniGameDifficulty, worldCupParticipants } from "./competition-rules";
import type { AttributeKey, Attributes, CampaignMatch, CampaignQualification, CampaignResult, CareerEvent, CareerState, Club, ClubCareerRecord, ClubDynamics, ContractOffer, ContractRole, CupFinal, EvolutionFocus, LeagueTable, LeagueTableEntry, MarketWindow, Player, Position, RandomCareerStart, SeasonCampaign, SeasonEvolution, SeasonResult, UpgradeCard } from "./types";
import { rescueForDecision } from "./world-tournaments";

export const positionAttributeKeys: Record<Position, AttributeKey[]> = {
  GOL: ["reflexo", "elasticidade", "posicionamento", "saida", "lideranca", "fisico"],
  MEI: ["velocidade", "passe", "finalizacao", "drible", "lideranca", "fisico"],
  ATA: ["finalizacao", "cabecada", "velocidade", "forca", "lideranca", "fisico"],
};

const weights: Record<Position, Partial<Record<AttributeKey, number>>> = {
  GOL: { reflexo: .27, elasticidade: .18, posicionamento: .18, saida: .17, lideranca: .08, fisico: .12 },
  MEI: { velocidade: .14, passe: .26, finalizacao: .14, drible: .2, lideranca: .1, fisico: .16 },
  ATA: { finalizacao: .28, cabecada: .17, velocidade: .18, forca: .16, lideranca: .07, fisico: .14 },
};

export const upgradeCards: UpgradeCard[] = [
  { id: "gol-reflexo", rarity: "raro", name: "Reflexo Rápido", changes: { reflexo: 2, elasticidade: 1 }, eligible: ["GOL"] },
  { id: "gol-maos-firmes", rarity: "raro", name: "Mãos Firmes", changes: { reflexo: 1, posicionamento: 2 }, eligible: ["GOL"] },
  { id: "gol-voz-area", rarity: "raro", name: "Voz da Área", changes: { lideranca: 2, saida: 1 }, eligible: ["GOL"] },
  { id: "gol-salto", rarity: "raro", name: "Salto Explosivo", changes: { elasticidade: 2, fisico: 1 }, eligible: ["GOL"] },
  { id: "gol-linha", rarity: "raro", name: "Linha Certa", changes: { posicionamento: 2, reflexo: 1 }, eligible: ["GOL"] },
  { id: "gol-saida", rarity: "epico", name: "Dono da Área", changes: { saida: 2, posicionamento: 2, fisico: 1 }, eligible: ["GOL"] },
  { id: "gol-penalti", rarity: "epico", name: "Caçador de Pênaltis", changes: { reflexo: 2, lideranca: 1, elasticidade: 1 }, eligible: ["GOL"] },
  { id: "gol-livre", rarity: "epico", name: "Goleiro-Líbero", changes: { saida: 2, posicionamento: 1, fisico: 1 }, eligible: ["GOL"] },
  { id: "gol-muralha", rarity: "lendario", name: "Muralha", changes: { reflexo: 3, elasticidade: 2, saida: 2, lideranca: 1 }, eligible: ["GOL"] },
  { id: "gol-impossivel", rarity: "lendario", name: "Defesa Impossível", changes: { reflexo: 3, elasticidade: 2, posicionamento: 2, fisico: 1 }, eligible: ["GOL"] },
  { id: "mei-passe", rarity: "raro", name: "Passe Cirúrgico", changes: { passe: 2, drible: 1 }, eligible: ["MEI"] },
  { id: "mei-conducao", rarity: "raro", name: "Condução Leve", changes: { drible: 2, velocidade: 1 }, eligible: ["MEI"] },
  { id: "mei-virada", rarity: "raro", name: "Virada de Jogo", changes: { passe: 2, lideranca: 1 }, eligible: ["MEI"] },
  { id: "mei-chegada", rarity: "raro", name: "Chegada na Área", changes: { finalizacao: 2, velocidade: 1 }, eligible: ["MEI"] },
  { id: "mei-volante", rarity: "raro", name: "Pulmão do Time", changes: { fisico: 2, passe: 1 }, eligible: ["MEI"] },
  { id: "mei-criacao", rarity: "epico", name: "Maestro em Campo", changes: { passe: 2, velocidade: 1, finalizacao: 1, lideranca: 1 }, eligible: ["MEI"] },
  { id: "mei-entrelinhas", rarity: "epico", name: "Rei das Entrelinhas", changes: { drible: 2, passe: 2, finalizacao: 1 }, eligible: ["MEI"] },
  { id: "mei-ritmo", rarity: "epico", name: "Dono do Ritmo", changes: { lideranca: 2, passe: 2, fisico: 1 }, eligible: ["MEI"] },
  { id: "mei-camisa10", rarity: "lendario", name: "Camisa 10", changes: { passe: 3, drible: 2, finalizacao: 2, lideranca: 1 }, eligible: ["MEI"] },
  { id: "mei-genio", rarity: "lendario", name: "Gênio da Bola", changes: { passe: 3, drible: 3, velocidade: 1, finalizacao: 1 }, eligible: ["MEI"] },
  { id: "ata-finalizacao", rarity: "raro", name: "Matador", changes: { finalizacao: 2, velocidade: 1 }, eligible: ["ATA"] },
  { id: "ata-arrancada", rarity: "raro", name: "Arrancada Fatal", changes: { velocidade: 2, finalizacao: 1 }, eligible: ["ATA"] },
  { id: "ata-pivo", rarity: "raro", name: "Pivô Forte", changes: { forca: 2, lideranca: 1 }, eligible: ["ATA"] },
  { id: "ata-cabeca-raro", rarity: "raro", name: "Tempo de Bola", changes: { cabecada: 2, fisico: 1 }, eligible: ["ATA"] },
  { id: "ata-pressao", rarity: "raro", name: "Pressão Alta", changes: { fisico: 2, velocidade: 1 }, eligible: ["ATA"] },
  { id: "ata-cabeca", rarity: "epico", name: "Dono do Alto", changes: { cabecada: 2, forca: 1, fisico: 1 }, eligible: ["ATA"] },
  { id: "ata-frieza", rarity: "epico", name: "Frieza na Área", changes: { finalizacao: 2, forca: 1, lideranca: 1 }, eligible: ["ATA"] },
  { id: "ata-completo", rarity: "epico", name: "Atacante Completo", changes: { finalizacao: 1, cabecada: 1, velocidade: 1, forca: 1 }, eligible: ["ATA"] },
  { id: "ata-camisa9", rarity: "lendario", name: "Camisa 9", changes: { finalizacao: 3, cabecada: 2, velocidade: 1, forca: 1 }, eligible: ["ATA"] },
  { id: "ata-historico", rarity: "lendario", name: "Artilheiro Histórico", changes: { finalizacao: 3, velocidade: 2, forca: 2, cabecada: 1 }, eligible: ["ATA"] },
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

function pickSeasonEvents(random: () => number, fame: number, _position: Position) {
  const available = [...events];
  if (fame >= 50) available.push(createSponsorEvent(random));
  // Eventos enriquecem a temporada, mas não devem impedir o ritmo da carreira.
  const count = 1 + Math.floor(random() * 3);
  const selected: CareerEvent[] = [];
  while (selected.length < count && available.length > 0) {
    const index = Math.floor(random() * available.length);
    selected.push(available.splice(index, 1)[0]);
  }
  return selected;
}

/** Três cartas sorteadas: raras dominam, épicas são especiais e lendárias exceção. */
export function chooseUpgradeCards(position: Position, seed: number, recent: string[] = []): UpgradeCard[] {
  const random = mulberry32(seed);
  const eligible = upgradeCards.filter((card) => card.eligible.includes(position));
  const selected = new Set<string>(); const blocked = new Set(recent);
  const rarityFor = () => {
    const roll = random();
    return roll < .75 ? "raro" : roll < .95 ? "epico" : "lendario";
  };
  return Array.from({ length: Math.min(3, eligible.length) }, () => {
    const rarity = rarityFor();
    const remaining = eligible.filter((card) => !selected.has(card.id));
    const fresh = remaining.filter((card) => !blocked.has(card.id));
    // Recent history may exhaust a position's catalogue. Relax only that
    // cooldown, never the player's position or uniqueness within this hand.
    const candidates = fresh.length ? fresh : remaining;
    const pool = candidates.filter((card) => card.rarity === rarity);
    const card = pool[Math.floor(random() * pool.length)] ?? candidates[Math.floor(random() * candidates.length)];
    selected.add(card.id);
    return card;
  });
}

const randomStartPositions: Position[] = ["GOL", "MEI", "ATA", "ATA"];
function randomInteger(random: () => number, min: number, max: number) { return min + Math.floor(random() * (max - min + 1)); }
function randomHeight(random: () => number, position: Position) {
  const range: Record<Position, readonly [number, number]> = { GOL: [185, 202], MEI: [170, 193], ATA: [175, 198] };
  return randomInteger(random, range[position][0], range[position][1]);
}
export function randomCareerStart(seed: number): RandomCareerStart {
  const normalizedSeed = seed >>> 0, random = mulberry32(normalizedSeed);
  const playableLeagues = competitions.filter((competition) => competition.selectable);
  const playableLeagueIds = new Set(playableLeagues.map((competition) => competition.id));
  const eligibleClubs = clubs.filter((club) => playableLeagueIds.has(club.leagueId));
  const club = eligibleClubs[Math.floor(random() * eligibleClubs.length)] ?? clubs[0];
  const league = playableLeagues.find((competition) => competition.id === club.leagueId) ?? playableLeagues[0];
  const position = randomStartPositions[Math.floor(random() * randomStartPositions.length)];
  const nationality = countries[Math.floor(random() * countries.length)]?.name ?? "Brasil";
  const footRoll = random();
  const preferredFoot: Player["preferredFoot"] = footRoll < .5 ? "Direito" : footRoll < .85 ? "Esquerdo" : "Ambidestro";
  return { seed: normalizedSeed, position, club: { ...club }, league: { ...league }, nationality, preferredFoot, heightCm: randomHeight(random, position), shirtNumber: position === "MEI" ? 10 : position === "ATA" ? 9 : randomInteger(random, 1, 99) };
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

/**
 * Rendimento por idade. O jogador chega ao auge aos 26 e o mantém até os 33.
 * Depois disso, físico alto suaviza a queda de rendimento.
 */
export function agePerformanceMultiplier(age: number, physical = 50) {
  if (age <= 16) return 0.82;
  if (age < 26) return 0.82 + (age - 16) * 0.03;
  if (age <= 33) return 1.12;
  const physicalProtection = 0.55 + Math.max(1, Math.min(99, physical)) / 100;
  const yearlyDecline = 0.045 / physicalProtection;
  return Math.max(0.55, 1.12 - (age - 33) * yearlyDecline);
}

function clamp(value: number) { return Math.max(1, Math.min(99, Math.round(value))); }

/** A promessa geracional começa mais pronta, com OVR-alvo entre 62 e 70. */
export function generationalAttributes(position: Position, seed: number): Attributes {
  const random = mulberry32(seed);
  const targetOvr = randomInteger(random, 62, 70);
  const attributes = baseAttributes();
  positionAttributeKeys[position].forEach((key) => {
    attributes[key] = clamp(targetOvr + randomInteger(random, -3, 3));
  });
  // Corrige o atributo com maior peso para garantir o OVR-alvo sorteado.
  const [mainAttribute, mainWeight] = Object.entries(weights[position]).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0] as [AttributeKey, number];
  const currentOvr = computeOvr({ position, attributes });
  attributes[mainAttribute] = clamp(attributes[mainAttribute] + (targetOvr - currentOvr) / mainWeight);
  return attributes;
}

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
  { id: "febre", title: "Febre na concentração", copy: "Na véspera de uma rodada importante, você acorda debilitado. O médico recomenda repouso.", choices: [{ label: "Respeitar o repouso", form: 1 }, { label: "Tentar jogar mesmo assim", fame: 2, form: -3, injuryWeeks: 1 }] },
  { id: "rival-artilheiro", title: "O rival da artilharia provocou", copy: "O artilheiro do campeonato disse que a sua boa fase não vai durar.", choices: [{ label: "Responder no campo", form: 3, fame: 1 }, { label: "Evitar a provocação", form: 1 }, { label: "Responder nas redes", fame: 3, idolatry: -2 }] },
  { id: "recorde", title: "Marca histórica à vista", copy: "A imprensa aponta que você está perto de uma marca importante do clube.", choices: [{ label: "Assumir a ambição", fame: 2, form: 2 }, { label: "Dividir o foco com o time", idolatry: 3 }, { label: "Não comentar", form: 1 }] },
  { id: "olheiro", title: "Olheiros na arquibancada", copy: "Representantes de clubes maiores acompanham uma partida sua das tribunas.", choices: [{ label: "Jogar com personalidade", fame: 3, form: 2 }, { label: "Manter o jogo simples", form: 2 }, { label: "Sentir a pressão", form: -2 }] },

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
const NATIONAL_TEAM_COMPETITION_IDS = ["wc", "copa-america", "euro", "gold-cup", "afcon", "asian-cup", "ofc-nations"] as const;
const EUROPEAN_COUNTRY_CODES = "AL AD AM AT AZ BY BE BA BG HR CY CZ DK EE FI FR GE DE GR HU IS IE IT KZ LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH TR UA GB VA".split(" ");
const SOUTH_AMERICAN_COUNTRY_CODES = "AR BO BR CL CO EC PY PE UY VE".split(" ");
const NORTH_AND_CENTRAL_AMERICAN_COUNTRY_CODES = "AG BS BB BZ CA CR CU DM DO SV GD GT GY HT HN JM MX NI PA KN LC SR VC TT US".split(" ");
const AFRICAN_COUNTRY_CODES = "DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW".split(" ");
const ASIAN_COUNTRY_CODES = "AF AU BH BD BT BN KH CN IN ID IR IQ IL JP JO KP KR KW KG LA LB MY MV MN MM NP OM PK PH QA SA SG LK SY TJ TH TL TM AE UZ VN YE PS".split(" ");
const OCEANIAN_COUNTRY_CODES = "FJ KI MH FM NR NZ PW PG WS SB TO TV VU".split(" ");

function hasCountryCode(nationality: string, codes: string[]) {
  return countries.some((country) => country.name === nationality && codes.includes(country.code));
}

function selectionTournamentFor(nationality: string, season: number) {
  // Copa do Mundo de quatro em quatro anos; continentais no ciclo intermediário.
  if (season % 4 === 2) return qualifiesForWorldCup(nationality, season) ? "Copa do Mundo" : undefined;
  if (season % 4 !== 0) return undefined;
  if (hasCountryCode(nationality, EUROPEAN_COUNTRY_CODES)) return "Eurocopa";
  if (hasCountryCode(nationality, SOUTH_AMERICAN_COUNTRY_CODES)) return "Copa América";
  if (hasCountryCode(nationality, NORTH_AND_CENTRAL_AMERICAN_COUNTRY_CODES)) return "Copa Ouro da CONCACAF";
  if (hasCountryCode(nationality, AFRICAN_COUNTRY_CODES)) return "Copa Africana de Nações";
  if (hasCountryCode(nationality, ASIAN_COUNTRY_CODES)) return "Copa da Ásia";
  if (hasCountryCode(nationality, OCEANIAN_COUNTRY_CODES)) return "Copa das Nações da OFC";
  return undefined;
}

function simulateNationalTeamCampaign(player: Player, season: number, ovr: number, random: () => number) {
  if (ovr < 82) return {};
  const competition = selectionTournamentFor(player.nationality, season);
  if (!competition) return {};
  const titleChance = Math.min(0.42, 0.1 + (ovr - 82) * 0.018 + Math.max(0, player.form - 65) / 500);
  return { competition, title: random() < titleChance ? competition : undefined };
}

// Norte, Centro-Oeste e Espírito Santo. A divisão nacional não limita a vaga:
// se o clube atua em um destes estaduais, ele pode sonhar com a Copa Verde.
const COPA_VERDE_STATE_IDS = [
  "bra-state-10", // Goiás
  "bra-state-11", "bra-state-12", "bra-state-13", // Pará, Amazonas, DF
  "bra-state-20", "bra-state-21", "bra-state-22", // MT, MS, ES
  "bra-state-23", "bra-state-24", "bra-state-25", "bra-state-26", "bra-state-27", // AC, RO, RR, AP, TO
];
const COPA_VERDE_STATE_SET = new Set(COPA_VERDE_STATE_IDS);

function countryCompetitionRules(country: string) {
  const rule = competitionRuleFor(country);
  if (!rule) return { topLeague: undefined, primaryCup: undefined, secondaryCups: [], supercups: [] };
  const byId = (id: string) => competitions.find((entry) => entry.id === id);
  return {
    topLeague: byId(rule.topLeague),
    primaryCup: rule.primaryCup ? byId(rule.primaryCup) : undefined,
    secondaryCups: (rule.secondaryCups ?? []).map(byId).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    supercups: (rule.supercups ?? []).map(byId).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
  };
}
function cupEligible(club: Club, competitionId: string, state?: CareerState) {
  const domestic = competitions.find((entry) => entry.id === competitionId);
  if (!domestic) return false;
  // Copa Verde é regional: Norte, Centro-Oeste e Espírito Santo. Ela não é
  // uma copa aberta da Série A; Santos, Fluminense e clubes de fora da região
  // jamais entram apenas por força ou divisão.
  if (competitionId === "copa-verde") return (club.competitionIds ?? []).some((id) => COPA_VERDE_STATE_SET.has(id));
  // Each Brazilian club has at most one state championship in its catalogue
  // membership. The state title is seasonal, never a separate starting league.
  if (domestic.kind === "state") return club.country === "Brasil" && club.competitionIds?.includes(competitionId) === true;
  const rules = countryCompetitionRules(domestic.country);
  // Copas nacionais só usam clubes que estejam atualmente na primeira divisão.
  // A competição de cada país vem do regulamento explícito, não da força do clube.
  if (domestic.kind === "cup" && (rules.primaryCup?.id === competitionId || rules.secondaryCups.some((cup) => cup.id === competitionId))) {
    const currentLeague = state ? currentLeagueId(state, club) : club.leagueId;
    return currentLeague === rules.topLeague?.id;
  }
  if (competitionId === "lib" || competitionId === "sula") return continentalEligible(state, club, competitionId, "southAmerica");
  if (["ucl", "uel", "uecl"].includes(competitionId)) return continentalEligible(state, club, competitionId, "europe");
  if (competitionId === "concacaf") return continentalEligible(state, club, competitionId, "northAmerica");
  if (competitionId === "leagues-cup") return NORTH_AMERICAN_LEAGUES.includes(state ? currentLeagueId(state, club) : club.leagueId);
  if (competitionId === "afc-cl") return continentalEligible(state, club, competitionId, "asia");
  // Nunca existe uma inscrição doméstica "por acaso": ela precisa estar no
  // regulamento do país. Supercopas entram apenas via campeão da época anterior.
  return false;
}

/** Participante continental = primeira divisão + vaga conquistada.
 * Para rivais sem uma tabela histórica simulada, o filtro de força preserva
 * apenas candidatos críveis da elite e exclui clubes recém-chegados/pequenos. */
function continentalEligible(state: CareerState | undefined, club: Club, competitionId: string, continent: "southAmerica" | "europe" | "northAmerica" | "asia") {
  const rule = competitionRuleFor(club.country);
  const leagueId = state ? currentLeagueId(state, club) : club.leagueId;
  if (!rule || rule.continent !== continent || leagueId !== rule.topLeague) return false;
  if (state?.campaignQualifications?.[club.id]?.some((entry) => entry.competitionId === competitionId)) return true;
  const minimum = competitionId === "ucl" || competitionId === "lib" ? 68 : competitionId === "uel" || competitionId === "concacaf" || competitionId === "afc-cl" ? 61 : 55;
  const strength = state ? effectiveClub(state, club).strength : club.strength;
  return strength >= minimum;
}

function pickCupFinal(club: Club, ovr: number, form: number, random: () => number, opportunityBonus = 0): CupFinal | undefined {
  const available = competitions.filter((competition) =>
    ["cup", "continental", "international", "state"].includes(competition.kind)
    && !NATIONAL_TEAM_COMPETITION_IDS.includes(competition.id as typeof NATIONAL_TEAM_COMPETITION_IDS[number])
    && cupEligible(club, competition.id),
  );
  if (!available.length) return undefined;
  const chance = Math.min(0.42, 0.035 + Math.max(0, club.strength + ovr * 0.2 - 78) / 210 + opportunityBonus);
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

function effectiveClub(state: CareerState, base: Club): Club {
  const dynamic = state.clubDynamics?.[base.id];
  const adjustment = state.clubStrengthAdjustments?.[base.id] ?? 0;
  return {
    ...base,
    strength: Math.min(99, Math.max(25, dynamic?.strength ?? base.strength + adjustment)),
    reputation: Math.min(100, Math.max(10, dynamic?.reputation ?? base.reputation)),
    budget: Math.max(5, dynamic?.budget ?? base.budget),
  };
}

const evolutionFocuses: Record<Position, Record<EvolutionFocus, AttributeKey[]>> = {
  GOL: {
    assinatura: ["reflexo"],
    estilo: ["elasticidade", "posicionamento", "saida"],
    liderancaFisica: ["lideranca", "fisico"],
  },
  MEI: {
    assinatura: ["passe"],
    estilo: ["velocidade", "finalizacao", "drible"],
    liderancaFisica: ["lideranca", "fisico"],
  },
  ATA: {
    assinatura: ["finalizacao"],
    estilo: ["cabecada", "velocidade"],
    liderancaFisica: ["forca", "lideranca", "fisico"],
  },
};

/** Pontos naturais anuais. A faixa maior pertence ao Craque Geracional. */
export function naturalEvolutionRange(age: number, mode: CareerState["mode"] = "normal"): readonly [number, number] | undefined {
  const normal = age <= 18 ? [5, 8] : age <= 22 ? [4, 7] : age <= 26 ? [3, 5] : age <= 30 ? [1, 3] : undefined;
  const generational = age <= 18 ? [8, 12] : age <= 22 ? [6, 10] : age <= 26 ? [5, 7] : age <= 30 ? [2, 5] : undefined;
  return (mode === "generational" ? generational : normal) as readonly [number, number] | undefined;
}

export function createSeasonEvolution(player: Player, mode: CareerState["mode"], season: number, seed: number, rating = 6.5): SeasonEvolution | undefined {
  const range = naturalEvolutionRange(player.age, mode);
  if (!range) return undefined;
  const random = mulberry32(seed);
  // A nota apenas decide onde a carreira cai dentro da faixa, sem retirar evolução de uma temporada ruim.
  const performance = Math.max(0, Math.min(1, (rating - 5.2) / 3.2));
  const spread = range[1] - range[0];
  const points = range[0] + Math.min(spread, Math.max(0, Math.round(performance * spread + random() * .75)));
  return { season, age: player.age, points, mode: mode === "generational" ? "generational" : "normal", available: ["assinatura", "estilo", "liderancaFisica"] };
}

/** Evolução automática ao fim do ano, sem interromper o ritmo da carreira. */
export function applyAutomaticSeasonEvolution(player: Player, mode: CareerState["mode"], season: number, seed: number): { player: Player; evolution?: SeasonEvolution } {
  const age = player.age;
  const perAttribute = age <= 18 ? 4 : age <= 22 ? mode === "generational" ? 3 : 2 : age <= 26 ? mode === "generational" ? 3 : 2 : age <= 30 ? 2 : age <= 33 && mode === "generational" ? 1 : 0;
  const attributes = { ...player.attributes };
  const gains: Partial<Attributes> = {};
  const random = mulberry32(seed);
  // A queda começa depois dos 30. Físico alto não torna o atleta imortal:
  // apenas reduz quantos atributos cedem por temporada.
  if (age >= 31) {
    const keys = [...positionAttributeKeys[player.position]].sort(() => random() - .5);
    const protectedByPhysical = player.attributes.fisico >= 90 ? 2 : player.attributes.fisico >= 85 ? 1 : 0;
    const losses = Math.max(1, (age >= 34 ? 4 : 2) - protectedByPhysical);
    for (const key of keys.slice(0, losses)) {
      if (attributes[key] > 35) { attributes[key] -= 1; gains[key] = -1; }
    }
    const points = Object.values(gains).reduce((total, value) => total + (value ?? 0), 0);
    return { player: { ...player, attributes }, evolution: { season, age, points, mode: mode === "generational" ? "generational" : "normal", available: [], gains } };
  }
  for (const key of positionAttributeKeys[player.position]) {
    const gain = perAttribute;
    const applied = Math.max(0, Math.min(gain, 99 - attributes[key]));
    if (applied) { attributes[key] += applied; gains[key] = applied; }
  }
  const points = Object.values(gains).reduce((total, value) => total + (value ?? 0), 0);
  return { player: { ...player, attributes }, evolution: points ? { season, age, points, mode: mode === "generational" ? "generational" : "normal", available: [], gains } : undefined };
}

/**
 * Aplica a identidade escolhida no Radar. Depois de 85, cada ponto técnico
 * tem uma chance menor de entrar naquele atributo — o potencial não some,
 * mas fica progressivamente mais difícil de lapidar.
 */
export function applySeasonEvolution(player: Player, evolution: SeasonEvolution, focus: EvolutionFocus, seed: number, previousFocus?: EvolutionFocus, streak = 0): { player: Player; evolution: SeasonEvolution; streak: number } {
  const random = mulberry32(seed);
  const attributes = { ...player.attributes };
  const keys = evolutionFocuses[player.position][focus];
  const gains: Partial<Attributes> = {};
  const addPoint = (key: AttributeKey) => {
    if (attributes[key] >= 99) return false;
    if (attributes[key] >= 85 && random() > .48) return false;
    attributes[key] = clamp(attributes[key] + 1);
    gains[key] = (gains[key] ?? 0) + 1;
    return true;
  };
  for (let point = 0; point < evolution.points; point += 1) {
    const ordered = [...keys].sort(() => random() - .5);
    for (const key of ordered) if (addPoint(key)) break;
  }
  const nextStreak = previousFocus === focus ? streak + 1 : 1;
  const signature = evolutionFocuses[player.position].assinatura[0];
  let bonusSignature = false;
  if (nextStreak >= 2 && addPoint(signature)) bonusSignature = true;
  return { player: { ...player, attributes }, evolution: { ...evolution, focus, gains, bonusSignature }, streak: nextStreak };
}

function campaignCategory(competitionId: string): SeasonCampaign["category"] {
  const competition = competitions.find((item) => item.id === competitionId);
  if (competitionId === "cwc") return "world";
  if (["recopa-sudamericana", "uefa-super"].includes(competitionId)) return "supercup";
  if (competition?.kind === "international") return "national";
  if (competition?.kind === "continental") return "continental";
  if (competition?.kind === "state") return "state";
  if (competitionId.includes("super") || competitionId.endsWith("-cs") || competitionId.endsWith("-tc") || competitionId === "bra-super") return "supercup";
  return competition?.kind === "league" ? "league" : "cup";
}
function isSupercup(competitionId: string) { return campaignCategory(competitionId) === "supercup"; }
function campaignPhases(category: SeasonCampaign["category"]) {
  if (category === "supercup") return ["Final"];
  if (category === "state") return ["Quartas de final", "Semifinal", "Final"];
  if (category === "continental") return ["Fase de grupos", "Oitavas de final", "Quartas de final", "Semifinal", "Final"];
  return ["Oitavas de final", "Quartas de final", "Semifinal", "Final"];
}

type SuperMundialRegion = keyof typeof SUPER_MUNDIAL_RANKING_SLOTS;
function superMundialRegion(state: CareerState, club: Club): SuperMundialRegion | undefined {
  const rule = competitionRuleFor(club.country);
  const league = competitions.find((entry) => entry.id === currentLeagueId(state, club));
  if (!rule || league?.tier !== 1) return undefined;
  return rule.continent === "europe" || rule.continent === "southAmerica" || rule.continent === "northAmerica" || rule.continent === "asia" ? rule.continent : undefined;
}
function superMundialRank(state: CareerState, club: Club) {
  const current = effectiveClub(state, club);
  const cycleStart = state.season - 4;
  const continental = SUPER_MUNDIAL_CONTINENTAL_SOURCES.reduce((total, competitionId) => total + (state.competitionWinners?.[competitionId] ?? []).filter((winner) => winner.clubId === club.id && winner.season >= cycleStart).length, 0);
  const domestic = Object.entries(state.competitionWinners ?? {}).reduce((total, [competitionId, winners]) => total + (competitionId === currentLeagueId(state, club) ? winners.filter((winner) => winner.clubId === club.id && winner.season >= cycleStart).length : 0), 0);
  const history = continental * 24 + domestic * 7 + (state.clubDynamics?.[club.id]?.titles ?? 0) * 2;
  return history + current.strength * .48 + current.reputation * .24 + Math.min(100, current.budget) * .05;
}
function wonContinentalInCycle(state: CareerState, clubId: string) {
  const cycleStart = state.season - 4;
  return SUPER_MUNDIAL_CONTINENTAL_SOURCES.some((competitionId) =>
    (state.competitionWinners?.[competitionId] ?? []).some((winner) => winner.clubId === clubId && winner.season >= cycleStart && winner.season < state.season),
  );
}
/**
 * Participantes do Super Mundial da edição: campeões continentais do ciclo
 * ocupam vaga automática; as vagas restantes vão ao ranking das primeiras
 * divisões. O resultado é recalculável a partir do save e não usa clubes
 * aleatórios fora da elite.
 */
export function superMundialEligibleClubs(state: CareerState) {
  const elite = clubs.filter((club) => Boolean(superMundialRegion(state, club)));
  const selected = new Set(elite.filter((club) => wonContinentalInCycle(state, club.id)).map((club) => club.id));
  const countryCounts = new Map<string, number>();
  for (const club of elite.filter((entry) => selected.has(entry.id))) countryCounts.set(club.country, (countryCounts.get(club.country) ?? 0) + 1);
  for (const [region, slots] of Object.entries(SUPER_MUNDIAL_RANKING_SLOTS) as Array<[SuperMundialRegion, number]>) {
    const regional = elite.filter((club) => superMundialRegion(state, club) === region).sort((a, b) => superMundialRank(state, b) - superMundialRank(state, a));
    let taken = regional.filter((club) => selected.has(club.id)).length;
    for (const club of regional) {
      if (taken >= slots) break;
      if (!selected.has(club.id) && (countryCounts.get(club.country) ?? 0) < 2) { selected.add(club.id); countryCounts.set(club.country, (countryCounts.get(club.country) ?? 0) + 1); taken += 1; }
    }
  }
  // Redistribuição global preserva o limite de dois por país para vagas de ranking.
  for (const club of [...elite].sort((a, b) => superMundialRank(state, b) - superMundialRank(state, a))) {
    if (selected.size >= 32) break;
    if (!selected.has(club.id) && (countryCounts.get(club.country) ?? 0) < 2) { selected.add(club.id); countryCounts.set(club.country, (countryCounts.get(club.country) ?? 0) + 1); }
  }
  return elite.filter((club) => selected.has(club.id)).slice(0, 32);
}
function superMundialQualificationSource(state: CareerState, club: Club) {
  return wonContinentalInCycle(state, club.id) ? "campeão continental no ciclo" : "ranking mundial de clubes";
}
function campaignOpponent(state: CareerState, club: Club, competitionId: string, random: () => number, usedOpponentIds: ReadonlySet<string> = new Set()) {
  const competition = competitions.find((entry) => entry.id === competitionId);
  if (competitionId === "cwc") {
    const eligible = superMundialEligibleClubs(state).filter((candidate) => candidate.id !== club.id);
    const pool = eligible.filter((candidate) => !usedOpponentIds.has(candidate.id));
    const selectable = pool.length ? pool : eligible;
    return selectable[Math.floor(random() * selectable.length)] ?? club;
  }
  const primaryCup = competition?.kind === "cup" && countryCompetitionRules(competition.country).primaryCup?.id === competitionId;
  const eligible = clubs.filter((candidate) => candidate.id !== club.id && cupEligible(candidate, competitionId, state) && (!isSupercup(competitionId) || (candidate.country === competition?.country && currentLeagueId(state, candidate) === countryCompetitionRules(competition.country).topLeague?.id)) && (competition?.kind !== "continental" || competitions.find((entry) => entry.id === currentLeagueId(state, candidate))?.tier === 1) && (!primaryCup || currentLeagueId(state, candidate) === countryCompetitionRules(competition.country).topLeague?.id));
  const pool = eligible.filter((candidate) => !usedOpponentIds.has(candidate.id));
  const selectable = pool.length ? pool : eligible;
  const credible = selectable.filter((candidate) => candidate.strength >= Math.max(45, club.strength - 18));
  const selected = (credible.length ? credible : selectable)[Math.floor(random() * Math.max(1, credible.length ? credible.length : selectable.length))];
  return selected ?? clubs.find((candidate) => candidate.id !== club.id && cupEligible(candidate, competitionId, state)) ?? club;
}
function simulatedCampaignMatch(state: CareerState, club: Club, competitionId: string, phase: string, ovr: number, form: number, random: () => number, usedOpponentIds: ReadonlySet<string> = new Set()): CampaignMatch {
  const opponent = campaignOpponent(state, club, competitionId, random, usedOpponentIds);
  const current = effectiveClub(state, club);
  const rival = effectiveClub(state, opponent);
  const stagePenalty = phase.includes("Semifinal") ? .04 : phase.includes("Quartas") ? .02 : 0;
  const edge = (current.strength + ovr * .12 + form * .05 - rival.strength - 12) / 34;
  // A temporada é simulada de uma vez: cada etapa anterior deve dar espaço
  // para campanhas decisivas frequentes, sem garantir o avanço do clube.
  const advances = random() < Math.max(.52, Math.min(.93, .76 + edge * .14 - stagePenalty));
  const goals = advances ? 1 + Math.floor(random() * 3) : Math.floor(random() * 2);
  const opponentGoals = advances ? Math.floor(random() * Math.max(1, goals)) : goals + 1 + Math.floor(random() * 2);
  return { phase, opponentId: opponent.id, opponentName: opponent.name, playerGoals: goals, opponentGoals, result: advances ? "won" : "lost" };
}
function hasRecentWinner(state: CareerState, competitionId: string, clubId: string, beforeSeason: number) {
  return (state.competitionWinners?.[competitionId] ?? []).some((winner) => winner.clubId === clubId && winner.season < beforeSeason);
}
function eligibleForSupercup(state: CareerState, club: Club, competitionId: string) {
  const competition = competitions.find((entry) => entry.id === competitionId); if (!competition) return false;
  if (competitions.find((entry) => entry.id === currentLeagueId(state, club))?.tier !== 1) return false;
  const wonLastSeason = (id: string) => (state.competitionWinners?.[id] ?? []).some((winner) => winner.clubId === club.id && winner.season === state.season - 1);
  if (competitionId === "recopa-sudamericana") return ["lib", "sula"].some(wonLastSeason);
  if (competitionId === "uefa-super") return ["ucl", "uel"].some(wonLastSeason);
  const { topLeague, primaryCup, supercups } = countryCompetitionRules(competition.country);
  if (!supercups.some((supercup) => supercup.id === competitionId)) return false;
  const mainLeague = topLeague?.id;
  const mainCup = primaryCup?.id;
  return Boolean(mainLeague && wonLastSeason(mainLeague)) || Boolean(mainCup && wonLastSeason(mainCup));
}
function supercupOpponent(state: CareerState, club: Club, competitionId: string, random: () => number) {
  const competition = competitions.find((entry) => entry.id === competitionId);
  if (!competition) return campaignOpponent(state, club, competitionId, random);
  const continentalSources = competitionId === "recopa-sudamericana" ? ["lib", "sula"] : competitionId === "uefa-super" ? ["ucl", "uel"] : undefined;
  if (continentalSources) {
    const continentalWinner = continentalSources.flatMap((id) => state.competitionWinners?.[id] ?? []).find((winner) => winner.season === state.season - 1 && winner.clubId !== club.id);
    const rival = continentalWinner && clubs.find((candidate) => candidate.id === continentalWinner.clubId);
    if (rival && competitions.find((entry) => entry.id === currentLeagueId(state, rival))?.tier === 1) return rival;
  }
  const { topLeague, primaryCup, supercups } = countryCompetitionRules(competition.country);
  if (!supercups.some((supercup) => supercup.id === competitionId)) {
    const continent = competitionId === "uefa-super" ? "europe" : "southAmerica";
    return clubs.filter((candidate) => candidate.id !== club.id && competitionRuleFor(candidate.country)?.continent === continent && currentLeagueId(state, candidate) === competitionRuleFor(candidate.country)?.topLeague).sort((a,b) => b.strength-a.strength)[0] ?? campaignOpponent(state, club, competitionId, random);
  }
  const mainLeague = topLeague?.id;
  const mainCup = primaryCup?.id;
  const winners = [mainLeague, mainCup].flatMap((id) => id ? state.competitionWinners?.[id] ?? [] : []).filter((winner) => winner.season === state.season - 1 && winner.clubId !== club.id);
  const eligible = winners.map((winner) => clubs.find((candidate) => candidate.id === winner.clubId)).filter((candidate): candidate is Club => Boolean(candidate) && competitions.find((entry) => entry.id === currentLeagueId(state, candidate!))?.tier === 1);
  if (eligible.length) return eligible[Math.floor(random() * eligible.length)];
  return clubs.filter((candidate) => candidate.id !== club.id && candidate.country === competition.country && competitions.find((entry) => entry.id === currentLeagueId(state, candidate))?.tier === 1).sort((a,b) => b.strength-a.strength)[0] ?? club;
}
function initialQualifications(club: Club, leagueId = club.leagueId): CampaignQualification[] {
  const league = competitions.find((entry) => entry.id === leagueId);
  const rule = league && competitionRuleFor(league.country);
  if (!rule || rule.topLeague !== leagueId) return [];
  const field = clubs.filter(candidate => candidate.country === club.country && candidate.leagueId === leagueId).sort((a,b) => b.strength - a.strength || a.id.localeCompare(b.id));
  const rank = field.findIndex(candidate => candidate.id === club.id) + 1;
  return rank > 0 ? nextSeasonQualifications(leagueId, rank, field.length).map(entry => ({ ...entry, source: 'classificação inicial estimada' })) : [];
}
function campaignEntries(state: CareerState, club: Club): Array<{ competitionId: string; qualification: CampaignQualification }> {
  const entries: Array<{ competitionId: string; qualification: CampaignQualification }> = [];
  const add = (competitionId: string, source: string) => { if (!entries.some((entry) => entry.competitionId === competitionId)) entries.push({ competitionId, qualification: { competitionId, source } }); };
  for (const competition of competitions) {
    if (competition.id === "nations" || competition.kind === "league" || competition.kind === "international" || competition.id === "cwc") continue;
    if ((competition.kind === "cup" || competition.kind === "state") && !isSupercup(competition.id) && cupEligible(club, competition.id, state)) add(competition.id, competition.kind === "state" ? "associação estadual" : "copa nacional");
    if (isSupercup(competition.id) && eligibleForSupercup(state, club, competition.id)) add(competition.id, "campeão na temporada anterior");
  }
  const currentLeague = currentLeagueId(state, club);
  const qualifications = competitions.find((entry) => entry.id === currentLeague)?.tier === 1 ? (state.campaignQualifications?.[club.id] ?? initialQualifications(club, currentLeague)) : [];
  const continentalPriority = ["lib", "sula", "ucl", "uel", "uecl", "concacaf", "afc-cl"];
  const continental = qualifications.filter((qualification) => continentalPriority.includes(qualification.competitionId));
  const nonContinental = qualifications.filter((qualification) => !continentalPriority.includes(qualification.competitionId));
  const preferred = continental.sort((a, b) => continentalPriority.indexOf(a.competitionId) - continentalPriority.indexOf(b.competitionId))[0];
  if (preferred) add(preferred.competitionId, preferred.source);
  for (const qualification of nonContinental) add(qualification.competitionId, qualification.source);
  const worldYear = (state.season - 2025) % 4 === 0;
  if (worldYear && superMundialEligibleClubs(state).some((candidate) => candidate.id === club.id)) add("cwc", superMundialQualificationSource(state, club));
  const order: Record<SeasonCampaign["category"], number> = { supercup: 0, state: 1, cup: 2, continental: 3, world: 4, national: 5, league: 6 };
  return entries.sort((a,b) => order[campaignCategory(a.competitionId)] - order[campaignCategory(b.competitionId)]);
}
function frozenTournamentGroups(participants: Array<{ id: string; name: string; qualification: string }>, playerId: string, groupOpponentIds: string[], groupCount: number) {
  const groupNames = Array.from({ length: groupCount }, (_, index) => `Grupo ${String.fromCharCode(65 + index)}`);
  const playerGroup = [playerId, ...groupOpponentIds].filter((id, index, all) => all.indexOf(id) === index);
  const remaining = participants.map((participant) => participant.id).filter((id) => !playerGroup.includes(id));
  const groups = groupNames.map((name, index) => ({ name, participantIds: index === 0 ? playerGroup : remaining.slice((index - 1) * 4, index * 4) }));
  const groupFor = new Map(groups.flatMap((group) => group.participantIds.map((id) => [id, group.name] as const)));
  return { participants: participants.map((participant) => ({ ...participant, group: groupFor.get(participant.id) })), groups };
}
function buildCampaigns(state: CareerState, club: Club, ovr: number, form: number, random: () => number) {
  const campaigns: CampaignResult[] = [];
  const finals: CupFinal[] = [];
  for (const entry of campaignEntries(state, club)) {
    const competition = competitions.find((item) => item.id === entry.competitionId);
    if (!competition) continue;
    const category = campaignCategory(competition.id);
    if (category === "world") {
      const id = `${state.season}:${competition.id}`;
      // Super Mundial: três jogos de grupo e quatro eliminatórias = sete partidas.
      const phases = ["Grupo · jogo 1", "Grupo · jogo 2", "Grupo · jogo 3", "Oitavas de final", "Quartas de final", "Semifinal", "Final"];
      const usedOpponents = new Set<string>();
      const matches = phases.map((phase, index) => { const opponent = campaignOpponent(state, club, competition.id, random, usedOpponents); usedOpponents.add(opponent.id); return { phase, opponentId: opponent.id, opponentName: opponent.name, result: "pending" as const, playable: true, difficulty: index + 1 }; });
      const groupTable = [{ name: club.name, points: 0, goalDifference: 0, goalsFor: 0, position: 1 }, ...matches.slice(0,3).map((match,index) => ({ name: match.opponentName, points: [6, 3, 0][index], goalDifference: [3, 0, -3][index], goalsFor: [5, 3, 1][index], position: index+2 }))];
      const field = superMundialEligibleClubs(state).map((participant) => ({ id: participant.id, name: participant.name, qualification: superMundialQualificationSource(state, participant) }));
      const frozen = frozenTournamentGroups(field, club.id, matches.slice(0, 3).map((match) => match.opponentId!), 8);
      const campaign: CampaignResult = { id, competitionId: competition.id, competitionName: competition.name, category, qualification: entry.qualification, status: "active", phase: phases[0], matches, prize: competition.prestige * 150_000, groupTable, groupName: "Grupo A", format: "club-world-32", participants: frozen.participants, groups: frozen.groups };
      campaigns.push(campaign);
      matches.forEach((match, index) => finals.push({ competitionId: competition.id, competitionName: competition.name, opponentClubId: match.opponentId ?? "mundial-rival", opponentClubName: match.opponentName, stakes: "campaign", phase: index === matches.length - 1 ? "title" : "access", scope: "club", campaignId: id, campaignMatchIndex: index, campaignDifficulty: match.difficulty, worldStage: index < 3 ? "group" : "knockout", attempt: "regulation", rescueAvailable: rescueForDecision(id, index), decisionId: `${id}:match:${index}:regulation` }));
      continue;
    }
    const id = `${state.season}:${competition.id}`;
    const matches: CampaignMatch[] = [];
    const usedOpponents = new Set<string>();
    let status: SeasonCampaign["status"] = "active";
    let phase = "Inscrito";
    // Um único sorteio determina a campanha estadual: 80% de chance de
    // alcançar a final; o resultado da final continua sendo jogado.
    const stateFinal = category === "state" ? random() < .8 : undefined;
    const stateExit = stateFinal === false ? Math.floor(random() * 2) : -1;
    let stateRound = 0;
    for (const currentPhase of campaignPhases(category)) {
      phase = currentPhase;
      if (currentPhase === "Final") {
        const opponent = category === "supercup" ? supercupOpponent(state, club, competition.id, random) : campaignOpponent(state, club, competition.id, random, usedOpponents);
        usedOpponents.add(opponent.id);
        matches.push({ phase: currentPhase, opponentId: opponent.id, opponentName: opponent.name, result: "pending", playable: true });
        status = "final";
        finals.push({ competitionId: competition.id, competitionName: competition.name, opponentClubId: opponent.id, opponentClubName: opponent.name, stakes: "cup", phase: "title", scope: "club", campaignId: id, campaignMatchIndex: matches.length - 1, decisionId: `${id}:final` });
        break;
      }
      let match = simulatedCampaignMatch(state, club, competition.id, currentPhase, ovr, form, random, usedOpponents);
      if (category === "state") {
        const advances = stateRound++ !== stateExit;
        const scored = advances ? 2 : 0;
        match = { ...match, result: advances ? "won" : "lost", playerGoals: scored, opponentGoals: advances ? 0 : 1 };
      }
      matches.push(match);
      if (match.opponentId) usedOpponents.add(match.opponentId);
      if (match.result === "lost") { status = "eliminated"; break; }
    }
    campaigns.push({ id, competitionId: competition.id, competitionName: competition.name, category, qualification: entry.qualification, status, phase, matches, prize: competition.prestige * 50_000 });
  }
  return { campaigns, finals };
}
function nextSeasonQualifications(leagueId: string, position: number, leagueSize: number): CampaignQualification[] {
  const league = competitions.find((entry) => entry.id === leagueId);
  const rules = league && competitionRuleFor(league.country);
  if (!league || !rules || leagueId !== rules.topLeague) return [];
  const at = (max: number) => position <= Math.min(max, leagueSize);
  if (rules.continent === "southAmerica") return at(4) ? [{ competitionId: "lib", source: "posição na liga" }] : at(8) ? [{ competitionId: "sula", source: "posição na liga" }] : [];
  if (rules.continent === "europe") return at(4) ? [{ competitionId: "ucl", source: "posição na liga" }] : at(6) ? [{ competitionId: "uel", source: "posição na liga" }] : at(7) ? [{ competitionId: "uecl", source: "posição na liga" }] : [];
  if (rules.continent === "northAmerica") return [{ competitionId: "concacaf", source: "posição na liga" }, { competitionId: "leagues-cup", source: "liga participante" }];
  if (rules.continent === "asia" && at(4)) return [{ competitionId: "afc-cl", source: "posição na liga" }];
  return [];
}
function buildWorldCupCampaign(state: CareerState, player: Player, random: () => number) {
  const competition = competitions.find((entry) => entry.id === "wc"); if (!competition) return { campaign: undefined, finals: [] as CupFinal[] };
  // Copa de 48 seleções: grupos, 16-avos, oitavas, quartas, semi e final = oito jogos.
  const phases = ["Grupo · jogo 1", "Grupo · jogo 2", "Grupo · jogo 3", "16-avos de final", "Oitavas de final", "Quartas de final", "Semifinal", "Final"];
  // Fase de grupos pode trazer qualquer classificado. No mata-mata, os
  // adversários são progressivamente mais fortes: uma zebra como Omã não pode
  // surgir do nada numa semifinal ou final.
  const participants = worldCupParticipants(state.season).filter((country) => country.name !== player.nationality);
  const usedOpponents = new Set<string>();
  const opponentForPhase = (index: number) => {
    const permitted = index >= 6 ? participants.filter((country) => worldCupEligibilityFor(country.name) === "group1")
      : index >= 4 ? participants.filter((country) => ["group1", "group2"].includes(worldCupEligibilityFor(country.name)))
        : participants;
    const fresh = permitted.filter((country) => !usedOpponents.has(country.code));
    const rival = (fresh.length ? fresh : permitted)[Math.floor(random() * Math.max(1, (fresh.length ? fresh : permitted).length))] ?? participants[0] ?? countries[0];
    usedOpponents.add(rival.code);
    return rival;
  };
  const id = `${state.season}:wc`;
  const matches = phases.map((phase, index) => { const rival = opponentForPhase(index); return { phase, opponentId: `national-${rival.code}`, opponentName: rival.name, result: "pending" as const, playable: true, difficulty: index + 1 }; });
  const groupTable = [{ name: player.nationality, points: 0, goalDifference: 0, goalsFor: 0, position: 1 }, ...matches.slice(0,3).map((match,index) => ({ name: match.opponentName, points: 3-index, goalDifference: 1-index, goalsFor: 2-index, position: index+2 }))];
  const field = worldCupParticipants(state.season).map((country) => ({ id: `national-${country.code}`, name: country.name, qualification: `eliminatórias · ${worldCupEligibilityFor(country.name)}` }));
  const frozen = frozenTournamentGroups(field, `national-${countries.find((country) => country.name === player.nationality)?.code ?? "PLAYER"}`, matches.slice(0, 3).map((match) => match.opponentId!), 12);
  const campaign: CampaignResult = { id, competitionId: "wc", competitionName: competition.name, category: "national", qualification: { competitionId: "wc", source: "seleção classificada e atleta com OVR mínimo 82" }, status: "active", phase: phases[0], matches, prize: competition.prestige * 180_000, groupTable, groupName: "Grupo A", format: "world-48", participants: frozen.participants, groups: frozen.groups };
  const worldCupDifficulty = worldCupMiniGameDifficulty(player.nationality);
  const finals: CupFinal[] = matches.map((match, index) => ({ competitionId:"wc", competitionName:competition.name, opponentClubId:match.opponentId!, opponentClubName:match.opponentName, stakes:"campaign", phase:index === matches.length - 1 ? "title" : "access", scope:"national", campaignId:id, campaignMatchIndex:index, campaignDifficulty:match.difficulty, worldCupDifficulty, worldStage:index < 3 ? "group" : "knockout", attempt:"regulation", rescueAvailable:rescueForDecision(id,index), decisionId:`${id}:match:${index}:regulation` }));
  return { campaign, finals };
}

function evolveClubDynamics(state: CareerState, table: LeagueTable, random: () => number) {
  const next: Record<string, ClubDynamics> = { ...(state.clubDynamics ?? {}) };
  const size = Math.max(1, table.entries.length);
  for (const entry of table.entries) {
    const base = clubs.find((club) => club.id === entry.clubId);
    if (!base) continue;
    const current = effectiveClub(state, base);
    const relative = (size + 1 - entry.position) / size - .5;
    const movement = entry.position <= table.promotionPlaces ? 2 : entry.position > size - table.relegationPlaces ? -2 : 0;
    next[base.id] = {
      strength: Math.round(Math.min(99, Math.max(25, current.strength + relative * 3 + movement + (entry.position === 1 ? 2 : 0) + random() * 2 - 1))),
      reputation: Math.round(Math.min(100, Math.max(10, current.reputation + relative * 3 + movement + (entry.position === 1 ? 2 : 0)))),
      budget: Math.round(Math.max(5, current.budget * (1 + relative * .08 + movement * .015))),
      titles: (state.clubDynamics?.[base.id]?.titles ?? 0) + (entry.position === 1 ? 1 : 0),
    };
  }
  return next;
}

function currentLeagueId(state: CareerState, club: Club) {
  return state.leagueAssignments?.[club.id] ?? club.leagueId;
}
function countryDivisions(country: string) {
  const configured = competitionRuleFor(country)?.divisions ?? [];
  if (configured.length) return configured.map((id) => competitions.find((competition) => competition.id === id)).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  return [];
}
function movementPlaces(competitionId: string, direction: "up" | "down") {
  const league = competitions.find((entry) => entry.id === competitionId);
  const rules = league && competitionRuleFor(league.country);
  return direction === "up" ? rules?.promotionPlaces?.[competitionId] ?? 2 : rules?.relegationPlaces?.[competitionId] ?? 2;
}
function buildLeagueTable(state: CareerState, leagueId: string, playerClubId: string, playerBoost: number, random: () => number): LeagueTable {
  const competition = competitions.find((entry) => entry.id === leagueId) ?? competitions[0];
  const leagueClubs = clubs.filter((club) => currentLeagueId(state, club) === leagueId);
  /* Cada resultado é criado uma única vez para os dois clubes. A versão anterior
     sorteava W/D/L individualmente e permitia 90 pontos em posição de queda. */
  const entriesById = new Map<string, LeagueTableEntry>();
  const quality = new Map<string, number>();
  for (const baseClub of leagueClubs) {
    const club = effectiveClub(state, baseClub);
    quality.set(club.id, Math.max(25, club.strength + (club.id === playerClubId ? playerBoost : 0)));
    entriesById.set(club.id, { clubId: club.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, position: 0, tieBreaker: random() });
  }
  const play = (homeId: string, awayId: string) => {
    const home = entriesById.get(homeId)!; const away = entriesById.get(awayId)!;
    const gap = (quality.get(homeId)! - quality.get(awayId)!) / 22 + .18;
    const roll = random();
    let homeGoals = Math.max(0, Math.round(.7 + random() * 2.1 + Math.max(0, gap) * .45));
    let awayGoals = Math.max(0, Math.round(.55 + random() * 1.9 + Math.max(0, -gap) * .45));
    const drawChance = Math.max(.16, .29 - Math.abs(gap) * .05);
    if (roll < drawChance) { const shared = Math.floor(random() * 3); homeGoals = shared; awayGoals = shared; }
    else if (roll < .5 + gap * .16 && homeGoals <= awayGoals) homeGoals = awayGoals + 1;
    else if (homeGoals >= awayGoals) awayGoals = homeGoals + 1;
    home.played++; away.played++; home.goalsFor += homeGoals; home.goalsAgainst += awayGoals; away.goalsFor += awayGoals; away.goalsAgainst += homeGoals;
    if (homeGoals === awayGoals) { home.draws++; away.draws++; home.points++; away.points++; }
    else if (homeGoals > awayGoals) { home.wins++; home.points += 3; away.losses++; }
    else { away.wins++; away.points += 3; home.losses++; }
  };
  for (let i = 0; i < leagueClubs.length; i++) for (let j = i + 1; j < leagueClubs.length; j++) { play(leagueClubs[i].id, leagueClubs[j].id); play(leagueClubs[j].id, leagueClubs[i].id); }
  const pointsForWin = competitionRuleFor(competition.country)?.pointsForWin ?? 3;
  const entries = [...entriesById.values()].map((entry) => ({ ...entry, points: entry.wins * pointsForWin + entry.draws })).sort((a,b) => b.points-a.points || (b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst) || b.goalsFor-a.goalsFor || b.wins-a.wins || (b.tieBreaker ?? 0)-(a.tieBreaker ?? 0))
    .map((entry,index) => ({ ...entry, position:index+1 }));
  const divisions = countryDivisions(competition.country);
  const index = divisions.findIndex((entry) => entry.id === leagueId);
  return { competitionId: leagueId, season: state.season, entries, promotionPlaces: index > 0 ? movementPlaces(leagueId, "up") : 0, relegationPlaces: index >= 0 && index < divisions.length-1 ? movementPlaces(leagueId, "down") : 0, promotionPlayoff: competitionRuleFor(competition.country)?.promotionPlayoffs?.[leagueId] };
}
function leagueTarget(state: CareerState, leagueId: string, direction: "up" | "down") {
  const competition = competitions.find((entry) => entry.id === leagueId);
  if (!competition) return undefined;
  const divisions = countryDivisions(competition.country);
  const index = divisions.findIndex((entry) => entry.id === leagueId);
  return divisions[index + (direction === "up" ? -1 : 1)]?.id;
}

type PlayerDivisionOutcome = "stayed" | "promoted" | "relegated";
// Campeões continentais históricos presentes no catálogo, agrupados por país
// para não confundir clubes homônimos, como Santos e Santos Laguna.
const protectedChampions: Record<string, string[]> = {
  Brasil: ["Santos", "Grêmio", "Corinthians", "São Paulo", "Palmeiras", "Flamengo", "Fluminense", "Botafogo", "Atlético-MG", "Cruzeiro", "Internacional", "Vasco da Gama"],
  Espanha: ["Real Madrid", "Barcelona"], Inglaterra: ["Liverpool", "Manchester United", "Manchester City", "Chelsea", "Nottingham Forest", "Aston Villa"],
  Alemanha: ["Bayern München", "Borussia Dortmund", "Hamburgo", "Hamburger SV"], Itália: ["AC Milan", "Milan", "Inter", "Inter de Milão", "Juventus"], França: ["Olympique de Marseille", "Marseille", "Paris Saint-Germain"], Portugal: ["Porto", "Benfica"], Holanda: ["Ajax", "Feyenoord", "PSV", "PSV Eindhoven"], Escócia: ["Celtic"], Romênia: ["Steaua București", "Steaua Bucharest", "FCSB"], Sérvia: ["Estrela Vermelha", "Red Star Belgrade", "Crvena Zvezda"],
  Argentina: ["Independiente", "Boca Juniors", "River Plate", "Estudiantes", "Racing", "Racing Club", "San Lorenzo", "Vélez Sarsfield", "Argentinos Juniors"], Uruguai: ["Peñarol", "Nacional"], Paraguai: ["Olimpia"], Colômbia: ["Atlético Nacional", "Once Caldas"], Chile: ["Colo-Colo", "Colo Colo"], Equador: ["LDU Quito", "Liga de Quito"]
};
export function protectedFromRelegation(club: Club) { return (protectedChampions[club.country] ?? []).includes(club.name); }
export function receivesSurvivalDecision(club: Club, inTopDivision: boolean, inDropZone: boolean, roll: number) {
  return inTopDivision && inDropZone && !protectedFromRelegation(club) && roll < .35;
}
type DivisionMovement = { clubId: string; from: string; to: string };

/** Fecha uma pirâmide de forma atômica. As tabelas sempre representam a mesma
 * temporada; nenhuma troca é usada para recalcular outra divisão. */
function settleCountryDivisions(state: CareerState, tables: Record<string, LeagueTable>, country: string, playerClubId?: string, playerOutcome: PlayerDivisionOutcome = "stayed") {
  const rule = competitionRuleFor(country); const divisions = rule ? countryDivisions(country) : [];
  const assignments = { ...state.leagueAssignments }; const movements: DivisionMovement[] = [];
  if (divisions.length < 2) return { assignments, movements };
  const playerLeagueId = playerClubId ? currentLeagueId(state, clubs.find((club) => club.id === playerClubId) ?? clubs[0]) : undefined;
  for (let index = 0; index < divisions.length; index += 1) {
    const source = divisions[index]; const table = tables[source.id]; if (!table) continue;
    const isPlayerLeague = source.id === playerLeagueId;
    let upSlots = index > 0 ? movementPlaces(source.id, "up") : 0;
    let downSlots = index < divisions.length - 1 ? movementPlaces(source.id, "down") : 0;
    if (isPlayerLeague && playerOutcome === "promoted") upSlots = Math.max(0, upSlots - 1);
    if (isPlayerLeague && playerOutcome === "relegated") downSlots = Math.max(0, downSlots - 1);
    const eligible = table.entries.filter((entry) => entry.clubId !== playerClubId);
    const promoted = eligible.slice(0, upSlots);
    const relegationEligible = eligible.filter(entry => { const club = clubs.find(candidate => candidate.id === entry.clubId); return !club || !protectedFromRelegation(club); });
    const relegated = downSlots ? relegationEligible.slice(-downSlots) : [];
    const upTarget = divisions[index - 1]?.id; const downTarget = divisions[index + 1]?.id;
    if (upTarget) for (const entry of promoted) { assignments[entry.clubId] = upTarget; movements.push({ clubId: entry.clubId, from: source.id, to: upTarget }); }
    if (downTarget) for (const entry of relegated) { assignments[entry.clubId] = downTarget; movements.push({ clubId: entry.clubId, from: source.id, to: downTarget }); }
  }
  if (playerClubId && playerLeagueId) {
    const target = playerOutcome === "promoted" ? leagueTarget(state, playerLeagueId, "up") : playerOutcome === "relegated" ? leagueTarget(state, playerLeagueId, "down") : undefined;
    if (target) { assignments[playerClubId] = target; movements.push({ clubId: playerClubId, from: playerLeagueId, to: target }); }
  }
  return { assignments, movements };
}

function applyMovementDynamics(state: CareerState, movements: DivisionMovement[]) {
  const adjustments = { ...(state.clubStrengthAdjustments ?? {}) };
  for (const movement of movements) {
    const from = competitions.find((competition) => competition.id === movement.from)?.tier ?? 1;
    const to = competitions.find((competition) => competition.id === movement.to)?.tier ?? from;
    const delta = to < from ? 4 : to > from ? -4 : 0;
    if (delta) adjustments[movement.clubId] = Math.max(-30, Math.min(30, (adjustments[movement.clubId] ?? 0) + delta));
  }
  return adjustments;
}

function evolveAllClubDynamics(state: CareerState, tables: Record<string, LeagueTable>, random: () => number) {
  let dynamics: Record<string, ClubDynamics> = { ...(state.clubDynamics ?? {}) };
  for (const table of Object.values(tables)) dynamics = evolveClubDynamics({ ...state, clubDynamics: dynamics }, table, random);
  return dynamics;
}
function contextualEvents(player: Player, contractSeasons: number, table: LeagueTable, club: Club, random: () => number, facts: { firstLoanWindow: boolean; title?: string; nationalCalled: boolean; goals: number; games: number }): CareerEvent[] {
  const row = table.entries.find((entry) => entry.clubId === club.id);
  const result: CareerEvent[] = [];
  const lowMinutes = facts.games < 20 && club.strength >= computeOvr(player) + 8;
  if (facts.firstLoanWindow && lowMinutes && random() < .18) result.push({ id:"emprestimo-inicial", context:"empréstimo", title:"Proposta de empréstimo", copy:"O clube entende que você precisa jogar mais para evoluir. Chegou uma proposta de empréstimo por uma temporada.", choices:[{label:"Aceitar o empréstimo e buscar minutos", form:2, fame:1},{label:"Ficar e disputar espaço", form:2, idolatry:1},{label:"Pedir para esperar mais seis meses", fame:-1}] });
  if ((player.benchAppearances ?? 0) > 12 && random() < .3) result.push({ id:"banco-contexto", context:"banco", title:"Conversa no banco", copy:"A sequência fora do time colocou seu futuro no centro da conversa.", choices:[{label:"Cobrar espaço do técnico", form:2, idolatry:-1},{label:"Treinar em silêncio", form:3},{label:"Pedir empréstimo", fame:1}] });
  if (contractSeasons <= 1) result.push({ id:"contrato-contexto", context:"contrato", title:"Contrato perto do fim", copy:"Seu vínculo termina ao fim da próxima temporada.", choices:[{label:"Pedir renovação", idolatry:2},{label:"Ouvir propostas", fame:2},{label:"Focar no campo", form:2}] });
  if (club.rivals.length && random() < .34) result.push({ id:"classico-contexto", context:"clássico", title:"Semana de clássico", copy:`A torcida do ${club.name} transforma o jogo contra um rival em assunto da cidade inteira.`, choices:[{label:"Prometer entrega total", fame:2, idolatry:3},{label:"Evitar provocações", form:2},{label:"Responder à torcida rival", fame:2, idolatry:-3}] });
  if (player.judasAt.length && random() < .28) result.push({ id:"rivalidade-contexto", context:"rivalidade", title:"O passado voltou", copy:"Sua história com um rival voltou a ser assunto antes de uma rodada importante.", choices:[{label:"Responder dentro de campo", form:3, idolatry:2},{label:"Dar entrevista respeitosa", fame:2},{label:"Provocar nas redes", fame:3, idolatry:-4}] });
  if ((player.form < 58 || (facts.games >= 14 && facts.goals === 0 && player.position === "ATA")) && random() < .55) result.push({ id:"sequencia-ruim", context:"fase ruim", title:"Pressão por resposta", copy:"A fase recente virou pauta diária. A torcida quer uma reação imediata.", choices:[{label:"Treinar depois do expediente", form:4, injuryWeeks:1},{label:"Pedir apoio ao elenco", idolatry:2, form:2},{label:"Ignorar o barulho", fame:-2, form:-1}] });
  if (facts.title) result.push({ id:"titulo-contexto", context:"campeão", title:"A festa do título", copy:`O ${club.name} conquistou ${facts.title}. A comemoração também é uma escolha de carreira.`, choices:[{label:"Celebrar com a torcida", fame:2, idolatry:5},{label:"Dividir o mérito com o elenco", idolatry:3, form:1},{label:"Pensar no próximo desafio", fame:1, form:2}] });
  if (facts.nationalCalled) result.push({ id:"convocacao-contexto", context:"seleção", title:"Chamado da seleção", copy:"A convocação colocou seu nome em evidência nacional.", choices:[{label:"Foco total na seleção", fame:3, form:1},{label:"Dividir o foco com o clube", idolatry:2, form:1},{label:"Falar sobre o sonho publicamente", fame:4, idolatry:-1}] });
  if (table.promotionPlaces > 0 && random() < .4) result.push({ id:"acesso-contexto", context:"acesso", title:"Decisão de acesso", copy:"A divisão permite o acesso e a temporada terá uma decisão decisiva para o clube.", choices:[{label:"Assumir a responsabilidade", form:3, idolatry:2},{label:"Blindar o elenco", form:2},{label:"Falar com a imprensa", fame:2}] });
  if (row && row.position > table.entries.length-table.relegationPlaces) result.push({ id:"queda-contexto", context:"rebaixamento", title:"Luta contra a queda", copy:"O clube entrou na zona de rebaixamento e precisa de reação.", choices:[{label:"Chamar o elenco", form:3, idolatry:2},{label:"Treinar além da conta", form:2, injuryWeeks:1},{label:"Evitar a pressão", fame:-1}] });
  return result.slice(0, 3);
}
function nationalOpponents(competitionId: string | undefined, nationality: string, season: number) {
  const pool = competitionId === "wc" ? worldCupParticipants(season)
    : competitionId === "copa-america" ? countries.filter((country) => SOUTH_AMERICAN_COUNTRY_CODES.includes(country.code))
      : competitionId === "euro" ? countries.filter((country) => EUROPEAN_COUNTRY_CODES.includes(country.code))
        : competitionId === "gold-cup" ? countries.filter((country) => NORTH_AND_CENTRAL_AMERICAN_COUNTRY_CODES.includes(country.code))
          : competitionId === "afcon" ? countries.filter((country) => AFRICAN_COUNTRY_CODES.includes(country.code))
            : competitionId === "asian-cup" ? countries.filter((country) => ASIAN_COUNTRY_CODES.includes(country.code))
              : competitionId === "ofc-nations" ? countries.filter((country) => OCEANIAN_COUNTRY_CODES.includes(country.code))
                : countries;
  return pool.filter((country) => country.name !== nationality);
}
function simulateFullNationalTeam(player: Player, season: number, ovr: number, random: () => number) {
  /* Base e Olimpíadas criam uma trajetória internacional antes da seleção principal. */
  const youth = player.age <= 20 && ovr >= 67;
  const olympic = player.age >= 18 && player.age <= 23 && ovr >= 74 && season % 4 === 0;
  if (ovr < 82 && !youth && !olympic) return undefined;
  const category: "senior" | "olympic" | "sub20" = ovr >= 82 ? "senior" : olympic ? "olympic" : "sub20";
  const competition = category === "sub20" ? "Copa do Mundo Sub-20" : category === "olympic" ? "Jogos Olímpicos" : selectionTournamentFor(player.nationality, season);
  const playableWorldCup = competition === "Copa do Mundo";
  const games = playableWorldCup ? 0 : competition ? 3 + Math.floor(random()*5) : 2 + Math.floor(random()*4);
  const attacking = player.position === "ATA" ? .42 : player.position === "MEI" ? .25 : .04;
  const goals = Math.max(0, Math.round(games * attacking * (ovr/88) * random()));
  const assists = player.position === "MEI" ? Math.max(0, Math.round(games*.28*random())) : player.position === "ATA" ? Math.max(0, Math.round(games*.12*random())) : 0;
  const competitionId = competitions.find((entry) => entry.name === competition)?.id;
  const finalChance = competition ? Math.min(.46, .04 + (ovr-78)*.018 + player.form/520) : 0;
  const reachedFinal = Boolean(competition && !playableWorldCup && random() < finalChance);
  const opponents = nationalOpponents(competitionId, player.nationality, season);
  const opponent = opponents[Math.floor(random() * Math.max(1, opponents.length))] ?? countries[0];
  return { competitionId, competition: competition ?? "Eliminatórias", category, phase: reachedFinal ? "Final" : playableWorldCup ? "Fase de grupos" : competition ? (random()>.5 ? "Mata-mata" : "Fase de grupos") : "Eliminatórias", games, goals, assists, qualified:true, title: undefined, reachedFinal, opponentName: opponent.name, opponentId: `national-${opponent.code}` };
}
function clubKey(name: string) { const key=name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); return ({"sporting cp":"sporting","psg":"paris saint-germain","inter":"internazionale","inter milan":"internazionale","bayern munich":"bayern munchen"} as Record<string,string>)[key] ?? key; }
const SOUTH_AMERICA = new Set(["Brasil","Argentina","Chile","Colômbia","Uruguai","Paraguai","Peru","Bolívia","Equador","Venezuela"]);
const ELITE_SPECIAL = new Set(["barcelona","real madrid","atletico de madrid","bayern munchen","borussia dortmund","rb leipzig","bayer leverkusen","ajax","psv","feyenoord","juventus","internazionale","milan","napoli","roma","atalanta","paris saint-germain","olympique de marseille","benfica","porto","sporting"]);
const MID_ELITE_LEAGUES = new Set(["esp-ll","ger-bl","ned-a","ita-sa"]);
function offerTier(club: Club, ovr: number, currentCountry: string, originCountry: string) {
  const name=clubKey(club.name), elite=club.leagueId==="eng-pl" || ELITE_SPECIAL.has(name);
  if (ovr >= 85) return elite ? "elite" : "none";
  if (ovr >= 80) {
    if (club.leagueId==="sau-pro" || ["jpn-j1","aus-al"].includes(club.leagueId) || MID_ELITE_LEAGUES.has(club.leagueId) || ["gre-a","sui-a","aut-a","den-a","nor-a","pol-a","cro-a","sco-a","bel-a","tur-a"].includes(club.leagueId)) return "mid";
    return "none";
  }
  const lowCountry=club.country===currentCountry || club.country===originCountry || SOUTH_AMERICA.has(club.country);
  const lowLeague=["mex-liga","usa-mls","eng-l1"].includes(club.leagueId) || (club.leagueId==="por-pl" && !ELITE_SPECIAL.has(name)) || (club.leagueId==="fra-l1" && !ELITE_SPECIAL.has(name));
  return lowCountry || lowLeague ? "low" : "none";
}
function proposalSalary(club: Club, ovr: number, random: () => number) {
  // O REI: remuneração mensal gradual, em função do atleta e do orçamento.
  const ability = Math.max(0, Math.min(40, ovr - 55));
  const monthly = (15_000 + club.budget * 850 + ability * ability * 480) * (.9 + random() * .2) * (club.leagueId === "sau-pro" ? 1.35 : 1);
  return Math.max(10_000, Math.round(monthly / 1000) * 1000);
}
function proposalRole(ovr: number, club: Club): ContractOffer["role"] {
  return ovr>=club.strength+7?"estrela":ovr>=club.strength?"titular":ovr>=club.strength-6?"rotacao":"promessa";
}
function expectedMinutes(role: ContractRole) { return role === "estrela" ? 86 : role === "titular" ? 72 : role === "rotacao" ? 48 : 28; }
function weightedPick(pool: Club[], current: Club, random: () => number) {
  const total=pool.reduce((sum,club)=>sum+1+club.reputation/18+(current.rivals.includes(club.id)?4:0),0);
  let roll=random()*total;
  for(const club of pool){ roll-=1+club.reputation/18+(current.rivals.includes(club.id)?4:0); if(roll<=0)return club; }
  return pool[pool.length-1];
}
export function createMarketWindow(state: CareerState, random: () => number): MarketWindow {
  const player=state.player, ovr=Math.max(computeOvr(player), state.highestOvr ?? 0), current=clubs.find((club)=>club.id===player.clubId)??clubs[0];
  const currentCountry=current.country, originCountry=state.originCountry??current.country;
  const pool=clubs.filter((club)=>club.id!==current.id&&offerTier(club,ovr,currentCountry,originCountry)!=="none");
  const remaining=[...pool], offers:ContractOffer[]=[];
  const agentBonus = state.shop?.ownedPermanent.includes("empresario") ? 1.15 : 1;
  const academyBonus = state.shop?.ownedPermanent.includes("academia") ? 1.2 : 1;
  while(offers.length<4&&remaining.length){ const club=weightedPick(remaining,current,random); const index=remaining.findIndex((entry)=>entry.id===club.id); remaining.splice(index,1); const salary=Math.max(Math.round(state.contract.monthlySalary * 1.05 / 100) * 100, Math.round(proposalSalary(club,ovr,random)*agentBonus*academyBonus/100)*100); const role=proposalRole(ovr,club); offers.push({clubId:club.id,monthlySalary:salary,seasons:2+Math.floor(random()*4),role,expectedMinutes:expectedMinutes(role),idolatryChange:current.rivals.includes(club.id)?-18:-Math.max(2,Math.round((player.clubIdolatry[current.id]??0)/16))}); }
  // O catálogo pode não conter quatro opções em uma faixa inicial rara; completa com clubes do país atual.
  const fallback=clubs.filter((club)=>club.id!==current.id&&!offers.some((offer)=>offer.clubId===club.id)&&offerTier(club,ovr,currentCountry,originCountry)!=="none");
  while(offers.length<4&&fallback.length){const club=weightedPick(fallback,current,random);fallback.splice(fallback.findIndex((entry)=>entry.id===club.id),1);const role=proposalRole(ovr,club);offers.push({clubId:club.id,monthlySalary:Math.max(Math.round(state.contract.monthlySalary*1.05/100)*100,Math.round(proposalSalary(club,ovr,random)*agentBonus*academyBonus/100)*100),seasons:2+Math.floor(random()*4),role,expectedMinutes:expectedMinutes(role),idolatryChange:current.rivals.includes(club.id)?-18:-4});}
  const highest=Math.max(state.highestOvr??ovr,ovr), declining=ovr<highest-2||player.age>=33;
  const renewalFactor=declining ? .85 + random() * .15:1.1+random()*.15;
  const renewalRole=proposalRole(ovr,current);
  return {season:state.season,offers,renewal:{clubId:current.id,monthlySalary:Math.round(state.contract.monthlySalary*renewalFactor/10_000)*10_000,seasons:3,role:renewalRole,expectedMinutes:expectedMinutes(renewalRole),idolatryChange:3}};
}
function createGenerationalMarketWindow(state: CareerState, random: () => number): MarketWindow {
  const current = clubs.find((club) => club.id === state.player.clubId) ?? clubs[0];
  const ovr = computeOvr(state.player);
  const offers = clubs.filter((club) => club.country === "Brasil" && club.id !== current.id)
    .sort((a,b) => b.reputation + b.strength - (a.reputation + a.strength)).slice(0, 5)
    .map((club) => { const role = proposalRole(ovr + 3, club); return { clubId:club.id, monthlySalary:proposalSalary(club,ovr + 3,random), seasons:3+Math.floor(random()*2), role, expectedMinutes:expectedMinutes(role), idolatryChange:-Math.max(2,Math.round((state.player.clubIdolatry[current.id]??0)/16)) }; });
  const role=proposalRole(ovr,current);
  return { season:state.season, offers, renewal:{clubId:current.id,monthlySalary:Math.round(state.contract.monthlySalary*1.2/10_000)*10_000,seasons:3,role,expectedMinutes:expectedMinutes(role),idolatryChange:4} };
}
export function applyFinalConsequence(state: CareerState, final: CupFinal, won: boolean): CareerState {
  const pending = state.pendingDivisionSettlement;
  const outcome: PlayerDivisionOutcome = final.stakes === "relegation" ? (won ? "stayed" : "relegated") : won ? "promoted" : "stayed";
  if (pending) {
    const settled = settleCountryDivisions(state, state.leagueTables, pending.country, pending.playerClubId, outcome);
    const clubStrengthAdjustments = applyMovementDynamics(state, settled.movements);
    const targetLeague = settled.assignments[state.player.clubId] ?? pending.playerLeagueId;
    return { ...state, leagueAssignments: settled.assignments, clubStrengthAdjustments, pendingDivisionSettlement: undefined,
      currentCompetition: competitions.find((entry) => entry.id === targetLeague)?.name ?? state.currentCompetition };
  }
  if ((!won && final.stakes !== "relegation") || !final.targetLeagueId) return state;
  const targetLeague = final.stakes === "relegation" && won ? undefined : final.targetLeagueId;
  if (!targetLeague) return state;
  const from = state.leagueAssignments[state.player.clubId] ?? clubs.find((club) => club.id === state.player.clubId)?.leagueId ?? targetLeague;
  const movements = [{ clubId: state.player.clubId, from, to: targetLeague }];
  return { ...state, currentCompetition: competitions.find((entry) => entry.id === targetLeague)?.name ?? state.currentCompetition,
    leagueAssignments: { ...state.leagueAssignments, [state.player.clubId]: targetLeague }, clubStrengthAdjustments: applyMovementDynamics(state, movements) };
}
export function simulateSeason(state: CareerState): { state: CareerState; result: SeasonResult } {
  const random = mulberry32(state.seed + state.season * 7919);
  let player = { ...state.player, attributes: { ...state.player.attributes }, clubIdolatry: { ...state.player.clubIdolatry }, titles:[...state.player.titles], awards:[...state.player.awards] };
  state = rememberClubMilestones(state);
  const seasonStartAge = player.age;
  const assignments = { ...state.leagueAssignments };
  let activeContract = state.contract;
  /* A oferta é aceita agora, mas a transferência só inicia quando a próxima temporada começa. */
  if (state.pendingTransfer) {
    const offer = state.pendingTransfer;
    const previousClub = player.clubId;
    player.clubIdolatry[previousClub] = Math.max(0, (player.clubIdolatry[previousClub] ?? 0) + offer.idolatryChange);
    player.clubId = offer.clubId; player.salary = offer.monthlySalary;
    player.clubIdolatry[offer.clubId] = player.clubIdolatry[offer.clubId] ?? Math.max(3, 8 + offer.idolatryChange);
    if (clubs.find((club) => club.id === previousClub)?.rivals.includes(offer.clubId) && !player.judasAt.includes(previousClub)) player.judasAt.push(previousClub);
    activeContract = { clubId: offer.clubId, monthlySalary: offer.monthlySalary, seasonsRemaining: offer.seasons, role: offer.role, expectedMinutes: offer.expectedMinutes };
  }
  let loan = state.loan;
  if (loan && state.season >= loan.returnSeason) { player.clubId = loan.parentClubId; loan = undefined; }
  const baseClub = clubs.find((entry) => entry.id === player.clubId) ?? clubs[0];
  const leagueId = assignments[baseClub.id] ?? baseClub.leagueId;
  const club = { ...effectiveClub(state, baseClub), leagueId };
  const clubHistory: ClubCareerRecord[] = (state.clubHistory ?? []).map((entry) => ({...entry,titles:[...entry.titles]}));
  let clubRecord = clubHistory.find((entry) => entry.clubId === player.clubId); if (!clubRecord) { clubRecord={clubId:player.clubId,titles:[]}; clubHistory.push(clubRecord); }
  const ovr=computeOvr(player), generational=state.mode==="generational", agePerformance=agePerformanceMultiplier(player.age,player.attributes.fisico);
  const rolePower = { promessa:.42, rotacao:.58, titular:.78, estrela:.92 }[activeContract?.role ?? "promessa"];
  const permanent=state.shop?.ownedPermanent ?? [], seasonal=[...(state.shop?.activeSeasonal ?? []), ...permanent];
  const physicalBonus=(seasonal.includes("preparador")?4:0)+(seasonal.includes("suplementacao")?2:0)+(permanent.includes("mansao")?3:0);
  const seasonOvr=(ovr+physicalBonus)*agePerformance;
  const role=Math.max(.12,Math.min(.96,(seasonOvr-club.strength+18+(generational ? 5 : 0))/30*rolePower));
  const games=Math.max(4,Math.min(48,Math.round(7+role*39+random()*6-player.injuries*.65)));
  const benchAppearances=Math.max(0,Math.round(25-games*.45+(1-role)*10));
  const attacking=player.position==="ATA"?(player.attributes.finalizacao+player.attributes.cabecada+player.attributes.velocidade+player.attributes.forca)/400:player.position==="MEI"?(player.attributes.finalizacao+player.attributes.drible+player.attributes.velocidade)/300:0;
  const creative=player.position==="MEI"?(player.attributes.passe+player.attributes.drible+player.attributes.velocidade)/300:0;
  const defensive=player.position==="GOL"?(player.attributes.reflexo+player.attributes.elasticidade+player.attributes.posicionamento+player.attributes.saida)/400:0;
  const eliteStrikerBonus = player.position === "ATA" ? Math.max(0, ovr - 86) * .045 : 0;
  const goals=["ATA","MEI"].includes(player.position)?Math.max(0,Math.round(games*attacking*(seasonal.includes("chuteiras")?1.08:1)*(player.position === "ATA" ? .16 + random() * .24 + eliteStrikerBonus : .18 + random()*.28))):0;
  const assists=player.position==="MEI"?Math.max(0,Math.round(games*creative*(seasonal.includes("analista")?1.1:1)*(.18+random()*.25))):player.position==="ATA"?Math.max(0,Math.round(games*(.06+random()*.14)*(player.attributes.velocidade+player.attributes.finalizacao)/180)):0;
  const cleanSheets=player.position==="GOL"?Math.max(0,Math.round(games*defensive*.45*(seasonal.includes("chuteiras")?1.08:1)*(seasonal.includes("analista")?1.1:1))):0;
  const injuryRisk=Math.max(.035,.2-(player.attributes.fisico+physicalBonus)/700)*(seasonal.includes("fisio") ? .65 : 1);
  const injuryWeeks=random()<injuryRisk?Math.round(1+random()*7):0;
  const leagueOpponents = clubs.filter((entry) => (assignments[entry.id] ?? entry.leagueId) === leagueId && entry.id !== player.clubId);
  const averageOpponentStrength = leagueOpponents.length ? leagueOpponents.reduce((sum, entry) => sum + effectiveClub(state, entry).strength, 0) / leagueOpponents.length : club.strength;
  const analystBoost = seasonal.includes("analista") ? Math.max(0, averageOpponentStrength - club.strength) * .65 : 0;
  // Todas as pirâmides são simuladas antes de qualquer clube trocar de divisão.
  // Isso impede que uma promoção altere a tabela da divisão vizinha no mesmo ano.
  const seasonState = { ...state, leagueAssignments: assignments };
  const allTables: Record<string, LeagueTable> = {};
  for (const rule of Object.values(COUNTRY_COMPETITION_RULES)) {
    if (rule.divisions.length < 2) continue;
    for (const divisionId of rule.divisions) {
      allTables[divisionId] = buildLeagueTable(seasonState, divisionId, divisionId === leagueId ? player.clubId : "", divisionId === leagueId ? (seasonOvr-club.strength)*.7+player.form/12+analystBoost : 0, random);
    }
  }
  // Ligas sem pirâmide continuam com tabela anual, mas sem movimento de divisão.
  if (!allTables[leagueId]) allTables[leagueId] = buildLeagueTable(seasonState, leagueId, player.clubId, (seasonOvr-club.strength)*.7+player.form/12+analystBoost, random);
  const table=allTables[leagueId];
  const row=table.entries.find((entry)=>entry.clubId===player.clubId) ?? table.entries[0];
  const league=competitions.find((entry)=>entry.id===leagueId);
  const countryRule = competitionRuleFor(club.country);
  const isTopDivision = countryRule?.topLeague === leagueId;
  const playoffRange = table.promotionPlayoff;
  const directPromotionPlaces = playoffRange ? playoffRange.from - 1 : table.promotionPlaces;
  const inPromotionZone = directPromotionPlaces > 0 && row.position <= directPromotionPlaces;
  const inPromotionPlayoff = Boolean(playoffRange && row.position >= playoffRange.from && row.position <= playoffRange.to);
  const inRelegationZone = table.relegationPlaces > 0 && row.position > table.entries.length - table.relegationPlaces;
  /*
   * O REI keeps the league table as the source of the champion and direct
   * promotion. The player never changes division as a side effect of the table:
   * a first-division relegation is held for a one-off survival decision. This
   * is our documented version of the public "final de permanência" behavior.
   */
  const promotion = inPromotionZone ? leagueTarget(seasonState, leagueId, "up") : undefined;
  const relegation = receivesSurvivalDecision(club, isTopDivision, inRelegationZone, isTopDivision && inRelegationZone && !protectedFromRelegation(club) ? random() : 1) ? leagueTarget(seasonState, leagueId, "down") : undefined;
  const playerNeedsDivisionDecision = Boolean(relegation || inPromotionPlayoff);
  const playerDivisionOutcome: PlayerDivisionOutcome = promotion ? "promoted" : "stayed";
  const leagueTitle=row.position===1 ? league?.name : undefined;
  let settledAssignments = { ...assignments };
  let automaticMovements: DivisionMovement[] = [];
  const playerCountry = club.country;
  for (const country of Object.keys(COUNTRY_COMPETITION_RULES)) {
    if (country === playerCountry && playerNeedsDivisionDecision) continue;
    const settled = country === playerCountry
      ? settleCountryDivisions(seasonState, allTables, country, player.clubId, playerDivisionOutcome)
      : settleCountryDivisions(seasonState, allTables, country, undefined);
    // Each country's result contains the original assignments for every other
    // country. Only merge actual movements, or later countries undo earlier ones.
    for (const movement of settled.movements) settledAssignments[movement.clubId] = movement.to;
    automaticMovements = [...automaticMovements, ...settled.movements];
  }
  const pendingDivisionSettlement = playerNeedsDivisionDecision ? { country: playerCountry, playerClubId: player.clubId, playerLeagueId: leagueId } : undefined;
  const generatedCampaigns = buildCampaigns(state, club, seasonOvr, player.form, random);
  const national=simulateFullNationalTeam(player,state.season,ovr,random);
  const worldCupCampaign = national?.competitionId === "wc" ? buildWorldCupCampaign(state, player, random) : { campaign: undefined, finals: [] as CupFinal[] };
  if (worldCupCampaign.campaign) generatedCampaigns.campaigns.push(worldCupCampaign.campaign);
  const promotionTarget = inPromotionPlayoff ? leagueTarget(seasonState, leagueId, "up") : undefined;
  const divisionFinal: CupFinal | undefined = relegation
      ? { competitionId: leagueId, competitionName: "Jogo da Permanência", opponentClubId: "decisao", opponentClubName: "Rival direto", stakes: "relegation", targetLeagueId: relegation, phase: "access", scope: "club", decisionId: `${state.season}:${leagueId}:permanencia` }
      : promotionTarget
        ? { competitionId: leagueId, competitionName: "Playoff de Acesso", opponentClubId: "decisao-acesso", opponentClubName: "Rival do playoff", stakes: "promotion", targetLeagueId: promotionTarget, phase: "access", scope: "club", decisionId: `${state.season}:${leagueId}:playoff-acesso` }
        : undefined;
  const cupFinal: CupFinal | undefined = divisionFinal
      ? divisionFinal
    : worldCupCampaign.finals[0]
      ? worldCupCampaign.finals[0]
      : national?.reachedFinal && national.competitionId
      ? { competitionId: national.competitionId, competitionName: national.competition, opponentClubId: national.opponentId, opponentClubName: national.opponentName, stakes: "cup", phase: "title", scope: "national" }
      : generatedCampaigns.finals[0];
  const contract=activeContract ?? {clubId:player.clubId,monthlySalary:16_700,seasonsRemaining:3,role:"promessa" as const,expectedMinutes:30};
  const monthlySalary=contract.monthlySalary*1;
  const prize=(leagueTitle?league?.prestige??0:0)*50_000;
  const balance=(state.balance??0)+monthlySalary*12+prize;
  player.games+=games; player.goals+=goals; player.assists+=assists; player.cleanSheets+=cleanSheets; player.saves+=player.position==="GOL"?Math.round(games*(2.4+random()*1.6)):0; player.benchAppearances=(player.benchAppearances??0)+benchAppearances;
  player.nationalTeamGames=(player.nationalTeamGames??0)+(national?.games??0); player.nationalTeamGoals=(player.nationalTeamGoals??0)+(national?.goals??0); player.nationalTeamAssists=(player.nationalTeamAssists??0)+(national?.assists??0);
  player.injuries=injuryWeeks; player.age+=1; player.form=clamp((52+random()*42)*agePerformance-injuryWeeks*2+(seasonal.includes("chef")?5:0)+(permanent.includes("psicologo")?6:0)+(seasonal.includes("familia")?4:0)+(seasonal.includes("ferias")?5:0)+(permanent.includes("casa")?2:0)); player.marketValue=Math.max(50_000,Math.round(player.marketValue*(1+(seasonOvr-62)/380)));
  player.clubIdolatry[player.clubId]=clamp((player.clubIdolatry[player.clubId]??25)+games/12+(leagueTitle?9:0)+goals/9+(permanent.includes("bairro")?1:0));
  if(leagueTitle){player.titles.push(leagueTitle);clubRecord.titles.push(leagueTitle);}
  const award=goals>=24?"Chuteira de Ouro":player.position==="GOL"&&cleanSheets>=16?"Melhor Goleiro da Liga":goals>=18?"Artilheiro da temporada":undefined; if(award) player.awards.push(award);
  const seasonEvents=selectCareerEvents(state,player,random);
  const nextContract={...contract,seasonsRemaining:Math.max(0,contract.seasonsRemaining-1)};
  const highestOvr=Math.max(state.highestOvr ?? ovr,ovr);
  // Depois de quatro temporadas completas, abre a cada três anos: 5ª, 8ª, 11ª...
  const opensMarket=nextContract.seasonsRemaining <= 1 || (state.history.length >= 2 && state.history.length % 3 === 0);
  const generationalBreakthrough=generational && state.history.length===1 && player.age===18 && (goals+assists>=8||ovr>=70);
  const marketState={ ...state, player, contract: nextContract, highestOvr, originCountry: state.originCountry ?? club.country };
  const marketWindow=generationalBreakthrough ? createGenerationalMarketWindow(marketState,random) : opensMarket ? createMarketWindow(marketState,random) : undefined;
  const nationalTeam={games:(state.nationalTeam?.games??0)+(national?.games??0),goals:(state.nationalTeam?.goals??0)+(national?.goals??0),assists:(state.nationalTeam?.assists??0)+(national?.assists??0),titles:[...(state.nationalTeam?.titles??[])]};
  const rating=Number((5.4 + player.form / 100 * 2.3 + Math.min(1.5,(goals+assists)/Math.max(1,games)*2)).toFixed(1));
  const automaticEvolution = applyAutomaticSeasonEvolution({ ...player, age: seasonStartAge }, state.mode, state.season, state.seed + state.season * 193);
  player = { ...automaticEvolution.player, age: seasonStartAge + 1 };
  const evolution = automaticEvolution.evolution;
  // Todas as decisões legitimamente alcançadas entram no calendário.
  const longCampaigns = generatedCampaigns.finals.filter((final) => final.stakes === "campaign");
  const normalFinals = generatedCampaigns.finals.filter((final) => final.stakes !== "campaign");
  // Calendário: supercopa/estadual/copa antes de campanhas internacionais.
  const allCampaignFinals = [...normalFinals, ...worldCupCampaign.finals, ...longCampaigns];
  const campaignFinals = divisionFinal ? [divisionFinal, ...allCampaignFinals] : worldCupCampaign.finals[0] ? allCampaignFinals : national?.reachedFinal && national.competitionId ? [cupFinal!, ...allCampaignFinals] : allCampaignFinals;
  const calendar=[{competition:league?.name??"Liga",phase:`${row.position}º lugar`},...generatedCampaigns.campaigns.map((campaign)=>({competition:campaign.competitionName,phase:campaign.phase,opponent:campaign.matches.at(-1)?.opponentName})),...(national?[{competition:national.competition,phase:national.phase}]:[])];
  const result:SeasonResult={season:state.season,games,goals,assists,cleanSheets,title:leagueTitle,award,injuryWeeks,event:seasonEvents[0],events:seasonEvents,cupFinal:campaignFinals[0],nationalTeamCompetition:national?.competition,nationalTeamTitle:undefined,nationalTeamCampaign:national,leaguePosition:row.position,leaguePoints:row.points,benchAppearances,finalOpportunity:campaignFinals.length>0,leagueId,leagueName:league?.name,clubId:player.clubId,division:league?.tier,contractRole:contract.role,contractMonthlySalary:contract.monthlySalary,rating,annualEarnings:monthlySalary*12+prize,titles:[leagueTitle].filter((value): value is string => Boolean(value)),access:settledAssignments[player.clubId] !== leagueId && (competitions.find(c=>c.id===settledAssignments[player.clubId])?.tier ?? 1) < (league?.tier ?? 1) ? "promoted" : undefined,relegated:settledAssignments[player.clubId] !== leagueId && (competitions.find(c=>c.id===settledAssignments[player.clubId])?.tier ?? 1) > (league?.tier ?? 1),phaseReached:cupFinal ? "Final" : national?.phase,opponentName:campaignFinals[0]?.opponentClubName,calendar,campaigns:generatedCampaigns.campaigns,finals:campaignFinals,evolution};
  const campaignQualifications={...(state.campaignQualifications??{}),[player.clubId]:nextSeasonQualifications(leagueId,row.position,table.entries.length)};
  const competitionWinners={...(state.competitionWinners??{})};
  const clubHonors={...(state.clubHonors??{})};
  // Campeões de ligas principais vêm da tabela, mesmo quando não são o clube do jogador.
  for (const [divisionId, divisionTable] of Object.entries(allTables)) {
    const division = competitions.find((entry) => entry.id === divisionId);
    if (!division || competitionRuleFor(division.country)?.topLeague !== divisionId) continue;
    const winner = divisionTable.entries[0]; if (!winner) continue;
    const previous = competitionWinners[divisionId] ?? [];
    if (!previous.some((entry) => entry.clubId === winner.clubId && entry.season === state.season)) competitionWinners[divisionId] = [...previous, { clubId: winner.clubId, season: state.season }].slice(-8);
  }
  if (leagueTitle) {
    const previousWinners = competitionWinners[leagueId] ?? [];
    if (!previousWinners.some((winner) => winner.clubId === player.clubId && winner.season === state.season)) {
      competitionWinners[leagueId] = [...previousWinners, { clubId: player.clubId, season: state.season }].slice(-8);
    }
    clubHonors[player.clubId] = [...(clubHonors[player.clubId] ?? []), leagueTitle];
  }
  const clubStrengthAdjustments = applyMovementDynamics(state, automaticMovements);
  return {state:{...state,season:state.season+1,player,clubHistory,history:[...state.history,result],financialLedger:[...(state.financialLedger??[]),{season:state.season,label:"Salários e premiações",amount:monthlySalary*12+prize}],currentCompetition:competitions.find((entry)=>entry.id===(settledAssignments[player.clubId]??leagueId))?.name??league?.name??state.currentCompetition,balance,contract:nextContract,loan,leagueAssignments:settledAssignments,leagueTables:{...state.leagueTables,...allTables},shop:{ownedPermanent:[...(state.shop?.ownedPermanent??[])],activeSeasonal:(state.shop.activeSeasonal??[]).filter(id=>id==="imprensa"||(state.shop.expires?.[id]??0)>state.season+1),expires:state.shop.expires,freeUses:[]},nationalTeam,originCountry:state.originCountry ?? club.country,highestOvr,marketWindow,recentEventIds:[...(state.recentEventIds??[]),...seasonEvents.map((event)=>event.id)].slice(-10),clubDynamics:evolveAllClubDynamics(state,allTables,random),clubStrengthAdjustments,pendingDivisionSettlement,pendingTransfer:undefined,campaignQualifications,competitionWinners,clubHonors,pendingEvolution:undefined},result};
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

/** A idade de aposentadoria é definida somente pelo físico, com teto absoluto de 42. */
export function retirementAge(physical: number) {
  if (physical >= 90) return 42;
  if (physical >= 85) return 40;
  return 38;
}

export function estimateSeasonsUntilRetirement(player: Pick<Player, "age" | "attributes">) {
  return Math.max(0, retirementAge(player.attributes.fisico) - player.age);
}

export function shouldRetire(player: Player, _seed: number) {
  return player.age >= retirementAge(player.attributes.fisico);
}

export function baseAttributes(): Attributes { return { reflexo: 55, elasticidade: 55, posicionamento: 56, saida: 53, lideranca: 50, fisico: 56, velocidade: 58, passe: 56, finalizacao: 55, drible: 56, cabecada: 54, forca: 56 }; }
