
import { getLeaveById, updateLeaveById, deleteLeaveById } from "../controller";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return getLeaveById(params.id);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return updateLeaveById(params.id, request);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return deleteLeaveById(params.id);

}
