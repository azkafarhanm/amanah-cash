import "dotenv/config";
import { spawnSync } from "node:child_process";

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const isPostgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

if (!isPostgres) {
  console.log("Pending-migration check skipped: the configured target is not PostgreSQL.");
  process.exit(0);
}

const prismaCommand = process.platform === "win32" ? "prisma.cmd" : "prisma";
const result = spawnSync(prismaCommand, ["migrate", "status"], {
  encoding: "utf8",
  env: process.env
});

if (result.error) throw result.error;

const report = `${result.stdout ?? ""}${result.stderr ?? ""}`;
process.stdout.write(report);

if (result.status !== 0 || /have not yet been applied/i.test(report)) {
  console.error(
    [
      "",
      "Build stopped: this release expects migrations the database does not have.",
      "Financial schema changes are applied deliberately, never by a build, so run",
      "them yourself and then build again:",
      "",
      "  npx prisma migrate deploy",
      ""
    ].join("\n")
  );
  process.exit(1);
}

console.log("Database carries every migration this release expects.");
