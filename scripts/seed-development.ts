import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { loadAuthenticationEnvironment } from "../src/auth/environment";

const environment = loadAuthenticationEnvironment();

if (environment.production) {
  throw new Error("The development seed is disabled in production");
}

const adminEmail = process.env.DEV_SEED_ADMIN_EMAIL?.trim().toLocaleLowerCase("en-US");
const operatorEmail = process.env.DEV_SEED_OPERATOR_EMAIL?.trim().toLocaleLowerCase("en-US");
const studentName = process.env.DEV_SEED_STUDENT_NAME?.trim();

if (!adminEmail || !operatorEmail || !studentName) {
  throw new Error("DEV_SEED_ADMIN_EMAIL, DEV_SEED_OPERATOR_EMAIL, and DEV_SEED_STUDENT_NAME are required");
}
if (adminEmail === operatorEmail) {
  throw new Error("Development admin and operator emails must be different");
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: environment.databaseUrl })
});

try {
  const result = await prisma.$transaction(async (transaction) => {
    const admin = await transaction.user.upsert({
      where: { email: adminEmail },
      create: {
        id: "dev-platform-admin",
        name: "Development Platform Admin",
        email: adminEmail,
        role: "PLATFORM_ADMIN",
        isActive: true
      },
      update: {
        name: "Development Platform Admin",
        role: "PLATFORM_ADMIN",
        isActive: true,
        deletedAt: null
      }
    });
    const operator = await transaction.user.upsert({
      where: { email: operatorEmail },
      create: {
        id: "dev-operator",
        name: "Development Operator",
        email: operatorEmail,
        role: "OPERATOR",
        isActive: true
      },
      update: {
        name: "Development Operator",
        role: "OPERATOR",
        isActive: true,
        deletedAt: null
      }
    });
    const student = await transaction.student.upsert({
      where: { id: "dev-student" },
      create: {
        id: "dev-student",
        name: studentName,
        notes: "Local development seed",
        status: "ACTIVE",
        operatorId: operator.id
      },
      update: {
        name: studentName,
        notes: "Local development seed",
        status: "ACTIVE",
        operatorId: operator.id
      }
    });
    return { admin, operator, student };
  });

  console.log("Development data is ready.");
  console.log(`  Platform Admin: ${result.admin.email}`);
  console.log(`  Operator: ${result.operator.email}`);
  console.log(`  Student: ${result.student.name}`);
} finally {
  await prisma.$disconnect();
}
