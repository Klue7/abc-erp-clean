import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.employee.upsert({
    where: { employeeId: "EMP-001" },
    update: {},
    create: {
      employeeId: "EMP-001",
      name: "Sample Employee",
      email: "employee@example.com",
      workEmail: "employee@abc.local",
      contactNumber: "000-000-0000",
      address: "123 Demo Street, Gqeberha",
      bankName: "ABC Bank",
      bankAccountHolder: "Sample Employee",
      bankAccountNumber: "1234567890",
      basicSalary: 18000,
      role: "STAFF" as any,
      team: "Operations",
      isActive: true,
    },
  });
  console.log("✅ Seeded Employee EMP-001");
}

async function run() {
  try {
    await seed();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await prisma.();
  }
}

run();
