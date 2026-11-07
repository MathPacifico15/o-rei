import type { CareerState, CareerEvent, SeasonResult } from './types';
import type { MiniGameDefinition } from './minigames';
import { z } from 'zod';

const finite=z.number().finite();
const eventSchema=z.object({id:z.string(),title:z.string(),copy:z.string(),choices:z.array(z.object({label:z.string()}).passthrough()).min(1)}).passthrough();
const seasonSchema=z.object({season:finite,games:finite,goals:finite,assists:finite,cleanSheets:finite,events:z.array(eventSchema)}).passthrough();
const offerSchema=z.object({clubId:z.string(),monthlySalary:finite.nonnegative(),seasons:finite,role:z.enum(['promessa','rotacao','titular','estrela']),expectedMinutes:finite,idolatryChange:finite,kind:z.enum(['transfer','loan']).optional()}).passthrough();
const marketSchema=z.object({season:finite,offers:z.array(offerSchema),renewal:offerSchema,phase:z.enum(['preference','offers']).optional(),kind:z.enum(['transfer','loan']).optional(),preferredCountry:z.string().optional()}).passthrough();
const careerSchema=z.object({
 seed:finite,season:finite,balance:finite,history:z.array(seasonSchema),
 renewalCount:z.number().int().min(0).optional(),
 evolutionRulesVersion:z.literal(2).optional(),initialClubId:z.string().optional(),
 cardEvolution:z.object({season:finite,gains:z.record(z.string(),finite),losses:z.record(z.string(),finite),ovrBefore:finite}).optional(),
 playStyle:z.enum(['skill','luck','mixed']).optional(),
 miniGameHistory:z.array(z.object({season:finite,decisionId:z.string(),gameId:z.string()})).optional(),
 cardRedraws:z.object({used:z.number().int().min(0).max(3),lastSeason:finite,nonce:z.number().int().min(0)}).optional(),
 marketWindow:marketSchema.optional(),marketAfterLoan:marketSchema.optional(),pendingTransfer:offerSchema.optional(),
 player:z.object({id:z.string(),name:z.string(),clubId:z.string(),nationality:z.string(),age:finite,form:finite,fame:finite,salary:finite,marketValue:finite,games:finite,goals:finite,assists:finite,cleanSheets:finite,saves:finite,injuries:finite,titles:z.array(z.string()),awards:z.array(z.string()),judasAt:z.array(z.string()),clubIdolatry:z.record(z.string(),finite)}).passthrough(),
 contract:z.object({clubId:z.string(),monthlySalary:finite,seasonsRemaining:finite,role:z.enum(['promessa','rotacao','titular','estrela']),expectedMinutes:finite}).passthrough(),
 shop:z.object({ownedPermanent:z.array(z.string()),activeSeasonal:z.array(z.string()),freeUses:z.array(z.string())}).passthrough(),
 nationalTeam:z.object({games:finite,goals:finite,assists:finite,titles:z.array(z.string())}).passthrough(),
 clubHistory:z.array(z.object({clubId:z.string(),titles:z.array(z.string())})),
 leagueAssignments:z.record(z.string(),z.string()),leagueTables:z.record(z.string(),z.object({entries:z.array(z.object({clubId:z.string(),points:finite,position:finite}).passthrough())}).passthrough()),
}).passthrough();

export interface CareerFlow {
  screen: string; lastResult: SeasonResult | null; event: CareerEvent | null;
  eventQueue: CareerEvent[]; seasonSummary: boolean; seasonConsequences: string[];
  upgradeReady: boolean; activeGame: MiniGameDefinition | null; gameAttempt: number;
  finalQueue: NonNullable<SeasonResult['finals']>;
  celebration: { title: string; access?: string } | null;
}
export interface SaveEnvelope { version: 8; career: CareerState; flow?: CareerFlow }
export const SAVE_KEY = 'o-rei-career';
export const BACKUP_KEY = 'o-rei-career:backup';
// Translate legacy competition labels at read time without changing the stored original.
const oldCompetitionNames:Record<string,string>={'Κύπελλο Ελλάδας':'Copa da Grécia','كأس خادم الحرمين الشريفين':'Copa do Rei Saudita','كأس السوبر السعودي':'Supercopa Saudita','天皇杯':'Copa do Imperador'};
function translateCompetitionLabels(value:unknown,key=''):unknown {
  if(Array.isArray(value)) return value.map(item=>translateCompetitionLabels(item,key));
  if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([name,item])=>[name,translateCompetitionLabels(item,name)]));
  if(typeof value==='string') {
    if(oldCompetitionNames[value]&&!['name','id','clubId','playerId'].includes(key)) return oldCompetitionNames[value];
    if(['competitionName','currentCompetition','leagueName','competition','title','titles','label','source'].includes(key)) return Object.entries(oldCompetitionNames).reduce((text,[oldName,newName])=>text.replaceAll(oldName,newName),value);
  }
  return value;
}
export function decodeSave(raw: string): SaveEnvelope {
  const parsed = JSON.parse(raw);
  const career = parsed.version === 8 ? parsed.career : parsed;
  if (!careerSchema.safeParse(career).success || ![6, 7, 8].includes(career?.saveVersion) || !['GOL','MEI','ATA'].includes(career?.player?.position)
    || !Array.isArray(career.history) || !career.contract || !career.shop
    || !Number.isFinite(career.season) || !Number.isFinite(career.balance)
    || Object.values(career.player.attributes ?? {}).length !== 12
    || !Object.values(career.player.attributes).every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100)) {
    throw new Error('Save incompatível ou danificado. O arquivo original foi preservado.');
  }
  if (parsed.version === 8 && parsed.flow && (!Array.isArray(parsed.flow.eventQueue) || !Array.isArray(parsed.flow.finalQueue))) throw new Error('Etapa do save inválida.');
  return { version: 8, career: translateCompetitionLabels({ ...career, saveVersion: 8 }) as CareerState, flow: parsed.version === 8 ? translateCompetitionLabels(parsed.flow) as CareerFlow|undefined : undefined };
}
export function readSave(storage: Pick<Storage,'getItem'>): { save?: SaveEnvelope; warning?: string } {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return {};
  try { return { save: decodeSave(raw) }; } catch {
    const backup = storage.getItem(BACKUP_KEY);
    if (backup) try { return { save: decodeSave(backup), warning: 'Backup recuperado. O save danificado continua preservado até você salvar novamente.' }; } catch { /* Keep both originals. */ }
    return { warning: 'Não foi possível abrir a carreira. Seus dados foram preservados. Importe um backup válido.' };
  }
}
export function writeSave(storage: Pick<Storage,'getItem'|'setItem'>, save: SaveEnvelope) {
  const next = JSON.stringify(save); decodeSave(next);
  const old = storage.getItem(SAVE_KEY);
  if (old && old !== next) { try { decodeSave(old); storage.setItem(BACKUP_KEY, old); } catch { storage.setItem('o-rei-career:damaged', old); } }
  storage.setItem(SAVE_KEY, next);
}

// Compatibility for future backend adapters; local saves use the validated envelope.
export interface CareerRepository {load():Promise<CareerState|null>;save(career:CareerState):Promise<void>;clear():Promise<void>}
export class LocalCareerRepository implements CareerRepository {
 async load(){return typeof window==='undefined'?null:readSave(localStorage).save?.career??null}
 async save(career:CareerState){if(typeof window!=='undefined')writeSave(localStorage,{version:8,career})}
 async clear(){if(typeof window!=='undefined'){const raw=localStorage.getItem(SAVE_KEY);if(raw)localStorage.setItem(BACKUP_KEY,raw);localStorage.removeItem(SAVE_KEY)}}
}
export interface CloudCareerGateway {read(userId:string):Promise<CareerState|null>;write(userId:string,career:CareerState):Promise<void>}
export async function syncCareer(local:CareerRepository,cloud:CloudCareerGateway,userId:string){const career=await local.load();if(career)await cloud.write(userId,career);return cloud.read(userId)}
