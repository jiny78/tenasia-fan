import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articlesApi } from "@/lib/api";
import { ArticleCard } from "@/components/ArticleCard";
import { ExternalLink, ChevronLeft, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("article");
  const isKo = locale === "ko";

  const article = await articlesApi.get(parseInt(id, 10)).catch(() => null);
  if (!article) notFound();

  const title = isKo ? article.title_ko : (article.title_en ?? article.title_ko);
  const summary = isKo ? article.summary_ko : (article.summary_en ?? null);
  const artistName = isKo ? article.artist_name_ko : (article.artist_name_en ?? article.artist_name_ko);
  const tags = isKo ? article.hashtags_ko : article.hashtags_en;

  const publishedDate = article.published_at
    ? format(new Date(article.published_at), "PPP", { locale: isKo ? ko : enUS })
    : null;

  // Related articles by artist name
  const related = article.artist_name_ko
    ? await articlesApi
        .list({ q: article.artist_name_ko, limit: 4 })
        .then((arr) => arr.filter((a) => a.id !== article.id).slice(0, 3))
        .catch(() => [])
    : [];

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <Link
        href={`/${locale}/articles`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> {t("related")}
      </Link>

      {/* Thumbnail */}
      {article.thumbnail_url && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={article.thumbnail_url}
            alt={title ?? ""}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      )}

      {/* Header */}
      <header className="space-y-3">
        {artistName && (
          <p className="text-sm font-semibold text-primary">{artistName}</p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold leading-snug">{title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {article.author && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" /> {article.author}
            </span>
          )}
          {publishedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {publishedDate}
            </span>
          )}
          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" /> {t("read_original")}
            </a>
          )}
        </div>
      </header>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        {/* English summary (for /en) */}
        {!isKo && summary && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("english")}
            </h2>
            <p className="text-sm leading-relaxed">{summary}</p>
          </div>
        )}

        {!isKo && !summary && (
          <p className="text-xs text-muted-foreground italic">{t("no_english")}</p>
        )}

        {/* Korean content */}
        <div className="space-y-2">
          {!isKo && (
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("original_korean")}
            </h2>
          )}
          {article.content_ko ? (
            <div className="prose prose-sm prose-invert max-w-none">
              {article.content_ko.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/90">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            article.summary_ko && (
              <p className="text-sm leading-relaxed">{article.summary_ko}</p>
            )
          )}
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold text-lg">{t("related")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
