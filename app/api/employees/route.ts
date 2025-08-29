import { NextResponse } from "next/server";
import { getEmployees } from "./data";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  const employees = getEmployees();

  if (userId) {
    const current = employees.find((e) => e.id === userId);
    const departmentId = current?.departmentId;
    const list = employees.filter(
      (e) => e.id !== userId && (!departmentId || e.departmentId === departmentId),
    );
    return NextResponse.json(list);
  }

  return NextResponse.json(employees);
}
