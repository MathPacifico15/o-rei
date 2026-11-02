import assert from 'node:assert/strict';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true,watch:null}});
let checks=0;const check=(value,message)=>{assert.ok(value,message);checks++};
try{
 const engine=await server.ssrLoadModule('/game/engine.ts'),{clubs,competitions}=await server.ssrLoadModule('/game/catalog.ts');
 const persistence=await server.ssrLoadModule('/game/persistence.ts'),games=await server.ssrLoadModule('/game/minigame-engine.ts'),{minigames}=await server.ssrLoadModule('/game/minigames.ts');
 const events=await server.ssrLoadModule('/game/career-events.ts'),economy=await server.ssrLoadModule('/game/economy.ts'),history=await server.ssrLoadModule('/game/career-history.ts'),context=await server.ssrLoadModule('/game/minigame-context.ts');
 function fixture(position='ATA') {const club=clubs.find(c=>c.id==='santos')??clubs[0];const player={id:'test',name:'Teste',nationality:'Brasil',position,preferredFoot:'Direito',heightCm:180,shirtNumber:9,age:16,clubId:club.id,attributes:engine.baseAttributes(),form:68,fame:3,salary:16700,marketValue:400000,games:0,goals:0,assists:0,cleanSheets:0,saves:0,titles:[],awards:[],clubIdolatry:{[club.id]:12},judasAt:[],injuries:0};return {seed:187,season:2026,player,history:[],clubHistory:[{clubId:club.id,titles:[]}],currentCompetition:'Liga',mode:'normal',balance:2000000,contract:{clubId:club.id,monthlySalary:16700,seasonsRemaining:3,role:'titular',expectedMinutes:72},leagueAssignments:Object.fromEntries(clubs.map(c=>[c.id,c.leagueId])),leagueTables:{},shop:{ownedPermanent:[],activeSeasonal:[],freeUses:[]},nationalTeam:{games:0,goals:0,assists:0,titles:[]},originCountry:club.country,highestOvr:56,saveVersion:7};}
 const initial=fixture(),raw=JSON.stringify(initial);check(persistence.decodeSave(raw).career.saveVersion===8,'migration v7');
 for(const position of ['GOL','MEI','ATA']){
  const eligible=engine.upgradeCards.filter(card=>card.eligible.includes(position));
  const exhausted=eligible.map(card=>card.id);
  const available=eligible.slice(-2).map(card=>card.id);
  for(const recent of [[],exhausted,exhausted.slice(0,-2)])for(const seed of [1,42,187,2026]){
   const before=fixture(position).player, snapshot=structuredClone(before);
   const hand=engine.chooseUpgradeCards(position,seed,recent);
   check(hand.length===3&&new Set(hand.map(card=>card.id)).size===3,`three unique cards after cooldown exhaustion: ${position}`);
   check(hand.every(card=>card.eligible.includes(position)),`cards remain eligible: ${position}`);
   check(JSON.stringify(hand)===JSON.stringify(engine.chooseUpgradeCards(position,seed,recent)),`deterministic card hand: ${position}`);
   if(recent.length===exhausted.length-2)check(available.every(id=>hand.some(card=>card.id===id)),`use remaining fresh cards before relaxing cooldown: ${position}`);
   for(const card of hand){
    const total=Object.values(card.changes).reduce((sum,gain)=>sum+gain,0);
    check(card.rarity==='raro'?total===3:card.rarity==='epico'?total>=4&&total<=5:card.rarity==='lendario'&&total>=7&&total<=8,`existing rarity gain range: ${card.id}`);
    const after=engine.applyCard(before,card);
    check(Object.entries(before.attributes).every(([key,value])=>after.attributes[key]===Math.min(99,value+(card.changes[key]??0))),`offered card applies its declared gains: ${card.id}`);
    check(after.games===before.games&&after.clubId===before.clubId&&JSON.stringify(after.titles)===JSON.stringify(before.titles),`card only changes attributes: ${card.id}`);
   }
   check(JSON.stringify(before)===JSON.stringify(snapshot),`card effects preserve input: ${position}`);
  }
 }
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
 const bought=economy.purchaseProduct({...initial,balance:10000000},'psicologo');check(bought.shop.ownedPermanent.includes('psicologo'),'psychologist permanent');check(bought.financialLedger[0].amount===-3840000,'audit purchase');assert.throws(()=>economy.purchaseProduct(bought,'psicologo'));checks++;
 const supplement=economy.purchaseProduct(initial,'suplementacao');const first=engine.simulateSeason(supplement).state;check(first.shop.activeSeasonal.includes('suplementacao'),'two-season item retained');check(!engine.simulateSeason(first).state.shop.activeSeasonal.includes('suplementacao'),'two-season item expires');
 const a=engine.simulateSeason(initial),b=engine.simulateSeason(bought);check(b.state.player.form>=a.state.player.form,'psychologist boosts form');
 const offer={clubId:clubs[1].id,monthlySalary:10000,seasons:2,role:'titular',expectedMinutes:70,idolatryChange:-2},market={...initial,marketWindow:{season:2026,offers:[offer],renewal:offer}};
 const negotiated=history.negotiateOffer(market,offer.clubId,()=>0).state;check(negotiated.marketWindow.offers[0].monthlySalary===11200,'negotiation');check(history.negotiateOffer(negotiated,offer.clubId,()=>0).state===negotiated,'negotiation once');
 const rejected=history.negotiateOffer(market,offer.clubId,()=>.99).state;check(rejected.marketWindow.offers.length===0,'rejected negotiation removes the offer');check(rejected.marketWindow.renewal===offer,'rejected negotiation preserves renewal');
 const starting={...initial,contract:{...initial.contract,monthlySalary:4000}};const window=engine.createMarketWindow(starting,engine.mulberry32(29));check(window.renewal.monthlySalary>0,'initial salary renewal never rounds to zero');check(window.offers.length>=5&&window.offers.length<=6&&new Set(window.offers.map(o=>o.clubId)).size===window.offers.length,'five or six distinct offers');check(window.offers.every(o=>o.monthlySalary>0&&o.clubId!==starting.player.clubId),'offers have positive salaries and another club');check(JSON.stringify(window)===JSON.stringify(engine.createMarketWindow(starting,engine.mulberry32(29))),'market generation is deterministic');
 const refused=history.negotiateOffer(market,offer.clubId,()=>.7).state;check(refused.marketWindow.offers[0].monthlySalary===offer.monthlySalary,'refusal keeps original');check(history.negotiateOffer(refused,offer.clubId,()=>0).state===refused,'refusal consumes attempt');
 check(history.negotiateOffer(market,offer.clubId,()=>0,'role').state.marketWindow.offers[0].role==='estrela','negotiate role');check(history.negotiateOffer(market,offer.clubId,()=>0,'duration').state.marketWindow.offers[0].seasons===3,'negotiate duration');
 const preference={...initial,marketWindow:engine.prepareMarketWindow(initial)};check(persistence.decodeSave(JSON.stringify({version:8,career:preference})).career.marketWindow.phase==='preference','preference stage survives save');
 const countriesSeen=new Set();let greekOffers=0,panathinaikosOffers=0,preferred=0,world=0;for(let seed=1;seed<=250;seed++){const w=engine.createMarketWindow(initial,engine.mulberry32(seed)),g=engine.createMarketWindow(initial,engine.mulberry32(seed),'Grécia');for(const o of w.offers){const c=clubs.find(x=>x.id===o.clubId);countriesSeen.add(c.country);if(c.country==='Grécia')greekOffers++;if(c.name==='Panathinaikos')panathinaikosOffers++;}world+=w.offers.filter(o=>clubs.find(c=>c.id===o.clubId)?.country==='Grécia').length;preferred+=g.offers.filter(o=>clubs.find(c=>c.id===o.clubId)?.country==='Grécia').length;}
 check(countriesSeen.size>=10,'worldwide market diversity');check(greekOffers>0&&panathinaikosOffers>0,'median athlete can receive Greek and Panathinaikos offers');check(preferred>world,'preference increases offers from chosen country');
 let countryHits=0;for(let seed=1;seed<=500;seed++){const w=engine.createMarketWindow(initial,engine.mulberry32(seed),'Grécia');if(w.offers.some(o=>clubs.find(c=>c.id===o.clubId)?.country==='Grécia'))countryHits++;}check(countryHits>=290&&countryHits<=360,'country preference near 65 percent');
 const netherlands=clubs.find(c=>c.name==='Sparta Rotterdam');check(Boolean(netherlands),'Sparta exists');const abroad={...initial,originCountry:'Brasil',player:{...initial.player,clubId:netherlands.id}};for(let seed=1;seed<=30;seed++){const w=engine.createMarketWindow(abroad,engine.mulberry32(seed));check(w.offers.every(o=>competitions.find(c=>c.id===(abroad.leagueAssignments[o.clubId]??clubs.find(x=>x.id===o.clubId).leagueId))?.tier===1),'after leaving continent only top division offers');}
 const elite={...initial,player:{...initial.player,attributes:Object.fromEntries(Object.keys(initial.player.attributes).map(k=>[k,90]))},highestOvr:90};const eliteNames=new Set(['barcelona','real madrid','liverpool','manchester city','manchester united','bayern münchen','bayern munich','paris saint-germain','arsenal','chelsea','juventus','inter','milan']);for(let seed=1;seed<=30;seed++){const w=engine.createMarketWindow(elite,engine.mulberry32(seed));check(w.offers.some(o=>eliteNames.has(clubs.find(c=>c.id===o.clubId)?.name.toLowerCase())),'elite players receive relevant clubs');}
 const loanOffer=engine.createMarketWindow(initial,engine.mulberry32(9),undefined,'loan').offers[0];check(loanOffer?.kind==='loan'&&loanOffer.seasons===1,'loan proposals');const loanStarted=engine.simulateSeason({...initial,pendingTransfer:loanOffer}).state;check(loanStarted.player.clubId===loanOffer.clubId&&loanStarted.loan?.parentClubId===initial.player.clubId,'loan starts at next season');const loanReturned=engine.simulateSeason(loanStarted).state;check(loanReturned.player.clubId===initial.player.clubId&&!loanReturned.loan,'loan returns to parent');check(loanReturned.contract.clubId===initial.player.clubId&&loanReturned.contract.monthlySalary===initial.contract.monthlySalary,'parent contract restored after loan');
 for(const size of [7,8])for(let seed=1;seed<=100;seed++){const route=games.mazeRoute(seed,1,size);const axes=new Set(route.slice(1).map((v,i)=>Math.abs(v-route[i])===size?'vertical':'horizontal'));check(axes.size===2,'maze includes turns');check(new Set(route).size===route.length,'maze path has no repeated cells');}
 const base={season:2026,clubId:'a',games:10,goals:2,assists:3,cleanSheets:0,titles:[]};const stints=history.careerStints([base,{...base,season:2027,clubId:'b'},{...base,season:2028}]);check(stints.length===3,'return creates new stint');
 for(const game of minigames)for(const difficulty of ['easy','standard','hard'])for(const seed of [1,42,187]){
   let round=games.createRound(game.mode,seed,difficulty);check(JSON.stringify(round)===JSON.stringify(games.createRound(game.mode,seed,difficulty)),'deterministic '+game.id);
   check(games.actRound({...round,done:true},0).done,'finished guard');
   check(games.tickRound(games.revealRound(round),round.limit+1).done,'timeout '+game.id);
   if(game.mode==='puzzle'){const board=round.board.filter(Boolean);let inversions=0;for(let i=0;i<board.length;i++)for(let j=i+1;j<board.length;j++)if(board[i]>board[j])inversions++;check(inversions%2===0,'solvable puzzle');}
   if(game.mode==='pairs')check(new Set(round.board).size===8,'8 pairs');
   const result=games.roundResult({...round,done:true,won:true},'id','test');check(result.won===true&&!('score' in result),'binary minigame result');
 }
 let code=games.createRound('code',44);for(let i=0;i<3;i++){code=games.revealRound(code);code=games.tickRound(code,code.preview+1);for(const n of [...code.sequence])code=games.actRound(code,n)}check(code.done&&code.won,'three code phases');check(games.actRound(code,1)===code,'victory cannot restart a round');
 for(const mode of ['timing','goldZone']){const r=games.createRound(mode,42);let elapsed=0;while(elapsed<10000&&Math.abs(games.markerAt({...r,elapsed})-games.targetCenter(r))>games.targetWidth(r)/2)elapsed+=5;const atTarget={...r,elapsed};check(games.actRound(atTarget,0).won,'timing hit');check(!games.actRound(r,0).won,'timing miss');}
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
 console.log(`${checks} checks passed: career, saves, shop, events, league, transfers, history and minigame mechanics.`);
}finally{await server.close()}
