import { countries, type CountryOption } from "./countries";

/** Regulamento explícito de cada país presente no catálogo. */
export interface CountryCompetitionRule {
  topLeague: string;
  divisions: string[];
  primaryCup?: string;
  secondaryCups?: string[];
  supercups?: string[];
  hasStateChampionship?: boolean;
  /** Quantidade de vagas usada na simulação anual de cada divisão. */
  promotionPlaces?: Record<string, number>;
  relegationPlaces?: Record<string, number>;
  continent: "southAmerica" | "europe" | "northAmerica" | "asia" | "other";
}

const rule = (topLeague: string, divisions: string[], continent: CountryCompetitionRule["continent"], primaryCup?: string, supercups: string[] = [], secondaryCups: string[] = [], hasStateChampionship = false, movement: Pick<CountryCompetitionRule, "promotionPlaces" | "relegationPlaces"> = {}): CountryCompetitionRule => ({ topLeague, divisions, primaryCup, supercups, secondaryCups, hasStateChampionship, continent, ...movement });

export const COUNTRY_COMPETITION_RULES: Record<string, CountryCompetitionRule> = {
  "Brasil": rule("bra-a", ["bra-a", "bra-b", "bra-c", "bra-d"], "southAmerica", "copa-br", ["bra-super"], ["copa-verde"], true, { promotionPlaces: { "bra-b": 4, "bra-c": 4, "bra-d": 4 }, relegationPlaces: { "bra-a": 4, "bra-b": 4, "bra-c": 4 } }),
  "Argentina": rule("arg-lp", ["arg-lp", "arg-pn", "arg-pb", "arg-pc", "arg-fa", "arg-pa"], "southAmerica", "arg-cup", ["arg-super", "arg-tc"], [], false, { promotionPlaces: { "arg-pn": 2, "arg-pb": 2, "arg-pc": 2, "arg-fa": 2, "arg-pa": 2 }, relegationPlaces: { "arg-lp": 2, "arg-pn": 2, "arg-pb": 2, "arg-pc": 2, "arg-fa": 2 } }),
  "Chile": rule("chi-a", ["chi-a", "chi-b", "chi-c"], "southAmerica", "chi-cup", ["chi-super"], ["chi-lcup"], false, { promotionPlaces: { "chi-b": 2, "chi-c": 2 }, relegationPlaces: { "chi-a": 2, "chi-b": 2 } }),
  "Colômbia": rule("col-a", ["col-a"], "southAmerica", "col-cup", ["col-super"]),
  "Uruguai": rule("uru-a", ["uru-a"], "southAmerica", "uru-cup", ["uru-super"]),
  "Paraguai": rule("par-a", ["par-a"], "southAmerica", "par-cup", ["par-super"]),
  "Peru": rule("per-a", ["per-a", "per-b"], "southAmerica", "per-cup", [], [], false, { promotionPlaces: { "per-b": 2 }, relegationPlaces: { "per-a": 2 } }),
  "Bolívia": rule("bol-a", ["bol-a"], "southAmerica"),
  "Equador": rule("ecu-a", ["ecu-a"], "southAmerica", "ecu-cup", ["ecu-super"]),
  "Venezuela": rule("ven-a", ["ven-a", "ven-b"], "southAmerica", "ven-cup", ["ven-super"], [], false, { promotionPlaces: { "ven-b": 2 }, relegationPlaces: { "ven-a": 2 } }),
  "Inglaterra": rule("eng-pl", ["eng-pl", "eng-c", "eng-l1", "eng-l2"], "europe", "eng-fa", ["eng-cs"], ["eng-lcup"], false, { promotionPlaces: { "eng-c": 3, "eng-l1": 3, "eng-l2": 3 }, relegationPlaces: { "eng-pl": 3, "eng-c": 3, "eng-l1": 3 } }),
  "Espanha": rule("esp-ll", ["esp-ll"], "europe", "esp-cup", ["esp-super"]),
  "Itália": rule("ita-sa", ["ita-sa"], "europe", "ita-cup", ["ita-super"]),
  "Alemanha": rule("ger-bl", ["ger-bl"], "europe", "ger-cup", ["ger-super"]),
  "França": rule("fra-l1", ["fra-l1"], "europe", "fra-cup", ["fra-super"]),
  "Portugal": rule("por-pl", ["por-pl"], "europe", "por-cup", ["por-super"]),
  "Holanda": rule("ned-a", ["ned-a"], "europe", "ned-cup", ["ned-super"]),
  "Bélgica": rule("bel-a", ["bel-a"], "europe", "bel-cup", ["bel-super"]),
  "Turquia": rule("tur-a", ["tur-a"], "europe", "tur-cup", ["tur-super"]),
  "Grécia": rule("gre-a", ["gre-a"], "europe", "gre-cup", ["gre-super"]),
  "Suíça": rule("sui-a", ["sui-a"], "europe", "sui-cup"),
  "Áustria": rule("aut-a", ["aut-a"], "europe", "aut-cup"),
  "Dinamarca": rule("den-a", ["den-a"], "europe", "den-cup"),
  "Noruega": rule("nor-a", ["nor-a"], "europe", "nor-cup"),
  "Polônia": rule("pol-a", ["pol-a"], "europe", "pol-cup", ["pol-super"]),
  "Croácia": rule("cro-a", ["cro-a"], "europe", "cro-cup", ["cro-super"]),
  "Escócia": rule("sco-a", ["sco-a"], "europe", "sco-cup"),
  "Irlanda": rule("irl-a", ["irl-a"], "europe", "irl-cup", ["irl-cs"]),
  "México": rule("mex-liga", ["mex-liga"], "northAmerica"),
  "Estados Unidos": rule("usa-mls", ["usa-mls"], "northAmerica", "usa-open"),
  "Arábia Saudita": rule("sau-pro", ["sau-pro"], "asia", "sau-cup", ["sau-super"]),
  "Japão": rule("jpn-j1", ["jpn-j1"], "asia", "jpn-cup", ["jpn-super"]),
  "Austrália": rule("aus-al", ["aus-al"], "asia", "aus-cup"),
};

export function competitionRuleFor(country: string) { return COUNTRY_COMPETITION_RULES[country]; }

/** Grupos de classificação e dificuldade de Copa do Mundo. */
export type WorldCupEligibility = "group1" | "group2" | "group3" | "group4";
export type WorldCupMiniGameDifficulty = "easy" | "standard" | "hard" | "veryHard";

/** 100%: tradicionais em toda edição. */
export const WORLD_CUP_GROUP_1_CODES = new Set([
  "BR", "AR", "UY", "CO", "EC", // América do Sul
  "US", "MX", "CA", // CONCACAF
  "DE", "ES", "FR", "GB", "IT", "PT", "NL", "BE", "HR", "CH", "SE", "NO", // Europa
  "JP", "KR", "IR", "AU", "SA", "NZ", // Ásia/Oceania
  "MA", "SN", "NG", "EG", // África
]);
/** 65%: seleções competitivas que costumam ter eliminatórias duras. */
export const WORLD_CUP_GROUP_2_CODES = new Set([
  "CL", "PY", "PE", "CR", "PA", "JM", "HN", "SV", "GT", "HT", "TT",
  "DK", "AT", "TR", "RS", "PL", "UA", "GR", "RO", "CZ", "HU", "SK", "SI", "BG", "BA", "AL", "GE",
  "DZ", "TN", "CM", "CI", "GH", "ZA", "ML", "CD", "BF", "CV", "GN",
  "QA", "AE", "IQ", "UZ", "OM", "JO",
]);
/** 25%: zebras possíveis. */
export const WORLD_CUP_GROUP_3_CODES = new Set([
  "BO", "VE", "CU", "DO", "FI", "IE", "IS", "ME", "MK", "AM",
  "CN", "IN", "VN", "TH", "ID", "MY", "GA", "UG", "ZM", "ZW", "KE", "TZ",
  "FJ", "PG", "SB", "VU",
]);

export function worldCupEligibilityFor(nationality: string): WorldCupEligibility {
  const code = countries.find((country) => country.name === nationality)?.code;
  if (code && WORLD_CUP_GROUP_1_CODES.has(code)) return "group1";
  if (code && WORLD_CUP_GROUP_2_CODES.has(code)) return "group2";
  if (code && WORLD_CUP_GROUP_3_CODES.has(code)) return "group3";
  return "group4";
}
export function worldCupQualificationChance(nationality: string) {
  return ({ group1: 1, group2: .65, group3: .25, group4: .02 } as const)[worldCupEligibilityFor(nationality)];
}
export function worldCupMiniGameDifficulty(nationality: string): WorldCupMiniGameDifficulty {
  return ({ group1: "easy", group2: "standard", group3: "hard", group4: "veryHard" } as const)[worldCupEligibilityFor(nationality)];
}

function countryCycleSeed(country: CountryOption, season: number) {
  return [...country.code].reduce((seed, letter) => seed * 31 + letter.charCodeAt(0), season * 101);
}
function worldCupRoll(country: CountryOption, season: number) {
  return Math.abs(Math.sin(countryCycleSeed(country, season))) % 1;
}

export function worldCupParticipants(season: number) {
  const guaranteed = countries.filter((country) => worldCupEligibilityFor(country.name) === "group1");
  const drawn = countries.filter((country) => worldCupEligibilityFor(country.name) !== "group1")
    .map((country) => ({ country, roll: worldCupRoll(country, season), chance: worldCupQualificationChance(country.name) }))
    .sort((a, b) => (a.roll / a.chance) - (b.roll / b.chance));
  // A edição tem 48 vagas. O sorteio ponderado mantém 100/65/25/2 como força
  // de classificação, mas nunca estoura o formato da Copa.
  return [...guaranteed, ...drawn.map((entry) => entry.country)].slice(0, 48);
}

/** Resultado determinístico das eliminatórias para toda a edição. */
export function qualifiesForWorldCup(nationality: string, season: number) {
  return worldCupParticipants(season).some((country) => country.name === nationality);
}

/** Vagas do Super Mundial: campeões continentais do ciclo + ranking mundial. */
export const SUPER_MUNDIAL_CONTINENTAL_SOURCES = ["lib", "ucl", "concacaf", "afc-cl"] as const;
export const SUPER_MUNDIAL_RANKING_SLOTS = {
  europe: 12,
  southAmerica: 8,
  northAmerica: 6,
  asia: 6,
} as const;
