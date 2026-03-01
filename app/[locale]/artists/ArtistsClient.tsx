"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { ArtistCard } from "@/components/ArtistCard";
import type { Artist, Group } from "@/lib/types";

function isMale(gender: string | null) {
  if (!gender) return false;
  const g = gender.toUpperCase();
  return g === "MALE" || g === "M" || g === "남성" || g === "남";
}

function isFemale(gender: string | null) {
  if (!gender) return false;
  const g = gender.toUpperCase();
  return g === "FEMALE" || g === "F" || g === "여성" || g === "여";
}

function isMixed(gender: string | null) {
  if (!gender) return false;
  const g = gender.toUpperCase();
  return g === "MIXED" || g === "혼성";
}

interface GroupCardProps {
  group: Group;
  locale: string;
  isKo: boolean;
}

function GroupCard({ group, locale, isKo }: GroupCardProps) {
  const name = isKo ? group.name_ko : (group.name_en ?? group.name_ko);
  return (
    <Link href={`/${locale}/groups/${group.id}`} className="group block">
      <div className="rounded-xl overflow-hidden border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
        <div className="relative aspect-square w-full bg-muted overflow-hidden">
          {group.photo_url ? (
            <Image
              src={group.photo_url}
              alt={name ?? ""}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500 to-orange-400 text-white text-4xl font-bold">
              {(name ?? "?").charAt(0)}
            </div>
          )}
        </div>
        <div className="px-3 py-2.5 space-y-0.5">
          <div className="flex items-center gap-1">
            <p className="truncate font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {name}
            </p>
            {group.is_verified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            )}
          </div>
          {group.fandom_name_ko && (
            <p className="text-[10px] text-muted-foreground truncate">
              {isKo ? group.fandom_name_ko : (group.fandom_name_en ?? group.fandom_name_ko)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────────────────

type FilterKey = "all" | "boy_group" | "girl_group" | "mixed_group" | "male_solo" | "female_solo";

const GROUP_FILTERS: { key: FilterKey; label: string }[] = [
  { key: "boy_group",   label: "보이그룹" },
  { key: "girl_group",  label: "걸그룹" },
  { key: "mixed_group", label: "혼성 그룹" },
];

const SOLO_FILTERS: { key: FilterKey; label: string }[] = [
  { key: "male_solo",   label: "남자아이돌" },
  { key: "female_solo", label: "여자아이돌" },
];

export function ArtistsClient({
  artists,
  groups,
  locale,
  isKo,
}: {
  artists: Artist[];
  groups: Group[];
  locale: string;
  isKo: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey | string>("all");

  // 소속사별 레이블 (그룹 수 많은 순)
  const labels = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of groups) {
      if (g.label_ko) counts[g.label_ko] = (counts[g.label_ko] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => label);
  }, [groups]);

  const isLabelFilter = typeof filter === "string" && filter.startsWith("label:");

  const filteredGroups = useMemo(() => {
    if (isLabelFilter) return groups.filter((g) => g.label_ko === filter.slice(6));
    if (filter === "boy_group")   return groups.filter((g) => isMale(g.gender));
    if (filter === "girl_group")  return groups.filter((g) => isFemale(g.gender));
    if (filter === "mixed_group") return groups.filter((g) => isMixed(g.gender));
    if (filter === "male_solo" || filter === "female_solo") return [];
    return groups; // "all"
  }, [groups, filter, isLabelFilter]);

  const filteredArtists = useMemo(() => {
    if (isLabelFilter) return [];
    if (filter === "boy_group" || filter === "girl_group" || filter === "mixed_group") return [];
    if (filter === "male_solo")   return artists.filter((a) => isMale(a.gender));
    if (filter === "female_solo") return artists.filter((a) => isFemale(a.gender));
    return artists; // "all"
  }, [artists, filter, isLabelFilter]);

  const counts = useMemo(() => ({
    all:         groups.length + artists.length,
    boy_group:   groups.filter((g) => isMale(g.gender)).length,
    girl_group:  groups.filter((g) => isFemale(g.gender)).length,
    mixed_group: groups.filter((g) => isMixed(g.gender)).length,
    male_solo:   artists.filter((a) => isMale(a.gender)).length,
    female_solo: artists.filter((a) => isFemale(a.gender)).length,
  }), [groups, artists]);

  function NavItem({ k, label, count }: { k: string; label: string; count: number }) {
    const active = filter === k;
    return (
      <button
        onClick={() => setFilter(k)}
        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
          active
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <span>{label}</span>
        <span className={`text-xs rounded-full px-1.5 py-0.5 tabular-nums ${active ? "bg-primary/20" : "bg-muted"}`}>
          {count}
        </span>
      </button>
    );
  }

  const allFilters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "전체" },
    ...GROUP_FILTERS,
    ...SOLO_FILTERS,
  ];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-8">

      {/* ── Mobile: horizontal pill tabs ── */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {allFilters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            <span className="opacity-70 tabular-nums">{counts[key as FilterKey]}</span>
          </button>
        ))}
        {labels.map((label) => (
          <button
            key={label}
            onClick={() => setFilter(`label:${label}`)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === `label:${label}`
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Desktop: sidebar ── */}
      <aside className="hidden md:block w-44 shrink-0">
        <nav className="sticky top-20 space-y-0.5">
          <NavItem k="all" label="전체" count={counts.all} />

          <div className="pt-4">
            <p className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              그룹
            </p>
            <div className="space-y-0.5">
              {GROUP_FILTERS.map(({ key, label }) => (
                <NavItem key={key} k={key} label={label} count={counts[key]} />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <p className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              개별
            </p>
            <div className="space-y-0.5">
              {SOLO_FILTERS.map(({ key, label }) => (
                <NavItem key={key} k={key} label={label} count={counts[key]} />
              ))}
            </div>
          </div>

          {labels.length > 0 && (
            <div className="pt-4">
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                소속사별
              </p>
              <div className="space-y-0.5">
                {labels.map((label) => {
                  const k = `label:${label}`;
                  const cnt = groups.filter((g) => g.label_ko === label).length;
                  const active = filter === k;
                  return (
                    <button
                      key={label}
                      onClick={() => setFilter(k)}
                      className={`w-full text-left flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      <span className={`shrink-0 ml-1 rounded-full px-1.5 py-0.5 tabular-nums ${active ? "bg-primary/20" : "bg-muted"}`}>
                        {cnt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-10">
        {/* Groups grid */}
        {filteredGroups.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">그룹</h2>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                {filteredGroups.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGroups.map((group) => (
                <GroupCard key={group.id} group={group} locale={locale} isKo={isKo} />
              ))}
            </div>
          </section>
        )}

        {/* Solo artists grid */}
        {filteredArtists.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">솔로</h2>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                {filteredArtists.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {filteredGroups.length === 0 && filteredArtists.length === 0 && (
          <div className="py-20 text-center text-sm text-muted-foreground">
            해당 분류의 아이돌이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
