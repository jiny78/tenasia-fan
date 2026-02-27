import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { groupsApi } from "@/lib/api";
import { ArticleCard } from "@/components/ArticleCard";
import { BadgeCheck, ChevronLeft } from "lucide-react";

const STATUS_MAP: Record<string, "active" | "hiatus" | "disbanded" | "solo_only"> = {
  ACTIVE: "active",
  HIATUS: "hiatus",
  DISBANDED: "disbanded",
  SOLO_ONLY: "solo_only",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("group");
  const isKo = locale === "ko";

  const [group, articles] = await Promise.all([
    groupsApi.get(parseInt(id, 10)).catch(() => null),
    groupsApi.articles(parseInt(id, 10), { limit: 12 }).catch(() => []),
  ]);

  if (!group) notFound();

  const name = isKo ? group.name_ko : (group.name_en ?? group.name_ko);
  const label = isKo ? group.label_ko : (group.label_en ?? group.label_ko);
  const fandom = isKo ? group.fandom_name_ko : (group.fandom_name_en ?? group.fandom_name_ko);
  const bio = isKo ? group.bio_ko : (group.bio_en ?? group.bio_ko);
  const statusKey = group.activity_status ? STATUS_MAP[group.activity_status] : null;
  const statusLabel = statusKey ? t(statusKey) : group.activity_status;

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
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 text-white text-2xl font-bold">
            {(name ?? "?").charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{name}</h1>
              {group.is_verified && (
                <BadgeCheck className="h-5 w-5 text-blue-400" />
              )}
            </div>
            {fandom && (
              <p className="text-sm text-muted-foreground mt-0.5">{fandom}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <InfoRow label={t("debut")} value={group.debut_date} />
          <InfoRow label={t("label")} value={label} />
          <InfoRow label={t("status")} value={statusLabel} />
        </div>

        {bio && (
          <div className="border-t border-border pt-4">
            <p className="text-sm leading-relaxed text-foreground/90">{bio}</p>
          </div>
        )}

        {/* Members */}
        {group.members && group.members.length > 0 && (
          <div className="border-t border-border pt-4 space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("members")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {group.members.map((m) => {
                const memberName = isKo ? m.name_ko : (m.name_en ?? m.name_ko);
                return (
                  <Link
                    key={m.artist_id}
                    href={`/${locale}/artists/${m.artist_id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <span className="font-medium">{memberName}</span>
                    {m.roles.length > 0 && (
                      <span className="text-muted-foreground">{m.roles.join(" · ")}</span>
                    )}
                    {m.ended_on && (
                      <span className="text-red-400/70">(전)</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* News */}
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
