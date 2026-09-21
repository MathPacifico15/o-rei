"use client";

import { useEffect, useMemo, useState } from "react";

type Difficulty = "Fácil" | "Médio" | "Difícil" | "Muito difícil";
type GameId = "code" | "cups" | "timing" | "sequence" | "zones" | "pairs" | "tactical-memory" | "pressure-map" | "golden-zone" | "ball-trace";
type Game = { id: GameId; name: string; exclusive?: boolean; summary: string };

const games: Game[] = [
  { id: "code", name: "Código da prancheta", summary: "Memorize e reproduza códigos de cinco números em três fases." },
  { id: "cups", name: "Copos embaralhados", summary: "Acompanhe a bola e escolha o copo correto após o embaralhamento." },
  { id: "timing", name: "Marca vermelha", summary: "Pare o marcador dentro da área vermelha no momento certo." },
  { id: "sequence", name: "Sequência de comandos", summary: "Observe os sinais e repita a ordem sem errar." },
  { id: "zones", name: "Escolha de zonas", summary: "Leia a jogada e escolha a zona que ficou livre." },
  { id: "pairs", name: "Pareamento rápido", summary: "Encontre todos os pares antes de gastar suas tentativas." },
  { id: "tactical-memory", name: "Memória tática", exclusive: true, summary: "Exclusivo de Copa do Mundo e Super Mundial: memorize a movimentação do time." },
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
function randomSequence(length: number) { return Array.from({ length }, () => Math.floor(Math.random() * 4)); }

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
      <article className="lab-stage"><div className="lab-intro"><span>{game.exclusive ? "EXCLUSIVO · COPA DO MUNDO E SUPER MUNDIAL" : "MINIGAME NORMAL"}</span><h2>{game.name}</h2><p>{game.summary}</p><div className="difficulty-picker">{(Object.keys(config) as Difficulty[]).map((level) => <button key={level} className={difficulty === level ? "active" : ""} onClick={() => { setDifficulty(level); setKey((value) => value + 1); }}>{level}</button>)}</div></div>
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
  const content = game === "code" ? <CodeGame {...props} /> : game === "cups" ? <CupsGame {...props} /> : game === "timing" ? <TimingGame {...props} golden={false} /> : game === "sequence" ? <SequenceGame {...props} tactical={false} /> : game === "zones" ? <ZonesGame {...props} /> : game === "pairs" ? <PairsGame {...props} /> : game === "tactical-memory" ? <SequenceGame {...props} tactical /> : game === "pressure-map" ? <PressureGame {...props} /> : game === "golden-zone" ? <TimingGame {...props} golden /> : <TraceGame {...props} />;
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
  const [round, setRound] = useState(0); const [ball, setBall] = useState(() => Math.floor(Math.random() * 3)); const [revealed, setRevealed] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setRevealed(false), config[difficulty].speed * 12); return () => window.clearTimeout(timer); }, [round, difficulty]);
  function choose(index: number) { if (revealed) return; if (index !== ball) return done("lose"); if (round + 1 === roundCount) return done("win"); setRound(round + 1); setBall(Math.floor(Math.random() * 3)); setRevealed(true); }
  return <><div className="lab-status"><b>RODADA {round + 1}/{roundCount}</b><span>{revealed ? "A bola está aparecendo" : "Onde a bola parou?"}</span></div><div className="cups">{[0,1,2].map((cup) => <button key={cup} className="cup" onClick={() => choose(cup)}><i>{revealed && ball === cup ? "●" : ""}</i></button>)}</div><p className="lab-help">A bola aparece pouco tempo. Depois, escolha um copo.</p></>;
}

function TimingGame({ difficulty, golden, done }: { difficulty: Difficulty; golden: boolean; done: (result: "win" | "lose") => void }) {
  const [position, setPosition] = useState(0), [forward, setForward] = useState(true), [active, setActive] = useState(true);
  const width = golden ? Math.max(4, config[difficulty].target - 3) : config[difficulty].target;
  const start = golden ? 50 - width / 2 : 48 - width / 2;
  useEffect(() => { if (!active) return; const timer = window.setInterval(() => setPosition((old) => { const step = golden ? 4 : 3; if (old + step >= 100) { setForward(false); return 100; } if (old - step <= 0) { setForward(true); return 0; } return old + (forward ? step : -step); }), config[difficulty].speed); return () => window.clearInterval(timer); }, [active, difficulty, forward, golden]);
  function stop() { setActive(false); done(position >= start && position <= start + width ? "win" : "lose"); }
  return <><div className="lab-status"><b>{golden ? "ZONA DE OURO" : "MARCA VERMELHA"}</b><span>Pare o marcador dentro do alvo.</span></div><div className="precision-track"><i style={{ left: `${start}%`, width: `${width}%` }} /><b style={{ left: `${position}%` }} /></div><button className="lab-action" onClick={stop} disabled={!active}>PARAR MARCADOR</button></>;
}

function SequenceGame({ difficulty, tactical, done }: { difficulty: Difficulty; tactical: boolean; done: (result: "win" | "lose") => void }) {
  const length = tactical ? config[difficulty].sequence + 2 : config[difficulty].sequence;
  const [sequence] = useState(() => randomSequence(length)); const [shown, setShown] = useState(true), [shownIndex, setShownIndex] = useState(0), [step, setStep] = useState(0);
  useEffect(() => { if (shownIndex >= length) { const finish = window.setTimeout(() => setShown(false), 280); return () => window.clearTimeout(finish); } const timer = window.setTimeout(() => setShownIndex((value) => value + 1), 520); return () => window.clearTimeout(timer); }, [shownIndex, length]);
  function choose(value: number) { if (shown) return; if (sequence[step] !== value) return done("lose"); if (step + 1 === length) return done("win"); setStep(step + 1); }
  return <><div className="lab-status"><b>{tactical ? "MOVIMENTAÇÃO TÁTICA" : "SEQUÊNCIA"}</b><span>{shown ? `Memorize o sinal ${Math.min(shownIndex + 1, length)}/${length}` : `${step}/${length} sinais certos`}</span></div><div className="signal-grid lab-signals">{[0,1,2,3].map((item) => <button key={item} className={`${shown && sequence[shownIndex] === item ? "glow" : ""} s${item}`} onClick={() => choose(item)}>{tactical ? ["↖", "↗", "↙", "↘"][item] : item + 1}</button>)}</div></>;
}

function ZonesGame({ done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const target = useMemo(() => Math.floor(Math.random() * 4), []); const [chosen, setChosen] = useState<number | null>(null);
  function choose(zone: number) { setChosen(zone); window.setTimeout(() => done(zone === target ? "win" : "lose"), 350); }
  const clues = ["O lateral direito saiu para o bote. O corredor do lado esquerdo ficou aberto.", "Os zagueiros abriram demais a linha. Há espaço entre as linhas.", "O lateral esquerdo fechou por dentro. A ponta direita ficou livre.", "A marcação saiu da área para pressionar. O espaço apareceu no miolo."];
  return <><div className="lab-status"><b>LEITURA DE JOGADA</b><span>Um corredor ficou livre. Qual é?</span></div><p className="lab-clue">{clues[target]}</p><div className="zone-grid">{[0,1,2,3].map((zone) => <button key={zone} onClick={() => choose(zone)} className={chosen === zone ? "chosen" : ""}>{["PONTA ESQUERDA", "ENTRELINHA", "PONTA DIREITA", "ÁREA"][zone]}</button>)}</div></>;
}

function PairsGame({ difficulty, done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const symbols = ["⚽", "👟", "🏆", "⭐", "🧤", "🎯"]; const pairCount = difficulty === "Fácil" ? 3 : difficulty === "Médio" ? 4 : difficulty === "Difícil" ? 5 : 6;
  const [deck] = useState(() => [...symbols.slice(0, pairCount), ...symbols.slice(0, pairCount)].sort(() => Math.random() - .5)); const [open, setOpen] = useState<number[]>([]), [matched, setMatched] = useState<number[]>([]), [attempts, setAttempts] = useState(0);
  function flip(index: number) { if (open.includes(index) || matched.includes(index) || open.length === 2) return; const next = [...open, index]; setOpen(next); if (next.length !== 2) return; const tries = attempts + 1; setAttempts(tries); if (deck[next[0]] === deck[next[1]]) { const newMatched = [...matched, ...next]; setMatched(newMatched); setOpen([]); if (newMatched.length === deck.length) done("win"); } else { window.setTimeout(() => { setOpen([]); if (tries >= config[difficulty].attempts) done("lose"); }, 650); } }
  return <><div className="lab-status"><b>PARES {matched.length / 2}/{pairCount}</b><span>Tentativas: {attempts}/{config[difficulty].attempts}</span></div><div className="pair-grid">{deck.map((symbol, index) => <button key={index} onClick={() => flip(index)} className={open.includes(index) || matched.includes(index) ? "open" : ""}>{open.includes(index) || matched.includes(index) ? symbol : "?"}</button>)}</div></>;
}

function PressureGame({ difficulty, done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const needed = difficulty === "Fácil" ? 3 : difficulty === "Médio" ? 4 : 5; const [route] = useState(() => Array.from({ length: needed }, () => Math.floor(Math.random() * 9))); const [showIndex, setShowIndex] = useState(0), [memorizing, setMemorizing] = useState(true), [path, setPath] = useState<number[]>([]);
  useEffect(() => { if (showIndex >= needed) { const finish = window.setTimeout(() => setMemorizing(false), 260); return () => window.clearTimeout(finish); } const timer = window.setTimeout(() => setShowIndex((value) => value + 1), 570); return () => window.clearTimeout(timer); }, [showIndex, needed]);
  function step(cell: number) { if (memorizing) return; const nextStep = path.length; if (cell !== route[nextStep]) return done("lose"); const next = [...path, cell]; setPath(next); if (next.length === needed) done("win"); }
  return <><div className="lab-status"><b>MAPA DE PRESSÃO</b><span>{memorizing ? `Memorize o passe ${Math.min(showIndex + 1, needed)}/${needed}` : `Repita a rota: ${path.length}/${needed}`}</span></div><div className="pressure-grid">{Array.from({ length: 9 }, (_, cell) => <button key={cell} onClick={() => step(cell)} className={(memorizing && route[showIndex] === cell) || path.includes(cell) ? "path" : ""}>{(memorizing && route[showIndex] === cell) || path.includes(cell) ? "•" : ""}</button>)}</div></>;
}

function TraceGame({ difficulty, done }: { difficulty: Difficulty; done: (result: "win" | "lose") => void }) {
  const target = useMemo(() => Math.floor(Math.random() * 4), []); const [watching, setWatching] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setWatching(false), Math.max(700, config[difficulty].speed * 16)); return () => window.clearTimeout(timer); }, [difficulty]);
  return <><div className="lab-status"><b>RASTREAR A BOLA</b><span>{watching ? "Siga o caminho destacado" : "Em qual corredor ela terminou?"}</span></div><div className="trace-lanes">{[0,1,2,3].map((lane) => <button key={lane} className={watching && lane === target ? "ball" : ""} disabled={watching} onClick={() => done(lane === target ? "win" : "lose")}>{watching && lane === target ? "●" : `CORREDOR ${lane + 1}`}</button>)}</div></>;
}
