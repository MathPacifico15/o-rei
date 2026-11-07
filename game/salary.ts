import { computeOvr } from "./overall";
import { clubs, competitions } from './catalog';
import type { CareerState, Club, ContractRole, Player } from './types';

/** Monthly USD ceilings. Add new league IDs here; absent leagues use the safe fallback. */
export const LEAGUE_SALARY_CAPS: Record<string, number> = {
  'sau-pro':5_000_000,
  'eng-pl':3_000_000,'esp-ll':3_000_000,'ita-sa':3_000_000,'ger-bl':3_000_000,'fra-l1':3_000_000,
  'usa-mls':1_500_000,
  'por-pl':1_000_000,'ned-a':1_000_000,'bel-a':1_000_000,'tur-a':1_000_000,'gre-a':1_000_000,'sui-a':1_000_000,'aut-a':1_000_000,'den-a':1_000_000,'nor-a':1_000_000,'pol-a':1_000_000,'cro-a':1_000_000,'sco-a':1_000_000,'irl-a':1_000_000,
  'jpn-j1':850_000,'bra-a':750_000,'arg-lp':750_000,'aus-al':500_000,
  'eng-c':300_000,'eng-l1':120_000,'eng-l2':100_000,
  'mex-liga':250_000,'chi-a':250_000,'col-a':250_000,'uru-a':250_000,'par-a':250_000,'per-a':250_000,'bol-a':250_000,'ecu-a':250_000,'ven-a':250_000,
  'bra-b':50_000,'bra-c':50_000,'bra-d':50_000,'arg-pn':50_000,'arg-pb':50_000,'arg-pc':50_000,'arg-fa':50_000,'arg-pa':50_000,'chi-b':50_000,'chi-c':50_000,'per-b':50_000,'ven-b':50_000,
};
const richSaudi=new Set(['al-hilal','al-nassr','al-ahli','al-ittihad']);
const europeanGiants:Record<string,string[]>={
  'eng-pl':['liverpool','manchester city','manchester united','arsenal','chelsea'],
  'esp-ll':['barcelona','real madrid'],
  'ita-sa':['juventus','internazionale','inter','milan'],
  'ger-bl':['bayern munchen','bayern munich'],
  'fra-l1':['paris saint-germain'],
};
const normalize=(name:string)=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const roundThousand=(value:number)=>Math.round(value/1000)*1000;

/** League assignments are career-specific; no alphabetical roster-based budgets are used. */
export function salaryBounds(state: Pick<CareerState,'leagueAssignments'|'clubDynamics'> | undefined, club:Club) {
  const leagueId=state?.leagueAssignments?.[club.id]??club.leagueId;
  const league=competitions.find(item=>item.id===leagueId);
  const leagueCap=LEAGUE_SALARY_CAPS[leagueId]??250_000;
  const tier=league?.tier??1;
  const topFloor=['Inglaterra','Espanha','Itália','Alemanha','França'].includes(club.country)?10_000:club.country==='Arábia Saudita'?8_000:['Brasil','Grécia','Turquia'].includes(club.country)?5_000:4_000;
  const minimum=Math.max(1_000,roundThousand(topFloor/Math.pow(2,tier-1)));
  const name=normalize(club.name);
  let base=leagueCap*.55, hard=leagueCap;
  if(leagueId==='bra-a') {
    hard=['flamengo','palmeiras'].includes(name)?750_000:['remo','mirassol','vitoria','chapecoense'].includes(name)?300_000:500_000;
    base=hard;
  } else if(leagueId==='sau-pro') {
    hard=richSaudi.has(name)?5_000_000:1_500_000;
    base=richSaudi.has(name)?5_000_000:750_000;
  } else if(europeanGiants[leagueId]?.includes(name)) base=leagueCap;
  else if(leagueId==='arg-lp' && ['boca juniors','river plate'].includes(name)) base=leagueCap;
  else if(leagueId==='gre-a' && ['panathinaikos','olympiacos','aek athens','paok'].includes(name)) base=leagueCap;
  else if(leagueId==='tur-a' && ['galatasaray','fenerbahce','besiktas'].includes(name)) base=leagueCap;
  const dynamic=state?.clubDynamics?.[club.id]?.budget;
  const ratio=dynamic===undefined?1:Math.max(.8,Math.min(1.2,dynamic/Math.max(1,club.budget)));
  const maximum=Math.max(minimum,Math.min(hard,roundThousand(base*ratio)));
  return {minimum,maximum,leagueCap};
}

/** Maximum monthly salary by current OVR; Saudi clubs have their own higher band. */
export function playerSalaryCap(ovr:number,club:Club) {
  const normal=ovr<=69?100_000:ovr<=79?250_000:ovr<=85?600_000:ovr<=89?1_000_000:ovr<=94?2_000_000:5_000_000;
  return club.country==='Arábia Saudita'?Math.min(5_000_000,normal*2):normal;
}
export function effectiveSalaryBounds(state:Pick<CareerState,'leagueAssignments'|'clubDynamics'>|undefined,club:Club,ovr:number) {
  const bounds=salaryBounds(state,club);
  const maximum=Math.min(bounds.maximum,playerSalaryCap(ovr,club));
  return {...bounds,minimum:Math.min(bounds.minimum,maximum),maximum};
}
export function cappedSalary(state:Pick<CareerState,'leagueAssignments'|'clubDynamics'>|undefined,club:Club,amount:number,ovr?:number) {
  const {minimum,maximum}=ovr===undefined?salaryBounds(state,club):effectiveSalaryBounds(state,club,ovr);
  return Math.min(maximum,Math.max(minimum,roundThousand(amount)));
}
export function initialSalary(club:Club) { return salaryBounds(undefined,club).minimum; }

/** First two renewals at the starting club attempt to double pay within both ceilings. */
export function renewalSalary(state:CareerState,club:Club,standardFactor:number) {
  const ovr=computeOvr(state.player);
  if (state.evolutionRulesVersion===2 && state.initialClubId===club.id && (state.renewalCount??0)<2) return Math.min(effectiveSalaryBounds(state,club,ovr).maximum,state.contract.monthlySalary*2);
  return cappedSalary(state,club,state.contract.monthlySalary*standardFactor,ovr);
}

export function salaryOffer(state:CareerState,club:Club,player:Player,ovr:number,role:ContractRole,random:()=>number) {
  const {minimum,maximum}=salaryBounds(state,club);
  const ability=Math.max(0,Math.min(1,(ovr-45)/50));
  const age=player.age<21?.90:player.age>34?.88:1;
  const performance=Math.max(.9,Math.min(1.1,(state.history.at(-1)?.rating??7)/7));
  const roleFactor=role==='estrela'?1:role==='titular'?.88:role==='rotacao'?.74:.60;
  const variation=.85+Math.max(0,Math.min(1,random()))*.15;
  const bonuses=(state.shop?.ownedPermanent.includes('empresario')?1.15:1)*(state.shop?.ownedPermanent.includes('academia')?1.2:1);
  const saudiPremium=club.country==='Arábia Saudita'?1.5:1;
  // Apply variation after the ceiling so multiple strong clubs do not all offer the same maximum.
  const base=(minimum+(maximum-minimum)*ability*roleFactor*age*performance)*bonuses*saudiPremium;
  const available=Math.min(base,effectiveSalaryBounds(state,club,ovr).maximum);
  return cappedSalary(state,club,available*variation,ovr);
}
export function findSalaryClub(id:string) { return clubs.find(club=>club.id===id); }
