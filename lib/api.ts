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
