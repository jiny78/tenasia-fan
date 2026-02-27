import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import type { Artist } from "@/lib/types";

interface ArtistCardProps {
  artist: Artist;
  locale: string;
}

export function ArtistCard({ artist, locale }: ArtistCardProps) {
  const isKo = locale === "ko";
  const name = isKo ? artist.name_ko : (artist.name_en ?? artist.name_ko);
  const stageName = isKo
    ? artist.stage_name_ko
    : (artist.stage_name_en ?? artist.stage_name_ko);

  return (
    <Link href={`/${locale}/artists/${artist.id}`} className="group block">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10 hover:border-primary/30 text-center">
        {/* Avatar */}
        <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden">
          {artist.photo_url ? (
            <Image
              src={artist.photo_url}
              alt={name ?? ""}
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
              {(name ?? "?").charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 w-full">
          <div className="flex items-center justify-center gap-1">
            <p className="truncate font-semibold text-xs group-hover:text-primary transition-colors">
              {name}
            </p>
            {artist.is_verified && (
              <BadgeCheck className="h-3 w-3 shrink-0 text-blue-400" />
            )}
          </div>
          {stageName && stageName !== name && (
            <p className="text-[10px] text-muted-foreground truncate">{stageName}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
