import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const vite = await createServer({ root: process.cwd(), configFile: false, server: { middlewareMode: true, watch: null } });
try {
  const { minigames, exclusiveMinigames, miniGameForFinal } = await vite.ssrLoadModule("/game/minigames.ts");
  const expectedModes = new Set(["code", "cups", "timing", "maze", "ticTacToe", "pairs", "puzzle", "pressureMap", "goldZone", "ballTrack", "shot", "montyHall", "throughPass"]);

  assert(minigames.length === 13, "O catálogo conserva dez desafios e acrescenta três decisões de futebol");
  assert(new Set(minigames.map((game) => game.id)).size === 13, "Há minigame duplicado no catálogo");
  assert(new Set(minigames.map((game) => game.mode)).size === 13, "Cada minigame precisa ter um modo próprio");
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
  assert(genericSeen.size === 10, "O RNG não percorreu todos os minigames comuns");
  assert(exclusiveSeen.size === 3, "O RNG não percorreu todos os minigames exclusivos");
  const game = await vite.ssrLoadModule('/game/minigame-engine.ts');
  let checks = 0;
  const check = (value, message) => { assert(value, message); checks++; };
  let code = game.createRound('code', 91);
  check(game.validRound(code), 'Código novo válido');
  check(game.tickRound(code, 1000000) === code && game.actRound(code, code.sequence[0]) === code, 'Código aguarda revelar sem consumir relógio ou entrada');
  let expectedElapsed = 0;
  for (let stage = 0; stage < 3; stage++) {
    check(code.round === stage + 1 && code.awaitingReveal, 'Cada etapa exige nova revelação');
    check(code.preview === [2000, 1300, 800][stage], 'Janela de memória encurta por etapa');
    check(code.sequence.length === 5 && new Set(code.sequence).size === 5 && code.sequence.every(n => n >= 1 && n <= 9), 'Cinco dígitos distintos de 1 a 9');
    code = game.revealRound(code);
    check(game.revealRound(code) === code, 'Revelação não reinicia janela já ativa');
    check(game.actRound(code, code.sequence[0]) === code, 'Entrada bloqueada durante memória');
    const delta = code.preview + 125; expectedElapsed += delta;
    code = game.tickRound(code, delta);
    for (const value of [0, 10, NaN, Infinity, 1.5]) check(game.actRound(code, value) === code, 'Entrada inválida ignorada no código');
    const sequence = [...code.sequence];
    code = game.actRound(code, sequence[0]); code = game.actRound(code, -1);
    check(code.input.length === 0 && !code.done, 'É possível apagar o prefixo antes de completar');
    for (const digit of sequence) code = game.actRound(code, digit);
    check(stage === 2 ? code.done && code.won : !code.done && code.awaitingReveal, 'Só a terceira etapa resolve o desafio');
  }
  check(game.roundResult(code, 'code-test', 'test').elapsedMs === expectedElapsed, 'Telemetria soma as três etapas');
  check(game.tickRound(code, 1000) === code && game.actRound(code, 1) === code, 'Desafio resolvido é imutável');
  let wrong = game.createRound('code', 51); wrong = game.tickRound(game.revealRound(wrong), wrong.preview);
  const wrongSequence = [...wrong.sequence]; wrongSequence[4] = wrongSequence[4] % 9 + 1;
  for (const digit of wrongSequence) wrong = game.actRound(wrong, digit);
  check(wrong.done && !wrong.won, 'Código errado na etapa perde o desafio');

  for (const difficulty of ['easy', 'standard', 'hard']) {
    let pairs = game.createRound('pairs', 41, difficulty);
    check(pairs.preview === 1000 && game.mistakeLimit(pairs) === 5, 'Pares têm mesma memória e tolerância em todas as dificuldades');
    pairs = game.tickRound(pairs, pairs.preview);
    const mismatch = pairs.board.findIndex(value => value !== pairs.board[0]);
    pairs = game.actRound(game.actRound(pairs, 0), mismatch);
    check(pairs.errors === 1 && pairs.open.length === 2, 'Primeiro par errado permanece visível');
    check(game.actRound(pairs, 2) === pairs, 'Clique bloqueado durante exposição de erro');
    pairs = game.tickRound(pairs, 999); check(pairs.open.length === 2, 'Par errado visível por um segundo completo');
    pairs = game.tickRound(pairs, 1); check(pairs.open.length === 0, 'Par errado fecha após um segundo');
    for (let i = 0; i < 4; i++) { pairs = game.actRound(game.actRound(pairs, 0), mismatch); if (!pairs.done) pairs = game.tickRound(pairs, 1000); }
    check(pairs.done && !pairs.won && pairs.errors === 5, 'Quinto erro perde o pareamento');
  }

  const low = game.createRound('timing', 1, 'standard', 1, { finishing: 40, identity: 'mixed' });
  const high = game.createRound('timing', 1, 'standard', 1, { finishing: 99, identity: 'mixed' });
  check(game.targetWidth(high) > game.targetWidth(low), 'Finalização aumenta a janela real');
  check(Math.abs(game.targetWidth(low) - 100 / 14) < 1e-8 && Math.abs(game.targetWidth(high) - 400 / 14) < 1e-8, 'Largura limitada de uma a quatro faixas');
  const skill = game.createRound('timing', 1, 'standard', 1, { finishing: 99, identity: 'skill', stakes: 'high' });
  check(game.targetWidth(skill) < game.targetWidth(high), 'Identidade e pressão diminuem janela de decisão');
  const edge = { ...high, elapsed: 1250, totalElapsed: 1250 }; // marker=62.5, inside the wide target only.
  check(game.actRound(edge, 0).won && !game.actRound({ ...edge, challenge: low.challenge }, 0).won, 'Atributo influencia vitória, não apenas desenho');
  check(game.targetWidth(game.createRound('goldZone', 1)) === game.tuning.standard.width * .7, 'Tentativa legada conserva alvo goldZone');

  const standardCups = game.createRound('cups', 2, 'standard', 1, { identity: 'mixed', speed: 70 });
  const skilledCups = game.createRound('cups', 2, 'standard', 1, { identity: 'skill', speed: 70 });
  const fastCups = game.createRound('cups', 2, 'standard', 1, { identity: 'skill', speed: 80 });
  check(standardCups.swaps.length === 7 && skilledCups.swaps.length === 9 && fastCups.swaps.length === 8, 'Identidade e velocidade alteram trocas dos quatro copos');
  for (const difficulty of ['easy', 'standard', 'hard']) {
    const cups = game.createRound('cups', 2, difficulty);
    check(game.cupSwapDuration(cups) === { easy: 510, standard: 450, hard: 380 }[difficulty], 'Velocidade das trocas acompanha pressão');
    check(new Set(game.cupPositions(game.tickRound(cups, cups.preview))).size === 4, 'Trocas preservam quatro posições distintas');
    check(game.actRound(game.tickRound(cups, cups.preview), cups.target).won, 'Copo rastreado continua sendo resposta correta');
  }

  const drawBoard = [1,1,2,2,1, 2,2,1,1,2, 1,1,2,2,1, 2,2,1,1,2, 1,1,2,2,0];
  check(!game.wonLine(drawBoard, 1) && !game.wonLine(drawBoard, 2), 'Fixture de empate não tem linha vencedora');
  let draw = game.actRound({ ...game.createRound('ticTacToe', 3), board: drawBoard, elapsed: 1200, totalElapsed: 1200 }, 24);
  check(!draw.done && draw.draws === 1 && draw.starter === 'opponent' && draw.board.filter(Boolean).length === 1 && draw.board[12] === 2, 'Primeiro empate reinicia e o rival abre');
  check(draw.totalElapsed === 1200 && game.validRound(draw), 'Empate conserva telemetria e save válido');
  draw = game.actRound({ ...draw, board: drawBoard }, 24);
  check(draw.done && draw.won && draw.draws === 2, 'Segundo empate concede vitória');
  check(game.createRound('pressureMap', 3, 'standard', 1, { campaignRound: 5 }).sequence.length === 9, 'Sequência cresce por partida da campanha');
  check(game.createRound('pressureMap', 3, 'hard', 1, { campaignRound: 100 }).sequence.length === 12, 'Sequência de campanha tem limite jogável');
  const legacy = game.createRound('timing', 9); delete legacy.totalElapsed;
  check(game.validRound(legacy), 'Save sem novos campos continua válido');
  for (const bad of [{ ...legacy, mode: 'not-a-game' }, { ...legacy, challenge: { finishing: Infinity } }, { ...legacy, challenge: { speed: -1 } }, { ...legacy, challenge: { campaignRound: 0 } }, { ...legacy, awaitingReveal: 'yes' }, { ...legacy, draws: 3 }, { ...legacy, totalElapsed: -1 }]) check(!game.validRound(bad), 'Save contextual inválido é rejeitado');
  for (let seed = 0; seed < 150; seed++) {
    const choice = game.createRound('montyHall', seed);
    const door = seed % 3;
    const offered = game.actRound(choice, door);
    check(offered.open.length === 1 && offered.open[0] !== door && offered.open[0] !== choice.target && !offered.done, 'Revelação nunca expõe prêmio ou escolha inicial');
    const stay = game.actRound(offered, 0), swap = game.actRound(offered, 1);
    check(stay.done && swap.done && stay.won !== swap.won && stay.won === (door === choice.target), 'Ficar e trocar respeitam o prêmio fixado antes da escolha');
    check(game.actRound(offered, 2) === offered && game.validRound(offered) && game.validRound(swap), 'Monty valida entradas, etapa intermediária e save');
    const shot = game.createRound('shot', seed, 'standard', 1, { finishing: 80 });
    check([0,1,2].filter(lane => game.actRound(shot, lane).won).length === 2, 'Goleiro defende um dos três lados; o alvo não muda após o chute');
    check(game.actRound(shot, 3) === shot && shot.target >= 0 && shot.target < 3 && game.validRound(shot), 'Duelo com goleiro tem estado e entradas válidos');
  }
  let readableLow = 0, readableHigh = 0;
  for (let seed=0;seed<500;seed++) { const a=game.createRound('shot',seed,'standard',1,{finishing:20}),b=game.createRound('shot',seed,'standard',1,{finishing:99});readableLow+=Number(a.board[0]===a.target);readableHigh+=Number(b.board[0]===b.target); }
  check(readableHigh>readableLow, 'Finalização melhora a confiabilidade efetiva da pista do goleiro');
  function passAttempt(round, success) {
    for (let elapsed=round.preview;elapsed<10000;elapsed+=10) {
      const candidate=game.tickRound(round,elapsed),window=game.passWindow(candidate);
      if ((Math.abs(game.passMarkerAt(candidate)-window.center)<=window.width/2)===success) return game.actRound(candidate,0);
    }
    throw Error('Janela de passe inacessível');
  }
  let passing=game.createRound('throughPass',33,'standard',1,{finishing:80});
  passing=passAttempt(passing,true);check(!passing.done && passing.round===2 && passing.matched.join(',')==='1','Primeiro gol prepara segunda tentativa');
  passing=passAttempt(passing,false);check(!passing.done && passing.round===3 && passing.matched.join(',')==='1,0','Um gol e um erro levam à terceira tentativa');
  passing=passAttempt(passing,true);check(passing.done && passing.won && passing.matched.join(',')==='1,0,1' && game.validRound(passing),'Dois acertos em três vencem e salvam corretamente');
  let failed=passAttempt(passAttempt(game.createRound('throughPass',33),false),false);
  check(failed.done&&!failed.won&&failed.matched.length===2,'Dois erros encerram quando não há mais como alcançar dois gols');
  const selection=await vite.ssrLoadModule('/game/decision-selection.ts');
  check(selection.decisionAttemptKey(7,2026,{competitionId:'wc',campaignMatchIndex:3,attempt:'regulation'})==='7:2026:wc:3','Chave de tentativa regular preserva saves legados');
  const regulationKey=selection.decisionAttemptKey(7,2026,{competitionId:'wc',campaignMatchIndex:3,attempt:'regulation'});
  const penaltyKey=selection.decisionAttemptKey(7,2026,{competitionId:'wc',campaignMatchIndex:3,attempt:'penalties',decisionId:'wc:3:penalties'});
  check(regulationKey!==penaltyKey&&penaltyKey.includes('penalties'),'Pênaltis não restauram o resultado da tentativa regular');
  const state={seed:73,season:2026,miniGameHistory:[],recentMiniGameIds:[]};
  const final={competitionId:'copa',decisionId:'copa:2026:final'};
  const selected=minigames.find(entry=>entry.id==='codigo-prancheta');
  check(selection.rememberDecisionGame(state,selected)===state,'Temporada sem final não consome histórico nem cooldown');
  const remembered=selection.rememberDecisionGame(state,selected,final);
  check(remembered.miniGameHistory.length===1&&selection.rememberDecisionGame(remembered,selected,final)===remembered,'Mesma decisão não é contada duas vezes');
  for (const position of ['GOL','MEI','ATA']) for(const style of ['skill','luck','mixed']) for(let seed=0;seed<80;seed++){
    const args={seed,season:2026,position,style,recent:[],history:[]},picked=selection.selectDecisionGame(args);
    check(!picked.positions||picked.positions.includes(position),'Seleção respeita a posição do jogador');
    check(style==='mixed'||(picked.identity??'skill')===style,'Identidade filtra decisões comuns');
    check(selection.selectDecisionGame(args).id===picked.id,'Escolha determinística após recarregar');
  }
  const next=selection.selectDecisionGame({seed:73,season:2026,position:'ATA',style:'skill',history:remembered.miniGameHistory,recent:remembered.recentMiniGameIds});
  check(next.id!==selected.id,'Modalidades ainda não vistas têm prioridade sobre repetição');
  let redrawn=selection.redrawCards(state);check(redrawn.cardRedraws.used===1&&selection.cardHandSeed(redrawn)!==selection.cardHandSeed(state),'Troca altera a mão e consome uma das três oportunidades');
  check(selection.redrawCards(redrawn)===redrawn&&!selection.canRedrawCards({...redrawn,season:2027}),'Troca respeita duas temporadas de intervalo');
  redrawn=selection.redrawCards({...redrawn,season:2028});redrawn=selection.redrawCards({...redrawn,season:2030});
  check(redrawn.cardRedraws.used===3&&!selection.canRedrawCards({...redrawn,season:2035}),'Não há quarta troca na carreira');
  check(selection.cardHandSeed(JSON.parse(JSON.stringify(redrawn)))===selection.cardHandSeed(redrawn),'Mão de cartas permanece estável após serialização');
  console.log(`OK: 13 minigames, RNG, acesso, campanhas e ${checks} regressões de mecânicas validados.`);
} finally {
  await vite.close();
}
