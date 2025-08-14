"use client"

import { useState } from "react"
import { ClaimsList } from "@/components/claims-list"
import { NewClaimDialog } from "@/components/new-claim-dialog"

export default function PropertyClaimsPage() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <ClaimsList
        onNewClaim={() => setOpen(true)}
        claimObjectTypeId="2"
      />
      <NewClaimDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

