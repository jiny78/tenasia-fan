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

  // 아티스트별 그룹화
  const artistMap = new Map<string, { name: string; photos: Article[] }>();

  for (const article of articles) {
    if (!article.thumbnail_url) continue;
    const artistKey =
      (isKo
        ? article.artist_name_ko
        : (article.artist_name_en ?? article.artist_name_ko)) ?? "기타";
    if (!artistMap.has(artistKey)) {
      artistMap.set(artistKey, { name: artistKey, photos: [] });
    }
    artistMap.get(artistKey)!.photos.push(article);
  }

  // 사진 많은 아티스트 순 정렬
  const artistGroups = Array.from(artistMap.values()).sort(
    (a, b) => b.photos.length - a.photos.length
  );

  return (
    <GalleryClient artistGroups={artistGroups} locale={locale} />
  );
}
