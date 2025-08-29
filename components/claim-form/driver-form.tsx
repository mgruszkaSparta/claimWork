"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { DriverFormDesktop } from "./driver-form-desktop"
import { DriverFormMobile } from "../mobile/claim-form/driver-form"
import type { DriverFormProps } from "./types"

export const DriverForm = (props: DriverFormProps) => {
  const isMobile = useIsMobile()
  return isMobile ? <DriverFormMobile {...props} /> : <DriverFormDesktop {...props} />
}

export default DriverForm
