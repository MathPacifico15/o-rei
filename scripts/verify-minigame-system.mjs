import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const vite = await createServer({ root: process.cwd(), configFile: false, server: { middlewareMode: true } });
try {
  const { minigames, exclusiveMinigames, miniGameForFinal } = await vite.ssrLoadModule("/game/minigames.ts");
  const expectedModes = new Set(["code", "cups", "timing", "maze", "ticTacToe", "pairs", "puzzle", "pressureMap", "goldZone", "ballTrack"]);

  assert(minigames.length === 10, "O catálogo precisa ter os 10 minigames aprovados");
  assert(new Set(minigames.map((game) => game.id)).size === 10, "Há minigame duplicado no catálogo");
  assert(new Set(minigames.map((game) => game.mode)).size === 10, "Cada minigame precisa ter um modo próprio");
  assert(minigames.every((game) => expectedModes.has(game.mode)), "Modo de minigame inválido");
  assert(exclusiveMinigames.length === 3 && exclusiveMinigames.every((game) => game.exclusive), "Copa do Mundo e Super Mundial devem ter exatamente 3 minigames exclusivos");

  const genericSeen = new Set();
  const exclusiveSeen = new Set();
  for (let seed = 0; seed < 210; seed += 1) {
    const access = miniGameForFinal(seed, { access: true });
    const generic = miniGameForFinal(seed);
    const campaign = miniGameForFinal(seed, { campaign: true });
    assert(access.id === "marca-vermelha", "Acesso só pode usar Marca Vermelha");
    assert(!generic.exclusive, "Final comum escolheu minigame exclusivo de Mundial");
    assert(campaign.exclusive, "Campanha de Mundial escolheu minigame comum");
    genericSeen.add(generic.id);
    exclusiveSeen.add(campaign.id);
  }
  assert(genericSeen.size === 7, "O RNG não percorreu todos os minigames comuns");
  assert(exclusiveSeen.size === 3, "O RNG não percorreu todos os minigames exclusivos");
  console.log("OK: 10 minigames, RNG, acesso e campanhas de Mundial validados.");
} finally {
  await vite.close();
}
