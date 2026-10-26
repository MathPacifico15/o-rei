import type { Difficulty } from "./minigame-engine";

export type FinalDifficultyContext = {
  clubStrength: number;
  opponentStrength?: number;
  competitionPrestige?: number;
  phaseIndex?: number;
};

/**
 * Original O REI policy. Career difficulty is not a player setting: it comes
 * from the sporting mismatch and the size of the occasion. The values are
 * intentionally visible to the player and independent from any reference game.
 */
export function difficultyForFinal(context: FinalDifficultyContext): Difficulty {
  const gap = (context.opponentStrength ?? context.clubStrength) - context.clubStrength;
  const occasion = (context.competitionPrestige ?? 50) >= 82 ? 5 : (context.competitionPrestige ?? 50) >= 65 ? 2 : 0;
  const phase = Math.max(0, (context.phaseIndex ?? 0) - 3);
  const pressure = gap + occasion + phase * 2;
  if (pressure >= 10) return "hard";
  if (pressure <= -7) return "easy";
  return "standard";
}

export function difficultyLabel(difficulty: Difficulty) {
  return difficulty === "easy" ? "favorável" : difficulty === "hard" ? "máxima pressão" : "equilibrada";
}
