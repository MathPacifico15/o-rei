import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MiniGameArena} from '../components/minigame-arena';
import {minigames, type MiniGameDefinition} from '../game/minigames';
import {worldMatchDifficulty} from '../game/world-tournaments';
import type {Difficulty} from '../game/minigame-engine';
import '../app/globals.css';
import '../app/minigames.css';
import '../components/minigame-arena.css';
import '../components/minigame-features.css';
import './lab.css';

type TournamentId='wc'|'cwc';
type Tournament={id:TournamentId;name:string;phases:string[];rivals:string[];base:Difficulty};
const tournaments:Record<TournamentId,Tournament>={
  wc:{id:'wc',name:'Copa do Mundo',phases:['Grupo · jogo 1','Grupo · jogo 2','Grupo · jogo 3','16-avos de final','Oitavas de final','Quartas de final','Semifinal','Final'],rivals:['Japão','Nigéria','México','Uruguai','Croácia','Inglaterra','França','Argentina'],base:'easy'},
  cwc:{id:'cwc',name:'Super Mundial de Clubes',phases:['Grupo · jogo 1','Grupo · jogo 2','Grupo · jogo 3','Oitavas de final','Quartas de final','Semifinal','Final'],rivals:['Seul Aurora','Tânger Atlas','Monterrey Azul','Londres Athletic','Milano Rosso','Paris Étoile','Buenos Aires Norte'],base:'standard'},
};
type Campaign={game:MiniGameDefinition;tournament:Tournament;index:number;wins:number;outcomes:boolean[];done?:'champion'|'eliminated'};

function Lab(){
 const [selected,setSelected]=useState<MiniGameDefinition|null>(null);
 const [campaign,setCampaign]=useState<Campaign|null>(null);
 const [seed,setSeed]=useState(()=>Date.now());
 const [key,setKey]=useState(0);
 const complete=(won:boolean)=>{
   if(!campaign)return;
   const outcomes=[...campaign.outcomes,won],wins=campaign.wins+Number(won),index=campaign.index;
   if(index===2&&wins<2){setCampaign({...campaign,outcomes,wins,done:'eliminated'});return;}
   if(index>=3&&!won){setCampaign({...campaign,outcomes,wins,done:'eliminated'});return;}
   if(index===campaign.tournament.phases.length-1){setCampaign({...campaign,outcomes,wins,done:'champion'});return;}
   setCampaign({...campaign,outcomes,wins,index:index+1});setKey(value=>value+1);
 };
 if(campaign){
   const {game,tournament,index}=campaign;
   const difficulty=worldMatchDifficulty(tournament.base,index);
   if(campaign.done)return <main className="lab-shell"><section className="lab-head"><small>{tournament.name.toUpperCase()} · CAMPANHA ENCERRADA</small><h1>{campaign.done==='champion'?'CAMPEÃO MUNDIAL.':'CAMPANHA ENCERRADA.'}</h1><p>{campaign.outcomes.map((won,match)=>`${tournament.phases[match]}: ${won?'vitória':'derrota'}`).join(' · ')}</p><button onClick={()=>setCampaign(null)}>VOLTAR AO CATÁLOGO</button></section></main>;
   const Phase=({match}:{match:number})=>{const phase=tournament.phases[match];return <li className={match===index?'active':match<index?'done':''}>{match<campaign.outcomes.length?(campaign.outcomes[match]?'✓':'×'):String(match+1).padStart(2,'0')} {phase}</li>};
   const playableDifficulty=difficulty==='hard'?'hard':'standard';
   return <main className="lab-shell"><div className="lab-bar"><button onClick={()=>setCampaign(null)}>← Catálogo</button><span>{index+1}/{tournament.phases.length} partidas · dificuldade {playableDifficulty==='hard'?'máxima':'normal'}</span></div><section className="lab-campaign"><small>{tournament.name.toUpperCase()} · CAMPANHA COMPLETA</small><h1>{tournament.phases[index]}</h1><p>{tournament.id==='wc'?'Brasil':'Seu clube'} × {tournament.rivals[index]} · o mesmo minijogo fica ativo até a final.</p><div className="campaign-flow"><ol className="campaign-track">{tournament.phases.map((_,match)=><Phase key={tournament.phases[match]} match={match}/>)}</ol></div><p className="lab-note">A trilha fica visível; após o primeiro jogo, as fases seguem sem pausas.</p></section><MiniGameArena key={`${game.id}-${tournament.id}-${index}-${key}`} game={game} seed={seed+index*101} context={`laboratorio:${tournament.id}:${index}`} difficulty={playableDifficulty} challenge={{stakes:'high',campaignRound:index+1,identity:'skill',finishing:72,speed:76}} onClose={()=>setCampaign(null)} onFinish={result=>complete(result.won)} autoAdvance autoStart={index>0}/></main>;
 }
 if(selected)return <main className="lab-shell"><div className="lab-bar"><button onClick={()=>setSelected(null)}>← Catálogo</button><label>Semente <input type="number" value={seed} onChange={e=>setSeed(Math.max(0,Number(e.target.value)||0))}/></label></div><MiniGameArena key={key} game={selected} seed={seed} context="laboratorio:treino" onClose={()=>setSelected(null)} onFinish={()=>{setSeed(value=>(value*1664525+1013904223)>>>0);setKey(v=>v+1)}}/></main>;
 return <main className="lab-shell"><header className="lab-head"><small>O REI · BRANCH REA-MAGGIO-GAMES-N-FEATURES</small><h1>Laboratório de minijogos</h1><p>Treino isolado: nenhum resultado altera uma carreira.</p></header><section className="lab-grid">{minigames.map((game,i)=><article className="lab-card" key={game.id}><span>{String(i+1).padStart(2,'0')}</span><small>{game.exclusive?'MUNDIAIS':'CARREIRA'}</small><b>{game.name}</b><p>{game.description}</p>{game.exclusive?<div className="lab-exclusive-actions"><button onClick={()=>setCampaign({game,tournament:tournaments.wc,index:0,wins:0,outcomes:[]})}>Copa do Mundo · 8 jogos</button><button onClick={()=>setCampaign({game,tournament:tournaments.cwc,index:0,wins:0,outcomes:[]})}>Super Mundial · 7 jogos</button></div>:<button onClick={()=>setSelected(game)}>Abrir desafio →</button>}</article>)}</section></main>;
}
createRoot(document.getElementById('root')!).render(<Lab/>);
