import type {MiniGameDefinition} from './minigames';
export type Difficulty='easy'|'standard'|'hard';
/** A career decision has a binary outcome. Timing and errors remain telemetry only. */
export interface MiniResult {id:string;gameId:string;seed:number;difficulty:Difficulty;won:boolean;elapsedMs:number;context:string}
export interface Round {seed:number;mode:MiniGameDefinition['mode'];difficulty:Difficulty;elapsed:number;preview:number;limit:number;board:number[];sequence:number[];input:number[];matched:number[];open:number[];errors:number;round:number;done:boolean;won:boolean;feedback:string;lockUntil:number;swaps:number[][];target:number;steps:number}
export function rng(seed:number){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function shuffled<T>(list:T[],random:()=>number){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export const tuning={easy:{preview:4200,limit:150000,errors:7,speed:.035,width:25},standard:{preview:3000,limit:100000,errors:5,speed:.05,width:18},hard:{preview:1800,limit:65000,errors:3,speed:.065,width:12}};
export function validRound(value: unknown):value is Round {
 if(!value||typeof value!=='object')return false;const r=value as Round;
 return ['easy','standard','hard'].includes(r.difficulty)&&[r.seed,r.elapsed,r.preview,r.limit,r.errors,r.round,r.target,r.steps,r.lockUntil].every(Number.isFinite)&&r.elapsed>=0&&r.limit>0&&[r.board,r.sequence,r.input,r.matched,r.open].every(a=>Array.isArray(a)&&a.every(Number.isFinite))&&Array.isArray(r.swaps)&&r.swaps.every(a=>Array.isArray(a)&&a.length===2&&a.every(Number.isFinite))&&typeof r.done==='boolean'&&typeof r.won==='boolean';
}
export function createRound(mode:Round['mode'],seed:number,difficulty:Difficulty='standard',round=1):Round{
 const random=rng(seed+round*31),n=(max:number)=>Math.floor(random()*max),t=tuning[difficulty];
 let board:number[]=[],sequence:number[]=[],swaps:number[][]=[];let target=n(4),preview=t.preview;
 if(mode==='code')sequence=Array.from({length:5},()=>1+n(9));
 if(mode==='pairs')board=shuffled([...Array(8).keys(),...Array(8).keys()],random);
 if(mode==='puzzle'){board=[1,2,3,4,5,6,7,8,0];let last=-1;for(let i=0;i<({easy:12,standard:30,hard:60}[difficulty]);i++){const z=board.indexOf(0),choices=[z-3,z+3,z-1,z+1].filter(p=>p>=0&&p<9&&(Math.abs(p-z)===3||Math.floor(p/3)===Math.floor(z/3))&&p!==last);const p=choices[n(choices.length)];[board[z],board[p]]=[board[p],board[z]];last=z}preview=0;}
 if(mode==='maze'){sequence=[0];let p=0;while(p!==24){const options=[...(p%5<4?[p+1]:[]),...(p<20?[p+5]:[])];p=options[n(options.length)];sequence.push(p)}board=Array(25).fill(0);}
 if(mode==='ticTacToe'){board=Array(25).fill(0);preview=0;}
 if(mode==='pressureMap')sequence=Array.from({length:({easy:3,standard:5,hard:7}[difficulty])+round-1},()=>n(9));
 if(mode==='ballTrack')sequence=Array.from({length:({easy:5,standard:8,hard:12}[difficulty])},()=>n(6));
 if(mode==='pressureMap'||mode==='ballTrack')preview=sequence.length*(difficulty==='easy'?850:difficulty==='hard'?450:650)+500;
 if(mode==='cups'){board=[0,1,2,3];for(let i=0;i<({easy:4,standard:6,hard:8}[difficulty]);i++){const a=n(4);let b=n(3);if(b>=a)b++;swaps.push([a,b]);}preview=1300+swaps.length*650;}
 if(mode==='timing'||mode==='goldZone')preview=0;
 return{seed,mode,difficulty,elapsed:0,preview,limit:t.limit,board,sequence,input:[],matched:[],open:[],errors:0,round,done:false,won:false,feedback:'Observe a preparação.',lockUntil:0,swaps,target,steps:0};
}
export function markerAt(s:Round){const x=(s.elapsed*tuning[s.difficulty].speed)%200;return x<=100?x:200-x}
export function cupPositions(s:Round){const positions=[0,1,2,3];const count=Math.max(0,Math.min(s.swaps.length,Math.floor((s.elapsed-1000)/650)));for(const[a,b]of s.swaps.slice(0,count))[positions[a],positions[b]]=[positions[b],positions[a]];return positions}
export function wonLine(board:number[],side:number){for(let p=0;p<25;p++)for(const [dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){let ok=true;for(let k=0;k<4;k++){const r=Math.floor(p/5)+dr*k,c=p%5+dc*k;if(r<0||r>=5||c<0||c>=5||board[r*5+c]!==side)ok=false}if(ok)return true}return false}
function end(s:Round,won:boolean):Round{return {...s,done:true,won,feedback:won?'Boa execução! Objetivo cumprido.':'A tentativa terminou. Revise a leitura e tente no treino.'}}
export function tickRound(s:Round,delta:number):Round{if(s.done)return s;const next={...s,elapsed:s.elapsed+Math.max(0,delta)};if(next.elapsed>=next.limit)return end(next,false);if(next.open.length===2&&next.lockUntil<=next.elapsed)next.open=[];return next;}
export function actRound(s:Round,value:number):Round{
 if(s.done||s.elapsed<s.preview||s.elapsed<s.lockUntil)return s;
 let next={...s,input:[...s.input],board:[...s.board],steps:s.steps+1,feedback:'Jogada registrada.'};
 const mistake=()=>{next.errors++;next.feedback='Não foi desta vez. Ajuste a próxima jogada.';return next.errors>=tuning[s.difficulty].errors?end(next,false):next};
 if(s.mode==='timing'||s.mode==='goldZone'){const width=tuning[s.difficulty].width*(s.mode==='goldZone'?.7:1);return end(next,Math.abs(markerAt(s)-50)<=width/2)}
 if(s.mode==='cups')return end(next,value===s.target);
 if(s.mode==='ballTrack')return end(next,value===s.sequence.at(-1));
 if(s.mode==='code'||s.mode==='pressureMap'){if(!Number.isInteger(value)||value<0||value>9)return s;next.input.push(value);if(value!==s.sequence[s.input.length])return end(next,false);if(next.input.length===s.sequence.length){if(s.mode==='code'&&s.round<3)return {...createRound(s.mode,s.seed,s.difficulty,s.round+1),feedback:'Código correto. Próxima fase.'};return end(next,true)}return next;}
 if(s.mode==='maze'){if(value!==s.sequence[s.input.length+1])return mistake();next.input.push(value);return value===24?end(next,true):next;}
 if(s.mode==='pairs'){if(value<0||value>=16||s.matched.includes(value)||s.open.includes(value)||s.open.length===2)return s;next.open=[...s.open,value];if(next.open.length<2)return next;if(s.board[next.open[0]]===s.board[value]){next.matched=[...s.matched,...next.open];next.open=[];next.feedback='Par encontrado.';return next.matched.length===16?end(next,true):next;}next.lockUntil=s.elapsed+650;return mistake();}
 if(s.mode==='puzzle'){const z=s.board.indexOf(0);if(value<0||value>8||!(Math.abs(z-value)===3||(Math.abs(z-value)===1&&Math.floor(z/3)===Math.floor(value/3))))return s;[next.board[z],next.board[value]]=[next.board[value],next.board[z]];return next.board.every((v,i)=>v===(i+1)%9)?end(next,true):next;}
 if(s.mode==='ticTacToe'){if(value<0||value>=25||next.board[value])return s;next.board[value]=1;if(wonLine(next.board,1))return end(next,true);const empty=next.board.flatMap((v,i)=>v?[]:[i]);if(!empty.length)return end(next,false);let chosen=-1;for(const side of [2,1]){for(const i of empty){const b=[...next.board];b[i]=side;if(wonLine(b,side)){chosen=i;break}}if(chosen>=0)break}if(chosen<0){const random=rng(s.seed+s.steps*97);chosen=s.difficulty==='easy'?empty[Math.floor(random()*empty.length)]:empty.sort((a,b)=>Math.abs(a-12)-Math.abs(b-12))[0];}next.board[chosen]=2;return wonLine(next.board,2)?end(next,false):next;}
 return s;
}
export function roundResult(s:Round,id:string,context:string):MiniResult{return{id,context,gameId:s.mode,seed:s.seed,difficulty:s.difficulty,won:s.won,elapsedMs:Math.round(s.elapsed)};}
