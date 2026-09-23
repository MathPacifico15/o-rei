"use client";

import { useEffect, useMemo, useState } from "react";
import { applyCard, baseAttributes, chooseUpgradeCards, clubCompetesIn, clubs, competitions, computeOvr, countries, legacy, miniGameForSeed, positionAttributeKeys, randomCareerStart, shouldRetire, simulateSeason, type CareerEvent, type CareerState, type Club, type FinalStyle, type MiniGameDefinition, type Player, type Position, type SeasonResult, type UpgradeCard } from "@/game";

type Screen = "home" | "create" | "career" | "evolution" | "event" | "market" | "minigame" | "legacy";
const idoloPositions: Array<{ id: Position; number: string; label: string; tone: string }> = [
  { id: "ATA", number: "9", label: "ATACANTE", tone: "gold" },
  { id: "MEI", number: "10", label: "MEIA-ARMADOR", tone: "green" },
  { id: "GOL", number: "1", label: "GOLEIRO", tone: "teal" },
];
const dailyObjectives = [
  { text: "Termine a carreira", coins: 5 },
  { text: "Ganhe 1 ou mais copas internacionais", coins: 10 },
  { text: "Ganhe 2 Bolas de Ouro", coins: 15 },
];
const playerTypeCards: Array<{ id: FinalStyle; icon: string; label: string; tone: string; copy: string }> = [
  { id: "supersticioso", icon: "🎲", label: "SUPERSTICIOSO", tone: "gold", copy: "As finais se decidem na pura sorte e simpatia." },
  { id: "misto", icon: "🔀", label: "MISTO", tone: "violet", copy: "Um pouco de cada: habilidade e sorte no mesmo pacote." },
  { id: "habilidoso", icon: "🧠", label: "HABILIDOSO", tone: "green", copy: "Finais com minigames de habilidade — memória, pontaria, timing." },
];
const archetypeCards: Record<Position, Array<{ id: string; label: string; copy: string; watermark: string; bonuses: string[] }>> = {
  ATA: [
    { id: "flecha", label: "FLECHA", copy: "Te lançam uma bola no espaço e ninguém te pega mais.", watermark: "VEL", bonuses: ["+8 VELOCIDADE"] },
    { id: "tanque", label: "TANQUE", copy: "Você ganha tudo pelo alto e segura contra dois zagueiros.", watermark: "POT", bonuses: ["+8 POTÊNCIA"] },
    { id: "lider-nato", label: "LÍDER NATO", copy: "Nasceu para colocar o time nas costas.", watermark: "LID", bonuses: ["+8 LIDERANÇA", "+2 FINALIZAÇÃO"] },
  ],
  MEI: [
    { id: "maestro", label: "MAESTRO", copy: "Enxerga a jogada antes de todo mundo.", watermark: "PAS", bonuses: ["+8 PASSE"] },
    { id: "cerebral", label: "CEREBRAL", copy: "Controla o ritmo e encontra sempre a melhor decisão.", watermark: "MEN", bonuses: ["+8 LIDERANÇA", "+2 PASSE"] },
    { id: "driblador", label: "DRIBLADOR", copy: "A bola fica colada no pé quando o jogo aperta.", watermark: "DRI", bonuses: ["+8 DRIBLE"] },
  ],
  GOL: [
    { id: "muralha", label: "MURALHA", copy: "Reflexo de sobra para buscar qualquer bola no canto.", watermark: "REF", bonuses: ["+8 REFLEXO"] },
    { id: "libero", label: "LÍBERO", copy: "Sai da área, organiza a defesa e joga com os pés.", watermark: "SAI", bonuses: ["+8 SAÍDA", "+2 LIDERANÇA"] },
    { id: "elastico", label: "ELÁSTICO", copy: "Vai onde ninguém imagina que um goleiro pode chegar.", watermark: "ELA", bonuses: ["+8 ELASTICIDADE"] },
  ],
};
const attributeLabels: Record<string, string> = { reflexo: "Reflexo", elasticidade: "Elasticidade", posicionamento: "Posicionamento", saida: "Saída", lideranca: "Liderança", fisico: "Físico", velocidade: "Velocidade", passe: "Passe", finalizacao: "Finalização", drible: "Drible", cabecada: "Cabeçada", forca: "Força" };

function crestLetters(name: string) { return name.split(" ").map((word) => word[0]).join("").slice(0, 3).toUpperCase(); }
function flagUrl(code: string) { return `https://flagcdn.com/w40/${code.toLowerCase()}.png`; }
function countryCode(name: string) { return countries.find((country) => country.name === name)?.code ?? "UN"; }
function ClubCrest({ club, small = false }: { club: Club; small?: boolean }) {
  const [missing, setMissing] = useState(false);
  return <span title={`Símbolo de ${club.name}`} className={`crest crest-${club.id} ${small ? "crest-small" : ""}`}>{missing ? crestLetters(club.name) : <img src={`/crests/${club.crest}.png`} alt={`Escudo do ${club.name}`} onError={() => setMissing(true)} />}</span>;
}
function Brand({ compact = false }: { compact?: boolean }) { return <div className={`brand ${compact ? "brand-compact" : ""}`}><img src="/o-rei-logo.png" alt="O REI — bola de couro e coroa" /></div>; }

function createInitialState(data: { name: string; position: Position; club: Club; foot: Player["preferredFoot"]; height: number; shirt: number; nationality: string; finalStyle?: FinalStyle }): CareerState {
  const player: Player = { id: `jogador-${Date.now()}`, name: data.name.trim() || "Novo Craque", nationality: data.nationality, position: data.position, preferredFoot: data.foot, heightCm: data.height, shirtNumber: data.position === "MEI" ? 10 : data.position === "ATA" ? 9 : data.shirt, age: 16, clubId: data.club.id, attributes: baseAttributes(), form: 68, fame: 3, salary: 8000, marketValue: 400000, games: 0, goals: 0, assists: 0, cleanSheets: 0, saves: 0, titles: [], awards: [], clubIdolatry: { [data.club.id]: 12 }, judasAt: [], injuries: 0 };
  const league = competitions.find((competition) => competition.id === data.club.leagueId);
  return { seed: 24061940, season: 2026, player, history: [], currentCompetition: league?.name ?? "Brasileirão Série A", finalStyle: data.finalStyle };
}

function PlayerTypePicker({ value, onChange, compact = false, locked = false }: { value: FinalStyle | null; onChange: (style: FinalStyle) => void; compact?: boolean; locked?: boolean }) {
  return (
    <section className={`player-type-section ${compact ? "player-type-compact" : ""} ${locked ? "player-type-locked" : ""}`}>
      <h3>QUE TIPO DE JOGADOR É VOCÊ?</h3>
      <p>Define como se jogam <b>TODAS</b> as finais da sua carreira. Não dá pra mudar depois.</p>
      <div className="player-type-grid">
        {playerTypeCards.map((item) => (
          <button key={item.id} type="button" disabled={locked} className={`player-type-card player-type-${item.tone} ${value === item.id ? "selected" : ""}`} onClick={() => onChange(item.id)}>
            <span className="player-type-icon" aria-hidden>{item.icon}</span>
            <strong>{item.label}</strong>
            <small>{item.copy}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ArchetypePicker({ position, value, onChange }: { position: Position; value?: string; onChange: (archetype: string) => void }) {
  const positionName = position === "ATA" ? "ATACANTE" : position === "MEI" ? "MEIA-ARMADOR" : "GOLEIRO";
  return (
    <section className="archetype-section">
      <h3>QUE TIPO DE {positionName} VOCÊ É?</h3>
      <p>O dado trouxe três destinos. Escolha um: ele te define pra sempre.</p>
      <div className="archetype-grid">
        {archetypeCards[position].map((item) => (
          <button key={item.id} type="button" data-watermark={item.watermark} className={`archetype-card ${value === item.id ? "selected" : ""}`} onClick={() => onChange(item.id)}>
            <strong>{item.label}</strong>
            <small>{item.copy}</small>
            <span>{item.bonuses.map((bonus) => <b key={bonus}>{bonus}</b>)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [career, setCareer] = useState<CareerState | null>(null);
  const [lastResult, setLastResult] = useState<SeasonResult | null>(null);
  const [event, setEvent] = useState<CareerEvent | null>(null);
  const [eventQueue, setEventQueue] = useState<CareerEvent[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [activeGame, setActiveGame] = useState<MiniGameDefinition | null>(null);
  const [pendingEventChoice, setPendingEventChoice] = useState<{ event: CareerEvent; choiceIndex: number } | null>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (import.meta.env.DEV) navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((reg) => reg.unregister())).catch(() => undefined);
      else navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const restoreCareer = window.setTimeout(() => {
      const saved = localStorage.getItem("o-rei-career");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as CareerState;
          const validPosition = ["GOL", "MEI", "ATA"].includes(parsed.player?.position);
          const validAttributes = positionAttributeKeys[parsed.player?.position as Position]?.every((key) => typeof parsed.player.attributes?.[key] === "number");
          if (validPosition && validAttributes) setCareer(parsed);
          else { localStorage.removeItem("o-rei-career"); setToast("A atualização de posições exige uma nova carreira."); }
        } catch { localStorage.removeItem("o-rei-career"); }
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(restoreCareer);
  }, []);
  useEffect(() => { if (career) localStorage.setItem("o-rei-career", JSON.stringify(career)); }, [career]);
  function begin(data: Parameters<typeof createInitialState>[0]) { setCareer(createInitialState(data)); setLastResult(null); setScreen("career"); }
  function autoResolveFinal(state: CareerState, result: SeasonResult) {
    if (!result.cupFinal) return { state, result };
    const won = Math.random() > 0.48;
    const cupFinal = { ...result.cupFinal, won };
    const resolved = { ...result, cupFinal, title: won ? cupFinal.competitionName : result.title };
    const player = { ...state.player, titles: [...state.player.titles], clubIdolatry: { ...state.player.clubIdolatry } };
    if (won) {
      if (!player.titles.includes(cupFinal.competitionName)) player.titles.push(cupFinal.competitionName);
      player.clubIdolatry[player.clubId] = Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + 9);
    }
    const history = [...state.history];
    history[history.length - 1] = resolved;
    return { state: { ...state, player, history }, result: resolved };
  }
  function routeAfterSeason(state: CareerState, result: SeasonResult) {
    void state;
    return result.cupFinal ? "minigame" as const : "evolution" as const;
  }
  function playSeason(careerToPlay = career) {
    if (!careerToPlay) return;
    const outcome = simulateSeason(careerToPlay);
    setCareer(outcome.state);
    setLastResult(outcome.result);
    setGameScore(0);
    setActiveGame(miniGameForSeed(outcome.state.seed + outcome.state.season));
    if (shouldRetire(outcome.state.player, outcome.state.seed)) return setScreen("legacy");
    if (outcome.result.events.length) { setEvent(outcome.result.events[0]); setEventQueue(outcome.result.events.slice(1)); return setScreen("event"); }
    const route = routeAfterSeason(outcome.state, outcome.result);
    if (route === "auto-final") {
      const resolved = autoResolveFinal(outcome.state, outcome.result);
      setCareer(resolved.state);
      setLastResult(resolved.result);
      setToast(resolved.result.cupFinal?.won ? "A sorte sorriu. A taça é sua." : "A final escapou no último lance.");
      return setScreen("evolution");
    }
    setScreen(route === "minigame" ? "minigame" : "evolution");
  }
  function resolveFinal(won: boolean) {
    if (!career || !lastResult?.cupFinal) return;
    const cupFinal = { ...lastResult.cupFinal, won };
    const resolved = { ...lastResult, cupFinal, title: won ? cupFinal.competitionName : lastResult.title };
    const player = { ...career.player, titles: [...career.player.titles], clubIdolatry: { ...career.player.clubIdolatry } };
    if (won) {
      if (!player.titles.includes(cupFinal.competitionName)) player.titles.push(cupFinal.competitionName);
      player.clubIdolatry[player.clubId] = Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + 9);
    }
    const history = [...career.history]; history[history.length - 1] = resolved;
    setCareer({ ...career, player, history }); setLastResult(resolved);
  }
  function chooseEvent(index: number) {
    if (!career || !event) return;
    setPendingEventChoice({ event, choiceIndex: index });
    setActiveGame(miniGameForSeed(career.seed + career.season + event.id.length + index));
    setGameScore(0);
    setScreen("minigame");
  }
  function resolveEventDecision(won: boolean) {
    if (!career || !pendingEventChoice) return;
    const choice = pendingEventChoice.event.choices[pendingEventChoice.choiceIndex];
    const player = { ...career.player, clubIdolatry: { ...career.player.clubIdolatry }, titles: [...career.player.titles] };
    if (won) {
      player.fame = Math.max(0, player.fame + (choice.fame ?? 0));
      player.form = Math.max(1, Math.min(99, player.form + (choice.form ?? 0)));
      player.salary += choice.salary ?? 0;
      player.injuries += choice.injuryWeeks ?? 0;
      player.clubIdolatry[player.clubId] = Math.max(0, Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + (choice.idolatry ?? 0)));
    } else {
      player.fame = Math.max(0, player.fame - 1);
      player.form = Math.max(1, player.form - 3);
      player.clubIdolatry[player.clubId] = Math.max(0, (player.clubIdolatry[player.clubId] ?? 0) - 2);
    }
    setPendingEventChoice(null);

    if (choice.finalOutcome && lastResult?.cupFinal) {
      const cupFinal = { ...lastResult.cupFinal, won };
      const resolved = { ...lastResult, cupFinal, title: won ? cupFinal.competitionName : lastResult.title };
      if (won) {
        if (!player.titles.includes(cupFinal.competitionName)) player.titles.push(cupFinal.competitionName);
        player.clubIdolatry[player.clubId] = Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + 9);
      }
      const history = [...career.history];
      history[history.length - 1] = resolved;
      setCareer({ ...career, player, history });
      setLastResult(resolved);
      setEvent(null);
      setEventQueue([]);
      setToast(won ? "DEFESA DECISIVA! A taça é sua." : "A final escapou no último lance.");
      setScreen("evolution");
      return;
    }

    const nextCareer = { ...career, player };
    setCareer(nextCareer);
    if (eventQueue.length) {
      setEvent(eventQueue[0]);
      setEventQueue(eventQueue.slice(1));
      return;
    }
    setEvent(null);
    setToast(won ? "Decisão vencida. A arquibancada sentiu o impacto." : "A pressão falou mais alto, mas a carreira continua.");
    if (!lastResult) return setScreen("evolution");
    const route = routeAfterSeason(nextCareer, lastResult);
    if (route === "auto-final") {
      const resolved = autoResolveFinal(nextCareer, lastResult);
      setCareer(resolved.state);
      setLastResult(resolved.result);
      setToast(resolved.result.cupFinal?.won ? "A sorte sorriu. A taça é sua." : "A final escapou no último lance.");
      return setScreen("evolution");
    }
    setScreen(route === "minigame" ? "minigame" : "evolution");
  }
  function takeCard(card: UpgradeCard) { if (!career) return; const nextCareer = { ...career, player: applyCard(career.player, card) }; setToast(`${card.name} aplicada. OVR recalculado.`); playSeason(nextCareer); }
  function transferTo(club: Club) { if (!career) return; const previous = clubs.find((item) => item.id === career.player.clubId); const rival = Boolean(previous?.rivals.includes(club.id)); const player = { ...career.player, clubId: club.id, clubIdolatry: { ...career.player.clubIdolatry, [club.id]: 5 }, judasAt: [...career.player.judasAt] }; if (rival && previous && !player.judasAt.includes(previous.id)) player.judasAt.push(previous.id); setCareer({ ...career, player }); setToast(rival ? `Transferência selada. Parte da torcida do ${previous?.name} vai chamá-lo de Judas.` : `Contrato assinado com ${club.name}.`); setScreen("career"); }
  const club = career ? clubs.find((item) => item.id === career.player.clubId) ?? clubs[0] : clubs[0];
  if (!ready) return <main className="app-shell start-shell"><div className="stadium-glow" /><nav className="topbar"><Brand compact /><span className="save-chip">◉ Carregando…</span></nav></main>;
  if (screen === "home") return <Start hasCareer={Boolean(career)} onNew={() => setScreen("create")} onContinue={() => setScreen("career")} />;
  if (screen === "create") return <Create onBack={() => setScreen("home")} onCreate={begin} />;
  if (!career) return null;
  if (screen === "evolution") return <Evolution player={career.player} seed={career.seed + career.season} onSelect={takeCard} onSkip={() => setScreen("career")} />;
  if (screen === "market") return <Market currentClub={club} player={career.player} onBack={() => setScreen("career")} onSelect={transferTo} />;
  if (screen === "minigame") return <MiniGame game={activeGame ?? miniGameForSeed(career.seed + career.season)} result={pendingEventChoice ? null : lastResult} decision={pendingEventChoice?.event ?? null} score={gameScore} onScore={setGameScore} onFinish={(won) => {
    if (pendingEventChoice) return resolveEventDecision(won);
    resolveFinal(won);
    setToast(won ? "Decisão vencida. Seu nome entrou na noite da final." : "A decisão escapou, mas a carreira continua.");
    setScreen("evolution");
  }} />;
  if (screen === "legacy") return <Legacy career={career} club={club} onRestart={() => { localStorage.removeItem("o-rei-career"); setCareer(null); setScreen("home"); }} />;
  return (
    <>
      <Career career={career} club={club} result={lastResult} toast={screen === "career" ? toast : null} event={screen === "event" ? event : null} onChoose={chooseEvent} onDismiss={() => setToast(null)} onPlay={playSeason} onMarket={() => setScreen("market")} onLegacy={() => setScreen("legacy")} onSetFinalStyle={(finalStyle) => setCareer({ ...career, finalStyle })} onSetArchetype={(archetype) => playSeason({ ...career, archetype })} />
    </>
  );
}

function Start({ hasCareer, onNew, onContinue }: { hasCareer: boolean; onNew: () => void; onContinue: () => void }) { return <main className="app-shell start-shell"><div className="stadium-glow" /><nav className="topbar"><Brand compact /><span className="save-chip">◉ Carreira local protegida</span></nav><section className="start-content"><div className="eyebrow">UMA CARREIRA. TODA A HISTÓRIA.</div><Brand /><h1>Do primeiro jogo à eternidade.</h1><p>Crie seu atleta aos 16 anos. Conquiste títulos, enfrente clássicos e escreva um legado que não cabe numa súmula.</p><div className="start-actions"><button className="button button-primary" onClick={onNew}>COMEÇAR CARREIRA <span>→</span></button>{hasCareer && <button className="button button-ghost" onClick={onContinue}>CONTINUAR CARREIRA</button>}</div><div className="feature-row"><span><b>10</b> minigames decisivos</span><span><b>20</b> atributos reais</span><span><b>0–1000</b> legado final</span></div></section><footer>O REI · futebol, escolhas e memória</footer></main>; }

function Create({ onBack, onCreate }: { onBack: () => void; onCreate: (data: Parameters<typeof createInitialState>[0]) => void }) {
  const [name, setName] = useState("matheus");
  const [position, setPosition] = useState<Position>("ATA");
  const [leagueCountry, setLeagueCountry] = useState("Brasil");
  const [leagueId, setLeagueId] = useState("bra-a");
  const [clubId, setClubId] = useState("santos");
  const [nationality, setNationality] = useState("Brasil");
  const [foot, setFoot] = useState<Player["preferredFoot"]>("Direito");
  const [height, setHeight] = useState(178);
  const [shirt, setShirt] = useState(9);
  const [locationSearch, setLocationSearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [leagueCountryOpen, setLeagueCountryOpen] = useState(false);
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [dailyReset, setDailyReset] = useState("04:00:00");

  const playableCompetitions = useMemo(
    () => competitions.filter((competition) => competition.selectable && clubs.some((club) => clubCompetesIn(club, competition.id))),
    [],
  );
  const leagueCountries = useMemo(
    () => [...new Set(playableCompetitions.map((competition) => competition.country))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [playableCompetitions],
  );
  const query = locationSearch.trim().toLocaleLowerCase("pt-BR");
  const matches = (value: string) => !query || value.toLocaleLowerCase("pt-BR").includes(query);
  const leaguesInCountry = playableCompetitions.filter((competition) => competition.country === leagueCountry);
  const visibleLeagues = query
    ? leaguesInCountry.filter((competition) => matches(competition.name) || matches(competition.country))
    : leaguesInCountry;
  const leagueClubs = clubs.filter((club) => clubCompetesIn(club, leagueId));
  const clubMatchesSearch = (club: Club) => {
    if (!query) return true;
    if (matches(club.name) || matches(club.country)) return true;
    const league = playableCompetitions.find((competition) => competition.id === club.leagueId);
    return Boolean(league && (matches(league.name) || matches(league.country)));
  };
  const visibleClubs = query
    ? clubs.filter((club) => clubMatchesSearch(club) && playableCompetitions.some((competition) => clubCompetesIn(club, competition.id)))
    : leagueClubs;
  const clubOptions = query ? visibleClubs.slice(0, 48) : leagueClubs;
  const selected = clubs.find((club) => club.id === clubId) ?? leagueClubs[0] ?? clubs[0];
  const selectedNationality = countries.find((country) => country.name === nationality) ?? countries.find((country) => country.code === "BR")!;
  const selectedLeague = playableCompetitions.find((competition) => competition.id === leagueId);
  const visibleNationalities = countries.filter((country) => country.name.toLocaleLowerCase("pt-BR").includes(countrySearch.toLocaleLowerCase("pt-BR")));

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setDailyReset(`${hours}:${minutes}:${seconds}`);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  function pickPosition(next: Position) {
    setPosition(next);
    setShirt(next === "MEI" ? 10 : next === "ATA" ? 9 : 1);
  }

  function switchLeagueCountry(next: string) {
    setLeagueCountry(next);
    const firstLeague = playableCompetitions.find((competition) => competition.country === next);
    if (!firstLeague) return;
    setLeagueId(firstLeague.id);
    const firstClub = clubs.find((club) => clubCompetesIn(club, firstLeague.id));
    if (firstClub) setClubId(firstClub.id);
  }

  function switchLeague(next: string) {
    const firstClub = clubs.find((club) => clubCompetesIn(club, next));
    if (!firstClub) return;
    setLeagueId(next);
    setClubId(firstClub.id);
    const league = playableCompetitions.find((competition) => competition.id === next);
    if (league) setLeagueCountry(league.country);
  }

  function switchClub(next: string) {
    const club = clubs.find((item) => item.id === next);
    if (!club) return;
    setClubId(club.id);
    setLeagueId(club.leagueId);
    const league = playableCompetitions.find((competition) => competition.id === club.leagueId);
    if (league) setLeagueCountry(league.country);
    setLocationSearch("");
  }

  function applyRandom() {
    const roll = randomCareerStart(Date.now());
    setName("matheus");
    pickPosition(roll.position);
    setNationality(roll.nationality);
    setLeagueCountry(roll.league.country);
    setLeagueId(roll.club.leagueId);
    setClubId(roll.club.id);
    setFoot(roll.preferredFoot);
    setHeight(roll.heightCm);
    setShirt(roll.shirtNumber);
    setLocationSearch("");
  }

  return (
    <main className="app-shell idolo-setup-shell">
      <div className="idolo-setup-wrap">
        <article className="idolo-setup-card">
          <header className="idolo-setup-hero">
            <button type="button" className="idolo-back" onClick={onBack} aria-label="Voltar">←</button>
            <div className="idolo-mode-tabs"><span className="active">MODO CARREIRA</span><span className="locked">DUELO 🔒</span></div>
            <Brand />
          </header>

          <section className="idolo-banner locked">
            <div><strong>A CARREIRA DE BUFFON</strong><small>🔒 Em breve no O REI</small></div>
            <span className="idolo-banner-reward">+50 moedas</span>
          </section>

          <section className="idolo-daily">
            <div className="idolo-daily-head"><h3>DESAFIO DO DIA</h3><span>MUDA EM {dailyReset}</span></div>
            <p className="idolo-daily-label">OBJETIVOS DE HOJE</p>
            <ul className="idolo-objectives">
              {dailyObjectives.map((item) => (
                <li key={item.text}><span>{item.text}</span><b>🪙 {item.coins}</b></li>
              ))}
            </ul>
            <button type="button" className="idolo-locked-btn" disabled>ENTRE PARA JOGAR 🔒</button>
          </section>

          <section className="idolo-start">
            <div className="idolo-start-head">
              <h3>SEU COMEÇO</h3>
              <button type="button" className="idolo-random-btn" onClick={applyRandom}>🎲 ALEATÓRIO</button>
            </div>

            <div className="idolo-select-grid">
              <div className="idolo-field country-field">
                <span>Nacionalidade</span>
                <button type="button" className="country-trigger idolo-flag-trigger" onClick={() => { setCountryOpen(!countryOpen); setLeagueCountryOpen(false); setLeagueOpen(false); }}>
                  <img src={flagUrl(selectedNationality.code)} alt="" /><span>{selectedNationality.name}</span><b>⌄</b>
                </button>
                {countryOpen && (
                  <div className="country-menu idolo-flag-menu">
                    <div className="location-search location-search-menu">
                      <span className="location-search-icon" aria-hidden>⌕</span>
                      <input autoFocus value={countrySearch} onChange={(event) => setCountrySearch(event.target.value)} placeholder="Buscar país" aria-label="Buscar país" />
                    </div>
                    <div className="country-options">
                      {visibleNationalities.map((country) => (
                        <button type="button" key={country.code} onClick={() => { setNationality(country.name); setCountryOpen(false); setCountrySearch(""); }}>
                          <img src={flagUrl(country.code)} alt={`Bandeira de ${country.name}`} /><span>{country.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="idolo-field country-field">
                <span>País da liga</span>
                <button type="button" className="country-trigger idolo-flag-trigger" onClick={() => { setLeagueCountryOpen(!leagueCountryOpen); setCountryOpen(false); setLeagueOpen(false); }}>
                  <img src={flagUrl(countryCode(leagueCountry))} alt="" /><span>{leagueCountry || "Escolha…"}</span><b>⌄</b>
                </button>
                {leagueCountryOpen && (
                  <div className="country-menu idolo-flag-menu">
                    <div className="country-options">
                      {leagueCountries.map((country) => (
                        <button type="button" key={country} onClick={() => { switchLeagueCountry(country); setLeagueCountryOpen(false); }}>
                          <img src={flagUrl(countryCode(country))} alt={`Bandeira de ${country}`} /><span>{country}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="idolo-field country-field idolo-field-wide">
                <span>Liga</span>
                <button type="button" className="country-trigger idolo-flag-trigger" onClick={() => { setLeagueOpen(!leagueOpen); setCountryOpen(false); setLeagueCountryOpen(false); }}>
                  <span className="idolo-league-flag">{selectedLeague?.flag ?? "🏳️"}</span><span>{selectedLeague?.name ?? "—"}</span><b>⌄</b>
                </button>
                {leagueOpen && (
                  <div className="country-menu idolo-flag-menu">
                    <div className="country-options">
                      {visibleLeagues.map((competition) => (
                        <button type="button" key={competition.id} onClick={() => { switchLeague(competition.id); setLeagueOpen(false); }}>
                          <span className="idolo-league-flag">{competition.flag}</span><span>{competition.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="idolo-field idolo-club-block">
              <span>Time</span>
              <div className="location-search idolo-search">
                <span className="location-search-icon" aria-hidden>⌕</span>
                <input value={locationSearch} onChange={(event) => setLocationSearch(event.target.value)} placeholder="Buscar país, liga ou clube…" aria-label="Buscar país, liga ou clube" />
              </div>
              <div className="club-picker idolo-club-picker">
                {clubOptions.length === 0
                  ? <p className="idolo-club-empty">Escolha o país da liga ou busque um clube.</p>
                  : clubOptions.map((club) => (
                    <button key={club.id} type="button" onClick={() => switchClub(club.id)} className={`club-choice ${clubId === club.id ? "selected" : ""}`}>
                      <ClubCrest club={club} small /><span>{club.name}</span><small>FOR {club.strength}</small>
                    </button>
                  ))}
              </div>
            </div>

            <label className="idolo-name-field">
              <input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" aria-label="Nome do atleta" />
            </label>

            <div className="idolo-positions">
              {idoloPositions.map((item) => (
                <button key={item.id} type="button" className={`idolo-position idolo-position-${item.tone} ${position === item.id ? "selected" : ""}`} onClick={() => pickPosition(item.id)}>
                  <strong>{item.number}</strong><span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        </article>

        <section className="idolo-start-footer">
            <button type="button" className="idolo-start-btn" onClick={() => onCreate({ name, position, club: selected, foot, height, shirt, nationality })}>▶ COMEÇAR MINHA CARREIRA</button>
            <div className="idolo-rare locked"><span>✨ JOIA RARA</span><small>🔒 Em breve</small></div>
          </section>
      </div>
    </main>
  );
}

function fameGrade(fame: number) { return fame >= 8 ? "S" : fame >= 5 ? "A" : fame >= 3 ? "B" : "C"; }

function choiceEffects(choice: CareerEvent["choices"][number]) {
  const effects: Array<{ label: string; negative?: boolean }> = [];
  if (choice.fame) effects.push({ label: `${choice.fame > 0 ? "+" : ""}${choice.fame} FAMA`, negative: choice.fame < 0 });
  if (choice.form) effects.push({ label: `${choice.form > 0 ? "+" : ""}${choice.form} FORMA`, negative: choice.form < 0 });
  if (choice.idolatry) effects.push({ label: `${choice.idolatry > 0 ? "+" : ""}${choice.idolatry} IDOLATRIA`, negative: choice.idolatry < 0 });
  if (choice.salary) effects.push({ label: `${choice.salary > 0 ? "+" : ""}${choice.salary} SALÁRIO`, negative: choice.salary < 0 });
  if (choice.injuryWeeks) effects.push({ label: `${choice.injuryWeeks} SEM. LESÃO`, negative: true });
  return effects;
}

function EventModal({ event, onChoose }: { event: CareerEvent; onChoose: (index: number) => void }) {
  return (
      <article className="event-modal" role="region" aria-labelledby="event-modal-title">
        <header className="event-modal-head">
          <span className="eyebrow">FORA DAS QUATRO LINHAS</span>
          <h2 id="event-modal-title">{event.title}</h2>
          <p>{event.copy}</p>
          {event.sponsor && <img className="sponsor-mark" src={event.sponsor.logo} alt={`Logo da ${event.sponsor.name}`} />}
        </header>
        <p className="event-modal-prompt">Escolha um caminho. Esta decisão entra na sua história.</p>
        <div className="event-choice-grid">
          {event.choices.map((choice, index) => {
            const effects = choiceEffects(choice);
            const watermark = choice.label.split(" ").slice(0, 1)[0]?.slice(0, 8).toUpperCase() ?? "ESCOLHA";
            return (
              <button key={choice.label} type="button" className="event-choice-card" onClick={() => onChoose(index)}>
                <span className="event-choice-number">0{index + 1}</span>
                <span className="event-choice-watermark" aria-hidden>{watermark}</span>
                <strong>{choice.label}</strong>
                {effects.length > 0 && (
                  <div className="event-choice-effects">
                    {effects.map((effect) => <span className={effect.negative ? "risk" : ""} key={effect.label}>{effect.label}</span>)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <small className="event-modal-foot">Suas escolhas também viram parte da sua história.</small>
      </article>
  );
}

function Career({ career, club, result, toast, event, onChoose, onDismiss, onPlay, onMarket, onLegacy, onSetFinalStyle, onSetArchetype }: { career: CareerState; club: Club; result: SeasonResult | null; toast: string | null; event: CareerEvent | null; onChoose: (index: number) => void; onDismiss: () => void; onPlay: () => void; onMarket: () => void; onLegacy: () => void; onSetFinalStyle: (style: FinalStyle) => void; onSetArchetype: (archetype: string) => void }) {
  const player = career.player, ovr = computeOvr(player), idolatry = player.clubIdolatry[player.clubId] ?? 0;
  const top = positionAttributeKeys[player.position].map((key) => [key, player.attributes[key]] as const).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const seasonGames = result?.games ?? 0, seasonGoals = result?.goals ?? 0;
  const country = countries.find((item) => item.name === player.nationality) ?? countries.find((item) => item.code === "BR")!;
  const shirtTag = player.position === "MEI" ? "10" : player.position === "ATA" ? "9" : String(player.shirtNumber);
  const earned = career.history.length * player.salary;
  const glory = player.fame * 1375 + idolatry * 12;
  const nextIdolatry = Math.min(100, Math.ceil(idolatry / 25) * 25 || 25);
  const selectionStatus = ovr >= 82 ? "CONVOCADO" : ovr >= 72 ? "EM OBSERVAÇÃO" : "SEM CHANCE";

  return <main className="app-shell career-shell dashboard-shell">
    <div className="dashboard-grid el-idolo-grid">
      <aside className="gallery-panel">
        <div className="side-label">GALERIA</div>
        {player.titles.length === 0
          ? <p className="gallery-empty">As taças que você ganhar aparecem aqui.</p>
          : <div className="gallery-trophies">{player.titles.map((title) => <span key={title} className="gallery-trophy" title={title}>🏆</span>)}</div>}
      </aside>
      <div className="dashboard-center">
        <section className="athlete-panel dashboard-card">
          <div className="athlete-head">
            <div className="rating-block"><strong>{ovr}</strong><span>OVERALL</span></div>
            <div className="athlete-identity">
              <h1>{player.name.toUpperCase()} <b>· {player.position} {shirtTag}</b></h1>
              <p className="athlete-clubline">{club.name.toUpperCase()} · {career.season} · {player.age} ANOS</p>
              <p className="athlete-leagline"><img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt="" /> {career.currentCompetition.toUpperCase()} · FAMA {fameGrade(player.fame)}</p>
            </div>
            <ClubCrest club={club} />
            <button className="panel-exit" onClick={onLegacy} aria-label="Ver legado">↗</button>
          </div>
          <div className="score-strip"><StatTile value={player.goals} label="GOLS" accent /><StatTile value={player.assists} label="ASSISTÊNCIAS" /><StatTile value={player.games} label="JOGOS" /><StatTile value={player.titles.length} label="TÍTULOS" /></div>
          <div className="attribute-chips">{top.map(([key, value]) => <div key={key}><b className={value >= 75 ? "green" : value >= 60 ? "gold" : ""}>{value}</b><span>{attributeLabels[key]}</span></div>)}</div>
          <div className="finance-strip finance-idolo">
            <div><b>R$ {(player.marketValue / 1000).toFixed(0)}K</b><span>VALOR</span></div>
            <div><b>R$ {(earned / 1000).toFixed(0)}K</b><span>FATURADO</span></div>
            <div><b className="glory">{glory.toLocaleString("pt-BR")}</b><span>GLÓRIA</span></div>
          </div>
          <div className="loyalty-row">
            <div className="loyalty">
              <div className="loyalty-head"><span>IDOLATRIA</span><small>MAIS UM · {idolatry}/{nextIdolatry}</small></div>
              <div className="loyalty-track"><i style={{ width: `${idolatry}%` }} /></div>
              <div className="loyalty-stages"><span>●</span><span>♥</span><span>★</span><span>♛</span></div>
            </div>
          </div>
          <div className="selection-line"><span><img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt="" /> SELEÇÃO: {selectionStatus}{result?.nationalTeamCompetition && ovr >= 82 ? ` · ${result.nationalTeamTitle ? "CAMPEÃO" : "DISPUTOU"} ${result.nationalTeamCompetition.toUpperCase()}` : ""}</span><span>{career.history.length} TEMPORADAS</span></div>
          <button type="button" className="career-history" onClick={onLegacy}>☷&nbsp; VER CARREIRA</button>
          <div className="dashboard-actions" aria-label="Atalhos da carreira">
            <button type="button" className="action-chip action-play" disabled={!career.finalStyle || !career.archetype} onClick={onPlay} title="Jogar temporada">▶</button>
            <button type="button" className="action-chip action-market" disabled={!career.finalStyle || !career.archetype} onClick={onMarket} title="Mercado">💼</button>
            <button type="button" className="action-chip action-free" disabled title="Loja em breve">🛒<small>GRÁTIS</small></button>
          </div>
        </section>

        {!career.finalStyle ? (
          <section className="dashboard-onboarding">
            <span className="dashboard-onboarding-kicker">PRIMEIRO PASSO</span>
            <PlayerTypePicker value={null} onChange={onSetFinalStyle} />
          </section>
        ) : !career.archetype ? (
          <section className="dashboard-onboarding dashboard-archetype-stage">
            <span className="dashboard-onboarding-kicker">SEU ESTILO ESTÁ DEFINIDO</span>
            <ArchetypePicker position={player.position} value={career.archetype} onChange={onSetArchetype} />
          </section>
        ) : null}
        {event && <EventModal event={event} onChoose={onChoose} />}
      </div>
      <aside className="trajectory-panel">
        <div className="side-label">TRAJETÓRIA</div>
        <div className="trajectory-item active"><ClubCrest club={club} small /><div><b>{career.season}</b><span>{club.name}</span><small>{seasonGames} JG · {seasonGoals} GL</small></div></div>
        {career.history.slice(-4).reverse().map((season) => <div className="trajectory-item" key={season.season}><span className="trajectory-dot" /><div><b>{season.season}</b><span>{season.title ?? "Temporada"}</span><small>{season.games} JG · {season.goals} GL</small></div></div>)}
      </aside>
    </div>
    {toast && <button className="toast" onClick={onDismiss}>{toast}<span>×</span></button>}
  </main>;
}
function StatTile({ value, label, accent = false, gold = false }: { value: string | number; label: string; accent?: boolean; gold?: boolean }) { return <div className={`stat-tile ${accent ? "accent" : ""} ${gold ? "gold" : ""}`}><b>{value}</b><span>{label}</span></div>; }
function Meter({ label, value, gold = false }: { label: string; value: number; gold?: boolean }) { return <div className="form-meter"><span>{label}</span><b>{value}</b><i><em className={gold ? "gold" : ""} style={{ width: `${value}%` }} /></i></div>; }

function Evolution({ player, seed, onSelect, onSkip }: { player: Player; seed: number; onSelect: (card: UpgradeCard) => void; onSkip: () => void }) { const cards = chooseUpgradeCards(player.position, seed); return <main className="app-shell evolution-shell"><nav className="topbar"><Brand compact /><span className="save-chip">EVOLUÇÃO DE TEMPORADA</span></nav><section className="evolution-wrap"><div className="eyebrow">MOMENTO DE TREINO</div><h1>Escolha o próximo salto.</h1><p>Uma carta por temporada. Ganhos reais, feitos para a posição que você escolheu.</p><div className="card-grid">{cards.map((card) => <button key={card.id} className={`training-card ${card.rarity}`} onClick={() => onSelect(card)}><span className="rarity">{card.rarity}</span><b>{card.name}</b><div>{Object.entries(card.changes).map(([key, value]) => <span key={key}>+{value} {attributeLabels[key]}</span>)}</div><i>ESCOLHER →</i></button>)}</div><button className="text-action" onClick={onSkip}>Pular evolução desta temporada</button></section></main>; }
function Market({ currentClub, player, onBack, onSelect }: { currentClub: Club; player: Player; onBack: () => void; onSelect: (club: Club) => void }) { const offers = clubs.filter((club) => club.id !== currentClub.id).sort((a, b) => Number(currentClub.rivals.includes(b.id)) - Number(currentClub.rivals.includes(a.id))).slice(0, 4); return <main className="app-shell market-shell"><nav className="topbar"><button className="back-button" onClick={onBack}>← Carreira</button><Brand compact /><span className="step">JANELA DE MERCADO</span></nav><section className="market-wrap"><div className="eyebrow">CONTRATOS E CONSEQUÊNCIAS</div><h1>O mercado está de olho.</h1><p>Trocar de clube não é apenas mudar de camisa. Em clássico, a arquibancada não esquece.</p><div className="offer-list"><article className="offer current"><ClubCrest club={currentClub} /><div><small>CLUBE ATUAL</small><h2>{currentClub.name}</h2><p>Idolatria: {player.clubIdolatry[currentClub.id] ?? 0}/100</p></div><b>FICAR</b></article>{offers.map((club) => { const rival = currentClub.rivals.includes(club.id); return <article className={`offer ${rival ? "rival" : ""}`} key={club.id}><ClubCrest club={club} /><div><small>{rival ? "RIVAL DIRETO · RISCO DE JUDAS" : "PROPOSTA FORMAL"}</small><h2>{club.name}</h2><p>Força {club.strength} · reputação {club.reputation}</p></div><button className="button button-ghost" onClick={() => onSelect(club)}>ANALISAR</button></article>; })}</div></section></main>; }
function MiniGame({ game, result, decision, score, onScore, onFinish }: { game: MiniGameDefinition; result: SeasonResult | null; decision: CareerEvent | null; score: number; onScore: (value: number) => void; onFinish: (won: boolean) => void }) {
  const body = game.mode === "sequence" ? <SequenceGame game={game} onFinish={onFinish} />
    : game.mode === "timing" ? <TimingGame onFinish={onFinish} />
      : game.mode === "grid" ? <GridGame onFinish={onFinish} />
        : game.mode === "connect" ? <ConnectGame onFinish={onFinish} />
          : game.mode === "code" ? <CodeGame onFinish={onFinish} />
            : <LaneGame game={game} score={score} onScore={onScore} onFinish={onFinish} />;
  const final = result?.cupFinal;
  return <main className="app-shell game-shell"><nav className="topbar"><Brand compact /><span className="save-chip">{decision ? "DECISÃO · MINIGAME" : "FINAL · MINIGAME"}</span></nav><section className="game-wrap"><div className="eyebrow">{decision ? "A ESCOLHA PRECISA DE AÇÃO" : final ? final.competitionName.toUpperCase() : game.name}</div><h1>{decision ? decision.title : final ? `Final contra ${final.opponentClubName}.` : "Decisão no detalhe."}</h1><p>{decision ? `${decision.copy} Resolva o minigame para confirmar sua decisão.` : final ? `A campanha colocou seu clube diante do ${final.opponentClubName}. O minigame decide a taça.` : result?.title ? "Você pode transformar o título em uma noite inesquecível." : game.description}</p><div className="tutorial">{game.tutorial}</div>{body}</section></main>;
}
function LaneGame({ game, score, onScore, onFinish }: { game: MiniGameDefinition; score: number; onScore: (value: number) => void; onFinish: (won: boolean) => void }) { const [round, setRound] = useState(0); const targets = useMemo(() => [2, 0, 3, 1, 2], []); function choose(lane: number) { const next = score + (lane === targets[round] ? 1 : 0); onScore(next); if (round + 1 >= game.rounds) onFinish(next >= Math.ceil(game.rounds * .6)); else setRound(round + 1); } return <><div className="scoreboard"><span>Rodada {round + 1}/{game.rounds}</span><b>{score} acertos</b></div><div className="goal">{[0, 1, 2, 3].map((lane) => <button key={lane} onClick={() => choose(lane)} className={`goal-zone zone-${lane}`} aria-label={`Escolher zona ${lane + 1}`}><i /></button>)}</div><p className="game-hint">Leia o espaço e escolha uma faixa.</p></>; }
function SequenceGame({ game, onFinish }: { game: MiniGameDefinition; onFinish: (won: boolean) => void }) { const sequence = [1, 3, 0, 2, 1]; const [step, setStep] = useState(0); function tap(value: number) { if (value !== sequence[step]) return onFinish(false); if (step + 1 === game.rounds) return onFinish(true); setStep(step + 1); } return <><div className="scoreboard"><span>Sequência</span><b>{step}/{game.rounds}</b></div><div className="signal-grid">{[0, 1, 2, 3].map((value) => <button key={value} className={`signal signal-${value}`} onClick={() => tap(value)} aria-label={`Sinal ${value + 1}`} />)}</div><p className="game-hint">O padrão: 2 · 4 · 1 · 3 · 2</p></>; }
function TimingGame({ onFinish }: { onFinish: (won: boolean) => void }) { const [mark, setMark] = useState(6); const [moving, setMoving] = useState(true); useEffect(() => { if (!moving) return; const timer = window.setInterval(() => setMark((value) => (value + 7) % 101), 90); return () => window.clearInterval(timer); }, [moving]); function stop() { setMoving(false); onFinish(mark >= 42 && mark <= 62); } return <div className="timing"><div className="timing-track"><i className="timing-target" /><b style={{ left: `${mark}%` }} /></div><button className="button button-primary" onClick={stop} disabled={!moving}>BATER NA BOLA</button><p className="game-hint">A faixa dourada é o ponto ideal da batida.</p></div>; }
function GridGame({ onFinish }: { onFinish: (won: boolean) => void }) { const safe = [0, 4, 8]; const [step, setStep] = useState(0); function choose(index: number) { if (index !== safe[step]) return onFinish(false); if (step === 2) return onFinish(true); setStep(step + 1); } return <><div className="scoreboard"><span>Espaços seguros</span><b>{step}/3</b></div><div className="safe-grid">{Array.from({ length: 9 }, (_, index) => <button key={index} onClick={() => choose(index)} aria-label={`Espaço ${index + 1}`} />)}</div><p className="game-hint">Encontre três espaços seguros na ordem certa.</p></>; }
function ConnectGame({ onFinish }: { onFinish: (won: boolean) => void }) { const [columns, setColumns] = useState<number[]>([]); function play(column: number) { if (columns.includes(column)) return; const next = [...columns, column]; setColumns(next); if (next.length >= 4) onFinish(true); } return <><div className="connect-board">{Array.from({ length: 7 }, (_, index) => <button key={index} onClick={() => play(index)} className={columns.includes(index) ? "filled" : ""} aria-label={`Coluna ${index + 1}`}><i /></button>)}</div><p className="game-hint">Conecte quatro peças diferentes para dominar o duelo mental.</p></>; }
function CodeGame({ onFinish }: { onFinish: (won: boolean) => void }) { const code = "2714"; const [value, setValue] = useState(""); const [visible, setVisible] = useState(true); useEffect(() => { const timer = window.setTimeout(() => setVisible(false), 1600); return () => window.clearTimeout(timer); }, []); function enter(digit: string) { const next = `${value}${digit}`; setValue(next); if (next.length === 4) onFinish(next === code); } return <><div className="code-display">{visible ? code : value.padEnd(4, "•")}</div><div className="keypad">{[1,2,3,4,5,6,7,8,9,0].map((digit) => <button key={digit} onClick={() => enter(String(digit))}>{digit}</button>)}</div><p className="game-hint">Memorize o código antes que a prancheta feche.</p></>; }
function Legacy({ career, club, onRestart }: { career: CareerState; club: Club; onRestart: () => void }) { const result = legacy(career.player), idolatry = career.player.clubIdolatry[club.id] ?? 0, clubTitle = idolatry >= 92 ? `Ídolo do ${club.name}` : idolatry >= 75 ? `Lenda do ${club.name}` : `Nome marcante no ${club.name}`; return <main className="app-shell legacy-shell"><div className="legacy-light" /><section className="legacy-wrap"><Brand /><div className="eyebrow">FIM DE CARREIRA</div><span className="legacy-score">{result.score}<small>/ 1000</small></span><h1>{result.global}</h1><p className="club-title">{clubTitle}{career.player.judasAt.length > 0 && ". Judas em uma rivalidade que a torcida não perdoou."}</p><div className="legacy-stats"><span><b>{career.player.games}</b> jogos</span><span><b>{career.player.goals}</b> gols</span><span><b>{career.player.assists}</b> assistências</span><span><b>{career.player.titles.length}</b> títulos</span><span><b>{career.player.awards.length}</b> prêmios</span></div><p className="legacy-copy">O campo esquece placares. As pessoas, não. Sua carreira agora pertence à história.</p><button className="button button-primary" onClick={onRestart}>COMEÇAR NOVA HISTÓRIA <span>→</span></button></section></main>; }
