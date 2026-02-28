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

  const withThumbs = articles.filter((a) => a.thumbnail_url);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">{t("gallery")}</h1>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
          {withThumbs.length}
        </span>
      </div>

      {withThumbs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-8 py-16 text-center">
          <p className="text-muted-foreground text-sm">
            {isKo ? "사진이 없습니다." : "No photos yet."}
          </p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
          {withThumbs.map((article) => {
            const artistName = isKo
              ? article.artist_name_ko
              : (article.artist_name_en ?? article.artist_name_ko);
            const title = isKo
              ? article.title_ko
              : (article.title_en ?? article.title_ko);
            return (
              <a
                key={article.id}
                href={article.source_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group block break-inside-avoid rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="relative w-full overflow-hidden bg-muted">
                  <Image
                    src={article.thumbnail_url!}
                    alt={title ?? ""}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <div className="px-2.5 py-2 space-y-0.5">
                  {artistName && (
                    <p className="text-[10px] font-semibold text-primary truncate">
                      {artistName}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                    {title}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
