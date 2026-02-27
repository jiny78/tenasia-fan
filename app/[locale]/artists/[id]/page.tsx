import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { artistsApi } from "@/lib/api";
import { ArticleCard } from "@/components/ArticleCard";
import { BadgeCheck, ChevronLeft } from "lucide-react";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("artist");
  const isKo = locale === "ko";

  const [artist, articles] = await Promise.all([
    artistsApi.get(parseInt(id, 10)).catch(() => null),
    artistsApi.articles(parseInt(id, 10), { limit: 12 }).catch(() => []),
  ]);

  if (!artist) notFound();

  const name = isKo ? artist.name_ko : (artist.name_en ?? artist.name_ko);
  const bio = isKo ? artist.bio_ko : (artist.bio_en ?? artist.bio_ko);
  const nationality = isKo ? artist.nationality_ko : (artist.nationality_en ?? artist.nationality_ko);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href={`/${locale}/artists`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> 아티스트
      </Link>

      {/* Profile */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden">
            {artist.photo_url ? (
              <Image
                src={artist.photo_url}
                alt={name ?? ""}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                {(name ?? "?").charAt(0)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{name}</h1>
              {artist.is_verified && (
                <BadgeCheck className="h-5 w-5 text-blue-400" aria-label={t("verified")} />
              )}
            </div>
            {artist.stage_name_ko && artist.stage_name_ko !== artist.name_ko && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {isKo ? artist.stage_name_ko : (artist.stage_name_en ?? artist.stage_name_ko)}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <InfoRow label={t("birth_date")} value={artist.birth_date ?? undefined} />
          <InfoRow label={t("nationality")} value={nationality ?? undefined} />
          <InfoRow label={t("mbti")} value={artist.mbti ?? undefined} />
          <InfoRow label={t("blood_type")} value={artist.blood_type ?? undefined} />
          <InfoRow
            label={t("height")}
            value={artist.height_cm ? `${artist.height_cm} cm` : undefined}
          />
          <InfoRow
            label={t("weight")}
            value={artist.weight_kg ? `${artist.weight_kg} kg` : undefined}
          />
        </div>

        {/* Bio */}
        {bio && (
          <div className="border-t border-border pt-4">
            <p className="text-sm leading-relaxed text-foreground/90">{bio}</p>
          </div>
        )}

        {/* Groups */}
        {artist.groups && artist.groups.length > 0 && (
          <div className="border-t border-border pt-4 space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("group")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {artist.groups.map((g) => (
                <Link
                  key={g.group_id}
                  href={`/${locale}/groups/${g.group_id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  {isKo ? g.name_ko : (g.name_en ?? g.name_ko)}
                  {g.roles.length > 0 && (
                    <span className="text-muted-foreground">· {g.roles.join(", ")}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related articles */}
      {articles.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold text-lg">{t("news")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
