import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { Claim, SubcontractorInfo } from "@/types"

interface SubcontractorSectionProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: keyof Claim, value: any) => void
  disabled?: boolean
}

export default function SubcontractorSection({
  claimFormData,
  handleFormChange,
  disabled = false,
}: SubcontractorSectionProps) {
  const subcontractor: SubcontractorInfo =
    claimFormData.subcontractor || {
      subcontractorName: "",
      subcontractorPolicyNumber: "",
      subcontractorInsurer: "",
      complaintToSubcontractor: false,
      complaintToSubcontractorDate: "",
      claimFromSubcontractorPolicy: false,
      claimFromSubcontractorPolicyDate: "",
      complaintResponse: false,
      complaintResponseDate: "",
    }

  const handleSubcontractorChange = (
    field: keyof SubcontractorInfo,
    value: any,
  ) => {
    handleFormChange("subcontractor", {
      ...subcontractor,
      [field]: value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Podwykonawca</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Nazwa podwykonawcy"
            value={subcontractor.subcontractorName}
            onChange={(e) =>
              handleSubcontractorChange("subcontractorName", e.target.value)
            }
            disabled={disabled}
          />
          <Input
            placeholder="Numer polisy"
            value={subcontractor.subcontractorPolicyNumber}
            onChange={(e) =>
              handleSubcontractorChange("subcontractorPolicyNumber", e.target.value)
            }
            disabled={disabled}
          />
          <Input
            placeholder="Ubezpieczyciel"
            value={subcontractor.subcontractorInsurer}
            onChange={(e) =>
              handleSubcontractorChange("subcontractorInsurer", e.target.value)
            }
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="complaintToSubcontractor"
              checked={subcontractor.complaintToSubcontractor}
              onCheckedChange={(checked) =>
                handleSubcontractorChange(
                  "complaintToSubcontractor",
                  checked === true,
                )
              }
              disabled={disabled}
            />
            <Label htmlFor="complaintToSubcontractor">
              Reklamacja do podwykonawcy
            </Label>
          </div>
          <Input
            type="date"
            value={subcontractor.complaintToSubcontractorDate}
            onChange={(e) =>
              handleSubcontractorChange(
                "complaintToSubcontractorDate",
                e.target.value,
              )
            }
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="claimFromSubcontractorPolicy"
              checked={subcontractor.claimFromSubcontractorPolicy}
              onCheckedChange={(checked) =>
                handleSubcontractorChange(
                  "claimFromSubcontractorPolicy",
                  checked === true,
                )
              }
              disabled={disabled}
            />
            <Label htmlFor="claimFromSubcontractorPolicy">
              Zgłoszenie z polisy podwykonawcy
            </Label>
          </div>
          <Input
            type="date"
            value={subcontractor.claimFromSubcontractorPolicyDate}
            onChange={(e) =>
              handleSubcontractorChange(
                "claimFromSubcontractorPolicyDate",
                e.target.value,
              )
            }
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="complaintResponse"
              checked={subcontractor.complaintResponse}
              onCheckedChange={(checked) =>
                handleSubcontractorChange("complaintResponse", checked === true)
              }
              disabled={disabled}
            />
            <Label htmlFor="complaintResponse">Odpowiedź na reklamację</Label>
          </div>
          <Input
            type="date"
            value={subcontractor.complaintResponseDate}
            onChange={(e) =>
              handleSubcontractorChange(
                "complaintResponseDate",
                e.target.value,
              )
            }
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  )
}
