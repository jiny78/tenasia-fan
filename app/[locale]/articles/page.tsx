import { getTranslations } from "next-intl/server";
import { articlesApi } from "@/lib/api";
import { ArticleCard } from "@/components/ArticleCard";

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { q, page } = await searchParams;
  const t = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const pageNum = Math.max(1, parseInt(page ?? "1", 10));
  const limit = 24;
  const offset = (pageNum - 1) * limit;

  const articles = await articlesApi
    .list({ limit, offset, q })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-2xl">{t("articles")}</h1>

      {articles.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">
          {tCommon("error")}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {articles.length === limit && (
        <div className="flex justify-center pt-4">
          <a
            href={`?page=${pageNum + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className="rounded-lg border border-border px-6 py-2 text-sm hover:bg-muted transition-colors"
          >
            {tCommon("load_more")}
          </a>
        </div>
      )}
    </div>
  );
}
