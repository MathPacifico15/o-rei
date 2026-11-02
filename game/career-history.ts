import type {CareerState,SeasonResult} from './types';
export interface CareerStint {clubId:string;start:number;end:number;games:number;goals:number;assists:number;cleanSheets:number;titles:string[]}
export function rememberClubMilestones(state:CareerState):CareerState{
 const milestones={...state.clubMilestones};
 for(const [id,value]of Object.entries(state.player.clubIdolatry))milestones[id]=Math.max(milestones[id]??0,value);
 return {...state,clubMilestones:milestones};
}
export function careerStints(history:SeasonResult[]):CareerStint[]{
 const result:CareerStint[]=[];
 for(const season of history){if(!season.clubId)continue;let stint=result.at(-1);if(!stint||stint.clubId!==season.clubId){stint={clubId:season.clubId,start:season.season,end:season.season,games:0,goals:0,assists:0,cleanSheets:0,titles:[]};result.push(stint)}stint.end=season.season;stint.games+=season.games;stint.goals+=season.goals;stint.assists+=season.assists;stint.cleanSheets+=season.cleanSheets;stint.titles.push(...(season.titles??(season.title?[season.title]:[])).filter(t=>t!==season.nationalTeamTitle));}
 return result;
}
export function groupedTitles(titles:string[]){return Object.entries(titles.reduce<Record<string,number>>((r,t)=>({...r,[t]:(r[t]??0)+1}),{}));}
export function negotiateOffer(state:CareerState,clubId:string,random:()=>number,priority:'salary'|'role'|'duration'='salary'):{state:CareerState;message:string}{
 const key=`${state.season}:${state.marketWindow?.kind??'transfer'}:${clubId}`;
 const offer=state.marketWindow?.offers.find(o=>o.clubId===clubId);if(!offer||state.negotiatedOffers?.includes(key)||state.negotiatedOffers?.includes(`${state.season}:${clubId}`))return {state,message:'Esta oferta não permite outra negociação.'};
 const roll=random(), accepted=roll<.55, withdrawn=roll>=.85;
 const roles=['promessa','rotacao','titular','estrela'] as const;
 const role=roles[Math.min(roles.length-1,roles.indexOf(offer.role)+1)];
 const changed=priority==='salary'?{...offer,monthlySalary:Math.round(offer.monthlySalary*1.12)}:priority==='duration'?{...offer,seasons:Math.min(5,offer.seasons+1)}:{...offer,role,expectedMinutes:role==='estrela'?86:role==='titular'?72:role==='rotacao'?48:28};
 const offers=withdrawn?state.marketWindow!.offers.filter(o=>o.clubId!==clubId):state.marketWindow!.offers.map(o=>o.clubId===clubId&&accepted?changed:o);
 return {state:{...state,negotiatedOffers:[...(state.negotiatedOffers??[]),key],marketWindow:{...state.marketWindow!,offers}},message:accepted?'Contraproposta aceita. Confira os novos termos antes de assinar.':withdrawn?'O clube retirou a proposta. As outras ofertas continuam disponíveis.':'O clube recusou a contraproposta, mas manteve a oferta original.'};
}
