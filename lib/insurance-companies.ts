import type { InsuranceCompany } from "@/types/insurance"

export class InsuranceCompaniesService {
  private static companies: InsuranceCompany[] = [
    {
      id: 1,
      name: "PZU S.A.",
      formLink: "https://zgloszenie.pzu.pl/#/",
      phone: "801 102 102",
      email: "kontakt@pzu.pl",
      leasingIds: [],
    },
    {
      id: 2,
      name: "COMPENSA Towarzystwo Ubezpieczeń S.A. Vienna Insurance Group",
      formLink: "https://zgloszenie.compensa.pl/",
      phone: "22 501 61 00",
      email: "szkody@compensa.pl",
    },
    {
      id: 3,
      name: "Towarzystwo Ubezpieczeń Lev Ins AD",
      formLink: "https://www.uniqa.pl/szkody-i-roszczenia/",
      phone: "22 589 95 21",
      email: "zgloszenia@lu.pl",
    },
    {
      id: 4,
      name: "UNIQA Towarzystwo Ubezpieczeń S.A.",
      formLink: "https://www.uniqa.pl/szkody-i-roszczenia/",
      phone: "22 599 95 22",
      email: "",
    },
    {
      id: 5,
      name: "AGRO Ubezpieczenia – Towarzystwo Ubezpieczeń Wzajemnych",
      formLink: "https://agroubezpieczenia.pl/strefa-klienta/zgloszenie-szkody-roszczenia",
      phone: "801 00 22 88",
      email: "poczta@agroubezpieczenia.pl",
    },
    {
      id: 6,
      name: "Towarzystwo Ubezpieczeń i Reasekuracji WARTA S.A.",
      formLink: "https://www.warta.pl/pomoc-i-obsluga/zgloszenie-szkody/",
      phone: "502-308-308",
      email: "szkody@warta.pl",
    },
    {
      id: 7,
      name: "UNIQA Towarzystwo Ubezpieczeń S.A. (przed połączeniem)",
      formLink: "https://www.uniqa.pl/szkody-i-roszczenia/",
      phone: "22 599 95 22",
      email: "",
    },
    {
      id: 8,
      name: "Towarzystwo Ubezpieczeń Wzajemnych TUZ",
      formLink: "https://tuz.pl/zglos-szkode/zglos-szkode/",
      phone: "22 327 60 60",
      email: "szkody@tuz.pl",
    },
    {
      id: 9,
      name: "Towarzystwo Ubezpieczeń Wzajemnych T.U.W.",
      formLink: "https://zgloszenie-szkody.tuw.pl/start",
      phone: "22 545 39 50",
      email: "zgloszenie.szkody@tuw.pl",
    },
    {
      id: 10,
      name: "WIENER Towarzystwo Ubezpieczeń S.A.",
      formLink: "https://zgloszenie.wiener.pl/pojazd/policyInfo",
      phone: "22 469 69 69",
      email: "kontakt@wiener.pl",
    },
    {
      id: 11,
      name: "Proama – Groupama S.A. Oddział w Polsce",
      formLink: "https://szkody.proama.pl/claimonweb/frontend/#/zglos-sprawe",
      phone: "815 815 815",
      email: "szkody@proama.pl",
    },
    {
      id: 12,
      name: "Liberty Seguros Compania de Seguros y Reaseguros S.A. Oddział w Polsce",
      formLink: "",
      phone: "22 589 95 21",
      email: "zgloszenia@lu.pl",
    },
    {
      id: 13,
      name: "Link4 Towarzystwo Ubezpieczeń S.A.",
      formLink: "https://www.link4.pl/claims/zgloszenie",
      phone: "22 444 44 44",
      email: "szkody@link4.pl",
    },
    {
      id: 14,
      name: "INTERRISK S.A. Towarzystwo Ubezpieczeń S.A. Vienna Insurance Group",
      formLink: "https://interrisk.pl/interrisk/zglos-szkode/",
      phone: "22 575 25 25",
      email: "szkody@interrisk.pl",
    },
    {
      id: 15,
      name: "Towarzystwo Ubezpieczeń INTER POLSKA S.A.",
      formLink: "https://www.interpolska.pl/zglos-szkode",
      phone: "",
      email: "",
    },
    {
      id: 16,
      name: "Sopockie Towarzystwo Ubezpieczeń ERGO Hestia S.A.",
      formLink: "https://www.ergohestia.pl/zglos-szkode",
      phone: "58 555 5 555",
      email: "BrokerSzkody@ergohestia.pl",
    },
    {
      id: 17,
      name: "HDI",
      formLink: "https://www.hdi.pl/zglos-szkode/komunikacyjna",
      phone: "",
      email: "",
    },
    {
      id: 18,
      name: "GENERALI Towarzystwo Ubezpieczeń S.A.",
      formLink: "https://www.generali.pl/dla-ciebie/obsluga-klienta/zglos-szkode.html",
      phone: "",
      email: "szkody@generali.pl",
    },
    {
      id: 19,
      name: "Towarzystwo Ubezpieczeń FILAR S.A.",
      formLink: "",
      phone: "",
      email: "",
    },
    {
      id: 20,
      name: "CONCORDIA POLSKA Towarzystwo Ubezpieczeń Wzajemnych",
      formLink: "https://www.generali.pl/dla-ciebie/obsluga-klienta/zglos-szkode.html",
      phone: "",
      email: "szkody@generali.pl",
    },
    {
      id: 21,
      name: "BENEFIA Towarzystwo Ubezpieczeń S.A. Vienna Insurance Group",
      formLink: "https://benefia.pl/zglos-szkode/",
      phone: "22 212 20 30 / 22 544 14 70",
      email: "",
    },
    {
      id: 22,
      name: "AXA Ubezpieczenia Towarzystwo Ubezpieczeń i Reasekuracji S.A. (AXA Partners)",
      formLink: "https://www.axa-assistance.pl/zgloszenie-szkody/",
      phone: "22 575 97 28",
      email: "likwidacja@axa-assistance.pl",
    },
    {
      id: 23,
      name: "AVIVA Towarzystwo Ubezpieczeń Ogólnych S.A. / Allianz Polska",
      formLink: "https://www.allianz.pl/pl_PL/dla-ciebie/szkody-roszczenia.html",
      phone: "22 422 42 24",
      email: "",
    },
    {
      id: 24,
      name: "Amplico Life S.A.",
      formLink: "https://www.nn.pl/zglos-zdarzenie.html",
      phone: "22 522 71 24",
      email: "",
    },
    {
      id: 25,
      name: "Towarzystwo Ubezpieczeń i Reasekuracji ALLIANZ Polska S.A.",
      formLink: "https://www.allianz.pl/pl_PL/dla-ciebie/szkody-roszczenia.html",
      phone: "22 422 42 24",
      email: "",
    },
    {
      id: 26,
      name: "PKO Towarzystwo Ubezpieczeń S.A.",
      formLink: "https://pkoubezpieczenia.pl/kontakt",
      phone: "81 535 67 66",
      email: "auto@pkoubezpieczenia.pl, majatek@pkoubezpieczenia.pl",
    },
    {
      id: 27,
      name: "BALCIA Insurance",
      formLink: "https://www.balcia.pl/pl/szkody",
      phone: "22 299 00 81",
      email: "szkody@balcia.com",
    },
    {
      id: 28,
      name: "Beesafe",
      formLink: "https://beesafe.pl/szkoda-oc",
      phone: "500 965 626",
      email: "",
    },
    {
      id: 29,
      name: "EUROINS Insurance Group – EINS Polska Sp. z o.o.",
      formLink: "https://eins.pl/zgloszenie-szkody/",
      phone: "22 243 84 84",
      email: "szkody@eins.pl",
    },
    {
      id: 30,
      name: "TRASTI",
      formLink: "https://trasti.pl/zgloszenie-szkody",
      phone: "222 509 373",
      email: "kontakt@trasti.pl",
    },
    {
      id: 31,
      name: "TU Wefox Insurance – UNEXT",
      formLink: "https://unext.pl/zgloszenie-szkody",
      phone: "22 123 55 55",
      email: "szkody@unext.pl",
    },
    {
      id: 32,
      name: "Inne",
      formLink: "",
      phone: "",
      email: "",
    },
  ]

  static getCompanies(): InsuranceCompany[] {
    return this.companies
  }

  static getCompanyById(id: number): InsuranceCompany | undefined {
    return this.companies.find((company) => company.id === id)
  }

  static getCompanyByLeasingId(leasingId: number): InsuranceCompany | undefined {
    return this.companies.find((company) => company.leasingIds && company.leasingIds.includes(leasingId))
  }

  static sortCompaniesAlphabetically(companies: InsuranceCompany[]): InsuranceCompany[] {
    return [...companies].sort((a, b) => a.name.localeCompare(b.name, "pl", { sensitivity: "base" }))
  }
}
