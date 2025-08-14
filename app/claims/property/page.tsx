"use client";

import { useRouter } from "next/navigation";
import { ClaimsList } from "@/components/claims-list";

export default function PropertyClaimsPage() {
  const router = useRouter();
  return (
    <ClaimsList
      onNewClaim={() => router.push("/claims/create?claimObjectType=2")}
      claimObjectTypeId="2"
    />
  );
}

