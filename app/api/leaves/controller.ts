import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { LeaveRequest } from "@/types/leave";
import { addLeave, getLeaves, getLeave, updateLeave, removeLeave } from "./db";

export async function listLeaves() {
  const leaves = await getLeaves();
  return NextResponse.json(leaves);
}

export async function createLeave(request: Request) {
  const body = (await request.json()) as Partial<LeaveRequest>;
  const employeeId = request.headers.get("x-user-id") || body.employeeId || "";
  const employeeName = request.headers.get("x-user-name") || body.employeeName || "";

  const caseHandlerIdHeader = request.headers.get("x-case-handler-id");
  const caseHandlerId = caseHandlerIdHeader ? parseInt(caseHandlerIdHeader, 10) : body.caseHandlerId;

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
    substituteEmail: body.substituteEmail,
    substituteAcceptanceStatus: body.substituteAcceptanceStatus,
    transferDescription: body.transferDescription,
    urgentProjects: body.urgentProjects,
    importantContacts: body.importantContacts,
    approvedBy: body.approvedBy,
    approvedAt: body.approvedAt,
    rejectionReason: body.rejectionReason,

    caseHandlerId,

  };
  await addLeave(newLeave);
  return NextResponse.json(newLeave, { status: 201 });
}

export async function getLeaveById(id: string) {
  const leave = await getLeave(id);
  if (!leave) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(leave);
}

export async function updateLeaveById(id: string, request: Request) {
  const body = (await request.json()) as Partial<LeaveRequest>;
  const employeeId = request.headers.get("x-user-id") || body.employeeId;
  const employeeName = request.headers.get("x-user-name") || body.employeeName;

  const caseHandlerIdHeader = request.headers.get("x-case-handler-id");
  const caseHandlerId = caseHandlerIdHeader ? parseInt(caseHandlerIdHeader, 10) : body.caseHandlerId;
  const updated = await updateLeave(id, { ...body, employeeId, employeeName, caseHandlerId });



  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function deleteLeaveById(id: string) {
  const removed = await removeLeave(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
