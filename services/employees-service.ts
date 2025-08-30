import { apiService } from "@/lib/api";
import { Employee } from "@/types/employee";

export async function getEmployees(): Promise<Employee[]> {
  const res = await apiService.getEmployees();
  return res.map((e) => ({
    id: e.id.toString(),
    name: `${e.firstName} ${e.lastName}`.trim(),
    email: e.email,
    departmentId: e.departmentId?.toString(),
  }));
}
