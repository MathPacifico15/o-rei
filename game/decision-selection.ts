import { minigames, type MiniGameDefinition, type MiniGameId } from './minigames';
import type { CareerState, CupFinal, Position } from './types';

export type PlayStyle = 'skill' | 'luck' | 'mixed';
export const playStyleLabels: Record<PlayStyle, string> = { skill: 'Habilidade', luck: 'Intuição', mixed: 'Misto' };
export function decisionAttemptKey(seed: number, season: number, final?: CupFinal) {
 const base = [seed, season, final?.competitionId, final?.campaignMatchIndex ?? 0];
 return (final?.attempt === 'penalties' ? [...base, 'penalties', final.decisionId ?? ''] : base).join(':');
}
type Selection = { seed: number; season: number; position: Position; style?: PlayStyle; campaign?: boolean; access?: boolean; locked?: MiniGameId; recent?: MiniGameId[]; history?: CareerState['miniGameHistory'] };
/** Variety changes the offered challenge, never whether a sporting final exists. */
export function selectDecisionGame(options: Selection): MiniGameDefinition {
 const pool = minigames.filter(game => Boolean(game.exclusive) === Boolean(options.campaign) && (!game.positions || game.positions.includes(options.position)));
 const locked = pool.find(game => game.id === options.locked);
 if (locked) return locked;
 if (options.access) return minigames.find(game => game.id === 'marca-vermelha')!;
 const style = options.style ?? 'mixed';
 let eligible = pool;
 if (!options.campaign) {
  const identity = style === 'mixed' ? (Math.abs(Math.imul(options.seed, 2654435761)) % 100 < 50 ? 'skill' : 'luck') : style;
  const preferred = pool.filter(game => (game.identity ?? 'skill') === identity);
  if (preferred.length) eligible = preferred;
 }
 const history = options.history ?? [], recent = options.recent ?? [];
 const thisSeason = new Set(history.filter(entry => entry.season === options.season).map(entry => entry.gameId));
 const ever = new Set(history.map(entry => entry.gameId));
 const tiers = [eligible.filter(game => !ever.has(game.id) && !recent.includes(game.id)), eligible.filter(game => !thisSeason.has(game.id)), eligible.filter(game => !recent.includes(game.id)), eligible.filter(game => game.id !== recent.at(-1)), eligible];
 const choices = tiers.find(tier => tier.length)!;
 return choices[Math.abs(options.seed) % choices.length];
}
export function rememberDecisionGame(state: CareerState, game: MiniGameDefinition, final?: CupFinal): CareerState {
 if (!final) return state;
 const decisionId = final.decisionId ?? `${state.season}:${final.competitionId}:${final.campaignMatchIndex ?? 0}:${final.attempt ?? 'regulation'}`;
 if (state.miniGameHistory?.some(entry => entry.decisionId === decisionId)) return state;
 return { ...state, miniGameHistory: [...(state.miniGameHistory ?? []), { season: state.season, decisionId, gameId: game.id }], recentMiniGameIds: [...(state.recentMiniGameIds ?? []), game.id].slice(-3) };
}
export function cardHandSeed(state: CareerState) { return state.seed + state.season + (state.cardRedraws?.nonce ?? 0) * 104729; }
export function canRedrawCards(state: CareerState) { return (state.cardRedraws?.used ?? 0) < 3 && (!state.cardRedraws || state.season - state.cardRedraws.lastSeason >= 2); }
/** O REI adaptation: a limited free redraw, without advertising or rarity guarantees. */
export function redrawCards(state: CareerState): CareerState {
 if (!canRedrawCards(state)) return state;
 return { ...state, cardRedraws: { used: (state.cardRedraws?.used ?? 0) + 1, lastSeason: state.season, nonce: (state.cardRedraws?.nonce ?? 0) + 1 } };
}
