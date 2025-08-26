"use client"

import { FileText, MessageSquare } from "lucide-react"
import { DocumentsSection } from "../documents-section"
import type { Claim, Note, UploadedFile } from "@/types"

interface ClaimStatus {
  id: number
  name: string
  description: string
}

interface RiskType {
  value: string
  label: string
}

interface PropertyClaimSummaryProps {
  claimFormData: Partial<Claim>
  notes: Note[]
  uploadedFiles: UploadedFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  eventId?: string
  claimStatuses: ClaimStatus[]
  riskTypes: RiskType[]
}

const InfoCard = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-3">
    <div className="flex items-center space-x-2 mb-1">
      {icon && <div className="text-gray-400">{icon}</div>}
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm font-medium text-gray-900">{value || "Nie określono"}</p>
  </div>
)

export function PropertyClaimSummary({
  claimFormData,
  notes,
  uploadedFiles,
  setUploadedFiles,
  eventId,
  claimStatuses,
  riskTypes,
}: PropertyClaimSummaryProps) {
  const visibleNotes = notes.filter((note) => !note.type || note.type === "note")

  const getStatusLabel = (statusId?: number) => {
    const status = claimStatuses.find((s) => s.id === statusId)
    return status ? status.name : statusId?.toString() || "Nie wybrano"
  }

  const getRiskTypeLabel = (riskTypeCode?: string) => {
    const riskType = riskTypes.find((r) => r.value === riskTypeCode)
    return riskType ? riskType.label : riskTypeCode || "Nie wybrano"
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Szkoda w mieniu</h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Nr szkody Sparta" value={claimFormData.spartaNumber} />
            <InfoCard label="Nr szkody TU" value={claimFormData.insurerClaimNumber} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Status" value={getStatusLabel(claimFormData.claimStatusId)} />
            <InfoCard label="Likwidator" value={claimFormData.handler} />
          </div>
          {(claimFormData.handlerEmail || claimFormData.handlerPhone) && (
            <div className="grid grid-cols-2 gap-3">
              {claimFormData.handlerEmail && (
                <InfoCard label="E-mail" value={claimFormData.handlerEmail} />
              )}
              {claimFormData.handlerPhone && (
                <InfoCard label="Telefon" value={claimFormData.handlerPhone} />
              )}
            </div>
          )}
          <InfoCard label="Rodzaj szkody" value={claimFormData.damageType} />
          <InfoCard label="Ryzyko szkody" value={getRiskTypeLabel(claimFormData.riskType)} />
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Data zdarzenia" value={claimFormData.damageDate} />
            <InfoCard label="Data zgłoszenia" value={claimFormData.reportDate} />
          </div>
          {claimFormData.eventLocation && (
            <InfoCard label="Miejsce zdarzenia" value={claimFormData.eventLocation} />
          )}
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
              Przedmiot szkody
            </span>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {claimFormData.propertyDamageSubject || "Brak danych"}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
              Wykaz uszkodzeń / strat
            </span>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {claimFormData.damageListing || "Brak danych"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Nr polisy" value={claimFormData.policyNumber} />
            <InfoCard label="Ubezpieczyciel" value={claimFormData.insurer} />
          </div>
          {claimFormData.inspectionContact && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Dane i kontakt do oględzin
              </span>
              <p className="text-sm text-gray-900 whitespace-pre-line">
                {claimFormData.inspectionContact}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Uczestnicy</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
              Dane poszkodowanego
            </span>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {claimFormData.injuredData || "Brak danych"}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
              Dane sprawcy
            </span>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {claimFormData.perpetratorData || "Brak danych"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Dokumenty</h3>
          </div>
        </div>
        <div className="p-4">
          {eventId && (
            <DocumentsSection
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              requiredDocuments={[]}
              setRequiredDocuments={() => {}}
              eventId={eventId}
              hideRequiredDocuments={true}
              storageKey={`summary-documents-${eventId}`}
            />
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Notatki</h3>
          </div>
        </div>
        <div className="p-4">
          {visibleNotes.length > 0 ? (
            <div className="space-y-3">
              {visibleNotes.map((note) => (
                <div
                  key={note.id}
                  className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg"
                >
                  <h4 className="font-medium text-gray-900 text-sm">{note.title}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">{note.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                    {note.user && <span>{note.user}</span>}
                    {note.createdAt && (
                      <span>{new Date(note.createdAt).toLocaleDateString("pl-PL")}</span>
                    )}
                    {note.dueDate && (
                      <span>Termin: {new Date(note.dueDate).toLocaleDateString("pl-PL")}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Brak notatek</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PropertyClaimSummary

