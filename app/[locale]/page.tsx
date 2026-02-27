import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { articlesApi, artistsApi } from "@/lib/api";
import { ArticleCard } from "@/components/ArticleCard";
import { ArtistCard } from "@/components/ArtistCard";
import { ChevronRight } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");

  const [articles, artists] = await Promise.all([
    articlesApi.list({ limit: 12 }).catch(() => []),
    artistsApi.list({ limit: 12, global_priority: 1 }).catch(() => []),
  ]);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-purple-950/50 via-background to-pink-950/30 border border-border/60 px-8 py-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t("hero_title")}
        </h1>
        <p className="mt-3 text-muted-foreground text-sm max-w-lg mx-auto">
          {t("hero_subtitle")}
        </p>
      </section>

      {/* Popular Artists */}
      {artists.length > 0 && (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{t("latest_articles")}</h2>
          <Link
            href={`/${locale}/articles`}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {t("view_all")} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}
