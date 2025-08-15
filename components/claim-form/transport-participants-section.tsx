"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TransportParticipantsSectionProps {
  claimFormData: Record<string, any>
  handleFormChange: (field: string, value: any) => void
}

export function TransportParticipantsSection({ claimFormData, handleFormChange }: TransportParticipantsSectionProps) {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Poszkodowany / Sprawca
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="injuredData">Dane poszkodowanego</Label>
          <Textarea
            id="injuredData"
            value={claimFormData.injuredData || ""}
            onChange={(e) => handleFormChange("injuredData", e.target.value)}
            placeholder="Wprowadź dane poszkodowanego"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="perpetratorData">Dane sprawcy</Label>
          <Textarea
            id="perpetratorData"
            value={claimFormData.perpetratorData || ""}
            onChange={(e) => handleFormChange("perpetratorData", e.target.value)}
            placeholder="Wprowadź dane sprawcy"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default TransportParticipantsSection

