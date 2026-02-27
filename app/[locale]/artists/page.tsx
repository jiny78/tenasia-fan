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
    <div className="space-y-10">
      <h1 className="font-bold text-2xl">{t("artists")}</h1>

      {/* Groups */}
      {groups.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-lg text-muted-foreground">그룹 / Groups</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {groups.map((group) => {
              const name = isKo ? group.name_ko : (group.name_en ?? group.name_ko);
              return (
                <Link
                  key={group.id}
                  href={`/${locale}/groups/${group.id}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 transition-all duration-200 text-center"
                >
                  {/* Group photo */}
                  <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0">
                    {group.photo_url ? (
                      <Image
                        src={group.photo_url}
                        alt={name ?? ""}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500 to-orange-400 text-white text-xl font-bold">
                        {(name ?? "?").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 w-full">
                    <div className="flex items-center justify-center gap-1">
                      <p className="truncate text-xs font-semibold group-hover:text-primary transition-colors">
                        {name}
                      </p>
                      {group.is_verified && (
                        <BadgeCheck className="h-3 w-3 text-blue-400 shrink-0" />
                      )}
                    </div>
                    {group.fandom_name_ko && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {isKo ? group.fandom_name_ko : (group.fandom_name_en ?? group.fandom_name_ko)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Solo artists */}
      {artists.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-lg text-muted-foreground">솔로 / Solo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
