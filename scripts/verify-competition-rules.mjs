import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const vite = await createServer({ root: process.cwd(), configFile: false, server: { middlewareMode: true } });
try {
  const { clubs, competitions } = await vite.ssrLoadModule("/game/catalog.ts");
  const { COUNTRY_COMPETITION_RULES, qualifiesForWorldCup, worldCupEligibilityFor, worldCupMiniGameDifficulty, worldCupParticipants, worldCupQualificationChance } = await vite.ssrLoadModule("/game/competition-rules.ts");
  const { applyAutomaticSeasonEvolution, applyFinalConsequence, baseAttributes, computeOvr, simulateSeason, superMundialEligibleClubs } = await vite.ssrLoadModule("/game/engine.ts");
  const competition = (id) => {
    const result = competitions.find((entry) => entry.id === id);
    assert(result, `Competição inexistente no regulamento: ${id}`);
    return result;
  };
  const makeState = (club) => {
    const player = { id: "verification-player", name: "Verificação", nationality: "Brasil", position: "ATA", preferredFoot: "Direito", heightCm: 180, shirtNumber: 9, age: 20, clubId: club.id, attributes: { ...baseAttributes(), finalizacao: 78, cabecada: 75, velocidade: 76, forca: 72 }, form: 70, fame: 20, salary: 16_700, marketValue: 500_000, games: 0, goals: 0, assists: 0, cleanSheets: 0, saves: 0, titles: [], awards: [], clubIdolatry: { [club.id]: 15 }, judasAt: [], injuries: 0 };
    return { seed: 17, season: 2026, player, history: [], clubHistory: [{ clubId: club.id, titles: [] }], currentCompetition: competition(club.leagueId).name, mode: "normal", balance: 0, contract: { clubId: club.id, monthlySalary: 16_700, seasonsRemaining: 3, role: "titular", expectedMinutes: 72 }, leagueAssignments: Object.fromEntries(clubs.map((entry) => [entry.id, entry.leagueId])), leagueTables: {}, shop: { ownedPermanent: [], activeSeasonal: [], freeUses: [] }, nationalTeam: { games: 0, goals: 0, assists: 0, titles: [] }, originCountry: club.country, highestOvr: computeOvr(player), clubDynamics: {}, clubHonors: {}, campaignQualifications: {}, competitionWinners: {}, campaignMiniGames: {}, recentEventIds: [], recentCardIds: [], recentMiniGameIds: [], saveVersion: 7 };
  };
  const assignmentCounts = (state, divisions) => Object.fromEntries(divisions.map((divisionId) => [divisionId, clubs.filter((club) => state.leagueAssignments[club.id] === divisionId).length]));
  const assertStablePyramid = (before, after, country, detail) => {
    const divisions = COUNTRY_COMPETITION_RULES[country].divisions;
    const expected = assignmentCounts(before, divisions);
    const actual = assignmentCounts(after, divisions);
    for (const divisionId of divisions) assert(actual[divisionId] === expected[divisionId], `${country} ${divisionId}: quantidade de clubes mudou em ${detail} (${expected[divisionId]} → ${actual[divisionId]})`);
    for (const club of clubs.filter((entry) => entry.country === country)) assert(divisions.includes(after.leagueAssignments[club.id]), `${country}: ${club.name} ficou fora da pirâmide após ${detail}`);
  };

  for (const [country, rule] of Object.entries(COUNTRY_COMPETITION_RULES)) {
    assert(competition(rule.topLeague).country === country, `${country}: liga principal fora do país`);
    for (const id of rule.divisions) assert(competition(id).country === country && competition(id).kind === "league", `${country}: divisão inválida ${id}`);
    if (rule.primaryCup) assert(competition(rule.primaryCup).country === country, `${country}: copa principal inválida`);
    for (const id of [...(rule.secondaryCups ?? []), ...(rule.supercups ?? [])]) assert(competition(id).country === country, `${country}: competição inválida ${id}`);
  }

  // Pirâmides: as movimentações são calculadas de uma vez e não podem alterar
  // o total de clubes, inclusive quando a decisão especial do jogador acontece.
  for (const country of ["Brasil", "Argentina", "Chile", "Peru", "Venezuela", "Inglaterra"]) {
    const rule = COUNTRY_COMPETITION_RULES[country];
    for (const divisionId of rule.divisions) {
      const club = clubs.find((entry) => entry.leagueId === divisionId);
      assert(club, `${country}: não há clube para testar ${divisionId}`);
      const before = makeState(club);
      const simulated = simulateSeason(before);
      const finalState = simulated.state.pendingDivisionSettlement && simulated.result.cupFinal
        ? applyFinalConsequence(simulated.state, simulated.result.cupFinal, true)
        : simulated.state;
      assertStablePyramid(before, finalState, country, `${divisionId} com vitória do jogador`);
      assert(simulated.result.leagueId === divisionId, `${country}: o resumo congelado trocou ${divisionId}`);

      if (simulated.state.pendingDivisionSettlement && simulated.result.cupFinal) {
        const lostState = applyFinalConsequence(simulated.state, simulated.result.cupFinal, false);
        assertStablePyramid(before, lostState, country, `${divisionId} com derrota do jogador`);
      }
    }
  }
  assert(clubs.filter((club) => club.leagueId === "bra-d").length === 98, "Catálogo da Série D não contém os 98 clubes cadastrados");

  const america = clubs.find((club) => club.id === "america-mg" || club.name === "América Mineiro" || club.name === "América-MG");
  assert(america, "América-MG não encontrado");
  const serieB = simulateSeason(makeState(america));
  assert(serieB.result.leagueId === "bra-b" && serieB.result.leagueName === "Brasileirão Série B", "Resumo da Série B trocou a liga disputada");
  assert(!serieB.result.campaigns?.some((campaign) => ["copa-br", "bra-super"].includes(campaign.competitionId)), "Série B entrou em copa/supercopa indevida");
  for (const row of serieB.state.leagueTables["bra-b"].entries) assert(row.points === row.wins * 3 + row.draws, "Tabela com pontos inválidos");

  const flamengo = clubs.find((club) => club.id === "flamengo");
  assert(flamengo, "Flamengo não encontrado");
  // Primeira divisão: a permanência ganha mantém a divisão; a derrota cai e
  // também preserva a quantidade de clubes nas duas divisões envolvidas.
  const weakTopDivisionState = makeState(flamengo);
  weakTopDivisionState.player.attributes = Object.fromEntries(Object.keys(weakTopDivisionState.player.attributes).map((key) => [key, 20]));
  weakTopDivisionState.player.form = 0;
  const weakTopDivision = simulateSeason(weakTopDivisionState);
  assert(weakTopDivision.result.cupFinal?.stakes === "relegation", "Lanterna da primeira divisão não recebeu Jogo da Permanência");
  const survived = applyFinalConsequence(weakTopDivision.state, weakTopDivision.result.cupFinal, true);
  assert(survived.leagueAssignments[flamengo.id] === "bra-a", "Vitória no Jogo da Permanência não manteve o clube na primeira divisão");
  assertStablePyramid(weakTopDivisionState, survived, "Brasil", "vitória no Jogo da Permanência");
  const relegated = applyFinalConsequence(weakTopDivision.state, weakTopDivision.result.cupFinal, false);
  assert(relegated.leagueAssignments[flamengo.id] === "bra-b", "Derrota no Jogo da Permanência não rebaixou o clube");
  assertStablePyramid(weakTopDivisionState, relegated, "Brasil", "derrota no Jogo da Permanência");
  const serieA = simulateSeason(makeState(flamengo));
  assert(serieA.result.campaigns?.some((campaign) => campaign.competitionId === "copa-br"), "Série A não entrou na Copa do Brasil");
  assert(!serieA.result.campaigns?.some((campaign) => campaign.competitionId === "bra-super"), "Supercopa liberada sem título anterior");
  const supercupState = makeState(flamengo);
  supercupState.season = 2027;
  supercupState.competitionWinners = { "bra-a": [{ clubId: flamengo.id, season: 2026 }] };
  const supercupSeason = simulateSeason(supercupState);
  assert(supercupSeason.result.campaigns?.some((campaign) => campaign.competitionId === "bra-super"), "Campeão não recebeu a Supercopa na temporada seguinte");
  assert(supercupSeason.result.finals?.some((final) => final.competitionId === "bra-super"), "Final da Supercopa não foi disponibilizada para minigame");
  const santos = clubs.find((club) => club.name === "Santos");
  assert(santos, "Santos não encontrado");
  const santosSeason = simulateSeason(makeState(santos));
  assert(!santosSeason.result.campaigns?.some((campaign) => campaign.competitionId === "copa-verde"), "Santos entrou indevidamente na Copa Verde");
  const goias = clubs.find((club) => club.name === "Goiás");
  assert(goias, "Goiás não encontrado");
  const goiasSeason = simulateSeason(makeState(goias));
  assert(goiasSeason.result.campaigns?.some((campaign) => campaign.competitionId === "copa-verde"), "Clube elegível de Goiás ficou fora da Copa Verde");

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

  // Copa do Mundo: potências entram sempre; Brunei não pode aparecer nem como classificado.
  assert(worldCupEligibilityFor("Brasil") === "group1" && qualifiesForWorldCup("Brasil", 2026), "Brasil deveria estar garantido na Copa do Mundo");
  assert(worldCupEligibilityFor("Equador") === "group1" && worldCupMiniGameDifficulty("Equador") === "easy", "Equador deveria ser Grupo 1 com minigame fácil");
  assert(worldCupEligibilityFor("Polônia") === "group2" && worldCupMiniGameDifficulty("Polônia") === "standard", "Polônia deveria ser Grupo 2");
  assert(worldCupEligibilityFor("Índia") === "group3" && worldCupMiniGameDifficulty("Índia") === "hard", "Índia deveria ser Grupo 3");
  assert(worldCupEligibilityFor("Brunei") === "group4" && worldCupMiniGameDifficulty("Brunei") === "veryHard", "Brunei deveria ser Grupo 4 com minigame muito difícil");
  assert(worldCupParticipants(2026).length === 48, "A Copa do Mundo deve ter exatamente 48 seleções");
  const brazilWorldCupState = makeState(flamengo);
  brazilWorldCupState.player.attributes = { ...brazilWorldCupState.player.attributes, finalizacao: 95, cabecada: 94, velocidade: 94, forca: 92, lideranca: 90, fisico: 92 };
  brazilWorldCupState.highestOvr = computeOvr(brazilWorldCupState.player);
  const brazilWorldCup = simulateSeason(brazilWorldCupState);
  assert(brazilWorldCup.result.campaigns?.some((campaign) => campaign.competitionId === "wc" && campaign.matches.length === 8), "Brasil qualificado não recebeu campanha completa de Copa do Mundo");
  assert((brazilWorldCup.result.finals ?? []).filter((final) => final.competitionId === "wc").every((final) => final.worldCupDifficulty === "easy"), "Grupo 1 não aplicou dificuldade fácil na Copa");
  const worldCampaign = brazilWorldCup.result.campaigns?.find((campaign) => campaign.competitionId === "wc");
  assert(new Set(worldCampaign.matches.map((match) => match.opponentId)).size === worldCampaign.matches.length, "Copa do Mundo repetiu adversário na mesma campanha");
  assert(worldCampaign.matches.slice(-2).every((match) => worldCupEligibilityFor(match.opponentName) === "group1"), "Semifinal/final da Copa não usaram seleções do Grupo 1");
  assert(worldCupQualificationChance("Brunei") === .02, "Brunei deveria manter 2% de chance no Grupo 4");

  // Super Mundial: campeão continental do ciclo entra; clube de divisão inferior não entra pelo ranking.
  const mundialState = makeState(flamengo);
  mundialState.season = 2029;
  mundialState.competitionWinners = { lib: [{ clubId: flamengo.id, season: 2027 }] };
  const mundialEligible = superMundialEligibleClubs(mundialState);
  assert(mundialEligible.some((club) => club.id === flamengo.id), "Campeão da Libertadores no ciclo ficou fora do Super Mundial");
  assert(!mundialEligible.some((club) => club.id === america.id), "Clube fora da primeira divisão entrou no Super Mundial");
  const mundial = simulateSeason(mundialState);
  assert(mundial.result.campaigns?.some((campaign) => campaign.competitionId === "cwc"), "Campeão continental não recebeu campanha do Super Mundial");

  // A agenda não pode despejar finais normais: no máximo duas por temporada para a elite.
  const normalFinals = (mundial.result.finals ?? []).filter((final) => final.stakes !== "campaign");
  assert(normalFinals.length <= 2, "Quantidade de finais normais acima do limite anual");

  const veteran = { ...brazilWorldCupState.player, age: 36, attributes: { ...brazilWorldCupState.player.attributes } };
  const decline = applyAutomaticSeasonEvolution(veteran, "generational", 2046, 99);
  assert(Object.values(decline.evolution?.gains ?? {}).some((value) => value < 0), "Jogador veterano não perdeu atributos após os 30");

  console.log(`OK: ${Object.keys(COUNTRY_COMPETITION_RULES).length} regulamentos; Brasil, Inglaterra, Holanda, Copa do Mundo e Super Mundial validados.`);
} finally {
  await vite.close();
}
