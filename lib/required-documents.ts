import type { RequiredDocument } from "@/types"

const communicationDocuments: RequiredDocument[] = [
  { id: "1", name: "Akta z TU", required: true, uploaded: false, description: "" },
  { id: "2", name: "Arkusz / Info", required: true, uploaded: false, description: "" },
  { id: "3", name: "Zgłoszenie szkody - Bank/Leasing", required: true, uploaded: false, description: "" },
  { id: "4", name: "Bank/Leasing - zgoda", required: true, uploaded: false, description: "" },
  { id: "5", name: "Braki w zgloszeniu szkody", required: true, uploaded: false, description: "" },
  { id: "6", name: "Decyzja", required: true, uploaded: false, description: "" },
  { id: "7", name: "Decyzje", required: true, uploaded: false, description: "" },
  { id: "8", name: "Deklaracja rozliczenia szkody AC", required: true, uploaded: false, description: "" },
  { id: "9", name: "Dokumenty pochodzenia", required: true, uploaded: false, description: "" },
  { id: "10", name: "Dokumenty pochodzenia pojazdu", required: true, uploaded: false, description: "" },
  { id: "11", name: "Dowód osobisty", required: true, uploaded: false, description: "" },
  { id: "12", name: "Dowód rejestracyjny", required: true, uploaded: false, description: "" },
  { id: "13", name: "Zgłoszenie szkody", required: true, uploaded: false, description: "" },
  { id: "14", name: "Dyspozycja wypłaty", required: true, uploaded: false, description: "" },
  { id: "15", name: "Dyspozycja wypłaty/Upoważnienie/Cesja praw", required: true, uploaded: false, description: "" },
  { id: "16", name: "Faktura", required: true, uploaded: false, description: "" },
  { id: "17", name: "Faktura - holowanie", required: true, uploaded: false, description: "" },
  { id: "18", name: "Faktura - inne", required: true, uploaded: false, description: "" },
  { id: "19", name: "Faktura - naprawa", required: true, uploaded: false, description: "" },
  { id: "20", name: "Faktura - ocena techniczna", required: true, uploaded: false, description: "" },
  { id: "21", name: "Faktura - weryfikacja", required: true, uploaded: false, description: "" },
  { id: "22", name: "Faktura - wynajem", required: true, uploaded: false, description: "" },
  { id: "23", name: "Faktura zródłowa", required: true, uploaded: false, description: "" },
  { id: "24", name: "Film/nagranie", required: true, uploaded: false, description: "" },
  { id: "25", name: "Info brak wyplaty AC", required: true, uploaded: false, description: "" },
  { id: "26", name: "Informacja o szkodzie > 50 000 ,-", required: true, uploaded: false, description: "" },
  { id: "27", name: "Informacja o szkodzie calkowitej", required: true, uploaded: false, description: "" },
  { id: "28", name: "Inne", required: true, uploaded: false, description: "" },
  { id: "29", name: "Inne dokumenty", required: true, uploaded: false, description: "" },
  { id: "30", name: "Inny dokument", required: true, uploaded: false, description: "" },
  { id: "31", name: "Kalkulacja naprawy", required: true, uploaded: false, description: "" },
  { id: "32", name: "Kalkulacja naprawy – serwis", required: true, uploaded: false, description: "" },
  { id: "33", name: "Kalkulacja naprawy – TU", required: true, uploaded: false, description: "" },
  { id: "34", name: "Kalkulacja/kosztorys naprawy – serwis", required: true, uploaded: false, description: "" },
  { id: "35", name: "Kalkulacja ofertowa/kosztorys – TU", required: true, uploaded: false, description: "" },
  { id: "36", name: "Kalkulacja/kosztorys naprawy - weryfikacja", required: true, uploaded: false, description: "" },
  { id: "37", name: "Klient - pismo", required: true, uploaded: false, description: "" },
  { id: "38", name: "Kluczyki", required: true, uploaded: false, description: "" },
  { id: "39", name: "Kosztorys naprawy", required: true, uploaded: false, description: "" },
  { id: "40", name: "Leasing - pismo", required: true, uploaded: false, description: "" },
  { id: "41", name: "Mail o przyjeciu szkody", required: true, uploaded: false, description: "" },
  { id: "42", name: "Nota obciążeniowa", required: true, uploaded: false, description: "" },
  { id: "43", name: "Notatka z policji", required: true, uploaded: false, description: "" },
  { id: "44", name: "NULL", required: true, uploaded: false, description: "" },
  { id: "45", name: "Numer konta", required: true, uploaded: false, description: "" },
  { id: "46", name: "Ocena techniczna", required: true, uploaded: false, description: "" },
  { id: "47", name: "Ocena techniczna dodatkowa", required: true, uploaded: false, description: "" },
  { id: "48", name: "Odwołanie/skarga", required: true, uploaded: false, description: "" },
  { id: "49", name: "Ogledziny miejsca wypadku", required: true, uploaded: false, description: "" },
  { id: "50", name: "Ogledziny pojazdu drugiego uczestnika", required: true, uploaded: false, description: "" },
  { id: "51", name: "Ogledziny ponaprawcze", required: true, uploaded: false, description: "" },
  { id: "52", name: "Oględziny dodatkowe-kalkulacja/protokół", required: true, uploaded: false, description: "" },
  { id: "53", name: "Operat", required: true, uploaded: false, description: "" },
  { id: "54", name: "Oswiadczenie sprawcy / Europrotokół", required: true, uploaded: false, description: "" },
  { id: "55", name: "Oświadczenie o trzeźwosci oraz uprawnieniach", required: true, uploaded: false, description: "" },
  { id: "56", name: "Pełnomocnictwo", required: true, uploaded: false, description: "" },
  { id: "57", name: "Pismo 25 dniowe", required: true, uploaded: false, description: "" },
  { id: "58", name: "Pismo 30 dniowe", required: true, uploaded: false, description: "" },
  { id: "59", name: "Pismo 60 dniowe", required: true, uploaded: false, description: "" },
  { id: "60", name: "Pismo 7 dniowe", required: true, uploaded: false, description: "" },
  { id: "61", name: "Pismo 90 dniowe", required: true, uploaded: false, description: "" },
  { id: "62", name: "Pokwitowanie", required: true, uploaded: false, description: "" },
  { id: "63", name: "Policja - pismo", required: true, uploaded: false, description: "" },
  { id: "64", name: "Policja - przyszlo", required: true, uploaded: false, description: "" },
  { id: "65", name: "Policja - wyszlo", required: true, uploaded: false, description: "" },
  { id: "66", name: "Policja/sąd/prokuratura - pismo", required: true, uploaded: false, description: "" },
  { id: "67", name: "Polisa AC", required: true, uploaded: false, description: "" },
  { id: "68", name: "Polisa OC", required: true, uploaded: false, description: "" },
  { id: "69", name: "Potwierdzenie od ubezpieczyciela sprawcy", required: true, uploaded: false, description: "" },
  { id: "70", name: "Potwierdzenie okoliczności -sprawca", required: true, uploaded: false, description: "" },
  { id: "71", name: "Potwierdzenie przelewu/dowód wpłaty", required: true, uploaded: false, description: "" },
  { id: "72", name: "Potwierdzenie przyjęcia szkody", required: true, uploaded: false, description: "" },
  { id: "73", name: "Prawo jazdy", required: true, uploaded: false, description: "" },
  { id: "74", name: "Prosba o dodatkowe ogledziny", required: true, uploaded: false, description: "" },
  { id: "75", name: "Protokól z ogledzin", required: true, uploaded: false, description: "" },
  { id: "76", name: "Protokół zdawczo - odbiorczy", required: true, uploaded: false, description: "" },
  { id: "77", name: "Przekazano do regresu", required: true, uploaded: false, description: "" },
  { id: "78", name: "Przekazano do T.U.", required: true, uploaded: false, description: "" },
  { id: "79", name: "Przekazano rzeczoznawcy", required: true, uploaded: false, description: "" },
  { id: "80", name: "Rachunek za ocene techniczna", required: true, uploaded: false, description: "" },
  { id: "81", name: "Reklamacja", required: true, uploaded: false, description: "" },
  { id: "82", name: "Serwis - pismo", required: true, uploaded: false, description: "" },
  { id: "83", name: "Skarga", required: true, uploaded: false, description: "" },
  { id: "84", name: "Sprawca/drugi uczestnik - pismo", required: true, uploaded: false, description: "" },
  { id: "85", name: "Straz pozarna - pismo", required: true, uploaded: false, description: "" },
  { id: "86", name: "Swiadek - pismo", required: true, uploaded: false, description: "" },
  { id: "87", name: "Świadectwo kwalifikacji", required: true, uploaded: false, description: "" },
  { id: "88", name: "Teczka do TU", required: true, uploaded: false, description: "" },
  { id: "89", name: "Umowa leasingowa", required: true, uploaded: false, description: "" },
  { id: "90", name: "Upoważnienie", required: true, uploaded: false, description: "" },
  { id: "91", name: "uwagi do rejestracji", required: true, uploaded: false, description: "" },
  { id: "92", name: "Wrócilo od rzeczoznawcy", required: true, uploaded: false, description: "" },
  { id: "93", name: "Wspólne/polubowne stwierdzenie wypadku", required: true, uploaded: false, description: "" },
  { id: "94", name: "Wycena", required: true, uploaded: false, description: "" },
  { id: "95", name: "Zdjecia", required: true, uploaded: false, description: "" },
  { id: "96", name: "Zdjęcia pojazdu", required: true, uploaded: false, description: "" },
  { id: "97", name: "Zgloszenie szkody do TU", required: true, uploaded: false, description: "" },
  { id: "98", name: "Zgoda na wypłatę - Leasing/Bank", required: true, uploaded: false, description: "" },
  { id: "99", name: "Zlecenie naprawy", required: true, uploaded: false, description: "" },
  { id: "100", name: "Zlecenie dodatkowej oceny technicznej", required: true, uploaded: false, description: "" },
  { id: "101", name: "Zlecenie oceny technicznej", required: true, uploaded: false, description: "" },
  { id: "102", name: "Zlecenie ogledzin miejsca wypadku", required: true, uploaded: false, description: "" },
  { id: "103", name: "Zlecenie ogledzin mienia", required: true, uploaded: false, description: "" },
  { id: "104", name: "Zlecenie ogledzin pojazdu drugiego uczestnika", required: true, uploaded: false, description: "" },
  { id: "105", name: "Zlecenie ogledzin pojazdu po naprawie", required: true, uploaded: false, description: "" },
  { id: "106", name: "ZPO zwrotne potwierdzenie odbioru", required: true, uploaded: false, description: "" },
  { id: "107", name: "Zwrot pisma", required: true, uploaded: false, description: "" },
  { id: "108", name: "Umowa generalna", required: true, uploaded: false, description: "" },
  { id: "109", name: "Umowa najmu", required: true, uploaded: false, description: "" },
  { id: "110", name: "Szkoda całkowita - wyliczenie", required: true, uploaded: false, description: "" },
  { id: "111", name: "Wartość pojazdu - wyliczenie", required: true, uploaded: false, description: "" },
  { id: "112", name: "PBUK/UFG - potwierdzenie zapytania", required: true, uploaded: false, description: "" },
  { id: "113", name: "Europrotokół", required: true, uploaded: false, description: "" },
  { id: "114", name: "Faktura - uprzątnięcie", required: true, uploaded: false, description: "" }
]

const propertyDocuments: RequiredDocument[] = [
  { id: "1", name: "Nr konta", required: true, uploaded: false, description: "" },
  {
    id: "2",
    name: "Faktury za naprawę / zakup nowego",
    required: true,
    uploaded: false,
    description: "",
  },
  { id: "3", name: "Kosztorys", required: true, uploaded: false, description: "" },
  { id: "4", name: "Inne", required: true, uploaded: false, description: "" },
  { id: "5", name: "Opinia serwisu", required: true, uploaded: false, description: "" },
  { id: "6", name: "Zdjęcia", required: true, uploaded: false, description: "" },
  {
    id: "7",
    name: "Notatka policja / straż pożarna",
    required: true,
    uploaded: false,
    description: "",
  },
  { id: "8", name: "Oświadczenia", required: true, uploaded: false, description: "" },
  {
    id: "9",
    name: "Oświadczenie spisane ze sprawcą (dla OC)",
    required: true,
    uploaded: false,
    description: "",
  },
  {
    id: "10",
    name: "Dokument własności mienia",
    required: true,
    uploaded: false,
    description: "",
  },
]

const transportDocuments: RequiredDocument[] = [
  {
    id: "1",
    name: "Dowód rejestracyjny",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "2",
    name: "Dyspozycja dotycząca wypłaty odszkodowania",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "3",
    name: "Kalkulacja naprawy",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "4",
    name: "Ocena techniczna",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "5",
    name: "Oświadczenie o trzeźwości",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "6",
    name: "Prawo jazdy",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "7",
    name: "Świadectwo kwalifikacji",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "8",
    name: "Zdjęcia",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "9",
    name: "Zgłoszenie szkody",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "10",
    name: "Decyzje",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "11",
    name: "Faktura",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "12",
    name: "Kalkulacja naprawy – TU",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "13",
    name: "Kalkulacja naprawy – serwis",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "14",
    name: "Inne dokumenty",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "15",
    name: "Akceptacja kosztów OT",
    required: true,
    uploaded: false,
    description: ""
  },
  {
    id: "16",
    name: "Ankieta TU",
    required: true,
    uploaded: false,
    description: ""
  }
]

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
