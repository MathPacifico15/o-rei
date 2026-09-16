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
  competition: string;
  phase: string;
  games: number;
  goals: number;
  assists: number;
  qualified: boolean;
  title?: string;
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
  sponsor?: { name: string; logo: string };\n  context?: string;
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
  stakes?: "cup" | "promotion" | "relegation" | "continental";
  targetLeagueId?: string;
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
  nationalTeam: { games: number; goals: number; assists: number; titles: string[] };\n  originCountry: string;\n  highestOvr: number;\n  marketWindow?: MarketWindow;
}
}
