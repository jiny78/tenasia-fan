import Link from "next/link";
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
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10 hover:border-primary/30">
        {/* Avatar placeholder */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
          {(name ?? "?").charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate font-semibold text-sm group-hover:text-primary transition-colors">
              {name}
            </p>
            {artist.is_verified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            )}
          </div>
          {stageName && stageName !== name && (
            <p className="text-xs text-muted-foreground truncate">{stageName}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
