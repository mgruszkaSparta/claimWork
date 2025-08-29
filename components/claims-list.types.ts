import type { Claim } from "@/types"

export interface ClaimsListProps {
  claims?: Claim[]
  onEditClaim?: (claimId: string) => void
  onNewClaim?: () => void
  claimObjectTypeId?: string
}
