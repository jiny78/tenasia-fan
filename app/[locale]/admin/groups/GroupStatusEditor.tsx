"use client";

import { useState } from "react";
import type { Group } from "@/lib/types";
import { Check, Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "ACTIVE",     label: "활동 중" },
  { value: "HIATUS",     label: "활동 중단" },
  { value: "DISBANDED",  label: "해체" },
  { value: "SOLO_ONLY",  label: "솔로 활동" },
];

interface Props {
  groups: Group[];
  locale: string;
}

export function GroupStatusEditor({ groups, locale }: Props) {
  const [statuses, setStatuses] = useState<Record<number, string>>(
    Object.fromEntries(groups.map((g) => [g.id, g.activity_status ?? ""]))
  );
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<Record<number, string>>({});

  const isKo = locale === "ko";

  async function handleChange(groupId: number, newStatus: string) {
    setStatuses((prev) => ({ ...prev, [groupId]: newStatus }));
    setSaving((prev) => ({ ...prev, [groupId]: true }));
    setSaved((prev) => ({ ...prev, [groupId]: false }));
    setError((prev) => ({ ...prev, [groupId]: "" }));

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "";
      const res = await fetch(`${apiBase}/public/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaved((prev) => ({ ...prev, [groupId]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [groupId]: false })), 2000);
    } catch (e) {
      setError((prev) => ({ ...prev, [groupId]: String(e) }));
    } finally {
      setSaving((prev) => ({ ...prev, [groupId]: false }));
    }
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">그룹</th>
            <th className="px-4 py-3 text-left">현재 상태</th>
            <th className="px-4 py-3 text-left">변경</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {groups.map((group) => {
            const name = isKo ? group.name_ko : (group.name_en ?? group.name_ko);
            const currentStatus = statuses[group.id] ?? "";
            const isSaving = saving[group.id];
            const isSaved = saved[group.id];
            const errMsg = error[group.id];

            return (
              <tr key={group.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {STATUS_OPTIONS.find((s) => s.value === currentStatus)?.label ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={currentStatus}
                      onChange={(e) => handleChange(group.id, e.target.value)}
                      disabled={isSaving}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    >
                      <option value="">— 미설정 —</option>
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                    {isSaved && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                    {errMsg && <span className="text-xs text-rose-500">오류</span>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
