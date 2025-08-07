export interface Employee {
  name: string
  email: string
  role: "dyspozytor" | "kierownik" | "likwidacja" | "prezes" | "administrator"
}

export interface Branch {
  id: string
  name: string
  company: string
  employees: Employee[]
}

export const pksData: Branch[] = [
  {
    id: "gostynin",
    name: "Gostynin",
    company: "PKS Gostynin",
    employees: [
      { name: "Dyspozytornia Gostynin", email: "dyspozytornia@pksgostynin.pl", role: "dyspozytor" },
      { name: "Kierownik Gostynin", email: "sogostynin@pksgostynin.pl", role: "kierownik" },
    ],
  },
  {
    id: "elblag",
    name: "Elbląg",
    company: "PKS Gostynin",
    employees: [
      { name: "Dyspozytornia Elbląg", email: "elblag@pksgostynin.pl", role: "dyspozytor" },
      { name: "P. Jagłowski", email: "p.jaglowski@pksgostynin.pl", role: "kierownik" },
    ],
  },
  {
    id: "sosnowiec",
    name: "Sosnowiec",
    company: "PKS Grodzisk Maz.",
    employees: [
      { name: "Dyspozytornia Śląsk", email: "slask@pksgrodzisk.pl", role: "dyspozytor" },
      { name: "K. Chajdas", email: "k.chajdas@pksgrodzisk.pl", role: "kierownik" },
    ],
  },
  {
    id: "sochaczew",
    name: "Sochaczew",
    company: "PKS Grodzisk Maz.",
    employees: [
      { name: "Dyspozytornia Sochaczew", email: "sochaczew@pksgrodzisk.com.pl", role: "dyspozytor" },
      { name: "M. Wadecki", email: "m.wadecki@pksgrodzisk.pl", role: "kierownik" },
    ],
  },
  {
    id: "grodzisk",
    name: "Grodzisk Mazowiecki",
    company: "PKS Grodzisk Maz.",
    employees: [
      { name: "Przewozy Grodzisk", email: "przewozy@pksgrodzisk.com.pl", role: "dyspozytor" },
      { name: "B. Domańska", email: "b.domanska@pksgrodzisk.pl", role: "kierownik" },
    ],
  },
  {
    id: "pruszkow",
    name: "Pruszków",
    company: "PKS Grodzisk Maz.",
    employees: [
      { name: "Dyspozytornia Pruszków", email: "pruszkow@pksgrodzisk.pl", role: "dyspozytor" },
      { name: "M. Konopka", email: "m.konopka@pksgrodzisk.pl", role: "kierownik" },
    ],
  },
  {
    id: "warszawa",
    name: "Warszawa",
    company: "PKS Grodzisk Maz.",
    employees: [
      { name: "Klementowicka", email: "klementowicka@pksgrodzisk.pl", role: "dyspozytor" },
      { name: "M. Kaczor", email: "m.kaczor@pksgrodzisk.pl", role: "kierownik" },
    ],
  },
  {
    id: "zyrardow",
    name: "Żyrardów",
    company: "PKS Grodzisk Maz.",
    employees: [
      { name: "Dyspozytornia Żyrardów", email: "zyrardow@pksgrodzisk.com.pl", role: "dyspozytor" },
      { name: "D. Pater", email: "d.pater@pksgrodzisk.pl", role: "kierownik" },
    ],
  },
  {
    id: "skierniewice",
    name: "Skierniewice",
    company: "PKS Skierniewice",
    employees: [
      { name: "Dyspozytornia Skierniewice", email: "skierniewice@pksskierniewice.pl", role: "dyspozytor" },
      { name: "S. Marat", email: "s.marat@pksskierniewice.pl", role: "kierownik" },
    ],
  },
  {
    id: "lowicz",
    name: "Łowicz",
    company: "PKS Skierniewice",
    employees: [
      { name: "Dyspozytornia Łowicz", email: "lowicz@pksskierniewice.pl", role: "dyspozytor" },
      { name: "M. Wadecki", email: "m.wadecki@pksgrodzisk.pl", role: "kierownik" },
    ],
  },
  {
    id: "rawa",
    name: "Rawa Mazowiecka",
    company: "PKS Skierniewice",
    employees: [
      { name: "Dyspozytornia Rawa", email: "rawa@pksskierniewice.pl", role: "dyspozytor" },
      { name: "Kierownik Rawa", email: "sorawa@pksskierniewice.pl", role: "kierownik" },
    ],
  },
  {
    id: "kutno",
    name: "Kutno",
    company: "PKS Kutno",
    employees: [
      { name: "CPN Kutno", email: "cpn@pkskutno.pl", role: "dyspozytor" },
      { name: "I. Garstka", email: "i.garstka@pkskutno.pl", role: "kierownik" },
    ],
  },
]

export const specialRoles: Employee[] = [
  { name: "Monika Kaniewska", email: "m.kaniewska@pksgrodzisk.pl", role: "likwidacja" },
  { name: "Patrycja Przybył", email: "p.przybyl@pksskierniewice.pl", role: "likwidacja" },
  { name: "Radosław Marek", email: "r.marek@pksgrodzisk.pl", role: "prezes" },
  { name: "Katarzyna Godyń", email: "k.godyn@pksskierniewice.pl", role: "administrator" },
]
