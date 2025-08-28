import { NextResponse } from "next/server";
import { getLeave, updateLeave, removeLeave } from "../db";
import { LeaveRequest } from "@/types/leave";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const leave = await getLeave(params.id);
  if (!leave) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(leave);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json()) as Partial<LeaveRequest>;
  const employeeId = request.headers.get("x-user-id") || body.employeeId;
  const employeeName = request.headers.get("x-user-name") || body.employeeName;
  const updated = await updateLeave(params.id, { ...body, employeeId, employeeName });
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const removed = await removeLeave(params.id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
