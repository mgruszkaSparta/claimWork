"use client"

import type { Claim } from "@/types"

interface PropertyDamageSectionProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: keyof Claim, value: any) => void
}

export const PropertyDamageSection = ({
  claimFormData: _claimFormData,
  handleFormChange: _handleFormChange,
}: PropertyDamageSectionProps) => {
  return <div />
}
