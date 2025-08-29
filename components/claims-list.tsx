"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import type { ClaimsListProps } from "./claims-list.types"
import { ClaimsListDesktop } from "./claims-list-desktop"
import { ClaimsListMobile } from "./mobile/claims-list"

export function ClaimsList(props: ClaimsListProps) {
  const isMobile = useIsMobile()
  return isMobile ? <ClaimsListMobile {...props} /> : <ClaimsListDesktop {...props} />
}
