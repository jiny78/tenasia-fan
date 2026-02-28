import type { Article, Artist, Group, SearchResult } from "./types";

// 서버 컴포넌트: FASTAPI_URL (서버 전용)
// 클라이언트 컴포넌트: NEXT_PUBLIC_API_URL (빌드타임 고정 금지 → 프록시 경유)
const SERVER_BASE =
  (typeof window === "undefined"
    ? process.env.FASTAPI_URL
    : undefined) ?? "";

const CLIENT_BASE =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE
    : undefined) ?? "";

function base() {
  return typeof window === "undefined" ? SERVER_BASE : CLIENT_BASE;
}

async function get<T>(path: string): Promise<T> {
  const url = `${base()}${path}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ── Articles ────────────────────────────────────────────────

export const articlesApi = {
  list: (params?: {
    limit?: number;
    offset?: number;
    artist_id?: number;
    group_id?: number;
    language?: string;
    q?: string;
    has_thumbnail?: boolean;
  }) =>
    get<Article[]>(
      `/public/articles${qs({ limit: 20, ...params })}`
    ),

  get: (id: number) => get<Article>(`/public/articles/${id}`),
};

// ── Artists ─────────────────────────────────────────────────

export const artistsApi = {
  list: (params?: { q?: string; limit?: number; global_priority?: number }) =>
    get<Artist[]>(`/public/artists${qs({ limit: 50, ...params })}`),

  get: (id: number) => get<Artist>(`/public/artists/${id}`),

  articles: (id: number, params?: { limit?: number; offset?: number }) =>
    get<Article[]>(`/public/artists/${id}/articles${qs({ limit: 20, ...params })}`),
};

// ── Groups ──────────────────────────────────────────────────

export const groupsApi = {
  list: (params?: { q?: string; limit?: number }) =>
    get<Group[]>(`/public/groups${qs({ limit: 50, ...params })}`),

  get: (id: number) => get<Group>(`/public/groups/${id}`),

  articles: (id: number, params?: { limit?: number; offset?: number }) =>
    get<Article[]>(`/public/groups/${id}/articles${qs({ limit: 20, ...params })}`),
};

// ── Search ──────────────────────────────────────────────────

export const searchApi = {
  search: (q: string, limit = 20) =>
    get<SearchResult>(`/public/search${qs({ q, limit })}`),
};

// ── Admin ────────────────────────────────────────────────────

export interface EntityMappingItem {
  id: number;
  article_id: number;
  article_title_ko: string | null;
  article_url: string | null;
  entity_type: string | null;
  artist_id: number | null;
  artist_name_ko: string | null;
  group_id: number | null;
  group_name_ko: string | null;
  confidence_score: number | null;
}

async function patch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const url = `${base()}${path}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function del<T>(path: string): Promise<T> {
  const url = `${base()}${path}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const url = `${base()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const adminApi = {
  updateGroup: (id: number, data: { activity_status?: string; bio_ko?: string; bio_en?: string }) =>
    patch<Group>(`/public/groups/${id}`, data),

  updateArtist: (id: number, data: { bio_ko?: string; bio_en?: string }) =>
    patch<Artist>(`/public/artists/${id}`, data),

  listMappings: (params?: { article_id?: number; artist_id?: number; group_id?: number }) =>
    get<EntityMappingItem[]>(`/public/entity-mappings${qs({ ...params })}`),

  deleteMapping: (id: number) =>
    del<{ deleted: number }>(`/public/entity-mappings/${id}`),

  createMapping: (data: { article_id: number; artist_id?: number; group_id?: number; confidence_score?: number }) =>
    post<{ created: number }>(`/public/entity-mappings`, data),
};
