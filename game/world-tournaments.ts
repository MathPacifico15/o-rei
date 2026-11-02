import type { CampaignResult, CupFinal } from "./types";
import type { Difficulty } from "./minigame-engine";

/** RNG estável e local: o sorteio fica reproduzível sem depender da ordem global da temporada. */
export function tournamentRoll(key: string) {
  let hash = 2166136261;
  for (const character of key) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

export function rescueForDecision(campaignId: string, matchIndex: number) {
  return tournamentRoll(`${campaignId}:resgate:${matchIndex}`) < .5;
}

const difficultyOrder: Difficulty[] = ["easy", "standard", "hard"];
export function worldMatchDifficulty(base: Difficulty, matchIndex: number, penalties = false): Difficulty {
  const baseIndex = difficultyOrder.indexOf(base);
  const phasePressure = matchIndex < 3 ? Math.floor(matchIndex / 2) : 1 + Math.floor((matchIndex - 3) / 2);
  return difficultyOrder[Math.min(difficultyOrder.length - 1, Math.max(0, baseIndex) + phasePressure + (penalties ? 1 : 0))];
}

type WorldResolution = {
  campaign: CampaignResult;
  outcome: "won" | "drawn" | "lost" | "penalties";
  continueCampaign: boolean;
  champion: boolean;
};

function scored(outcome: "won" | "drawn" | "lost", seed: string) {
  const variation = tournamentRoll(seed) >= .5;
  if (outcome === "won") return variation ? [2, 1] : [1, 0];
  if (outcome === "drawn") return variation ? [1, 1] : [0, 0];
  return variation ? [1, 2] : [0, 1];
}

function rankGroup(campaign: CampaignResult) {
  const groupMatches = campaign.matches.slice(0, 3).filter((match) => match.result !== "pending");
  const player = campaign.groupTable?.[0]?.name ?? "Seu time";
  const [existingPlayer, ...rivals] = campaign.groupTable ?? [];
  const row = {
    name: existingPlayer?.name ?? player,
    points: groupMatches.reduce((sum, match) => sum + (match.result === "won" ? 3 : match.result === "drawn" ? 1 : 0), 0),
    goalDifference: groupMatches.reduce((sum, match) => sum + (match.playerGoals ?? 0) - (match.opponentGoals ?? 0), 0),
    goalsFor: groupMatches.reduce((sum, match) => sum + (match.playerGoals ?? 0), 0),
    position: 0,
  };
  const ranked = [row, ...rivals.filter((item) => item.name !== player)]
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || tournamentRoll(`${campaign.id}:${a.name}`) - tournamentRoll(`${campaign.id}:${b.name}`))
    .map((item, index) => ({ ...item, position: index + 1 }));
  // A primeira linha identifica o clube do jogador entre partidas. Conservar
  // essa identidade evita trocar o jogador pelo líder ao recalcular a tabela.
  return [ranked.find(item => item.name === player)!, ...ranked.filter(item => item.name !== player)];
}

/** Resolve somente campanhas mundiais. Nenhuma simulação posterior altera o minijogo. */
export function resolveWorldMatch(campaign: CampaignResult, final: CupFinal, won: boolean): WorldResolution {
  const index = final.campaignMatchIndex ?? 0;
  const group = final.worldStage === "group" || index < 3;
  const penalties = final.attempt === "penalties";
  const outcome: "won" | "drawn" | "lost" = won ? "won" : group && final.rescueAvailable ? "drawn" : "lost";
  const [playerGoals, opponentGoals] = scored(outcome, `${campaign.id}:${index}:${penalties ? "pen" : "normal"}`);
  const matches = campaign.matches.map((match, matchIndex) => matchIndex === index
    ? { ...match, result: outcome, playerGoals, opponentGoals, penaltyShootout: penalties ? (won ? "won" as const : "lost" as const) : match.penaltyShootout }
    : match);
  let groupTable = campaign.groupTable;
  let continueCampaign = false;
  let champion = false;
  let status = campaign.status;
  let phase = campaign.phase;

  if (group) {
    groupTable = rankGroup({ ...campaign, matches });
    if (index < 2) continueCampaign = true;
    else {
      const playerRow = groupTable.find((row) => row.name === campaign.groupTable?.[0]?.name);
      const qualified = campaign.format === "world-48"
        ? Boolean(playerRow && (playerRow.position <= 2 || (playerRow.position === 3 && playerRow.points >= 4)))
        : Boolean(playerRow && playerRow.position <= 2);
      continueCampaign = qualified;
      status = qualified ? "active" : "eliminated";
      phase = qualified ? campaign.matches[3]?.phase ?? "Mata-mata" : "Eliminado na fase de grupos";
    }
  } else if (won) {
    champion = index === campaign.matches.length - 1;
    continueCampaign = !champion;
    status = champion ? "champion" : "active";
    phase = champion ? "Campeão" : campaign.matches[index + 1]?.phase ?? campaign.phase;
  } else {
    status = "eliminated";
    phase = `Eliminado · ${campaign.matches[index]?.phase ?? campaign.phase}`;
  }

  return { campaign: { ...campaign, matches, groupTable, status, phase, title: champion ? campaign.competitionName : campaign.title }, outcome, continueCampaign, champion };
}
