import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addLeave, getLeaves } from "./db";
import { LeaveRequest } from "@/types/leave";

export async function GET() {
  const leaves = await getLeaves();
  return NextResponse.json(leaves);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<LeaveRequest>;
  const employeeId = request.headers.get("x-user-id") || body.employeeId || "";
  const employeeName = request.headers.get("x-user-name") || body.employeeName || "";
  const newLeave: LeaveRequest = {
    id: randomUUID(),
    employeeId,
    employeeName,
    startDate: body.startDate || "",
    endDate: body.endDate || "",
    type: body.type || "Wypoczynkowy",
    status: "SUBMITTED",
    submittedAt: new Date().toISOString(),
    firstDayDuration: body.firstDayDuration,
    lastDayDuration: body.lastDayDuration,
    priority: body.priority,
    substituteId: body.substituteId,
    substituteName: body.substituteName,
    substituteAcceptanceStatus: body.substituteAcceptanceStatus,
    transferDescription: body.transferDescription,
    urgentProjects: body.urgentProjects,
    importantContacts: body.importantContacts,
    approvedBy: body.approvedBy,
    approvedAt: body.approvedAt,
    rejectionReason: body.rejectionReason,
  };
  await addLeave(newLeave);
  return NextResponse.json(newLeave, { status: 201 });
}
