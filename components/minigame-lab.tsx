"use client";

import { useEffect, useMemo, useState } from "react";

type Difficulty = "Fácil" | "Médio" | "Difícil" | "Muito difícil";
type GameId = "code" | "cups" | "timing" | "dribble" | "pass" | "pairs" | "formation" | "pressure-map" | "golden-zone" | "ball-trace";
type Game = { id: GameId; name: string; exclusive?: boolean; summary: string };

const games: Game[] = [
  { id: "code", name: "Código da prancheta", summary: "Memorize e reproduza códigos de cinco números em três fases." },
  { id: "cups", name: "Copos embaralhados", summary: "Acompanhe a bola e escolha o copo correto após o embaralhamento." },
  { id: "timing", name: "Marca vermelha", summary: "Pare o marcador dentro da área vermelha no momento certo." },
  { id: "dribble", name: "Duelo de drible", summary: "Leia o bote do marcador e escolha o lado contrário para passar." },
  { id: "pass", name: "Passe em triângulo", summary: "Leia o movimento dos companheiros e encontre o passe que quebra a linha." },
  { id: "pairs", name: "Pareamento rápido", summary: "Decore oito pares de símbolos e encontre todos no tabuleiro vertical." },
  { id: "formation", name: "Formação relâmpago", exclusive: true, summary: "Exclusivo: identifique rapidamente a peça que completa a formação campeã." },
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
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const game = games.find((entry) => entry.id === selected)!;
  return <main className="lab-shell">
    <header className="lab-header"><a href="/">← O REI</a><div><small>ÁREA DE TESTE</small><h1>MINIGAMES</h1><p>Teste os 10 minigames antes de colocá-los na carreira.</p></div></header>
    <section className="lab-selector">
      <div className="lab-game-list">{games.map((entry) => <button key={entry.id} onClick={() => { setSelected(entry.id); setKey((value) => value + 1); }} className={selected === entry.id ? "selected" : ""}><b>{entry.name}</b><small>{entry.exclusive ? "COPA DO MUNDO / SUPER MUNDIAL" : "NORMAL"}</small></button>)}</div>
      <article className="lab-stage"><div className="lab-intro"><span>{game.exclusive ? "EXCLUSIVO · COPA DO MUNDO E SUPER MUNDIAL" : "MINIGAME NORMAL"}</span><h2>{game.name}</h2><p>{game.summary}</p>{game.id === "pairs" ? <p className="lab-fixed">DIFICULDADE FIXA · 8 PARES · 2 SEGUNDOS PARA DECORAR</p> : <div className="difficulty-picker">{(Object.keys(config) as Difficulty[]).map((level) => <button key={level} className={difficulty === level ? "active" : ""} onClick={() => { setDifficulty(level); setKey((value) => value + 1); }}>{level}</button>)}</div>}</div>
        {ready ? <GameRunner key={`${selected}-${difficulty}-${key}`} game={selected} difficulty={difficulty} /> : <div className="lab-game lab-loading">Preparando o desafio…</div>}
      </article>
    </section>
  </main>;
}

function Result({ result, onRestart }: { result: "win" | "lose" | null; onRestart: () => void }) {
  if (!result) return null;
  return <div className={`lab-result ${result}`}><b>{result === "win" ? "VOCÊ VENCEU" : "VOCÊ PERDEU"}</b><button onClick={onRestart}>TENTAR NOVAMENTE</button></div>;
}

function GameRunner({ game, difficulty }: { game: GameId; difficulty: Difficulty }) {
  const [result, setResult] = useState<"win" | "lose" | null>(null), [attempt, setAttempt] = useState(0);
  const restart = () => { setResult(null); setAttempt((value) => value + 1); };
  const props = { difficulty, done: setResult };
  const content = game === "code" ? <CodeGame {...props} /> : game === "cups" ? <CupsGame {...props} /> : game === "timing" ? <TimingGame {...props} golden={false} /> : game === "dribble" ? <DribbleGame {...props} /> : game === "pass" ? <PassGame {...props} /> : game === "pairs" ? <PairsGame {...props} /> : game === "formation" ? <FormationGame {...props} /> : game === "pressure-map" ? <PressureGame {...props} /> : game === "golden-zone" ? <TimingGame {...props} golden /> : <TraceGame {...props} />;
  return <div className="lab-game"><Result result={result} onRestart={restart} />{!result && <div key={attempt}>{content}</div>}</div>;
}

function CodeGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const [phase, setPhase] = useState(0), [code, setCode] = useState(() => randomDigits()), [shown, setShown] = useState(true), [entry, setEntry] = useState("");
  useEffect(() => { const timer = window.setTimeout(() => setShown(false), phase === 2 ? 1400 : 2200); return () => window.clearTimeout(timer); }, [phase]);
  function enterDigit(value: string) { const next = entry + value; setEntry(next); if (next.length !== 5) return; if (next !== code) return done("lose"); if (phase === 2) return done("win"); setPhase(phase + 1); setCode(randomDigits()); setEntry(""); setShown(true); }
  return <><div className="lab-status"><b>FASE {phase + 1}/3</b><span>{shown ? "Memorize os 5 números" : "Digite o código"}</span></div><div className="code-screen">{shown ? code : entry.padEnd(5, "•")}</div><div className="lab-keypad">{[1,2,3,4,5,6,7,8,9,0].map((digit) => <button key={digit} disabled={shown} onClick={() => enterDigit(String(digit))}>{digit}</button>)}</div></>;
}

function CupsGame({ difficulty, done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const roundCount = difficulty === "Fácil" ? 2 : difficulty === "Médio" ? 3 : 4;
  const [round, setRound] = useState(0); const [ball, setBall] = useState(() => Math.floor(Math.random() * 3)); const [state, setState] = useState<"reveal" | "shuffle" | "choose">("reveal");
  useEffect(() => { const first = window.setTimeout(() => setState("shuffle"), 950); const second = window.setTimeout(() => setState("choose"), 2550 - Math.min(700, config[difficulty].speed * 4)); return () => { window.clearTimeout(first); window.clearTimeout(second); }; }, [round, difficulty]);
  function choose(cup: number) { if (state !== "choose") return; if (cup !== ball) return done("lose"); if (round + 1 === roundCount) return done("win"); setRound(round + 1); setBall(Math.floor(Math.random() * 3)); setState("reveal"); }
  return <><div className="lab-status"><b>RODADA {round + 1}/{roundCount}</b><span>{state === "reveal" ? "A bola está aparecendo" : state === "shuffle" ? "OS COPOS ESTÃO EMBARALHANDO" : "Onde a bola parou?"}</span></div><div className={`cups ${state === "shuffle" || state === "choose" ? "shuffling" : ""}`}>{[0,1,2].map((cup) => <button key={cup} className={`cup cup-${cup}`} onClick={() => choose(cup)}><i>{state === "reveal" && ball === cup ? "●" : ""}</i></button>)}</div><p className="lab-help">Acompanhe o copo que esconde a bola durante a animação.</p></>;
}

function TimingGame({ difficulty, golden, done }: { difficulty: Difficulty; golden: boolean; done: (result: "win" | "lose") => void }) {
  const [position, setPosition] = useState(0), [active, setActive] = useState(true);
  const width = golden ? Math.max(4, config[difficulty].target - 3) : config[difficulty].target;
  const start = golden ? 50 - width / 2 : 48 - width / 2;
  useEffect(() => { if (!active) return; const duration = Math.max(850, config[difficulty].speed * (golden ? 16 : 25)); const startedAt = performance.now(); let frame = 0; const animate = (now: number) => { const progress = ((now - startedAt) % (duration * 2)) / duration; setPosition(progress <= 1 ? progress * 100 : (2 - progress) * 100); frame = requestAnimationFrame(animate); }; frame = requestAnimationFrame(animate); return () => cancelAnimationFrame(frame); }, [active, difficulty, golden]);
  function stop() { setActive(false); done(position >= start && position <= start + width ? "win" : "lose"); }
  return <><div className="lab-status"><b>{golden ? "ZONA DE OURO" : "MARCA VERMELHA"}</b><span>Pare o marcador dentro do alvo.</span></div><div className="precision-track"><i style={{ left: `${start}%`, width: `${width}%` }} /><b style={{ left: `${position}%` }} /></div><button className="lab-action" onClick={stop} disabled={!active}>PARAR MARCADOR</button></>;
}

function DribbleGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const defender = useMemo(() => Math.floor(Math.random() * 3), []); const directions = ["CORTAR À ESQUERDA", "DAR A CANETA", "CORTAR À DIREITA"];
  const clue = ["O zagueiro fecha o lado esquerdo.", "O zagueiro trava a frente e deixa os lados livres.", "O zagueiro fecha o lado direito."][defender];
  const safe = defender === 0 ? 2 : defender === 2 ? 0 : 1;
  return <><div className="lab-status"><b>DUELO DE DRIBLE</b><span>Leia o corpo do marcador.</span></div><div className={`dribble-field defender-${defender}`}><i>●</i><b>♟</b></div><p className="lab-clue">{clue}</p><div className="dribble-actions">{directions.map((label, index) => <button key={label} onClick={() => done(index === safe ? "win" : "lose")}>{label}</button>)}</div></>;
}

function PassGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const target = useMemo(() => Math.floor(Math.random() * 3), []); const labels = ["PASSE NA PROFUNDIDADE", "TABELA CURTA", "VIRADA DE JOGO"];
  const clues = ["O ponta dispara nas costas da defesa; o passe vertical quebra a linha.", "Seu companheiro está de frente e devolve de primeira; a tabela abre o meio.", "O bloco fechou o lado da bola; o extremo oposto está sozinho."];
  return <><div className="lab-status"><b>PASSE EM TRIÂNGULO</b><span>Escolha a jogada que encontra o homem livre.</span></div><div className="pass-field"><i>●</i><span className={`runner runner-${target}`}>♟</span><b>♟</b><b>♟</b></div><p className="lab-clue">{clues[target]}</p><div className="dribble-actions">{labels.map((label, index) => <button key={label} onClick={() => done(index === target ? "win" : "lose")}>{label}</button>)}</div></>;
}

function PairsGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const symbols = ["⚽", "👟", "🏆", "⭐", "🧤", "🎯", "🟨", "🥅"]; const [deck] = useState(() => [...symbols, ...symbols].sort(() => Math.random() - .5)); const [open, setOpen] = useState<number[]>([]), [matched, setMatched] = useState<number[]>([]), [revealing, setRevealing] = useState(false), [started, setStarted] = useState(false);
  function reveal() { if (started) return; setRevealing(true); setStarted(true); window.setTimeout(() => setRevealing(false), 2000); }
  function flip(index: number) { if (!started || revealing || open.includes(index) || matched.includes(index) || open.length === 2) return; const next = [...open, index]; setOpen(next); if (next.length !== 2) return; if (deck[next[0]] === deck[next[1]]) { const newMatched = [...matched, ...next]; setMatched(newMatched); setOpen([]); if (newMatched.length === deck.length) done("win"); } else window.setTimeout(() => setOpen([]), 650); }
  return <><div className="lab-status"><b>PARES {matched.length / 2}/8</b><span>{!started ? "Revele antes de começar" : revealing ? "Memorize: 2 segundos" : "Encontre os oito pares"}</span></div>{!started && <button className="lab-action" onClick={reveal}>REVELAR SÍMBOLOS</button>}<div className="pair-grid vertical-pairs">{deck.map((symbol, index) => <button key={index} onClick={() => flip(index)} className={revealing || open.includes(index) || matched.includes(index) ? "open" : ""}>{revealing || open.includes(index) || matched.includes(index) ? symbol : "?"}</button>)}</div></>;
}

function FormationGame({ difficulty, done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const missing = useMemo(() => Math.floor(Math.random() * 4), []); const options = ["VOLANTE", "MEIA", "PONTA", "CENTROAVANTE"];
  const formations = ["4-3-3: falta o homem que protege a defesa.", "4-2-3-1: falta o organizador entre as linhas.", "4-3-3: falta quem dá profundidade pelo lado.", "4-2-3-1: falta a referência dentro da área."];
  return <><div className="lab-status"><b>FORMAÇÃO RELÂMPAGO</b><span>Complete a peça que falta antes do apito.</span></div><div className="formation-board"><span>♟</span><span>♟</span><span>♟</span><span>♟</span><span>♟</span><i>?</i><span>♟</span></div><p className="lab-clue">{formations[missing]}</p><div className="dribble-actions">{options.map((label, index) => <button key={label} onClick={() => done(index === missing ? "win" : "lose")}>{label}</button>)}</div></>;
}

function PressureGame({ difficulty, done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const [round, setRound] = useState(0), [showIndex, setShowIndex] = useState(0), [memorizing, setMemorizing] = useState(true), [path, setPath] = useState<number[]>([]), [locked, setLocked] = useState<number[]>([]);
  const length = config[difficulty].sequence + round; const [route, setRoute] = useState(() => Array.from({ length: config[difficulty].sequence }, () => Math.floor(Math.random() * 16)));
  useEffect(() => { if (showIndex >= route.length) { const finish = window.setTimeout(() => setMemorizing(false), 280); return () => window.clearTimeout(finish); } const timer = window.setTimeout(() => setShowIndex((value) => value + 1), 520); return () => window.clearTimeout(timer); }, [showIndex, route.length]);
  function nextRound() { const lockedCell = route.at(-1)!; if (round === 2) return done("win"); const remaining = Array.from({ length: 16 }, (_, index) => index).filter((cell) => cell !== lockedCell && !locked.includes(cell)); setLocked((cells) => [...cells, lockedCell]); setRound((value) => value + 1); setPath([]); setShowIndex(0); setRoute(Array.from({ length: length + 1 }, () => remaining[Math.floor(Math.random() * remaining.length)])); setMemorizing(true); }
  function step(cell: number) { if (memorizing || locked.includes(cell)) return; const nextStep = path.length; if (cell !== route[nextStep]) return done("lose"); const next = [...path, cell]; setPath(next); if (next.length === route.length) nextRound(); }
  const colors = ["#e9574f", "#ef913e", "#f0d45a", "#a7d75d", "#55c979", "#50c2a8", "#4baee2", "#597ce5", "#795ad8", "#aa61dc", "#dd62bc", "#ee7494", "#df705c", "#dca44b", "#9fc962", "#55b781"];
  return <><div className="lab-status"><b>MAPA DE PRESSÃO · RODADA {round + 1}/3</b><span>{memorizing ? `Decore a sequência ${Math.min(showIndex + 1, route.length)}/${route.length}` : `Repita: ${path.length}/${route.length}`}</span></div><div className="pressure-grid rainbow-grid">{Array.from({ length: 16 }, (_, cell) => <button key={cell} onClick={() => step(cell)} style={{ backgroundColor: colors[cell] }} className={`${(memorizing && route[showIndex] === cell) || path.includes(cell) ? "path" : ""} ${locked.includes(cell) ? "locked" : ""}`}>{locked.includes(cell) ? `✓ ${locked.indexOf(cell) + 1}` : (memorizing && route[showIndex] === cell) || path.includes(cell) ? "●" : ""}</button>)}</div></>;
}

function TraceGame({ difficulty, done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const players = difficulty === "Fácil" ? 4 : difficulty === "Médio" ? 6 : difficulty === "Difícil" ? 8 : 10; const [phase, setPhase] = useState(0); const [route, setRoute] = useState(() => Array.from({ length: 4 }, () => Math.floor(Math.random() * players))); const [step, setStep] = useState(0), [watching, setWatching] = useState(true);
  useEffect(() => { if (step >= route.length) { const finish = window.setTimeout(() => setWatching(false), 380); return () => window.clearTimeout(finish); } const timer = window.setTimeout(() => setStep((value) => value + 1), 540); return () => window.clearTimeout(timer); }, [step, route.length]);
  const target = route.at(-1)!; function choose(player: number) { if (watching) return; if (player !== target) return done("lose"); if (phase === 2) return done("win"); const nextPlayers = Math.min(10, players + 2); setPhase((value) => value + 1); setRoute(Array.from({ length: route.length + 1 }, () => Math.floor(Math.random() * nextPlayers))); setStep(0); setWatching(true); }
  return <><div className="lab-status"><b>RASTREAR A BOLA · FASE {phase + 1}/3</b><span>{watching ? "Siga a bola entre os jogadores" : "Com quem a bola terminou?"}</span></div><div className="player-row">{Array.from({ length: Math.min(10, players + phase * 2) }, (_, player) => <button key={player} disabled={watching} onClick={() => choose(player)} className={watching && route[step] === player ? "has-ball" : ""}><i>●</i><span>●</span><b>▰</b></button>)}</div></>;
}
