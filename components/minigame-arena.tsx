import {useEffect,useRef,useState} from 'react';
import type {MiniGameDefinition} from '@/game/minigames';
import {actRound,createRound,cupPositions,markerAt,roundResult,tickRound,tuning,validRound,type Difficulty,type MiniResult,type Round} from '@/game/minigame-engine';
import {difficultyLabel} from '@/game/minigame-context';
import './minigame-arena.css';
const icons=['⚽','👟','🏆','⭐','🧤','🎯','🟨','🥅'];
export function MiniGameArena({game,seed=2026,context='treino',difficulty:lockedDifficulty,onFinish,onClose}:{game:MiniGameDefinition;seed?:number;context?:string;difficulty?:Difficulty;onFinish:(r:MiniResult)=>void;onClose?:()=>void}){
 const isTraining=context==='treino';
 const defaultDifficulty:Difficulty=lockedDifficulty ?? (game.difficulty==='easy'?'easy':game.difficulty==='hard'||game.difficulty==='veryHard'?'hard':'standard');
 const [difficulty,setDifficulty]=useState<Difficulty>(defaultDifficulty);
 const [round,setRound]=useState(()=>createRound(game.mode,seed,difficulty));const[phase,setPhase]=useState<'tutorial'|'playing'|'paused'|'result'>('tutorial');const[attempt,setAttempt]=useState(0);const delivered=useRef(false);const[muted,setMuted]=useState(true);const grid=useRef<HTMLDivElement>(null);
 const ready=round.elapsed>=round.preview;
 const storageKey=`o-rei:attempt:${context}:${game.id}:${seed}`;
 const [restored,setRestored]=useState(false);
 const snapshot=useRef({round,phase,difficulty});snapshot.current={round,phase,difficulty};
 useEffect(()=>{
   if(context!=='treino')try{const saved=JSON.parse(localStorage.getItem(storageKey)??'null');
     if(saved&&validRound(saved.round)&&saved.round.seed===seed&&saved.round.mode===game.mode&&['easy','standard','hard'].includes(saved.difficulty)){
       setRound(saved.round as Round);setDifficulty(lockedDifficulty ?? saved.difficulty);setPhase(saved.round.done?'result':saved.phase==='tutorial'?'tutorial':'paused');
     }
   }catch{/* Ignore only this damaged attempt; preserve the career. */}
   setRestored(true);
 },[storageKey,lockedDifficulty]);
 useEffect(()=>{
   if(!restored||context==='treino')return;
   const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(snapshot.current))}catch{}};
   save();const timer=setInterval(save,750);window.addEventListener('pagehide',save);
   return()=>{clearInterval(timer);window.removeEventListener('pagehide',save);save()};
 },[restored,storageKey,phase]);
 useEffect(()=>{if(phase!=='playing')return;let frame=0,last=performance.now();const run=(now:number)=>{const delta=now-last;last=now;setRound(s=>tickRound(s,delta));frame=requestAnimationFrame(run)};frame=requestAnimationFrame(run);return()=>cancelAnimationFrame(frame)},[phase]);
 useEffect(()=>{if(round.done)setPhase('result')},[round.done]);
 useEffect(()=>{const pause=()=>{if(document.hidden)setPhase(p=>p==='playing'?'paused':p)};document.addEventListener('visibilitychange',pause);return()=>document.removeEventListener('visibilitychange',pause)},[]);
 function choose(value:number){if(phase!=='playing')return;setRound(s=>actRound(s,value));if(!muted){try{const audio=new AudioContext(),osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);gain.gain.value=.025;osc.frequency.value=440;osc.start();osc.stop(audio.currentTime+.045);osc.onended=()=>{void audio.close()}}catch{/* Optional audio. */}}}
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setPhase(p=>p==='playing'?'paused':p==='paused'?'playing':p);return}if(phase!=='playing')return;if((game.mode==='timing'||game.mode==='goldZone')&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();choose(0);return}if(game.mode==='code'&&/^[1-9]$/.test(e.key)){e.preventDefault();choose(Number(e.key));return}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){const buttons=Array.from(grid.current?.querySelectorAll<HTMLButtonElement>('button')??[]);if(!buttons.length)return;e.preventDefault();const cols=game.mode==='maze'||game.mode==='ticTacToe'?5:game.mode==='pairs'?4:3,index=buttons.indexOf(document.activeElement as HTMLButtonElement),delta=e.key==='ArrowUp'?-cols:e.key==='ArrowDown'?cols:e.key==='ArrowLeft'?-1:1;buttons[(Math.max(0,index)+delta+buttons.length)%buttons.length]?.focus()}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[phase,game.mode,muted]);
 function start(){setRound(createRound(game.mode,seed,lockedDifficulty ?? difficulty));setPhase('playing');delivered.current=false;setAttempt(n=>n+1)}
 const result=roundResult(round,`${context}:${game.id}:${seed}`,context);
 const previewIndex=Math.floor(round.elapsed/(difficulty==='easy'?850:difficulty==='hard'?450:650));
 const button=(i:number,label:string|number,active=false)=> <button key={i} className={active?'lit':''} onClick={()=>choose(i)} disabled={!ready||phase!=='playing'} aria-label={`Casa ${i+1}: ${label}`}>{label}</button>;
 return <div className={isTraining?'arena-overlay':'arena-inline'} role={isTraining?'dialog':'region'} aria-modal={isTraining?true:undefined} aria-label={game.name}><section className="arena"><header><small>{isTraining?'CENTRO DE TREINAMENTO':'DECISÃO DA CARREIRA'}</small><h2>{game.name}</h2>{onClose&&<button onClick={onClose}>Voltar ×</button>}</header>
 {phase==='tutorial'?<><p>{game.description}</p><p>{game.mode==='ticTacToe'?'Conecte quatro peças em um tabuleiro 5×5. Você joga com X; um empate encerra sem vitória.':game.mode==='cups'?'A bola aparece sob um copo. Acompanhe as trocas e escolha o copo que a esconde.':game.mode==='code'?'Memorize cinco números e repita a sequência em três etapas. Só após a terceira etapa há resultado.':game.mode==='pairs'?'Encontre os oito pares. Observe o tabuleiro e escolha duas cartas por vez. A dificuldade ajusta o limite de erros.':game.mode==='maze'?'Memorize a rota iluminada. Depois escolha cada casa do caminho, do início até o gol.':game.tutorial}</p><p>Toque ou clique para jogar. Use Tab e Enter nos botões, setas nos tabuleiros e Espaço para parar o marcador. Esc pausa.</p>{isTraining?<label>Dificuldade <select value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}><option value="easy">Fácil</option><option value="standard">Normal</option><option value="hard">Difícil</option></select></label>:<p className="arena-context"><strong>Pressão da decisão:</strong> {difficultyLabel(difficulty)}. Ela é definida pelo adversário e pelo tamanho da competição.</p>}<button className="button button-primary" autoFocus onClick={start}>COMEÇAR</button></>:phase==='result'?<div className={`arena-result ${round.won?'arena-won':'arena-lost'}`} aria-live="polite"><strong>{round.won?'DECISÃO VENCIDA':'DECISÃO PERDIDA'}</strong><p>{round.feedback}</p><p>{round.errors} erros · {(round.elapsed/1000).toFixed(1)} segundos · pressão {difficultyLabel(difficulty)}</p>{isTraining&&<button onClick={start}>TENTAR NOVAMENTE</button>}<button className="button button-primary" onClick={()=>{if(delivered.current)return;delivered.current=true;try{const key='o-rei:minigame-log';const log=JSON.parse(localStorage.getItem(key)??'[]');localStorage.setItem(key,JSON.stringify([...log,{...result,attempt}].slice(-100)))}catch{}onFinish(result)}}>CONFIRMAR RESULTADO</button></div>:<><div className="arena-toolbar"><span>{game.mode==='code'?`Etapa ${round.round} de 3`:'Decisão única'} · {ready?'SUA VEZ':'OBSERVE'}</span><b>{Math.max(0,Math.ceil((round.limit-round.elapsed)/1000))}s</b><button onClick={()=>setPhase(p=>p==='paused'?'playing':'paused')}>{phase==='paused'?'RETOMAR':'PAUSAR'}</button><button aria-pressed={!muted} onClick={()=>setMuted(v=>!v)}>Som {muted?'desligado':'ligado'}</button></div>
 {phase==='paused'?<div className="arena-paused"><h3>Jogo pausado</h3><p>O relógio e a jogada estão preservados.</p><button onClick={()=>setPhase('playing')}>RETOMAR</button></div>:<div className="arena-play" ref={grid}>
 {(game.mode==='timing'||game.mode==='goldZone')&&<><div className="arena-track"><i style={{left:`${50-tuning[difficulty].width*(game.mode==='goldZone'?.7:1)/2}%`,width:`${tuning[difficulty].width*(game.mode==='goldZone'?.7:1)}%`}}/><b style={{left:`${markerAt(round)}%`}}/></div><button className="button button-primary" onClick={()=>choose(0)}>PARAR · ESPAÇO</button></>}
 {game.mode==='code'&&<><div className="arena-code">{ready?round.input.join('').padEnd(5,'·'):round.sequence.join('')}</div><div className="arena-grid cols3">{Array.from({length:9},(_,i)=>button(i+1,i+1))}</div></>}
 {game.mode==='cups'&&<div className="arena-cups">{cupPositions(round).map((position,id)=><button key={id} style={{left:`${position*25}%`}} disabled={!ready} onClick={()=>choose(id)} aria-label={`Copo ${id+1}`}>{round.elapsed<1000&&id===round.target?'⚽':'▰'}<small>{id+1}</small></button>)}</div>}
 {game.mode==='pairs'&&<div className="arena-grid cols4">{round.board.map((v,i)=>button(i,!ready||round.open.includes(i)||round.matched.includes(i)?icons[v]:'?',round.matched.includes(i)))}</div>}
 {game.mode==='puzzle'&&<div className="arena-grid cols3">{round.board.map((v,i)=>button(i,v||'◇',!v))}</div>}
 {game.mode==='maze'&&<div className="arena-grid cols5">{round.board.map((_,i)=>button(i,i===24?'🥅':i===(round.input.at(-1)??0)?'⚽':'·',!ready&&round.sequence.includes(i)||round.input.includes(i)))}</div>}
 {game.mode==='ticTacToe'&&<div className="arena-grid cols5">{round.board.map((v,i)=>button(i,v===1?'X':v===2?'O':'·',v===1))}</div>}
 {game.mode==='pressureMap'&&<div className="arena-grid cols3">{Array.from({length:9},(_,i)=>button(i,i+1,!ready&&round.sequence[previewIndex]===i))}</div>}
 {game.mode==='ballTrack'&&<div className="arena-grid cols3">{Array.from({length:6},(_,i)=>button(i,!ready&&round.sequence[previewIndex]===i?'⚽':i+1,!ready&&round.sequence[previewIndex]===i))}</div>}
 </div>}<p role="status">{round.feedback} {round.errors>0?`Erros: ${round.errors}/${tuning[difficulty].errors}`:''}</p></>}
 </section></div>
}
