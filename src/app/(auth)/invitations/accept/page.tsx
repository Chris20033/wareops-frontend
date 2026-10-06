import { Suspense } from "react";

import { AcceptInvitationCard } from "@/features/auth/components/accept-invitation-card";

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          Cargando invitación...
        </div>
      }
    >
      <AcceptInvitationCard />
    </Suspense>
  );
}
