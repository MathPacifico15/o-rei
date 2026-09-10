import { clubs, competitions } from "./catalog";
import type { AttributeKey, Attributes, CareerEvent, CareerState, Player, Position, SeasonResult, UpgradeCard } from "./types";

const weights: Record<Position, Partial<Record<AttributeKey, number>>> = {
  GOL: { reflexos: 0.28, saidaGol: 0.2, posicionamento: 0.2, agilidade: 0.16, impulsao: 0.1, lideranca: 0.06 },
  ZAG: { marcacao: 0.24, dividida: 0.2, posicionamento: 0.2, forca: 0.16, impulsao: 0.1, velocidade: 0.1 },
  LD: { velocidade: 0.19, aceleracao: 0.18, resistencia: 0.16, cruzamento: 0.16, marcacao: 0.16, dividida: 0.15 },
  LE: { velocidade: 0.19, aceleracao: 0.18, resistencia: 0.16, cruzamento: 0.16, marcacao: 0.16, dividida: 0.15 },
  ALA: { velocidade: 0.2, aceleracao: 0.2, resistencia: 0.16, drible: 0.16, cruzamento: 0.16, finalizacao: 0.12 },
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
  { id: "lat-arranque", rarity: "raro", name: "Arranque", changes: { aceleracao: 2, velocidade: 1 }, eligible: ["LD", "LE", "ALA"] },
  { id: "lat-fundo", rarity: "epico", name: "Fôlego de Linha", changes: { resistencia: 2, velocidade: 2, cruzamento: 1 }, eligible: ["LD", "LE", "ALA"] },
  { id: "lat-incansavel", rarity: "lendario", name: "Faixa Incansável", changes: { resistencia: 3, velocidade: 3, aceleracao: 2, cruzamento: 1 }, eligible: ["LD", "LE", "ALA"] },
  { id: "mc-passe", rarity: "raro", name: "Passe Vertical", changes: { passe: 2, visao: 1 }, eligible: ["MC", "MEI"] },
  { id: "mc-giro", rarity: "epico", name: "Giro Curto", changes: { dominio: 2, agilidade: 2, passe: 1 }, eligible: ["MC", "MEI"] },
  { id: "mc-frieza", rarity: "lendario", name: "Frieza em Decisão", changes: { visao: 3, passe: 2, finalizacao: 2, chuteLonge: 1 }, eligible: ["MC", "MEI"] },
  { id: "ponta-umcontraum", rarity: "raro", name: "Um Contra Um", changes: { drible: 2, agilidade: 1 }, eligible: ["PD", "PE"] },
  { id: "ponta-explosao", rarity: "epico", name: "Explosão Curta", changes: { aceleracao: 2, velocidade: 2, drible: 1 }, eligible: ["PD", "PE"] },
  { id: "ponta-imparavel", rarity: "lendario", name: "Ponta Imparável", changes: { velocidade: 3, aceleracao: 3, agilidade: 2, finalizacao: 1 }, eligible: ["PD", "PE"] },
  { id: "ataque-chute", rarity: "raro", name: "Técnica de Chute", changes: { finalizacao: 2, potenciaChute: 1 }, eligible: ["SA", "CA"] },
  { id: "ataque-area", rarity: "epico", name: "Ataque à Área", changes: { posicionamento: 2, impulsao: 2, finalizacao: 1 }, eligible: ["SA", "CA"] },
  { id: "ataque-artilheiro", rarity: "lendario", name: "Finalizador Completo", changes: { finalizacao: 3, potenciaChute: 2, posicionamento: 2, forca: 1 }, eligible: ["SA", "CA"] },
  { id: "geral-resistencia", rarity: "raro", name: "Base Física", changes: { resistencia: 2, forca: 1 }, eligible: ["GOL", "ZAG", "LD", "LE", "ALA", "VOL", "MC", "MEI", "PD", "PE", "SA", "CA"] },
  { id: "geral-lideranca", rarity: "epico", name: "Voz de Campo", changes: { lideranca: 2, resistencia: 1, posicionamento: 1 }, eligible: ["GOL", "ZAG", "LD", "LE", "ALA", "VOL", "MC", "MEI", "PD", "PE", "SA", "CA"] },
  { id: "geral-atleta", rarity: "lendario", name: "Atleta de Elite", changes: { velocidade: 2, aceleracao: 2, resistencia: 2, forca: 1 }, eligible: ["ZAG", "LD", "LE", "ALA", "VOL", "MC", "MEI", "PD", "PE", "SA", "CA"] },
];

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
  { id: "comunidade", title: "Ação no bairro", copy: "Uma iniciativa local convida o elenco para um dia com a comunidade.", choices: [{ label: "Participar com discrição", fame: 1, idolatry: 3 }, { label: "Levar doações", fame: 2, idolatry: 2, money: -2000 }, { label: "Não conseguir comparecer", form: 1 }] },
  { id: "recuperacao", title: "Dia extra de recuperação", copy: "Seu corpo acusa a sequência de viagens e decisões.", choices: [{ label: "Fazer recuperação completa", form: 3, fame: -1 }, { label: "Treino leve com bola", form: 1 }, { label: "Ignorar os sinais", fame: 1, form: -3 }] },
  { id: "faixa", title: "A braçadeira fica vaga", copy: "O capitão não joga a próxima partida e seu nome surge na conversa.", choices: [{ label: "Assumir a responsabilidade", fame: 1, idolatry: 3 }, { label: "Indicar um veterano", idolatry: 1, form: 1 }, { label: "Dizer que ainda não é a hora", form: 1 }] },
];

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
  const assists = ["MC", "MEI", "PD", "PE", "ALA", "LD", "LE"].includes(player.position) ? Math.max(0, Math.round(games * creative * (0.2 + random() * 0.18))) : 0;
  const cleanSheets = ["GOL", "ZAG", "VOL", "LD", "LE"].includes(player.position) ? Math.max(0, Math.round(games * defensive * 0.45)) : 0;
  const injuryWeeks = random() < Math.max(0.04, 0.2 - player.attributes.resistencia / 700) ? Math.round(1 + random() * 7) : 0;
  const league = competitions.find((entry) => entry.id === club.leagueId);
  const winsTitle = club.strength + ovr * 0.24 + random() * 19 > 104;
  const promotion = club.leagueId === "bra-b" ? "Acesso à Série A" : club.leagueId === "bra-c" ? "Acesso à Série B" : club.leagueId === "bra-d" ? "Acesso à Série C" : undefined;
  const continentalTitle = random() > 0.965 && ovr + club.strength > 153 ? (club.country === "Brasil" || club.country === "Argentina" ? "CONMEBOL Libertadores" : "Champions League") : undefined;
  const title = continentalTitle ?? (winsTitle ? (promotion ?? league?.name ?? "Campeonato Nacional") : undefined);
  const eventCount = Math.floor(random() * 6);
  const seasonEvents = Array.from({ length: eventCount }, (_, index) => events[Math.floor(random() * events.length + index) % events.length]);
  const event = seasonEvents[0];
  const award = goals >= 24 ? "Chuteira de Ouro" : player.position === "GOL" && cleanSheets >= 16 ? "Melhor Goleiro da Liga" : goals >= 18 ? "Artilheiro da temporada" : (ovr > 88 && random() > 0.78 ? "Bola de Ouro" : (ovr > 84 && random() > 0.62 ? "Melhor jogador da liga" : undefined));
  player.games += games; player.goals += goals; player.assists += assists; player.cleanSheets += cleanSheets; player.saves += player.position === "GOL" ? Math.round(games * (2.4 + random() * 1.6)) : 0;
  player.injuries = injuryWeeks; player.age += 1; player.form = clamp(52 + random() * 42 - injuryWeeks * 2); player.marketValue = Math.max(50_000, Math.round(player.marketValue * (1 + (ovr - 62) / 380 - agePenalty / 300)));
  player.clubIdolatry[player.clubId] = clamp((player.clubIdolatry[player.clubId] ?? 25) + games / 12 + (title ? 9 : 0) + goals / 9);
  if (title) player.titles = [...player.titles, title]; if (award) player.awards = [...player.awards, award];
  const result: SeasonResult = { season: state.season, games, goals, assists, cleanSheets, title, award, injuryWeeks, event, events: seasonEvents, finalOpportunity: Boolean(title) || random() > 0.84 };
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
