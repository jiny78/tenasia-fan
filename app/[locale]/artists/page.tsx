import { getTranslations } from "next-intl/server";
import { artistsApi, groupsApi } from "@/lib/api";
import { ArtistsClient } from "./ArtistsClient";

export default async function ArtistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("nav");
  const isKo = locale === "ko";

  const [artists, groups] = await Promise.all([
    artistsApi.list({ limit: 200 }).catch(() => []),
    groupsApi.list({ limit: 200 }).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-2xl">{t("artists")}</h1>
      <ArtistsClient artists={artists} groups={groups} locale={locale} isKo={isKo} />
    </div>
  );
}
