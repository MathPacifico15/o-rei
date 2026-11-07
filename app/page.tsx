"use client";
import { selectDecisionGame, rememberDecisionGame, decisionAttemptKey, cardHandSeed, canRedrawCards, redrawCards, playStyleLabels, type PlayStyle } from "@/game/decision-selection";
import type { ChallengeContext } from "@/game/minigame-engine";
import "./game-features.css";
import { MiniGameArena } from "@/components/minigame-arena";
import { CareerRetrospective } from "@/components/career-retrospective";
import { acceptRenewal, negotiateOffer, rememberClubMilestones } from "@/game/career-history";
import { cappedSalary, initialSalary, renewalSalary } from "@/game/salary";
import "./career-polish.css";
import { CareerShop } from "@/components/career-shop";

import "./minigames.css";
import "./final-tweaks.css";
import "./rea-maggio.css";
import "./motion.css";
import "./premium-system.css";
import "./interaction-motion.css";
import "./home-navigation.css";
import "./micro-details.css";
import "./performance-accessibility.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applyCard, applyCareerCard, applyFinalConsequence, applySeasonEvolution, baseAttributes, chooseUpgradeCards, clubCompetesIn, clubs, competitions, computeOvr, countries, createMarketWindow, prepareMarketWindow, difficultyForFinal, generationalAttributes, legacy, miniGameForFinal, miniGameForSeed, minigames, mulberry32, positionAttributeKeys, resolveWorldMatch, shouldRetire, simulateSeason, supabaseCareer, worldMatchDifficulty, type CareerEvent, type CareerState, type Club, type EvolutionFocus, type MiniGameDefinition, type MiniGameId, type Player, type Position, type SeasonEvolution, type SeasonResult, type UpgradeCard } from "@/game";

import { readSave, writeSave, decodeSave, BACKUP_KEY } from "@/game/persistence";

type Screen = "home" | "create" | "career" | "evolution" | "event" | "shop" | "celebration" | "legacy" | "account" | "sync";
type CloudSession = { userId: string; token: string; email?: string };
const CLOUD_SESSION_KEY = "o-rei:supabase-session";
type Celebration = { title: string; access?: string };
const positions: Array<{ id: Position; label: string }> = [
  { id: "GOL", label: "Goleiro" },
  { id: "MEI", label: "Meia · Camisa 10" },
  { id: "ATA", label: "Atacante · Camisa 9" },
];
const attributeLabels: Record<string, string> = { reflexo: "Reflexo", elasticidade: "Elasticidade", posicionamento: "Posicionamento", saida: "Saída", lideranca: "Liderança", fisico: "Físico", velocidade: "Velocidade", passe: "Passe", finalizacao: "Finalização", drible: "Drible", cabecada: "Cabeçada", forca: "Força" };
const LOCAL_RANKING_KEY = "o-rei-local-ranking";
const CAREER_SUMMARY_RESET_KEY = "o-rei:career-live-reset:v6";
type LocalRankingEntry = { playerId: string; name: string; nationality: string; position: Position; clubName: string; score: number; global: string; titles: number; games: number; retiredAt: string; };

function readLocalRanking(): LocalRankingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_RANKING_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((entry): entry is LocalRankingEntry => typeof entry?.score === "number" && typeof entry?.name === "string").slice(0, 10) : [];
  } catch { return []; }
}

function saveLocalRanking(career: CareerState, club: Club) {
  const result = legacy(career.player);
  const entry: LocalRankingEntry = {
    playerId: career.player.id, name: career.player.name, nationality: career.player.nationality, position: career.player.position,
    clubName: club.name, score: result.score, global: result.global, titles: career.player.titles.length, games: career.player.games,
    retiredAt: new Date().toISOString()
  };
  const ranking = [...readLocalRanking().filter((saved) => saved.playerId !== entry.playerId), entry]
    .sort((a, b) => b.score - a.score || b.titles - a.titles || b.games - a.games)
    .slice(0, 10);
  localStorage.setItem(LOCAL_RANKING_KEY, JSON.stringify(ranking));
  return ranking;
}

function addClubTitle(career: CareerState, title: string): CareerState {
  const clubHistory = (career.clubHistory ?? []).map((entry) => ({ ...entry, titles: [...entry.titles] }));
  let clubRecord = clubHistory.find((entry) => entry.clubId === career.player.clubId);
  if (!clubRecord) { clubRecord = { clubId: career.player.clubId, titles: [] }; clubHistory.push(clubRecord); }
  clubRecord.titles.push(title);
  return { ...career, clubHistory };
}

function eventConsequence(event: CareerEvent, choice: CareerEvent["choices"][number]) {
  const reactions: string[] = [];
  if ((choice.fame ?? 0) > 0) reactions.push("a imprensa recebeu bem sua postura");
  if ((choice.idolatry ?? 0) > 0) reactions.push("a torcida se aproximou ainda mais de você");
  if ((choice.form ?? 0) > 0) reactions.push("você terminou a situação com confiança");
  if ((choice.fame ?? 0) < 0) reactions.push("sua exposição diminuiu um pouco");
  if ((choice.form ?? 0) < 0) reactions.push("a preparação perdeu um pouco de ritmo");
  if ((choice.idolatry ?? 0) < 0) reactions.push("parte da torcida ficou contrariada");
  if ((choice.injuryWeeks ?? 0) > 0) reactions.push("o desgaste ficou como alerta para a próxima temporada");
  return `${event.title}: você escolheu “${choice.label}”. ${reactions.length ? `${reactions.join(" e ")}.` : "A decisão entrou para a memória daquela temporada."}`;
}

function crestLetters(name: string) { return name.split(" ").map((word) => word[0]).join("").slice(0, 3).toUpperCase(); }
function idolTier(value: number) { return value >= 95 ? "LENDA" : value >= 80 ? "ÍDOLO" : value >= 60 ? "REFERÊNCIA" : value >= 35 ? "QUERIDO" : "MAIS UM"; }
function nextIdolTier(value: number) { const next = [35, 60, 80, 95].find((mark) => value < mark); return next ? `Faltam ${next - value} para ${idolTier(next)}` : "Topo da idolatria"; }
function ClubCrest({ club, small = false }: { club: Club; small?: boolean }) {
  const [missing, setMissing] = useState(false);
  return <span title={`Símbolo de ${club.name}`} className={`crest crest-${club.id} ${small ? "crest-small" : ""}`}>{missing ? crestLetters(club.name) : <img src={`/crests/${club.crest}.png`} alt={`Escudo do ${club.name}`} onError={() => setMissing(true)} />}</span>;
}
function Brand({ compact = false }: { compact?: boolean }) { return <div className={`brand ${compact ? "brand-compact" : ""}`}><img src="/o-rei-logo.png" alt="O REI — bola de couro e coroa" /></div>; }

function createInitialState(data: { name: string; position: Position; club: Club; foot: Player["preferredFoot"]; height: number; shirt: number; nationality: string; mode: "normal" | "generational"; playStyle?: PlayStyle }): CareerState {
  const seed = Date.now();
  const startingSalary = initialSalary(data.club);
  const player: Player = { id: `jogador-${seed}`, name: data.name.trim() || "Novo Craque", nationality: data.nationality, position: data.position, preferredFoot: data.foot, heightCm: data.height, shirtNumber: data.position === "MEI" ? 10 : data.position === "ATA" ? 9 : data.shirt, age: 16, clubId: data.club.id, attributes: data.mode === "generational" ? generationalAttributes(data.position, seed) : baseAttributes(), form: 68, fame: 3, salary: startingSalary, marketValue: 400000, games: 0, goals: 0, assists: 0, cleanSheets: 0, saves: 0, titles: [], awards: [], clubIdolatry: { [data.club.id]: 12 }, judasAt: [], injuries: 0, benchAppearances: 0, nationalTeamGames: 0, nationalTeamGoals: 0, nationalTeamAssists: 0 };
  return { seed, season: 2026, evolutionRulesVersion: 2, initialClubId: data.club.id, renewalCount: 0, player, history: [], clubHistory: [{ clubId: data.club.id, titles: [] }], currentCompetition: competitions.find((entry) => entry.id === data.club.leagueId)?.name ?? "Campeonato Nacional", mode: data.mode, playStyle: data.playStyle ?? "mixed", miniGameHistory: [], balance: 0, contract: { clubId: data.club.id, monthlySalary: startingSalary, seasonsRemaining: 3, role: "promessa", expectedMinutes: 28 }, leagueAssignments: Object.fromEntries(clubs.map((club) => [club.id, club.leagueId])), leagueTables: {}, shop: { ownedPermanent: [], activeSeasonal: [], freeUses: [] }, nationalTeam: { games: 0, goals: 0, assists: 0, titles: [] }, originCountry: data.club.country, highestOvr: computeOvr(player), clubStrengthAdjustments: {}, clubDynamics: {}, clubHonors: {}, recentEventIds: [], recentCardIds: [], recentMiniGameIds: [], campaignQualifications: {}, competitionWinners: {}, campaignMiniGames: {}, resolvedDecisionIds: [], lastWorldMiniGames: {}, saveVersion: 8 };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [career, setCareer] = useState<CareerState | null>(null);
  const [lastResult, setLastResult] = useState<SeasonResult | null>(null);
  const [event, setEvent] = useState<CareerEvent | null>(null);
  const [eventQueue, setEventQueue] = useState<CareerEvent[]>([]);
  const [seasonSummary, setSeasonSummary] = useState(false);
  const [seasonConsequences, setSeasonConsequences] = useState<string[]>([]);
  const [upgradeReady, setUpgradeReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<MiniGameDefinition | null>(null);
  const [gameAttempt, setGameAttempt] = useState(0);
  const [finalQueue, setFinalQueue] = useState<NonNullable<SeasonResult["finals"]>>([]);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [cloudSession, setCloudSession] = useState<CloudSession | null>(null);
  const [cloudCareer, setCloudCareer] = useState<CareerState | null>(null);
  const [showHistory,setShowHistory]=useState(false);
  const [training,setTraining]=useState<MiniGameDefinition|null>(null);
  const [trainingMenu,setTrainingMenu]=useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [resumeScreen, setResumeScreen] = useState<Screen>("career");
  useEffect(() => {
    const loaded = readSave(localStorage);
    if (loaded.warning) setToast(loaded.warning);
    if (loaded.save) {
      setCareer(loaded.save.career);
      const flow = loaded.save.flow;
      if (flow) {
        setLastResult(flow.lastResult); setEvent(flow.event); setEventQueue(flow.eventQueue);
        setSeasonSummary(flow.seasonSummary); setSeasonConsequences(flow.seasonConsequences);
        setUpgradeReady(flow.upgradeReady); setActiveGame(flow.activeGame); setGameAttempt(flow.gameAttempt);
        setFinalQueue(flow.finalQueue); setCelebration(flow.celebration);
        setResumeScreen(flow.screen === "legacy" ? "legacy" : flow.screen === "celebration" ? "celebration" : "career");
      } else { setLastResult(loaded.save.career.history.at(-1) ?? null); setUpgradeReady(true); setSeasonSummary(true); }
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem(CLOUD_SESSION_KEY);
    if (stored) try { const session = JSON.parse(stored) as CloudSession; window.queueMicrotask(() => setCloudSession(session)); } catch { localStorage.removeItem(CLOUD_SESSION_KEY); }
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("access_token"), userId = params.get("user_id"), email = params.get("email") ?? undefined;
    if (token && userId) { const session = { token, userId, email }; localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(session)); window.queueMicrotask(() => setCloudSession(session)); window.history.replaceState({}, "", window.location.pathname); }
    else if (token && supabaseCareer.configured()) supabaseCareer.currentUser(token).then((user) => { const session = { token, userId: user.id, email: user.email }; localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(session)); setCloudSession(session); window.history.replaceState({}, "", window.location.pathname); }).catch(() => setToast("Não foi possível concluir o login Google."));
  }, []);
  useEffect(() => {
    if (!hydrated || !career || screen === "home" || screen === "create") return;
    try { writeSave(localStorage, { version: 8, career, flow: { screen, lastResult, event, eventQueue, seasonSummary, seasonConsequences, upgradeReady, activeGame, gameAttempt, finalQueue, celebration } }); }
    catch { setToast("Não foi possível salvar. Exporte um backup antes de fechar."); }
  }, [hydrated, career, screen, lastResult, event, eventQueue, seasonSummary, seasonConsequences, upgradeReady, activeGame, gameAttempt, finalQueue, celebration]);

  function begin(data: Parameters<typeof createInitialState>[0]) { setEvent(null);setEventQueue([]);setFinalQueue([]);setCelebration(null);setActiveGame(null);setSeasonConsequences([]);setResumeScreen("career");setCareer(createInitialState(data)); setLastResult(null); setUpgradeReady(true); setSeasonSummary(true); setScreen("career"); }
  function finishSeason() { if (career && shouldRetire(career.player, career.seed)) { saveLocalRanking(career, clubs.find(c => c.id === career.player.clubId) ?? clubs[0]); setScreen("legacy"); return; } setEvent(null); setEventQueue([]); setFinalQueue([]); setActiveGame(null); setSeasonSummary(true); setUpgradeReady(true); setScreen("career"); }
  function isWorldCampaign(final: SeasonResult["cupFinal"]) { return final?.stakes === "campaign" && (final.competitionId === "wc" || final.competitionId === "cwc"); }
  function gameForFinal(final: SeasonResult["cupFinal"], seed: number, lockedGames: Record<string, MiniGameId> = {}, recent: MiniGameId[] = []) {
    const campaign = isWorldCampaign(final); const lockedId = campaign && final?.campaignId ? lockedGames[final.campaignId] : undefined;
    const accessGame = final?.stakes === "promotion" || final?.stakes === "relegation";
    const base = selectDecisionGame({ seed, season: career?.season ?? 2026, position: career?.player.position ?? "ATA", style: career?.playStyle, campaign, access: accessGame, locked: lockedId, recent, history: career?.miniGameHistory });
    const playerClub = clubs.find((entry) => entry.id === career?.player.clubId);
    const rival = clubs.find((entry) => entry.id === final?.opponentClubId);
    const competition = competitions.find((entry) => entry.id === final?.competitionId);
    const contextual = final?.scope === "national" && final.worldCupDifficulty
      ? final.worldCupDifficulty === "easy" ? "easy" : final.worldCupDifficulty === "standard" ? "standard" : "hard"
      : difficultyForFinal({ clubStrength: playerClub?.strength ?? 70, opponentStrength: rival?.strength, competitionPrestige: competition?.prestige, phaseIndex: final?.campaignMatchIndex });
    const difficulty = campaign ? worldMatchDifficulty(contextual, final?.campaignMatchIndex ?? 0, final?.attempt === "penalties") : contextual;
    return { ...base, difficulty };
  }
  function lockCampaignGame(state: CareerState, final: SeasonResult["cupFinal"], seed: number) {
    if (!isWorldCampaign(final) || !final?.campaignId || state.campaignMiniGames?.[final.campaignId]) return state;
    const previous = state.miniGameHistory?.filter(entry => minigames.some(game => game.id === entry.gameId && game.exclusive)).at(-1)?.gameId;
    const available = minigames.filter((game) => game.exclusive && game.id !== previous);
    const chosen = available[Math.abs(seed) % Math.max(1, available.length)] ?? gameForFinal(final, seed, state.campaignMiniGames, state.recentMiniGameIds);
    return { ...state, campaignMiniGames: { ...(state.campaignMiniGames ?? {}), [final.campaignId]: chosen.id } };
  }
  function rememberGame(state: CareerState, game: MiniGameDefinition, final?: SeasonResult["cupFinal"]) { return rememberDecisionGame(state, game, final); }
  function playSeason() { if (!career || upgradeReady || event || activeGame || career.marketWindow || career.pendingEvolution) return; const outcome = simulateSeason(career); let nextState = lockCampaignGame(outcome.state, outcome.result.cupFinal, outcome.state.seed + outcome.state.season); const game = gameForFinal(outcome.result.cupFinal, nextState.seed + nextState.season, nextState.campaignMiniGames, nextState.recentMiniGameIds); nextState = rememberGame(nextState, game, outcome.result.finalOpportunity ? outcome.result.cupFinal : undefined); setCareer(nextState); setLastResult(outcome.result); setFinalQueue((outcome.result.finals ?? []).slice(1)); setGameAttempt(0); setActiveGame(outcome.result.finalOpportunity ? game : null); setSeasonSummary(false); setUpgradeReady(false); setSeasonConsequences([]); if (outcome.result.events.length) { setEvent(outcome.result.events[0]); setEventQueue(outcome.result.events.slice(1)); return; } if (outcome.result.title && !outcome.result.cupFinal) { setCelebration({ title: outcome.result.title }); return setScreen("celebration"); } if (outcome.result.finalOpportunity) return setScreen("career"); finishSeason(); }
  function advanceFinalQueue() { if (!career || !lastResult) return finishSeason(); const [next, ...rest] = finalQueue; if (!next) return finishSeason(); let locked = lockCampaignGame(career, next, career.seed + career.season + rest.length); const game = gameForFinal(next, locked.seed + locked.season + rest.length, locked.campaignMiniGames, locked.recentMiniGameIds); locked = rememberGame(locked, game, next); const history = [...locked.history]; const continued = { ...lastResult, cupFinal: next, finalOpportunity: true, opponentName: next.opponentClubName }; history[history.length - 1] = continued; setCareer({ ...locked, history }); setLastResult(continued); setFinalQueue(rest); setGameAttempt(0); setActiveGame(game); setScreen("career"); }
  function settleFinal(player: Player, history: SeasonResult[], cupFinal: NonNullable<SeasonResult["cupFinal"]>, won: boolean, source: CareerState | null = career) {
    if (!source) return;
    const campaignLength = history.at(-1)?.campaigns?.find((campaign) => campaign.id === cupFinal.campaignId)?.matches.length ?? 7;
    const titleWon = won && cupFinal.stakes !== "promotion" && cupFinal.stakes !== "relegation" && (cupFinal.stakes !== "campaign" || cupFinal.campaignMatchIndex === campaignLength - 1);
    const national = cupFinal.scope === "national";
    let next: CareerState = titleWon && !national ? addClubTitle({ ...source, player, history }, cupFinal.competitionName) : { ...source, player, history };
    if (titleWon) {
      const prestige = competitions.find((entry) => entry.id === cupFinal.competitionId)?.prestige ?? 40;
      const honors = { ...(next.clubHonors ?? {}) };
      if (!national) honors[player.clubId] = [...(honors[player.clubId] ?? []), cupFinal.competitionName];
      const winners = { ...(next.competitionWinners ?? {}) }; if (!national) winners[cupFinal.competitionId] = [...(winners[cupFinal.competitionId] ?? []), { clubId: player.clubId, season: history.at(-1)?.season ?? next.season }].slice(-8);
      const qualification = { ...(next.campaignQualifications ?? {}) };
      const competition = competitions.find((entry) => entry.id === cupFinal.competitionId);
      if (!national && competition?.kind === "cup" && competition.country === (clubs.find((entry) => entry.id === player.clubId)?.country ?? "")) {
        const continental = competition.country === "Brasil" || ["Argentina", "Chile", "Colômbia", "Uruguai", "Paraguai", "Peru", "Bolívia", "Equador", "Venezuela"].includes(competition.country) ? "lib" : ["Inglaterra", "Espanha", "Itália", "Alemanha", "França", "Portugal", "Holanda", "Bélgica", "Turquia", "Grécia", "Suíça", "Áustria", "Dinamarca", "Noruega", "Polônia", "Croácia", "Escócia", "Irlanda"].includes(competition.country) ? "uel" : undefined;
        if (continental) qualification[player.clubId] = [...(qualification[player.clubId] ?? []).filter((entry) => entry.competitionId !== continental), { competitionId: continental, source: `campeão de ${cupFinal.competitionName}` }];
      }
      next = { ...next, balance: next.balance + prestige * 50_000, financialLedger:[...(next.financialLedger??[]),{season:history.at(-1)?.season??next.season,label:"Prêmio: "+cupFinal.competitionName,amount:prestige*50_000}], clubHonors: honors, competitionWinners: winners, campaignQualifications: qualification, nationalTeam: national ? { ...next.nationalTeam, titles: [...next.nationalTeam.titles, cupFinal.competitionName] } : next.nationalTeam };
    }
    return applyFinalConsequence(next, cupFinal, won);
  }
  function resolveWorldDecision(won: boolean) {
    if (!career || !lastResult?.cupFinal?.campaignId) return;
    const current = lastResult.cupFinal;
    const campaignId = current.campaignId!;
    const decisionId = current.decisionId ?? `${current.campaignId}:${current.campaignMatchIndex ?? 0}:${current.attempt ?? "regulation"}`;
    if (career.resolvedDecisionIds?.includes(decisionId)) return;
    const campaign = lastResult.campaigns?.find((item) => item.id === campaignId);
    if (!campaign) return;
    const resolution = resolveWorldMatch(campaign, current, won);
    const campaigns = (lastResult.campaigns ?? []).map((item) => item.id === campaign.id ? resolution.campaign : item);
    const completed = { ...current, won: resolution.outcome === "won" };
    const national = current.scope === "national";
    const countsAsNewMatch = current.attempt !== "penalties";
    const player = { ...career.player, titles: [...career.player.titles], clubIdolatry: { ...career.player.clubIdolatry }, nationalTeamGames: (career.player.nationalTeamGames ?? 0) + (national && countsAsNewMatch ? 1 : 0) };
    let source: CareerState = {
      ...career,
      player,
      nationalTeam: national ? { ...career.nationalTeam, games: career.nationalTeam.games + (countsAsNewMatch ? 1 : 0) } : career.nationalTeam,
      resolvedDecisionIds: [...(career.resolvedDecisionIds ?? []), decisionId].slice(-160),
    };

    if (resolution.outcome === "penalties") {
      const retry = { ...current, won: undefined, attempt: "penalties" as const, rescueAvailable: false, decisionId: `${current.campaignId}:match:${current.campaignMatchIndex ?? 0}:penalties` };
      const pending = { ...lastResult, campaigns, cupFinal: retry, finalOpportunity: true, opponentName: retry.opponentClubName, nationalTeamCampaign: national && lastResult.nationalTeamCampaign ? { ...lastResult.nationalTeamCampaign, games: lastResult.nationalTeamCampaign.games + (countsAsNewMatch ? 1 : 0), phase: `${campaign.matches[current.campaignMatchIndex ?? 0]?.phase ?? "Mata-mata"} · pênaltis` } : lastResult.nationalTeamCampaign, phaseReached: `${campaign.matches[current.campaignMatchIndex ?? 0]?.phase ?? "Mata-mata"} · pênaltis` };
      const history = [...source.history]; history[history.length - 1] = pending;
      source = { ...source, history };
      const game = gameForFinal(retry, source.seed + source.season, source.campaignMiniGames, source.recentMiniGameIds);
      setCareer(source); setLastResult(pending); setActiveGame(game); setGameAttempt((attempt) => attempt + 1); setToast(null); setScreen("career");
      return;
    }

    const titleWon = resolution.champion;
    if (titleWon && !national) {
      player.titles.push(current.competitionName);
      player.clubIdolatry[player.clubId] = Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + 12);
    }
    const titles = titleWon ? [...(lastResult.titles ?? []), current.competitionName].filter((item, index, all) => all.indexOf(item) === index) : (lastResult.titles ?? []);
    const resolved: SeasonResult = { ...lastResult, campaigns, cupFinal: completed, title: titleWon ? current.competitionName : lastResult.title, titles, nationalTeamTitle: titleWon && national ? current.competitionName : lastResult.nationalTeamTitle, nationalTeamCampaign: national && lastResult.nationalTeamCampaign ? { ...lastResult.nationalTeamCampaign, games: lastResult.nationalTeamCampaign.games + (countsAsNewMatch ? 1 : 0), phase: resolution.campaign.phase, title: titleWon ? current.competitionName : lastResult.nationalTeamCampaign.title } : lastResult.nationalTeamCampaign, finalOpportunity: resolution.continueCampaign, phaseReached: resolution.campaign.phase, opponentName: current.opponentClubName };
    let history = [...source.history]; history[history.length - 1] = resolved;
    source = settleFinal(player, history, completed, titleWon, source)!;
    if (!resolution.continueCampaign) {
      const lockedGame = source.campaignMiniGames?.[campaignId];
      if (lockedGame) source = { ...source, lastWorldMiniGames: { ...(source.lastWorldMiniGames ?? {}), [current.competitionId as "wc" | "cwc"]: lockedGame } };
    }

    const remaining = resolution.continueCampaign ? finalQueue : finalQueue.filter((item) => item.campaignId !== current.campaignId);
    if (titleWon) {
      setCareer(rememberClubMilestones(source)); setLastResult(resolved); setFinalQueue(remaining); setActiveGame(null); setCelebration({ title: current.competitionName }); setScreen("celebration");
      return;
    }
    const [next, ...rest] = remaining;
    if (next) {
      let locked = lockCampaignGame(source, next, source.seed + source.season + rest.length);
      const continued = { ...resolved, cupFinal: next, finalOpportunity: true, opponentName: next.opponentClubName };
      history = [...locked.history]; history[history.length - 1] = continued;
      locked = { ...locked, history };
      const game = gameForFinal(next, locked.seed + locked.season + rest.length, locked.campaignMiniGames, locked.recentMiniGameIds);
      setCareer(locked); setLastResult(continued); setFinalQueue(rest); setActiveGame(game); setGameAttempt(0); setToast(null); setScreen("career");
      return;
    }
    setCareer(rememberClubMilestones(source)); setLastResult(resolved); setFinalQueue([]); setActiveGame(null); setToast(null); finishSeason();
  }
  function resolveFinal(won: boolean) {
    if (!career || !lastResult?.cupFinal) return;
    if (lastResult.cupFinal.won !== undefined) return;
    const decisionId = lastResult.cupFinal.decisionId ?? `${lastResult.cupFinal.competitionId}:${lastResult.season}:${lastResult.cupFinal.campaignMatchIndex ?? "final"}`;
    if (career.resolvedDecisionIds?.includes(decisionId)) return;
    const cupFinal = { ...lastResult.cupFinal, won };
    const campaignLength = lastResult.campaigns?.find((campaign) => campaign.id === cupFinal.campaignId)?.matches.length ?? 7;
    if (!won && cupFinal.stakes === "titleAndPromotion" && cupFinal.targetLeagueId) {
      const accessFinal = { ...cupFinal, won: undefined, stakes: "promotion" as const, phase: "access" as const, competitionName: "Jogo do Acesso" };
      const pending = { ...lastResult, cupFinal: accessFinal, access: "pending" as const, phaseReached: "Jogo do Acesso" };
      const history = [...career.history]; history[history.length - 1] = pending;
      setCareer({ ...career, history }); setLastResult(pending); setActiveGame(gameForFinal(accessFinal, career.seed + career.season + 91)); setGameAttempt(0); setToast(null); setScreen("career");
      return;
    }
    const titleWon = won && cupFinal.stakes !== "promotion" && cupFinal.stakes !== "relegation" && (cupFinal.stakes !== "campaign" || cupFinal.campaignMatchIndex === campaignLength - 1);
    const title = titleWon ? cupFinal.competitionName : lastResult.title;
    const titles = titleWon ? [...(lastResult.titles ?? []), cupFinal.competitionName].filter((value, index, all) => all.indexOf(value) === index) : (lastResult.titles ?? []);
    const access = cupFinal.stakes === "promotion" ? (won ? "promoted" : "stayed") : cupFinal.stakes === "titleAndPromotion" && won ? "promoted" : lastResult.access;
    const campaigns = (lastResult.campaigns ?? []).map((campaign) => {
      if (campaign.id !== cupFinal.campaignId) return campaign;
      const index = cupFinal.campaignMatchIndex;
      const isLongCampaign = cupFinal.stakes === "campaign" && index !== undefined;
      const isTitle = titleWon;
      const matchResult = won ? "won" as const : "lost" as const;
      const nextPhase = isLongCampaign && index < campaign.matches.length - 1 ? campaign.matches[index + 1]?.phase ?? campaign.phase : isTitle ? "Campeão" : won ? campaign.phase : "Eliminado";
      const matches = campaign.matches.map((match, matchIndex) => matchIndex !== index ? match : { ...match, result: matchResult, playerGoals: won ? 2 : 0, opponentGoals: 1 });
      const groupMatches = matches.slice(0, 3).filter((match) => match.result !== "pending");
      const points = groupMatches.reduce((total, match) => total + (match.result === "won" ? 3 : match.result === "drawn" ? 1 : 0), 0);
      const groupEliminated = Boolean(isLongCampaign && index === 2 && groupMatches.filter((match) => match.result === "won").length < 2);
      const goalDifference = groupMatches.reduce((total, match) => total + (match.playerGoals ?? 0) - (match.opponentGoals ?? 0), 0);
      const groupTable = campaign.groupTable?.map((row, rowIndex) => rowIndex === 0 ? { ...row, points, goalDifference, goalsFor: groupMatches.reduce((total, match) => total + (match.playerGoals ?? 0), 0), position: points >= 3 ? 1 : 3 } : row);
      return { ...campaign, status: isTitle ? "champion" as const : groupEliminated || (!won && !(isLongCampaign && index < 3)) ? "eliminated" as const : "active" as const, phase: groupEliminated ? "Eliminado na fase de grupos" : nextPhase, title: isTitle ? cupFinal.competitionName : campaign.title, matches, groupTable };
    });
    const resolved = { ...lastResult, annualEarnings:(lastResult.annualEarnings??0)+(titleWon?(competitions.find(c=>c.id===cupFinal.competitionId)?.prestige??40)*50_000:0), cupFinal, title, titles, campaigns, nationalTeamTitle: titleWon && cupFinal.scope === "national" ? cupFinal.competitionName : lastResult.nationalTeamTitle, access, relegated: cupFinal.stakes === "relegation" ? !won : lastResult.relegated };
    const player = { ...career.player, titles: [...career.player.titles], clubIdolatry: { ...career.player.clubIdolatry } };
    if (titleWon && cupFinal.scope !== "national") {
      player.titles.push(cupFinal.competitionName);
      player.clubIdolatry[player.clubId] = Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + 9);
    }
    const history = [...career.history]; history[history.length - 1] = resolved;
    const settledBase = settleFinal(player, history, cupFinal, won)!;
    const settled = { ...settledBase, resolvedDecisionIds: [...(settledBase.resolvedDecisionIds ?? []), decisionId].slice(-160) };
    if (cupFinal.stakes === "campaign" && (cupFinal.campaignMatchIndex ?? 0) < campaignLength - 1 && finalQueue.length && (won || ((cupFinal.campaignMatchIndex ?? 0) < 3 && campaigns.find(c=>c.id===cupFinal.campaignId)?.status !== "eliminated"))) {
      const [next, ...rest] = finalQueue;
      const continued = { ...resolved, cupFinal: next, finalOpportunity: true, opponentName: next.opponentClubName };
      const continuedHistory = [...settled.history]; continuedHistory[continuedHistory.length - 1] = continued;
      let locked = lockCampaignGame({ ...settled, history: continuedHistory }, next, career.seed + career.season + rest.length); const game = gameForFinal(next, locked.seed + locked.season + rest.length, locked.campaignMiniGames, locked.recentMiniGameIds); locked = rememberGame(locked, game); setCareer(locked); setLastResult(continued); setFinalQueue(rest); setGameAttempt(0); setActiveGame(game); setScreen("career");
      return;
    }
    const campaignEliminated = campaigns.find((campaign) => campaign.id === cupFinal.campaignId)?.status === "eliminated";
    const remainingFinals = !won && cupFinal.stakes === "campaign" && (campaignEliminated || (cupFinal.campaignMatchIndex ?? 0) >= 3) ? finalQueue.filter((item) => item.campaignId !== cupFinal.campaignId) : finalQueue;
    if (!won && cupFinal.stakes !== "titleAndPromotion" && remainingFinals.length) {
      const [next, ...rest] = remainingFinals;
      const continued = { ...resolved, cupFinal: next, finalOpportunity: true, opponentName: next.opponentClubName };
      const continuedHistory = [...settled.history]; continuedHistory[continuedHistory.length - 1] = continued;
      let locked = lockCampaignGame({ ...settled, history: continuedHistory }, next, career.seed + career.season + rest.length); const game = gameForFinal(next, locked.seed + locked.season + rest.length, locked.campaignMiniGames, locked.recentMiniGameIds); locked = rememberGame(locked, game); setCareer(locked); setLastResult(continued); setFinalQueue(rest); setGameAttempt(0); setActiveGame(game); setScreen("career");
      return;
    }
    setCareer(rememberClubMilestones(settled)); setLastResult(resolved); setActiveGame(null);
    if (!won && cupFinal.stakes !== "titleAndPromotion") finishSeason();
  }
  function completeMiniGame(won: boolean) {
    setToast(null);
    if (!career || !lastResult?.cupFinal || lastResult.cupFinal.won !== undefined) return;
    if (isWorldCampaign(lastResult.cupFinal)) { resolveWorldDecision(won); return; }
    const victory = won;
    const final = lastResult.cupFinal;
    if (!victory && final.stakes === "titleAndPromotion") { resolveFinal(false); return; }
    const campaignLength = lastResult.campaigns?.find((campaign) => campaign.id === final.campaignId)?.matches.length ?? 7;
    resolveFinal(victory);
    setToast(null);
    const isCampaignStep = final.stakes === "campaign" && (final.campaignMatchIndex ?? 0) < campaignLength - 1;
    if (victory && !isCampaignStep) {
      setCelebration((final.stakes === "promotion" || final.stakes === "titleAndPromotion") ? { title: final.stakes === "promotion" ? "Jogo do Acesso" : final.competitionName, access: competitions.find((entry) => entry.id === final.targetLeagueId)?.name ?? "nova divisão" } : final.stakes === "relegation" ? { title: "Permanência garantida" } : { title: final.competitionName });
      setScreen("celebration");
    }
  }
  function chooseEvent(index: number) {
    if (!career || !event) return;
    const choice = event.choices[index];
    if ((event.id === "emprestimo-inicial" && index === 0) || (event.id === "banco-contexto" && index === 2)) { requestLoan(); setSeasonConsequences((items) => [...items, eventConsequence(event, choice)]); if (eventQueue.length) { setEvent(eventQueue[0]); setEventQueue(eventQueue.slice(1)); } else if (lastResult?.finalOpportunity) { setEvent(null); setEventQueue([]); setScreen("career"); } else finishSeason(); return; }
    const player = { ...career.player, clubIdolatry: { ...career.player.clubIdolatry }, titles: [...career.player.titles], attributes: { ...career.player.attributes } };
    const protectedByPress = event.context === "imprensa" && career.shop.activeSeasonal.includes("imprensa");
    const soften = (value = 0) => value;

    if (choice.finalOutcome && lastResult?.cupFinal) {
      const won = choice.finalOutcome === "win";
      const cupFinal = { ...lastResult.cupFinal, won };
      const resolved = { ...lastResult, cupFinal, title: won && cupFinal.stakes !== "promotion" ? cupFinal.competitionName : lastResult.title };
      if (won && cupFinal.stakes !== "promotion" && cupFinal.stakes !== "relegation") {
        player.titles.push(cupFinal.competitionName);
        player.clubIdolatry[player.clubId] = Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + 9);
      }
      const history = [...career.history];
      history[history.length - 1] = resolved;
      setCareer(settleFinal(player, history, cupFinal, won)!);
      setLastResult(resolved);
      setEventQueue([]);
      setToast(null);
      if (won) { setCelebration((cupFinal.stakes === "promotion" || cupFinal.stakes === "titleAndPromotion") ? { title: cupFinal.competitionName, access: competitions.find((entry) => entry.id === cupFinal.targetLeagueId)?.name ?? "nova divisão" } : { title: cupFinal.competitionName }); setScreen("celebration"); } else finishSeason();
      return;
    }

    player.fame = Math.max(0, Math.min(100, player.fame + soften(choice.fame)));
    player.form = Math.max(0, Math.min(100, player.form + (choice.form ?? 0)));
    player.salary = Math.max(0, player.salary + (choice.salary ?? 0));
    player.injuries = Math.max(player.injuries, choice.injuryWeeks ?? 0);
    player.clubIdolatry[player.clubId] = Math.max(0, Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + soften(choice.idolatry)));
    const consequence = eventConsequence(event, choice);
    const history = [...career.history];
    if (history.length) history[history.length - 1] = { ...history[history.length - 1], consequences: [...(history[history.length - 1].consequences ?? []), consequence] };
    setCareer({ ...rememberClubMilestones({ ...career, player }), history, shop: protectedByPress ? { ...career.shop, activeSeasonal: career.shop.activeSeasonal.filter(id=>id!=="imprensa") } : career.shop });
    setLastResult(history[history.length - 1] ?? lastResult);
    setSeasonConsequences((items) => [...items, consequence]);
    // The resolved event must leave the panel before a pending final can start.
    setEvent(null);
    if (eventQueue.length) {
      setEvent(eventQueue[0]);
      setEventQueue(eventQueue.slice(1));
      return;
    }
    setToast("Decisões registradas. A arquibancada sentiu o impacto.");
    if (lastResult?.finalOpportunity) { setEventQueue([]); setScreen("career"); } else if (lastResult?.title) { setCelebration({ title: lastResult.title }); setScreen("celebration"); } else finishSeason();
  }
  function takeCard(card: UpgradeCard) { if (!career || !upgradeReady) return; setCareer({ ...applyCareerCard(career, card), careerProfile: career.careerProfile ?? card.name, recentCardIds: [...(career.recentCardIds ?? []), card.id].slice(-10) }); setUpgradeReady(false); setToast(`${card.name}: atributos atualizados imediatamente.`); }
  function chooseEvolution(focus: EvolutionFocus) {
    if (!career?.pendingEvolution) return;
    const applied = applySeasonEvolution(career.player, career.pendingEvolution, focus, career.seed + career.season * 521, career.lastEvolutionFocus, career.evolutionFocusStreak);
    const history = [...career.history];
    const latest = history.length - 1;
    if (latest >= 0) history[latest] = { ...history[latest], evolution: applied.evolution, consequences: [...(history[latest].consequences ?? []), `Radar de Evolução: foco em ${evolutionFocusLabel[focus]}.`] };
    const gainText = Object.entries(applied.evolution.gains ?? {}).map(([key, value]) => `+${value} ${attributeLabels[key]}`).join(" · ");
    setCareer({ ...career, player: applied.player, history, pendingEvolution: undefined, lastEvolutionFocus: focus, evolutionFocusStreak: applied.streak, careerProfile: career.careerProfile ?? evolutionFocusLabel[focus] });
    setLastResult(history[latest] ?? lastResult);
    setToast(`Radar de Evolução concluído: ${gainText || "seu potencial foi trabalhado"}${applied.evolution.bonusSignature ? " · +1 de assinatura pela consistência" : ""}.`);
  }
  function renewContract() { if (!career) return; const current=clubs.find(c=>c.id===career.player.clubId)??clubs[0]; const monthlySalary = renewalSalary(career,current,1.15); setCareer(acceptRenewal(career,{...career.contract,monthlySalary,seasons:3,idolatryChange:0})); setToast("Renovação assinada: 3 temporadas a mais."); }
  function requestLoan() { if (!career || career.loan || career.pendingTransfer) return; setCareer({...career, marketAfterLoan: career.marketWindow, marketWindow: prepareMarketWindow(career, "loan")}); setToast("Seu empresário vai buscar opções de empréstimo. Escolha um país ou procure no mundo todo."); }

  function transferTo(club: Club) { if (!career) return; const previous = clubs.find((item) => item.id === career.player.clubId); const rival = Boolean(previous?.rivals.includes(club.id)); const player = { ...career.player, clubId: club.id, clubIdolatry: { ...career.player.clubIdolatry, [club.id]: 5 }, judasAt: [...career.player.judasAt] }; if (rival && previous && !player.judasAt.includes(previous.id)) player.judasAt.push(previous.id); const clubHistory = (career.clubHistory ?? []).map((entry) => ({ ...entry, titles: [...entry.titles] })); if (!clubHistory.some((entry) => entry.clubId === club.id)) clubHistory.push({ clubId: club.id, titles: [] }); const monthlySalary = cappedSalary(career,club,club.budget * 22000 * (career.shop.ownedPermanent.includes("academia") ? 1.2 : 1), computeOvr(player)); const role = computeOvr(player) >= club.strength + 8 ? "estrela" : computeOvr(player) >= club.strength ? "titular" : "rotacao"; setCareer({ ...career, player, clubHistory, contract: { clubId: club.id, monthlySalary, seasonsRemaining: 3, role, expectedMinutes: role === "estrela" ? 42 : role === "titular" ? 34 : 22 } }); setToast(rival ? `Transferência selada. Parte da torcida do ${previous?.name} vai chamá-lo de Judas.` : `Contrato de 3 anos assinado com ${club.name}.`); setScreen("career"); }
  function acceptProposal(offer: NonNullable<CareerState["marketWindow"]>["offers"][number] | NonNullable<CareerState["marketWindow"]>["renewal"]) {
    if (!career) return;
    const previous = clubs.find((club) => club.id === career.player.clubId) ?? clubs[0];
    const target = clubs.find((club) => club.id === offer.clubId) ?? previous;
    const changingClub = target.id !== previous.id;
    if (!changingClub) {
      setCareer(acceptRenewal(career,offer));
      return setToast(`Renovação assinada com ${target.name}.`);
    }
    const clubHistory = !career.clubHistory.some((entry) => entry.clubId === target.id) ? [...career.clubHistory, { clubId: target.id, titles: [] }] : career.clubHistory;
    setCareer({ ...career, clubHistory, pendingTransfer: offer, marketWindow: undefined, marketAfterLoan: undefined });
    setToast(`${offer.kind === "loan" ? "Empréstimo" : "Contrato"} acertado com ${target.name}. Você se apresenta na próxima temporada.`);
  }
  const club = career ? clubs.find((item) => item.id === career.player.clubId) ?? clubs[0] : clubs[0];
  async function openAccount(session = cloudSession) {
    if (!session || !supabaseCareer.configured()) return setScreen("account");
    try { const remote = await supabaseCareer.load(session.userId, session.token); if (remote && career) { setCloudCareer(remote); setScreen("sync"); } else if (remote) { setCareer(remote); setScreen("career"); } else setScreen("career"); } catch { setToast("Não foi possível ler o save online agora."); }
  }
  function useCloudChoice(which: "local" | "cloud") { if (which === "cloud" && cloudCareer) setCareer(cloudCareer); setCloudCareer(null); setScreen("career"); }
  if (screen === "home") return <><Start hasCareer={Boolean(career)} cloud={Boolean(cloudSession)} onNew={() => setScreen("create")} onContinue={() => setScreen(resumeScreen)} onAccount={() => setScreen("account")} /><div className="save-tools"><label>IMPORTAR BACKUP<input type="file" accept="application/json" onChange={async(e)=>{const file=e.target.files?.[0];if(!file)return;try{writeSave(localStorage,decodeSave(await file.text()));window.location.reload()}catch(error){setToast((error as Error).message)}}}/></label>{toast&&<p role="alert">{toast}</p>}</div></>;
  if (screen === "create") return <Create onBack={() => setScreen("home")} onCreate={begin} />;
  if (screen === "account") return <Account onBack={() => setScreen("home")} onSignedIn={(session) => { localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(session)); setCloudSession(session); openAccount(session); }} />;
  if (screen === "sync" && cloudCareer && career) return <SyncChoice local={career} cloud={cloudCareer} onChoose={useCloudChoice} />;
  if (!career) return null;

  if (screen === "celebration" && celebration) return <Celebration celebration={celebration} onClose={() => { setCelebration(null); advanceFinalQueue(); }} />;
  if (screen === "legacy") return <CareerRetrospective career={career} retired onClose={()=>{setResumeScreen("legacy");setScreen("home")}} onRestart={()=>{setCareer(null);setScreen("home")}} />;

  return <><div className="save-tools"><button onClick={()=>setShowHistory(true)}>VER CARREIRA</button><button onClick={()=>setTrainingMenu(true)}>TREINAR MINIJOGOS</button><button onClick={()=>{const raw=localStorage.getItem("o-rei-career");if(!raw)return;const url=URL.createObjectURL(new Blob([raw],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="o-rei-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>EXPORTAR SAVE</button><label>IMPORTAR SAVE<input type="file" accept="application/json" hidden onChange={async(e)=>{const file=e.target.files?.[0];if(!file)return;try{const save=decodeSave(await file.text());writeSave(localStorage,save);window.location.reload()}catch(error){setToast((error as Error).message)}}}/></label><button onClick={()=>{try{const raw=localStorage.getItem(BACKUP_KEY);if(!raw)throw Error("Ainda não há backup anterior.");const save=decodeSave(raw);writeSave(localStorage,save);window.location.reload()}catch(error){setToast((error as Error).message)}}}>RECUPERAR BACKUP</button></div>
  {showHistory&&<CareerRetrospective career={career} onClose={()=>setShowHistory(false)}/>}
  {trainingMenu&&<div className="career-overlay training-overlay" role="dialog" aria-modal="true" aria-label="Centro de treino"><section className="shop-wrap training-wrap"><header className="training-heading"><div><small>O REI · CAMPO DE TREINO</small><h2>Prepare a próxima decisão.</h2><p>Escolha um desafio. A dificuldade pode ser ajustada antes de começar.</p></div><button className="training-close" autoFocus onClick={()=>setTrainingMenu(false)}>Voltar ×</button></header><div className="training-catalog">{minigames.map((g,index)=><button className={`training-game ${g.exclusive ? "training-game-world" : ""}`} key={g.id} onClick={()=>{setTraining(g);setTrainingMenu(false)}}><span className="training-number">{String(index+1).padStart(2,"0")}</span><span><small>{g.exclusive?'MUNDIAIS':'DECISÕES DA CARREIRA'}</small><b>{g.name}</b><p>{g.description}</p></span><span className="training-arrow" aria-hidden="true">↗</span></button>)}</div><p className="training-note">Prática livre. Os resultados do treino não alteram sua carreira.</p></section></div>}
  {training&&<MiniGameArena game={training} context="treino" onClose={()=>setTraining(null)} onFinish={()=>{setTraining(null);setToast(null)}}/>}
  {screen === "shop" && <CareerShop career={career} onBack={() => setScreen("career")} onChange={setCareer} onToast={setToast} />}<Career career={career} club={club} result={lastResult} event={event} seasonSummary={seasonSummary} seasonConsequences={seasonConsequences} upgradeReady={upgradeReady} onChooseEvent={chooseEvent} onChooseCard={takeCard} onChooseEvolution={chooseEvolution} onSkipCard={() => setToast("Escolha uma das três cartas para preparar a temporada.")} onRedrawCards={()=>{if(!upgradeReady||career.pendingEvolution||!canRedrawCards(career))return;setCareer(redrawCards(career));setToast("Três novas opções. Esta troca fica disponível novamente em duas temporadas.")}} toast={toast} onDismiss={() => setToast(null)} onPlay={playSeason} onShop={() => setScreen("shop")} onRenew={renewContract} onProposal={acceptProposal} onNegotiate={(clubId,priority)=>{const outcome=negotiateOffer(career,clubId,mulberry32(career.seed+career.season*167+clubId.split('').reduce((n,c)=>n+c.charCodeAt(0),0)),priority);setCareer(outcome.state);setToast(outcome.message)}} onStay={()=>setCareer({...career,marketWindow:career.marketAfterLoan,marketAfterLoan:undefined})} onLoan={requestLoan} onCountry={(country)=>{const kind=career.marketWindow?.kind??"transfer";const next=createMarketWindow(career,mulberry32(career.marketWindow?.seed??(career.seed+career.season*311+(kind==="loan"?73:0))),country||undefined,kind);setCareer({...career,marketWindow:next});}} onExit={()=>{if((career.exitRequests??0)>=2)return setToast("Você já usou os dois pedidos de saída.");const p={...career.player,clubIdolatry:{...career.player.clubIdolatry,[career.player.clubId]:Math.max(0,(career.player.clubIdolatry[career.player.clubId]??0)-3)}};const next={...career,player:p,exitRequests:(career.exitRequests??0)+1};setCareer({...next,marketWindow:prepareMarketWindow(next)});setToast("Seu representante abriu conversas. Idolatria −3.")}} activeGame={activeGame} gameAttempt={gameAttempt} onRestartGame={() => setGameAttempt((attempt) => attempt + 1)} onFinishGame={completeMiniGame} /></>;
}

const evolutionFocusLabel: Record<EvolutionFocus, string> = { assinatura: "Assinatura", estilo: "Estilo", liderancaFisica: "Liderança e físico" };

function Start({ hasCareer, cloud, onNew, onContinue, onAccount }: { hasCareer: boolean; cloud: boolean; onNew: () => void; onContinue: () => void; onAccount: () => void }) { return <main className="app-shell start-shell"><nav className="topbar"><Brand compact /><span className="topbar-caption">O FUTEBOL ESCREVE HISTÓRIAS.</span><button className="save-chip" onClick={onAccount}>◉ {cloud ? "CONTA CONECTADA" : "MODO VISITANTE"}</button></nav><section className="start-content"><header className="start-heading"><div className="eyebrow">MODO CARREIRA · DO PRIMEIRO CONTRATO AO LEGADO</div><h1>O REI<span>O próximo ídolo tem a sua história.</span></h1><p>Comece aos 16. Escolha seu clube, decida seu futuro e entre em campo quando a taça estiver em jogo.</p></header><div className="start-briefing"><div className="start-career"><div className="briefing-label"><span>CARREIRA LIVRE</span><small>SEU CAMINHO, SUAS ESCOLHAS</small></div><h2>A camisa espera por você.</h2><p>Do primeiro contrato à última volta olímpica. Cada temporada deixa uma marca no clube e na torcida.</p><div className="start-actions"><button className="button button-primary" onClick={onNew}>COMEÇAR CARREIRA <span>→</span></button>{hasCareer && <button className="button button-ghost" onClick={onContinue}>CONTINUAR CARREIRA</button>}</div><div className="feature-row"><span><b>{minigames.length}</b> desafios decisivos</span><span><b>12</b> atributos por posição</span><span><b>16</b> anos no primeiro contrato</span></div></div><aside className="start-playbook"><small>COMO SE CONSTRÓI UM REI</small><ol><li><b>01</b><div><strong>Escolha sua camisa</strong><p>Atacante, meia ou goleiro. Seu jeito de jogar começa aqui.</p></div></li><li><b>02</b><div><strong>Faça valer a temporada</strong><p>Treine, responda às propostas e conquiste a arquibancada.</p></div></li><li><b>03</b><div><strong>Decida dentro de campo</strong><p>Nas grandes decisões, a taça passa pelas suas mãos.</p></div></li></ol></aside></div></section><footer>O REI · futebol, escolhas e memória</footer></main>; }

function Account({ onBack, onSignedIn }: { onBack: () => void; onSignedIn: (session: CloudSession) => void }) {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [message, setMessage] = useState("");
  const [pending, setPending] = useState<"signIn" | "signUp" | null>(null);
  async function passwordAuth(signUp: boolean) { setPending(signUp ? "signUp" : "signIn"); try { const response = signUp ? await supabaseCareer.signUp(email, password) : await supabaseCareer.signInWithPassword(email, password); if (!response.access_token || !response.user?.id) return setMessage("Confira seu e-mail para confirmar a conta e entre depois."); onSignedIn({ userId: response.user.id, token: response.access_token, email: response.user.email }); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível entrar."); } finally { setPending(null); } }
  return <main className="app-shell form-shell"><nav className="topbar"><button className="back-button" onClick={onBack}>← Voltar</button><Brand compact /><span className="step">CONTA</span></nav><section className="form-wrap"><div><div className="eyebrow">SAVE ONLINE</div><h1>Proteja sua carreira.</h1><p>Você pode continuar como visitante ou sincronizar suas temporadas em qualquer dispositivo.</p></div>{!supabaseCareer.configured() ? <p className="field-note">O modo online será liberado quando as chaves do Supabase forem configuradas.</p> : <><button className="button button-primary button-full" onClick={() => supabaseCareer.signInWithGoogle()}>ENTRAR COM GOOGLE</button><label className="field field-wide">E-mail<input value={email} type="email" onChange={(event) => setEmail(event.target.value)} /></label><label className="field field-wide">Senha<input value={password} type="password" minLength={6} onChange={(event) => setPassword(event.target.value)} /></label><div className="start-actions"><button className="button button-primary" disabled={Boolean(pending)} aria-busy={pending === "signIn"} onClick={() => passwordAuth(false)}>ENTRAR</button><button className="button button-ghost" disabled={Boolean(pending)} aria-busy={pending === "signUp"} onClick={() => passwordAuth(true)}>CRIAR CONTA</button></div>{message && <p className="field-note" role="status">{message}</p>}</>}<button className="text-action" onClick={onBack}>CONTINUAR COMO VISITANTE</button></section></main>;
}

function SyncChoice({ local, cloud, onChoose }: { local: CareerState; cloud: CareerState; onChoose: (choice: "local" | "cloud") => void }) { const card = (label: string, state: CareerState, choice: "local" | "cloud") => <button className="training-card raro" onClick={() => onChoose(choice)}><span className="rarity">{label}</span><b>{state.player.name}</b><div><span>{state.season} · {state.currentCompetition}</span><span>OVR {computeOvr(state.player)} · {state.history.length} temporadas</span></div><i>USAR ESTA CARREIRA →</i></button>; return <main className="app-shell evolution-shell"><section className="evolution-wrap"><div className="eyebrow">CONFLITO DE SAVE</div><h1>Escolha a carreira que deseja manter.</h1><p>A versão não escolhida será substituída pela escolhida na próxima sincronização.</p><div className="card-grid">{card("NESTE DISPOSITIVO", local, "local")}{card("SAVE ONLINE", cloud, "cloud")}</div></section></main>; }

type PlayableLeague = (typeof competitions)[number];
function LeaguePickers({ leagues, leagueId, onChange }: { leagues: PlayableLeague[]; leagueId: string; onChange: (id: string) => void }) {
  const selected = leagues.find(league => league.id === leagueId) ?? leagues[0];
  const [open, setOpen] = useState<"country" | "league" | null>(null);
  const [search, setSearch] = useState("");
  if (!selected) return <p className="field-note">Nenhuma liga disponível no momento.</p>;
  const countryNames = [...new Set(leagues.map(league => league.country))].sort((a,b) => a.localeCompare(b,"pt-BR"));
  const visible = countryNames.filter(name => name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));
  const countryLeagues = leagues.filter(league => league.country === selected.country);
  function flag(league: PlayableLeague) {
    const points = Array.from(league.flag ?? "").map(character => character.codePointAt(0)!);
    const code = points.length === 2 && points.every(point => point >= 0x1f1e6 && point <= 0x1f1ff)
      ? String.fromCharCode(...points.map(point => point - 0x1f1e6 + 97))
      : league.country === "Inglaterra" ? "gb-eng" : league.country === "Escócia" ? "gb-sct" : undefined;
    return code ? <img src={`https://flagcdn.com/w40/${code}.png`} alt="" /> : <span aria-hidden="true">{league.flag}</span>;
  }
  return <>
    <div className="field field-wide country-field">
      <span id="league-country-label">País da liga</span>
      <button type="button" className="country-trigger" aria-labelledby="league-country-label league-country-value" aria-expanded={open === "country"} onClick={() => { setSearch(""); setOpen(open === "country" ? null : "country"); }}>
        {flag(selected)}<span id="league-country-value">{selected.country}</span><b>⌄</b>
      </button>
      {open === "country" && <div className="country-menu" onKeyDown={event => { if (event.key === "Escape") setOpen(null); }}>
        <input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar país" aria-label="Buscar país da liga" />
        <div className="country-options">{visible.map(name => { const first=leagues.find(league=>league.country===name)!; return <button type="button" key={name} onClick={() => { onChange(first.id); setOpen(null); setSearch(""); }}>{flag(first)}<span>{name}</span></button>; })}{!visible.length && <p className="field-note">Nenhum país com liga disponível encontrado.</p>}</div>
      </div>}
    </div>
    <div className="field field-wide country-field">
      <span id="league-label">Liga de início</span>
      <button type="button" className="country-trigger" aria-labelledby="league-label league-value" aria-expanded={open === "league"} onClick={() => setOpen(open === "league" ? null : "league")}>
        {flag(selected)}<span id="league-value">{selected.name}</span><b>⌄</b>
      </button>
      {open === "league" && <div className="country-menu" onKeyDown={event => { if (event.key === "Escape") setOpen(null); }}><div className="country-options">{countryLeagues.map(league => <button type="button" key={league.id} onClick={() => { onChange(league.id); setOpen(null); }}>{flag(league)}<span>{league.name}</span></button>)}</div></div>}
      <small className="field-note">{selected.country} · {clubs.filter(club => clubCompetesIn(club, selected.id)).length} clubes nesta edição</small>
    </div>
  </>;
}

function Create({ onBack, onCreate }: { onBack: () => void; onCreate: (data: Parameters<typeof createInitialState>[0]) => void }) {
  const [playStyle, setPlayStyle] = useState<PlayStyle>("mixed");
  const [name, setName] = useState("Matheus"), [position, setPosition] = useState<Position>("MEI"), [leagueId, setLeagueId] = useState("bra-a"), [clubId, setClubId] = useState("santos"), [nationality, setNationality] = useState("Brasil"), [foot, setFoot] = useState<Player["preferredFoot"]>("Direito"), [height, setHeight] = useState(178), [shirt, setShirt] = useState(10), [generational, setGenerational] = useState(false), [countryOpen, setCountryOpen] = useState(false), [countrySearch, setCountrySearch] = useState("");
  const playableCompetitions = competitions.filter((competition) => competition.selectable && clubs.some((club) => clubCompetesIn(club, competition.id)));
  const leagueClubs = clubs.filter((club) => clubCompetesIn(club, leagueId)); const selected = leagueClubs.find((club) => club.id === clubId) ?? leagueClubs[0] ?? clubs[0];
  function switchLeague(next: string) { const first = clubs.find((club) => clubCompetesIn(club, next)); if (first) { setLeagueId(next); setClubId(first.id); } }
  const selectedCountry = countries.find((country) => country.name === nationality) ?? countries.find((country) => country.code === "BR")!;
  const visibleCountries = countries.filter((country) => country.name.toLocaleLowerCase("pt-BR").includes(countrySearch.toLocaleLowerCase("pt-BR")));
  return <main className="app-shell form-shell"><nav className="topbar"><button className="back-button" onClick={onBack}>← Voltar</button><Brand compact /><span className="step">01 / 01</span></nav><section className="form-wrap"><div><div className="eyebrow">FICHA DE INSCRIÇÃO</div><h1>Seu primeiro contrato.</h1><p>Você começa aos 16 anos. O resto será conquistado em campo.</p></div><div className="form-grid"><label className="field field-wide">Nome do atleta<input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} /></label><div className="field country-field"><span>Nacionalidade</span><button type="button" className="country-trigger" onClick={() => setCountryOpen(!countryOpen)}><img src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`} alt="" /><span>{selectedCountry.name}</span><b>⌄</b></button>{countryOpen && <div className="country-menu"><input autoFocus value={countrySearch} onChange={(event) => setCountrySearch(event.target.value)} placeholder="Buscar país" aria-label="Buscar país" /> <div className="country-options">{visibleCountries.map((country) => <button type="button" key={country.code} onClick={() => { setNationality(country.name); setCountryOpen(false); setCountrySearch(""); }}><img src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} alt={`Bandeira de ${country.name}`} /><span>{country.name}</span></button>)}</div></div>}</div><label className="field">Pé dominante<select value={foot} onChange={(e) => setFoot(e.target.value as Player["preferredFoot"])}><option>Direito</option><option>Esquerdo</option><option>Ambidestro</option></select></label><div className="field field-wide"><span>Posição principal</span><div className="position-grid">{positions.map((item) => <button key={item.id} onClick={() => { setPosition(item.id); if (item.id === "MEI") setShirt(10); if (item.id === "ATA") setShirt(9); }} className={`position-choice ${position === item.id ? "selected" : ""}`}>{item.label}</button>)}</div></div><label className="field">Altura<input type="number" min={155} max={210} value={height} onChange={(e) => setHeight(Number(e.target.value))} /></label><label className="field">Camisa<input type="number" min={1} max={99} value={shirt} onChange={(e) => setShirt(Number(e.target.value))} /></label><LeaguePickers leagues={playableCompetitions} leagueId={leagueId} onChange={switchLeague} /><div className="field field-wide"><span>Clube de início</span><div className="club-picker">{leagueClubs.map((club) => <button key={club.id} onClick={() => setClubId(club.id)} className={`club-choice ${clubId === club.id ? "selected" : ""}`}><ClubCrest club={club} small /><span>{club.name}</span><small>FOR {club.strength}</small></button>)}</div></div></div><fieldset className="play-style-choice"><legend>Seu jeito de decidir</legend><p>Vale para as finais comuns. Mundiais têm desafios próprios. A escolha fica com você até o fim da carreira.</p><div>{(["skill","mixed","luck"] as PlayStyle[]).map(style=><button type="button" key={style} aria-pressed={playStyle===style} onClick={()=>setPlayStyle(style)}><b>{playStyleLabels[style]}</b><small>{style==="skill"?"Memória, timing e precisão":style==="luck"?"Leitura, escolha e chance":"Alterne as duas maneiras de jogar"}</small></button>)}</div></fieldset><label className="generational-option field-wide"><input type="checkbox" checked={generational} onChange={(event) => setGenerational(event.target.checked)} /><span><b>✦ CRAQUE GERACIONAL</b><small>OVR inicial entre 62 e 70, mais finais, títulos e propostas de clubes fortes.</small></span></label><button className="button button-primary button-full" onClick={() => onCreate({ name, position, club: selected, foot, height, shirt, nationality, mode: generational ? "generational" : "normal", playStyle })}>ASSINAR PRIMEIRO CONTRATO <span>→</span></button></section></main>;
}

function formatMonthlySalary(amount: number) { return `US$ ${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(amount)}/mês`; }

function MarketPanel({career,club,onProposal,onNegotiate,onStay,onCountry}:{career:CareerState;club:Club;onProposal:(offer:NonNullable<CareerState["marketWindow"]>["renewal"])=>void;onNegotiate:(clubId:string,priority:"salary"|"role"|"duration")=>void;onStay:()=>void;onCountry:(country:string)=>void}) {
  const [country,setCountry]=useState("");
  const market=career.marketWindow!;
  const countriesAvailable=Array.from(new Set(clubs.filter(c=>c.id!==club.id).map(c=>c.country))).sort((a,b)=>a.localeCompare(b,"pt-BR"));
  if(market.phase==="preference") return <section className="inline-event market-inline"><small>EMPRESÁRIO · {market.kind==="loan"?"EMPRÉSTIMO":"MERCADO"}</small><h3>Onde você gostaria de jogar?</h3><p>Escolha um país para priorizar ou procure oportunidades no mundo todo. O interesse dos clubes não é garantido.</p><label htmlFor="market-country">País de preferência</label><select id="market-country" value={country} onChange={e=>setCountry(e.target.value)}><option value="">Mundo todo</option>{countriesAvailable.map(name=><option key={name} value={name}>{name}</option>)}</select><button onClick={()=>onCountry(country)}>BUSCAR PROPOSTAS</button><button onClick={onStay}>CANCELAR BUSCA</button></section>;
  return <section className="inline-event market-inline"><small>{market.kind==="loan"?"EMPRÉSTIMOS":"JANELA DE MERCADO"} · {market.offers.length} PROPOSTAS</small><h3>Escolha seu próximo caminho.</h3><p>{market.preferredCountry?`Busca priorizada: ${market.preferredCountry}. `:"Busca mundial. "}{market.kind==="loan"?"O retorno ao clube de origem acontece ao fim do empréstimo.":"A apresentação ao novo clube ocorre na próxima temporada."}</p>{market.offers.length<5&&<p>Há poucas propostas para este perfil nesta janela.</p>}<p>Uma negociação por clube: 55% de aceitação, 30% de recusa mantendo a oferta e 15% de retirada.</p><button onClick={onStay}>{market.kind==="loan"?"VOLTAR SEM EMPRÉSTIMO":"PERMANECER SEM RENOVAR"}</button><div className="inline-offers">{market.offers.map(offer=>{const target=clubs.find(item=>item.id===offer.clubId)??club;const league=competitions.find(item=>item.id===(career.leagueAssignments[target.id]??target.leagueId));const used=career.negotiatedOffers?.includes(`${career.season}:${market.kind??"transfer"}:${offer.clubId}`)||career.negotiatedOffers?.includes(`${career.season}:${offer.clubId}`);return <article key={offer.clubId}><ClubCrest club={target} small/><div><b>{target.name}</b><span>{target.country} · {league?.name??"Liga"} · {offer.role.toUpperCase()} · {offer.seasons} {offer.seasons===1?"ano":"anos"} · {offer.expectedMinutes}% dos jogos</span><strong>{formatMonthlySalary(offer.monthlySalary)}</strong><small>{offer.idolatryChange<0?`${offer.idolatryChange} idolatria ao sair`:market.kind==="loan"?"Retorno ao clube de origem":"Nova oportunidade"}</small><div className="market-negotiations"><button disabled={used} onClick={()=>onNegotiate(offer.clubId,"salary")}>NEGOCIAR SALÁRIO ATÉ +12%</button><button disabled={used||offer.role==="estrela"} onClick={()=>onNegotiate(offer.clubId,"role")}>NEGOCIAR PAPEL</button>{market.kind!=="loan"&&<button disabled={used||offer.seasons>=5} onClick={()=>onNegotiate(offer.clubId,"duration")}>NEGOCIAR +1 ANO</button>}</div></div><button onClick={()=>onProposal(offer)}>ASSINAR</button></article>})}</div>{market.kind!=="loan"&&<button className="market-renewal" onClick={()=>onProposal(market.renewal)}><ClubCrest club={club} small/> RENOVAR COM {club.name.toUpperCase()} · {market.renewal.expectedMinutes}% DOS JOGOS · {formatMonthlySalary(market.renewal.monthlySalary)}</button>}</section>;
}

function Career({ career, club, result, event, seasonSummary, seasonConsequences, upgradeReady, onChooseEvent, onChooseCard, onChooseEvolution, onSkipCard, onRedrawCards, toast, onDismiss, onPlay, onShop, onRenew, onProposal, onNegotiate, onStay, onLoan, onCountry, onExit, activeGame, gameAttempt, onRestartGame, onFinishGame }: { career: CareerState; club: Club; result: SeasonResult | null; event: CareerEvent | null; seasonSummary: boolean; seasonConsequences: string[]; upgradeReady: boolean; onChooseEvent: (index: number) => void; onChooseCard: (card: UpgradeCard) => void; onChooseEvolution: (focus: EvolutionFocus) => void; onSkipCard: () => void; onRedrawCards: () => void; toast: string | null; onDismiss: () => void; onPlay: () => void; onShop: () => void; onRenew: () => void; onNegotiate:(clubId:string,priority:"salary"|"role"|"duration")=>void; onStay:()=>void; onLoan:()=>void; onCountry:(country:string)=>void; onExit:()=>void; onProposal: (offer: NonNullable<CareerState["marketWindow"]>["offers"][number] | NonNullable<CareerState["marketWindow"]>["renewal"]) => void; activeGame: MiniGameDefinition | null; gameAttempt: number; onRestartGame: () => void; onFinishGame: (won: boolean) => void }) {
  const player = career.player, ovr = computeOvr(player), idolatry = player.clubIdolatry[player.clubId] ?? 0;
  const top = positionAttributeKeys[player.position].map((key) => [key, player.attributes[key]] as const);
  const seasonGames = result?.games ?? player.games, seasonGoals = result?.goals ?? player.goals, seasonAssists = result?.assists ?? player.assists;
  const seasonRating = (5.4 + (player.form / 100) * 2.3 + Math.min(1.2, (seasonGoals + seasonAssists) / Math.max(1, seasonGames) * .8)).toFixed(1);
  const currentLeague = competitions.find((entry) => entry.id === (career.leagueAssignments[club.id] ?? club.leagueId));
  const upgradeCards = chooseUpgradeCards(player.position, cardHandSeed(career), career.recentCardIds);
  return <main className="app-shell career-shell dashboard-shell">
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <section className="athlete-panel">
          <div className="athlete-head">
            <div className="rating-block"><strong>{ovr}</strong><span>OVERALL</span></div>
            <div className="athlete-identity"><h1><i>{player.nationality === "Brasil" ? "🇧🇷" : "⚽"}</i> {player.name.toUpperCase()} <b>· {player.position} · {player.age} ANOS</b></h1><p>{club.name.toUpperCase()} · {(currentLeague?.name ?? career.currentCompetition).toUpperCase()} · <em>FAMA {player.fame}</em></p></div>
            <ClubCrest club={club} />
          </div>
          <div className="score-strip"><StatTile value={player.goals} label="GOLS" accent /><StatTile value={player.assists} label="ASSISTÊNCIAS" /><StatTile value={player.games} label="JOGOS" /><StatTile value={player.titles.length} label="TÍTULOS" /></div>
          <div className="attribute-chips">{top.map(([key, value]) => <div key={key}><b className={value >= 75 ? "green" : ""}>{value}</b><span>{attributeLabels[key]}</span></div>)}</div>
          <div className="finance-strip"><div><b>US$ {(player.marketValue / 1_000_000).toFixed(1)}M</b><span>VALOR</span></div><div><b>{formatMonthlySalary(career.contract.monthlySalary)}</b><span>MENSAL</span></div><div className="next-match"><ClubCrest club={club} small /><b>{career.currentCompetition}</b><span>{club.style === "posse" ? "EQUIPE DE POSSE" : "PRÓXIMO DESAFIO"}</span></div></div>
          <div className="loyalty"><span>IDOLATRIA {idolatry}/100 · {idolTier(idolatry)}</span><div className="loyalty-track"><i style={{ width: `${idolatry}%` }} /></div><small>{nextIdolTier(idolatry)} · 80: homenagem de ídolo · 95: estátua no arquivo do clube</small><div className="loyalty-stages"><span>●</span><span>♥</span><span>★</span><span>♛</span></div></div>
          <div className="selection-line">{player.nationality === "Brasil" ? "🇧🇷" : "⚽"} SELEÇÃO: {career.nationalTeam.games ? `${career.nationalTeam.games} J · ${career.nationalTeam.goals} G` : player.age < 20 ? "BASE EM OBSERVAÇÃO" : "EM OBSERVAÇÃO"}<span>{career.careerProfile ? `PERFIL: ${career.careerProfile} · ` : ""}US$ {(career.balance / 1_000_000).toFixed(2)}M · {career.history.length} TEMPORADAS</span></div>
          <div className="athlete-actions"><button className="athlete-store" onClick={onShop} aria-label="Abrir loja">LOJA <span aria-hidden="true">↗</span></button><button disabled={Boolean(event||activeGame||career.marketWindow||career.loan||career.pendingTransfer)||(career.exitRequests??0)>=2} onClick={onExit}>PEDIR SAÍDA <small>−3 TORCIDA</small></button><span>{career.season} · CONTRATO {career.contract.seasonsRemaining} TEMP.</span></div>
        </section>
        <section className="season-panel">
          <div className="season-titleline"><span>O REI ESPORTIVO</span><small>{result?.season ?? career.season}/{String((result?.season ?? career.season) + 1).slice(-2)} · TEMPORADA {Math.max(1,career.history.length)}</small></div>
          <h2>{result?.nationalTeamTitle ? "CAMPEÃO PELA SELEÇÃO" : result?.title ? "A TEMPORADA FOI SUA" : seasonGames ? "A HISTÓRIA CONTINUA" : "PRONTO PARA ESTREAR?"}</h2>
          <p>{result?.nationalTeamTitle ? `${player.name} conquistou a ${result.nationalTeamTitle} representando ${player.nationality}.` : result ? `${player.name} fechou o ano com números que a torcida vai lembrar.` : `Seu caminho no ${club.name} começa agora. Toda temporada deixa uma marca.`}</p>
          <div className="club-season"><ClubCrest club={club} /><div><b>{clubs.find(c=>c.id===result?.clubId)?.name ?? club.name}</b><span>{result?.leagueName ?? career.currentCompetition}</span></div></div>
          <div className="season-stats"><StatTile value={seasonGames} label="JOGOS" /><StatTile value={seasonGoals} label="GOLS" accent /><StatTile value={seasonAssists} label="ASSIST." accent={player.position === "MEI"} /><StatTile value={result?.rating ?? (seasonGames ? seasonRating : "—")} label="NOTA" /><StatTile value={`US$ ${(((result?.annualEarnings ?? 0) / 1_000_000)).toFixed(2)}M`} label="GANHOS" gold /></div>
          <button className="play-button" onClick={onPlay} disabled={Boolean(event || career.marketWindow || activeGame || upgradeReady || career.pendingEvolution)}>{event ? "RESOLVA A DECISÃO ABAIXO" : career.marketWindow ? "RESOLVA AS PROPOSTAS ABAIXO" : activeGame ? "RESOLVA O MINIGAME ABAIXO" : "CONTINUAR"}</button>
          {seasonSummary && !upgradeReady && !career.loan && !career.marketWindow && !career.pendingTransfer && <button className="market-action" onClick={onLoan}>PEDIR PROPOSTAS DE EMPRÉSTIMO</button>}
          {career.contract.seasonsRemaining <= 1 && !career.marketWindow && <button className="market-action" onClick={onRenew}>RENOVAR CONTRATO · 3 ANOS</button>}
          {upgradeReady && !career.pendingEvolution && <div className="card-redraw-tools"><button disabled={!canRedrawCards(career)} onClick={onRedrawCards}>TROCAR AS 3 CARTAS</button><small>{3-(career.cardRedraws?.used??0)} trocas restantes na carreira · intervalo de 2 temporadas</small></div>}{upgradeReady && !result && <Evolution player={player} seed={cardHandSeed(career)} recent={career.recentCardIds} onSelect={onChooseCard} onSkip={onSkipCard} />}
          {seasonSummary && result && <section className="inline-event season-summary"><small>RESUMO DA TEMPORADA · {result.season} · TEMPORADA {career.history.length}</small><h3>{competitions.find((entry)=>entry.id===result.leagueId)?.flag ?? "🏆"} {result.leagueName ?? career.currentCompetition}</h3><p><b>{clubs.find((entry)=>entry.id===result.clubId)?.name ?? club.name}</b> · divisão {result.division ?? "—"} · {result.leaguePosition}º lugar com {result.leaguePoints} pontos. {result.access === "promoted" ? "A classificação garantiu o acesso." : result.access === "stayed" ? "A Copa do Acesso não mudou a divisão." : result.relegated ? "A campanha regular terminou em rebaixamento." : "Campanha regular encerrada."}</p><div className="season-stats"><StatTile value={result.games} label="JOGOS" /><StatTile value={player.position === "GOL" ? result.cleanSheets : result.goals} label={player.position === "GOL" ? "JOGOS SEM GOLS" : "GOLS"} accent /><StatTile value={result.assists} label="ASSIST." /><StatTile value={result.rating ?? seasonRating} label="NOTA" /><StatTile value={`US$ ${((result.annualEarnings ?? 0) / 1_000_000).toFixed(2)}M`} label="GANHOS" gold /></div><details className="league-details"><summary>VER CLASSIFICAÇÃO · pontos, saldo e gols marcados</summary><div className="league-scroll"><table><thead><tr><th>Pos.</th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr></thead><tbody>{career.leagueTables[result.leagueId ?? ""]?.entries.map(row=><tr key={row.clubId}><td>{row.position}</td><td>{clubs.find(c=>c.id===row.clubId)?.name}</td><td>{row.played}</td><td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td><td>{row.goalsFor-row.goalsAgainst}</td><td>{row.points}</td></tr>)}</tbody></table></div></details>{career.evolutionRulesVersion===2 && result.evolution && <CareerEvolutionSummary evolution={result.evolution} />}<SeasonCampaignBoard result={result} consequences={seasonConsequences} />{career.pendingEvolution && <EvolutionRadar player={player} evolution={career.pendingEvolution} onChoose={onChooseEvolution} />}{upgradeReady && !career.pendingEvolution && <div className="inline-cards"><b>PRÉ-TEMPORADA · ESCOLHA SEU TREINO</b><div className="card-grid">{upgradeCards.map((card, index) => <button key={`${card.id}-${index}`} className={`training-card ${card.rarity}`} onClick={() => onChooseCard(card)}><span className="rarity">{card.rarity}</span><b>{card.name}</b><div>{Object.entries(card.changes).map(([key, value]) => <span key={key}>+{value} {attributeLabels[key]}</span>)}</div><i>TREINAR →</i></button>)}</div><button className="text-action" onClick={onSkipCard}>Pular pré-temporada</button></div>}</section>}
          {event && <section className="inline-event"><small>{event.context ? event.context.toUpperCase() : "DECISÃO DE CARREIRA"}</small><h3>{event.title}</h3><p>{event.copy}</p>{event.sponsor && <img className="sponsor-mark" src={event.sponsor.logo} alt="" />}{event.choices.map((choice,index)=><button key={choice.label} onClick={()=>onChooseEvent(index)}>{choice.label}{event.context === "imprensa" && career.shop.activeSeasonal.includes("imprensa") && <small> · Fama {choice.fame ?? 0} · Torcida {choice.idolatry ?? 0} · Forma {choice.form ?? 0}</small>}</button>)}</section>}{career.marketWindow && seasonSummary && !upgradeReady && !career.pendingEvolution && <MarketPanel career={career} club={club} onProposal={onProposal} onNegotiate={onNegotiate} onStay={onStay} onCountry={onCountry} />}
    {activeGame && result?.finalOpportunity && !event && isWorldDecision(result) && <WorldDecisionHeader result={result} game={activeGame} />}
    {activeGame && result?.finalOpportunity && !event && <MiniGame key={`${result.cupFinal?.campaignId ?? "final"}:${result.cupFinal?.campaignMatchIndex ?? 0}:${result.cupFinal?.attempt ?? "regulation"}:${activeGame.id}:${gameAttempt}`} game={activeGame} seed={career.seed} player={player} playStyle={career.playStyle??"mixed"} result={result} onFinish={onFinishGame} />}
        </section>
      </div>
      <aside className="trajectory-panel"><div className="trajectory-label">TRAJETÓRIA</div><div className="trajectory-item active"><ClubCrest club={club} small /><div><b>PRÓXIMA · {career.season}</b><span>{club.name} · {career.currentCompetition}</span><small>contrato atual · {career.contract.role}</small></div></div>{career.history.slice(-3).reverse().map((season) => <div className="trajectory-item" key={season.season}><span className="trajectory-dot" /><div><b>{season.season}</b><span>{clubs.find((item) => item.id === season.clubId)?.name ?? "Clube"} · {season.leagueName ?? "Liga"}</span><small>{season.games} JG · {season.goals} GL {season.titles?.length ? `· ${season.titles.length} título(s)` : ""}</small></div></div>)}</aside>
    </div>

    {toast && <button className="toast" onClick={onDismiss}>{toast}<span>×</span></button>}
  </main>;
}
function StatTile({ value, label, accent = false, gold = false }: { value: string | number; label: string; accent?: boolean; gold?: boolean }) { return <div className={`stat-tile ${accent ? "accent" : ""} ${gold ? "gold" : ""}`}><b>{value}</b><span>{label}</span></div>; }

function CareerEvolutionSummary({evolution}:{evolution:SeasonEvolution}) {
  const describe=(gains:SeasonEvolution["gains"])=>Object.entries(gains??{}).map(([key,value])=>`${(value??0)>0?"+":""}${value} ${attributeLabels[key]??key}`).join(" · ")||"nenhuma";
  return <section className="summary-block"><div className="summary-heading"><div><small>EVOLUÇÃO DO ATLETA</small><b>OVR {evolution.ovrBefore} → {evolution.ovrAfter}</b></div></div><p>Carta: {describe(evolution.cardGains)}</p><p>Evolução natural: {describe(evolution.gains)}</p><p>Queda por idade: {describe(evolution.ageLosses)}</p><p>Impacto dos títulos anteriores: {evolution.titlePoints??0}</p></section>;
}

function isWorldDecision(result: SeasonResult) { return result.cupFinal?.stakes === "campaign" && ["wc", "cwc"].includes(result.cupFinal.competitionId); }
function WorldDecisionHeader({ result, game }: { result: SeasonResult; game: MiniGameDefinition }) {
  const final = result.cupFinal!;
  const campaign = result.campaigns?.find((item) => item.id === final.campaignId);
  const index = final.campaignMatchIndex ?? 0;
  const completed = campaign?.matches.filter((match) => match.result !== "pending").length ?? 0;
  return <section className="world-decision" aria-label={`Campanha da ${final.competitionName}`}>
    <div><small>{final.competitionId === "wc" ? "SELEÇÕES · 48 PARTICIPANTES" : "CLUBES · 32 PARTICIPANTES"}</small><h3>{final.competitionName}</h3><p>{campaign?.matches[index]?.phase} · contra <b>{final.opponentClubName}</b></p></div>
    <div className="world-progress"><span>{completed}/{campaign?.matches.length ?? 0} jogos concluídos</span><meter min={0} max={campaign?.matches.length ?? 1} value={completed} /></div>
    <p className="world-rule">Modalidade desta edição: <b>{game.name}</b>. {final.attempt === "penalties" ? "Disputa de pênaltis: mesma modalidade, dificuldade elevada e resultado definitivo." : final.worldStage === "group" ? "Vitória vale 3 pontos; uma derrota pode virar empate conforme o sorteio já salvo." : "Mata-mata: uma derrota pode levar aos pênaltis conforme o sorteio já salvo."}</p>
  </section>;
}

function SeasonCampaignBoard({ result, consequences }: { result: SeasonResult; consequences: string[] }) {
  const statusLabel = (status: NonNullable<SeasonResult["campaigns"]>[number]["status"]) => ({ champion: "CAMPEÃO", eliminated: "ELIMINADO", final: "FINAL", active: "EM ANDAMENTO", scheduled: "AGENDADA" }[status]);
  const campaignTone = (status: NonNullable<SeasonResult["campaigns"]>[number]["status"]) => status === "champion" ? "champion" : status === "eliminated" ? "eliminated" : "active";
  return <div className="season-board">
    {result.campaigns?.length ? <section className="summary-block campaigns-block">
      <div className="summary-heading"><span>⌁</span><div><small>CAMPANHAS DA TEMPORADA</small><b>Seu caminho em cada competição</b></div></div>
      <div className="campaign-grid">{result.campaigns.map((campaign) => <article className={`campaign-card ${campaignTone(campaign.status)}`} key={campaign.id}>
        <header><div><small>{campaign.category.toUpperCase()}</small><b>{campaign.competitionName}</b></div><strong>{statusLabel(campaign.status)}</strong></header>
        <p>Classificação: {campaign.qualification.source}</p><div className="campaign-stage"><span>FASE FINAL</span><b>{campaign.phase}</b></div>
        {campaign.matches.length ? <div className="campaign-matches">{campaign.matches.map((match, index) => <div className={`campaign-match ${match.result}`} key={`${match.phase}-${match.opponentName}-${index}`}><small>{match.phase}</small><span>{match.opponentName}</span><b>{match.playerGoals ?? "—"}–{match.opponentGoals ?? "—"}</b></div>)}</div> : <p className="campaign-empty">Campanha ainda sem partidas registradas.</p>}
        {campaign.groupTable ? <details className="campaign-group"><summary>VER CLASSIFICAÇÃO DO GRUPO</summary><div>{campaign.groupTable.map((row) => <p key={`${row.position}-${row.name}`}><b>{row.position}º</b><span>{row.name}</span><small>SG {row.goalDifference >= 0 ? "+" : ""}{row.goalDifference} · GP {row.goalsFor}</small><strong>{row.points} pts</strong></p>)}</div></details> : null}
        {campaign.groups?.length ? <details className="campaign-groups"><summary>VER TODOS OS {campaign.groups.length} GRUPOS</summary>{campaign.groups.map((group) => <div key={group.name}><b>{group.name}</b><span>{group.participantIds.map((id) => campaign.participants?.find((participant) => participant.id === id)?.name ?? id).join(" · ")}</span></div>)}</details> : null}
        {campaign.participants?.length ? <small className="campaign-field">{campaign.participants.length} participantes congelados · vaga: {campaign.qualification.source}</small> : null}
      </article>)}</div>
    </section> : null}
    {result.calendar?.length ? <section className="summary-block calendar-block"><div className="summary-heading"><span>◷</span><div><small>CALENDÁRIO</small><b>Competições e decisões da temporada</b></div></div><div className="calendar-list">{result.calendar.map((item, index) => <article key={`${item.competition}-${index}`}><span>{index + 1}</span><div><b>{item.competition}</b><small>{item.phase}{item.opponent ? ` · ${item.opponent}` : ""}</small></div></article>)}</div></section> : null}
    {(result.titles ?? []).length ? <section className="summary-block titles-block"><div className="summary-heading"><span>🏆</span><div><small>TÍTULOS CONQUISTADOS</small><b>{result.titles?.length} conquista{result.titles?.length === 1 ? "" : "s"} nesta temporada</b></div></div><div className="title-chips">{result.titles?.map((title) => <span key={title}>🏆 {title}</span>)}</div></section> : null}
    {(result.consequences ?? consequences).length ? <section className="summary-block consequences-block"><div className="summary-heading"><span>✦</span><div><small>CONSEQUÊNCIAS DAS DECISÕES</small><b>O que ficou marcado neste ano</b></div></div><ul>{(result.consequences ?? consequences).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section> : null}
  </div>;
}

function EvolutionRadar({ player, evolution, onChoose }: { player: Player; evolution: SeasonEvolution; onChoose: (focus: EvolutionFocus) => void }) {
  const groups: Record<Position, Record<EvolutionFocus, string[]>> = {
    GOL: { assinatura: ["reflexo"], estilo: ["elasticidade", "posicionamento", "saida"], liderancaFisica: ["lideranca", "fisico"] },
    MEI: { assinatura: ["passe"], estilo: ["velocidade", "finalizacao", "drible"], liderancaFisica: ["lideranca", "fisico"] },
    ATA: { assinatura: ["finalizacao"], estilo: ["cabecada", "velocidade"], liderancaFisica: ["forca", "lideranca", "fisico"] },
  };
  const copy: Record<EvolutionFocus, string> = {
    assinatura: "O atributo que define seu jogo.",
    estilo: "Técnica e recursos para construir sua identidade.",
    liderancaFisica: "Presença, resistência e influência no elenco.",
  };
  return <section className="evolution-radar">
    <div className="radar-heading"><div><small>RADAR DE EVOLUÇÃO · {evolution.mode === "generational" ? "CRAQUE GERACIONAL" : "CARREIRA NORMAL"}</small><h3>Escolha seu próximo salto.</h3><p>Você tem <b>{evolution.points} pontos naturais</b> para desenvolver nesta pré-temporada.</p></div><strong>{evolution.points}<span>PTS</span></strong></div>
    <div className="radar-stats"><span>IDADE <b>{evolution.age}</b></span><span>FASE ATUAL <b>{evolution.age <= 22 ? "ASCENSÃO" : evolution.age <= 26 ? "AUGE" : "EXPERIÊNCIA"}</b></span><span>ATÉ OS 30 <b>EVOLUÇÃO NATURAL</b></span></div>
    <div className="radar-focuses">{evolution.available.map((focus) => <button key={focus} onClick={() => onChoose(focus)}><small>{evolutionFocusLabel[focus].toUpperCase()}</small><b>{groups[player.position][focus].map((key) => attributeLabels[key]).join(" · ")}</b><span>{copy[focus]}</span><i>ESCOLHER FOCO →</i></button>)}</div>
    <p className="radar-note">Após 85, atributos evoluem mais lentamente. Duas escolhas seguidas no mesmo foco podem liberar +1 no atributo de assinatura.</p>
  </section>;
}
function Meter({ label, value, gold = false }: { label: string; value: number; gold?: boolean }) { return <div className="form-meter"><span>{label}</span><b>{value}</b><i><em className={gold ? "gold" : ""} style={{ width: `${value}%` }} /></i></div>; }

function Event({ event, onChoose }: { event: CareerEvent; onChoose: (index: number) => void }) { return <main className="app-shell decision-shell"><div className="decision-card"><div className="eyebrow">FORA DAS QUATRO LINHAS</div><span className="decision-mark">◆</span><h1>{event.title}</h1><p>{event.copy}</p>{event.sponsor && <img className="sponsor-mark" src={event.sponsor.logo} alt={`Logo da ${event.sponsor.name}`} />}<div className="choice-list">{event.choices.map((choice, index) => <button key={choice.label} onClick={() => onChoose(index)}><span>0{index + 1}</span>{choice.label}<i>→</i></button>)}</div><small>Suas escolhas também viram parte da sua história.</small></div></main>; }
function Evolution({ player, seed, recent = [], onSelect, onSkip }: { player: Player; seed: number; recent?: string[]; onSelect: (card: UpgradeCard) => void; onSkip: () => void }) { const cards = chooseUpgradeCards(player.position, seed, recent); return <main className="app-shell evolution-shell"><nav className="topbar"><Brand compact /><span className="save-chip">EVOLUÇÃO DE TEMPORADA</span></nav><section className="evolution-wrap"><div className="eyebrow">MOMENTO DE TREINO</div><h1>Escolha o próximo salto.</h1><p>Uma carta por temporada. Ganhos reais, feitos para a posição que você escolheu.</p><div className="card-grid">{cards.map((card) => <button key={card.id} className={`training-card ${card.rarity}`} onClick={() => onSelect(card)}><span className="rarity">{card.rarity}</span><b>{card.name}</b><div>{Object.entries(card.changes).map(([key, value]) => <span key={key}>+{value} {attributeLabels[key]}</span>)}</div><i>ESCOLHER →</i></button>)}</div><button className="text-action" onClick={onSkip}>Pular evolução desta temporada</button></section></main>; }
function Market({ currentClub, player, generational, academy, onBack, onSelect }: { currentClub: Club; player: Player; generational: boolean; academy: boolean; onBack: () => void; onSelect: (club: Club) => void }) { const offers = clubs.filter((club) => club.id !== currentClub.id).sort((a, b) => academy || generational ? (b.reputation + b.strength) - (a.reputation + a.strength) : Number(currentClub.rivals.includes(b.id)) - Number(currentClub.rivals.includes(a.id))).slice(0, academy ? 6 : generational ? 6 : 4); return <main className="app-shell market-shell"><nav className="topbar"><button className="back-button" onClick={onBack}>← Carreira</button><Brand compact /><span className="step">JANELA DE MERCADO</span></nav><section className="market-wrap"><div className="eyebrow">CONTRATOS E CONSEQUÊNCIAS</div><h1>O mercado está de olho.</h1><p>Trocar de clube não é apenas mudar de camisa. Em clássico, a arquibancada não esquece.</p><div className="offer-list"><article className="offer current"><ClubCrest club={currentClub} /><div><small>CLUBE ATUAL</small><h2>{currentClub.name}</h2><p>Idolatria: {player.clubIdolatry[currentClub.id] ?? 0}/100 · contrato ativo</p></div><b>FICAR</b></article>{offers.map((club) => { const rival = currentClub.rivals.includes(club.id); return <article className={`offer ${rival ? "rival" : ""}`} key={club.id}><ClubCrest club={club} /><div><small>{rival ? "RIVAL DIRETO · RISCO DE JUDAS" : "PROPOSTA FORMAL"}</small><h2>{club.name}</h2><p>Força {club.strength} · reputação {club.reputation}</p></div><button className="button button-ghost" onClick={() => onSelect(club)}>ANALISAR</button></article>; })}</div></section></main>; }
function Celebration({ celebration, onClose }: { celebration: Celebration; onClose: () => void }) {
  const accessOnly = Boolean(celebration.access) && celebration.title === "Jogo do Acesso";
  return <main className="app-shell celebration-shell"><div className="celebration-frame" /><section className="celebration-card"><div className="celebration-rays" /><div className="generic-trophy" aria-label="Troféu dourado">🏆</div>{accessOnly ? <><div className="eyebrow">NOVO CAPÍTULO</div><h1>VOCÊ CONSEGUIU<br />O ACESSO À</h1><h2>{celebration.access}</h2></> : <><div className="eyebrow">NOITE DE GLÓRIA</div><h1>VOCÊ FOI CAMPEÃO<br />DO/DA</h1><h2>{celebration.title}</h2>{celebration.access && <p>ACESSO GARANTIDO À {celebration.access}</p>}</>}<button className="celebration-close" onClick={onClose}>CONTINUAR A HISTÓRIA →</button></section></main>;
}
function MiniGame({game,result,onFinish,seed,player,playStyle}:{seed:number;player:Player;playStyle:PlayStyle;game:MiniGameDefinition;result:SeasonResult|null;onFinish:(won:boolean)=>void}) {
  const difficulty=game.difficulty==='easy'?'easy':game.difficulty==='hard'||game.difficulty==='veryHard'?'hard':'standard';
  const final=result?.cupFinal;
  const challenge:ChallengeContext={attributeLabel:player.position==="GOL"?"Reflexo":"Finalização",finishing:player.position==="GOL"?player.attributes.reflexo:player.attributes.finalizacao,speed:player.attributes.velocidade,identity:playStyle,stakes:final?.stakes==="campaign"||(competitions.find(c=>c.id===final?.competitionId)?.prestige??0)>=85?"high":"normal",campaignRound:(final?.campaignMatchIndex??0)+1};
  const homeClub=clubs.find(club=>club.id===result?.clubId);
  const opponent=clubs.find(club=>club.id===final?.opponentClubId);
  return <>{final&&result&&!isWorldDecision(result)&&<header className="match-briefing"><small>EM CAMPO · {result.season}</small><h3>{final.competitionName}</h3><div>{final.scope!=='national'&&homeClub&&<><ClubCrest club={homeClub} small/><b>{homeClub.name}</b><span>vs</span></>}{opponent&&<ClubCrest club={opponent} small/>}<b>{final.opponentClubName}</b></div></header>}<MiniGameArena game={game} difficulty={difficulty} challenge={challenge} seed={seed+(result?.season??2026)*101+(result?.cupFinal?.campaignMatchIndex??0)+(final?.attempt==='penalties'?977:0)} context={decisionAttemptKey(seed,result?.season??2026,final)} autoStart={final?.stakes==='campaign'&&(final.campaignMatchIndex??0)>0} onFinish={r=>onFinish(r.won)}/></>;
}
