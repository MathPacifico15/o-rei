import type { Club, Competition } from "./types";
import { clubSnapshots } from "./data/club-snapshots";
import { verifiedClubSnapshots } from "./data/verified-club-snapshots";

const allClubSnapshots = [...clubSnapshots, ...verifiedClubSnapshots];

// This is the versioned starter catalog. A licensed import can replace crest/name fields
// without touching simulation code. Crest strings are stable asset keys, not remote URLs.
export const stateLeagueNames = ["Paulista", "Carioca", "Mineiro", "Gaúcho", "Baiano", "Pernambucano", "Cearense", "Paranaense", "Catarinense", "Goiano", "Paraense", "Amazonense", "Brasiliense", "Alagoano", "Sergipano", "Potiguar", "Paraibano", "Maranhense", "Piauiense", "Mato-grossense", "Sul-mato-grossense", "Capixaba", "Acreano", "Rondoniense", "Roraimense", "Amapaense", "Tocantinense"];

type CompetitionRow = Omit<Competition, "flag" | "selectable">;
function competitionRows(country: string, season: Competition["season"], kind: Competition["kind"], entries: Array<[string, string, number, number]>) {
  return entries.map(([id, name, tier, prestige]): CompetitionRow => ({ id, name, country, tier, kind, season, prestige }));
}

const baseCompetitions: CompetitionRow[] = [
  { id: "bra-a", name: "Brasileirão Série A", country: "Brasil", tier: 1, kind: "league", season: "calendar", prestige: 82, expectedClubCount: 20 },
  { id: "bra-b", name: "Brasileirão Série B", country: "Brasil", tier: 2, kind: "league", season: "calendar", prestige: 58, expectedClubCount: 20 },
  { id: "bra-c", name: "Brasileirão Série C", country: "Brasil", tier: 3, kind: "league", season: "calendar", prestige: 42, expectedClubCount: 20 },
  { id: "bra-d", name: "Brasileirão Série D", country: "Brasil", tier: 4, kind: "league", season: "calendar", prestige: 28, expectedClubCount: 96 },
  { id: "copa-br", name: "Copa do Brasil", country: "Brasil", tier: 1, kind: "cup", season: "calendar", prestige: 72 },
  { id: "copa-verde", name: "Copa Verde", country: "Brasil", tier: 1, kind: "cup", season: "calendar", prestige: 33 },
  { id: "lib", name: "CONMEBOL Libertadores", country: "América do Sul", tier: 1, kind: "continental", season: "calendar", prestige: 94 },
  { id: "sula", name: "CONMEBOL Sul-Americana", country: "América do Sul", tier: 1, kind: "continental", season: "calendar", prestige: 72 },
  { id: "recopa-sudamericana", name: "CONMEBOL Recopa Sudamericana", country: "América do Sul", tier: 1, kind: "continental", season: "calendar", prestige: 78 },
  { id: "arg-lp", name: "Liga Profesional", country: "Argentina", tier: 1, kind: "league", season: "calendar", prestige: 77, expectedClubCount: 30 },
  { id: "eng-pl", name: "Premier League", country: "Inglaterra", tier: 1, kind: "league", season: "european", prestige: 96, expectedClubCount: 20 },
  { id: "esp-ll", name: "LaLiga", country: "Espanha", tier: 1, kind: "league", season: "european", prestige: 94, expectedClubCount: 20 },
  { id: "ita-sa", name: "Serie A", country: "Itália", tier: 1, kind: "league", season: "european", prestige: 91, expectedClubCount: 20 },
  { id: "ger-bl", name: "Bundesliga", country: "Alemanha", tier: 1, kind: "league", season: "european", prestige: 91, expectedClubCount: 18 },
  { id: "fra-l1", name: "Ligue 1", country: "França", tier: 1, kind: "league", season: "european", prestige: 84, expectedClubCount: 18 },
  { id: "por-pl", name: "Primeira Liga", country: "Portugal", tier: 1, kind: "league", season: "european", prestige: 79, expectedClubCount: 18 },
  { id: "ucl", name: "Champions League", country: "Europa", tier: 1, kind: "continental", season: "european", prestige: 100 },
  { id: "uel", name: "Europa League", country: "Europa", tier: 1, kind: "continental", season: "european", prestige: 76 },
  { id: "uecl", name: "Conference League", country: "Europa", tier: 1, kind: "continental", season: "european", prestige: 59 },
  { id: "mex-liga", name: "Liga MX", country: "México", tier: 1, kind: "league", season: "calendar", prestige: 74, expectedClubCount: 18 },
  { id: "usa-mls", name: "MLS", country: "Estados Unidos", tier: 1, kind: "league", season: "calendar", prestige: 72, expectedClubCount: 30 },
  { id: "sau-pro", name: "Saudi Pro League", country: "Arábia Saudita", tier: 1, kind: "league", season: "calendar", prestige: 75, expectedClubCount: 18 },
  { id: "jpn-j1", name: "J1 League", country: "Japão", tier: 1, kind: "league", season: "calendar", prestige: 71, expectedClubCount: 20 },
  { id: "aus-al", name: "A-League", country: "Austrália", tier: 1, kind: "league", season: "calendar", prestige: 63, expectedClubCount: 13 },
  { id: "wc", name: "Copa do Mundo", country: "Internacional", tier: 1, kind: "international", season: "calendar", prestige: 100 },
  { id: "copa-america", name: "Copa América", country: "América do Sul", tier: 1, kind: "international", season: "calendar", prestige: 91 },
  { id: "euro", name: "Eurocopa", country: "Europa", tier: 1, kind: "international", season: "calendar", prestige: 94 },
  { id: "gold-cup", name: "Copa Ouro da CONCACAF", country: "América do Norte", tier: 1, kind: "international", season: "calendar", prestige: 77 },
  { id: "afcon", name: "Copa Africana de Nações", country: "África", tier: 1, kind: "international", season: "calendar", prestige: 82 },
  { id: "asian-cup", name: "Copa da Ásia", country: "Ásia", tier: 1, kind: "international", season: "calendar", prestige: 80 },
  { id: "ofc-nations", name: "Copa das Nações da OFC", country: "Oceania", tier: 1, kind: "international", season: "calendar", prestige: 63 },
  { id: "cwc", name: "Super Mundial de Clubes", country: "Internacional", tier: 1, kind: "international", season: "calendar", prestige: 91 },
];

const expandedCompetitions: CompetitionRow[] = [
  ...competitionRows("Brasil", "calendar", "state", stateLeagueNames.map((name, index) => [`bra-state-${index + 1}`, `Campeonato ${name}`, 1, 28] as [string, string, number, number])),
  ...competitionRows("Brasil", "calendar", "cup", [["bra-super", "Supercopa Rei", 1, 58]]),
  ...competitionRows("Argentina", "calendar", "league", [["arg-pn", "Primera Nacional", 2, 57], ["arg-pb", "Primera B", 3, 42], ["arg-pc", "Primera C", 4, 31], ["arg-fa", "Federal A", 3, 38], ["arg-pa", "Promocional Amateur", 5, 20]]),
  ...competitionRows("Argentina", "calendar", "cup", [["arg-cup", "Copa Argentina", 1, 62], ["arg-super", "Supercopa Argentina", 1, 54], ["arg-tc", "Trofeo de Campeones", 1, 49], ["arg-res", "Liga de Reserva", 1, 26]]),
  ...competitionRows("Chile", "calendar", "league", [["chi-a", "Liga de Primera", 1, 68], ["chi-b", "Primera B Chile", 2, 44], ["chi-c", "Segunda División Chile", 3, 30]]),
  ...competitionRows("Chile", "calendar", "cup", [["chi-cup", "Copa Chile", 1, 50], ["chi-lcup", "Copa de la Liga Chile", 1, 39], ["chi-super", "Supercopa Chile", 1, 45]]),
  ...competitionRows("Colômbia", "calendar", "league", [["col-a", "Primera A Colômbia", 1, 66]]),
  ...competitionRows("Colômbia", "calendar", "cup", [["col-cup", "Copa Colombia", 1, 51], ["col-super", "Superliga de Colombia", 1, 45]]),
  ...competitionRows("Uruguai", "calendar", "league", [["uru-a", "Liga AUF Uruguaya", 1, 64]]),
  ...competitionRows("Uruguai", "calendar", "cup", [["uru-cup", "Copa AUF Uruguay", 1, 49], ["uru-super", "Supercopa Uruguaya", 1, 43]]),
  ...competitionRows("Paraguai", "calendar", "league", [["par-a", "Copa de Primera", 1, 63]]),
  ...competitionRows("Paraguai", "calendar", "cup", [["par-cup", "Copa Paraguay", 1, 47], ["par-super", "Supercopa Paraguay", 1, 42]]),
  ...competitionRows("Peru", "calendar", "league", [["per-a", "Liga 1 Peruana", 1, 58], ["per-b", "Liga 2 Peruana", 2, 38]]),
  ...competitionRows("Peru", "calendar", "cup", [["per-cup", "Copa de la Liga Peruana", 1, 34]]),
  ...competitionRows("Bolívia", "calendar", "league", [["bol-a", "División Profesional Bolívia", 1, 57]]),
  ...competitionRows("Equador", "calendar", "league", [["ecu-a", "LigaPro Equador", 1, 60]]),
  ...competitionRows("Equador", "calendar", "cup", [["ecu-cup", "Copa Ecuador", 1, 48], ["ecu-super", "Supercopa Ecuador", 1, 43]]),
  ...competitionRows("Venezuela", "calendar", "league", [["ven-a", "Liga FUTVE", 1, 53], ["ven-b", "Liga FUTVE 2", 2, 34]]),
  ...competitionRows("Venezuela", "calendar", "cup", [["ven-cup", "Copa Venezuela", 1, 35], ["ven-super", "Supercopa de Venezuela", 1, 38]]),
  ...competitionRows("Europa", "european", "continental", [["uefa-super", "Supercopa da UEFA", 1, 76], ["nations", "Nations League", 1, 73]]),
  ...competitionRows("Inglaterra", "european", "league", [["eng-c", "Championship", 2, 67], ["eng-l1", "League One", 3, 49], ["eng-l2", "League Two", 4, 37]]),
  ...competitionRows("Inglaterra", "european", "cup", [["eng-fa", "FA Cup", 1, 73], ["eng-lcup", "League Cup", 1, 58], ["eng-cs", "Community Shield", 1, 47]]),
  ...competitionRows("Espanha", "european", "cup", [["esp-cup", "Copa del Rey", 1, 72], ["esp-super", "Supercopa de España", 1, 57]]),
  ...competitionRows("Itália", "european", "cup", [["ita-cup", "Coppa Italia", 1, 70], ["ita-super", "Supercoppa Italiana", 1, 56]]),
  ...competitionRows("Alemanha", "european", "cup", [["ger-cup", "DFB-Pokal", 1, 70], ["ger-super", "Franz Beckenbauer Supercup", 1, 54]]),
  ...competitionRows("França", "european", "cup", [["fra-cup", "Coupe de France", 1, 66], ["fra-super", "Trophée des Champions", 1, 48]]),
  ...competitionRows("Portugal", "european", "cup", [["por-cup", "Taça de Portugal", 1, 65], ["por-super", "Supertaça Cândido de Oliveira", 1, 52]]),
  ...competitionRows("Holanda", "european", "league", [["ned-a", "Eredivisie", 1, 76]]),
  ...competitionRows("Holanda", "european", "cup", [["ned-cup", "KNVB Beker", 1, 65], ["ned-super", "Johan Cruijff Schaal", 1, 50]]),
  ...competitionRows("Bélgica", "european", "league", [["bel-a", "Jupiler Pro League", 1, 70]]),
  ...competitionRows("Bélgica", "european", "cup", [["bel-cup", "Beker van België / Coupe de Belgique", 1, 59], ["bel-super", "Supercup / Supercoupe de Belgique", 1, 48]]),
  ...competitionRows("Turquia", "european", "league", [["tur-a", "Süper Lig", 1, 73]]),
  ...competitionRows("Turquia", "european", "cup", [["tur-cup", "Türkiye Kupası", 1, 61], ["tur-super", "Süper Kupa", 1, 49]]),
  ...competitionRows("Grécia", "european", "league", [["gre-a", "Super League Grécia", 1, 59]]),
  ...competitionRows("Grécia", "european", "cup", [["gre-cup", "Κύπελλο Ελλάδας", 1, 52], ["gre-super", "Greek Super Cup", 1, 43]]),
  ...competitionRows("Suíça", "european", "league", [["sui-a", "Super League Suíça", 1, 61]]),
  ...competitionRows("Suíça", "european", "cup", [["sui-cup", "Schweizer Cup", 1, 53]]),
  ...competitionRows("Áustria", "european", "league", [["aut-a", "Bundesliga Áustria", 1, 60]]),
  ...competitionRows("Áustria", "european", "cup", [["aut-cup", "ÖFB-Cup", 1, 53]]),
  ...competitionRows("Dinamarca", "european", "league", [["den-a", "Superliga Dinamarca", 1, 63]]),
  ...competitionRows("Dinamarca", "european", "cup", [["den-cup", "DBU Pokalen", 1, 54]]),
  ...competitionRows("Noruega", "calendar", "league", [["nor-a", "Eliteserien", 1, 60]]),
  ...competitionRows("Noruega", "calendar", "cup", [["nor-cup", "NM Cup", 1, 52]]),
  ...competitionRows("Polônia", "european", "league", [["pol-a", "Ekstraklasa", 1, 59]]),
  ...competitionRows("Polônia", "european", "cup", [["pol-cup", "Puchar Polski", 1, 52], ["pol-super", "Superpuchar Polski", 1, 44]]),
  ...competitionRows("Croácia", "european", "league", [["cro-a", "HNL Croácia", 1, 55]]),
  ...competitionRows("Croácia", "european", "cup", [["cro-cup", "Hrvatski nogometni kup", 1, 50], ["cro-super", "Hrvatski nogometni superkup", 1, 43]]),
  ...competitionRows("Escócia", "european", "league", [["sco-a", "Premiership Escócia", 1, 62]]),
  ...competitionRows("Escócia", "european", "cup", [["sco-cup", "Scottish Cup", 1, 58]]),
  ...competitionRows("Irlanda", "calendar", "league", [["irl-a", "Premier Division Irlanda", 1, 48]]),
  ...competitionRows("Irlanda", "calendar", "cup", [["irl-cup", "FAI Cup", 1, 45], ["irl-cs", "President’s Cup", 1, 37]]),
  ...competitionRows("América do Norte", "calendar", "continental", [["concacaf", "CONCACAF Champions Cup", 1, 70]]),
  ...competitionRows("América do Norte", "calendar", "cup", [["leagues-cup", "Leagues Cup", 1, 55]]),
  ...competitionRows("Estados Unidos", "calendar", "cup", [["usa-open", "Lamar Hunt U.S. Open Cup", 1, 52]]),
  ...competitionRows("Ásia", "calendar", "continental", [["afc-cl", "AFC Champions League Elite", 1, 75]]),
  ...competitionRows("Arábia Saudita", "calendar", "cup", [["sau-cup", "كأس خادم الحرمين الشريفين", 1, 61], ["sau-super", "كأس السوبر السعودي", 1, 51]]),
  ...competitionRows("Japão", "calendar", "cup", [["jpn-cup", "天皇杯", 1, 60], ["jpn-super", "FUJIFILM SUPER CUP", 1, 49]]),
  ...competitionRows("Austrália", "calendar", "cup", [["aus-cup", "Australia Cup", 1, 50]]),
];

/** Country flag belongs to the competition, never to an individual club card. */
const countryFlags: Record<string, string> = {
  "Brasil": "🇧🇷", "Argentina": "🇦🇷", "América do Sul": "🌎", "Europa": "🇪🇺",
  "Inglaterra": "🏴", "Espanha": "🇪🇸", "Itália": "🇮🇹", "Alemanha": "🇩🇪", "França": "🇫🇷", "Portugal": "🇵🇹",
  "México": "🇲🇽", "Estados Unidos": "🇺🇸", "Arábia Saudita": "🇸🇦", "Japão": "🇯🇵", "Austrália": "🇦🇺", "Internacional": "🌐",
  "Chile": "🇨🇱", "Colômbia": "🇨🇴", "Uruguai": "🇺🇾", "Paraguai": "🇵🇾", "Peru": "🇵🇪", "Bolívia": "🇧🇴", "Equador": "🇪🇨", "Venezuela": "🇻🇪",
  "Holanda": "🇳🇱", "Bélgica": "🇧🇪", "Turquia": "🇹🇷", "Grécia": "🇬🇷", "Suíça": "🇨🇭", "Áustria": "🇦🇹", "Dinamarca": "🇩🇰", "Noruega": "🇳🇴", "Polônia": "🇵🇱", "Croácia": "🇭🇷", "Escócia": "🏴", "Irlanda": "🇮🇪",
  "América do Norte": "🌎", "Ásia": "🌏",
};

export const competitions: Competition[] = [...baseCompetitions, ...expandedCompetitions].map((competition) => ({
  ...competition,
  // A participant snapshot is authoritative for its imported edition. This keeps
  // rule changes (such as Brazil's 96-club Série D) from silently using old totals.
  expectedClubCount: allClubSnapshots.find((snapshot) => snapshot.competitionId === competition.id)?.clubs.length ?? competition.expectedClubCount,
  flag: countryFlags[competition.country] ?? "🏳️",
  // Estaduais fazem parte da temporada, como uma copa. Eles não são uma
  // "liga de início": o atleta sempre assina por uma divisão nacional.
  selectable: competition.kind === "league",
}));

export const catalogEdition = {
  id: "2026.1",
  label: "Temporada 2026 (calendário anual) / 2026–27 (Europa)",
  scope: "participantes reais importados; sem elencos individuais",
} as const;

const featuredClubs: Club[] = [
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
  { id: "sport", name: "Sport", country: "Brasil", leagueId: "bra-a", crest: "sport", strength: 68, reputation: 77, budget: 54, style: "pressao", rivals: ["nautico", "santa-cruz"] },
  { id: "coritiba", name: "Coritiba", country: "Brasil", leagueId: "bra-b", crest: "coritiba", strength: 66, reputation: 78, budget: 52, style: "posse", rivals: ["athletico"] },
  { id: "america-mg", name: "América-MG", country: "Brasil", leagueId: "bra-b", crest: "america-mg", strength: 65, reputation: 70, budget: 45, style: "vertical", rivals: ["atletico-mg", "cruzeiro"] },
  { id: "ponte-preta", name: "Ponte Preta", country: "Brasil", leagueId: "bra-c", crest: "ponte-preta", strength: 57, reputation: 72, budget: 31, style: "defensivo", rivals: ["guarani"] },
  { id: "remo", name: "Remo", country: "Brasil", leagueId: "bra-b", crest: "remo", strength: 58, reputation: 70, budget: 32, style: "pressao", rivals: ["paysandu"] },
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

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Minimal club metadata for the catalogue. This deliberately contains no player roster.
 * Exact strength, rivalries and licensed crest assets can be overlaid by an import pack.
 */
function roster(leagueId: string, country: string, names: string[]): Club[] {
  return names.map((name, index) => ({
    id: `${leagueId}-${slug(name)}`,
    name,
    country,
    leagueId,
    crest: `club-${leagueId}-${slug(name)}`,
    strength: Math.max(42, 72 - index),
    reputation: Math.max(40, 70 - index),
    budget: Math.max(15, 55 - index),
    style: index % 4 === 0 ? "posse" : index % 4 === 1 ? "vertical" : index % 4 === 2 ? "pressao" : "defensivo",
    rivals: [],
  }));
}

const manuallyMaintainedRosterClubs: Club[] = [
  // Brasil 2025 — todos os participantes das quatro séries nacionais.
  ...roster("bra-a", "Brasil", ["Atlético-MG", "Bahia", "Botafogo", "Ceará", "Corinthians", "Cruzeiro", "Flamengo", "Fluminense", "Fortaleza", "Grêmio", "Internacional", "Juventude", "Mirassol", "Palmeiras", "Bragantino", "Santos", "São Paulo", "Sport", "Vasco da Gama", "Vitória"]),
  ...roster("bra-b", "Brasil", ["América-MG", "Amazonas", "Athletic", "Athletico-PR", "Atlético-GO", "Avaí", "Botafogo-SP", "Chapecoense", "CRB", "Criciúma", "Coritiba", "Cuiabá", "Ferroviária", "Goiás", "Novorizontino", "Operário-PR", "Paysandu", "Remo", "Vila Nova", "Volta Redonda"]),
  // Série C 2026: a lista anterior, da edição de 2025, foi substituída.
  ...roster("bra-c", "Brasil", ["Amazonas", "Anápolis", "Barra-SC", "Botafogo-PB", "Brusque", "Caxias", "Confiança", "Ferroviária", "Figueirense", "Floresta", "Guarani", "Inter de Limeira", "Itabaiana", "Ituano", "Maranhão", "Maringá", "Paysandu", "Santa Cruz", "Volta Redonda", "Ypiranga-RS"]),
  // Série D 2026: os 96 participantes divulgados pela CBF, nos 16 grupos de seis.
  ...roster("bra-d", "Brasil", ["Nacional-AM", "Manaus", "Manauara", "GAS", "Monte Roraima", "São Raimundo-RR", "Independência-AC", "Galvez", "Humaitá", "Porto Velho", "Guaporé", "Araguaína", "Gama", "Brasiliense", "Luverdense", "Primavera-MT", "Inhumas", "Aparecidense", "Capital-DF", "Ceilândia", "Mixto-MT", "Operário-MT", "União-MT", "Goiatuba", "Trem", "Oratório", "Tuna Luso", "Águia de Marabá", "Tocantinópolis", "Imperatriz", "Sampaio Corrêa-MA", "Moto Club", "IAPE", "Maracanã", "Iguatu", "Parnahyba", "Ferroviário", "Tirol", "Atlético-CE", "Altos", "Piauí", "Fluminense-PI", "ABC", "América-RN", "Laguna", "Sousa", "Maguary", "Central", "Retrô", "Decisão", "Serra Branca", "Treze", "Lagarto", "Sergipe", "ASA", "CSA", "CSE", "Jacuipense", "Atlético-BA", "Juazeirense", "Uberlândia", "Betim", "CRAC", "ABECAT", "Operário-MS", "Ivinhema", "Porto-BA", "Rio Branco-ES", "Vitória-ES", "Real Noroeste", "Tombense", "Democrata-GV", "Madureira", "Portuguesa-RJ", "America-RJ", "Portuguesa-SP", "Água Santa", "Pouso Alegre", "Nova Iguaçu", "Sampaio Corrêa-RJ", "Maricá", "XV de Piracicaba", "Noroeste", "Velo Clube", "Cianorte", "FC Cascavel", "Santa Catarina", "Joinville", "Guarany de Bagé", "São Luiz", "Blumenau", "Marcílio Dias", "São Joseense", "Azuriz", "São José-RS", "Brasil de Pelotas"]),
  ...roster("arg-lp", "Argentina", ["Aldosivi", "Argentinos Juniors", "Atlético Tucumán", "Banfield", "Barracas Central", "Belgrano", "Boca Juniors", "Central Córdoba", "Defensa y Justicia", "Deportivo Riestra", "Estudiantes", "Gimnasia La Plata", "Godoy Cruz", "Huracán", "Independiente", "Independiente Rivadavia", "Instituto", "Lanús", "Newell's Old Boys", "Platense", "Racing Club", "River Plate", "Rosario Central", "San Lorenzo", "San Martín de San Juan", "Sarmiento", "Talleres", "Tigre", "Unión", "Vélez Sarsfield"]),
  ...roster("eng-pl", "Inglaterra", ["Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton & Hove Albion", "Burnley", "Chelsea", "Crystal Palace", "Everton", "Fulham", "Leeds United", "Liverpool", "Manchester City", "Manchester United", "Newcastle United", "Nottingham Forest", "Sunderland", "Tottenham Hotspur", "West Ham United", "Wolverhampton Wanderers"]),
  ...roster("esp-ll", "Espanha", ["Alavés", "Athletic Club", "Atlético de Madrid", "Barcelona", "Celta de Vigo", "Elche", "Espanyol", "Getafe", "Girona", "Levante", "Mallorca", "Osasuna", "Rayo Vallecano", "Real Betis", "Real Madrid", "Real Oviedo", "Real Sociedad", "Sevilla", "Valencia", "Villarreal"]),
  ...roster("ita-sa", "Itália", ["Atalanta", "Bologna", "Cagliari", "Como", "Cremonese", "Fiorentina", "Genoa", "Hellas Verona", "Internazionale", "Juventus", "Lazio", "Lecce", "Milan", "Napoli", "Parma", "Pisa", "Roma", "Sassuolo", "Torino", "Udinese"]),
  ...roster("ger-bl", "Alemanha", ["Augsburg", "Bayern München", "Bayer Leverkusen", "Borussia Dortmund", "Borussia Mönchengladbach", "Eintracht Frankfurt", "FC Köln", "Freiburg", "Hamburgo", "Heidenheim", "Hoffenheim", "Mainz 05", "RB Leipzig", "St. Pauli", "Stuttgart", "Union Berlin", "Werder Bremen", "Wolfsburg"]),
  ...roster("fra-l1", "França", ["Angers", "Auxerre", "Brest", "Le Havre", "Lens", "Lille", "Lorient", "Lyon", "Olympique de Marseille", "Metz", "Monaco", "Nantes", "Nice", "Paris FC", "Paris Saint-Germain", "Rennes", "Strasbourg", "Toulouse"]),
  ...roster("por-pl", "Portugal", ["Alverca", "Arouca", "AVS", "Benfica", "Braga", "Casa Pia", "Estoril", "Estrela da Amadora", "Famalicão", "Gil Vicente", "Moreirense", "Nacional", "Porto", "Rio Ave", "Santa Clara", "Sporting", "Tondela", "Vitória SC"]),
  ...roster("mex-liga", "México", ["Club América", "Atlas", "Atlético San Luis", "Cruz Azul", "Guadalajara", "Juárez", "León", "Mazatlán", "Monterrey", "Necaxa", "Pachuca", "Puebla", "Pumas UNAM", "Querétaro", "Santos Laguna", "Tijuana", "Toluca", "Tigres UANL"]),
  ...roster("usa-mls", "Estados Unidos", ["Atlanta United", "Austin FC", "Charlotte FC", "Chicago Fire", "FC Cincinnati", "Colorado Rapids", "Columbus Crew", "FC Dallas", "D.C. United", "Houston Dynamo", "Inter Miami", "LA Galaxy", "Los Angeles FC", "Minnesota United", "CF Montréal", "Nashville SC", "New England Revolution", "New York City FC", "New York Red Bulls", "Orlando City", "Philadelphia Union", "Portland Timbers", "Real Salt Lake", "San Diego FC", "San Jose Earthquakes", "Seattle Sounders", "Sporting Kansas City", "St. Louis City", "Toronto FC", "Vancouver Whitecaps"]),
  ...roster("sau-pro", "Arábia Saudita", ["Al-Ahli", "Al-Ettifaq", "Al-Fateh", "Al-Fayha", "Al-Hazem", "Al-Hilal", "Al-Ittihad", "Al-Khaleej", "Al-Najma", "Al-Nassr", "Al-Okhdood", "Al-Qadsiah", "Al-Riyadh", "Al-Shabab", "Al-Taawoun", "Al-Wehda", "Damac", "NEOM"]),
  ...roster("jpn-j1", "Japão", ["Albirex Niigata", "Avispa Fukuoka", "Cerezo Osaka", "FC Machida Zelvia", "FC Tokyo", "Gamba Osaka", "Kashima Antlers", "Kashiwa Reysol", "Kawasaki Frontale", "Kyoto Sanga", "Nagoya Grampus", "Fagiano Okayama", "Sanfrecce Hiroshima", "Shimizu S-Pulse", "Shonan Bellmare", "Tokyo Verdy", "Urawa Reds", "Vissel Kobe", "Yokohama F. Marinos", "Yokohama FC"]),
  ...roster("aus-al", "Austrália", ["Adelaide United", "Auckland FC", "Brisbane Roar", "Central Coast Mariners", "Macarthur FC", "Melbourne City", "Melbourne Victory", "Newcastle Jets", "Perth Glory", "Sydney FC", "Wellington Phoenix", "Western Sydney Wanderers", "Western United"]),
];

const sourcedCompetitionIds = new Set<string>(allClubSnapshots.map((snapshot) => snapshot.competitionId));
const sourcedRosterClubs = allClubSnapshots.flatMap((snapshot) => roster(snapshot.competitionId, snapshot.country, [...snapshot.clubs]));
// Never merge an older hand list into a competition with a current snapshot.
// This avoids leaving a relegated club selectable beside the real participants.
const rosterClubs = [
  ...manuallyMaintainedRosterClubs.filter((club) => !sourcedCompetitionIds.has(club.leagueId)),
  ...sourcedRosterClubs,
];

/** Keep featured metadata (rivalries/strength) while completing the fixed roster list. */
const currentFeaturedClubs = featuredClubs.filter((club) => !sourcedCompetitionIds.has(club.leagueId) || rosterClubs.some((candidate) => candidate.leagueId === club.leagueId && candidate.name === club.name));

// Nos estaduais entram apenas clubes que também jogam uma Série nacional A–D
// em 2026. Isso evita inventar participantes locais sem divisão nacional.
const stateMemberships: Record<string, string[]> = {
  "bra-state-1": ["Corinthians", "Mirassol", "Palmeiras", "Red Bull Bragantino", "Santos", "São Paulo", "Botafogo-SP", "Novorizontino", "Ponte Preta", "São Bernardo", "Ferroviária", "Guarani", "Inter de Limeira", "Ituano", "Portuguesa-SP", "Água Santa", "XV de Piracicaba", "Noroeste", "Velo Clube"],
  "bra-state-2": ["Botafogo", "Flamengo", "Fluminense", "Vasco da Gama", "Volta Redonda", "Madureira", "Portuguesa-RJ", "America-RJ", "Nova Iguaçu", "Sampaio Corrêa-RJ", "Maricá"],
  "bra-state-3": ["Atlético-MG", "Cruzeiro", "América Mineiro", "Athletic", "Uberlândia", "Betim", "Pouso Alegre", "Tombense", "Democrata-GV"],
  "bra-state-4": ["Grêmio", "Internacional", "Juventude", "Caxias", "Ypiranga-RS", "Brasil de Pelotas", "Guarany de Bagé", "São José-RS", "São Luiz"],
  "bra-state-5": ["Bahia", "Vitória", "Atlético-BA", "Juazeirense", "Porto-BA", "Jacuipense"],
  "bra-state-6": ["Sport", "Náutico", "Retrô", "Santa Cruz", "Central", "Maguary", "Decisão"],
  "bra-state-7": ["Ceará", "Fortaleza", "Ferroviário", "Floresta", "Maracanã", "Iguatu", "Tirol", "Atlético-CE"],
  "bra-state-8": ["Athletico-PR", "Coritiba", "Operário PR", "Londrina", "Maringá", "Cianorte", "FC Cascavel", "São Joseense", "Azuriz"],
  "bra-state-9": ["Chapecoense", "Criciúma", "Avaí", "Barra-SC", "Brusque", "Figueirense", "Santa Catarina", "Joinville", "Blumenau", "Marcílio Dias"],
  "bra-state-10": ["Atlético Goianiense", "Goiás", "Vila Nova", "Anápolis", "Aparecidense", "Goiatuba", "CRAC", "ABECAT", "Inhumas"],
  "bra-state-11": ["Remo", "Paysandu", "Águia de Marabá", "Tuna Luso"], "bra-state-12": ["Amazonas", "Nacional-AM", "Manaus", "Manauara"],
  "bra-state-13": ["Gama", "Brasiliense", "Capital-DF", "Ceilândia"], "bra-state-14": ["CRB", "CSA", "ASA", "CSE"],
  "bra-state-15": ["Confiança", "Itabaiana", "Lagarto", "Sergipe"], "bra-state-16": ["ABC", "América-RN", "Laguna"],
  "bra-state-17": ["Botafogo-PB", "Sousa", "Treze", "Serra Branca"], "bra-state-18": ["Maranhão", "Sampaio Corrêa-MA", "Moto Club", "IAPE", "Imperatriz"],
  "bra-state-19": ["Altos", "Parnahyba", "Piauí", "Fluminense-PI"], "bra-state-20": ["Cuiabá", "Luverdense", "Primavera-MT", "Mixto-MT", "Operário-MT", "União-MT"],
  "bra-state-21": ["Operário-MS", "Ivinhema"], "bra-state-22": ["Rio Branco-ES", "Vitória-ES", "Real Noroeste"],
  "bra-state-23": ["Independência-AC", "Galvez", "Humaitá"], "bra-state-24": ["Porto Velho", "Guaporé"],
  "bra-state-25": ["GAS", "Monte Roraima", "São Raimundo-RR"], "bra-state-26": ["Trem", "Oratório"], "bra-state-27": ["Araguaína", "Tocantinópolis"],
};

function clubCompetitions(club: Club) {
  return [club.leagueId, ...Object.entries(stateMemberships).filter(([, names]) => names.includes(club.name)).map(([competitionId]) => competitionId)];
}

export const clubs: Club[] = [...new Map([...rosterClubs, ...currentFeaturedClubs].map((club) => [`${club.leagueId}:${club.name}`, club])).values()]
  .map((club) => ({ ...club, competitionIds: clubCompetitions(club) }));

export function clubCompetesIn(club: Club, competitionId: string) {
  return club.leagueId === competitionId || club.competitionIds?.includes(competitionId) === true;
}

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
  const ids = new Set<string>();
  input.clubs.forEach((club) => {
    if (ids.has(club.id)) errors.push(`ID de clube duplicado: ${club.id}`);
    ids.add(club.id);
    if (!club.name || !club.crest) errors.push(`Clube sem nome ou escudo: ${club.id}`);
    if (!input.competitions.some((competition) => competition.id === club.leagueId)) errors.push(`Liga ausente para ${club.name}`);
  });
  input.competitions.filter((competition) => competition.selectable).forEach((competition) => {
    if (!competition.flag) errors.push(`Bandeira ausente para ${competition.name}`);
    const actual = input.clubs.filter((club) => clubCompetesIn(club, competition.id)).length;
    if (competition.expectedClubCount !== undefined && actual !== competition.expectedClubCount) {
      errors.push(`${competition.name}: esperado ${competition.expectedClubCount} clubes, encontrados ${actual}`);
    }
    if (!actual) errors.push(`${competition.name}: participantes reais ainda não importados`);
  });
  Object.entries(stateMemberships).forEach(([competitionId, names]) => {
    if (!input.competitions.some((competition) => competition.id === competitionId)) {
      errors.push(`Estadual inexistente no vínculo de clubes: ${competitionId}`);
    }
    names.forEach((name) => {
      if (!input.clubs.some((club) => club.name === name)) {
        errors.push(`${competitionId}: clube nacional não localizado: ${name}`);
      }
    });
  });
  return errors;
}
