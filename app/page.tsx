"use client";

import { useEffect, useMemo, useState } from "react";
import { applyCard, applyFinalConsequence, baseAttributes, chooseUpgradeCards, clubCompetesIn, clubs, competitions, computeOvr, countries, generationalAttributes, legacy, miniGameForSeed, positionAttributeKeys, shouldRetire, simulateSeason, supabaseCareer, type CareerEvent, type CareerState, type Club, type MiniGameDefinition, type Player, type Position, type SeasonResult, type UpgradeCard } from "@/game";

type Screen = "home" | "create" | "career" | "evolution" | "event" | "shop" | "minigame" | "celebration" | "legacy" | "account" | "sync";
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
const CAREER_SUMMARY_RESET_KEY = "o-rei:career-live-reset:v4";
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
  if ((choice.injuryWeeks ?? 0) > 0) reactions.push("o desgaste ficou como alerta para a próxima temporada");
  return `${event.title}: você escolheu “${choice.label}”. ${reactions.length ? `${reactions.join(" e ")}.` : "A decisão entrou para a memória daquela temporada."}`;
}

function crestLetters(name: string) { return name.split(" ").map((word) => word[0]).join("").slice(0, 3).toUpperCase(); }
function ClubCrest({ club, small = false }: { club: Club; small?: boolean }) {
  const [missing, setMissing] = useState(false);
  return <span title={`Símbolo de ${club.name}`} className={`crest crest-${club.id} ${small ? "crest-small" : ""}`}>{missing ? crestLetters(club.name) : <img src={`/crests/${club.crest}.png`} alt={`Escudo do ${club.name}`} onError={() => setMissing(true)} />}</span>;
}
function Brand({ compact = false }: { compact?: boolean }) { return <div className={`brand ${compact ? "brand-compact" : ""}`}><img src="/o-rei-logo.png" alt="O REI — bola de couro e coroa" /></div>; }

function createInitialState(data: { name: string; position: Position; club: Club; foot: Player["preferredFoot"]; height: number; shirt: number; nationality: string; mode: "normal" | "generational" }): CareerState {
  const seed = Date.now();
  const player: Player = { id: `jogador-${seed}`, name: data.name.trim() || "Novo Craque", nationality: data.nationality, position: data.position, preferredFoot: data.foot, heightCm: data.height, shirtNumber: data.position === "MEI" ? 10 : data.position === "ATA" ? 9 : data.shirt, age: 16, clubId: data.club.id, attributes: data.mode === "generational" ? generationalAttributes(data.position, seed) : baseAttributes(), form: 68, fame: 3, salary: 16_700, marketValue: 400000, games: 0, goals: 0, assists: 0, cleanSheets: 0, saves: 0, titles: [], awards: [], clubIdolatry: { [data.club.id]: 12 }, judasAt: [], injuries: 0, benchAppearances: 0, nationalTeamGames: 0, nationalTeamGoals: 0, nationalTeamAssists: 0 };
  return { seed, season: 2026, player, history: [], clubHistory: [{ clubId: data.club.id, titles: [] }], currentCompetition: competitions.find((entry) => entry.id === data.club.leagueId)?.name ?? "Campeonato Nacional", mode: data.mode, balance: 0, contract: { clubId: data.club.id, monthlySalary: 16_700, seasonsRemaining: 3, role: "promessa", expectedMinutes: 28 }, leagueAssignments: Object.fromEntries(clubs.map((club) => [club.id, club.leagueId])), leagueTables: {}, shop: { ownedPermanent: [], activeSeasonal: [], freeUses: [] }, nationalTeam: { games: 0, goals: 0, assists: 0, titles: [] }, originCountry: data.club.country, highestOvr: computeOvr(player), clubStrengthAdjustments: {}, clubDynamics: {}, clubHonors: {}, recentEventIds: [], recentCardIds: [] };
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
  const [gameScore, setGameScore] = useState(0);
  const [activeGame, setActiveGame] = useState<MiniGameDefinition | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [cloudSession, setCloudSession] = useState<CloudSession | null>(null);
  const [cloudCareer, setCloudCareer] = useState<CareerState | null>(null);
  useEffect(() => {
    if (localStorage.getItem(CAREER_SUMMARY_RESET_KEY) !== "done") {
      ["o-rei-career", "o-rei:career:v1", LOCAL_RANKING_KEY].forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(CAREER_SUMMARY_RESET_KEY, "done");
      return;
    }
    const saved = localStorage.getItem("o-rei-career");
    if (saved) { try { const parsed = JSON.parse(saved) as CareerState; const validPosition = ["GOL", "MEI", "ATA"].includes(parsed.player?.position); const validAttributes = positionAttributeKeys[parsed.player?.position as Position]?.every((key) => typeof parsed.player.attributes?.[key] === "number"); if (validPosition && validAttributes) setCareer(parsed); else { localStorage.removeItem("o-rei-career"); setToast("A atualização de posições exige uma nova carreira."); } } catch { localStorage.removeItem("o-rei-career"); } }
    // Remove o antigo cache offline: ele podia manter o cliente de desenvolvimento
    // do Vite e abrir um painel de erro sobre o jogo.
    if ("serviceWorker" in navigator) navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister()))).catch(() => undefined);
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem(CLOUD_SESSION_KEY);
    if (stored) try { setCloudSession(JSON.parse(stored) as CloudSession); } catch { localStorage.removeItem(CLOUD_SESSION_KEY); }
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("access_token"), userId = params.get("user_id"), email = params.get("email") ?? undefined;
    if (token && userId) { const session = { token, userId, email }; localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(session)); setCloudSession(session); window.history.replaceState({}, "", window.location.pathname); }
    else if (token && supabaseCareer.configured()) supabaseCareer.currentUser(token).then((user) => { const session = { token, userId: user.id, email: user.email }; localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(session)); setCloudSession(session); window.history.replaceState({}, "", window.location.pathname); }).catch(() => setToast("Não foi possível concluir o login Google."));
  }, []);
  useEffect(() => { if (career) { localStorage.setItem("o-rei-career", JSON.stringify(career)); if (cloudSession && supabaseCareer.configured()) supabaseCareer.save(cloudSession.userId, cloudSession.token, career).catch(() => setToast("Não foi possível sincronizar agora. O save local continua protegido.")); } }, [career, cloudSession]);
  function begin(data: Parameters<typeof createInitialState>[0]) { setCareer(createInitialState(data)); setLastResult(null); setScreen("career"); }
  function finishSeason() { setEvent(null); setEventQueue([]); setSeasonSummary(true); setUpgradeReady(true); setScreen("career"); }
  function playSeason() { if (!career) return; const outcome = simulateSeason(career); setCareer(outcome.state); setLastResult(outcome.result); setGameScore(0); setActiveGame(miniGameForSeed(outcome.state.seed + outcome.state.season)); setSeasonSummary(false); setUpgradeReady(false); setSeasonConsequences([]); if (shouldRetire(outcome.state.player, outcome.state.seed)) { saveLocalRanking(outcome.state, clubs.find((entry) => entry.id === outcome.state.player.clubId) ?? clubs[0]); return setScreen("legacy"); } if (outcome.result.events.length) { setEvent(outcome.result.events[0]); setEventQueue(outcome.result.events.slice(1)); return; } if (outcome.result.title && !outcome.result.cupFinal) { setCelebration({ title: outcome.result.title }); return setScreen("celebration"); } if (outcome.result.finalOpportunity) return setScreen("minigame"); finishSeason(); }
  function settleFinal(player: Player, history: SeasonResult[], cupFinal: NonNullable<SeasonResult["cupFinal"]>, won: boolean) {
    if (!career) return;
    const titleWon = won && cupFinal.stakes !== "promotion";
    const national = cupFinal.scope === "national";
    let next: CareerState = titleWon && !national ? addClubTitle({ ...career, player, history }, cupFinal.competitionName) : { ...career, player, history };
    if (titleWon) {
      const prestige = competitions.find((entry) => entry.id === cupFinal.competitionId)?.prestige ?? 40;
      const honors = { ...(next.clubHonors ?? {}) };
      if (!national) honors[player.clubId] = [...(honors[player.clubId] ?? []), cupFinal.competitionName];
      next = { ...next, balance: next.balance + prestige * 50_000, clubHonors: honors, nationalTeam: national ? { ...next.nationalTeam, titles: [...next.nationalTeam.titles, cupFinal.competitionName] } : next.nationalTeam };
    }
    return applyFinalConsequence(next, cupFinal, won);
  }
  function resolveFinal(won: boolean) {
    if (!career || !lastResult?.cupFinal) return;
    const cupFinal = { ...lastResult.cupFinal, won };
    if (!won && cupFinal.stakes === "titleAndPromotion" && cupFinal.targetLeagueId) {
      const accessFinal = { ...cupFinal, won: undefined, stakes: "promotion" as const, phase: "access" as const, competitionName: "Jogo do Acesso" };
      const pending = { ...lastResult, cupFinal: accessFinal, access: "pending" as const, phaseReached: "Jogo do Acesso" };
      const history = [...career.history]; history[history.length - 1] = pending;
      setCareer({ ...career, history }); setLastResult(pending); setActiveGame(miniGameForSeed(career.seed + career.season + 91)); setGameScore(0); setToast("A taça escapou. Agora o Jogo do Acesso decide sua divisão."); setScreen("minigame");
      return;
    }
    const titleWon = won && cupFinal.stakes !== "promotion";
    const title = titleWon ? cupFinal.competitionName : lastResult.title;
    const titles = titleWon ? [...(lastResult.titles ?? []), cupFinal.competitionName].filter((value, index, all) => all.indexOf(value) === index) : (lastResult.titles ?? []);
    const access = cupFinal.stakes === "promotion" ? (won ? "promoted" : "stayed") : lastResult.access;
    const resolved = { ...lastResult, cupFinal, title, titles, nationalTeamTitle: titleWon && cupFinal.scope === "national" ? cupFinal.competitionName : lastResult.nationalTeamTitle, access };
    const player = { ...career.player, titles: [...career.player.titles], clubIdolatry: { ...career.player.clubIdolatry } };
    if (titleWon && cupFinal.scope !== "national") {
      player.titles.push(cupFinal.competitionName);
      player.clubIdolatry[player.clubId] = Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + 9);
    }
    const history = [...career.history]; history[history.length - 1] = resolved;
    setCareer(settleFinal(player, history, cupFinal, won)!); setLastResult(resolved);
  }
  function chooseEvent(index: number) {
    if (!career || !event) return;
    const choice = event.choices[index];
    if ((event.id === "emprestimo-inicial" && index === 0) || (event.id === "banco-contexto" && index === 2)) { requestLoan(); setSeasonConsequences((items) => [...items, eventConsequence(event, choice)]); if (eventQueue.length) { setEvent(eventQueue[0]); setEventQueue(eventQueue.slice(1)); } else finishSeason(); return; }
    const player = { ...career.player, clubIdolatry: { ...career.player.clubIdolatry }, titles: [...career.player.titles], attributes: { ...career.player.attributes } };
    const protectedByPress = career.shop.activeSeasonal.includes("imprensa");
    const soften = (value = 0) => protectedByPress && value < 0 ? Math.ceil(value / 2) : value;

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
      setToast(won ? "DEFESA DECISIVA! A taça é sua." : "A final escapou no último lance.");
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
    setCareer({ ...career, player, history });
    setLastResult(history[history.length - 1] ?? lastResult);
    setSeasonConsequences((items) => [...items, consequence]);
    if (eventQueue.length && !lastResult?.finalOpportunity) {
      setEvent(eventQueue[0]);
      setEventQueue(eventQueue.slice(1));
      return;
    }
    setToast("Decisões registradas. A arquibancada sentiu o impacto.");
    if (lastResult?.finalOpportunity) { setEventQueue([]); setScreen("minigame"); } else if (lastResult?.title) { setCelebration({ title: lastResult.title }); setScreen("celebration"); } else finishSeason();
  }
  function takeCard(card: UpgradeCard) { if (!career) return; setCareer({ ...career, player: applyCard(career.player, card), recentCardIds: [...(career.recentCardIds ?? []), card.id].slice(-6) }); setUpgradeReady(false); setToast(`${card.name} aplicada. OVR recalculado.`); }
  function renewContract() { if (!career) return; const monthlySalary = Math.round(career.contract.monthlySalary * 1.15); setCareer({ ...career, contract: { ...career.contract, monthlySalary, seasonsRemaining: 3 }, player: { ...career.player, salary: monthlySalary } }); setToast("Renovação assinada: 3 temporadas a mais."); }
  function requestLoan() { if (!career || career.loan) return; const parent = career.player.clubId; const target = clubs.filter((club) => club.id !== parent && club.country === (clubs.find((club) => club.id === parent)?.country ?? "")).sort((a,b)=>a.strength-b.strength)[0] ?? clubs[0]; const player = { ...career.player, clubId: target.id, clubIdolatry: { ...career.player.clubIdolatry, [target.id]: career.player.clubIdolatry[target.id] ?? 3 } }; const history = career.clubHistory.some((entry) => entry.clubId === target.id) ? career.clubHistory : [...career.clubHistory,{clubId:target.id,titles:[]}]; setCareer({ ...career, player, clubHistory: history, loan: { parentClubId: parent, returnSeason: career.season + 1 }, currentCompetition: competitions.find((competition) => competition.id === (career.leagueAssignments[target.id] ?? target.leagueId))?.name ?? career.currentCompetition }); setToast(`Empréstimo ao ${target.name} confirmado por uma temporada.`); }
  function transferTo(club: Club) { if (!career) return; const previous = clubs.find((item) => item.id === career.player.clubId); const rival = Boolean(previous?.rivals.includes(club.id)); const player = { ...career.player, clubId: club.id, clubIdolatry: { ...career.player.clubIdolatry, [club.id]: 5 }, judasAt: [...career.player.judasAt] }; if (rival && previous && !player.judasAt.includes(previous.id)) player.judasAt.push(previous.id); const clubHistory = (career.clubHistory ?? []).map((entry) => ({ ...entry, titles: [...entry.titles] })); if (!clubHistory.some((entry) => entry.clubId === club.id)) clubHistory.push({ clubId: club.id, titles: [] }); const monthlySalary = Math.max(200000, Math.round(club.budget * 22000 * (career.shop.ownedPermanent.includes("academia") ? 1.2 : 1))); const role = computeOvr(player) >= club.strength + 8 ? "estrela" : computeOvr(player) >= club.strength ? "titular" : "rotacao"; setCareer({ ...career, player, clubHistory, contract: { clubId: club.id, monthlySalary, seasonsRemaining: 3, role, expectedMinutes: role === "estrela" ? 42 : role === "titular" ? 34 : 22 } }); setToast(rival ? `Transferência selada. Parte da torcida do ${previous?.name} vai chamá-lo de Judas.` : `Contrato de 3 anos assinado com ${club.name}.`); setScreen("career"); }
  function acceptProposal(offer: NonNullable<CareerState["marketWindow"]>["offers"][number] | NonNullable<CareerState["marketWindow"]>["renewal"]) {
    if (!career) return;
    const previous = clubs.find((club) => club.id === career.player.clubId) ?? clubs[0];
    const target = clubs.find((club) => club.id === offer.clubId) ?? previous;
    const changingClub = target.id !== previous.id;
    const player = { ...career.player, clubId: target.id, salary: offer.monthlySalary, clubIdolatry: { ...career.player.clubIdolatry, [target.id]: changingClub ? Math.max(3, 8 + offer.idolatryChange) : (career.player.clubIdolatry[target.id] ?? 0) } };
    const clubHistory = changingClub && !career.clubHistory.some((entry) => entry.clubId === target.id) ? [...career.clubHistory, { clubId: target.id, titles: [] }] : career.clubHistory;
    const leagueId = career.leagueAssignments[target.id] ?? target.leagueId;
    setCareer({ ...career, player, clubHistory, currentCompetition: competitions.find((competition) => competition.id === leagueId)?.name ?? career.currentCompetition, contract: { clubId: target.id, monthlySalary: offer.monthlySalary, seasonsRemaining: offer.seasons, role: offer.role, expectedMinutes: offer.role === "estrela" ? 42 : offer.role === "titular" ? 34 : offer.role === "rotacao" ? 22 : 14 }, marketWindow: undefined });
    setToast(changingClub ? `Contrato assinado com ${target.name}.` : `Renovação assinada com ${target.name}.`);
  }
  const club = career ? clubs.find((item) => item.id === career.player.clubId) ?? clubs[0] : clubs[0];
  async function openAccount(session = cloudSession) {
    if (!session || !supabaseCareer.configured()) return setScreen("account");
    try { const remote = await supabaseCareer.load(session.userId, session.token); if (remote && career) { setCloudCareer(remote); setScreen("sync"); } else if (remote) { setCareer(remote); setScreen("career"); } else setScreen("career"); } catch { setToast("Não foi possível ler o save online agora."); }
  }
  function useCloudChoice(which: "local" | "cloud") { if (which === "cloud" && cloudCareer) setCareer(cloudCareer); setCloudCareer(null); setScreen("career"); }
  if (screen === "home") return <Start hasCareer={Boolean(career)} cloud={Boolean(cloudSession)} onNew={() => setScreen("create")} onContinue={() => cloudSession ? openAccount() : setScreen("career")} onAccount={() => setScreen("account")} />;
  if (screen === "create") return <Create onBack={() => setScreen("home")} onCreate={begin} />;
  if (screen === "account") return <Account onBack={() => setScreen("home")} onSignedIn={(session) => { localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(session)); setCloudSession(session); openAccount(session); }} />;
  if (screen === "sync" && cloudCareer && career) return <SyncChoice local={career} cloud={cloudCareer} onChoose={useCloudChoice} />;
  if (!career) return null;
  if (screen === "shop") return <Shop career={career} onBack={() => setScreen("career")} onChange={setCareer} onToast={setToast} />;
  if (screen === "minigame") return <MiniGame game={activeGame ?? miniGameForSeed(career.seed + career.season)} result={lastResult} score={gameScore} onScore={setGameScore} onFinish={(won) => { const luckyWin = !won && career.shop.activeSeasonal.includes("psicologo") && Math.random() < .35; const victory = won || luckyWin; const final = lastResult?.cupFinal; if (!victory && final?.stakes === "titleAndPromotion") return resolveFinal(false); resolveFinal(victory); setToast(won ? "Decisão vencida. Seu nome entrou na noite da final." : luckyWin ? "O psicólogo fez a diferença: a sorte ficou ao seu lado." : "A decisão escapou, mas a carreira continua."); if (victory && final) { setCelebration((final.stakes === "promotion" || final.stakes === "titleAndPromotion") ? { title: final.competitionName, access: competitions.find((entry) => entry.id === final.targetLeagueId)?.name ?? "nova divisão" } : { title: final.competitionName }); setScreen("celebration"); } else finishSeason(); }} />;
  if (screen === "celebration" && celebration) return <Celebration celebration={celebration} onClose={() => { setCelebration(null); finishSeason(); }} />;
    if (screen === "legacy") return <Legacy career={career} onRestart={() => { localStorage.removeItem("o-rei-career"); setCareer(null); setScreen("home"); }} />;
  return <Career career={career} club={club} result={lastResult} event={event} seasonSummary={seasonSummary} seasonConsequences={seasonConsequences} upgradeReady={upgradeReady} onChooseEvent={chooseEvent} onChooseCard={takeCard} onSkipCard={() => setUpgradeReady(false)} toast={toast} onDismiss={() => setToast(null)} onPlay={playSeason} onShop={() => setScreen("shop")} onRenew={renewContract} onProposal={acceptProposal} />;
}

function Start({ hasCareer, cloud, onNew, onContinue, onAccount }: { hasCareer: boolean; cloud: boolean; onNew: () => void; onContinue: () => void; onAccount: () => void }) { return <main className="app-shell start-shell"><div className="stadium-glow" /><nav className="topbar"><Brand compact /><button className="save-chip" onClick={onAccount}>◉ {cloud ? "CONTA CONECTADA" : "MODO VISITANTE"}</button></nav><section className="start-content"><div className="eyebrow">UMA CARREIRA. TODA A HISTÓRIA.</div><Brand /><h1>Do primeiro jogo à eternidade.</h1><p>Crie seu atleta aos 16 anos. Conquiste títulos, enfrente clássicos e escreva um legado que não cabe numa súmula.</p><div className="start-actions"><button className="button button-primary" onClick={onNew}>COMEÇAR CARREIRA <span>→</span></button>{hasCareer && <button className="button button-ghost" onClick={onContinue}>CONTINUAR CARREIRA</button>}</div><div className="feature-row"><span><b>10</b> minigames decisivos</span><span><b>18</b> atributos reais</span><span><b>0–1000</b> legado final</span></div></section><footer>O REI · futebol, escolhas e memória</footer></main>; }

function Account({ onBack, onSignedIn }: { onBack: () => void; onSignedIn: (session: CloudSession) => void }) {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [message, setMessage] = useState("");
  async function passwordAuth(signUp: boolean) { try { const response = signUp ? await supabaseCareer.signUp(email, password) : await supabaseCareer.signInWithPassword(email, password); if (!response.access_token || !response.user?.id) return setMessage("Confira seu e-mail para confirmar a conta e entre depois."); onSignedIn({ userId: response.user.id, token: response.access_token, email: response.user.email }); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível entrar."); } }
  return <main className="app-shell form-shell"><nav className="topbar"><button className="back-button" onClick={onBack}>← Voltar</button><Brand compact /><span className="step">CONTA</span></nav><section className="form-wrap"><div><div className="eyebrow">SAVE ONLINE</div><h1>Proteja sua carreira.</h1><p>Você pode continuar como visitante ou sincronizar suas temporadas em qualquer dispositivo.</p></div>{!supabaseCareer.configured() ? <p className="field-note">O modo online será liberado quando as chaves do Supabase forem configuradas.</p> : <><button className="button button-primary button-full" onClick={() => supabaseCareer.signInWithGoogle()}>ENTRAR COM GOOGLE</button><label className="field field-wide">E-mail<input value={email} type="email" onChange={(event) => setEmail(event.target.value)} /></label><label className="field field-wide">Senha<input value={password} type="password" minLength={6} onChange={(event) => setPassword(event.target.value)} /></label><div className="start-actions"><button className="button button-primary" onClick={() => passwordAuth(false)}>ENTRAR</button><button className="button button-ghost" onClick={() => passwordAuth(true)}>CRIAR CONTA</button></div>{message && <p className="field-note">{message}</p>}</>}<button className="text-action" onClick={onBack}>CONTINUAR COMO VISITANTE</button></section></main>;
}

function SyncChoice({ local, cloud, onChoose }: { local: CareerState; cloud: CareerState; onChoose: (choice: "local" | "cloud") => void }) { const card = (label: string, state: CareerState, choice: "local" | "cloud") => <button className="training-card raro" onClick={() => onChoose(choice)}><span className="rarity">{label}</span><b>{state.player.name}</b><div><span>{state.season} · {state.currentCompetition}</span><span>OVR {computeOvr(state.player)} · {state.history.length} temporadas</span></div><i>USAR ESTA CARREIRA →</i></button>; return <main className="app-shell evolution-shell"><section className="evolution-wrap"><div className="eyebrow">CONFLITO DE SAVE</div><h1>Escolha a carreira que deseja manter.</h1><p>A versão não escolhida será substituída pela escolhida na próxima sincronização.</p><div className="card-grid">{card("NESTE DISPOSITIVO", local, "local")}{card("SAVE ONLINE", cloud, "cloud")}</div></section></main>; }

function Create({ onBack, onCreate }: { onBack: () => void; onCreate: (data: Parameters<typeof createInitialState>[0]) => void }) {
  const [name, setName] = useState("Matheus"), [position, setPosition] = useState<Position>("MEI"), [leagueId, setLeagueId] = useState("bra-a"), [clubId, setClubId] = useState("santos"), [nationality, setNationality] = useState("Brasil"), [foot, setFoot] = useState<Player["preferredFoot"]>("Direito"), [height, setHeight] = useState(178), [shirt, setShirt] = useState(10), [generational, setGenerational] = useState(false), [countryOpen, setCountryOpen] = useState(false), [countrySearch, setCountrySearch] = useState("");
  const playableCompetitions = competitions.filter((competition) => competition.selectable && clubs.some((club) => clubCompetesIn(club, competition.id)));
  const leagueClubs = clubs.filter((club) => clubCompetesIn(club, leagueId)); const selected = leagueClubs.find((club) => club.id === clubId) ?? leagueClubs[0] ?? clubs[0];
  function switchLeague(next: string) { const first = clubs.find((club) => clubCompetesIn(club, next)); if (first) { setLeagueId(next); setClubId(first.id); } }
  const selectedCompetition = playableCompetitions.find((competition) => competition.id === leagueId);
  const selectedCountry = countries.find((country) => country.name === nationality) ?? countries.find((country) => country.code === "BR")!;
  const visibleCountries = countries.filter((country) => country.name.toLocaleLowerCase("pt-BR").includes(countrySearch.toLocaleLowerCase("pt-BR")));
  return <main className="app-shell form-shell"><nav className="topbar"><button className="back-button" onClick={onBack}>← Voltar</button><Brand compact /><span className="step">01 / 01</span></nav><section className="form-wrap"><div><div className="eyebrow">FICHA DE INSCRIÇÃO</div><h1>Seu primeiro contrato.</h1><p>Você começa aos 16 anos. O resto será conquistado em campo.</p></div><div className="form-grid"><label className="field field-wide">Nome do atleta<input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} /></label><div className="field country-field"><span>Nacionalidade</span><button type="button" className="country-trigger" onClick={() => setCountryOpen(!countryOpen)}><img src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`} alt="" /><span>{selectedCountry.name}</span><b>⌄</b></button>{countryOpen && <div className="country-menu"><input autoFocus value={countrySearch} onChange={(event) => setCountrySearch(event.target.value)} placeholder="Buscar país" aria-label="Buscar país" /> <div className="country-options">{visibleCountries.map((country) => <button type="button" key={country.code} onClick={() => { setNationality(country.name); setCountryOpen(false); setCountrySearch(""); }}><img src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} alt={`Bandeira de ${country.name}`} /><span>{country.name}</span></button>)}</div></div>}</div><label className="field">Pé dominante<select value={foot} onChange={(e) => setFoot(e.target.value as Player["preferredFoot"])}><option>Direito</option><option>Esquerdo</option><option>Ambidestro</option></select></label><div className="field field-wide"><span>Posição principal</span><div className="position-grid">{positions.map((item) => <button key={item.id} onClick={() => { setPosition(item.id); if (item.id === "MEI") setShirt(10); if (item.id === "ATA") setShirt(9); }} className={`position-choice ${position === item.id ? "selected" : ""}`}>{item.label}</button>)}</div></div><label className="field">Altura<input type="number" min={155} max={210} value={height} onChange={(e) => setHeight(Number(e.target.value))} /></label><label className="field">Camisa<input type="number" min={1} max={99} value={shirt} onChange={(e) => setShirt(Number(e.target.value))} /></label><label className="field field-wide">Liga de início<select value={leagueId} onChange={(e) => switchLeague(e.target.value)}>{playableCompetitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.flag} {competition.name}</option>)}</select><small className="field-note">{selectedCompetition?.flag} {selectedCompetition?.country} · {leagueClubs.length} clubes nesta edição</small></label><div className="field field-wide"><span>Clube de início</span><div className="club-picker">{leagueClubs.map((club) => <button key={club.id} onClick={() => setClubId(club.id)} className={`club-choice ${clubId === club.id ? "selected" : ""}`}><ClubCrest club={club} small /><span>{club.name}</span><small>FOR {club.strength}</small></button>)}</div></div></div><label className="generational-option field-wide"><input type="checkbox" checked={generational} onChange={(event) => setGenerational(event.target.checked)} /><span><b>✦ CRAQUE GERACIONAL</b><small>OVR inicial entre 62 e 70, mais finais, títulos e propostas de clubes fortes.</small></span></label><button className="button button-primary button-full" onClick={() => onCreate({ name, position, club: selected, foot, height, shirt, nationality, mode: generational ? "generational" : "normal" })}>ASSINAR PRIMEIRO CONTRATO <span>→</span></button></section></main>;
}

function Career({ career, club, result, event, seasonSummary, seasonConsequences, upgradeReady, onChooseEvent, onChooseCard, onSkipCard, toast, onDismiss, onPlay, onShop, onRenew, onProposal }: { career: CareerState; club: Club; result: SeasonResult | null; event: CareerEvent | null; seasonSummary: boolean; seasonConsequences: string[]; upgradeReady: boolean; onChooseEvent: (index: number) => void; onChooseCard: (card: UpgradeCard) => void; onSkipCard: () => void; toast: string | null; onDismiss: () => void; onPlay: () => void; onShop: () => void; onRenew: () => void; onProposal: (offer: NonNullable<CareerState["marketWindow"]>["offers"][number] | NonNullable<CareerState["marketWindow"]>["renewal"]) => void }) {
  const player = career.player, ovr = computeOvr(player), idolatry = player.clubIdolatry[player.clubId] ?? 0;
  const top = positionAttributeKeys[player.position].map((key) => [key, player.attributes[key]] as const);
  const seasonGames = result?.games ?? player.games, seasonGoals = result?.goals ?? player.goals, seasonAssists = result?.assists ?? player.assists;
  const seasonRating = (5.4 + (player.form / 100) * 2.3 + Math.min(1.2, (seasonGoals + seasonAssists) / Math.max(1, seasonGames) * .8)).toFixed(1);
  const currentLeague = competitions.find((entry) => entry.id === (career.leagueAssignments[club.id] ?? club.leagueId));
  const upgradeCards = chooseUpgradeCards(player.position, career.seed + career.season, career.recentCardIds);
  return <main className="app-shell career-shell dashboard-shell">
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <section className="athlete-panel">
          <div className="athlete-head">
            <div className="rating-block"><strong>{ovr}</strong><span>OVERALL</span></div>
            <div className="athlete-identity"><h1><i>{player.nationality === "Brasil" ? "🇧🇷" : "⚽"}</i> {player.name.toUpperCase()} <b>· {player.position}</b></h1><p>{club.name.toUpperCase()} · {career.currentCompetition.toUpperCase()} · <em>FAMA {player.fame}</em></p></div>
            <ClubCrest club={club} />
            <button className="panel-shop" onClick={onShop} aria-label="Abrir loja">🛒</button>
          </div>
          <div className="score-strip"><StatTile value={player.goals} label="GOLS" accent /><StatTile value={player.assists} label="ASSISTÊNCIAS" /><StatTile value={player.games} label="JOGOS" /><StatTile value={player.titles.length} label="TÍTULOS" /></div>
          <div className="attribute-chips">{top.map(([key, value]) => <div key={key}><b className={value >= 75 ? "green" : ""}>{value}</b><span>{attributeLabels[key]}</span></div>)}</div>
          <div className="finance-strip"><div><b>US$ {(player.marketValue / 1_000_000).toFixed(1)}M</b><span>VALOR</span></div><div><b>US$ {(career.contract.monthlySalary / 1_000_000).toFixed(2)}M</b><span>MENSAL</span></div><div className="next-match"><ClubCrest club={club} small /><b>{career.currentCompetition}</b><span>{club.style === "posse" ? "EQUIPE DE POSSE" : "PRÓXIMO DESAFIO"}</span></div></div>
          <div className="loyalty"><span>IDOLATRIA {idolatry}/100</span><div className="loyalty-track"><i style={{ width: `${idolatry}%` }} /></div><div className="loyalty-stages"><span>●</span><span>♥</span><span>★</span><span>♛</span></div></div>
          <div className="selection-line">{player.nationality === "Brasil" ? "🇧🇷" : "⚽"} SELEÇÃO: {career.nationalTeam.games ? `${career.nationalTeam.games} J · ${career.nationalTeam.goals} G` : "EM OBSERVAÇÃO"}<span>US$ {(career.balance / 1_000_000).toFixed(2)}M · {career.history.length} TEMPORADAS</span></div>
        </section>
        <section className="season-panel">
          <div className="season-titleline"><span>O REI ESPORTIVO</span><small>{career.season}/{String(career.season + 1).slice(-2)} · TEMPORADA {career.history.length + 1}</small></div>
          <h2>{result?.nationalTeamTitle ? "CAMPEÃO PELA SELEÇÃO" : result?.title ? "A TEMPORADA FOI SUA" : seasonGames ? "A HISTÓRIA CONTINUA" : "PRONTO PARA ESTREAR?"}</h2>
          <p>{result?.nationalTeamTitle ? `${player.name} conquistou a ${result.nationalTeamTitle} representando ${player.nationality}.` : result ? `${player.name} fechou o ano com números que a torcida vai lembrar.` : `Seu caminho no ${club.name} começa agora. Toda temporada deixa uma marca.`}</p>
          <div className="club-season"><ClubCrest club={club} /><div><b>{club.name}</b><span>{career.currentCompetition}</span></div></div>
          <div className="season-stats"><StatTile value={seasonGames} label="JOGOS" /><StatTile value={seasonGoals} label="GOLS" accent /><StatTile value={seasonAssists} label="ASSIST." accent={player.position === "MEI"} /><StatTile value={result?.rating ?? (seasonGames ? seasonRating : "—")} label="NOTA" /><StatTile value={`US$ ${(((result?.annualEarnings ?? career.contract.monthlySalary * 12) / 1_000_000)).toFixed(2)}M`} label="GANHOS" gold /></div>
          <button className="play-button" onClick={onPlay} disabled={Boolean(event || career.marketWindow)}>{event ? "RESOLVA A DECISÃO ABAIXO" : career.marketWindow ? "RESOLVA AS PROPOSTAS ABAIXO" : "CONTINUAR"}</button>
          {career.contract.seasonsRemaining <= 1 && !career.marketWindow && <button className="market-action" onClick={onRenew}>RENOVAR CONTRATO · 3 ANOS</button>}
          {seasonSummary && result && <section className="inline-event season-summary"><small>RESUMO DA TEMPORADA · {result.season} · TEMPORADA {career.history.length}</small><h3>{competitions.find((entry)=>entry.id===result.leagueId)?.flag ?? "🏆"} {result.leagueName ?? career.currentCompetition}</h3><p>{clubs.find((entry)=>entry.id===result.clubId)?.name ?? club.name} terminou em <b>{result.leaguePosition}º lugar</b>, com {result.leaguePoints} pontos. {result.access === "promoted" ? "O acesso foi conquistado no Jogo do Acesso." : result.access === "stayed" ? "O clube permanece na divisão após o Jogo do Acesso." : result.relegated ? "A campanha regular terminou em rebaixamento." : "A tabela registra a campanha regular."}</p><div className="season-stats"><StatTile value={result.games} label="JOGOS" /><StatTile value={result.goals} label="GOLS" accent /><StatTile value={result.assists} label="ASSIST." /><StatTile value={result.rating ?? seasonRating} label="NOTA" /><StatTile value={`US$ ${((result.annualEarnings ?? 0) / 1_000_000).toFixed(2)}M`} label="GANHOS" gold /></div>{(result.titles ?? []).length > 0 && <div className="season-consequences"><b>TÍTULOS CONQUISTADOS</b>{(result.titles ?? []).map((title) => <span key={title}>🏆 {title}</span>)}</div>}{(result.consequences ?? seasonConsequences).length > 0 && <div className="season-consequences"><b>CONSEQUÊNCIAS DAS DECISÕES</b>{(result.consequences ?? seasonConsequences).map((item, index) => <span key={`${item}-${index}`}>• {item}</span>)}</div>}{upgradeReady && <div className="inline-cards"><b>EVOLUÇÃO DA TEMPORADA</b><div className="card-grid">{upgradeCards.map((card, index) => <button key={`${card.id}-${index}`} className={`training-card ${card.rarity}`} onClick={() => onChooseCard(card)}><span className="rarity">{card.rarity}</span><b>{card.name}</b><div>{Object.entries(card.changes).map(([key, value]) => <span key={key}>+{value} {attributeLabels[key]}</span>)}</div><i>ESCOLHER →</i></button>)}</div><button className="text-action" onClick={onSkipCard}>Pular evolução desta temporada</button></div>}</section>}
          {event && <section className="inline-event"><small>{event.context ? event.context.toUpperCase() : "DECISÃO DE CARREIRA"}</small><h3>{event.title}</h3><p>{event.copy}</p>{event.sponsor && <img className="sponsor-mark" src={event.sponsor.logo} alt="" />}{event.choices.map((choice,index)=><button key={choice.label} onClick={()=>onChooseEvent(index)}>{choice.label}</button>)}</section>}{career.marketWindow && <section className="inline-event market-inline"><small>JANELA DE MERCADO · {career.marketWindow.offers.length} PROPOSTAS</small><h3>O mercado está de olho em você.</h3><p>Escolha uma proposta ou renove com o {club.name}. Seu clube atual sempre oferece continuidade.</p><div className="inline-offers">{career.marketWindow.offers.map((offer) => { const target=clubs.find((item)=>item.id===offer.clubId) ?? club; const league=competitions.find((item)=>item.id===(career.leagueAssignments[target.id] ?? target.leagueId)); return <article key={offer.clubId}><ClubCrest club={target} small /><div><b>{target.name}</b><span>{league?.name ?? "Liga"} · {offer.role.toUpperCase()} · {offer.seasons} anos</span><strong>US$ {(offer.monthlySalary/1_000_000).toFixed(2)}M/mês</strong><small>{offer.idolatryChange < 0 ? `${offer.idolatryChange} idolatria ao sair` : "Nova oportunidade"}</small></div><button onClick={()=>onProposal(offer)}>ASSINAR</button></article>})}</div><button className="market-renewal" onClick={()=>onProposal(career.marketWindow!.renewal)}><ClubCrest club={club} small /> RENOVAR COM {club.name.toUpperCase()} · US$ {(career.marketWindow.renewal.monthlySalary/1_000_000).toFixed(2)}M/MÊS</button></section>}
        </section>
      </div>
      <aside className="trajectory-panel"><div className="trajectory-label">TRAJETÓRIA</div><div className="trajectory-item active"><ClubCrest club={club} small /><div><b>{career.season}</b><span>{club.name} · {career.currentCompetition}</span><small>{seasonGames} JG · {seasonGoals} GL</small></div></div>{career.history.slice(-3).reverse().map((season) => <div className="trajectory-item" key={season.season}><span className="trajectory-dot" /><div><b>{season.season}</b><span>{clubs.find((item) => item.id === season.clubId)?.name ?? "Clube"} · {season.leagueName ?? "Liga"}</span><small>{season.games} JG · {season.goals} GL {season.titles?.length ? `· ${season.titles.length} título(s)` : ""}</small></div></div>)}</aside>
    </div>
    {toast && <button className="toast" onClick={onDismiss}>{toast}<span>×</span></button>}
  </main>;
}
function StatTile({ value, label, accent = false, gold = false }: { value: string | number; label: string; accent?: boolean; gold?: boolean }) { return <div className={`stat-tile ${accent ? "accent" : ""} ${gold ? "gold" : ""}`}><b>{value}</b><span>{label}</span></div>; }
function Meter({ label, value, gold = false }: { label: string; value: number; gold?: boolean }) { return <div className="form-meter"><span>{label}</span><b>{value}</b><i><em className={gold ? "gold" : ""} style={{ width: `${value}%` }} /></i></div>; }

function Event({ event, onChoose }: { event: CareerEvent; onChoose: (index: number) => void }) { return <main className="app-shell decision-shell"><div className="decision-card"><div className="eyebrow">FORA DAS QUATRO LINHAS</div><span className="decision-mark">◆</span><h1>{event.title}</h1><p>{event.copy}</p>{event.sponsor && <img className="sponsor-mark" src={event.sponsor.logo} alt={`Logo da ${event.sponsor.name}`} />}<div className="choice-list">{event.choices.map((choice, index) => <button key={choice.label} onClick={() => onChoose(index)}><span>0{index + 1}</span>{choice.label}<i>→</i></button>)}</div><small>Suas escolhas também viram parte da sua história.</small></div></main>; }
function Evolution({ player, seed, onSelect, onSkip }: { player: Player; seed: number; onSelect: (card: UpgradeCard) => void; onSkip: () => void }) { const cards = chooseUpgradeCards(player.position, seed); return <main className="app-shell evolution-shell"><nav className="topbar"><Brand compact /><span className="save-chip">EVOLUÇÃO DE TEMPORADA</span></nav><section className="evolution-wrap"><div className="eyebrow">MOMENTO DE TREINO</div><h1>Escolha o próximo salto.</h1><p>Uma carta por temporada. Ganhos reais, feitos para a posição que você escolheu.</p><div className="card-grid">{cards.map((card) => <button key={card.id} className={`training-card ${card.rarity}`} onClick={() => onSelect(card)}><span className="rarity">{card.rarity}</span><b>{card.name}</b><div>{Object.entries(card.changes).map(([key, value]) => <span key={key}>+{value} {attributeLabels[key]}</span>)}</div><i>ESCOLHER →</i></button>)}</div><button className="text-action" onClick={onSkip}>Pular evolução desta temporada</button></section></main>; }
function Shop({ career, onBack, onChange, onToast }: { career: CareerState; onBack: () => void; onChange: (career: CareerState) => void; onToast: (message: string) => void }) {
  const items = [
    { id:"chef", icon:"👔", name:"Chef particular", copy:"+5 de forma no começo da temporada.", price:70_000, seasonal:true },
    { id:"fisio", icon:"🛡️", name:"Fisioterapeuta pessoal", copy:"35% menos risco de lesão.", price:95_000, seasonal:true },
    { id:"psicologo", icon:"🧠", name:"Psicólogo esportivo", copy:"Uma segunda chance em final.", price:80_000, seasonal:true },
    { id:"preparador", icon:"🏋️", name:"Preparador físico", copy:"+4 de físico nesta temporada.", price:115_000, seasonal:true },
    { id:"empresario", icon:"💎", name:"Super empresário", copy:"25% a mais em salários e propostas.", price:100_000, seasonal:true },
    { id:"chuteiras", icon:"⚽", name:"Chuteiras profissionais", copy:"+2 no atributo ofensivo principal.", price:18_000, seasonal:true },
    { id:"ferias", icon:"🏝️", name:"Férias da temporada", copy:"+5 forma e menos desgaste.", price:28_000, seasonal:true },
    { id:"suplementacao", icon:"🥗", name:"Suplementação esportiva", copy:"+2 físico nesta temporada.", price:16_000, seasonal:true },
    { id:"analista", icon:"📊", name:"Analista de vídeo", copy:"Melhor desempenho contra times fortes.", price:22_000, seasonal:true },
    { id:"familia", icon:"✈️", name:"A simples", copy:"+4 forma nesta temporada.", price:30_000, seasonal:true },
    { id:"imprensa", icon:"🏡", name:"Assessoria de imprensa", copy:"Protege fama e idolatria.", price:38_000, seasonal:true },
    { id:"carro", icon:"🚗", name:"Carro esportivo", copy:"+2 fama permanente.", price:90_000, seasonal:false },
    { id:"casa", icon:"🏠", name:"Casa própria", copy:"+2 forma em cada temporada.", price:150_000, seasonal:false },
    { id:"mansao", icon:"🏡", name:"Mansão com campo", copy:"+3 físico máximo e +2 fama.", price:120_000, seasonal:false },
    { id:"ilha", icon:"📷", name:"Ilha particular", copy:"+4 fama permanente.", price:400_000, seasonal:false },
    { id:"bairro", icon:"🌄", name:"O caminho do seu bairro", copy:"+5 idolatria no clube atual.", price:750_000, seasonal:false },
    { id:"academia", icon:"🛋️", name:"Academia do clube", copy:"+15 fama e contatos.", price:500_000, seasonal:false },
  ] as const;
  const purchase=(item: typeof items[number]) => {
    const shop=career.shop; if (item.seasonal && shop.activeSeasonal.includes(item.id)) return onToast("Este efeito já está ativo nesta temporada.");
    if (!item.seasonal && shop.ownedPermanent.includes(item.id)) return onToast("Você já possui este item.");
    if (career.balance < item.price) return onToast("Saldo insuficiente para esta compra.");
    const player={...career.player,attributes:{...career.player.attributes},clubIdolatry:{...career.player.clubIdolatry}};
    if(item.id==="carro"||item.id==="mansao") player.fame+=2; if(item.id==="ilha") player.fame+=4; if(item.id==="academia") player.fame+=15; if(item.id==="bairro") player.clubIdolatry[player.clubId]=Math.min(100,(player.clubIdolatry[player.clubId]??0)+5);
    if(item.id==="chuteiras") { const key=positionAttributeKeys[player.position][0]; player.attributes[key]=Math.min(99,player.attributes[key]+2); }
    onChange({...career,player,balance:career.balance-item.price,shop:{...shop,activeSeasonal:item.seasonal?[...shop.activeSeasonal,item.id]:shop.activeSeasonal,ownedPermanent:item.seasonal?shop.ownedPermanent:[...shop.ownedPermanent,item.id]}});
    onToast(`${item.name} adquirido.`);
  };
  const free=(kind:"campanha"|"treino") => {
    if(career.shop.freeUses.includes(kind)) return onToast("Este benefício grátis já foi usado nesta temporada.");
    const player={...career.player,attributes:{...career.player.attributes}};
    if(kind==="campanha") player.fame=Math.min(100,player.fame+4); else { const key=positionAttributeKeys[player.position][0]; player.attributes[key]=Math.min(99,player.attributes[key]+2); }
    onChange({...career,player,shop:{...career.shop,freeUses:[...career.shop.freeUses,kind]}}); onToast(kind==="campanha"?"Campanha concluída: +4 fama.":"Treino concluído: +2 no atributo principal.");
  };
  const Card=({item}:{item:typeof items[number]}) => <article className="shop-item"><span>{item.icon}</span><div><b>{item.name}</b><p>{item.copy}</p>{item.seasonal&&<small>DURA 1 TEMPORADA</small>}</div><button onClick={()=>purchase(item)}>US$ {(item.price/1_000_000).toFixed(item.price<1_000_000?1:1)}M</button></article>;
  const seasonal=items.filter((item)=>item.seasonal), permanent=items.filter((item)=>!item.seasonal);
  return <main className="app-shell shop-shell"><section className="shop-wrap"><header className="shop-header"><div><span>🛒 LOJA</span><small>ASSISTENTE DE CARREIRA</small></div><b>US$ {(career.balance/1_000_000).toFixed(2)}M</b></header><div className="shop-section"><h2>BÔNUS GRATUITOS</h2><div className="shop-featured"><article className="shop-featured-item"><span>📣</span><div><b>Campanha publicitária</b><p>+4 fama. Uma vez por temporada.</p><button onClick={()=>free("campanha")}>USAR GRÁTIS</button></div></article><article className="shop-featured-item"><span>🎯</span><div><b>Treino personalizado</b><p>+2 no atributo principal. Uma vez por temporada.</p><button onClick={()=>free("treino")}>USAR GRÁTIS</button></div></article></div></div><div className="shop-section"><h2>POR 1 TEMPORADA</h2><div className="shop-grid">{seasonal.map((item)=><Card key={item.id} item={item}/>)}</div></div><div className="shop-section"><h2>PERMANENTES</h2><div className="shop-grid">{permanent.map((item)=><Card key={item.id} item={item}/>)}</div></div><button className="shop-close" onClick={onBack}>PRONTO, FECHAR ✓</button></section></main>;
}

function Market({ currentClub, player, generational, academy, onBack, onSelect }: { currentClub: Club; player: Player; generational: boolean; academy: boolean; onBack: () => void; onSelect: (club: Club) => void }) { const offers = clubs.filter((club) => club.id !== currentClub.id).sort((a, b) => academy || generational ? (b.reputation + b.strength) - (a.reputation + a.strength) : Number(currentClub.rivals.includes(b.id)) - Number(currentClub.rivals.includes(a.id))).slice(0, academy ? 6 : generational ? 6 : 4); return <main className="app-shell market-shell"><nav className="topbar"><button className="back-button" onClick={onBack}>← Carreira</button><Brand compact /><span className="step">JANELA DE MERCADO</span></nav><section className="market-wrap"><div className="eyebrow">CONTRATOS E CONSEQUÊNCIAS</div><h1>O mercado está de olho.</h1><p>Trocar de clube não é apenas mudar de camisa. Em clássico, a arquibancada não esquece.</p><div className="offer-list"><article className="offer current"><ClubCrest club={currentClub} /><div><small>CLUBE ATUAL</small><h2>{currentClub.name}</h2><p>Idolatria: {player.clubIdolatry[currentClub.id] ?? 0}/100 · contrato ativo</p></div><b>FICAR</b></article>{offers.map((club) => { const rival = currentClub.rivals.includes(club.id); return <article className={`offer ${rival ? "rival" : ""}`} key={club.id}><ClubCrest club={club} /><div><small>{rival ? "RIVAL DIRETO · RISCO DE JUDAS" : "PROPOSTA FORMAL"}</small><h2>{club.name}</h2><p>Força {club.strength} · reputação {club.reputation}</p></div><button className="button button-ghost" onClick={() => onSelect(club)}>ANALISAR</button></article>; })}</div></section></main>; }
function Celebration({ celebration, onClose }: { celebration: Celebration; onClose: () => void }) {
  const accessOnly = Boolean(celebration.access) && celebration.title === "Decisão do acesso";
  return <main className="app-shell celebration-shell"><div className="celebration-frame" /><section className="celebration-card"><div className="celebration-rays" /><div className="generic-trophy" aria-label="Troféu dourado">🏆</div>{accessOnly ? <><div className="eyebrow">NOVO CAPÍTULO</div><h1>VOCÊ CONSEGUIU<br />O ACESSO À</h1><h2>{celebration.access}</h2></> : <><div className="eyebrow">NOITE DE GLÓRIA</div><h1>VOCÊ FOI CAMPEÃO<br />DO/DA</h1><h2>{celebration.title}</h2>{celebration.access && <p>ACESSO GARANTIDO À {celebration.access}</p>}</>}<button className="celebration-close" onClick={onClose}>CONTINUAR A HISTÓRIA →</button></section></main>;
}
function MiniGame({ game, result, score, onScore, onFinish }: { game: MiniGameDefinition; result: SeasonResult | null; score: number; onScore: (value: number) => void; onFinish: (won: boolean) => void }) {
  const body = game.mode === "sequence" ? <SequenceGame game={game} onFinish={onFinish} />
    : game.mode === "timing" ? <TimingGame onFinish={onFinish} />
      : game.mode === "grid" ? <GridGame onFinish={onFinish} />
        : game.mode === "connect" ? <ConnectGame onFinish={onFinish} />
          : game.mode === "code" ? <CodeGame onFinish={onFinish} />
            : <LaneGame game={game} score={score} onScore={onScore} onFinish={onFinish} />;
  const final = result?.cupFinal;
  return <main className="app-shell game-shell"><nav className="topbar"><Brand compact /><span className="save-chip">FINAL · MINIGAME RNG</span></nav><section className="game-wrap"><div className="eyebrow">{final ? final.competitionName.toUpperCase() : game.name}</div><h1>{final ? `Final contra ${final.opponentClubName}.` : "Decisão no detalhe."}</h1><p>{final ? `A campanha colocou seu clube diante do ${final.opponentClubName}. O minigame decide a taça.` : result?.title ? "Você pode transformar o título em uma noite inesquecível." : game.description}</p><div className="tutorial">{game.tutorial}</div>{body}</section></main>;
}
function LaneGame({ game, score, onScore, onFinish }: { game: MiniGameDefinition; score: number; onScore: (value: number) => void; onFinish: (won: boolean) => void }) { const [round, setRound] = useState(0); const targets = useMemo(() => [2, 0, 3, 1, 2], []); function choose(lane: number) { const next = score + (lane === targets[round] ? 1 : 0); onScore(next); if (round + 1 >= game.rounds) onFinish(next >= Math.ceil(game.rounds * .6)); else setRound(round + 1); } return <><div className="scoreboard"><span>Rodada {round + 1}/{game.rounds}</span><b>{score} acertos</b></div><div className="goal">{[0, 1, 2, 3].map((lane) => <button key={lane} onClick={() => choose(lane)} className={`goal-zone zone-${lane}`} aria-label={`Escolher zona ${lane + 1}`}><i /></button>)}</div><p className="game-hint">Leia o espaço e escolha uma faixa.</p></>; }
function SequenceGame({ game, onFinish }: { game: MiniGameDefinition; onFinish: (won: boolean) => void }) { const sequence = [1, 3, 0, 2, 1]; const [step, setStep] = useState(0); function tap(value: number) { if (value !== sequence[step]) return onFinish(false); if (step + 1 === game.rounds) return onFinish(true); setStep(step + 1); } return <><div className="scoreboard"><span>Sequência</span><b>{step}/{game.rounds}</b></div><div className="signal-grid">{[0, 1, 2, 3].map((value) => <button key={value} className={`signal signal-${value}`} onClick={() => tap(value)} aria-label={`Sinal ${value + 1}`} />)}</div><p className="game-hint">O padrão: 2 · 4 · 1 · 3 · 2</p></>; }
function TimingGame({ onFinish }: { onFinish: (won: boolean) => void }) { const [mark, setMark] = useState(6); const [moving, setMoving] = useState(true); useEffect(() => { if (!moving) return; const timer = window.setInterval(() => setMark((value) => (value + 7) % 101), 90); return () => window.clearInterval(timer); }, [moving]); function stop() { setMoving(false); onFinish(mark >= 42 && mark <= 62); } return <div className="timing"><div className="timing-track"><i className="timing-target" /><b style={{ left: `${mark}%` }} /></div><button className="button button-primary" onClick={stop} disabled={!moving}>BATER NA BOLA</button><p className="game-hint">A faixa dourada é o ponto ideal da batida.</p></div>; }
function GridGame({ onFinish }: { onFinish: (won: boolean) => void }) { const safe = [0, 4, 8]; const [step, setStep] = useState(0); function choose(index: number) { if (index !== safe[step]) return onFinish(false); if (step === 2) return onFinish(true); setStep(step + 1); } return <><div className="scoreboard"><span>Espaços seguros</span><b>{step}/3</b></div><div className="safe-grid">{Array.from({ length: 9 }, (_, index) => <button key={index} onClick={() => choose(index)} aria-label={`Espaço ${index + 1}`} />)}</div><p className="game-hint">Encontre três espaços seguros na ordem certa.</p></>; }
function ConnectGame({ onFinish }: { onFinish: (won: boolean) => void }) { const [columns, setColumns] = useState<number[]>([]); function play(column: number) { if (columns.includes(column)) return; const next = [...columns, column]; setColumns(next); if (next.length >= 4) onFinish(true); } return <><div className="connect-board">{Array.from({ length: 7 }, (_, index) => <button key={index} onClick={() => play(index)} className={columns.includes(index) ? "filled" : ""} aria-label={`Coluna ${index + 1}`}><i /></button>)}</div><p className="game-hint">Conecte quatro peças diferentes para dominar o duelo mental.</p></>; }
function CodeGame({ onFinish }: { onFinish: (won: boolean) => void }) { const code = "2714"; const [value, setValue] = useState(""); const [visible, setVisible] = useState(true); useEffect(() => { const timer = window.setTimeout(() => setVisible(false), 1600); return () => window.clearTimeout(timer); }, []); function enter(digit: string) { const next = `${value}${digit}`; setValue(next); if (next.length === 4) onFinish(next === code); } return <><div className="code-display">{visible ? code : value.padEnd(4, "•")}</div><div className="keypad">{[1,2,3,4,5,6,7,8,9,0].map((digit) => <button key={digit} onClick={() => enter(String(digit))}>{digit}</button>)}</div><p className="game-hint">Memorize o código antes que a prancheta feche.</p></>; }
function Legacy({ career, onRestart }: { career: CareerState; onRestart: () => void }) {
  const result = legacy(career.player), ranking = readLocalRanking();
  const clubRows = career.clubHistory.map((entry, index) => {
    const club = clubs.find((item) => item.id === entry.clubId);
    return club ? { club, titles: entry.titles, idolatry: career.player.clubIdolatry[entry.clubId] ?? 0, index } : null;
  }).filter((entry): entry is { club: Club; titles: string[]; idolatry: number; index: number } => entry !== null);
  const definingClub = [...clubRows].sort((a, b) => b.idolatry - a.idolatry || b.titles.length - a.titles.length || a.index - b.index)[0];
  const honor = !definingClub ? "Nome de Respeito" : definingClub.idolatry >= 95 ? `Melhor da História do ${definingClub.club.name}` : definingClub.idolatry >= 80 ? `Lenda do ${definingClub.club.name}` : definingClub.idolatry >= 60 ? `Ídolo do ${definingClub.club.name}` : `Nome marcante do ${definingClub.club.name}`;
  const nationalTeamTitles = career.nationalTeam?.titles.length ?? career.history.filter((season) => Boolean(season.nationalTeamTitle)).length;
  return <main className="app-shell legacy-shell"><div className="legacy-light" /><section className="legacy-wrap"><Brand /><div className="eyebrow">FIM DE CARREIRA</div><span className="legacy-score">{result.score}<small>/ 1000</small></span><h1>{honor}</h1><p className="club-title">O clube que mais marcou sua carreira.</p><div className="legacy-stats"><span><b>{career.player.games}</b> jogos</span><span><b>{career.player.goals}</b> gols</span><span><b>{career.player.assists}</b> assistências</span><span><b>{career.nationalTeam?.games ?? 0}</b> jogos pela seleção</span><span><b>{nationalTeamTitles}</b> títulos pela seleção</span></div><section className="club-summary"><h2>CLUBES DA CARREIRA</h2>{clubRows.map(({ club, titles, idolatry }) => <article key={club.id} className="club-summary-row"><ClubCrest club={club} small /><div><b>{club.name}</b><small>{idolatry}/100 · {idolatry >= 80 ? "Lenda" : idolatry >= 60 ? "Ídolo" : "Passagem marcante"}</small><p>{titles.length ? titles.join(" · ") : "Sem títulos"}</p></div></article>)}</section><div className="local-ranking"><div className="local-ranking-title">TOP 10 DESTE COMPUTADOR <small>OFFLINE</small></div>{ranking.length ? <ol>{ranking.map((entry, index) => <li key={entry.playerId} className={entry.playerId === career.player.id ? "current" : ""}><b>#{index + 1}</b><span>{entry.name} · {entry.position}<small>{entry.clubName} · {entry.titles} títulos</small></span><strong>{entry.score}</strong></li>)}</ol> : <p>Nenhuma carreira encerrada ainda.</p>}</div><button className="button button-primary" onClick={onRestart}>COMEÇAR NOVA HISTÓRIA <span>→</span></button></section></main>; }
