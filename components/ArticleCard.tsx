import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko, enUS } from "date-fns/locale";
import type { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  locale: string;
}

export function ArticleCard({ article, locale }: ArticleCardProps) {
  const isKo = locale === "ko";
  const title = isKo ? article.title_ko : (article.title_en ?? article.title_ko);
  const summary = isKo ? article.summary_ko : (article.summary_en ?? article.summary_ko);
  const artistName = isKo ? article.artist_name_ko : (article.artist_name_en ?? article.artist_name_ko);
  const tags = isKo ? article.hashtags_ko : article.hashtags_en;

  const publishedDate = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), {
        addSuffix: true,
        locale: isKo ? ko : enUS,
      })
    : null;

  return (
    <Link href={`/${locale}/articles/${article.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10">
        {/* Thumbnail */}
        {article.thumbnail_url && (
          <div className="relative aspect-video overflow-hidden bg-muted">
            <Image
              src={article.thumbnail_url}
              alt={title ?? ""}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
          </div>
        )}

        <div className="p-4 space-y-2">
          {/* Artist tag */}
          {artistName && (
            <p className="text-xs font-semibold text-primary truncate">{artistName}</p>
          )}

          {/* Title */}
          <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title ?? "—"}
          </h3>

          {/* Summary */}
          {summary && (
            <p className="text-xs text-muted-foreground line-clamp-2">{summary}</p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            {article.author && <span className="truncate">{article.author}</span>}
            {publishedDate && <span className="shrink-0">{publishedDate}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
