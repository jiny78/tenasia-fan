import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { artistsApi, groupsApi, articlesApi } from "@/lib/api";
import { ChevronRight, Users, Sparkles } from "lucide-react";
import { IdolCarousel, type IdolItem } from "@/components/IdolCarousel";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const isKo = locale === "ko";

  const [artists, groups, articles] = await Promise.all([
    artistsApi.list({ limit: 200 }).catch(() => []),
    groupsApi.list({ limit: 200 }).catch(() => []),
    articlesApi.list({ limit: 6 }).catch(() => []),
  ]);

  // 그룹 + 아티스트를 하나의 pool로 합쳐서 IdolCarousel에 전달
  const idolPool: IdolItem[] = [
    ...groups.map((g) => ({
      id: g.id,
      name: isKo ? g.name_ko : (g.name_en ?? g.name_ko),
      photo_url: g.photo_url,
      type: "group" as const,
      href: `/${locale}/groups/${g.id}`,
    })),
    ...artists.map((a) => ({
      id: a.id,
      name: isKo ? a.name_ko : (a.name_en ?? a.name_ko),
      photo_url: a.photo_url,
      type: "artist" as const,
      href: `/${locale}/artists/${a.id}`,
    })),
  ];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-purple-950/50 via-background to-pink-950/30 border border-border/60 px-8 py-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
          <Sparkles className="h-3 w-3" />
          AI-powered idol data
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t("hero_title")}
        </h1>
        <p className="mt-3 text-muted-foreground text-sm max-w-lg mx-auto">
          {t("hero_subtitle")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            href={`/${locale}/artists`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Users className="h-4 w-4" />
            {t("all_idols")}
          </Link>
        </div>
      </section>

      {/* Idols & Groups — 랜덤 순환 캐러셀 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{t("popular_artists")}</h2>
          <Link
            href={`/${locale}/artists`}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {t("view_all")} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {idolPool.length > 0 ? (
          <IdolCarousel items={idolPool} />
        ) : (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-border bg-card/50 px-8 py-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm mb-2">{t("no_artists_title")}</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {t("no_artists_desc")}
            </p>
          </div>
        )}
      </section>

      {/* Latest News (secondary) */}
      {articles.length > 0 && (
        <section>
          <h2 className="font-bold text-lg mb-4">{t("latest_articles")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {articles.map((article) => {
              const title = isKo
                ? article.title_ko
                : (article.title_en ?? article.title_ko);
              return (
                <a
                  key={article.id}
                  href={article.source_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                >
                  <p className="text-xs text-muted-foreground mb-1.5">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString(
                          isKo ? "ko-KR" : "en-US",
                          { month: "short", day: "numeric" }
                        )
                      : ""}
                    {article.artist_name_ko && (
                      <span className="ml-2 text-primary font-medium">
                        {isKo
                          ? article.artist_name_ko
                          : (article.artist_name_en ?? article.artist_name_ko)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
