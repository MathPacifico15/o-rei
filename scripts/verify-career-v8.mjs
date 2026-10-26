import assert from 'node:assert/strict';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true}});
let checks=0;const check=(value,message)=>{assert.ok(value,message);checks++};
try{
 const engine=await server.ssrLoadModule('/game/engine.ts'),{clubs,competitions}=await server.ssrLoadModule('/game/catalog.ts');
 const persistence=await server.ssrLoadModule('/game/persistence.ts'),games=await server.ssrLoadModule('/game/minigame-engine.ts'),{minigames}=await server.ssrLoadModule('/game/minigames.ts');
 const events=await server.ssrLoadModule('/game/career-events.ts'),economy=await server.ssrLoadModule('/game/economy.ts'),history=await server.ssrLoadModule('/game/career-history.ts'),context=await server.ssrLoadModule('/game/minigame-context.ts');
 function fixture(position='ATA') {const club=clubs.find(c=>c.id==='santos')??clubs[0];const player={id:'test',name:'Teste',nationality:'Brasil',position,preferredFoot:'Direito',heightCm:180,shirtNumber:9,age:16,clubId:club.id,attributes:engine.baseAttributes(),form:68,fame:3,salary:16700,marketValue:400000,games:0,goals:0,assists:0,cleanSheets:0,saves:0,titles:[],awards:[],clubIdolatry:{[club.id]:12},judasAt:[],injuries:0};return {seed:187,season:2026,player,history:[],clubHistory:[{clubId:club.id,titles:[]}],currentCompetition:'Liga',mode:'normal',balance:2000000,contract:{clubId:club.id,monthlySalary:16700,seasonsRemaining:3,role:'titular',expectedMinutes:72},leagueAssignments:Object.fromEntries(clubs.map(c=>[c.id,c.leagueId])),leagueTables:{},shop:{ownedPermanent:[],activeSeasonal:[],freeUses:[]},nationalTeam:{games:0,goals:0,assists:0,titles:[]},originCountry:club.country,highestOvr:56,saveVersion:7};}
 const initial=fixture(),raw=JSON.stringify(initial);check(persistence.decodeSave(raw).career.saveVersion===8,'migration v7');
 const storage=new Map();const adapter={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
 persistence.writeSave(adapter,{version:8,career:initial});persistence.writeSave(adapter,{version:8,career:{...initial,balance:25}});storage.set(persistence.SAVE_KEY,'broken');check(persistence.readSave(adapter).save.career.balance===initial.balance,'backup recovery');check(storage.get(persistence.SAVE_KEY)==='broken','do not destroy damaged save');
 check(events.everydayEvents.length>=80,'80 original events');
 assert.throws(()=>persistence.decodeSave(JSON.stringify({...initial,shop:{activeSeasonal:null}})));checks++;
 assert.throws(()=>persistence.decodeSave(JSON.stringify({...initial,player:{...initial.player,form:null}})));checks++;
 let state=initial;for(let season=0;season<25;season++){
  const before=structuredClone(state),out=engine.simulateSeason(state);check(JSON.stringify(state)===JSON.stringify(before),'simulation immutable');state=out.state;
  check(out.result.events.length>=2&&out.result.events.length<=4,'2–4 events');
  const blocked=new Set(before.history.slice(-3).flatMap(s=>s.events.map(e=>e.id)));check(out.result.events.every(e=>!blocked.has(e.id)),'3 season cooldown');
  const table=state.leagueTables[out.result.leagueId];check(table.entries.every(e=>e.points===3*e.wins+e.draws),'points explained');
  check(table.entries.reduce((n,e)=>n+e.goalsFor,0)===table.entries.reduce((n,e)=>n+e.goalsAgainst,0),'league scores balance');
  check(out.result.leaguePosition!==1||out.result.titles.includes(out.result.leagueName),'league title from table');
  check(!out.result.finals.some(f=>f.stakes==='titleAndPromotion'),'no invented league final');
  check(state.player.games===state.history.reduce((n,s)=>n+s.games,0),'career totals');
  check(persistence.decodeSave(JSON.stringify({version:8,career:state})).career.season===state.season,'career migration at every year');
 }
 check(engine.shouldRetire(state.player,state.seed),'career reaches retirement');
 const bought=economy.purchaseProduct(initial,'psicologo');check(bought.shop.ownedPermanent.includes('psicologo'),'psychologist permanent');check(bought.financialLedger[0].amount===-480000,'audit purchase');assert.throws(()=>economy.purchaseProduct(bought,'psicologo'));checks++;
 const supplement=economy.purchaseProduct(initial,'suplementacao');const first=engine.simulateSeason(supplement).state;check(first.shop.activeSeasonal.includes('suplementacao'),'two-season item retained');check(!engine.simulateSeason(first).state.shop.activeSeasonal.includes('suplementacao'),'two-season item expires');
 const a=engine.simulateSeason(initial),b=engine.simulateSeason(bought);check(b.state.player.form>=a.state.player.form,'psychologist boosts form');
 const offer={clubId:clubs[1].id,monthlySalary:10000,seasons:2,role:'titular',expectedMinutes:70,idolatryChange:-2},market={...initial,marketWindow:{season:2026,offers:[offer],renewal:offer}};
 const negotiated=history.negotiateOffer(market,offer.clubId,()=>0).state;check(negotiated.marketWindow.offers[0].monthlySalary===11200,'negotiation');check(history.negotiateOffer(negotiated,offer.clubId,()=>0).state===negotiated,'negotiation once');
 const base={season:2026,clubId:'a',games:10,goals:2,assists:3,cleanSheets:0,titles:[]};const stints=history.careerStints([base,{...base,season:2027,clubId:'b'},{...base,season:2028}]);check(stints.length===3,'return creates new stint');
 for(const game of minigames)for(const difficulty of ['easy','standard','hard'])for(const seed of [1,42,187]){
   let round=games.createRound(game.mode,seed,difficulty);check(JSON.stringify(round)===JSON.stringify(games.createRound(game.mode,seed,difficulty)),'deterministic '+game.id);
   check(games.actRound({...round,done:true},0).done,'finished guard');
   check(games.tickRound(round,round.limit+1).done,'timeout '+game.id);
   if(game.mode==='puzzle'){const board=round.board.filter(Boolean);let inversions=0;for(let i=0;i<board.length;i++)for(let j=i+1;j<board.length;j++)if(board[i]>board[j])inversions++;check(inversions%2===0,'solvable puzzle');}
   if(game.mode==='pairs')check(new Set(round.board).size===8,'8 pairs');
   const result=games.roundResult({...round,done:true,won:true},'id','test');check(result.won===true&&!('score' in result),'binary minigame result');
 }
 let code=games.createRound('code',44);for(let i=0;i<3;i++){code=games.tickRound(code,code.preview+1);for(const n of [...code.sequence])code=games.actRound(code,n)}check(code.done&&code.won,'three code phases');check(games.actRound(code,1)===code,'victory cannot restart a round');
 for(const mode of ['timing','goldZone']){const r=games.createRound(mode,42);const timed=games.tickRound(r,1000);check(games.actRound(timed,0).won,'timing hit');check(!games.actRound(r,0).won,'timing miss');}
 for(const mode of ['maze','pressureMap','ballTrack','cups','pairs','puzzle','ticTacToe']){
  let r=games.createRound(mode,42);r=games.tickRound(r,r.preview+1);
  if(mode==='maze')for(const cell of r.sequence.slice(1))r=games.actRound(r,cell);
  if(mode==='pressureMap')for(const cell of r.sequence)r=games.actRound(r,cell);
  if(mode==='ballTrack')r=games.actRound(r,r.sequence.at(-1));
  if(mode==='cups')r=games.actRound(r,r.target);
  if(mode==='pairs')for(let symbol=0;symbol<8;symbol++)for(const cell of r.board.flatMap((v,i)=>v===symbol?[i]:[]))r=games.actRound(r,cell);
  if(mode==='puzzle')r=games.actRound({...r,board:[1,2,3,4,5,6,7,0,8]},8);
  if(mode==='ticTacToe')r=games.actRound({...r,board:[1,1,1,...Array(22).fill(0)]},3);
  check(r.done&&r.won,'winning path '+mode);
 }
 check(context.difficultyForFinal({clubStrength:88,opponentStrength:74,competitionPrestige:50})==='easy','strong club gets favorable decision');
 check(context.difficultyForFinal({clubStrength:70,opponentStrength:88,competitionPrestige:90,phaseIndex:6})==='hard','strong rival and final raise pressure');
 console.log(`${checks} checks passed: career, saves, shop, events, league, transfers, history and 10 minigames.`);
}finally{await server.close()}
