import type { AttributeKey, Player, Position } from "./types";

export const weights: Record<Position, Partial<Record<AttributeKey, number>>> = {
  GOL: { reflexo: .27, elasticidade: .18, posicionamento: .18, saida: .17, lideranca: .08, fisico: .12 },
  MEI: { velocidade: .14, passe: .26, finalizacao: .14, drible: .2, lideranca: .1, fisico: .16 },
  ATA: { finalizacao: .28, cabecada: .17, velocidade: .18, forca: .16, lideranca: .07, fisico: .14 },
};

export function computeOvr(player: Pick<Player, "position" | "attributes">) {
  return Math.round(Object.entries(weights[player.position]).reduce((total, [key, weight]) => total + player.attributes[key as AttributeKey] * (weight ?? 0), 0));
}
