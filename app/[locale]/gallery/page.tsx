import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { articlesApi } from "@/lib/api";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("nav");
  const isKo = locale === "ko";

  const articles = await articlesApi
    .list({ limit: 100, has_thumbnail: true })
    .catch(() => []);

  // 아티스트별 그룹화
  const artistMap = new Map<
    string,
    { name: string; photos: typeof articles }
  >();

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

  const totalPhotos = articles.filter((a) => a.thumbnail_url).length;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">{t("gallery")}</h1>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
          {totalPhotos}{isKo ? "장" : " photos"}
        </span>
      </div>

      {artistGroups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-8 py-16 text-center">
          <p className="text-muted-foreground text-sm">
            {isKo ? "사진이 없습니다." : "No photos yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {artistGroups.map(({ name, photos }) => (
            <section key={name}>
              {/* Artist header */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-bold text-base">{name}</h2>
                <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {photos.length}
                </span>
              </div>

              {/* Photos grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {photos.map((article) => {
                  const title = isKo
                    ? article.title_ko
                    : (article.title_en ?? article.title_ko);
                  return (
                    <a
                      key={article.id}
                      href={article.source_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted hover:border-primary/40 transition-all duration-200"
                    >
                      <Image
                        src={article.thumbnail_url!}
                        alt={title ?? ""}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
                        unoptimized
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5">
                        <p className="text-[9px] text-white line-clamp-2 leading-tight">
                          {title}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
