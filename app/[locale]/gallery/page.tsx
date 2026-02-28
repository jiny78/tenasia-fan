import { articlesApi } from "@/lib/api";
import type { Article } from "@/lib/types";
import { GalleryClient } from "./GalleryClient";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKo = locale === "ko";

  const articles = await articlesApi
    .list({ limit: 100, has_thumbnail: true })
    .catch(() => []);

  // 아티스트별 그룹화 — 아티스트명 없는 항목(기타) 제외, 중복 썸네일 제거
  const artistMap = new Map<string, { name: string; photos: Article[] }>();

  for (const article of articles) {
    if (!article.thumbnail_url) continue;

    const artistName = isKo
      ? article.artist_name_ko
      : (article.artist_name_en ?? article.artist_name_ko);

    // 아티스트명 없으면 건너뜀 (기타 카테고리 제거)
    if (!artistName) continue;

    if (!artistMap.has(artistName)) {
      artistMap.set(artistName, { name: artistName, photos: [] });
    }

    const group = artistMap.get(artistName)!;

    // 중복 썸네일 제거
    if (!group.photos.some((p) => p.thumbnail_url === article.thumbnail_url)) {
      group.photos.push(article);
    }
  }

  // 사진 많은 순 정렬
  const artistGroups = Array.from(artistMap.values()).sort(
    (a, b) => b.photos.length - a.photos.length
  );

  return <GalleryClient artistGroups={artistGroups} locale={locale} />;
}
