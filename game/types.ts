export type Position = "GOL" | "ZAG" | "LD" | "LE" | "ALA" | "VOL" | "MC" | "MEI" | "PD" | "PE" | "SA" | "CA";
export type AttributeKey =
  | "velocidade" | "aceleracao" | "resistencia" | "forca" | "potenciaChute"
  | "impulsao" | "agilidade" | "dominio" | "drible" | "passe" | "cruzamento"
  | "finalizacao" | "chuteLonge" | "marcacao" | "dividida" | "posicionamento"
  | "visao" | "reflexos" | "saidaGol" | "lideranca";

export type Attributes = Record<AttributeKey, number>;
export type Rarity = "raro" | "epico" | "lendario";

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
}

export interface CareerState {
  seed: number;
  season: number;
  player: Player;
  history: SeasonResult[];
  currentCompetition: string;
}
