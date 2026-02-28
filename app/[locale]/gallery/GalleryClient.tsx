"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { Article } from "@/lib/types";

interface PhotoItem {
  article: Article;
  artistName: string;
}

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

  // 전체 사진 목록 (라이트박스 내비게이션용)
  const allPhotos: PhotoItem[] = artistGroups.flatMap((group) =>
    group.photos.map((article) => ({ article, artistName: group.name }))
  );

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isOpen = lightboxIndex !== null;
  const current = lightboxIndex !== null ? allPhotos[lightboxIndex] : null;

  const openAt = (globalIdx: number) => setLightboxIndex(globalIdx);
  const close   = () => setLightboxIndex(null);
  const prev    = useCallback(() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : allPhotos.length - 1)), [allPhotos.length]);
  const next    = useCallback(() => setLightboxIndex((i) => (i !== null && i < allPhotos.length - 1 ? i + 1 : 0)), [allPhotos.length]);

  // 키보드 이벤트
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, prev, next]);

  // 라이트박스 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // 아티스트별 globalIdx 시작 위치 계산
  let globalOffset = 0;
  const groupsWithOffset = artistGroups.map((group) => {
    const offset = globalOffset;
    globalOffset += group.photos.length;
    return { ...group, offset };
  });

  const totalPhotos = allPhotos.length;

  if (totalPhotos === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-8 py-20 text-center mt-8">
        <p className="text-muted-foreground text-sm">
          {isKo ? "사진이 없습니다." : "No photos yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-bold text-2xl">{isKo ? "갤러리" : "Gallery"}</h1>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
          {totalPhotos}{isKo ? "장" : " photos"}
        </span>
      </div>

      {/* 아티스트별 섹션 */}
      <div className="space-y-10">
        {groupsWithOffset.map(({ name, photos, offset }) => (
          <section key={name}>
            {/* 아티스트 헤더 */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-4 w-1 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
              <h2 className="font-bold text-sm tracking-wide">{name}</h2>
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {photos.length}
              </span>
            </div>

            {/* 사진 그리드 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1">
              {photos.map((article, localIdx) => {
                const globalIdx = offset + localIdx;
                const title = isKo
                  ? article.title_ko
                  : (article.title_en ?? article.title_ko);
                return (
                  <button
                    key={article.id}
                    onClick={() => openAt(globalIdx)}
                    className="group relative aspect-square overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Image
                      src={article.thumbnail_url!}
                      alt={title ?? ""}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 12vw"
                      unoptimized
                    />
                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
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
          </section>
        ))}
      </div>

      {/* ── 라이트박스 ── */}
      {isOpen && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={close}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 카운터 */}
          <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1 text-xs text-white font-medium">
            {lightboxIndex! + 1} / {totalPhotos}
          </div>

          {/* 이전 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
            aria-label="이전"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* 사진 */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.article.id}
              src={current.article.thumbnail_url!}
              alt={current.artistName}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              style={{ minWidth: 200 }}
            />

            {/* 하단 정보 바 */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-10">
              <p className="font-bold text-sm text-white">{current.artistName}</p>
              <p className="mt-0.5 text-xs text-white/70 line-clamp-1">
                {isKo
                  ? current.article.title_ko
                  : (current.article.title_en ?? current.article.title_ko)}
              </p>
              {current.article.source_url && (
                <a
                  href={current.article.source_url}
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

          {/* 다음 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
            aria-label="다음"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* 하단 썸네일 스트립 */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-3 px-4 overflow-hidden pointer-events-none">
            {allPhotos.slice(
              Math.max(0, lightboxIndex! - 4),
              Math.min(allPhotos.length, lightboxIndex! + 5)
            ).map((item, i) => {
              const idx = Math.max(0, lightboxIndex! - 4) + i;
              const isCurrent = idx === lightboxIndex;
              return (
                <button
                  key={item.article.id}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  className={`pointer-events-auto shrink-0 h-12 w-12 overflow-hidden rounded transition-all duration-200 ${
                    isCurrent ? "ring-2 ring-white scale-110 opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.article.thumbnail_url!}
                    alt=""
                    className="h-full w-full object-cover object-top"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
