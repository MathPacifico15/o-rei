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
export function negotiateOffer(state:CareerState,clubId:string,random:()=>number):{state:CareerState;message:string}{
 const offer=state.marketWindow?.offers.find(o=>o.clubId===clubId);if(!offer||state.negotiatedOffers?.includes(`${state.season}:${clubId}`))return {state,message:'Esta oferta não permite outra negociação.'};
 const accepted=random()<.65;
 return {state:{...state,negotiatedOffers:[...(state.negotiatedOffers??[]),`${state.season}:${clubId}`],marketWindow:{...state.marketWindow!,offers:accepted?state.marketWindow!.offers.map(o=>o.clubId===clubId?{...o,monthlySalary:Math.round(o.monthlySalary*1.12)}:o):state.marketWindow!.offers.filter(o=>o.clubId!==clubId)}},message:accepted?'Contraproposta aceita: salário aumentado em 12%. Você ainda precisa assinar.':'O clube retirou a proposta. As outras ofertas continuam disponíveis.'};
}
