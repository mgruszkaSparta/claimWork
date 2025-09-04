"use client"

import { FileText, MessageSquare } from "lucide-react"
import { DocumentsSection } from "../documents-section"
import type { Claim, Note, UploadedFile } from "@/types"
import { TRANSPORT_TYPES } from "@/lib/constants"

interface ClaimStatus {
  id: number
  name: string
  description: string
}

interface RiskType {
  value: string
  label: string
}

interface TransportClaimSummaryProps {
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
    <p className="text-sm font-medium text-gray-900 break-words">{value || "Nie określono"}</p>
  </div>
)

export function TransportClaimSummary({
  claimFormData,
  notes,
  uploadedFiles,
  setUploadedFiles,
  eventId,
  claimStatuses,
  riskTypes,
}: TransportClaimSummaryProps) {
  const visibleNotes = notes.filter((note) => !note.type || note.type === "note")

  const getStatusLabel = (statusId?: number) => {
    const status = claimStatuses.find((s) => s.id === statusId)
    return status ? status.name : statusId?.toString() || "Nie wybrano"
  }

  const getRiskTypeLabel = (riskTypeCode?: string) => {
    const riskType = riskTypes.find((r) => r.value === riskTypeCode)
    return riskType ? riskType.label : riskTypeCode || "Nie wybrano"
  }

  const transportDamage = (claimFormData.transportDamage || {}) as any

  const getTransportTypeLabel = (id?: string, code?: string) => {
    const typeById = TRANSPORT_TYPES.find((t) => t.value === id)
    if (typeById) return typeById.label
    const typeByCode = TRANSPORT_TYPES.find((t) => t.code === code)
    return typeByCode ? typeByCode.label : code || id || "Nie określono"
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Dane szkody i zdarzenia</h3>
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
          <InfoCard
            label="Rodzaj transportu"
            value={getTransportTypeLabel(
              transportDamage.transportTypeId,
              transportDamage.transportType,
            )}
          />
          <InfoCard label="Ryzyko szkody" value={getRiskTypeLabel(claimFormData.riskType)} />
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Data zdarzenia" value={claimFormData.damageDate} />
            <InfoCard label="Data zgłoszenia" value={claimFormData.reportDate} />
          </div>
          {claimFormData.eventLocation && <InfoCard label="Miejsce zdarzenia" value={claimFormData.eventLocation} />}
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
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Dane poszkodowanego</span>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {claimFormData.injuredData || "Brak danych"}
            </p>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Dane sprawcy</span>
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
            <h3 className="text-sm font-semibold text-gray-900">Szkoda w transporcie</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
              Opis ładunku / lista strat
            </span>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {transportDamage.cargoDescription || "Brak danych"}
            </p>
          </div>
          {Array.isArray(transportDamage.losses) && transportDamage.losses.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Lista strat
              </span>
              <ul className="list-disc pl-5 text-sm text-gray-900 space-y-1">
                {transportDamage.losses.map((loss: string, idx: number) => (
                  <li key={idx}>{loss}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Przewoźnik" value={transportDamage.carrier} />
            <InfoCard label="Nr polisy" value={transportDamage.policyNumber} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Osoba do oględzin" value={transportDamage.inspectionContactName} />
            <InfoCard label="Telefon" value={transportDamage.inspectionContactPhone} />
          </div>
          {transportDamage.inspectionContactEmail && (
            <InfoCard label="Email" value={transportDamage.inspectionContactEmail} />
          )}
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

export default TransportClaimSummary

