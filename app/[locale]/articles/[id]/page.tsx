import { redirect, notFound } from "next/navigation";
import { articlesApi } from "@/lib/api";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const article = await articlesApi.get(parseInt(id, 10)).catch(() => null);

  if (!article) notFound();

  if (article.source_url) {
    redirect(article.source_url);
  }

  // source_url이 없으면 artists 페이지로
  const { locale } = await params;
  redirect(`/${locale}/artists`);
}
