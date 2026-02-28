"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ExternalLink, ArrowLeft } from "lucide-react";
import type { Article } from "@/lib/types";

interface ArtistGroup {
  name: string;
  photos: Article[];
}

interface Props {
  artistGroups: ArtistGroup[];
  locale: string;
}

export function GalleryClient({ artistGroups, locale }: Props) {
  const isKo = locale === "ko";

  // 선택된 아티스트 (null = 아티스트 목록 뷰)
  const [selectedArtist, setSelectedArtist] = useState<ArtistGroup | null>(null);

  // 라이트박스
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isLightboxOpen = lightboxIndex !== null;
  const photos = selectedArtist?.photos ?? [];
  const current = lightboxIndex !== null ? photos[lightboxIndex] : null;

  const openAt = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i > 0 ? i - 1 : photos.length - 1) : null)),
    [photos.length]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i < photos.length - 1 ? i + 1 : 0) : null)),
    [photos.length]
  );

  // 키보드 이벤트
  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLightboxOpen, prev, next]);

  // 라이트박스 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isLightboxOpen]);

  // 아티스트 선택 시 라이트박스 초기화
  const selectArtist = (group: ArtistGroup) => {
    setLightboxIndex(null);
    setSelectedArtist(group);
  };
  const backToList = () => {
    setLightboxIndex(null);
    setSelectedArtist(null);
  };

  const totalPhotos = artistGroups.reduce((s, g) => s + g.photos.length, 0);

  // ── 뷰 1: 아티스트 목록 ─────────────────────────────────────
  if (!selectedArtist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl">{isKo ? "갤러리" : "Gallery"}</h1>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
            {artistGroups.length}{isKo ? "명" : " artists"} · {totalPhotos}{isKo ? "장" : " photos"}
          </span>
        </div>

        {artistGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 px-8 py-20 text-center">
            <p className="text-muted-foreground text-sm">
              {isKo ? "사진이 없습니다." : "No photos yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
            {artistGroups.map((group) => {
              const coverPhoto = group.photos[0];
              return (
                <button
                  key={group.name}
                  onClick={() => selectArtist(group)}
                  className="group flex flex-col items-center gap-2 focus:outline-none"
                >
                  {/* 원형 썸네일 */}
                  <div className="relative w-full aspect-square rounded-full overflow-hidden bg-muted ring-2 ring-transparent group-hover:ring-primary/60 transition-all duration-200 group-focus-visible:ring-primary">
                    {coverPhoto?.thumbnail_url ? (
                      <Image
                        src={coverPhoto.thumbnail_url}
                        alt={group.name}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 10vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                        {group.name.charAt(0)}
                      </div>
                    )}
                    {/* 사진 수 뱃지 */}
                    <div className="absolute bottom-0.5 right-0.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white leading-none">
                      {group.photos.length}
                    </div>
                  </div>
                  {/* 이름 */}
                  <p className="w-full truncate text-center text-[11px] font-medium group-hover:text-primary transition-colors">
                    {group.name}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── 뷰 2: 아티스트별 사진 ────────────────────────────────────
  return (
    <>
      <div className="space-y-5">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <button
            onClick={backToList}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isKo ? "뒤로" : "Back"}
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl">{selectedArtist.name}</h1>
            <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {photos.length}{isKo ? "장" : " photos"}
            </span>
          </div>
        </div>

        {/* 사진 그리드 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
          {photos.map((article, idx) => {
            const title = isKo
              ? article.title_ko
              : (article.title_en ?? article.title_ko);
            return (
              <button
                key={article.id}
                onClick={() => openAt(idx)}
                className="group relative aspect-square overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Image
                  src={article.thumbnail_url!}
                  alt={title ?? ""}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 라이트박스 ── */}
      {isLightboxOpen && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* 닫기 */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 카운터 */}
          <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1 text-xs text-white font-medium">
            {lightboxIndex! + 1} / {photos.length}
          </div>

          {/* 이전 */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* 사진 */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.id}
              src={current.thumbnail_url!}
              alt={selectedArtist.name}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />

            {/* 하단 정보 */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-12">
              <p className="font-bold text-sm text-white">{selectedArtist.name}</p>
              <p className="mt-0.5 text-xs text-white/70 line-clamp-1">
                {isKo ? current.title_ko : (current.title_en ?? current.title_ko)}
              </p>
              {current.source_url && (
                <a
                  href={current.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 text-[11px] text-white hover:bg-white/25 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {isKo ? "원문 보기" : "View article"}
                </a>
              )}
            </div>
          </div>

          {/* 다음 */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* 하단 썸네일 스트립 */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 px-4 pointer-events-none">
            {photos
              .slice(Math.max(0, lightboxIndex! - 4), Math.min(photos.length, lightboxIndex! + 5))
              .map((p, i) => {
                const idx = Math.max(0, lightboxIndex! - 4) + i;
                const isCurrent = idx === lightboxIndex;
                return (
                  <button
                    key={p.id}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    className={`pointer-events-auto shrink-0 h-12 w-12 overflow-hidden rounded transition-all duration-200 ${
                      isCurrent ? "ring-2 ring-white scale-110 opacity-100" : "opacity-40 hover:opacity-70"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumbnail_url!} alt="" className="h-full w-full object-cover object-top" />
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
}
