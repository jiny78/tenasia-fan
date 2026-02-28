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
      <div className="rounded-xl overflow-hidden border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
        {/* Square photo */}
        <div className="relative aspect-square w-full bg-muted overflow-hidden">
          {artist.photo_url ? (
            <Image
              src={artist.photo_url}
              alt={name ?? ""}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-4xl font-bold">
              {(name ?? "?").charAt(0)}
            </div>
          )}
        </div>

        {/* Info below */}
        <div className="px-3 py-2.5 space-y-0.5">
          <div className="flex items-center gap-1">
            <p className="truncate font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {name}
            </p>
            {artist.is_verified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
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
