import { Employee } from "@/types/employee";

const employees: Employee[] = [
  {
    id: "user-1",
    name: "Anna Kowalska",
    email: "anna.kowalska@example.com",
    departmentId: "dept-1",
  },
  {
    id: "user-2",
    name: "Jan Nowak",
    email: "jan.nowak@example.com",
    departmentId: "dept-1",
  },
  {
    id: "user-3",
    name: "Piotr Zieliński",
    email: "piotr.zielinski@example.com",
    departmentId: "dept-2",
  },
];

export function getEmployees() {
  return employees;
}
