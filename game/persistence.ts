import type { CareerState } from "./types";

const localKey = "o-rei:career:v1";

export interface CareerRepository {
  load(): Promise<CareerState | null>;
  save(career: CareerState): Promise<void>;
  clear(): Promise<void>;
}

export class LocalCareerRepository implements CareerRepository {
  async load() {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(localKey);
    return stored ? JSON.parse(stored) as CareerState : null;
  }
  async save(career: CareerState) {
    if (typeof window !== "undefined") window.localStorage.setItem(localKey, JSON.stringify(career));
  }
  async clear() {
    if (typeof window !== "undefined") window.localStorage.removeItem(localKey);
  }
}

/** Adapter contract for the Supabase client supplied by Lovable after authentication is enabled. */
export interface CloudCareerGateway {
  read(userId: string): Promise<CareerState | null>;
  write(userId: string, career: CareerState): Promise<void>;
}

export async function syncCareer(local: CareerRepository, cloud: CloudCareerGateway, userId: string) {
  const career = await local.load();
  if (career) await cloud.write(userId, career);
  return cloud.read(userId);
}
