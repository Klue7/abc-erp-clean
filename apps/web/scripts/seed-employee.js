const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

const envLocalPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

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
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
