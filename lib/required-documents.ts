import type { RequiredDocument } from "@/types"

const communicationDocuments: RequiredDocument[] = [
  { id: "1", name: "Dowód rejestracyjny", required: true, uploaded: false, description: "" },
  { id: "2", name: "Dyspozycja dotycząca wypłaty odszkodowania", required: true, uploaded: false, description: "" },
  { id: "3", name: "Kalkulacja naprawy", required: true, uploaded: false, description: "" },
  { id: "4", name: "Ocena techniczna", required: true, uploaded: false, description: "" },
  { id: "5", name: "Oświadczenie o trzeźwości", required: true, uploaded: false, description: "" },
  { id: "6", name: "Prawo jazdy", required: true, uploaded: false, description: "" },
  { id: "7", name: "Świadectwo kwalifikacji", required: true, uploaded: false, description: "" },
  { id: "8", name: "Zdjęcia", required: true, uploaded: false, description: "" },
  { id: "9", name: "Zgłoszenie szkody", required: true, uploaded: false, description: "" },
  { id: "10", name: "Akceptacja kalkulacji naprawy", required: true, uploaded: false, description: "" },
  { id: "11", name: "Faktura za holowanie", required: true, uploaded: false, description: "" },
  { id: "12", name: "Faktura za wynajem", required: true, uploaded: false, description: "" }
]

const propertyDocuments: RequiredDocument[] = [
  { id: "1", name: "Dokument własności mienia", required: true, uploaded: false, description: "" }
]

const transportDocuments: RequiredDocument[] = communicationDocuments

export const getRequiredDocumentsByObjectType = (
  objectTypeId?: string | number
): RequiredDocument[] => {
  const key = objectTypeId?.toString()
  switch (key) {
    case "2":
      return propertyDocuments.map(d => ({ ...d }))
    case "3":
      return transportDocuments.map(d => ({ ...d }))
    case "1":
    default:
      return communicationDocuments.map(d => ({ ...d }))
  }
}
