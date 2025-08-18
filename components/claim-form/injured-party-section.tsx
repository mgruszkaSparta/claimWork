"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
        <CardTitle className="text-lg font-semibold">Poszkodowany</CardTitle>
      </CardHeader>
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

