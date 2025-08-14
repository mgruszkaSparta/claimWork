"use client"

import type { Claim } from "@/types"

interface TransportDamageSectionProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: keyof Claim, value: any) => void
}

export const TransportDamageSection = ({
  claimFormData: _claimFormData,
  handleFormChange: _handleFormChange,
}: TransportDamageSectionProps) => {
  return <div />
}
