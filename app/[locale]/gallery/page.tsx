import { articlesApi, artistsApi, groupsApi } from "@/lib/api";
import type { Article } from "@/lib/types";
import { GalleryClient } from "./GalleryClient";

type ArtistCategory = "boy_group" | "girl_group" | "mixed_group" | "male_solo" | "female_solo" | "unknown";

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

  // 3페이지 병렬 fetch로 최대 300개 기사 + artists/groups 카테고리 정보
  const [p0, p1, p2, allArtists, allGroups] = await Promise.all([
    articlesApi.list({ limit: 100, has_thumbnail: true, offset: 0 }).catch(() => [] as Article[]),
    articlesApi.list({ limit: 100, has_thumbnail: true, offset: 100 }).catch(() => [] as Article[]),
    articlesApi.list({ limit: 100, has_thumbnail: true, offset: 200 }).catch(() => [] as Article[]),
    artistsApi.list({ limit: 200 }).catch(() => []),
    groupsApi.list({ limit: 200 }).catch(() => []),
  ]);
  const articles = [...p0, ...p1, ...p2];

  // 이름→gender 룩업맵 (name_ko + stage_name_ko 모두 등록)
  const artistGenderMap = new Map<string, string | null>();
  for (const a of allArtists) {
    if (a.name_ko) artistGenderMap.set(a.name_ko, a.gender);
    if (a.stage_name_ko) artistGenderMap.set(a.stage_name_ko, a.gender);
  }
  const groupGenderMap = new Map<string, string | null>();
  for (const g of allGroups) {
    if (g.name_ko) groupGenderMap.set(g.name_ko, g.gender);
    if (g.name_en) groupGenderMap.set(g.name_en, g.gender);
  }

  function resolveCategory(name: string): ArtistCategory {
    const gg = groupGenderMap.get(name)?.toUpperCase();
    if (gg === "MALE")   return "boy_group";
    if (gg === "FEMALE") return "girl_group";
    if (gg === "MIXED")  return "mixed_group";
    const ag = artistGenderMap.get(name)?.toUpperCase();
    if (ag === "MALE")   return "male_solo";
    if (ag === "FEMALE") return "female_solo";
    return "unknown";
  }

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

  // 사진 많은 순 정렬 + category 추가 (seenUrls는 클라이언트에 불필요하므로 제외)
  const artistGroups = Array.from(artistMap.values())
    .sort((a, b) => b.photos.length - a.photos.length)
    .map(({ name, photos }) => ({ name, photos, category: resolveCategory(name) }));

  return <GalleryClient artistGroups={artistGroups} locale={locale} />;
}
