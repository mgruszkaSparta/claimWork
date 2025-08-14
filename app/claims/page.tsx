"use client";

import { useRouter } from "next/navigation";
import { ClaimsList } from "@/components/claims-list";

export default function ClaimsPage() {
  const router = useRouter();
  return (
    <ClaimsList
      onNewClaim={() => router.push("/claims/create?claimObjectType=1")}
      claimObjectTypeId="1"
    />
  );
}

