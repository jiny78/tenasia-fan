import { groupsApi } from "@/lib/api";
import { GroupStatusEditor } from "./GroupStatusEditor";

export default async function AdminGroupsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const groups = await groupsApi.list({ limit: 200 }).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">그룹 상태 편집</h1>
        <p className="text-xs text-muted-foreground mt-1">
          그룹 활동 상태를 수동으로 수정합니다. 변경 즉시 저장됩니다.
        </p>
      </div>

      <GroupStatusEditor groups={groups} locale={locale} />
    </div>
  );
}
