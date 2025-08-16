"use client"

import { FileText, MessageSquare } from "lucide-react"
import { DocumentsSection } from "../documents-section"
import { PropertyDamageSection } from "./property-damage-section"
import { PropertyParticipantsSection } from "./property-participants-section"
import type { Claim, Note, UploadedFile } from "@/types"

interface RiskType {
  value: string
  label: string
}

interface ClaimStatus {
  id: number
  name: string
  description: string
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

export function PropertyClaimSummary({
  claimFormData,
  notes,
  uploadedFiles,
  setUploadedFiles,
  eventId,
}: PropertyClaimSummaryProps) {
  const visibleNotes = notes.filter((note) => !note.type || note.type === "note")

  return (
    <div className="space-y-4">
      <PropertyParticipantsSection
        claimFormData={claimFormData}
        handleFormChange={() => {}}
      />

      <PropertyDamageSection
        claimFormData={claimFormData}
        handleFormChange={() => {}}
      />

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
                  <p className="text-sm text-gray-600 mt-1">{note.description}</p>
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

