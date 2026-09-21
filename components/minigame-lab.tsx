"use client";

import { useEffect, useMemo, useState } from "react";

type Difficulty = "Fácil" | "Médio" | "Difícil" | "Muito difícil";
type GameId = "code" | "cups" | "timing" | "maze" | "tic-tac-toe" | "pairs" | "sliding-puzzle" | "pressure-map" | "golden-zone" | "ball-trace";
type Game = { id: GameId; name: string; exclusive?: boolean; summary: string };

const games: Game[] = [
  { id: "code", name: "Código da prancheta", summary: "Memorize e reproduza códigos de cinco números em três fases." },
  { id: "cups", name: "Copos embaralhados", summary: "Acompanhe a bola entre quatro copos após seis a oito embaralhamentos." },
  { id: "timing", name: "Marca vermelha", summary: "Pare o marcador dentro da área vermelha no momento certo." },
  { id: "maze", name: "Labirinto", summary: "Leve a bola até o gol escolhendo apenas casas conectadas." },
  { id: "tic-tac-toe", name: "Jogo da Velha", summary: "Feche uma linha de três símbolos antes do adversário." },
  { id: "pairs", name: "Pareamento rápido", summary: "Decore oito pares de símbolos e encontre todos no tabuleiro 4×4." },
  { id: "sliding-puzzle", name: "Quebra-cabeça", summary: "Organize as peças numeradas para completar o quadro." },
  { id: "pressure-map", name: "Mapa de pressão", exclusive: true, summary: "Exclusivo: trace a saída segura pela pressão adversária." },
  { id: "golden-zone", name: "Zona de ouro", exclusive: true, summary: "Exclusivo: uma versão mais exigente da marca de precisão." },
  { id: "ball-trace", name: "Rastrear a bola", exclusive: true, summary: "Exclusivo: siga a bola entre os corredores e identifique o destino." },
];

const config: Record<Difficulty, { speed: number; target: number; sequence: number; attempts: number }> = {
  "Fácil": { speed: 95, target: 22, sequence: 3, attempts: 10 },
  "Médio": { speed: 62, target: 16, sequence: 4, attempts: 8 },
  "Difícil": { speed: 40, target: 11, sequence: 5, attempts: 6 },
  "Muito difícil": { speed: 27, target: 7, sequence: 6, attempts: 5 },
};

function randomDigits(length = 5) { return Array.from({ length }, () => Math.floor(Math.random() * 10)).join(""); }

export function MiniGameLab() {
  const [selected, setSelected] = useState<GameId>("code");
  const [difficulty, setDifficulty] = useState<Difficulty>("Fácil");
  const [key, setKey] = useState(0);
  const [exclusiveMode, setExclusiveMode] = useState<"club" | "world">("club");
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const game = games.find((entry) => entry.id === selected)!;
  return <main className="lab-shell">
    <header className="lab-header"><a href="/">← O REI</a><div><small>ÁREA DE TESTE</small><h1>MINIGAMES</h1><p>Teste os 10 minigames antes de colocá-los na carreira.</p></div></header>
    <section className="lab-selector">
      <div className="lab-game-list">{games.map((entry) => <button key={entry.id} onClick={() => { setSelected(entry.id); setKey((value) => value + 1); }} className={selected === entry.id ? "selected" : ""}><b>{entry.name}</b><small>{entry.exclusive ? "COPA DO MUNDO / SUPER MUNDIAL" : "NORMAL"}</small></button>)}</div>
      <article className="lab-stage"><div className="lab-intro"><span>{game.exclusive ? "EXCLUSIVO · COPA DO MUNDO E SUPER MUNDIAL" : "MINIGAME NORMAL"}</span><h2>{game.name}</h2><p>{game.summary}</p>{game.id === "pairs" ? <p className="lab-fixed">DIFICULDADE FIXA · 8 PARES · 1,35 SEGUNDO PARA DECORAR</p> : game.exclusive ? <div className="difficulty-picker"><button className={exclusiveMode === "club" ? "active" : ""} onClick={() => { setExclusiveMode("club"); setKey((value) => value + 1); }}>SUPER MUNDIAL · 7 JOGOS</button><button className={exclusiveMode === "world" ? "active" : ""} onClick={() => { setExclusiveMode("world"); setKey((value) => value + 1); }}>COPA DO MUNDO · 8 JOGOS</button></div> : <div className="difficulty-picker">{(Object.keys(config) as Difficulty[]).map((level) => <button key={level} className={difficulty === level ? "active" : ""} onClick={() => { setDifficulty(level); setKey((value) => value + 1); }}>{level}</button>)}</div>}</div>
        {ready ? <GameRunner key={`${selected}-${difficulty}-${exclusiveMode}-${key}`} game={selected} difficulty={difficulty} matches={exclusiveMode === "world" ? 8 : 7} /> : <div className="lab-game lab-loading">Preparando o desafio…</div>}
      </article>
    </section>
  </main>;
}

function Result({ result, onRestart }: { result: "win" | "lose" | null; onRestart: () => void }) {
  if (!result) return null;
  return <div className={`lab-result ${result}`}><b>{result === "win" ? "VOCÊ VENCEU" : "VOCÊ PERDEU"}</b><button onClick={onRestart}>TENTAR NOVAMENTE</button></div>;
}

function GameRunner({ game, difficulty, matches }: { game: GameId; difficulty: Difficulty; matches: number }) {
  const [result, setResult] = useState<"win" | "lose" | null>(null), [attempt, setAttempt] = useState(0);
  const restart = () => { setResult(null); setAttempt((value) => value + 1); };
  const props = { difficulty, done: setResult };
  const content = game === "code" ? <CodeGame {...props} /> : game === "cups" ? <CupsGame {...props} /> : game === "timing" ? <TimingGame {...props} golden={false} /> : game === "maze" ? <MazeGame {...props} /> : game === "tic-tac-toe" ? <TicTacToeGame {...props} /> : game === "pairs" ? <PairsGame {...props} /> : game === "sliding-puzzle" ? <SlidingPuzzleGame {...props} /> : game === "pressure-map" ? <PressureGame {...props} matches={matches} /> : game === "golden-zone" ? <GoldenZoneGame {...props} matches={matches} /> : <TraceGame {...props} matches={matches} />;
  return <div className="lab-game"><Result result={result} onRestart={restart} />{!result && <div key={attempt}>{content}</div>}</div>;
}

function CodeGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const [phase, setPhase] = useState(0), [code, setCode] = useState(() => randomDigits()), [shown, setShown] = useState(true), [entry, setEntry] = useState("");
  useEffect(() => { const timer = window.setTimeout(() => setShown(false), phase === 2 ? 1400 : 2200); return () => window.clearTimeout(timer); }, [phase]);
  function enterDigit(value: string) { const next = entry + value; setEntry(next); if (next.length !== 5) return; if (next !== code) return done("lose"); if (phase === 2) return done("win"); setPhase(phase + 1); setCode(randomDigits()); setEntry(""); setShown(true); }
  return <><div className="lab-status"><b>FASE {phase + 1}/3</b><span>{shown ? "Memorize os 5 números" : "Digite o código"}</span></div><div className="code-screen">{shown ? code : entry.padEnd(5, "•")}</div><div className="lab-keypad">{[1,2,3,4,5,6,7,8,9,0].map((digit) => <button key={digit} disabled={shown} onClick={() => enterDigit(String(digit))}>{digit}</button>)}</div></>;
}

function CupsGame({ difficulty, done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const [ball] = useState(() => Math.floor(Math.random() * 4)); const [positions, setPositions] = useState([0, 1, 2, 3]); const [state, setState] = useState<"reveal" | "shuffle" | "choose">("reveal"); const [moves] = useState(() => 6 + Math.floor(Math.random() * 3));
  useEffect(() => { const reveal = window.setTimeout(() => setState("shuffle"), 900); let count = 0; const shuffle = window.setInterval(() => { setPositions((current) => { const a = Math.floor(Math.random() * 4); let b = Math.floor(Math.random() * 4); while (a === b) b = Math.floor(Math.random() * 4); const next = [...current]; [next[a], next[b]] = [next[b], next[a]]; return next; }); count += 1; if (count >= moves) { window.clearInterval(shuffle); window.setTimeout(() => setState("choose"), 360); } }, Math.max(210, config[difficulty].speed * 4)); return () => { window.clearTimeout(reveal); window.clearInterval(shuffle); }; }, [difficulty, moves]);
  function choose(cup: number) { if (state === "choose") done(cup === ball ? "win" : "lose"); }
  return <><div className="lab-status"><b>4 COPOS · {moves} EMBARALHAMENTOS</b><span>{state === "reveal" ? "A bola está aparecendo" : state === "shuffle" ? "ACOMPANHE A BOLA" : "Onde a bola parou?"}</span></div><div className="cups four-cups">{[0,1,2,3].map((cup) => <button key={cup} className="cup" style={{ left: `${positions[cup] * 25}%` }} onClick={() => choose(cup)}><i>{state === "reveal" && ball === cup ? "●" : ""}</i></button>)}</div><p className="lab-help">Um acerto vence o minigame.</p></>;
}

function TimingGame({ difficulty, golden, done }: { difficulty: Difficulty; golden: boolean; done: (result: "win" | "lose") => void }) {
  const [position, setPosition] = useState(0), [active, setActive] = useState(true);
  const width = golden ? Math.max(4, config[difficulty].target - 3) : config[difficulty].target;
  const start = golden ? 50 - width / 2 : 48 - width / 2;
  useEffect(() => { if (!active) return; const duration = Math.max(850, config[difficulty].speed * (golden ? 16 : 25)); const startedAt = performance.now(); let frame = 0; const animate = (now: number) => { const progress = ((now - startedAt) % (duration * 2)) / duration; setPosition(progress <= 1 ? progress * 100 : (2 - progress) * 100); frame = requestAnimationFrame(animate); }; frame = requestAnimationFrame(animate); return () => cancelAnimationFrame(frame); }, [active, difficulty, golden]);
  function stop() { setActive(false); done(position >= start && position <= start + width ? "win" : "lose"); }
  return <><div className="lab-status"><b>{golden ? "ZONA DE OURO" : "MARCA VERMELHA"}</b><span>Pare o marcador dentro do alvo.</span></div><div className="precision-track"><i style={{ left: `${start}%`, width: `${width}%` }} /><b style={{ left: `${position}%` }} /></div><button className="lab-action" onClick={stop} disabled={!active}>PARAR MARCADOR</button></>;
}

function MazeGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const safe = [0, 1, 6, 11, 12, 17, 22, 23, 24]; const [at, setAt] = useState(0);
  function move(cell: number) { if (Math.abs(cell - at) !== 1 && Math.abs(cell - at) !== 5) return; if (!safe.includes(cell)) return done("lose"); setAt(cell); if (cell === 24) done("win"); }
  return <><div className="lab-status"><b>LABIRINTO</b><span>Leve a bola até o gol sem tocar na parede.</span></div><div className="maze-grid">{Array.from({ length: 25 }, (_, cell) => <button key={cell} disabled={!safe.includes(cell)} className={at === cell ? "ball" : cell === 24 ? "goal" : safe.includes(cell) ? "path" : "wall"} onClick={() => move(cell)}>{at === cell ? "●" : cell === 24 ? "⚑" : ""}</button>)}</div></>;
}

function TicTacToeGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const [board, setBoard] = useState(Array<string>(9).fill("")); const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function winner(next: string[]) { return lines.find((line) => line.every((cell) => next[cell] === "X")) ? "X" : lines.find((line) => line.every((cell) => next[cell] === "O")) ? "O" : ""; }
  function play(cell: number) { if (board[cell]) return; const mine = [...board]; mine[cell] = "X"; if (winner(mine) === "X") { setBoard(mine); return done("win"); } const available = mine.map((value,index) => value ? -1 : index).filter((value) => value >= 0); if (!available.length) { setBoard(mine); return done("lose"); } const bot = available[Math.floor(Math.random() * available.length)]; mine[bot] = "O"; setBoard(mine); if (winner(mine) === "O" || !mine.includes("")) done("lose"); }
  return <><div className="lab-status"><b>JOGO DA VELHA</b><span>Você é X. Faça uma linha antes do adversário.</span></div><div className="tic-board">{board.map((value, index) => <button key={index} onClick={() => play(index)}>{value}</button>)}</div></>;
}

function PairsGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const symbols = ["⚽", "👟", "🏆", "⭐", "🧤", "🎯", "🟨", "🥅"]; const [deck] = useState(() => [...symbols, ...symbols].sort(() => Math.random() - .5)); const [open, setOpen] = useState<number[]>([]), [matched, setMatched] = useState<number[]>([]), [revealing, setRevealing] = useState(false), [started, setStarted] = useState(false), [mistakes, setMistakes] = useState(0);
  function reveal() { if (started) return; setRevealing(true); setStarted(true); window.setTimeout(() => setRevealing(false), 1350); }
  function flip(index: number) { if (!started || revealing || open.includes(index) || matched.includes(index) || open.length === 2) return; const next = [...open, index]; setOpen(next); if (next.length !== 2) return; if (deck[next[0]] === deck[next[1]]) { const newMatched = [...matched, ...next]; setMatched(newMatched); setOpen([]); if (newMatched.length === deck.length) done("win"); } else { const nextMistakes = mistakes + 1; setMistakes(nextMistakes); window.setTimeout(() => { setOpen([]); if (nextMistakes >= 5) done("lose"); }, 650); } }
  return <><div className="lab-status"><b>PARES {matched.length / 2}/8</b><span>{!started ? "Revele antes de começar" : revealing ? "Memorize: 1,35 segundo" : `Erros: ${mistakes}/5`}</span></div>{!started && <button className="lab-action" onClick={reveal}>REVELAR SÍMBOLOS</button>}<div className="pair-grid four-by-four">{deck.map((symbol, index) => <button key={index} onClick={() => flip(index)} className={revealing || open.includes(index) || matched.includes(index) ? "open" : ""}><span className="card-inner"><i className="card-front">?</i><i className="card-back">{symbol}</i></span></button>)}</div></>;
}

function SlidingPuzzleGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const [tiles, setTiles] = useState([1, 2, 3, 4, 5, 6, 7, 0, 8]);
  function move(index: number) { const empty = tiles.indexOf(0); if (![empty - 1, empty + 1, empty - 3, empty + 3].includes(index)) return; const next = [...tiles]; [next[index], next[empty]] = [next[empty], next[index]]; setTiles(next); if (next.every((value, position) => value === (position + 1) % 9)) done("win"); }
  return <><div className="lab-status"><b>QUEBRA-CABEÇA</b><span>Organize os números de 1 a 8.</span></div><div className="puzzle-grid">{tiles.map((tile, index) => <button key={index} className={tile === 0 ? "empty" : ""} onClick={() => move(index)}>{tile || ""}</button>)}</div></>;
}

function PressureGame({ difficulty, matches, done }: { difficulty: Difficulty; matches: number; done: (result: "win" | "lose") => void }) {
  const [match, setMatch] = useState(1), [sequence, setSequence] = useState(1), [showIndex, setShowIndex] = useState(0), [memorizing, setMemorizing] = useState(true), [path, setPath] = useState<number[]>([]), [locked, setLocked] = useState<number[]>([]);
  const routeLength = 3 + Math.floor((match - 1) / 2); const [route, setRoute] = useState(() => Array.from({ length: 3 }, () => Math.floor(Math.random() * 16)));
  useEffect(() => { if (showIndex >= route.length) { const finish = window.setTimeout(() => setMemorizing(false), 280); return () => window.clearTimeout(finish); } const timer = window.setTimeout(() => setShowIndex((value) => value + 1), 480); return () => window.clearTimeout(timer); }, [showIndex, route.length]);
  function prepareNext(excluded = locked) { const usable = Array.from({ length: 16 }, (_, index) => index).filter((cell) => !excluded.includes(cell)); setPath([]); setShowIndex(0); setRoute(Array.from({ length: routeLength }, () => usable[Math.floor(Math.random() * usable.length)])); setMemorizing(true); }
  function completedSequence() { const finalCell = route.at(-1)!; const nowLocked = [...locked, finalCell]; if (sequence === match) { if (match === matches) return done("win"); setMatch((value) => value + 1); setSequence(1); setLocked([]); setPath([]); setShowIndex(0); setRoute(Array.from({ length: 3 + Math.floor(match / 2) }, () => Math.floor(Math.random() * 16))); setMemorizing(true); return; } setLocked(nowLocked); setSequence((value) => value + 1); setTimeout(() => prepareNext(nowLocked), 240); }
  function step(cell: number) { if (memorizing || locked.includes(cell)) return; const nextStep = path.length; if (cell !== route[nextStep]) return done("lose"); const next = [...path, cell]; setPath(next); if (next.length === route.length) completedSequence(); }
  const colors = ["#e9574f", "#ef913e", "#f0d45a", "#a7d75d", "#55c979", "#50c2a8", "#4baee2", "#597ce5", "#795ad8", "#aa61dc", "#dd62bc", "#ee7494", "#df705c", "#dca44b", "#9fc962", "#55b781"];
  return <><div className="lab-status"><b>MAPA DE PRESSÃO · JOGO {match}/{matches}</b><span>{memorizing ? `Sequência ${sequence}/${match} · decore ${Math.min(showIndex + 1, route.length)}/${route.length}` : `Sequência ${sequence}/${match} · repita ${path.length}/${route.length}`}</span></div><div className="pressure-grid rainbow-grid">{Array.from({ length: 16 }, (_, cell) => <button key={cell} onClick={() => step(cell)} style={{ backgroundColor: colors[cell] }} className={`${(memorizing && route[showIndex] === cell) || path.includes(cell) ? "path" : ""} ${locked.includes(cell) ? "locked" : ""}`}>{locked.includes(cell) ? `✓ ${locked.indexOf(cell) + 1}` : (memorizing && route[showIndex] === cell) || path.includes(cell) ? "●" : ""}</button>)}</div></>;
}

function GoldenZoneGame({ matches, done }: { difficulty: Difficulty; matches: number; done: (result: "win" | "lose") => void }) {
  const [match, setMatch] = useState(1), [position, setPosition] = useState(0), [active, setActive] = useState(true);
  const knockout = Math.max(0, match - 3); const width = Math.max(6, 28 - knockout * 4); const duration = Math.max(520, 2600 - knockout * 310); const start = 50 - width / 2;
  useEffect(() => { if (!active) return; const started = performance.now(); let frame = 0; const loop = (now: number) => { const phase = ((now - started) % (duration * 2)) / duration; setPosition(phase <= 1 ? phase * 100 : (2 - phase) * 100); frame = requestAnimationFrame(loop); }; frame = requestAnimationFrame(loop); return () => cancelAnimationFrame(frame); }, [active, duration, match]);
  function stop() { setActive(false); if (position < start || position > start + width) return done("lose"); if (match === matches) return done("win"); setMatch((value) => value + 1); setPosition(0); setActive(true); }
  return <><div className="lab-status"><b>ZONA DE OURO · JOGO {match}/{matches}</b><span>{match <= 3 ? "FASE DE GRUPOS · mesma área e velocidade" : "MATA-MATA · alvo menor e marcador mais rápido"}</span></div><div className="precision-track campaign-timing"><i style={{ left: `${start}%`, width: `${width}%` }} /><b style={{ left: `${position}%` }} /></div><button className="lab-action" onClick={stop} disabled={!active}>PARAR MARCADOR</button></>;
}

function TraceGame({ matches, done }: { difficulty: Difficulty; matches: number; done: (result: "win" | "lose") => void }) {
  const [match, setMatch] = useState(1); const playerCount = [6, 6, 6, 9, 12, 16, 20, 25][match - 1] ?? 25; const [route, setRoute] = useState(() => Array.from({ length: 7 }, () => Math.floor(Math.random() * 6))); const [step, setStep] = useState(0), [watching, setWatching] = useState(true);
  useEffect(() => { if (step >= route.length) { const finish = window.setTimeout(() => setWatching(false), 260); return () => window.clearTimeout(finish); } const timer = window.setTimeout(() => setStep((value) => value + 1), 220); return () => window.clearTimeout(timer); }, [step, route.length]);
  const target = route.at(-1)!; function choose(player: number) { if (watching) return; if (player !== target) return done("lose"); if (match === matches) return done("win"); const nextMatch = match + 1; const nextPlayers = [6, 6, 6, 9, 12, 16, 20, 25][nextMatch - 1] ?? 25; setMatch(nextMatch); setRoute(Array.from({ length: 7 + nextMatch }, () => Math.floor(Math.random() * nextPlayers))); setStep(0); setWatching(true); }
  return <><div className="lab-status"><b>RASTREAR A BOLA · JOGO {match}/{matches}</b><span>{watching ? "Acompanhe os passes rápidos" : "Com qual jogador a bola terminou?"}</span></div><div className="player-grid" style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(playerCount))}, 1fr)` }}>{Array.from({ length: playerCount }, (_, player) => <button key={player} disabled={watching} onClick={() => choose(player)} className={watching && route[step] === player ? "has-ball" : ""}><i>●</i><span>●</span><b>▰</b></button>)}</div></>;
}
