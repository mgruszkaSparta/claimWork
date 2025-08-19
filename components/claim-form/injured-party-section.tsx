"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FormHeader } from "@/components/ui/form-header"
import { User } from "lucide-react"
import { ParticipantForm } from "./participant-form"
import type { ParticipantInfo, DriverInfo } from "@/types"

interface InjuredPartySectionProps {
  participantData: ParticipantInfo
  onParticipantChange: (field: keyof Omit<ParticipantInfo, "drivers">, value: any) => void
  onDriverChange: (driverIndex: number, field: keyof DriverInfo, value: any) => void
  onAddDriver: () => void
  onRemoveDriver: (driverIndex: number) => void
}

export function InjuredPartySection({
  participantData,
  onParticipantChange,
  onDriverChange,
  onAddDriver,
  onRemoveDriver,
}: InjuredPartySectionProps) {
  return (
    <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
      <FormHeader icon={User} title="Poszkodowany" />
      <CardContent className="p-6 bg-white">
        <ParticipantForm
          title="Poszkodowany"
          icon={<User className="h-5 w-5 text-blue-600" />}
          participantData={participantData}
          onParticipantChange={onParticipantChange}
          onDriverChange={onDriverChange}
          onAddDriver={onAddDriver}
          onRemoveDriver={onRemoveDriver}
          isVictim
        />
      </CardContent>
    </Card>
  )
}

export default InjuredPartySection

