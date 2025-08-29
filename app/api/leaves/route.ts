
import { listLeaves, createLeave } from "./controller";

export async function GET() {
  return listLeaves();
}

export async function POST(request: Request) {
  return createLeave(request);

}
