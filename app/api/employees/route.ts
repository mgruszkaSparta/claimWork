import { NextResponse } from "next/server";
import { getEmployees } from "./data";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  let list = getEmployees();
  if (userId) {
    list = list.filter((e) => e.id !== userId);
  }
  return NextResponse.json(list);
}
