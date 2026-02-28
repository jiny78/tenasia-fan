"use client";

import { useState } from "react";
import type { EntityMappingItem } from "@/lib/api";
import { Trash2, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  mappings: EntityMappingItem[];
  locale: string;
  filterArtistId?: number;
  filterGroupId?: number;
  filterArticleId?: number;
}

export function MappingsEditor({ mappings: initialMappings, locale, filterArtistId, filterGroupId, filterArticleId }: Props) {
  const [mappings, setMappings] = useState(initialMappings);
  const [deleting, setDeleting] = useState<Record<number, boolean>>({});
  const router = useRouter();

  // New mapping form
  const [newArticleId, setNewArticleId] = useState("");
  const [newArtistId, setNewArtistId]   = useState(filterArtistId ? String(filterArtistId) : "");
  const [newGroupId, setNewGroupId]     = useState(filterGroupId ? String(filterGroupId) : "");
  const [adding, setAdding]             = useState(false);
  const [addError, setAddError]         = useState("");

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "";

  async function handleDelete(id: number) {
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${apiBase}/public/entity-mappings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setMappings((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert(`삭제 실패: ${e}`);
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newArticleId) return;
    if (!newArtistId && !newGroupId) {
      setAddError("아티스트 ID 또는 그룹 ID 중 하나를 입력하세요.");
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      const body: Record<string, unknown> = {
        article_id: Number(newArticleId),
        confidence_score: 1.0,
      };
      if (newArtistId) body.artist_id = Number(newArtistId);
      if (newGroupId)  body.group_id  = Number(newGroupId);

      const res = await fetch(`${apiBase}/public/entity-mappings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      // Refresh the list
      router.refresh();
      setNewArticleId("");
      if (!filterArtistId) setNewArtistId("");
      if (!filterGroupId)  setNewGroupId("");
    } catch (e) {
      setAddError(`추가 실패: ${e}`);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new mapping */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">새 매핑 추가</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">기사 ID *</label>
            <input
              type="number"
              value={newArticleId}
              onChange={(e) => setNewArticleId(e.target.value)}
              placeholder="기사 ID"
              required
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">아티스트 ID</label>
            <input
              type="number"
              value={newArtistId}
              onChange={(e) => setNewArtistId(e.target.value)}
              placeholder="아티스트 ID"
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">그룹 ID</label>
            <input
              type="number"
              value={newGroupId}
              onChange={(e) => setNewGroupId(e.target.value)}
              placeholder="그룹 ID"
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            추가
          </button>
        </form>
        {addError && <p className="text-xs text-rose-500">{addError}</p>}
      </div>

      {/* Mappings list */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">기사</th>
              <th className="px-4 py-3 text-left">엔티티</th>
              <th className="px-4 py-3 text-left">신뢰도</th>
              <th className="px-4 py-3 text-center">삭제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mappings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  매핑 없음
                </td>
              </tr>
            )}
            {mappings.map((m) => (
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{m.id}</td>
                <td className="px-4 py-2.5">
                  <p className="text-xs font-medium line-clamp-1">
                    {m.article_title_ko ?? `기사 #${m.article_id}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">id={m.article_id}</p>
                </td>
                <td className="px-4 py-2.5">
                  {m.entity_type === "ARTIST" ? (
                    <span>
                      <span className="inline-block rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-semibold px-1.5 py-0.5 mr-1">아티스트</span>
                      {m.artist_name_ko ?? `#${m.artist_id}`}
                    </span>
                  ) : (
                    <span>
                      <span className="inline-block rounded-full bg-pink-500/15 text-pink-400 text-[10px] font-semibold px-1.5 py-0.5 mr-1">그룹</span>
                      {m.group_name_ko ?? `#${m.group_id}`}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {m.confidence_score != null ? (m.confidence_score * 100).toFixed(0) + "%" : "—"}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deleting[m.id]}
                    className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-50 transition-colors"
                    title="매핑 삭제"
                  >
                    {deleting[m.id] ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        총 {mappings.length}개 매핑
      </p>
    </div>
  );
}
