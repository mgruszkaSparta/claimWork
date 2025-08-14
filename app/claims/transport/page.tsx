"use client";

import { useRouter } from "next/navigation";
import { ClaimsList } from "@/components/claims-list";

export default function TransportClaimsPage() {
  const router = useRouter();
  return (
    <ClaimsList
      onNewClaim={() => router.push("/claims/create?claimObjectType=3")}
      claimObjectTypeId="3"
    />
  );
}

