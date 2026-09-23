import type { CareerState } from "./types";

type SupabaseSession = { access_token: string; user: { id: string; email?: string } };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function configured() {
  return Boolean(url && anonKey);
}

function headers(token?: string) {
  if (!anonKey) throw new Error("Supabase não configurado.");
  return { apikey: anonKey, Authorization: `Bearer ${token ?? anonKey}`, "Content-Type": "application/json" };
}

/** Cliente REST pequeno: evita salvar credenciais ou tokens no estado da carreira. */
export const supabaseCareer = {
  configured,
  async signInWithGoogle(returnTo = window.location.origin) {
    if (!configured()) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    window.location.assign(`${url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(returnTo)}`);
  },
  async signInWithPassword(email: string, password: string) {
    if (!configured()) throw new Error("Supabase não configurado.");
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: headers(), body: JSON.stringify({ email, password }) });
    if (!response.ok) throw new Error("Não foi possível entrar com este e-mail e senha.");
    return response.json() as Promise<SupabaseSession>;
  },
  async signUp(email: string, password: string) {
    if (!configured()) throw new Error("Supabase não configurado.");
    const response = await fetch(`${url}/auth/v1/signup`, { method: "POST", headers: headers(), body: JSON.stringify({ email, password }) });
    if (!response.ok) throw new Error("Não foi possível criar a conta.");
    return response.json() as Promise<Partial<SupabaseSession>>;
  },
  async currentUser(token: string) {
    if (!configured()) throw new Error("Supabase não configurado.");
    const response = await fetch(`${url}/auth/v1/user`, { headers: headers(token) });
    if (!response.ok) throw new Error("Sessão inválida.");
    return response.json() as Promise<{ id: string; email?: string }>;
  },
  async load(userId: string, token: string): Promise<CareerState | null> {
    const response = await fetch(`${url}/rest/v1/careers?user_id=eq.${encodeURIComponent(userId)}&select=state,updated_at`, { headers: headers(token) });
    if (!response.ok) throw new Error("Não foi possível carregar a carreira online.");
    const rows = await response.json() as Array<{ state: CareerState }>;
    return rows[0]?.state ?? null;
  },
  async save(userId: string, token: string, state: CareerState) {
    const response = await fetch(`${url}/rest/v1/careers?on_conflict=user_id`, { method: "POST", headers: { ...headers(token), Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ user_id: userId, state, updated_at: new Date().toISOString() }) });
    if (!response.ok) throw new Error("Não foi possível sincronizar a carreira online.");
  },
};
