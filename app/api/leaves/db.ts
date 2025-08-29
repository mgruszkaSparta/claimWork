import fs from 'fs/promises';
import path from 'path';
import { LeaveRequest } from '@/types/leave';

const dataFile = path.join(process.cwd(), 'app/api/leaves/leaves.json');

async function readLeaves(): Promise<LeaveRequest[]> {
  try {
    const data = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(data) as LeaveRequest[];
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(dataFile, '[]', 'utf-8');
      return [];
    }
    throw err;
  }
}

async function writeLeaves(leaves: LeaveRequest[]): Promise<void> {
  await fs.writeFile(dataFile, JSON.stringify(leaves, null, 2));
}

export async function getLeaves() {
  return readLeaves();
}

export async function getLeave(id: string) {
  const leaves = await readLeaves();
  return leaves.find((l) => l.id === id);
}

export async function addLeave(request: LeaveRequest) {
  const leaves = await readLeaves();
  leaves.push(request);
  await writeLeaves(leaves);
}

export async function updateLeave(id: string, data: Partial<LeaveRequest>) {
  const leaves = await readLeaves();
  const index = leaves.findIndex((l) => l.id === id);
  if (index === -1) return null;
  leaves[index] = { ...leaves[index], ...data };
  await writeLeaves(leaves);
  return leaves[index];
}

export async function removeLeave(id: string) {
  const leaves = await readLeaves();
  const index = leaves.findIndex((l) => l.id === id);
  if (index === -1) return false;
  leaves.splice(index, 1);
  await writeLeaves(leaves);
  return true;
}
