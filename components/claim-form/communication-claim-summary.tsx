"use client"

import type React from "react"
import { DamageDiagram } from "@/components/damage-diagram"
import { DocumentsSection } from "../documents-section"
import {
  AlertTriangle,
  Car,
  FileText,
  MapPin,
  MessageSquare,
  User,
  Users,
  Clock,
  CheckCircle,
  X,
} from "lucide-react"
import type {
  Claim,
  Note,
  UploadedFile,
  ParticipantInfo,
  RequiredDocument,
  ClaimStatus,
} from "@/types"

interface RiskType {
  value: string
  label: string
}

interface CommunicationClaimSummaryProps {
  claimFormData: Partial<Claim>
  notes: Note[]
  uploadedFiles: UploadedFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  eventId?: string
  claimStatuses: ClaimStatus[]
  riskTypes: RiskType[]
}

// InfoCard component reused from main content
const InfoCard = ({
  icon,
  label,
  value,
  className = "",
}: {
  icon?: React.ReactNode
  label: string
  value: string
  className?: string
}) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow ${className}`}>
    <div className="flex items-center space-x-2 mb-1">
      {icon && <div className="text-gray-400">{icon}</div>}
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm font-medium text-gray-900 truncate">{value || "Nie określono"}</p>
  </div>
)

const getTypeLabel = (type: Note["type"]) => {
  switch (type) {
    case "note":
      return "Notatka"
    case "task":
      return "Zadanie"
    case "internal":
      return "Notatka wewnętrzna"
    case "status":
      return "Notatka status"
    default:
      return "Notatka"
  }
}

const getTypeColor = (type: Note["type"]) => {
  switch (type) {
    case "note":
      return "bg-blue-100 text-blue-800"
    case "task":
      return "bg-green-100 text-green-800"
    case "internal":
      return "bg-yellow-100 text-yellow-800"
    case "status":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "high":
      return "text-red-600"
    case "medium":
      return "text-yellow-600"
    case "low":
      return "text-green-600"
    default:
      return "text-gray-600"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <Clock className="h-4 w-4 text-blue-500" />
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "cancelled":
      return <X className="h-4 w-4 text-red-500" />
    default:
      return null
  }
}

const CommunicationClaimSummary = ({
  claimFormData,
  notes,
  uploadedFiles,
  setUploadedFiles,
  eventId,
  claimStatuses,
  riskTypes,
}: CommunicationClaimSummaryProps) => {
  const visibleNotes = notes.filter((note) => !note.type || note.type === "note")

  const getStatusLabel = (statusId?: string) => {
    const status = claimStatuses.find((s) => s.id.toString() === statusId)
    return status ? status.name : statusId || "Nie wybrano"
  }

  const getRiskTypeLabel = (riskTypeCode?: string) => {
    const riskType = riskTypes.find((r) => r.value === riskTypeCode)
    return riskType ? riskType.label : riskTypeCode || "Nie wybrano"
  }

  const renderParticipantDetails = (
    participant: ParticipantInfo | undefined,
    title: string,
    icon: React.ReactNode,
    bgColor: string,
  ) => {
    if (!participant) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className={`px-4 py-3 ${bgColor} border-b border-gray-200`}>
            <div className="flex items-center space-x-2">
              {icon}
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="text-center py-8 text-gray-500">
              <p>Brak danych {title.toLowerCase()}</p>
            </div>
          </div>
        </div>
      )
    }

    const participantName =
      participant.name ||
      [participant.firstName, participant.lastName].filter(Boolean).join(" ")

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className={`px-4 py-3 ${bgColor} border-b border-gray-200`}>
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <InfoCard label="Imię i nazwisko" value={participantName} />
          <InfoCard label="Adres" value={participant.address} />
          <InfoCard label="Miasto" value={participant.city} />
          <InfoCard label="Kod pocztowy" value={participant.postalCode} />
          <InfoCard label="Kraj" value={participant.country} />
          <InfoCard label="Telefon" value={participant.phone} />
          <InfoCard label="Rejestracja" value={participant.vehicleRegistration} />
          <InfoCard label="VIN" value={participant.vehicleVin} />
          <InfoCard label="Typ pojazdu" value={participant.vehicleType} />
          <InfoCard label="Marka" value={participant.vehicleBrand} />
          <InfoCard label="Model" value={participant.vehicleModel} />
          {participant.vehicleYear && (
            <InfoCard label="Rok" value={participant.vehicleYear.toString()} />
          )}
          <InfoCard label="Ubezpieczyciel" value={participant.insuranceCompany} />
          <InfoCard label="Nr polisy" value={participant.policyNumber} />

          {participant.drivers && participant.drivers.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">Kierowcy</h4>
              {participant.drivers.map((driver, index) => (
                <div
                  key={driver.id || index}
                  className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200"
                >
                  <InfoCard
                    label="Imię i nazwisko"
                    value=
                      {driver.name ||
                        [driver.firstName, driver.lastName]
                          .filter(Boolean)
                          .join(" ")}
                  />
                  {driver.licenseNumber && (
                    <InfoCard label="Nr prawa jazdy" value={driver.licenseNumber} />
                  )}
                  {driver.phone && <InfoCard label="Telefon" value={driver.phone} />}
                  {driver.email && <InfoCard label="E-mail" value={driver.email} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left Column - DANE SZKODY I ZDARZENIA */}
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
                <InfoCard label="Status" value={getStatusLabel(claimFormData.status)} />
                <InfoCard label="Szkodę zarejestrował" value={claimFormData.handler} />
              </div>

              <InfoCard label="Rodzaj szkody" value={claimFormData.damageType} />
              <InfoCard label="Ryzyko szkody" value={getRiskTypeLabel(claimFormData.riskType)} />

              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Data zdarzenia" value={claimFormData.damageDate} />
                <InfoCard label="Godzina zdarzenia" value={claimFormData.eventTime} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Data zgłoszenia" value={claimFormData.reportDate} />
                <InfoCard label="Data zgłoszenia do TU" value={claimFormData.reportDateToInsurer} />
              </div>

              <InfoCard
                icon={<MapPin className="h-4 w-4" />}
                label="Miejsce zdarzenia"
                value={claimFormData.eventLocation}
              />

              {claimFormData.eventDescription && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Opis zdarzenia
                  </span>
                  <p className="text-sm text-gray-900 leading-relaxed">{claimFormData.eventDescription}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Klient" value={claimFormData.client} />
                <InfoCard label="TU" value={claimFormData.insuranceCompany} />
              </div>

              {claimFormData.leasingCompany && (
                <InfoCard label="Firma leasingowa" value={claimFormData.leasingCompany} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <InfoCard label="Obszar" value={claimFormData.area} />
                <InfoCard label="Kanał zgłoszenia" value={claimFormData.reportingChannel} />
              </div>

              {claimFormData.comments && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Uwagi
                  </span>
                  <p className="text-sm text-gray-900 leading-relaxed">{claimFormData.comments}</p>
                </div>
              )}
            </div>
          </div>

          {/* POSZKODOWANY Section */}
          {renderParticipantDetails(
            claimFormData.injuredParty,
            "Poszkodowany",
            <User className="h-4 w-4 text-blue-600" />,
            "bg-gradient-to-r from-blue-50 to-blue-100",
          )}
        </div>

        {/* Right Column - SPRAWCA */}
        <div className="space-y-4">
          {renderParticipantDetails(
            claimFormData.perpetrator,
            "Sprawca",
            <AlertTriangle className="h-4 w-4 text-red-600" />,
            "bg-gradient-to-r from-red-50 to-red-100",
          )}
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-4">
        {/* Uszkodzenia samochodu */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Uszkodzenia samochodu</h3>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <InfoCard label="Rodzaj pojazdu" value={claimFormData.vehicleType} />

              {claimFormData.damageDescription && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Opis uszkodzeń
                  </span>
                  <p className="text-sm text-gray-900 leading-relaxed">{claimFormData.damageDescription}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                  Lista uszkodzeń
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {claimFormData.damages && claimFormData.damages.length > 0 ? (
                    claimFormData.damages.map((damage) => (
                      <div
                        key={damage.id || `${damage.description}-${damage.detail}`}
                        className="text-sm text-gray-900 p-2 bg-white rounded border"
                      >
                        <span className="font-medium">{damage.description}</span>
                        <span className="text-gray-600 ml-2">- {damage.detail}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Brak zdefiniowanych uszkodzeń</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <DamageDiagram
                damagedParts={(claimFormData.damages || []).map((d) => d.description)}
                onPartClick={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Służby */}
        {claimFormData.servicesCalled && claimFormData.servicesCalled.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Wezwane służby</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {claimFormData.servicesCalled.map((service) => (
                  <span
                    key={service}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize"
                  >
                    {service}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {claimFormData.policeDescription && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                      Policja - Opis
                    </span>
                    <p className="text-sm text-gray-900">{claimFormData.policeDescription}</p>
                  </div>
                )}
                {claimFormData.ambulanceDescription && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                      Pogotowie - Opis
                    </span>
                    <p className="text-sm text-gray-900">{claimFormData.ambulanceDescription}</p>
                  </div>
                )}
                {claimFormData.fireDescription && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                      Straż pożarna - Opis
                    </span>
                    <p className="text-sm text-gray-900">{claimFormData.fireDescription}</p>
                  </div>
                )}
                {claimFormData.towDescription && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                      Holownik - Opis
                    </span>
                    <p className="text-sm text-gray-900">{claimFormData.towDescription}</p>
                  </div>
                )}
              </div>

              {claimFormData.policeUnitDetails && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Dane jednostki policji
                  </span>
                  <p className="text-sm text-gray-900">{claimFormData.policeUnitDetails}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dokumenty - simplified version */}
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
                requiredDocuments={[] as RequiredDocument[]}
                setRequiredDocuments={() => {}}
                eventId={eventId}
                hideRequiredDocuments={true}
                storageKey={`summary-documents-${eventId}`}
              />
            )}
          </div>
        </div>

        {/* Notatki */}
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
                  <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                            {getTypeLabel(note.type)}
                          </span>
                          {note.type === "task" && note.priority && (
                            <span className={`text-xs font-medium ${getPriorityColor(note.priority)}`}>
                              {note.priority === "high"
                                ? "Wysoki"
                                : note.priority === "medium"
                                  ? "Średni"
                                  : "Niski"}
                            </span>
                          )}
                          {note.type === "task" && note.status && getStatusIcon(note.status)}
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm">{note.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{note.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>{note.user}</span>
                          <span>{new Date(note.createdAt).toLocaleDateString("pl-PL")}</span>
                          {note.dueDate && (
                            <span>Termin: {new Date(note.dueDate).toLocaleDateString("pl-PL")}</span>
                          )}
                        </div>
                      </div>
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
    </div>
  )
}

export default CommunicationClaimSummary

