import type { Handler } from "@/types/handler"

export class HandlersService {
  private static handlers: Handler[] = [
    {
      id: 1,
      name: "Małgorzata Roczniak",
      email: "malgorzata.roczniak@sparta.pl",
      phone: "+48 22 123 45 67",
      department: "Likwidacja szkód",
      position: "Starszy likwidator",
      userId: "user-1",
    },
    {
      id: 2,
      name: "Anna Kowalska",
      email: "anna.kowalska@sparta.pl",
      phone: "+48 22 234 56 78",
      department: "Likwidacja szkód",
      position: "Likwidator",
      userId: "user-2",
    },
    {
      id: 3,
      name: "Piotr Nowak",
      email: "piotr.nowak@sparta.pl",
      phone: "+48 22 345 67 89",
      department: "Likwidacja szkód",
      position: "Likwidator senior",
      userId: "user-3",
    },
    {
      id: 4,
      name: "Katarzyna Wiśniewska",
      email: "katarzyna.wisniewska@sparta.pl",
      phone: "+48 22 456 78 90",
      department: "Prawny",
      position: "Radca prawny",
      userId: "user-4",
    },
    {
      id: 5,
      name: "Tomasz Wójcik",
      email: "tomasz.wojcik@sparta.pl",
      phone: "+48 22 567 89 01",
      department: "Techniczny",
      position: "Rzeczoznawca",
      userId: "user-5",
    },
    {
      id: 6,
      name: "Magdalena Kaczmarek",
      email: "magdalena.kaczmarek@sparta.pl",
      phone: "+48 22 678 90 12",
      department: "Obsługa klienta",
      position: "Specjalista ds. klienta",
      userId: "user-6",
    },
    {
      id: 7,
      name: "Marcin Zieliński",
      email: "marcin.zielinski@sparta.pl",
      phone: "+48 22 789 01 23",
      department: "Likwidacja szkód",
      position: "Kierownik działu",
      userId: "user-7",
    },
    {
      id: 8,
      name: "Agnieszka Szymańska",
      email: "agnieszka.szymanska@sparta.pl",
      phone: "+48 22 890 12 34",
      department: "Regres",
      position: "Specjalista ds. regresu",
      userId: "user-8",
    },
    {
      id: 9,
      name: "Paweł Dąbrowski",
      email: "pawel.dabrowski@sparta.pl",
      phone: "+48 22 901 23 45",
      department: "Likwidacja szkód",
      position: "Likwidator",
      userId: "user-9",
    },
    {
      id: 10,
      name: "Joanna Lewandowska",
      email: "joanna.lewandowska@sparta.pl",
      phone: "+48 22 012 34 56",
      department: "Prawny",
      position: "Aplikant radcowski",
      userId: "user-10",
    },
  ]

  static getHandlers(): Handler[] {
    return this.handlers
  }

  static getHandlerById(id: number): Handler | undefined {
    return this.handlers.find((handler) => handler.id === id)
  }

  static getHandlerByName(name: string): Handler | undefined {
    return this.handlers.find((handler) => handler.name === name)
  }

  static sortHandlersAlphabetically(handlers: Handler[]): Handler[] {
    return [...handlers].sort((a, b) => a.name.localeCompare(b.name, "pl", { sensitivity: "base" }))
  }
}
