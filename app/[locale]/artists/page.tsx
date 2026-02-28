import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { artistsApi, groupsApi } from "@/lib/api";
import { ArtistCard } from "@/components/ArtistCard";
import { BadgeCheck } from "lucide-react";

export default async function ArtistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("nav");
  const isKo = locale === "ko";

  const [artists, groups] = await Promise.all([
    artistsApi.list({ limit: 100 }).catch(() => []),
    groupsApi.list({ limit: 50 }).catch(() => []),
  ]);

  return (
    <div className="space-y-12">
      <h1 className="font-bold text-2xl">{t("artists")}</h1>

      {/* Groups */}
      {groups.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg">그룹</h2>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
              {groups.length}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {groups.map((group) => {
              const name = isKo ? group.name_ko : (group.name_en ?? group.name_ko);
              return (
                <Link
                  key={group.id}
                  href={`/${locale}/groups/${group.id}`}
                  className="group block"
                >
                  <div className="rounded-xl overflow-hidden border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
                    {/* Square photo */}
                    <div className="relative aspect-square w-full bg-muted overflow-hidden">
                      {group.photo_url ? (
                        <Image
                          src={group.photo_url}
                          alt={name ?? ""}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500 to-orange-400 text-white text-4xl font-bold">
                          {(name ?? "?").charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="px-3 py-2.5 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <p className="truncate font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                          {name}
                        </p>
                        {group.is_verified && (
                          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                        )}
                      </div>
                      {group.fandom_name_ko && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {isKo
                            ? group.fandom_name_ko
                            : (group.fandom_name_en ?? group.fandom_name_ko)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Solo artists */}
      {artists.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg">솔로</h2>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
              {artists.length}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Empty */}
      {groups.length === 0 && artists.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-8 py-16 text-center">
          <p className="text-muted-foreground text-sm">아이돌 데이터 수집 중...</p>
        </div>
      )}
    </div>
  );
}
