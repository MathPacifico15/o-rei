import {pathToFileURL} from 'node:url';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
const modulePath=process.env.O_REI_PLAYWRIGHT_MODULE;
const {chromium}=await import(modulePath?(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href):'../../work/o-rei-qa/node_modules/playwright/index.mjs');

const vite=await createServer({root:process.cwd(),configFile:false,server:{middlewareMode:true,watch:null}});
const {clubs,competitions}=await vite.ssrLoadModule('/game/catalog.ts');
const {baseAttributes,computeOvr,simulateSeason}=await vite.ssrLoadModule('/game/engine.ts');
const {minigames}=await vite.ssrLoadModule('/game/minigames.ts');
const club=clubs.find(c=>c.id==='flamengo');
assert.ok(club,'clube de teste encontrado');
function fixture(season,competitionId){
 const attributes=Object.fromEntries(Object.keys(baseAttributes()).map(key=>[key,90]));
 const player={id:'browser-world',name:'Teste Mundial',nationality:'Brasil',position:'ATA',preferredFoot:'Direito',heightCm:180,shirtNumber:9,age:25,clubId:club.id,attributes,form:75,fame:40,salary:4000,marketValue:1000000,games:0,goals:0,assists:0,cleanSheets:0,saves:0,titles:[],awards:[],clubIdolatry:{[club.id]:20},judasAt:[],injuries:0};
 const state={seed:71,season,player,history:[],clubHistory:[{clubId:club.id,titles:[]}],currentCompetition:competitions.find(c=>c.id===club.leagueId).name,mode:'normal',playStyle:'skill',balance:0,contract:{clubId:club.id,monthlySalary:4000,seasonsRemaining:3,role:'titular',expectedMinutes:70},leagueAssignments:Object.fromEntries(clubs.map(c=>[c.id,c.leagueId])),leagueTables:{},shop:{ownedPermanent:[],activeSeasonal:[],freeUses:[]},nationalTeam:{games:0,goals:0,assists:0,titles:[]},originCountry:club.country,highestOvr:computeOvr(player),clubDynamics:{},clubHonors:{},campaignQualifications:{},competitionWinners:{lib:[{clubId:club.id,season:season-1}]},campaignMiniGames:{},recentEventIds:[],recentCardIds:[],recentMiniGameIds:[],saveVersion:8};
 const simulated=simulateSeason(state), finals=simulated.result.finals.filter(f=>f.competitionId===competitionId);
 assert.equal(finals.length,competitionId==='wc'?8:7,`${competitionId}: calendário completo`);
 const game=minigames.find(g=>g.id==='zona-ouro'), first=finals[0];
 const result={...simulated.result,cupFinal:first,finalOpportunity:true,finals};
 const career={...simulated.state,history:[result],campaignMiniGames:{[first.campaignId]:game.id}};
 return {version:8,career,flow:{screen:'career',lastResult:result,event:null,eventQueue:[],seasonSummary:false,seasonConsequences:[],upgradeReady:false,activeGame:game,gameAttempt:0,finalQueue:finals.slice(1),celebration:null}};
}
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 for(const [id,season,total] of [['wc',2026,8],['cwc',2029,7]]){
  const context=await browser.newContext({viewport:{width:1280,height:850}}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const save=fixture(season,id);
  await page.addInitScript(value=>localStorage.setItem('o-rei-career',JSON.stringify(value)),save);
  await page.goto('http://127.0.0.1:4183/');
  await page.getByRole('button',{name:'CONTINUAR CARREIRA'}).click();
  await page.clock.install();
  await page.getByRole('button',{name:'COMEÇAR',exact:true}).click();
  for(let match=0;match<total;match++){
   console.log(`${id}: iniciando partida ${match+1}/${total}`);
   await page.locator('.arena-track-gold').waitFor();
   if(match>0)assert.equal(await page.getByRole('button',{name:'COMEÇAR',exact:true}).count(),0,`${id}: tutorial repetido na partida ${match+1}`);
   let hit=false;
   for(let tick=0;tick<1600;tick++){
    const inside=await page.locator('.arena-track-gold').evaluate(track=>{const target=track.querySelector('i').getBoundingClientRect(),marker=track.querySelector('b').getBoundingClientRect(),x=marker.x+marker.width/2,hit=Math.abs(x-(target.left+target.width/2))<1.5;if(hit)Array.from(track.closest('.arena').querySelectorAll('button')).find(button=>button.textContent.includes('PARAR'))?.click();return hit});
    if(inside){hit=true;break;} await page.clock.runFor(5);
   }
   assert.ok(hit,`${id}: faixa alcançável na partida ${match+1}`);
   await page.clock.runFor(1000);
   assert.equal(await page.locator('.toast').count(),0,`${id}: mensagem flutuante após a partida ${match+1}`);
   if(match<total-1) { try { await page.locator('.arena-track-gold').waitFor({timeout:10000}); } catch(error) { console.error('Tela após partida:',(await page.locator('body').innerText()).slice(-1400)); throw error; } }
  }
  await page.locator('.celebration-close').waitFor({timeout:10000});
  assert.equal(errors.length,0,errors.join('\n'));
  console.log(`${id}: ${total} vitórias jogadas até a celebração; sem tutorial repetido`);
  await context.close();
 }
}finally{await browser.close();await vite.close();}
