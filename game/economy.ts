import type { CareerState, ShopItemId } from './types';
export interface ShopProduct { id: ShopItemId; name:string; icon:string; description:string; price:number; category:'Equipe'|'Temporada'|'Patrimônio'; duration?:number }
export const shopProducts:ShopProduct[] = [
 {id:'chef',name:'Chef particular',icon:'🥗',description:'Preparação alimentar: +5 de forma na abertura de cada temporada.',price:420000,category:'Equipe'},
 {id:'fisio',name:'Fisioterapeuta pessoal',icon:'🛡',description:'Reduz o risco de lesão em 35%.',price:620000,category:'Equipe'},
 {id:'psicologo',name:'Psicólogo esportivo',icon:'🧠',description:'Trabalho contínuo: +6 de forma por temporada. Não altera resultados dos minijogos.',price:480000,category:'Equipe'},
 {id:'preparador',name:'Preparador físico',icon:'🏋',description:'+4 de preparo efetivo nas simulações, sem ultrapassar limites dos atributos.',price:700000,category:'Equipe'},
 {id:'empresario',name:'Representante dedicado',icon:'🤝',description:'As novas ofertas salariais podem aumentar até 15%, respeitando o limite do clube.',price:550000,category:'Equipe'},
 {id:'chuteiras',name:'Equipamento profissional',icon:'👟',description:'Bônus de 8% na produção de gols ou jogos sem sofrer gols por uma temporada.',price:35000,category:'Temporada',duration:1},
 {id:'ferias',name:'Recuperação programada',icon:'🌴',description:'+5 de forma na próxima preparação.',price:28000,category:'Temporada',duration:1},
 {id:'suplementacao',name:'Suporte nutricional',icon:'🥤',description:'+2 de preparo efetivo por duas temporadas.',price:32000,category:'Temporada',duration:2},
 {id:'analista',name:'Analista de vídeo',icon:'📊',description:'Bônus de 10% na criação de assistências; goleiros ganham leitura defensiva.',price:44000,category:'Temporada',duration:1},
 {id:'familia',name:'Visita da família',icon:'🏡',description:'+4 de forma na próxima preparação.',price:30000,category:'Temporada',duration:1},
 {id:'imprensa',name:'Assessoria de imprensa',icon:'🎙',description:'Orienta as opções da próxima coletiva. Consumida ao responder.',price:38000,category:'Temporada'},
 {id:'carro',name:'Carro esportivo',icon:'🚘',description:'+2 de fama na aquisição.',price:90000,category:'Patrimônio'},
 {id:'casa',name:'Casa própria',icon:'🏠',description:'+2 de forma por temporada.',price:150000,category:'Patrimônio'},
 {id:'mansao',name:'Residência com campo',icon:'🏟',description:'+3 de preparo efetivo e +2 de fama na aquisição.',price:900000,category:'Patrimônio'},
 {id:'ilha',name:'Refúgio particular',icon:'🏝',description:'+4 de fama na aquisição.',price:1400000,category:'Patrimônio'},
 {id:'bairro',name:'Campo do bairro',icon:'⚽',description:'+5 de idolatria na aquisição e +1 por temporada no clube atual.',price:750000,category:'Patrimônio'},
 {id:'academia',name:'Centro de formação',icon:'🏫',description:'+15 de fama na aquisição e até 20% nas propostas, respeitando o limite do clube.',price:1800000,category:'Patrimônio'},
].map(item => ({ ...item, price: item.price * 2 * (item.category === 'Patrimônio' ? 20 : item.category === 'Equipe' ? 8 : 3) })) as ShopProduct[];
export function purchaseProduct(state:CareerState,id:ShopItemId):CareerState {
 const item=shopProducts.find(x=>x.id===id);if(!item)throw Error('Produto inexistente.');
 if(state.shop.ownedPermanent.includes(id)||state.shop.activeSeasonal.includes(id))throw Error('Este benefício já está ativo.');
 if(state.balance<item.price)throw Error('Saldo insuficiente.');
 const player={...state.player,clubIdolatry:{...state.player.clubIdolatry}};
 const fame:Partial<Record<ShopItemId,number>>={carro:2,mansao:2,ilha:4,academia:15};player.fame=Math.min(100,player.fame+(fame[id]??0));
 if(id==='bairro')player.clubIdolatry[player.clubId]=Math.min(100,(player.clubIdolatry[player.clubId]??0)+5);
 return {...state,player,balance:state.balance-item.price,financialLedger:[...(state.financialLedger??[]),{season:state.season,label:item.name,amount:-item.price}],shop:{...state.shop,ownedPermanent:item.category==='Temporada'?state.shop.ownedPermanent:[...state.shop.ownedPermanent,id],activeSeasonal:item.category==='Temporada'?[...state.shop.activeSeasonal,id]:state.shop.activeSeasonal,expires:{...state.shop.expires,...(item.duration?{[id]:state.season+item.duration}: {})}}};
}
