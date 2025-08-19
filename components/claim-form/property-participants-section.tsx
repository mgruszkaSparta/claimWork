"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FormHeader } from "@/components/ui/form-header"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface PropertyParticipantsSectionProps {
  claimFormData: Record<string, any>
  handleFormChange: (field: string, value: any) => void
}

export function PropertyParticipantsSection({ claimFormData, handleFormChange }: PropertyParticipantsSectionProps) {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <FormHeader icon={FileText} title="Poszkodowany / Sprawca" />
      <CardContent className="p-6 space-y-4">
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

export default PropertyParticipantsSection

