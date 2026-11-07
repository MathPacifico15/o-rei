import {useEffect,useRef,useState} from 'react';
import type {MiniGameDefinition} from '@/game/minigames';
import {actRound,ballTrackGrid,ballTrackIndexAt,createRound,cupPositions,cupSwapDuration,markerAt,mistakeLimit,passMarkerAt,passWindow,revealRound,roundResult,shotKeeperLane,targetCenter,targetWidth,tickRound,validRound,winningLine,type ChallengeContext,type Difficulty,type MiniResult} from '@/game/minigame-engine';
import {difficultyLabel} from '@/game/minigame-context';
import './minigame-arena.css';
import './minigame-features.css';
import './minigame-motion.css';
import './minigame-polish.css';

const icons=['⚽','👟','🏆','⭐','🧤','🎯','🟨','🥅'];
type Phase='tutorial'|'playing'|'paused'|'result';
type Props={game:MiniGameDefinition;seed?:number;context?:string;difficulty?:Difficulty;challenge?:ChallengeContext;onFinish:(r:MiniResult)=>void;onClose?:()=>void;autoAdvance?:boolean;autoStart?:boolean};

export function MiniGameArena({game,seed:providedSeed,context='treino',difficulty:lockedDifficulty,challenge,onFinish,onClose,autoAdvance=false,autoStart=false}:Props){
 const seed=useRef(providedSeed??Date.now()).current;
 const isTraining=context==='treino'||context.startsWith('laboratorio:');
 const shouldPersist=!isTraining&&!context.startsWith('laboratorio:');
 const forcedDifficulty:Difficulty|undefined=lockedDifficulty==='hard'?'hard':lockedDifficulty?'standard':undefined;
 const defaultDifficulty:Difficulty=forcedDifficulty??(game.difficulty==='hard'||game.difficulty==='veryHard'?'hard':'standard');
 const [difficulty,setDifficulty]=useState<Difficulty>(defaultDifficulty);
 const [round,setRound]=useState(()=>createRound(game.mode,seed,defaultDifficulty,1,challenge));
 const [phase,setPhase]=useState<Phase>(()=>autoStart?'playing':'tutorial');
 const [attempt,setAttempt]=useState(0);
 const [muted,setMuted]=useState(true);
 const [restored,setRestored]=useState(false);
 const delivered=useRef(false);
 const grid=useRef<HTMLDivElement>(null);
 const ready=!round.awaitingReveal&&round.elapsed>=round.preview;
 const storageKey=`o-rei:attempt:${context}:${game.id}:${seed}`;
 const challengeKey=JSON.stringify(challenge??{});
 const snapshot=useRef({round,phase,difficulty});
 snapshot.current={round,phase,difficulty};

 useEffect(()=>{
  if(shouldPersist)try{
   const saved=JSON.parse(localStorage.getItem(storageKey)??'null');
   if(saved&&validRound(saved.round)&&saved.round.mode===game.mode&&['easy','standard','hard'].includes(saved.difficulty)){
    const restoredDifficulty=forcedDifficulty??(saved.difficulty==='hard'?'hard':'standard');
    setRound({...saved.round,difficulty:restoredDifficulty,...(challenge?{challenge}:{})});
    setDifficulty(restoredDifficulty);
    setPhase(saved.round.done?'result':saved.phase==='tutorial'?'tutorial':'paused');
   }
  }catch{/* Preserve the career if this attempt is damaged. */}
  setRestored(true);
 },[storageKey,forcedDifficulty,challengeKey,shouldPersist]);

 useEffect(()=>{
  if(!restored||!shouldPersist)return;
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(snapshot.current))}catch{}};
  save();const timer=setInterval(save,750);window.addEventListener('pagehide',save);
  return()=>{clearInterval(timer);window.removeEventListener('pagehide',save);save()};
 },[restored,storageKey,phase,shouldPersist]);

 useEffect(()=>{
  if(phase!=='playing')return;
  let frame=0,last=performance.now();
  // A troca de aba pode entregar um salto enorme de tempo. Nunca pule uma
  // sequência de memória por causa disso: a visibilidade já pausa o jogo.
  const run=(now:number)=>{const delta=Math.min(100,Math.max(0,now-last));last=now;setRound(s=>tickRound(s,delta));frame=requestAnimationFrame(run)};
  frame=requestAnimationFrame(run);return()=>cancelAnimationFrame(frame);
 },[phase]);
 useEffect(()=>{
  if(!round.done)return;
  if(autoAdvance||!isTraining||context.startsWith('laboratorio:')){
   // O fluxo de carreira segue direto para o placar/troféu; o tabuleiro ainda
   // fica visível para confirmar uma linha vencedora ou a casa final.
   const delay=game.mode==='pressureMap'&&round.won?650:game.mode==='ticTacToe'?750:0;
   const timeout=window.setTimeout(finish,delay);
   return()=>window.clearTimeout(timeout);
  }
  if(game.mode==='ticTacToe') { const timeout=window.setTimeout(()=>setPhase('result'),900); return()=>window.clearTimeout(timeout); }
  setPhase('result');
 },[round.done,round.won,autoAdvance,game.mode,isTraining]);
 useEffect(()=>{
  const pause=()=>{if(document.hidden)setPhase(p=>p==='playing'?'paused':p)};
  document.addEventListener('visibilitychange',pause);return()=>document.removeEventListener('visibilitychange',pause);
 },[]);

 function choose(value:number){
  if(phase!=='playing')return;
  setRound(s=>actRound(s,value));
  if(!muted)try{
   const audio=new AudioContext(),osc=audio.createOscillator(),gain=audio.createGain();
   osc.connect(gain);gain.connect(audio.destination);gain.gain.value=.025;osc.frequency.value=440;osc.start();osc.stop(audio.currentTime+.045);osc.onended=()=>{void audio.close()};
  }catch{/* Optional audio. */}
 }
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){setPhase(p=>p==='playing'?'paused':p==='paused'?'playing':p);return;}
   if(phase!=='playing'||e.target instanceof HTMLSelectElement||e.target instanceof HTMLInputElement)return;
   if((game.mode==='timing'||game.mode==='goldZone'||game.mode==='throughPass')&&(e.code==='Space'||e.code==='Enter')){
    if(e.target instanceof HTMLButtonElement&&!/PARAR|SOLTAR PASSE/.test(e.target.textContent??''))return;
    e.preventDefault();choose(0);return;
   }
   if(game.mode==='code'&&/^[1-9]$/.test(e.key)){e.preventDefault();choose(Number(e.key));return;}
   if(game.mode==='code'&&e.key==='Backspace'){e.preventDefault();choose(-1);return;}
   if(game.mode==='shot'&&/^[1-3]$/.test(e.key)){e.preventDefault();choose(Number(e.key)-1);return;}
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){
    const buttons=Array.from(grid.current?.querySelectorAll<HTMLButtonElement>('.arena-grid button:not(:disabled)')??[]);
    if(!buttons.length)return;
    e.preventDefault();const cols=game.mode==='maze'?Math.sqrt(round.board.length):game.mode==='ticTacToe'?5:game.mode==='pairs'?4:3;
    const index=buttons.indexOf(document.activeElement as HTMLButtonElement),delta=e.key==='ArrowUp'?-cols:e.key==='ArrowDown'?cols:e.key==='ArrowLeft'?-1:1;
    buttons[(Math.max(0,index)+delta+buttons.length)%buttons.length]?.focus();
   }
  };
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[phase,game.mode,muted,round.board.length]);

 function start(){
  // A fresh start must always win over a stale persisted snapshot.
  if(shouldPersist)try{localStorage.removeItem(storageKey)}catch{}
  const nextAttempt=attempt+1;
  setRound(createRound(game.mode,seed+nextAttempt*104729,forcedDifficulty??difficulty,1,challenge));setPhase('playing');delivered.current=false;setAttempt(nextAttempt);
 }
 function finish(){
  if(delivered.current)return;delivered.current=true;
  try{const key='o-rei:minigame-log';const log=JSON.parse(localStorage.getItem(key)??'[]');localStorage.setItem(key,JSON.stringify([...log,{...result,attempt}].slice(-100)))}catch{}
  onFinish(result);
 }
 const result=roundResult(round,`${context}:${game.id}:${seed}`,context);
 const previewIndex=game.mode==='ballTrack'?ballTrackIndexAt(round):Math.floor(round.elapsed/(difficulty==='easy'?850:difficulty==='hard'?450:650));
 const width=targetWidth(round);
 const target=targetCenter(round);
 const pass=passWindow(round);
 const passMarker=passMarkerAt(round);
 const available=ready&&round.elapsed>=round.lockUntil;
 const directionLabels=['Esquerda','No meio','Direita'];
 const keeperLane=shotKeeperLane(round);
 const tttWinningCells=winningLine(round.board,1)??winningLine(round.board,2)??[];
 const passGoals=round.matched.filter(value=>value===1).length;
 const trackGrid=ballTrackGrid(challenge?.campaignRound??round.round);
 const button=(i:number,label:string|number,active=false,unavailable=false)=><button key={i} className={active?'lit':''} onClick={()=>choose(i)} disabled={!ready||phase!=='playing'||unavailable} aria-label={game.mode==='code'?`Número ${label}`:`Casa ${i+1}: ${label}`}>{label}</button>;
 const tutorials:Partial<Record<MiniGameDefinition['mode'],string>>={
  shot:'O goleiro se desloca e pode fintar para o lado oposto. Escolha o canto enquanto ele se move; em dificuldade alta as mudanças são mais rápidas.',
  montyHall:'Escolha uma das três chuteiras. Uma opção vazia será revelada; então decida entre ficar com a sua ou trocar pela outra que continuou fechada.',
  throughPass:'Faça dois gols em até três tentativas. Solte o passe quando seu atacante entrar no corredor livre entre os defensores. Clique no botão ou use Espaço.',
  ticTacToe:'Conecte quatro peças em um tabuleiro 5×5. Você joga com X. No primeiro empate o rival começa um novo tabuleiro; no segundo, você vence.',
  cups:'A bola aparece sob um dos quatro copos. Acompanhe as trocas e escolha o copo que a esconde.',
  code:'São três etapas. Revele e memorize cinco números diferentes, depois digite a sequência. O tempo para observar diminui a cada etapa.',
  pairs:'Memorize os oito pares por 1,85 segundo. Vire duas cartas por vez; cinco erros encerram a tentativa.',
  maze:'Memorize a rota iluminada. Depois escolha cada casa do caminho, do início até o gol. Um erro encerra a tentativa.',
 };
 const tutorial=tutorials[game.mode]??game.tutorial;

 return <div className={isTraining?'arena-overlay':'arena-inline'} role={isTraining?'dialog':'region'} aria-modal={isTraining?true:undefined} aria-label={game.name}>
  <section className={`arena arena-mode-${game.mode} arena-phase-${phase} ${round.errors > 0 ? 'arena-has-errors' : ''}`}>
   <header><small>{isTraining?'CENTRO DE TREINAMENTO':'DECISÃO DA CARREIRA'}</small><h2>{game.name}</h2>{onClose&&<button onClick={onClose}>Voltar ×</button>}</header>
   {phase==='tutorial'?<>
    <p>{game.description}</p><p>{tutorial}</p>
    <p>Toque ou clique para jogar. Use Tab e Enter nos botões, setas nos tabuleiros e Espaço para parar o marcador. Esc pausa.</p>
    {game.mode==='timing'&&challenge?.finishing!==undefined&&<p className="arena-attribute-note">{challenge.attributeLabel??"Finalização"} {challenge.finishing}: seus atributos influenciam a faixa de acerto desta decisão.</p>}
    {game.mode==='cups'&&challenge?.speed!==undefined&&<p className="arena-attribute-note">Velocidade {challenge.speed}: atletas rápidos acompanham uma troca a menos a partir de 80.</p>}
    {isTraining?<label>Dificuldade <select value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}><option value="standard">Normal</option><option value="hard">Difícil</option></select></label>:<p className="arena-context"><strong>Pressão da decisão:</strong> {difficultyLabel(difficulty)}. Ela é definida pelo adversário e pelo tamanho da competição.</p>}
    <button className="button button-primary" autoFocus onClick={start}>COMEÇAR</button>
   </>:phase==='result'?<div className={`arena-result ${round.won?'arena-won':'arena-lost'}`} aria-live="polite">
    <strong>{round.won?'TREINO CONCLUÍDO':'TREINO ENCERRADO'}</strong><p>{round.feedback}</p><p>{round.errors} erros · {(result.elapsedMs/1000).toFixed(1)} segundos · pressão {difficultyLabel(difficulty)}</p>
    {isTraining&&<button onClick={start}>TENTAR NOVAMENTE</button>}<button className="button button-primary" onClick={finish}>CONFIRMAR RESULTADO</button>
   </div>:<>
    <div className="arena-toolbar"><span>{game.mode==='code'?`Etapa ${round.round} de 3`:game.mode==='throughPass'?`Tentativa ${round.round} de 3`:game.mode==='montyHall'?(round.input.length?'Ficar ou trocar':'Escolha uma chuteira'):round.draws?`Novo tabuleiro · ${round.draws} empate`:'Decisão única'} · {round.awaitingReveal?'PREPARE-SE':ready?'SUA VEZ':'OBSERVE'}</span><b>{Math.max(0,Math.ceil((round.limit-round.elapsed)/1000))}s</b><button onClick={()=>setPhase(p=>p==='paused'?'playing':'paused')}>{phase==='paused'?'RETOMAR':'PAUSAR'}</button><button aria-pressed={!muted} onClick={()=>setMuted(v=>!v)}>Som {muted?'desligado':'ligado'}</button></div>
    {phase==='paused'?<div className="arena-paused"><h3>Jogo pausado</h3><p>O relógio e a jogada estão preservados.</p><button onClick={()=>setPhase('playing')}>RETOMAR</button></div>:<div className="arena-play" ref={grid}>
     {(game.mode==='timing'||game.mode==='goldZone')&&<><div className={`arena-track ${game.mode==='goldZone'?'arena-track-gold':'arena-track-red'}`}><div className="arena-timing-segments" aria-hidden="true">{Array.from({length:14},(_,i)=><span key={i}/>)}</div><i style={{left:`${target-width/2}%`,width:`${width}%`}}/><b style={{left:`${markerAt(round)}%`}}/></div><button className="button button-primary" onClick={()=>choose(0)}>PARAR · ESPAÇO</button></>}
     {game.mode==='shot'&&<div className="arena-shot">
      <p className="arena-shot-cue">O goleiro está em movimento. Escolha o canto enquanto ele tenta te enganar.</p>
      <div className="arena-shot-goal" role="img" aria-label={`Goleiro em movimento: ${directionLabels[keeperLane].toLowerCase()}`}><div className="arena-goal-net"/>{directionLabels.map(side=><div className="arena-shot-lane" key={side}/>)}<span className="arena-keeper arena-keeper-moving" style={{left:`${[16.67,50,83.33][keeperLane]}%`}} aria-hidden="true"><i/><b/></span></div>
      <div className="arena-shot-options arena-grid cols3">{directionLabels.map((side,i)=><button key={side} disabled={!available} onClick={()=>choose(i)} aria-label={`Chutar ${side.toLowerCase()}`}><span aria-hidden="true">{['↖','↑','↗'][i]}</span><b>{side}</b><small>Tecla {i+1}</small></button>)}</div>
      <p className="arena-choice-note">{challenge?.finishing!==undefined?`Finalização ${challenge.finishing} ajuda a decidir sob pressão. `:''}As fintas não definem o canto final até você chutar.</p>
     </div>}
     {game.mode==='montyHall'&&<div className="arena-monty">
      <p>{round.input.length?'Uma chuteira vazia foi revelada. Você fica com a sua escolha ou troca pela outra fechada?':'Uma das três chuteiras leva à vitória. Faça sua primeira escolha.'}</p>
      <div className="arena-monty-choices">{directionLabels.map((_,i)=>{const revealed=round.open.includes(i),selected=round.input[0]===i;return <button key={i} className={`${revealed?'revealed':''} ${selected?'selected':''}`} disabled={!available||round.input.length>0} onClick={()=>choose(i)} aria-label={`Chuteira ${i+1}${revealed?', vazia':selected?', sua escolha':''}`}><span className="arena-monty-icon" aria-hidden="true">{revealed?'×':'👟'}</span><b>Chuteira {i+1}</b><small>{revealed?'VAZIA':selected?'SUA ESCOLHA':'FECHADA'}</small></button>})}</div>
      {round.input.length>0&&<div className="arena-monty-actions"><button disabled={!available} onClick={()=>choose(0)}>FICAR COM A MINHA</button><button className="button button-primary" disabled={!available} onClick={()=>choose(1)}>TROCAR DE CHUTEIRA</button></div>}
     </div>}
     {game.mode==='throughPass'&&<div className="arena-pass">
      <div className="arena-pass-score"><strong>{passGoals}/2 gols</strong><span aria-label={`Tentativas concluídas: ${round.matched.length}`}>{Array.from({length:3},(_,i)=><i key={i} className={i<round.matched.length?(round.matched[i]?'scored':'missed'):i===round.round-1?'current':''} aria-label={i<round.matched.length?`Tentativa ${i+1}: ${round.matched[i]?'gol':'erro'}`:`Tentativa ${i+1}: pendente`}>{i<round.matched.length?(round.matched[i]?'✓':'×'):i+1}</i>)}</span></div>
      <p>Solte quando seu camisa 9 entrar no corredor livre entre os defensores.</p>
      <div className="arena-pass-pitch" role="img" aria-label="Atacante se movimenta diante da janela livre para o passe"><div className="arena-pass-goal"/><div className="arena-pass-window" style={{left:`${pass.center-pass.width/2}%`,width:`${pass.width}%`}}/><span className="arena-pass-runner" style={{left:`${passMarker}%`}} aria-hidden="true">9</span><span className="arena-pass-defender" style={{left:`${pass.center-pass.width/2}%`}} aria-hidden="true">4</span><span className="arena-pass-defender" style={{left:`${pass.center+pass.width/2}%`}} aria-hidden="true">3</span><span className="arena-pass-ball" aria-hidden="true">⚽</span><small>{ready?'CORREDOR DO PASSE':'PREPARANDO A JOGADA'}</small></div>
      <button className="button button-primary" disabled={!available} onClick={()=>choose(0)}>SOLTAR PASSE · ESPAÇO</button>
     </div>}
     {game.mode==='code'&&(round.awaitingReveal?<div className="arena-code-reveal"><strong>Etapa {round.round} de 3</strong><p>Prepare-se para memorizar. O código fica visível por {(round.preview/1000).toLocaleString('pt-BR')} segundo{round.preview===1000?'':'s'}.</p><button className="button button-primary" autoFocus onClick={()=>setRound(s=>revealRound(s))}>REVELAR CÓDIGO</button></div>:<><div className="arena-code" aria-label={ready?`Sequência digitada: ${round.input.join(' ')||'vazia'}`:'Memorize o código'}>{ready?round.input.join('').padEnd(5,'·'):round.sequence.join('')}</div>{!ready&&<p className="arena-code-instruction">Observe os cinco números. Digite quando eles desaparecerem.</p>}<div className="arena-grid cols3">{Array.from({length:9},(_,i)=>button(i+1,i+1))}</div><button className="arena-code-backspace" disabled={!ready||!round.input.length} onClick={()=>choose(-1)}>APAGAR ÚLTIMO · ⌫</button></>)}
     {game.mode==='cups'&&<div className="arena-cups">{cupPositions(round).map((position,id)=><button key={id} style={{left:`${position*25+12.5}%`,transitionDuration:`${cupSwapDuration(round)}ms`}} disabled={!ready} onClick={()=>choose(id)} aria-label={`Copo ${id+1}`}><span className="arena-cup-ball">{round.elapsed<1000&&id===round.target?'⚽':''}</span><span className="arena-cup-shape"/></button>)}</div>}
     {game.mode==='pairs'&&<><div className="arena-grid arena-pairs cols4">{round.board.map((v,i)=>button(i,!ready||round.open.includes(i)||round.matched.includes(i)?icons[v]:'?',round.matched.includes(i),round.open.includes(i)||round.matched.includes(i)))}</div><div className="pairs-chances" role="status" aria-label={`${Math.max(0,mistakeLimit(round)-round.errors)} chances restantes`}>{Array.from({length:mistakeLimit(round)},(_,i)=><span key={i} className={i<round.errors?'used':'available'} aria-hidden="true"/> )}</div></>}
     {game.mode==='puzzle'&&<div className="arena-grid arena-puzzle cols3">{round.board.map((v,i)=>button(i,v||'◇',!v))}</div>}
     {game.mode==='maze'&&<><p className="arena-maze-instruction">{ready?'A bola marca o início: siga a rota que você memorizou até o gol.':'A bola é o início. Memorize a única trilha verde até o gol.'}</p><div className="arena-grid arena-maze" style={{gridTemplateColumns:`repeat(${Math.sqrt(round.board.length)},minmax(0,1fr))`}}>{round.board.map((_,i)=>button(i,i===round.sequence.at(-1)?'🥅':i===(round.input.at(-1)??round.sequence[0])?'⚽':'',!ready&&round.sequence.includes(i)||round.input.includes(i)))}</div></>}
     {game.mode==='ticTacToe'&&<div className="arena-grid arena-ttt cols5">{round.board.map((v,i)=><button key={i} className={`${v===1?'mark-x':v===2?'mark-o':''} ${tttWinningCells.includes(i)?'lit':''}`} onClick={()=>choose(i)} disabled={!ready||phase!=='playing'||Boolean(v)} aria-label={`Casa ${i+1}: ${v===1?'X':v===2?'O':'vazia'}`}>{v===1?'X':v===2?'O':'·'}</button>)}</div>}
     {game.mode==='pressureMap'&&<div className="arena-grid arena-pressure cols4">{Array.from({length:16},(_,i)=>{const scoreCell=round.done&&round.won&&i===round.sequence.at(-1),active=(!ready&&round.sequence[previewIndex]===i)||round.input.includes(i);return <button key={i} className={`${active?'lit':''} ${scoreCell?'score':''}`} onClick={()=>choose(i)} disabled={!ready||phase!=='playing'} aria-label={scoreCell?`Casa ${i+1}: placar da partida`:`Casa ${i+1}`}>{scoreCell?'✓':''}</button>})}</div>}
     {game.mode==='ballTrack'&&<div className="arena-grid arena-track-players" style={{gridTemplateColumns:`repeat(${trackGrid.columns},minmax(0,1fr))`}}>{Array.from({length:round.board.length},(_,i)=>button(i,!ready&&round.sequence[previewIndex]===i?'⚽':'●',!ready&&round.sequence[previewIndex]===i))}</div>}
    </div>}
    <p className="arena-live-feedback" role="status" key={`${round.feedback}:${round.errors}:${round.round}:${round.matched.length}`}>{round.feedback} {round.errors>0?`Erros: ${round.errors}/${mistakeLimit(round)}`:''}</p>
   </>}
  </section>
 </div>;
}
