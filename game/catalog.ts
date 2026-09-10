import type { Club, Competition } from "./types";

// This is the versioned starter catalog. A licensed import can replace crest/name fields
// without touching simulation code. Crest strings are stable asset keys, not remote URLs.
export const competitions: Competition[] = [
  { id: "bra-a", name: "Brasileirão Série A", country: "Brasil", tier: 1, kind: "league", season: "calendar", prestige: 82 },
  { id: "bra-b", name: "Brasileirão Série B", country: "Brasil", tier: 2, kind: "league", season: "calendar", prestige: 58 },
  { id: "bra-c", name: "Brasileirão Série C", country: "Brasil", tier: 3, kind: "league", season: "calendar", prestige: 42 },
  { id: "bra-d", name: "Brasileirão Série D", country: "Brasil", tier: 4, kind: "league", season: "calendar", prestige: 28 },
  { id: "copa-br", name: "Copa do Brasil", country: "Brasil", tier: 1, kind: "cup", season: "calendar", prestige: 72 },
  { id: "copa-verde", name: "Copa Verde", country: "Brasil", tier: 1, kind: "cup", season: "calendar", prestige: 33 },
  { id: "lib", name: "CONMEBOL Libertadores", country: "América do Sul", tier: 1, kind: "continental", season: "calendar", prestige: 94 },
  { id: "sula", name: "CONMEBOL Sul-Americana", country: "América do Sul", tier: 1, kind: "continental", season: "calendar", prestige: 72 },
  { id: "arg-lp", name: "Liga Profesional", country: "Argentina", tier: 1, kind: "league", season: "calendar", prestige: 77 },
  { id: "eng-pl", name: "Premier League", country: "Inglaterra", tier: 1, kind: "league", season: "european", prestige: 96 },
  { id: "esp-ll", name: "LaLiga", country: "Espanha", tier: 1, kind: "league", season: "european", prestige: 94 },
  { id: "ita-sa", name: "Serie A", country: "Itália", tier: 1, kind: "league", season: "european", prestige: 91 },
  { id: "ger-bl", name: "Bundesliga", country: "Alemanha", tier: 1, kind: "league", season: "european", prestige: 91 },
  { id: "fra-l1", name: "Ligue 1", country: "França", tier: 1, kind: "league", season: "european", prestige: 84 },
  { id: "por-pl", name: "Primeira Liga", country: "Portugal", tier: 1, kind: "league", season: "european", prestige: 79 },
  { id: "ucl", name: "Champions League", country: "Europa", tier: 1, kind: "continental", season: "european", prestige: 100 },
  { id: "uel", name: "Europa League", country: "Europa", tier: 1, kind: "continental", season: "european", prestige: 76 },
  { id: "uecl", name: "Conference League", country: "Europa", tier: 1, kind: "continental", season: "european", prestige: 59 },
  { id: "mex-liga", name: "Liga MX", country: "México", tier: 1, kind: "league", season: "calendar", prestige: 74 },
  { id: "usa-mls", name: "MLS", country: "Estados Unidos", tier: 1, kind: "league", season: "calendar", prestige: 72 },
  { id: "sau-pro", name: "Saudi Pro League", country: "Arábia Saudita", tier: 1, kind: "league", season: "calendar", prestige: 75 },
  { id: "jpn-j1", name: "J1 League", country: "Japão", tier: 1, kind: "league", season: "calendar", prestige: 71 },
  { id: "aus-al", name: "A-League", country: "Austrália", tier: 1, kind: "league", season: "calendar", prestige: 63 },
  { id: "wc", name: "Copa do Mundo", country: "Internacional", tier: 1, kind: "international", season: "calendar", prestige: 100 },
  { id: "cwc", name: "Super Mundial de Clubes", country: "Internacional", tier: 1, kind: "international", season: "calendar", prestige: 91 },
];

export const clubs: Club[] = [
  { id: "santos", name: "Santos", country: "Brasil", leagueId: "bra-a", crest: "santos", strength: 74, reputation: 89, budget: 67, style: "posse", rivals: ["corinthians", "palmeiras", "sao-paulo"] },
  { id: "palmeiras", name: "Palmeiras", country: "Brasil", leagueId: "bra-a", crest: "palmeiras", strength: 86, reputation: 92, budget: 91, style: "pressao", rivals: ["corinthians", "sao-paulo", "santos"] },
  { id: "corinthians", name: "Corinthians", country: "Brasil", leagueId: "bra-a", crest: "corinthians", strength: 80, reputation: 93, budget: 83, style: "vertical", rivals: ["palmeiras", "sao-paulo", "santos"] },
  { id: "sao-paulo", name: "São Paulo", country: "Brasil", leagueId: "bra-a", crest: "sao-paulo", strength: 79, reputation: 90, budget: 78, style: "posse", rivals: ["corinthians", "palmeiras", "santos"] },
  { id: "flamengo", name: "Flamengo", country: "Brasil", leagueId: "bra-a", crest: "flamengo", strength: 88, reputation: 95, budget: 96, style: "posse", rivals: ["fluminense", "vasco", "botafogo"] },
  { id: "gremio", name: "Grêmio", country: "Brasil", leagueId: "bra-a", crest: "gremio", strength: 79, reputation: 88, budget: 72, style: "vertical", rivals: ["internacional"] },
  { id: "internacional", name: "Internacional", country: "Brasil", leagueId: "bra-a", crest: "internacional", strength: 78, reputation: 88, budget: 70, style: "pressao", rivals: ["gremio"] },
  { id: "boca", name: "Boca Juniors", country: "Argentina", leagueId: "arg-lp", crest: "boca", strength: 84, reputation: 91, budget: 85, style: "vertical", rivals: ["river"] },
  { id: "river", name: "River Plate", country: "Argentina", leagueId: "arg-lp", crest: "river", strength: 85, reputation: 92, budget: 87, style: "posse", rivals: ["boca"] },
  { id: "liverpool", name: "Liverpool", country: "Inglaterra", leagueId: "eng-pl", crest: "liverpool", strength: 91, reputation: 96, budget: 97, style: "pressao", rivals: ["manchester-united", "everton"] },
  { id: "real-madrid", name: "Real Madrid", country: "Espanha", leagueId: "esp-ll", crest: "real-madrid", strength: 94, reputation: 100, budget: 100, style: "vertical", rivals: ["barcelona", "atletico"] },
  { id: "barcelona", name: "Barcelona", country: "Espanha", leagueId: "esp-ll", crest: "barcelona", strength: 91, reputation: 99, budget: 96, style: "posse", rivals: ["real-madrid"] },
  { id: "goias", name: "Goiás", country: "Brasil", leagueId: "bra-b", crest: "goias", strength: 66, reputation: 72, budget: 48, style: "vertical", rivals: ["vila-nova"] },
  { id: "sport", name: "Sport", country: "Brasil", leagueId: "bra-b", crest: "sport", strength: 68, reputation: 77, budget: 54, style: "pressao", rivals: ["nautico", "santa-cruz"] },
  { id: "coritiba", name: "Coritiba", country: "Brasil", leagueId: "bra-b", crest: "coritiba", strength: 66, reputation: 78, budget: 52, style: "posse", rivals: ["athletico"] },
  { id: "america-mg", name: "América-MG", country: "Brasil", leagueId: "bra-b", crest: "america-mg", strength: 65, reputation: 70, budget: 45, style: "vertical", rivals: ["atletico-mg", "cruzeiro"] },
  { id: "ponte-preta", name: "Ponte Preta", country: "Brasil", leagueId: "bra-c", crest: "ponte-preta", strength: 57, reputation: 72, budget: 31, style: "defensivo", rivals: ["guarani"] },
  { id: "remo", name: "Remo", country: "Brasil", leagueId: "bra-c", crest: "remo", strength: 58, reputation: 70, budget: 32, style: "pressao", rivals: ["paysandu"] },
  { id: "figueirense", name: "Figueirense", country: "Brasil", leagueId: "bra-c", crest: "figueirense", strength: 56, reputation: 68, budget: 29, style: "vertical", rivals: ["avai"] },
  { id: "nautico", name: "Náutico", country: "Brasil", leagueId: "bra-c", crest: "nautico", strength: 56, reputation: 71, budget: 30, style: "posse", rivals: ["sport", "santa-cruz"] },
  { id: "portuguesa", name: "Portuguesa", country: "Brasil", leagueId: "bra-d", crest: "portuguesa", strength: 48, reputation: 69, budget: 20, style: "posse", rivals: [] },
  { id: "santa-cruz", name: "Santa Cruz", country: "Brasil", leagueId: "bra-d", crest: "santa-cruz", strength: 49, reputation: 72, budget: 22, style: "pressao", rivals: ["sport", "nautico"] },
  { id: "america-rn", name: "América-RN", country: "Brasil", leagueId: "bra-d", crest: "america-rn", strength: 46, reputation: 62, budget: 18, style: "vertical", rivals: ["abc"] },
  { id: "treze", name: "Treze", country: "Brasil", leagueId: "bra-d", crest: "treze", strength: 45, reputation: 61, budget: 17, style: "defensivo", rivals: ["campinense"] },
  { id: "juventus", name: "Juventus", country: "Itália", leagueId: "ita-sa", crest: "juventus", strength: 89, reputation: 96, budget: 93, style: "vertical", rivals: ["inter", "torino"] },
  { id: "inter", name: "Internazionale", country: "Itália", leagueId: "ita-sa", crest: "inter", strength: 90, reputation: 95, budget: 92, style: "pressao", rivals: ["milan", "juventus"] },
  { id: "milan", name: "Milan", country: "Itália", leagueId: "ita-sa", crest: "milan", strength: 85, reputation: 94, budget: 86, style: "posse", rivals: ["inter"] },
  { id: "bayern", name: "Bayern München", country: "Alemanha", leagueId: "ger-bl", crest: "bayern", strength: 93, reputation: 98, budget: 98, style: "pressao", rivals: ["dortmund"] },
  { id: "dortmund", name: "Borussia Dortmund", country: "Alemanha", leagueId: "ger-bl", crest: "dortmund", strength: 85, reputation: 93, budget: 82, style: "vertical", rivals: ["bayern"] },
  { id: "psg", name: "Paris Saint-Germain", country: "França", leagueId: "fra-l1", crest: "psg", strength: 92, reputation: 97, budget: 99, style: "posse", rivals: ["marseille"] },
  { id: "marseille", name: "Olympique de Marseille", country: "França", leagueId: "fra-l1", crest: "marseille", strength: 77, reputation: 87, budget: 70, style: "pressao", rivals: ["psg"] },
  { id: "porto", name: "Porto", country: "Portugal", leagueId: "por-pl", crest: "porto", strength: 84, reputation: 91, budget: 78, style: "vertical", rivals: ["benfica", "sporting"] },
  { id: "benfica", name: "Benfica", country: "Portugal", leagueId: "por-pl", crest: "benfica", strength: 85, reputation: 92, budget: 81, style: "posse", rivals: ["porto", "sporting"] },
  { id: "sporting", name: "Sporting", country: "Portugal", leagueId: "por-pl", crest: "sporting", strength: 82, reputation: 89, budget: 74, style: "pressao", rivals: ["benfica", "porto"] },
  { id: "america-mex", name: "Club América", country: "México", leagueId: "mex-liga", crest: "america-mex", strength: 81, reputation: 90, budget: 80, style: "posse", rivals: ["chivas"] },
  { id: "chivas", name: "Guadalajara", country: "México", leagueId: "mex-liga", crest: "chivas", strength: 75, reputation: 88, budget: 70, style: "vertical", rivals: ["america-mex"] },
  { id: "inter-miami", name: "Inter Miami", country: "Estados Unidos", leagueId: "usa-mls", crest: "inter-miami", strength: 76, reputation: 87, budget: 82, style: "posse", rivals: ["orlando-city"] },
  { id: "la-galaxy", name: "LA Galaxy", country: "Estados Unidos", leagueId: "usa-mls", crest: "la-galaxy", strength: 71, reputation: 85, budget: 70, style: "vertical", rivals: ["lafc"] },
  { id: "al-hilal", name: "Al-Hilal", country: "Arábia Saudita", leagueId: "sau-pro", crest: "al-hilal", strength: 85, reputation: 88, budget: 90, style: "posse", rivals: ["al-nassr"] },
  { id: "al-nassr", name: "Al-Nassr", country: "Arábia Saudita", leagueId: "sau-pro", crest: "al-nassr", strength: 82, reputation: 87, budget: 88, style: "vertical", rivals: ["al-hilal"] },
  { id: "kashima", name: "Kashima Antlers", country: "Japão", leagueId: "jpn-j1", crest: "kashima", strength: 71, reputation: 79, budget: 60, style: "pressao", rivals: ["urawa"] },
  { id: "urawa", name: "Urawa Reds", country: "Japão", leagueId: "jpn-j1", crest: "urawa", strength: 71, reputation: 80, budget: 60, style: "vertical", rivals: ["kashima"] },
  { id: "melbourne-victory", name: "Melbourne Victory", country: "Austrália", leagueId: "aus-al", crest: "melbourne-victory", strength: 65, reputation: 74, budget: 48, style: "pressao", rivals: ["sydney-fc"] },
  { id: "sydney-fc", name: "Sydney FC", country: "Austrália", leagueId: "aus-al", crest: "sydney-fc", strength: 66, reputation: 75, budget: 50, style: "posse", rivals: ["melbourne-victory"] },
];

export const stateLeagueNames = ["Paulista", "Carioca", "Mineiro", "Gaúcho", "Baiano", "Pernambucano", "Cearense", "Paranaense", "Catarinense", "Goiano", "Paraense", "Amazonense", "Brasiliense", "Alagoano", "Sergipano", "Potiguar", "Paraibano", "Maranhense", "Piauiense", "Mato-grossense", "Sul-mato-grossense", "Capixaba", "Acreano", "Rondoniense", "Roraimense", "Amapaense", "Tocantinense"];

// Target coverage imported by the licensed/public data pack. Keeping this explicit lets the
// importer flag a release that silently drops a league from the promised catalogue.
export const requiredCompetitionNames = [
  ...stateLeagueNames.map((name) => `Campeonato ${name}`),
  "Supercopa do Brasil", "Primera Nacional", "Primera B", "Primera C", "Copa Argentina", "Supercopa Argentina", "Trofeo de Campeones", "Liga de Reserva", "Federal A", "Promocional Amateur",
  "Liga de Primera", "Primera B Chile", "Segunda División Chile", "Copa Chile", "Copa de la Liga Chile", "Supercopa Chile", "Primera A Colômbia", "Liga AUF Uruguaya", "Copa de Primera", "Liga 1 Peruana", "Liga 2 Peruana", "Copa de la Liga Peruana", "División Profesional Bolívia", "LigaPro Equador", "Liga FUTVE", "Liga FUTVE 2", "Copa Venezuela",
  "Supercopa da UEFA", "Nations League", "Championship", "League One", "League Two", "FA Cup", "League Cup", "Community Shield", "Copa del Rey", "Supercopa da Espanha", "Coppa Italia", "Supercoppa Italiana", "DFB Pokal", "DFL-Supercup", "Coupe de France", "Trophée des Champions", "Taça de Portugal", "Eredivisie", "Jupiler Pro League", "Süper Lig", "Super League Grécia", "Super League Suíça", "Bundesliga Áustria", "Superliga Dinamarca", "Eliteserien", "Ekstraklasa", "HNL Croácia", "Premiership Escócia", "Premier Division Irlanda",
  "CONCACAF Champions Cup", "Leagues Cup", "Liga MX", "MLS", "AFC Champions League Elite", "Saudi Pro League", "J1 League", "A-League",
];

export function validateCatalog(input: { clubs: Club[]; competitions: Competition[] }) {
  const errors: string[] = [];
  input.clubs.forEach((club) => {
    if (!club.name || !club.crest) errors.push(`Clube sem nome ou escudo: ${club.id}`);
    if (!input.competitions.some((competition) => competition.id === club.leagueId)) errors.push(`Liga ausente para ${club.name}`);
  });
  return errors;
}
