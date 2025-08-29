"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import SimpleClaimFormDesktop from "./simple-claim-form-desktop"
import SimpleClaimFormMobile from "../mobile/claim-form/simple-claim-form"

export function SimpleClaimForm() {
  const isMobile = useIsMobile()
  return isMobile ? <SimpleClaimFormMobile /> : <SimpleClaimFormDesktop />
}

export default SimpleClaimForm
