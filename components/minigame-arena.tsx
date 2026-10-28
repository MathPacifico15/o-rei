import {useEffect,useRef,useState} from 'react';
import type {MiniGameDefinition} from '@/game/minigames';
import {actRound,createRound,cupPositions,cupSwapDuration,markerAt,mistakeLimit,passMarkerAt,passWindow,revealRound,roundResult,targetWidth,tickRound,validRound,type ChallengeContext,type Difficulty,type MiniResult} from '@/game/minigame-engine';
import {difficultyLabel} from '@/game/minigame-context';
import './minigame-arena.css';
import './minigame-features.css';

const icons=['⚽','👟','🏆','⭐','🧤','🎯','🟨','🥅'];
type Phase='tutorial'|'playing'|'paused'|'result';
type Props={game:MiniGameDefinition;seed?:number;context?:string;difficulty?:Difficulty;challenge?:ChallengeContext;onFinish:(r:MiniResult)=>void;onClose?:()=>void};

export function MiniGameArena({game,seed=2026,context='treino',difficulty:lockedDifficulty,challenge,onFinish,onClose}:Props){
 const isTraining=context==='treino';
 const defaultDifficulty:Difficulty=lockedDifficulty??(game.difficulty==='easy'?'easy':game.difficulty==='hard'||game.difficulty==='veryHard'?'hard':'standard');
 const [difficulty,setDifficulty]=useState<Difficulty>(defaultDifficulty);
 const [round,setRound]=useState(()=>createRound(game.mode,seed,defaultDifficulty,1,challenge));
 const [phase,setPhase]=useState<Phase>('tutorial');
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
  if(!isTraining)try{
   const saved=JSON.parse(localStorage.getItem(storageKey)??'null');
   if(saved&&validRound(saved.round)&&saved.round.seed===seed&&saved.round.mode===game.mode&&['easy','standard','hard'].includes(saved.difficulty)){
    setRound({...saved.round,difficulty:lockedDifficulty??saved.difficulty,...(challenge?{challenge}:{})});
    setDifficulty(lockedDifficulty??saved.difficulty);
    setPhase(saved.round.done?'result':saved.phase==='tutorial'?'tutorial':'paused');
   }
  }catch{/* Preserve the career if this attempt is damaged. */}
  setRestored(true);
 },[storageKey,lockedDifficulty,challengeKey,isTraining]);

 useEffect(()=>{
  if(!restored||isTraining)return;
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(snapshot.current))}catch{}};
  save();const timer=setInterval(save,750);window.addEventListener('pagehide',save);
  return()=>{clearInterval(timer);window.removeEventListener('pagehide',save);save()};
 },[restored,storageKey,phase,isTraining]);

 useEffect(()=>{
  if(phase!=='playing')return;
  let frame=0,last=performance.now();
  const run=(now:number)=>{const delta=now-last;last=now;setRound(s=>tickRound(s,delta));frame=requestAnimationFrame(run)};
  frame=requestAnimationFrame(run);return()=>cancelAnimationFrame(frame);
 },[phase]);
 useEffect(()=>{if(round.done)setPhase('result')},[round.done]);
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
    e.preventDefault();const cols=game.mode==='maze'||game.mode==='ticTacToe'?5:game.mode==='pairs'?4:3;
    const index=buttons.indexOf(document.activeElement as HTMLButtonElement),delta=e.key==='ArrowUp'?-cols:e.key==='ArrowDown'?cols:e.key==='ArrowLeft'?-1:1;
    buttons[(Math.max(0,index)+delta+buttons.length)%buttons.length]?.focus();
   }
  };
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[phase,game.mode,muted]);

 function start(){setRound(createRound(game.mode,seed,lockedDifficulty??difficulty,1,challenge));setPhase('playing');delivered.current=false;setAttempt(n=>n+1);}
 function finish(){
  if(delivered.current)return;delivered.current=true;
  try{const key='o-rei:minigame-log';const log=JSON.parse(localStorage.getItem(key)??'[]');localStorage.setItem(key,JSON.stringify([...log,{...result,attempt}].slice(-100)))}catch{}
  onFinish(result);
 }
 const result=roundResult(round,`${context}:${game.id}:${seed}`,context);
 const previewIndex=Math.floor(round.elapsed/(difficulty==='easy'?850:difficulty==='hard'?450:650));
 const width=targetWidth(round);
 const pass=passWindow(round);
 const passMarker=passMarkerAt(round);
 const available=ready&&round.elapsed>=round.lockUntil;
 const directionLabels=['Esquerda','No meio','Direita'];
 const keeperCue=directionLabels[round.board[0]]??directionLabels[1];
 const passGoals=round.matched.filter(value=>value===1).length;
 const button=(i:number,label:string|number,active=false,unavailable=false)=><button key={i} className={active?'lit':''} onClick={()=>choose(i)} disabled={!ready||phase!=='playing'||unavailable} aria-label={game.mode==='code'?`Número ${label}`:`Casa ${i+1}: ${label}`}>{label}</button>;
 const tutorials:Partial<Record<MiniGameDefinition['mode'],string>>={
  shot:'Leia a preparação do goleiro e escolha um dos três cantos. A pista pode enganar: uma boa Finalização melhora sua leitura, mas não garante onde ele vai.',
  montyHall:'Escolha uma das três chuteiras. Uma opção vazia será revelada; então decida entre ficar com a sua ou trocar pela outra que continuou fechada.',
  throughPass:'Faça dois gols em até três tentativas. Solte o passe quando seu atacante entrar no corredor livre entre os defensores. Clique no botão ou use Espaço.',
  ticTacToe:'Conecte quatro peças em um tabuleiro 5×5. Você joga com X. No primeiro empate o rival começa um novo tabuleiro; no segundo, você vence.',
  cups:'A bola aparece sob um dos quatro copos. Acompanhe as trocas e escolha o copo que a esconde.',
  code:'São três etapas. Revele e memorize cinco números diferentes, depois digite a sequência. O tempo para observar diminui a cada etapa.',
  pairs:'Memorize os oito pares no início. Vire duas cartas por vez; cinco erros encerram a tentativa.',
  maze:'Memorize a rota iluminada. Depois escolha cada casa do caminho, do início até o gol.',
 };
 const tutorial=tutorials[game.mode]??game.tutorial;

 return <div className={isTraining?'arena-overlay':'arena-inline'} role={isTraining?'dialog':'region'} aria-modal={isTraining?true:undefined} aria-label={game.name}>
  <section className="arena">
   <header><small>{isTraining?'CENTRO DE TREINAMENTO':'DECISÃO DA CARREIRA'}</small><h2>{game.name}</h2>{onClose&&<button onClick={onClose}>Voltar ×</button>}</header>
   {phase==='tutorial'?<>
    <p>{game.description}</p><p>{tutorial}</p>
    <p>Toque ou clique para jogar. Use Tab e Enter nos botões, setas nos tabuleiros e Espaço para parar o marcador. Esc pausa.</p>
    {(game.mode==='timing'||game.mode==='goldZone')&&challenge?.finishing!==undefined&&<p className="arena-attribute-note">{challenge.attributeLabel??"Finalização"} {challenge.finishing}: seus atributos influenciam a faixa de acerto desta decisão.</p>}
    {game.mode==='cups'&&challenge?.speed!==undefined&&<p className="arena-attribute-note">Velocidade {challenge.speed}: atletas rápidos acompanham uma troca a menos a partir de 80.</p>}
    {isTraining?<label>Dificuldade <select value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}><option value="easy">Fácil</option><option value="standard">Normal</option><option value="hard">Difícil</option></select></label>:<p className="arena-context"><strong>Pressão da decisão:</strong> {difficultyLabel(difficulty)}. Ela é definida pelo adversário e pelo tamanho da competição.</p>}
    <button className="button button-primary" autoFocus onClick={start}>COMEÇAR</button>
   </>:phase==='result'?<div className={`arena-result ${round.won?'arena-won':'arena-lost'}`} aria-live="polite">
    <strong>{round.won?'DECISÃO VENCIDA':'DECISÃO PERDIDA'}</strong><p>{round.feedback}</p><p>{round.errors} erros · {(result.elapsedMs/1000).toFixed(1)} segundos · pressão {difficultyLabel(difficulty)}</p>
    {isTraining&&<button onClick={start}>TENTAR NOVAMENTE</button>}<button className="button button-primary" onClick={finish}>CONFIRMAR RESULTADO</button>
   </div>:<>
    <div className="arena-toolbar"><span>{game.mode==='code'?`Etapa ${round.round} de 3`:game.mode==='throughPass'?`Tentativa ${round.round} de 3`:game.mode==='montyHall'?(round.input.length?'Ficar ou trocar':'Escolha uma chuteira'):round.draws?`Novo tabuleiro · ${round.draws} empate`:'Decisão única'} · {round.awaitingReveal?'PREPARE-SE':ready?'SUA VEZ':'OBSERVE'}</span><b>{Math.max(0,Math.ceil((round.limit-round.elapsed)/1000))}s</b><button onClick={()=>setPhase(p=>p==='paused'?'playing':'paused')}>{phase==='paused'?'RETOMAR':'PAUSAR'}</button><button aria-pressed={!muted} onClick={()=>setMuted(v=>!v)}>Som {muted?'desligado':'ligado'}</button></div>
    {phase==='paused'?<div className="arena-paused"><h3>Jogo pausado</h3><p>O relógio e a jogada estão preservados.</p><button onClick={()=>setPhase('playing')}>RETOMAR</button></div>:<div className="arena-play" ref={grid}>
     {(game.mode==='timing'||game.mode==='goldZone')&&<><div className="arena-track"><div className="arena-timing-segments" aria-hidden="true">{Array.from({length:14},(_,i)=><span key={i}/>)}</div><i style={{left:`${50-width/2}%`,width:`${width}%`}}/><b style={{left:`${markerAt(round)}%`}}/></div><button className="button button-primary" onClick={()=>choose(0)}>PARAR · ESPAÇO</button></>}
     {game.mode==='shot'&&<div className="arena-shot">
      <p className="arena-shot-cue">O goleiro prepara o corpo para <strong>{keeperCue.toLowerCase()}</strong>. Escolha o canto do chute.</p>
      <div className="arena-shot-goal" role="img" aria-label={`Pista visual: goleiro indica ${keeperCue.toLowerCase()}`}><div className="arena-goal-net"/>{directionLabels.map((side,i)=><div className="arena-shot-lane" key={side}>{i===round.board[0]&&<span className="arena-keeper" aria-hidden="true"><i/><b/></span>}</div>)}</div>
      <div className="arena-shot-options arena-grid cols3">{directionLabels.map((side,i)=><button key={side} disabled={!available} onClick={()=>choose(i)} aria-label={`Chutar ${side.toLowerCase()}`}><span aria-hidden="true">{['↖','↑','↗'][i]}</span><b>{side}</b><small>Tecla {i+1}</small></button>)}</div>
      <p className="arena-choice-note">{challenge?.finishing!==undefined?`Finalização ${challenge.finishing} influencia a leitura. `:''}A preparação é uma pista, não uma certeza.</p>
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
     {game.mode==='cups'&&<div className="arena-cups">{cupPositions(round).map((position,id)=><button key={id} style={{left:`${position*25}%`,transitionDuration:`${cupSwapDuration(round)}ms`}} disabled={!ready} onClick={()=>choose(id)} aria-label={`Copo ${id+1}`}>{round.elapsed<1000&&id===round.target?'⚽':'▰'}<small>{id+1}</small></button>)}</div>}
     {game.mode==='pairs'&&<div className="arena-grid cols4">{round.board.map((v,i)=>button(i,!ready||round.open.includes(i)||round.matched.includes(i)?icons[v]:'?',round.matched.includes(i),round.open.includes(i)||round.matched.includes(i)))}</div>}
     {game.mode==='puzzle'&&<div className="arena-grid cols3">{round.board.map((v,i)=>button(i,v||'◇',!v))}</div>}
     {game.mode==='maze'&&<div className="arena-grid cols5">{round.board.map((_,i)=>button(i,i===24?'🥅':i===(round.input.at(-1)??0)?'⚽':'·',!ready&&round.sequence.includes(i)||round.input.includes(i)))}</div>}
     {game.mode==='ticTacToe'&&<div className="arena-grid cols5">{round.board.map((v,i)=>button(i,v===1?'X':v===2?'O':'·',v===1,Boolean(v)))}</div>}
     {game.mode==='pressureMap'&&<div className="arena-grid cols3">{Array.from({length:9},(_,i)=>button(i,i+1,!ready&&round.sequence[previewIndex]===i))}</div>}
     {game.mode==='ballTrack'&&<div className="arena-grid cols3">{Array.from({length:6},(_,i)=>button(i,!ready&&round.sequence[previewIndex]===i?'⚽':i+1,!ready&&round.sequence[previewIndex]===i))}</div>}
    </div>}
    <p role="status">{round.feedback} {round.errors>0?`Erros: ${round.errors}/${mistakeLimit(round)}`:''}</p>
   </>}
  </section>
 </div>;
}
