import { Suspense } from "react";

import { MembersView } from "@/features/members/components/members-view";

export default function MembersPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          Cargando administración de miembros...
        </div>
      }
    >
      <MembersView />
    </Suspense>
  );
}
