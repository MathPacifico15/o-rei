import type { MiniGameDefinition } from './minigames';

export type Difficulty = 'easy' | 'standard' | 'hard';
export interface ChallengeContext {
  finishing?: number;
  attributeLabel?: 'Finalização' | 'Reflexo';
  speed?: number;
  identity?: 'skill' | 'luck' | 'mixed';
  stakes?: 'normal' | 'high';
  /** One-based match number. The sequence cap is an O REI balance choice. */
  campaignRound?: number;
}
/** A career decision has a binary outcome. Time and errors are telemetry only. */
export interface MiniResult { id: string; gameId: string; seed: number; difficulty: Difficulty; won: boolean; elapsedMs: number; context: string }
export interface Round {
  seed: number; mode: MiniGameDefinition['mode']; difficulty: Difficulty;
  elapsed: number; preview: number; limit: number; board: number[]; sequence: number[];
  input: number[]; matched: number[]; open: number[]; errors: number; round: number;
  done: boolean; won: boolean; feedback: string; lockUntil: number; swaps: number[][];
  target: number; steps: number;
  challenge?: ChallengeContext; awaitingReveal?: boolean; totalElapsed?: number;
  draws?: number; starter?: 'player' | 'opponent';
}
export function rng(seed: number) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffled<T>(list: T[], random: () => number) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export const tuning = {
  easy: { preview: 4200, limit: 150000, errors: 7, speed: .035, width: 25 },
  standard: { preview: 3000, limit: 100000, errors: 5, speed: .05, width: 18 },
  hard: { preview: 1800, limit: 65000, errors: 3, speed: .065, width: 12 },
};
const modes = ['code', 'cups', 'timing', 'maze', 'ticTacToe', 'pairs', 'puzzle', 'pressureMap', 'goldZone', 'ballTrack', 'shot', 'montyHall', 'throughPass'];
const finiteNumbers = (value: unknown): value is number[] => Array.isArray(value) && value.every(Number.isFinite);
function validChallenge(value: unknown): value is ChallengeContext {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const c = value as ChallengeContext;
  return [c.finishing, c.speed].every(n => n === undefined || Number.isFinite(n) && n >= 0 && n <= 100)
    && (c.attributeLabel === undefined || ['Finalização', 'Reflexo'].includes(c.attributeLabel))
    && (c.identity === undefined || ['skill', 'luck', 'mixed'].includes(c.identity))
    && (c.stakes === undefined || ['normal', 'high'].includes(c.stakes))
    && (c.campaignRound === undefined || Number.isInteger(c.campaignRound) && c.campaignRound >= 1);
}
export function validRound(value: unknown): value is Round {
  if (!value || typeof value !== 'object') return false;
  const r = value as Round;
  return modes.includes(r.mode) && ['easy', 'standard', 'hard'].includes(r.difficulty)
    && [r.seed, r.elapsed, r.preview, r.limit, r.errors, r.round, r.target, r.steps, r.lockUntil].every(Number.isFinite)
    && r.elapsed >= 0 && r.preview >= 0 && r.limit > 0 && r.errors >= 0 && Number.isInteger(r.round) && r.round >= 1
    && [r.board, r.sequence, r.input, r.matched, r.open].every(finiteNumbers)
    && Array.isArray(r.swaps) && r.swaps.every(a => finiteNumbers(a) && a.length === 2 && a.every(n => Number.isInteger(n) && n >= 0 && n < 4) && a[0] !== a[1])
    && typeof r.done === 'boolean' && typeof r.won === 'boolean'
    && (r.challenge === undefined || validChallenge(r.challenge))
    && (r.awaitingReveal === undefined || typeof r.awaitingReveal === 'boolean')
    && (r.totalElapsed === undefined || Number.isFinite(r.totalElapsed) && r.totalElapsed >= r.elapsed)
    && (r.draws === undefined || Number.isInteger(r.draws) && r.draws >= 0 && r.draws <= 2)
    && (r.starter === undefined || r.starter === 'player' || r.starter === 'opponent');
}
export function cupSwapDuration(s: Pick<Round, 'difficulty' | 'challenge'>) { return s.challenge?.stakes === 'high' || s.difficulty === 'hard' ? 380 : s.difficulty === 'easy' ? 510 : 450; }
export function mistakeLimit(s: Pick<Round, 'mode' | 'difficulty'>) { return s.mode === 'pairs' ? 5 : tuning[s.difficulty].errors; }
/** Contextual target follows fourteen lanes; legacy snapshots keep their old tuning. */
export function targetWidth(s: Pick<Round, 'mode' | 'difficulty' | 'challenge'>) {
  if (s.challenge?.finishing === undefined) return tuning[s.difficulty].width * (s.mode === 'goldZone' ? .7 : 1);
  const segments = Math.max(1, Math.min(4, 1 + Math.round(Math.max(0, s.challenge.finishing - 52) / 14) - (s.challenge.identity === 'skill' ? 1 : 0) - (s.challenge.stakes === 'high' ? 1 : 0)));
  return segments / 14 * 100;
}
export function createRound(mode: Round['mode'], seed: number, difficulty: Difficulty = 'standard', round = 1, challenge?: ChallengeContext): Round {
  const random = rng(seed + round * 31), n = (max: number) => Math.floor(random() * max), t = tuning[difficulty];
  let board: number[] = [], sequence: number[] = [], swaps: number[][] = [];
  let target = n(4), preview = t.preview;
  if (mode === 'code') { sequence = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], random).slice(0, 5); preview = [2000, 1300, 800][Math.min(2, Math.max(0, round - 1))]; }
  if (mode === 'pairs') { board = shuffled([...Array(8).keys(), ...Array(8).keys()], random); preview = 1000; }
  if (mode === 'puzzle') {
    board = [1, 2, 3, 4, 5, 6, 7, 8, 0]; let last = -1;
    for (let i = 0; i < ({ easy: 12, standard: 30, hard: 60 }[difficulty]); i++) { const z = board.indexOf(0), choices = [z - 3, z + 3, z - 1, z + 1].filter(p => p >= 0 && p < 9 && (Math.abs(p - z) === 3 || Math.floor(p / 3) === Math.floor(z / 3)) && p !== last); const p = choices[n(choices.length)]; [board[z], board[p]] = [board[p], board[z]]; last = z; }
    preview = 0;
  }
  if (mode === 'maze') { sequence = [0]; let p = 0; while (p !== 24) { const options = [...(p % 5 < 4 ? [p + 1] : []), ...(p < 20 ? [p + 5] : [])]; p = options[n(options.length)]; sequence.push(p); } board = Array(25).fill(0); }
  if (mode === 'ticTacToe') { board = Array(25).fill(0); preview = 0; }
  if (mode === 'pressureMap') sequence = Array.from({ length: Math.min(12, ({ easy: 3, standard: 5, hard: 7 }[difficulty]) + Math.max(1, challenge?.campaignRound ?? round) - 1) }, () => n(9));
  if (mode === 'ballTrack') sequence = Array.from({ length: ({ easy: 5, standard: 8, hard: 12 }[difficulty]) }, () => n(6));
  if (mode === 'pressureMap' || mode === 'ballTrack') preview = sequence.length * (difficulty === 'easy' ? 850 : difficulty === 'hard' ? 450 : 650) + 500;
  if (mode === 'cups') {
    board = [0, 1, 2, 3]; const count = (challenge?.identity === 'skill' ? 9 : 7) - ((challenge?.speed ?? 0) >= 80 ? 1 : 0);
    for (let i = 0; i < count; i++) { const a = n(4); let b = n(3); if (b >= a) b++; swaps.push([a, b]); }
    preview = 1300 + swaps.length * cupSwapDuration({ difficulty, challenge });
  }
  if (mode === 'timing' || mode === 'goldZone') preview = 0;
  if (mode === 'shot') {
    target = n(3);
    // O REI balance: a better finisher reads the keeper more reliably, never certainly.
    const reliability = .45 + Math.max(0, Math.min(100, challenge?.finishing ?? 60)) * .0045;
    const alternatives = [0, 1, 2].filter(lane => lane !== target);
    board = [random() < reliability ? target : alternatives[n(2)]]; preview = 0;
  }
  if (mode === 'montyHall') { target = n(3); board = [0, 1, 2]; preview = 0; }
  if (mode === 'throughPass') preview = round > 1 ? 700 : 0;
  return { seed, mode, difficulty, elapsed: 0, totalElapsed: 0, preview, limit: t.limit, board, sequence, input: [], matched: [], open: [], errors: 0, round, done: false, won: false, feedback: mode === 'code' ? 'Revele o código quando estiver pronto.' : 'Observe a preparação.', lockUntil: 0, swaps, target, steps: 0, ...(challenge ? { challenge: { ...challenge } } : {}), ...(mode === 'code' ? { awaitingReveal: true } : {}), ...(mode === 'ticTacToe' ? { draws: 0, starter: 'player' as const } : {}) };
}
export function revealRound(s: Round): Round { return s.done || s.mode !== 'code' || !s.awaitingReveal ? s : { ...s, awaitingReveal: false, feedback: 'Memorize os cinco números.' }; }
export function markerAt(s: Round) { const x = (s.elapsed * tuning[s.difficulty].speed) % 200; return x <= 100 ? x : 200 - x; }
/** O REI adaptation: a seeded opening oscillates while the pass marker scans the field. */
export function passWindow(s: Round): { center: number; width: number } {
  const phase = rng(s.seed + s.round * 113)() * Math.PI * 2;
  const activeElapsed = Math.max(0, s.elapsed - s.preview);
  return { center: 50 + Math.sin(activeElapsed * .0011 + phase) * 24, width: Math.max(8, Math.min(32, targetWidth(s))) };
}
export function passMarkerAt(s: Round) { return markerAt({ ...s, elapsed: Math.max(0, s.elapsed - s.preview) }); }
export function cupPositions(s: Round) {
  const positions = [0, 1, 2, 3], count = Math.max(0, Math.min(s.swaps.length, Math.floor((s.elapsed - 1000) / cupSwapDuration(s))));
  for (const [a, b] of s.swaps.slice(0, count)) [positions[a], positions[b]] = [positions[b], positions[a]];
  return positions;
}
export function wonLine(board: number[], side: number) {
  for (let p = 0; p < 25; p++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { let ok = true; for (let k = 0; k < 4; k++) { const r = Math.floor(p / 5) + dr * k, c = p % 5 + dc * k; if (r < 0 || r >= 5 || c < 0 || c >= 5 || board[r * 5 + c] !== side) ok = false; } if (ok) return true; }
  return false;
}
function end(s: Round, won: boolean): Round { return { ...s, done: true, won, feedback: won ? 'Boa execução! Objetivo cumprido.' : 'A tentativa terminou. Revise a leitura e tente no treino.' }; }
export function tickRound(s: Round, delta: number): Round {
  if (s.done || s.awaitingReveal || !Number.isFinite(delta) || delta <= 0) return s;
  const next = { ...s, elapsed: s.elapsed + delta, totalElapsed: (s.totalElapsed ?? s.elapsed) + delta };
  if (next.elapsed >= next.limit) return end(next, false);
  if (next.open.length === 2 && next.lockUntil <= next.elapsed) next.open = [];
  return next;
}
function drawnBoard(s: Round): Round {
  const draws = (s.draws ?? 0) + 1;
  if (draws >= 2) return { ...end(s, true), draws: 2, feedback: 'Segundo empate: a jogada ensaiada é sua.' };
  const next = createRound('ticTacToe', s.seed, s.difficulty, s.round + 1, s.challenge); next.board[12] = 2;
  return { ...next, totalElapsed: s.totalElapsed ?? s.elapsed, draws, starter: 'opponent', steps: s.steps, feedback: 'Empate. Mais uma chance; o rival começa desta vez.' };
}
export function actRound(s: Round, value: number): Round {
  if (s.done || s.awaitingReveal || s.elapsed < s.preview || s.elapsed < s.lockUntil || !Number.isInteger(value)) return s;
  if (s.mode === 'code' && value === -1) return s.input.length ? { ...s, input: s.input.slice(0, -1), feedback: 'Último número apagado.' } : s;
  if ((s.mode === 'code' && (value < 1 || value > 9)) || (s.mode === 'pressureMap' && (value < 0 || value > 8))) return s;
  if (['maze', 'ticTacToe'].includes(s.mode) && (value < 0 || value >= 25)) return s;
  if (s.mode === 'pairs' && (value < 0 || value >= 16 || s.matched.includes(value) || s.open.includes(value) || s.open.length === 2)) return s;
  if (s.mode === 'cups' && (value < 0 || value >= 4)) return s;
  if (s.mode === 'ballTrack' && (value < 0 || value >= 6)) return s;
  if (s.mode === 'shot' && (value < 0 || value >= 3)) return s;
  if (s.mode === 'montyHall' && (value < 0 || value >= (s.input.length ? 2 : 3))) return s;
  if (s.mode === 'throughPass' && value !== 0) return s;
  let next = { ...s, input: [...s.input], board: [...s.board], steps: s.steps + 1, feedback: 'Jogada registrada.' };
  const mistake = () => { next.errors++; next.feedback = 'Não foi desta vez. Ajuste a próxima jogada.'; return next.errors >= mistakeLimit(s) ? end(next, false) : next; };
  if (s.mode === 'timing' || s.mode === 'goldZone') return end(next, Math.abs(markerAt(s) - 50) <= targetWidth(s) / 2);
  if (s.mode === 'cups') return end(next, value === s.target);
  if (s.mode === 'ballTrack') return end(next, value === s.sequence.at(-1));
  if (s.mode === 'shot') return { ...end(next, value !== s.target), input: [value], feedback: value !== s.target ? 'Você tirou do goleiro. Bola na rede!' : 'O goleiro leu o chute e fez a defesa.' };
  if (s.mode === 'montyHall') {
    if (!s.input.length) {
      const losers = [0, 1, 2].filter(door => door !== value && door !== s.target);
      const opened = losers[Math.floor(rng(s.seed + 443)() * losers.length)];
      return { ...next, input: [value], open: [opened], feedback: 'Um armário vazio foi aberto. Fique com sua escolha ou troque.' };
    }
    const chosen = value === 0 ? s.input[0] : [0, 1, 2].find(door => door !== s.input[0] && door !== s.open[0])!;
    return { ...end(next, chosen === s.target), input: [s.input[0], chosen], feedback: chosen === s.target ? 'A chuteira da sorte estava na sua escolha!' : 'O armário escolhido estava vazio.' };
  }
  if (s.mode === 'throughPass') {
    const window = passWindow(s), success = Math.abs(passMarkerAt(s) - window.center) <= window.width / 2;
    const matched = [...s.matched, success ? 1 : 0], wins = matched.reduce((sum, hit) => sum + hit, 0);
    const attempted = { ...next, matched, errors: matched.length - wins };
    if (wins >= 2) return { ...end(attempted, true), feedback: 'Dois passes completos. A defesa ficou para trás!' };
    if (wins + 3 - matched.length < 2) return { ...end(attempted, false), feedback: 'A defesa fechou o espaço. Não foi desta vez.' };
    return { ...createRound('throughPass', s.seed, s.difficulty, s.round + 1, s.challenge), matched, errors: matched.length - wins, totalElapsed: s.totalElapsed ?? s.elapsed, steps: next.steps, feedback: success ? 'Passe completo. Prepare a próxima tentativa.' : 'Passe interceptado. Ainda há uma chance.' };
  }
  if (s.mode === 'code') {
    next.input.push(value); if (next.input.length < s.sequence.length) return next;
    if (!next.input.every((digit, i) => digit === s.sequence[i])) return end(next, false);
    if (s.round < 3) return { ...createRound(s.mode, s.seed, s.difficulty, s.round + 1, s.challenge), totalElapsed: s.totalElapsed ?? s.elapsed, steps: next.steps, feedback: 'Código correto. Revele a próxima etapa quando estiver pronto.' };
    return end(next, true);
  }
  if (s.mode === 'pressureMap') { next.input.push(value); if (value !== s.sequence[s.input.length]) return end(next, false); return next.input.length === s.sequence.length ? end(next, true) : next; }
  if (s.mode === 'maze') { if (value !== s.sequence[s.input.length + 1]) return mistake(); next.input.push(value); return value === 24 ? end(next, true) : next; }
  if (s.mode === 'pairs') {
    next.open = [...s.open, value]; if (next.open.length < 2) return next;
    if (s.board[next.open[0]] === s.board[value]) { next.matched = [...s.matched, ...next.open]; next.open = []; next.feedback = 'Par encontrado.'; return next.matched.length === 16 ? end(next, true) : next; }
    next.lockUntil = s.elapsed + 1000; return mistake();
  }
  if (s.mode === 'puzzle') { const z = s.board.indexOf(0); if (value < 0 || value > 8 || !(Math.abs(z - value) === 3 || (Math.abs(z - value) === 1 && Math.floor(z / 3) === Math.floor(value / 3)))) return s; [next.board[z], next.board[value]] = [next.board[value], next.board[z]]; return next.board.every((v, i) => v === (i + 1) % 9) ? end(next, true) : next; }
  if (s.mode === 'ticTacToe') {
    if (next.board[value]) return s;
    next.board[value] = 1; if (wonLine(next.board, 1)) return end(next, true);
    const empty = next.board.flatMap((v, i) => v ? [] : [i]); if (!empty.length) return drawnBoard(next);
    let chosen = -1; for (const side of [2, 1]) { for (const i of empty) { const b = [...next.board]; b[i] = side; if (wonLine(b, side)) { chosen = i; break; } } if (chosen >= 0) break; }
    if (chosen < 0) { const random = rng(s.seed + s.steps * 97); chosen = s.difficulty === 'easy' ? empty[Math.floor(random() * empty.length)] : empty.sort((a, b) => Math.abs(a - 12) - Math.abs(b - 12))[0]; }
    next.board[chosen] = 2; if (wonLine(next.board, 2)) return end(next, false);
    return next.board.every(Boolean) ? drawnBoard(next) : next;
  }
  return s;
}
export function roundResult(s: Round, id: string, context: string): MiniResult { return { id, context, gameId: s.mode, seed: s.seed, difficulty: s.difficulty, won: s.won, elapsedMs: Math.round(s.totalElapsed ?? s.elapsed) }; }
