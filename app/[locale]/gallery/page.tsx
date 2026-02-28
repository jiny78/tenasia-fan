import { articlesApi } from "@/lib/api";
import type { Article } from "@/lib/types";
import { GalleryClient } from "./GalleryClient";

/** 쿼리스트링·해시 제거 후 비교용 URL 정규화 */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url.split("?")[0].split("#")[0];
  }
}

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
  const artistMap = new Map<string, { name: string; photos: Article[]; seenUrls: Set<string> }>();

  for (const article of articles) {
    if (!article.thumbnail_url) continue;

    const artistName = isKo
      ? article.artist_name_ko
      : (article.artist_name_en ?? article.artist_name_ko);

    // 아티스트명 없으면 건너뜀 (기타 카테고리 제거)
    if (!artistName) continue;

    if (!artistMap.has(artistName)) {
      artistMap.set(artistName, { name: artistName, photos: [], seenUrls: new Set() });
    }

    const group = artistMap.get(artistName)!;
    const normalized = normalizeUrl(article.thumbnail_url);

    // 정규화된 URL로 중복 제거 (쿼리스트링 차이 무시)
    if (!group.seenUrls.has(normalized)) {
      group.seenUrls.add(normalized);
      group.photos.push(article);
    }
  }

  // 사진 많은 순 정렬 (seenUrls는 클라이언트에 불필요하므로 제외)
  const artistGroups = Array.from(artistMap.values())
    .sort((a, b) => b.photos.length - a.photos.length)
    .map(({ name, photos }) => ({ name, photos }));

  return <GalleryClient artistGroups={artistGroups} locale={locale} />;
}
