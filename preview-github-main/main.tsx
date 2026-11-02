import React,{useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MiniGame} from '@/app/page';
import {minigames,type MiniGameDefinition} from '@/game/minigames';
import type {SeasonResult} from '@/game/types';
import '@/app/minigames.css';
import '@/app/final-tweaks.css';
import '../preview-games/lab.css';

type TournamentId='wc'|'cwc';
type Tournament={id:TournamentId;name:string;phases:string[];rivals:string[];difficulty:NonNullable<MiniGameDefinition['difficulty']>};
const tournaments:Record<TournamentId,Tournament>={
 wc:{id:'wc',name:'Copa do Mundo',phases:['Grupo · jogo 1','Grupo · jogo 2','Grupo · jogo 3','16-avos de final','Oitavas de final','Quartas de final','Semifinal','Final'],rivals:['Japão','Nigéria','México','Uruguai','Croácia','Inglaterra','França','Argentina'],difficulty:'easy'},
 cwc:{id:'cwc',name:'Super Mundial de Clubes',phases:['Grupo · jogo 1','Grupo · jogo 2','Grupo · jogo 3','Oitavas de final','Quartas de final','Semifinal','Final'],rivals:['Seul Aurora','Tânger Atlas','Monterrey Azul','Londres Athletic','Milano Rosso','Paris Étoile','Buenos Aires Norte'],difficulty:'standard'},
};
type Campaign={game:MiniGameDefinition;tournament:Tournament;index:number;outcomes:boolean[];finished?:'champion'|'eliminated'};

function campaignResult(c:Campaign):SeasonResult{
 const {tournament,index,outcomes}=c;
 const matches=tournament.phases.map((phase,matchIndex)=>({phase,opponentName:tournament.rivals[matchIndex],result:(matchIndex<outcomes.length?(outcomes[matchIndex]?'won':'lost'):'pending') as 'won'|'lost'|'pending',playable:true,difficulty:matchIndex+1}));
 const group=c.outcomes.slice(0,3),points=group.filter(Boolean).length*3;
 return {season:2026,games:0,goals:0,assists:0,cleanSheets:0,injuryWeeks:0,events:[],finalOpportunity:true,cupFinal:{competitionId:tournament.id,competitionName:tournament.name,opponentClubId:`lab-${index}`,opponentClubName:tournament.rivals[index],stakes:'campaign',scope:tournament.id==='wc'?'national':'club',campaignId:`main-lab-${tournament.id}`,campaignMatchIndex:index,campaignDifficulty:index+1,worldCupDifficulty:tournament.id==='wc'?tournament.difficulty:undefined},campaigns:[{id:`main-lab-${tournament.id}`,competitionId:tournament.id,competitionName:tournament.name,category:tournament.id==='wc'?'national':'world',qualification:{competitionId:tournament.id,source:'campanha de teste'},status:'active',phase:tournament.phases[index],matches,prize:0,groupTable:[{name:tournament.id==='wc'?'Brasil':'Clube do jogador',points,goalDifference:group.filter(Boolean).length*2-group.filter(v=>!v).length,goalsFor:group.filter(Boolean).length*2,position:points>=6?1:points>=3?2:3},{name:'Rivais do grupo',points:4,goalDifference:0,goalsFor:3,position:1}] }]};
}

function Lab(){
 const [selected,setSelected]=useState<MiniGameDefinition|null>(null);
 const [campaign,setCampaign]=useState<Campaign|null>(null);
 const [notice,setNotice]=useState('');
 const result=useMemo(()=>campaign?campaignResult(campaign):null,[campaign]);
 function resolveCampaign(won:boolean){
  if(!campaign)return;
  const outcomes=[...campaign.outcomes,won],index=campaign.index;
  const groupEnded=index===2,qualified=outcomes.slice(0,3).filter(Boolean).length>=2;
  const knockout=index>=3;
  if(groupEnded&&!qualified){setCampaign({...campaign,outcomes,finished:'eliminated'});return;}
  if(knockout&&!won){setCampaign({...campaign,outcomes,finished:'eliminated'});return;}
  if(index===campaign.tournament.phases.length-1){setCampaign({...campaign,outcomes,finished:'champion'});return;}
  setCampaign({...campaign,outcomes,index:index+1});
 }
 if(campaign){
  const {tournament,index}=campaign;
  const stageGame={...campaign.game,rounds:index+1,difficulty:tournament.difficulty};
  if(campaign.finished)return <main className="lab-shell"><section className="lab-head"><small>{tournament.name.toUpperCase()} · CAMPANHA CONCLUÍDA</small><h1>{campaign.finished==='champion'?'Você chegou ao título.':'A campanha terminou.'}</h1><p>{campaign.outcomes.map((won,matchIndex)=>`${tournament.phases[matchIndex]}: ${won?'vitória':'derrota'}`).join(' · ')}</p><button className="button button-primary" onClick={()=>{setCampaign(null);setNotice('Campanha encerrada.')}}>VOLTAR AO CATÁLOGO</button></section></main>;
  return <main className="lab-shell"><div className="lab-bar"><button onClick={()=>setCampaign(null)}>← Catálogo</button><span>{index+1}/{tournament.phases.length} partidas</span></div><section className="lab-campaign"><small>{tournament.name.toUpperCase()} · CAMPANHA DA MAIN</small><h1>{tournament.phases[index]}</h1><p>{tournament.id==='wc'?'Brasil':'Clube do jogador'} × {tournament.rivals[index]} · <b>Nível {index+1}</b>: a modalidade exclusiva é a mesma, mas fica mais exigente a cada fase.</p><ol>{tournament.phases.map((phase,matchIndex)=><li key={phase} className={matchIndex===index?'active':matchIndex<index?'done':''}>{matchIndex<campaign.outcomes.length?(campaign.outcomes[matchIndex]?'✓':'×'):String(matchIndex+1).padStart(2,'0')} {phase}</li>)}</ol><p className="lab-note">Formato da main: Copa do Mundo = 3 grupos + 16-avos + oitavas + quartas + semifinal + final; Super Mundial = 3 grupos + oitavas + quartas + semifinal + final. O jogo recebe <b>rounds={index+1}</b>, reduzindo a janela ou ampliando a sequência/rota conforme a modalidade.</p></section><MiniGame key={`${campaign.game.id}-${tournament.id}-${index}`} game={stageGame} result={result} playerNationality="Brasil" score={0} onScore={()=>undefined} onRestart={()=>setCampaign({...campaign})} onFinish={resolveCampaign} autoStart/></main>;
 }
 if(selected)return <main className="lab-shell"><div className="lab-bar"><button onClick={()=>setSelected(null)}>← Catálogo</button><span>{notice}</span></div><MiniGame game={selected} result={null} playerNationality="Brasil" score={0} onScore={()=>undefined} onRestart={()=>setSelected({...selected})} onFinish={won=>{setNotice(won?'Resultado: vitória.':'Resultado: derrota.');setSelected(null)}} autoStart/></main>;
 return <main className="lab-shell"><header className="lab-head"><small>O REI · GITHUB ORIGIN/MAIN · FDD0602</small><h1>Laboratório de minijogos</h1><p>{notice||'Treino isolado da main remota: nenhum resultado altera uma carreira.'}</p></header><section className="lab-grid">{minigames.map((game,i)=><article className="lab-card" key={game.id}><span>{String(i+1).padStart(2,'0')}</span><small>{game.exclusive?'CAMPANHAS MUNDIAIS':'CARREIRA'}</small><b>{game.name}</b><p>{game.exclusive?'A mesma modalidade fica travada na campanha; as fases elevam rounds e, com isso, a exigência.':game.description}</p>{game.exclusive?<div className="lab-exclusive-actions"><button onClick={()=>setCampaign({game,tournament:tournaments.wc,index:0,outcomes:[]})}>Copa do Mundo · 8 jogos</button><button onClick={()=>setCampaign({game,tournament:tournaments.cwc,index:0,outcomes:[]})}>Super Mundial · 7 jogos</button></div>:<button onClick={()=>setSelected(game)}>Abrir desafio →</button>}</article>)}</section></main>;
}
createRoot(document.getElementById('root')!).render(<Lab/>);
