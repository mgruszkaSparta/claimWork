"use client"

import { useState } from "react"
import { ClaimsList } from "@/components/claims-list"
import { NewClaimDialog } from "@/components/new-claim-dialog"

export default function ClaimsPage() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <ClaimsList onNewClaim={() => setOpen(true)} />
      <NewClaimDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
