import type { LeasingCompany } from "@/types/leasing"

export class LeasingCompaniesService {
  private static companies: LeasingCompany[] = [
    {
      id: 1,
      name: "ALIOR LEASING SP. Z O.O.",
      formLink: "https://aliorleasing.pl/zgloszenie-szkody/",
      phone: "32 745 65 00",
      email: "dok@aliorleasing.pl",
    },
    {
      id: 2,
      name: "BNP PARIBAS LEASING SERVICES SP. Z O.O.",
      formLink: "https://ls.pol-assistance.pl/form/ms_zgl_szkody/form_bnp.aspx",
      phone: "22 458 56 13",
      email: "szkodykomunikacyjne@willistowerswatson.com",
    },
    {
      id: 3,
      name: "BPS LEASING SPÓŁKA AKCYJNA",
      formLink: "https://ls.pol-assistance.pl/form/ms_zgl_szkody/form_bps.aspx",
      phone: "brak",
      email: "wtw-pl.szkody.bpsl@willistowerswatson.com",
    },
    {
      id: 4,
      name: "DE LAGE LANDEN LEASING POLSKA S. A.",
      formLink: "https://www.dllgroup.com/pl/pl-pl/-/media/Project/Dll/Poland/Documents/O-nas/Zgloszenie-szkody.pdf",
      phone: "22 279 47 47 wew. 4",
      email: "szkody.dll@punktabrokers.pl",
    },
    {
      id: 5,
      name: "DEUTSCHE LEASING POLSKA S.A.",
      formLink: "brak",
      phone: "22 504 90 00",
      email: "info@dlp.pl",
    },
    {
      id: 6,
      name: "EUROPEJSKI FUNDUSZ LEASINGOWY S.A.",
      formLink: "https://klient.efl.com.pl/Start/RegisterBreakage?type=C",
      phone: "713 777 777, 801 404 444",
      email: "ubezpieczenia-efl@efl.com.pl",
    },
    {
      id: 7,
      name: "FCA LEASING POLSKA SPÓŁKA Z OGRANICZONA ODPOWIEDZIALNOSCIA",
      formLink: "https://WWW.LEASYS.PL",
      phone: "22 607 49 39",
      email: "infolease.pl@leasys.com",
    },
    {
      id: 8,
      name: "IMPULS-LEASING POLSKA SP. Z O.O",
      formLink: "brak",
      phone: "22 463 90 00, 22 250 82 22",
      email: "SZKODY@IMPULS-LEASING.PL",
    },
    {
      id: 9,
      name: "ING LEASE Sp. z o.o.",
      formLink: "https://www.inglease.pl/obsluga-klienta/likwidacja-szkod",
      phone: "801 014 997, (22) 123 07 77",
      email: "brak",
    },
    {
      id: 10,
      name: "MAN FINANCIAL SERVICES POLAND SP. Z O.O.",
      formLink: "brak",
      phone: "58 55 40 950",
      email: "info@punktabrokers.pl",
    },
    {
      id: 11,
      name: "MERCEDES-BENZ LEASING POLSKA SP. Z O.O.",
      formLink: "brak",
      phone: "22 312 77 00",
      email: "administracja@mercedes-benz.com",
    },
    {
      id: 12,
      name: "MILLENIUM LEASING SP. Z O.O.",
      formLink: "brak",
      phone: "22 718 41 80",
      email: "sos@mfinanse.pl",
    },
    {
      id: 13,
      name: "MLEASING SP. Z O.O.",
      formLink: "brak",
      phone: "801-572-572",
      email: "szkodyml@rafauto.pl",
    },
    {
      id: 14,
      name: "NL-LEASING POLSKA SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
      formLink: "brak",
      phone: "58 300 00 59, 662 042 200",
      email: "brak",
    },
    {
      id: 15,
      name: "PACCAR FINANCIAL POLSKA SP. Z O.O.",
      formLink: "brak",
      phone: "22 458 95 00",
      email: "pfp.info@paccar.com",
    },
    {
      id: 16,
      name: "PEAC (POLAND) SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
      formLink: "brak",
      phone: "61 84 60 310",
      email: "info@peacfinance.pl",
    },
    {
      id: 17,
      name: "PEKAO LEASING SP. Z O.O.",
      formLink: "brak",
      phone: "800 506 441",
      email: "info@pekaoleasing.com.pl, szkodypekao@rafauto.pl",
    },
    {
      id: 18,
      name: "PKO LEASING ODDZIAŁ S.A.",
      formLink: "brak",
      phone: "22 260 36 66, 801 887 887",
      email: "brak",
    },
    {
      id: 19,
      name: "RCI Leasing Polska SP. Z O. O.",
      formLink: "brak",
      phone: "22 541 13 91",
      email: "roszczenia@rcibanque.com, szkody-leasing@rcibanque.com",
    },
    {
      id: 20,
      name: "RCI LEASING POLSKA SP. Z O.O.",
      formLink: "brak",
      phone: "22 541 13 91",
      email: "roszczenia@rcibanque.com, szkody-leasing@rcibanque.com",
    },
    {
      id: 21,
      name: "SANTANDER LEASING S. A.",
      formLink: "brak",
      phone: "61 850 35 25",
      email: "szkody@santanderleasing.pl",
    },
    {
      id: 22,
      name: "SG EQUIPMENT LEASING POLSKA SP. Z O.O.",
      formLink: "brak",
      phone: "22 528 46 00",
      email: "bok-pl-es@groupebpce.com",
    },
    {
      id: 23,
      name: "TOYOTA LEASING POLSKA SP. Z O.O.",
      formLink: "www.zgloszenieszkody.toyotaleasing.pl",
      phone: "(22) 880 96 77 dla Toyoty, (22) 880 96 88 dla Lexusa",
      email: "brak",
    },
    {
      id: 24,
      name: "VB LEASING S.A.",
      formLink: "https://idform.activemotors.net/",
      phone: "801 199 199",
      email: "szkody@vbl.pl",
    },
    {
      id: 25,
      name: "Inne",
      formLink: "",
      phone: "",
      email: "",
    },
  ]

  static getCompanies(): LeasingCompany[] {
    return this.companies
  }

  static getCompanyById(id: number): LeasingCompany | undefined {
    return this.companies.find((company) => company.id === id)
  }

  static sortCompaniesAlphabetically(companies: LeasingCompany[]): LeasingCompany[] {
    return [...companies].sort((a, b) => a.name.localeCompare(b.name, "pl", { sensitivity: "base" }))
  }
}
