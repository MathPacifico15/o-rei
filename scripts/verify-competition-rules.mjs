import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const vite = await createServer({ root: process.cwd(), configFile: false, server: { middlewareMode: true } });
try {
  const { clubs, competitions } = await vite.ssrLoadModule("/game/catalog.ts");
  const { COUNTRY_COMPETITION_RULES } = await vite.ssrLoadModule("/game/competition-rules.ts");
  const { baseAttributes, computeOvr, simulateSeason } = await vite.ssrLoadModule("/game/engine.ts");
  const competition = (id) => {
    const result = competitions.find((entry) => entry.id === id);
    assert(result, `Competição inexistente no regulamento: ${id}`);
    return result;
  };
  const makeState = (club) => {
    const player = { id: "verification-player", name: "Verificação", nationality: "Brasil", position: "ATA", preferredFoot: "Direito", heightCm: 180, shirtNumber: 9, age: 20, clubId: club.id, attributes: { ...baseAttributes(), finalizacao: 78, cabecada: 75, velocidade: 76, forca: 72 }, form: 70, fame: 20, salary: 16_700, marketValue: 500_000, games: 0, goals: 0, assists: 0, cleanSheets: 0, saves: 0, titles: [], awards: [], clubIdolatry: { [club.id]: 15 }, judasAt: [], injuries: 0 };
    return { seed: 17, season: 2026, player, history: [], clubHistory: [{ clubId: club.id, titles: [] }], currentCompetition: competition(club.leagueId).name, mode: "normal", balance: 0, contract: { clubId: club.id, monthlySalary: 16_700, seasonsRemaining: 3, role: "titular", expectedMinutes: 72 }, leagueAssignments: Object.fromEntries(clubs.map((entry) => [entry.id, entry.leagueId])), leagueTables: {}, shop: { ownedPermanent: [], activeSeasonal: [], freeUses: [] }, nationalTeam: { games: 0, goals: 0, assists: 0, titles: [] }, originCountry: club.country, highestOvr: computeOvr(player), clubDynamics: {}, clubHonors: {}, campaignQualifications: {}, competitionWinners: {}, campaignMiniGames: {}, recentEventIds: [], recentCardIds: [], recentMiniGameIds: [], saveVersion: 7 };
  };

  for (const [country, rule] of Object.entries(COUNTRY_COMPETITION_RULES)) {
    assert(competition(rule.topLeague).country === country, `${country}: liga principal fora do país`);
    for (const id of rule.divisions) assert(competition(id).country === country && competition(id).kind === "league", `${country}: divisão inválida ${id}`);
    if (rule.primaryCup) assert(competition(rule.primaryCup).country === country, `${country}: copa principal inválida`);
    for (const id of [...(rule.secondaryCups ?? []), ...(rule.supercups ?? [])]) assert(competition(id).country === country, `${country}: competição inválida ${id}`);
  }

  const america = clubs.find((club) => club.id === "america-mg" || club.name === "América Mineiro" || club.name === "América-MG");
  assert(america, "América-MG não encontrado");
  const serieB = simulateSeason(makeState(america));
  assert(!serieB.result.campaigns?.some((campaign) => ["copa-br", "bra-super"].includes(campaign.competitionId)), "Série B entrou em copa/supercopa indevida");
  for (const row of serieB.state.leagueTables["bra-b"].entries) assert(row.points === row.wins * 3 + row.draws, "Tabela com pontos inválidos");

  const flamengo = clubs.find((club) => club.id === "flamengo");
  assert(flamengo, "Flamengo não encontrado");
  const serieA = simulateSeason(makeState(flamengo));
  assert(serieA.result.campaigns?.some((campaign) => campaign.competitionId === "copa-br"), "Série A não entrou na Copa do Brasil");
  assert(!serieA.result.campaigns?.some((campaign) => campaign.competitionId === "bra-super"), "Supercopa liberada sem título anterior");

  // Inglaterra e Holanda: mesmas garantias, sem regras exclusivas do Brasil.
  const championshipClub = clubs.find((club) => club.leagueId === "eng-c");
  assert(championshipClub, "Clube da Championship não encontrado");
  const championship = simulateSeason(makeState(championshipClub));
  assert(!championship.result.campaigns?.some((campaign) => ["eng-fa", "eng-cs"].includes(campaign.competitionId)), "Championship entrou em copa/supercopa inglesa indevida");

  const dutchClub = clubs.find((club) => club.leagueId === "ned-a");
  assert(dutchClub, "Clube da Eredivisie não encontrado");
  const netherlands = simulateSeason(makeState(dutchClub));
  assert(netherlands.result.campaigns?.some((campaign) => campaign.competitionId === "ned-cup"), "Eredivisie não entrou na copa holandesa");
  assert(!netherlands.result.campaigns?.some((campaign) => campaign.competitionId === "ned-super"), "Supercopa holandesa liberada sem título anterior");

  console.log(`OK: ${Object.keys(COUNTRY_COMPETITION_RULES).length} regulamentos; cenários de Brasil, Inglaterra e Holanda validados.`);
} finally {
  await vite.close();
}
