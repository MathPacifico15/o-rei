import { clubs, competitions } from "./catalog";
import { countries } from "./countries";
import type { AttributeKey, Attributes, CareerEvent, CareerState, Club, ClubCareerRecord, ContractOffer, CupFinal, LeagueTable, MarketWindow, Player, Position, RandomCareerStart, SeasonResult, UpgradeCard } from "./types";

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
  { id: "gol-saida", rarity: "epico", name: "Dono da Área", changes: { saida: 2, posicionamento: 2, fisico: 1 }, eligible: ["GOL"] },
  { id: "gol-muralha", rarity: "lendario", name: "Muralha", changes: { reflexo: 3, elasticidade: 2, saida: 2, lideranca: 1 }, eligible: ["GOL"] },
  { id: "mei-passe", rarity: "raro", name: "Passe Cirúrgico", changes: { passe: 2, drible: 1 }, eligible: ["MEI"] },
  { id: "mei-criacao", rarity: "epico", name: "Maestro em Campo", changes: { passe: 2, velocidade: 1, finalizacao: 1, lideranca: 1 }, eligible: ["MEI"] },
  { id: "mei-camisa10", rarity: "lendario", name: "Camisa 10", changes: { passe: 3, drible: 2, finalizacao: 2, lideranca: 1 }, eligible: ["MEI"] },
  { id: "ata-finalizacao", rarity: "raro", name: "Matador", changes: { finalizacao: 2, velocidade: 1 }, eligible: ["ATA"] },
  { id: "ata-cabeca", rarity: "epico", name: "Dono do Alto", changes: { cabecada: 2, forca: 1, fisico: 1 }, eligible: ["ATA"] },
  { id: "ata-camisa9", rarity: "lendario", name: "Camisa 9", changes: { finalizacao: 3, cabecada: 2, velocidade: 1, forca: 1 }, eligible: ["ATA"] },
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
  if (position === "ATA" && cupFinal) selected.push(createAttackerFinalEvent(random));
  if (position === "MEI" && cupFinal) selected.push(createMidfieldFinalEvent(random));
  
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
  if (season % 4 === 2) return "Copa do Mundo";
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

function cupEligible(club: Club, competitionId: string) {
  const domestic = competitions.find((entry) => entry.id === competitionId);
  if (!domestic) return false;
  // Each Brazilian club has at most one state championship in its catalogue
  // membership. The state title is seasonal, never a separate starting league.
  if (domestic.kind === "state") return club.competitionIds?.includes(competitionId) === true;
  if (competitionId === "copa-verde") return club.competitionIds?.some((id) => COPA_VERDE_STATE_IDS.includes(id)) === true;
  if (competitionId === "lib" || competitionId === "sula") return SOUTH_AMERICAN_COUNTRIES.includes(club.country);
  if (competitionId === "recopa-sudamericana") return SOUTH_AMERICAN_COUNTRIES.includes(club.country) && club.strength >= 67;
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

function currentLeagueId(state: CareerState, club: Club) {
  return state.leagueAssignments?.[club.id] ?? club.leagueId;
}
function countryDivisions(country: string) {
  return competitions.filter((competition) => competition.kind === "league" && competition.country === country)
    .sort((a, b) => a.tier - b.tier);
}
function movementPlaces(competitionId: string) {
  if (competitionId.startsWith("bra-")) return 4;
  if (competitionId.startsWith("eng-")) return 3;
  return 2;
}
function buildLeagueTable(state: CareerState, leagueId: string, playerClubId: string, playerBoost: number, random: () => number): LeagueTable {
  const competition = competitions.find((entry) => entry.id === leagueId) ?? competitions[0];
  const entries: LeagueTableEntry[] = clubs.filter((club) => currentLeagueId(state, club) === leagueId).map((club) => {
    const played = Math.max(16, Math.min(38, (clubs.filter((candidate) => currentLeagueId(state, candidate) === leagueId).length - 1) * 2));
    const boost = club.id === playerClubId ? playerBoost : 0;
    const quality = Math.max(25, club.strength + boost + random() * 18 - 8);
    const points = Math.round(played * (0.24 + quality / 170));
    const wins = Math.min(played, Math.max(0, Math.round(points / 3)));
    const draws = Math.max(0, Math.min(played - wins, points - wins * 3));
    const losses = Math.max(0, played - wins - draws);
    const goalsFor = Math.max(8, Math.round(played * (.65 + quality / 105)));
    const goalsAgainst = Math.max(5, Math.round(played * (1.75 - quality / 120)));
    return { clubId: club.id, played, wins, draws, losses, goalsFor, goalsAgainst, points, position: 0 };
  }).sort((a,b) => b.points-a.points || (b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst) || b.goalsFor-a.goalsFor)
    .map((entry,index) => ({ ...entry, position:index+1 }));
  const divisions = countryDivisions(competition.country);
  const index = divisions.findIndex((entry) => entry.id === leagueId);
  return { competitionId: leagueId, season: state.season, entries, promotionPlaces: index > 0 ? movementPlaces(leagueId) : 0, relegationPlaces: index >= 0 && index < divisions.length-1 ? movementPlaces(leagueId) : 0 };
}
function leagueTarget(state: CareerState, leagueId: string, direction: "up" | "down") {
  const competition = competitions.find((entry) => entry.id === leagueId);
  if (!competition) return undefined;
  const divisions = countryDivisions(competition.country);
  const index = divisions.findIndex((entry) => entry.id === leagueId);
  return divisions[index + (direction === "up" ? -1 : 1)]?.id;
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
  if (row && row.position <= table.promotionPlaces) result.push({ id:"acesso-contexto", context:"acesso", title:"Acesso ao alcance", copy:"Seu clube está na zona de acesso. A pressão aumentou.", choices:[{label:"Assumir a responsabilidade", form:3, idolatry:2},{label:"Blindar o elenco", form:2},{label:"Falar com a imprensa", fame:2}] });
  if (row && row.position > table.entries.length-table.relegationPlaces) result.push({ id:"queda-contexto", context:"rebaixamento", title:"Luta contra a queda", copy:"O clube entrou na zona de rebaixamento e precisa de reação.", choices:[{label:"Chamar o elenco", form:3, idolatry:2},{label:"Treinar além da conta", form:2, injuryWeeks:1},{label:"Evitar a pressão", fame:-1}] });
  return result.slice(0, 3);
}
function simulateFullNationalTeam(player: Player, season: number, ovr: number, random: () => number) {
  if (ovr < 78 || random() > Math.min(.88, .14 + (ovr-76)*.07 + player.form/250)) return undefined;
  const competition = selectionTournamentFor(player.nationality, season);
  const games = competition ? 3 + Math.floor(random()*5) : 2 + Math.floor(random()*4);
  const attacking = player.position === "ATA" ? .42 : player.position === "MEI" ? .25 : .04;
  const goals = Math.max(0, Math.round(games * attacking * (ovr/88) * random()));
  const assists = player.position === "MEI" ? Math.max(0, Math.round(games*.28*random())) : 0;
  const title = competition && random() < Math.min(.46, .04 + (ovr-78)*.018 + player.form/520) ? competition : undefined;
  return { competition: competition ?? "Eliminatórias", phase: title ? "Campeão" : competition ? (random()>.5 ? "Mata-mata" : "Fase de grupos") : "Eliminatórias", games, goals, assists, qualified:true, title };
}
function clubKey(name: string) { return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
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
  const arab=club.leagueId==="sau-pro";
  let monthly=90_000+club.budget*5_000+Math.max(0,ovr-60)*8_000+Math.round(random()*90_000);
  if (arab) monthly*=2.2;
  if (ovr>=87) monthly=Math.max(monthly,1_000_000+club.budget*8_000+Math.round(random()*500_000));
  if (arab && ovr>=80) monthly=Math.max(monthly,1_050_000+club.budget*7_000+Math.round(random()*400_000));
  return Math.round(monthly/10_000)*10_000;
}
function proposalRole(ovr: number, club: Club): ContractOffer["role"] {
  return ovr>=club.strength+7?"estrela":ovr>=club.strength?"titular":ovr>=club.strength-6?"rotacao":"promessa";
}
function weightedPick(pool: Club[], current: Club, random: () => number) {
  const total=pool.reduce((sum,club)=>sum+1+club.reputation/18+(current.rivals.includes(club.id)?4:0),0);
  let roll=random()*total;
  for(const club of pool){ roll-=1+club.reputation/18+(current.rivals.includes(club.id)?4:0); if(roll<=0)return club; }
  return pool[pool.length-1];
}
export function createMarketWindow(state: CareerState, random: () => number): MarketWindow {
  const player=state.player, ovr=computeOvr(player), current=clubs.find((club)=>club.id===player.clubId)??clubs[0];
  const currentCountry=current.country, originCountry=state.originCountry??current.country;
  const pool=clubs.filter((club)=>club.id!==current.id&&offerTier(club,ovr,currentCountry,originCountry)!=="none");
  const remaining=[...pool], offers:ContractOffer[]=[];
  while(offers.length<4&&remaining.length){ const club=weightedPick(remaining,current,random); const index=remaining.findIndex((entry)=>entry.id===club.id); remaining.splice(index,1); const salary=proposalSalary(club,ovr,random); offers.push({clubId:club.id,monthlySalary:salary,seasons:2+Math.floor(random()*4),role:proposalRole(ovr,club),idolatryChange:current.rivals.includes(club.id)?-18:-Math.max(2,Math.round((player.clubIdolatry[current.id]??0)/16))}); }
  // O catálogo pode não conter quatro opções em uma faixa inicial rara; completa com clubes do país atual.
  const fallback=clubs.filter((club)=>club.id!==current.id&&!offers.some((offer)=>offer.clubId===club.id)&&club.country===current.country);
  while(offers.length<4&&fallback.length){const club=weightedPick(fallback,current,random);fallback.splice(fallback.findIndex((entry)=>entry.id===club.id),1);offers.push({clubId:club.id,monthlySalary:proposalSalary(club,ovr,random),seasons:2+Math.floor(random()*4),role:proposalRole(ovr,club),idolatryChange:current.rivals.includes(club.id)?-18:-4});}
  const highest=Math.max(state.highestOvr??ovr,ovr), declining=ovr<highest-2||player.age>=33;
  const renewalFactor=declining ? .85 + random() * .15:1.1+random()*.15;
  return {season:state.season,offers,renewal:{clubId:current.id,monthlySalary:Math.round(state.contract.monthlySalary*renewalFactor/10_000)*10_000,seasons:3,role:proposalRole(ovr,current),idolatryChange:3}};
}
export function applyFinalConsequence(state: CareerState, final: CupFinal, won: boolean): CareerState {
  if (!won || !final.targetLeagueId) return state;
  const player = { ...state.player };
  return { ...state, player, currentCompetition: competitions.find((entry) => entry.id === final.targetLeagueId)?.name ?? state.currentCompetition,
    leagueAssignments: { ...state.leagueAssignments, [player.clubId]: final.targetLeagueId } };
}
export function simulateSeason(state: CareerState): { state: CareerState; result: SeasonResult } {
  const random = mulberry32(state.seed + state.season * 7919);
  const player = { ...state.player, attributes: { ...state.player.attributes }, clubIdolatry: { ...state.player.clubIdolatry }, titles:[...state.player.titles], awards:[...state.player.awards] };
  const assignments = { ...state.leagueAssignments };
  let loan = state.loan;
  if (loan && state.season >= loan.returnSeason) { player.clubId = loan.parentClubId; loan = undefined; }
  const baseClub = clubs.find((entry) => entry.id === player.clubId) ?? clubs[0];
  const leagueId = assignments[baseClub.id] ?? baseClub.leagueId;
  const club = { ...baseClub, leagueId };
  const clubHistory: ClubCareerRecord[] = (state.clubHistory ?? []).map((entry) => ({...entry,titles:[...entry.titles]}));
  let clubRecord = clubHistory.find((entry) => entry.clubId === player.clubId); if (!clubRecord) { clubRecord={clubId:player.clubId,titles:[]}; clubHistory.push(clubRecord); }
  const ovr=computeOvr(player), generational=state.mode==="generational", agePerformance=agePerformanceMultiplier(player.age,player.attributes.fisico);
  const rolePower = { promessa:.42, rotacao:.58, titular:.78, estrela:.92 }[state.contract?.role ?? "promessa"];
  const seasonal=state.shop?.activeSeasonal ?? [], permanent=state.shop?.ownedPermanent ?? [];
  const physicalBonus=(seasonal.includes("preparador")?4:0)+(seasonal.includes("suplementacao")?2:0)+(permanent.includes("mansao")?3:0);
  const seasonOvr=(ovr+physicalBonus)*agePerformance;
  const role=Math.max(.12,Math.min(.96,(seasonOvr-club.strength+18)/30*rolePower));
  const games=Math.max(1,Math.round(8+role*34-player.injuries*.4));
  const benchAppearances=Math.max(0,Math.round(25-games*.45+(1-role)*10));
  const attacking=player.position==="ATA"?(player.attributes.finalizacao+player.attributes.cabecada+player.attributes.velocidade+player.attributes.forca)/400:player.position==="MEI"?(player.attributes.finalizacao+player.attributes.drible+player.attributes.velocidade)/300:0;
  const creative=player.position==="MEI"?(player.attributes.passe+player.attributes.drible+player.attributes.velocidade)/300:0;
  const defensive=player.position==="GOL"?(player.attributes.reflexo+player.attributes.elasticidade+player.attributes.posicionamento+player.attributes.saida)/400:0;
  const goals=["ATA","MEI"].includes(player.position)?Math.max(0,Math.round(games*attacking*(.26+random()*.22))):0;
  const assists=player.position==="MEI"?Math.max(0,Math.round(games*creative*(.2+random()*.18))):0;
  const cleanSheets=player.position==="GOL"?Math.max(0,Math.round(games*defensive*.45)):0;
  const injuryRisk=Math.max(.035,.2-(player.attributes.fisico+physicalBonus)/700)*(seasonal.includes("fisio") ? .65 : 1);
  const injuryWeeks=random()<injuryRisk?Math.round(1+random()*7):0;
  const analystBoost = seasonal.includes("analista") && club.strength < 76 ? 7 : 0;
  const table=buildLeagueTable({...state,leagueAssignments:assignments},leagueId,player.clubId,(seasonOvr-club.strength)*.7+player.form/12+analystBoost,random);
  const row=table.entries.find((entry)=>entry.clubId===player.clubId) ?? table.entries[0];
  const league=competitions.find((entry)=>entry.id===leagueId);
  const promotion=row.position<=table.promotionPlaces ? leagueTarget({...state,leagueAssignments:assignments},leagueId,"up") : undefined;
  const titleAndPromotion=Boolean(promotion && ["bra-b","bra-c","bra-d"].includes(leagueId));
  // Nas Séries B/C/D, a decisão de acesso também vale o troféu da divisão.
  const leagueTitle=row.position===1 && !titleAndPromotion ? league?.name : undefined;
  const relegation=row.position>table.entries.length-table.relegationPlaces ? leagueTarget({...state,leagueAssignments:assignments},leagueId,"down") : undefined;
  let cupFinal = promotion
    ? { competitionId: leagueId, competitionName: titleAndPromotion ? (league?.name ?? "Campeonato Nacional") : "Decisão do acesso", opponentClubId: "decisao", opponentClubName: "Rival direto", stakes: titleAndPromotion ? "titleAndPromotion" as const : "promotion" as const, targetLeagueId: promotion }
    : pickCupFinal(club, seasonOvr, player.form, random, generational ? .1 : 0);
  const national=simulateFullNationalTeam(player,state.season,ovr,random);
  if (national?.title) {
    const selectionCompetition=competitions.find((entry) => entry.name === national.title);
    cupFinal={ competitionId: selectionCompetition?.id ?? "national-title", competitionName: national.title, opponentClubId: "selecao-rival", opponentClubName: "Seleção rival", stakes: "cup" };
  }
  const contract=state.contract ?? {clubId:player.clubId,monthlySalary:200_000,seasonsRemaining:3,role:"promessa" as const,expectedMinutes:30};
  const monthlySalary=contract.monthlySalary*(seasonal.includes("empresario")?1.25:1);
  const prize=(leagueTitle?league?.prestige??0:0)*50_000+(national?.title?800_000:0);
  const balance=(state.balance??0)+monthlySalary*12+prize;
  player.games+=games; player.goals+=goals; player.assists+=assists; player.cleanSheets+=cleanSheets; player.saves+=player.position==="GOL"?Math.round(games*(2.4+random()*1.6)):0; player.benchAppearances=(player.benchAppearances??0)+benchAppearances;
  player.nationalTeamGames=(player.nationalTeamGames??0)+(national?.games??0); player.nationalTeamGoals=(player.nationalTeamGoals??0)+(national?.goals??0); player.nationalTeamAssists=(player.nationalTeamAssists??0)+(national?.assists??0);
  player.injuries=injuryWeeks; player.age+=1; player.form=clamp((52+random()*42)*agePerformance-injuryWeeks*2+(seasonal.includes("chef")?5:0)+(seasonal.includes("ferias")?5:0)+(permanent.includes("casa")?2:0)); player.marketValue=Math.max(50_000,Math.round(player.marketValue*(1+(seasonOvr-62)/380)));
  player.clubIdolatry[player.clubId]=clamp((player.clubIdolatry[player.clubId]??25)+games/12+(leagueTitle?9:0)+goals/9);
  if(leagueTitle){player.titles.push(leagueTitle);clubRecord.titles.push(leagueTitle);}
  const award=goals>=24?"Chuteira de Ouro":player.position==="GOL"&&cleanSheets>=16?"Melhor Goleiro da Liga":goals>=18?"Artilheiro da temporada":undefined; if(award) player.awards.push(award);
  const contextual=contextualEvents(player,contract.seasonsRemaining,table,club,random,{ firstLoanWindow: state.history.length === 1 && !loan && player.age <= 18, title: leagueTitle, nationalCalled: Boolean(national), goals, games });
  const seasonEvents=[...contextual,...pickSeasonEvents(random,player.fame,player.position,cupFinal)];
  const nextContract={...contract,seasonsRemaining:Math.max(0,contract.seasonsRemaining-1)};
  const highestOvr=Math.max(state.highestOvr ?? ovr,ovr);
  const opensMarket=player.age >= 20 && (player.age - 20) % 3 === 0;
  const marketWindow=opensMarket ? createMarketWindow({ ...state, player, contract: nextContract, highestOvr, originCountry: state.originCountry ?? club.country }, random) : undefined;
  // Os demais clubes da tabela também trocam de divisão; o jogador decide a própria final.
  table.entries.forEach((entry) => {
    if (entry.clubId === player.clubId) return;
    if (entry.position <= table.promotionPlaces) { const target=leagueTarget({...state,leagueAssignments:assignments},leagueId,"up"); if(target) assignments[entry.clubId]=target; }
    if (entry.position > table.entries.length-table.relegationPlaces) { const target=leagueTarget({...state,leagueAssignments:assignments},leagueId,"down"); if(target) assignments[entry.clubId]=target; }
  });
  const nationalTeam={games:(state.nationalTeam?.games??0)+(national?.games??0),goals:(state.nationalTeam?.goals??0)+(national?.goals??0),assists:(state.nationalTeam?.assists??0)+(national?.assists??0),titles:[...(state.nationalTeam?.titles??[]),...(national?.title?[national.title]:[])]};
  const result:SeasonResult={season:state.season,games,goals,assists,cleanSheets,title:leagueTitle,award,injuryWeeks,event:seasonEvents[0],events:seasonEvents,cupFinal,nationalTeamCompetition:national?.competition,nationalTeamTitle:national?.title && !cupFinal ? national.title : undefined,nationalTeamCampaign:national,leaguePosition:row.position,leaguePoints:row.points,benchAppearances,finalOpportunity:Boolean(cupFinal)};
  return {state:{...state,season:state.season+1,player,clubHistory,history:[...state.history,result],currentCompetition:league?.name??state.currentCompetition,balance,contract:nextContract,loan,leagueAssignments:assignments,leagueTables:{...state.leagueTables,[leagueId]:table},shop:{ownedPermanent:[...(state.shop?.ownedPermanent??[])],activeSeasonal:[],freeUses:[]},nationalTeam,originCountry:state.originCountry ?? club.country,highestOvr,marketWindow},result};
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
