import { getTranslations } from "next-intl/server";
import { searchApi } from "@/lib/api";
import { ArticleCard } from "@/components/ArticleCard";
import { ArtistCard } from "@/components/ArtistCard";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = await getTranslations("search");
  const isKo = locale === "ko";

  const results = q
    ? await searchApi.search(q, 20).catch(() => null)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-2xl">{t("results")}</h1>
        {q && <p className="text-sm text-muted-foreground mt-1">"{q}"</p>}
      </div>

      {!q && (
        <p className="text-muted-foreground text-sm py-12 text-center">
          {t("placeholder")}
        </p>
      )}

      {results && (
        <>
          {/* Artists */}
          {results.artists.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                {t("artists")} ({results.artists.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {/* Groups */}
          {results.groups.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                {t("groups")} ({results.groups.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {results.groups.map((group) => {
                  const name = isKo ? group.name_ko : (group.name_en ?? group.name_ko);
                  return (
                    <Link
                      key={group.id}
                      href={`/${locale}/groups/${group.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      {name}
                      {group.is_verified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-blue-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Articles */}
          {results.articles.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                {t("articles")} ({results.articles.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {results.articles.length === 0 &&
            results.artists.length === 0 &&
            results.groups.length === 0 && (
              <p className="text-muted-foreground text-sm py-12 text-center">
                {t("no_results")}
              </p>
            )}
        </>
      )}
    </div>
  );
}
