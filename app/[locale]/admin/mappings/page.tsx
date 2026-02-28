import { adminApi } from "@/lib/api";
import { MappingsEditor } from "./MappingsEditor";

export default async function AdminMappingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ artist_id?: string; group_id?: string; article_id?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const artistId  = sp.artist_id  ? Number(sp.artist_id)  : undefined;
  const groupId   = sp.group_id   ? Number(sp.group_id)   : undefined;
  const articleId = sp.article_id ? Number(sp.article_id) : undefined;

  const mappings = await adminApi
    .listMappings({ artist_id: artistId, group_id: groupId, article_id: articleId })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">기사-아티스트 매핑 편집</h1>
        <p className="text-xs text-muted-foreground mt-1">
          기사와 아티스트/그룹의 연결을 확인하고 수동으로 추가하거나 삭제합니다.
        </p>
      </div>

      <MappingsEditor
        mappings={mappings}
        locale={locale}
        filterArtistId={artistId}
        filterGroupId={groupId}
        filterArticleId={articleId}
      />
    </div>
  );
}
