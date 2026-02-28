import Link from "next/link";
import { Settings, Users, Link2 } from "lucide-react";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="font-bold text-2xl">관리자</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/${locale}/admin/groups`}
          className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">그룹 상태 편집</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              그룹 활동 상태(활동중/활동중단/해체)를 수동으로 수정합니다.
            </p>
          </div>
        </Link>

        <Link
          href={`/${locale}/admin/mappings`}
          className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Link2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">기사-아티스트 매핑 편집</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              기사와 아티스트/그룹의 연결을 수동으로 추가하거나 삭제합니다.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
