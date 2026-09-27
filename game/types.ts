export type Position = "GOL" | "MEI" | "ATA";
export type AttributeKey =
  | "reflexo" | "elasticidade" | "posicionamento" | "saida" | "lideranca" | "fisico"
  | "velocidade" | "passe" | "finalizacao" | "drible" | "cabecada" | "forca";

export type Attributes = Record<AttributeKey, number>;

export type Rarity = "raro" | "epico" | "lendario";
export type ContractRole = "promessa" | "rotacao" | "titular" | "estrela";
export type ShopItemId = "campanha" | "treino" | "chef" | "fisio" | "psicologo" | "preparador" | "empresario" | "chuteiras" | "ferias" | "suplementacao" | "analista" | "familia" | "imprensa" | "carro" | "casa" | "mansao" | "ilha" | "bairro" | "academia";

export interface Club {
  id: string;
  name: string;
  country: string;
  leagueId: string;
  /** Competitions entered by this real club in the frozen catalogue edition. */
  competitionIds?: string[];
  crest: string;
  strength: number;
  reputation: number;
  budget: number;
  style: "posse" | "vertical" | "defensivo" | "pressao";
  rivals: string[];
}

export interface Competition {
  id: string;
  name: string;
  country: string;
  /** Unicode flag shown wherever the player chooses this competition. */
  flag: string;
  tier: number;
  kind: "league" | "cup" | "continental" | "international" | "state";
  season: "calendar" | "european";
  prestige: number;
  /** A club can be chosen here when starting a career. Cups are calendar-only. */
  selectable: boolean;
  /** Fixed club total for the catalogue edition; makes missing clubs a release error. */
  expectedClubCount?: number;
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  position: Position;
  secondaryPosition?: Position;
  preferredFoot: "Direito" | "Esquerdo" | "Ambidestro";
  heightCm: number;
  shirtNumber: number;
  age: number;
  clubId: string;
  attributes: Attributes;
  form: number;
  fame: number;
  salary: number;
  marketValue: number;
  games: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  saves: number;
  titles: string[];
  awards: string[];
  clubIdolatry: Record<string, number>;
  judasAt: string[];
  injuries: number;
  benchAppearances?: number;
  nationalTeamGames?: number;
  nationalTeamGoals?: number;
  nationalTeamAssists?: number;
}

export interface ContractOffer {
  clubId: string;
  monthlySalary: number;
  seasons: number;
  role: ContractRole;
  /** Percentual de partidas que o clube espera que o atleta dispute. */
  expectedMinutes: number;
  idolatryChange: number;
}
export interface MarketWindow {
  season: number;
  offers: ContractOffer[];
  renewal: ContractOffer;
}
export interface CareerContract {
  clubId: string;
  monthlySalary: number;
  seasonsRemaining: number;
  role: ContractRole;
  expectedMinutes: number;
}

export interface LoanSpell {
  parentClubId: string;
  returnSeason: number;
}

export interface LeagueTableEntry {
  clubId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  position: number;
}

export interface LeagueTable {
  competitionId: string;
  season: number;
  entries: LeagueTableEntry[];
  promotionPlaces: number;
  relegationPlaces: number;
}

export interface NationalTeamCampaign {
  competitionId?: string;
  competition: string;
  phase: string;
  games: number;
  goals: number;
  assists: number;
  qualified: boolean;
  title?: string;
  category?: "sub20" | "olympic" | "senior";
}

export interface ShopState {
  ownedPermanent: ShopItemId[];
  activeSeasonal: ShopItemId[];
  freeUses: ShopItemId[];
}

export interface ClubCareerRecord {
  clubId: string;
  titles: string[];
}

/** Valores que evoluem somente dentro da carreira, sem mudar o catálogo base. */
export interface ClubDynamics {
  strength: number;
  reputation: number;
  budget: number;
  titles: number;
}

export interface RandomCareerStart {
  seed: number;
  position: Position;
  club: Club;
  league: Competition;
  nationality: string;
  preferredFoot: Player["preferredFoot"];
  heightCm: number;
  shirtNumber: number;
}

export interface UpgradeCard {
  id: string;
  rarity: Rarity;
  name: string;
  changes: Partial<Attributes>;
  eligible: Position[];
}

export interface CareerEvent {
  id: string;
  title: string;
  copy: string;
  sponsor?: { name: string; logo: string };
  context?: string;
  choices: Array<{ label: string; fame?: number; idolatry?: number; form?: number; salary?: number; injuryWeeks?: number; finalOutcome?: "win" | "lose" }>;
}

/** A final generated from clubs that can plausibly take part in that cup. */
export interface CupFinal {
  competitionId: string;
  competitionName: string;
  opponentClubId: string;
  opponentClubName: string;
  /** Undefined while the minigame has not decided the final yet. */
  won?: boolean;
  stakes?: "cup" | "promotion" | "relegation" | "continental" | "titleAndPromotion" | "campaign";
  targetLeagueId?: string;
  /** A primeira decisão é pelo título; ao perdê-la, abre o jogo de acesso. */
  phase?: "title" | "access";
  /** Finais de seleções atualizam o histórico nacional, não o clube. */
  scope?: "club" | "national";
  campaignId?: string;
  /** Partida de uma campanha longa, como Copa do Mundo ou Super Mundial. */
  campaignMatchIndex?: number;
  campaignDifficulty?: number;
  /** A seleção define a dificuldade base dos minigames da Copa do Mundo. */
  worldCupDifficulty?: "easy" | "standard" | "hard" | "veryHard";
}

/** Escolha anual de evolução natural, separada das cartas de treino. */
export type EvolutionFocus = "assinatura" | "estilo" | "liderancaFisica";
export interface SeasonEvolution {
  season: number;
  age: number;
  points: number;
  mode: "normal" | "generational";
  available: EvolutionFocus[];
  focus?: EvolutionFocus;
  gains?: Partial<Attributes>;
  bonusSignature?: boolean;
}

export type CampaignStatus = "scheduled" | "active" | "eliminated" | "final" | "champion";
export type CampaignMatchResult = "pending" | "won" | "drawn" | "lost";
export interface CampaignMatch {
  phase: string;
  opponentId?: string;
  opponentName: string;
  playerGoals?: number;
  opponentGoals?: number;
  result: CampaignMatchResult;
  playable?: boolean;
  difficulty?: number;
}
export interface CampaignQualification {
  competitionId: string;
  source: string;
}
export interface SeasonCampaign {
  id: string;
  competitionId: string;
  competitionName: string;
  category: "league" | "state" | "cup" | "supercup" | "continental" | "world" | "national";
  qualification: CampaignQualification;
  status: CampaignStatus;
  phase: string;
  matches: CampaignMatch[];
  prize: number;
  title?: string;
  groupTable?: Array<{ name: string; points: number; goalDifference: number; goalsFor: number; position: number }>;
}
export interface CampaignResult extends SeasonCampaign {
  consequence?: string;
}

export interface SeasonResult {
  season: number;
  games: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  title?: string;
  award?: string;
  injuryWeeks: number;
  event?: CareerEvent;
  events: CareerEvent[];
  finalOpportunity: boolean;
  cupFinal?: CupFinal;
  /** Torneio de seleções disputado automaticamente ao atingir OVR 82. */
  nationalTeamCompetition?: string;
  /** Preenchido apenas quando o jogador conquista o torneio de seleções. */
  nationalTeamTitle?: string;
  leaguePosition?: number;
  leaguePoints?: number;
  benchAppearances?: number;
  nationalTeamCampaign?: NationalTeamCampaign;
  leagueId?: string;
  leagueName?: string;
  clubId?: string;
  rating?: number;
  annualEarnings?: number;
  titles?: string[];
  access?: "pending" | "promoted" | "stayed";
  relegated?: boolean;
  consequences?: string[];
  phaseReached?: string;
  opponentName?: string;
  /** Snapshot imutável da situação no começo da temporada. */
  division?: number;
  contractRole?: ContractRole;
  contractMonthlySalary?: number;
  calendar?: Array<{ competition: string; phase: string; opponent?: string }>;
  campaigns?: CampaignResult[];
  finals?: CupFinal[];
  evolution?: SeasonEvolution;
}

export interface CareerState {
  seed: number;
  season: number;
  player: Player;
  history: SeasonResult[];
  /** Histórico preciso de títulos por clube, criado em novas carreiras. */
  clubHistory: ClubCareerRecord[];
  currentCompetition: string;
  /** Carreira normal ou com a vantagem inicial de Craque Geracional. */
  mode?: "normal" | "generational";
  /** Saldo pessoal do atleta, em dólares. */
  balance: number;
  contract: CareerContract;
  loan?: LoanSpell;
  /** Divisão atual de cada clube dentro desta carreira. */
  leagueAssignments: Record<string, string>;
  leagueTables: Record<string, LeagueTable>;
  shop: ShopState;
  nationalTeam: { games: number; goals: number; assists: number; titles: string[] };
  originCountry: string;
  highestOvr: number;
  marketWindow?: MarketWindow;
  /** Ajustes de força persistentes, sem mutar o catálogo global. */
  clubStrengthAdjustments?: Record<string, number>;
  recentEventIds?: string[];
  recentCardIds?: string[];
  clubDynamics?: Record<string, ClubDynamics>;
  /** Títulos anteriores que liberam copas continentais e supercopas. */
  clubHonors?: Record<string, string[]>;
  /** Transferência aceita no mercado; só passa a valer na próxima temporada. */
  pendingTransfer?: ContractOffer;
  /** Especialização escolhida na pré-temporada. */
  careerProfile?: string;
  saveVersion?: number;
  /** Vagas conquistadas para o calendário seguinte, por clube. */
  campaignQualifications?: Record<string, CampaignQualification[]>;
  /** Campeões necessários para montar supercopas e ciclos do Mundial. */
  competitionWinners?: Record<string, Array<{ clubId: string; season: number }>>;
  /** Radar de Evolução pendente: a temporada não avança sem esta escolha. */
  pendingEvolution?: SeasonEvolution;
  lastEvolutionFocus?: EvolutionFocus;
  evolutionFocusStreak?: number;
  /** Um Mundial escolhe um minigame exclusivo e o mantém até a sua final. */
  campaignMiniGames?: Record<string, import("./minigames").MiniGameId>;
  /** Evita que a mesma decisão volte em finais imediatamente seguidas. */
  recentMiniGameIds?: import("./minigames").MiniGameId[];
}
