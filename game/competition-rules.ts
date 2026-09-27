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
