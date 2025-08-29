import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
const dataFile = path.join(process.cwd(), 'app/api/leaves/leaves.json');

async function seed() {
  const sample = [
    {
      id: randomUUID(),
      employeeId: '1',
      employeeName: 'Jan Kowalski',
      employeeEmail: 'jan@example.com',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      type: 'Wypoczynkowy',
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    },
  ];

  await fs.writeFile(dataFile, JSON.stringify(sample, null, 2));
  console.log(`Seeded leaves data at ${dataFile}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
