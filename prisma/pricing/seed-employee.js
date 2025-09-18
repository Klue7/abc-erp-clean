require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.employee.upsert({
      where: { employeeId: "EMP-001" },
      update: {},
      create: {
        employeeId: "EMP-001",
        name: "Sample Employee",
        email: "employee@example.com",
        workEmail: "employee@abc.local",
        contactNumber: "000-000-0000",
        role: "STAFF",
        team: "Operations",
        isActive: true,
      },
    });
    console.log("✅ Seeded Employee EMP-001");
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
run();
