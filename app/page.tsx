"use client";

import { useEffect, useMemo, useState } from "react";
import { applyCard, baseAttributes, chooseUpgradeCards, clubCompetesIn, clubs, competitions, computeOvr, countries, generationalAttributes, legacy, miniGameForSeed, positionAttributeKeys, shouldRetire, simulateSeason, type CareerEvent, type CareerState, type Club, type MiniGameDefinition, type Player, type Position, type SeasonResult, type UpgradeCard } from "@/game";

type Screen = "home" | "create" | "career" | "evolution" | "event" | "market" | "minigame" | "legacy";
const positions: Array<{ id: Position; label: string }> = [
  { id: "GOL", label: "Goleiro" },
  { id: "MEI", label: "Meia · Camisa 10" },
  { id: "ATA", label: "Atacante · Camisa 9" },
];
const attributeLabels: Record<string, string> = { reflexo: "Reflexo", elasticidade: "Elasticidade", posicionamento: "Posicionamento", saida: "Saída", lideranca: "Liderança", fisico: "Físico", velocidade: "Velocidade", passe: "Passe", finalizacao: "Finalização", drible: "Drible", cabecada: "Cabeçada", forca: "Força" };
const LOCAL_RANKING_KEY = "o-rei-local-ranking";
const CAREER_SUMMARY_RESET_KEY = "o-rei:career-summary-reset:v1";
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
  if (!clubRecord.titles.includes(title)) clubRecord.titles.push(title);
  return { ...career, clubHistory };
}

function crestLetters(name: string) { return name.split(" ").map((word) => word[0]).join("").slice(0, 3).toUpperCase(); }
function ClubCrest({ club, small = false }: { club: Club; small?: boolean }) {
  const [missing, setMissing] = useState(false);
  return <span title={`Símbolo de ${club.name}`} className={`crest crest-${club.id} ${small ? "crest-small" : ""}`}>{missing ? crestLetters(club.name) : <img src={`/crests/${club.crest}.png`} alt={`Escudo do ${club.name}`} onError={() => setMissing(true)} />}</span>;
}
function Brand({ compact = false }: { compact?: boolean }) { return <div className={`brand ${compact ? "brand-compact" : ""}`}><img src="/o-rei-logo.png" alt="O REI — bola de couro e coroa" /></div>; }

function createInitialState(data: { name: string; position: Position; club: Club; foot: Player["preferredFoot"]; height: number; shirt: number; nationality: string; mode: "normal" | "generational" }): CareerState {
  const seed = Date.now();
  const player: Player = { id: `jogador-${seed}`, name: data.name.trim() || "Novo Craque", nationality: data.nationality, position: data.position, preferredFoot: data.foot, heightCm: data.height, shirtNumber: data.position === "MEI" ? 10 : data.position === "ATA" ? 9 : data.shirt, age: 16, clubId: data.club.id, attributes: data.mode === "generational" ? generationalAttributes(data.position, seed) : baseAttributes(), form: 68, fame: 3, salary: 8000, marketValue: 400000, games: 0, goals: 0, assists: 0, cleanSheets: 0, saves: 0, titles: [], awards: [], clubIdolatry: { [data.club.id]: 12 }, judasAt: [], injuries: 0 };
  return { seed, season: 2026, player, history: [], clubHistory: [{ clubId: data.club.id, titles: [] }], currentCompetition: "Brasileirão Série A", mode: data.mode };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [career, setCareer] = useState<CareerState | null>(null);
  const [lastResult, setLastResult] = useState<SeasonResult | null>(null);
  const [event, setEvent] = useState<CareerEvent | null>(null);
  const [eventQueue, setEventQueue] = useState<CareerEvent[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [activeGame, setActiveGame] = useState<MiniGameDefinition | null>(null);
  useEffect(() => {
    if (localStorage.getItem(CAREER_SUMMARY_RESET_KEY) !== "done") {
      ["o-rei-career", "o-rei:career:v1", LOCAL_RANKING_KEY].forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(CAREER_SUMMARY_RESET_KEY, "done");
      return;
    }
    const saved = localStorage.getItem("o-rei-career");
    if (saved) { try { const parsed = JSON.parse(saved) as CareerState; const validPosition = ["GOL", "MEI", "ATA"].includes(parsed.player?.position); const validAttributes = positionAttributeKeys[parsed.player?.position as Position]?.every((key) => typeof parsed.player.attributes?.[key] === "number"); if (validPosition && validAttributes) setCareer(parsed); else { localStorage.removeItem("o-rei-career"); setToast("A atualização de posições exige uma nova carreira."); } } catch { localStorage.removeItem("o-rei-career"); } }
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  useEffect(() => { if (career) localStorage.setItem("o-rei-career", JSON.stringify(career)); }, [career]);
  function begin(data: Parameters<typeof createInitialState>[0]) { setCareer(createInitialState(data)); setLastResult(null); setScreen("career"); }
  function playSeason() { if (!career) return; const outcome = simulateSeason(career); setCareer(outcome.state); setLastResult(outcome.result); setGameScore(0); setActiveGame(miniGameForSeed(outcome.state.seed + outcome.state.season)); if (shouldRetire(outcome.state.player, outcome.state.seed)) { saveLocalRanking(outcome.state, clubs.find((entry) => entry.id === outcome.state.player.clubId) ?? clubs[0]); return setScreen("legacy"); } if (outcome.result.events.length) { setEvent(outcome.result.events[0]); setEventQueue(outcome.result.events.slice(1)); return setScreen("event"); } setScreen(outcome.result.finalOpportunity ? "minigame" : "evolution"); }
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
    setCareer(addClubTitle({ ...career, player, history }, cupFinal.competitionName)); setLastResult(resolved);
  }
  function chooseEvent(index: number) {
    if (!career || !event) return;
    const choice = event.choices[index];
    const player = { ...career.player, clubIdolatry: { ...career.player.clubIdolatry }, titles: [...career.player.titles] };
    player.fame = Math.max(0, player.fame + (choice.fame ?? 0));
    player.form = Math.max(1, Math.min(99, player.form + (choice.form ?? 0)));
    player.salary += choice.salary ?? 0;
    player.injuries += choice.injuryWeeks ?? 0;
    player.clubIdolatry[player.clubId] = Math.max(0, Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + (choice.idolatry ?? 0)));

    if (choice.finalOutcome && lastResult?.cupFinal) {
      const won = choice.finalOutcome === "win";
      const cupFinal = { ...lastResult.cupFinal, won };
      const resolved = { ...lastResult, cupFinal, title: won ? cupFinal.competitionName : lastResult.title };
      if (won) {
        if (!player.titles.includes(cupFinal.competitionName)) player.titles.push(cupFinal.competitionName);
        player.clubIdolatry[player.clubId] = Math.min(100, (player.clubIdolatry[player.clubId] ?? 0) + 9);
      }
      const history = [...career.history];
      history[history.length - 1] = resolved;
      setCareer(won ? addClubTitle({ ...career, player, history }, cupFinal.competitionName) : { ...career, player, history });
      setLastResult(resolved);
      setEventQueue([]);
      setToast(won ? "DEFESA DECISIVA! A taça é sua." : "A final escapou no último lance.");
      setScreen("evolution");
      return;
    }

    setCareer({ ...career, player });
    if (eventQueue.length) {
      setEvent(eventQueue[0]);
      setEventQueue(eventQueue.slice(1));
      return;
    }
    setToast("Decisões registradas. A arquibancada sentiu o impacto.");
    setScreen(lastResult?.finalOpportunity ? "minigame" : "evolution");
  }
  function takeCard(card: UpgradeCard) { if (!career) return; setCareer({ ...career, player: applyCard(career.player, card) }); setToast(`${card.name} aplicada. OVR recalculado.`); setScreen("career"); }
  function transferTo(club: Club) { if (!career) return; const previous = clubs.find((item) => item.id === career.player.clubId); const rival = Boolean(previous?.rivals.includes(club.id)); const player = { ...career.player, clubId: club.id, clubIdolatry: { ...career.player.clubIdolatry, [club.id]: 5 }, judasAt: [...career.player.judasAt] }; if (rival && previous && !player.judasAt.includes(previous.id)) player.judasAt.push(previous.id); const clubHistory = (career.clubHistory ?? []).map((entry) => ({ ...entry, titles: [...entry.titles] })); if (!clubHistory.some((entry) => entry.clubId === club.id)) clubHistory.push({ clubId: club.id, titles: [] }); setCareer({ ...career, player, clubHistory }); setToast(rival ? `Transferência selada. Parte da torcida do ${previous?.name} vai chamá-lo de Judas.` : `Contrato assinado com ${club.name}.`); setScreen("career"); }
  const club = career ? clubs.find((item) => item.id === career.player.clubId) ?? clubs[0] : clubs[0];
  if (screen === "home") return <Start hasCareer={Boolean(career)} onNew={() => setScreen("create")} onContinue={() => setScreen("career")} />;
  if (screen === "create") return <Create onBack={() => setScreen("home")} onCreate={begin} />;
  if (!career) return null;
  if (screen === "event" && event) return <Event event={event} onChoose={chooseEvent} />;
  if (screen === "evolution") return <Evolution player={career.player} seed={career.seed + career.season} onSelect={takeCard} onSkip={() => setScreen("career")} />;
  if (screen === "market") return <Market currentClub={club} player={career.player} generational={career.mode === "generational"} onBack={() => setScreen("career")} onSelect={transferTo} />;
  if (screen === "minigame") return <MiniGame game={activeGame ?? miniGameForSeed(career.seed + career.season)} result={lastResult} score={gameScore} onScore={setGameScore} onFinish={(won) => { resolveFinal(won); setToast(won ? "Decisão vencida. Seu nome entrou na noite da final." : "A decisão escapou, mas a carreira continua."); setScreen("evolution"); }} />;
  if (screen === "legacy") return <Legacy career={career} onRestart={() => { localStorage.removeItem("o-rei-career"); setCareer(null); setScreen("home"); }} />;
  return <Career career={career} club={club} result={lastResult} toast={toast} onDismiss={() => setToast(null)} onPlay={playSeason} onMarket={() => setScreen("market")} />;
}

function Start({ hasCareer, onNew, onContinue }: { hasCareer: boolean; onNew: () => void; onContinue: () => void }) { return <main className="app-shell start-shell"><div className="stadium-glow" /><nav className="topbar"><Brand compact /><span className="save-chip">◉ Carreira local protegida</span></nav><section className="start-content"><div className="eyebrow">UMA CARREIRA. TODA A HISTÓRIA.</div><Brand /><h1>Do primeiro jogo à eternidade.</h1><p>Crie seu atleta aos 16 anos. Conquiste títulos, enfrente clássicos e escreva um legado que não cabe numa súmula.</p><div className="start-actions"><button className="button button-primary" onClick={onNew}>COMEÇAR CARREIRA <span>→</span></button>{hasCareer && <button className="button button-ghost" onClick={onContinue}>CONTINUAR CARREIRA</button>}</div><div className="feature-row"><span><b>10</b> minigames decisivos</span><span><b>20</b> atributos reais</span><span><b>0–1000</b> legado final</span></div></section><footer>O REI · futebol, escolhas e memória</footer></main>; }

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

function Career({ career, club, result, toast, onDismiss, onPlay, onMarket }: { career: CareerState; club: Club; result: SeasonResult | null; toast: string | null; onDismiss: () => void; onPlay: () => void; onMarket: () => void }) {
  const player = career.player, ovr = computeOvr(player), idolatry = player.clubIdolatry[player.clubId] ?? 0;
  const top = positionAttributeKeys[player.position].map((key) => [key, player.attributes[key]] as const).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const seasonGames = result?.games ?? player.games, seasonGoals = result?.goals ?? player.goals, seasonAssists = result?.assists ?? player.assists;
  const seasonRating = (5.4 + (player.form / 100) * 2.3 + Math.min(1.2, (seasonGoals + seasonAssists) / Math.max(1, seasonGames) * .8)).toFixed(1);
  return <main className="app-shell career-shell dashboard-shell">
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <section className="athlete-panel">
          <div className="athlete-head">
            <div className="rating-block"><strong>{ovr}</strong><span>OVERALL</span></div>
            <div className="athlete-identity"><h1><i>{player.nationality === "Brasil" ? "🇧🇷" : "⚽"}</i> {player.name.toUpperCase()} <b>· {player.position}</b></h1><p>{club.name.toUpperCase()} · {career.currentCompetition.toUpperCase()} · <em>FAMA {player.fame}</em></p></div>
            <ClubCrest club={club} />

          </div>
          <div className="score-strip"><StatTile value={player.goals} label="GOLS" accent /><StatTile value={player.assists} label="ASSISTÊNCIAS" /><StatTile value={player.games} label="JOGOS" /><StatTile value={player.titles.length} label="TÍTULOS" /></div>
          <div className="attribute-chips">{top.map(([key, value]) => <div key={key}><b className={value >= 75 ? "green" : ""}>{value}</b><span>{attributeLabels[key]}</span></div>)}</div>
          <div className="finance-strip"><div><b>R$ {(player.marketValue / 1000).toFixed(0)}K</b><span>VALOR</span></div><div><b>R$ {(player.salary / 1000).toFixed(0)}K</b><span>SALÁRIO</span></div><div className="next-match"><ClubCrest club={club} small /><b>{career.currentCompetition}</b><span>{club.style === "posse" ? "EQUIPE DE POSSE" : "PRÓXIMO DESAFIO"}</span></div></div>
          <div className="loyalty"><span>IDOLATRIA</span><div className="loyalty-track"><i style={{ width: `${idolatry}%` }} /></div><div className="loyalty-stages"><span>●</span><span>♥</span><span>★</span><span>♛</span></div></div>
          <div className="selection-line">{player.nationality === "Brasil" ? "🇧🇷" : "⚽"} SELEÇÃO: {ovr >= 82 ? "CONVOCADO" : "EM OBSERVAÇÃO"}{result?.nationalTeamCompetition && ovr >= 82 ? ` · ${result.nationalTeamTitle ? "CAMPEÃO DA" : "DISPUTOU A"} ${result.nationalTeamCompetition.toUpperCase()}` : ""}<span>{career.history.length} TEMPORADAS</span></div>
        </section>
        <section className="season-panel">
          <div className="season-titleline"><span>O REI ESPORTIVO</span><small>{career.season}/{String(career.season + 1).slice(-2)} · TEMPORADA {career.history.length + 1}</small></div>
          <h2>{result?.nationalTeamTitle ? "CAMPEÃO PELA SELEÇÃO" : result?.title ? "A TEMPORADA FOI SUA" : seasonGames ? "A HISTÓRIA CONTINUA" : "PRONTO PARA ESTREAR?"}</h2>
          <p>{result?.nationalTeamTitle ? `${player.name} conquistou a ${result.nationalTeamTitle} representando ${player.nationality}.` : result ? `${player.name} fechou o ano com números que a torcida vai lembrar.` : `Seu caminho no ${club.name} começa agora. Toda temporada deixa uma marca.`}</p>
          <div className="club-season"><ClubCrest club={club} /><div><b>{club.name}</b><span>{career.currentCompetition}</span></div></div>
          <div className="season-stats"><StatTile value={seasonGames} label="JOGOS" /><StatTile value={seasonGoals} label="GOLS" accent /><StatTile value={seasonAssists} label="ASSIST." accent={player.position === "MEI"} /><StatTile value={seasonGames ? seasonRating : "—"} label="NOTA" /><StatTile value={`R$ ${(player.salary / 1000).toFixed(0)}K`} label="GANHOS" gold /></div>
          <button className="play-button" onClick={onPlay}>CONTINUAR</button>
          {(career.mode === "generational" || career.season % 2 === 0) && <button className="market-action" onClick={onMarket}>VER PROPOSTAS DE MERCADO</button>}
        </section>
      </div>
      <aside className="trajectory-panel"><div className="trajectory-label">TRAJETÓRIA</div><div className="trajectory-item active"><ClubCrest club={club} small /><div><b>{career.season}</b><span>{club.name}</span><small>{seasonGames} JG · {seasonGoals} GL</small></div></div>{career.history.slice(-3).reverse().map((season) => <div className="trajectory-item" key={season.season}><span className="trajectory-dot" /><div><b>{season.season}</b><span>{season.title ?? "Temporada"}</span><small>{season.games} JG · {season.goals} GL</small></div></div>)}</aside>
    </div>
    {toast && <button className="toast" onClick={onDismiss}>{toast}<span>×</span></button>}
  </main>;
}
function StatTile({ value, label, accent = false, gold = false }: { value: string | number; label: string; accent?: boolean; gold?: boolean }) { return <div className={`stat-tile ${accent ? "accent" : ""} ${gold ? "gold" : ""}`}><b>{value}</b><span>{label}</span></div>; }
function Meter({ label, value, gold = false }: { label: string; value: number; gold?: boolean }) { return <div className="form-meter"><span>{label}</span><b>{value}</b><i><em className={gold ? "gold" : ""} style={{ width: `${value}%` }} /></i></div>; }

function Event({ event, onChoose }: { event: CareerEvent; onChoose: (index: number) => void }) { return <main className="app-shell decision-shell"><div className="decision-card"><div className="eyebrow">FORA DAS QUATRO LINHAS</div><span className="decision-mark">◆</span><h1>{event.title}</h1><p>{event.copy}</p>{event.sponsor && <img className="sponsor-mark" src={event.sponsor.logo} alt={`Logo da ${event.sponsor.name}`} />}<div className="choice-list">{event.choices.map((choice, index) => <button key={choice.label} onClick={() => onChoose(index)}><span>0{index + 1}</span>{choice.label}<i>→</i></button>)}</div><small>Suas escolhas também viram parte da sua história.</small></div></main>; }
function Evolution({ player, seed, onSelect, onSkip }: { player: Player; seed: number; onSelect: (card: UpgradeCard) => void; onSkip: () => void }) { const cards = chooseUpgradeCards(player.position, seed); return <main className="app-shell evolution-shell"><nav className="topbar"><Brand compact /><span className="save-chip">EVOLUÇÃO DE TEMPORADA</span></nav><section className="evolution-wrap"><div className="eyebrow">MOMENTO DE TREINO</div><h1>Escolha o próximo salto.</h1><p>Uma carta por temporada. Ganhos reais, feitos para a posição que você escolheu.</p><div className="card-grid">{cards.map((card) => <button key={card.id} className={`training-card ${card.rarity}`} onClick={() => onSelect(card)}><span className="rarity">{card.rarity}</span><b>{card.name}</b><div>{Object.entries(card.changes).map(([key, value]) => <span key={key}>+{value} {attributeLabels[key]}</span>)}</div><i>ESCOLHER →</i></button>)}</div><button className="text-action" onClick={onSkip}>Pular evolução desta temporada</button></section></main>; }
function Market({ currentClub, player, generational, onBack, onSelect }: { currentClub: Club; player: Player; generational: boolean; onBack: () => void; onSelect: (club: Club) => void }) { const offers = clubs.filter((club) => club.id !== currentClub.id).sort((a, b) => generational ? (b.reputation + b.strength) - (a.reputation + a.strength) : Number(currentClub.rivals.includes(b.id)) - Number(currentClub.rivals.includes(a.id))).slice(0, generational ? 6 : 4); return <main className="app-shell market-shell"><nav className="topbar"><button className="back-button" onClick={onBack}>← Carreira</button><Brand compact /><span className="step">JANELA DE MERCADO</span></nav><section className="market-wrap"><div className="eyebrow">CONTRATOS E CONSEQUÊNCIAS</div><h1>O mercado está de olho.</h1><p>Trocar de clube não é apenas mudar de camisa. Em clássico, a arquibancada não esquece.</p><div className="offer-list"><article className="offer current"><ClubCrest club={currentClub} /><div><small>CLUBE ATUAL</small><h2>{currentClub.name}</h2><p>Idolatria: {player.clubIdolatry[currentClub.id] ?? 0}/100</p></div><b>FICAR</b></article>{offers.map((club) => { const rival = currentClub.rivals.includes(club.id); return <article className={`offer ${rival ? "rival" : ""}`} key={club.id}><ClubCrest club={club} /><div><small>{rival ? "RIVAL DIRETO · RISCO DE JUDAS" : "PROPOSTA FORMAL"}</small><h2>{club.name}</h2><p>Força {club.strength} · reputação {club.reputation}</p></div><button className="button button-ghost" onClick={() => onSelect(club)}>ANALISAR</button></article>; })}</div></section></main>; }
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
  const nationalTeamTitles = career.history.filter((season) => Boolean(season.nationalTeamTitle)).length;
  return <main className="app-shell legacy-shell"><div className="legacy-light" /><section className="legacy-wrap"><Brand /><div className="eyebrow">FIM DE CARREIRA</div><span className="legacy-score">{result.score}<small>/ 1000</small></span><h1>{honor}</h1><p className="club-title">O clube que mais marcou sua carreira.</p><div className="legacy-stats"><span><b>{career.player.games}</b> jogos</span><span><b>{career.player.goals}</b> gols</span><span><b>{career.player.assists}</b> assistências</span><span><b>{nationalTeamTitles}</b> títulos pela seleção</span></div><section className="club-summary"><h2>CLUBES DA CARREIRA</h2>{clubRows.map(({ club, titles, idolatry }) => <article key={club.id} className="club-summary-row"><ClubCrest club={club} small /><div><b>{club.name}</b><small>{idolatry}/100 · {idolatry >= 80 ? "Lenda" : idolatry >= 60 ? "Ídolo" : "Passagem marcante"}</small><p>{titles.length ? titles.join(" · ") : "Sem títulos"}</p></div></article>)}</section><div className="local-ranking"><div className="local-ranking-title">TOP 10 DESTE COMPUTADOR <small>OFFLINE</small></div>{ranking.length ? <ol>{ranking.map((entry, index) => <li key={entry.playerId} className={entry.playerId === career.player.id ? "current" : ""}><b>#{index + 1}</b><span>{entry.name} · {entry.position}<small>{entry.clubName} · {entry.titles} títulos</small></span><strong>{entry.score}</strong></li>)}</ol> : <p>Nenhuma carreira encerrada ainda.</p>}</div><button className="button button-primary" onClick={onRestart}>COMEÇAR NOVA HISTÓRIA <span>→</span></button></section></main>; }
