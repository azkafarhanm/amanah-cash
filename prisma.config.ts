import "dotenv/config";
import { defineConfig } from "prisma/config";

const isPostgres =
  process.env.PRISMA_TARGET === "postgresql" ||
  process.env.DATABASE_URL?.startsWith("postgres://") ||
  process.env.DATABASE_URL?.startsWith("postgresql://");

export default defineConfig(
  isPostgres
    ? {
        schema: "prisma/schema.postgresql.prisma",
        migrations: {
          path: "prisma/migrations_postgresql"
        },
        datasource: {
          url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!
        }
      }
    : {
        schema: "prisma/schema.prisma",
        migrations: {
          path: "prisma/migrations"
        },
        datasource: {
          url: process.env.DATABASE_URL ?? "file:./data/amanah-cash.sqlite"
        }
      }
);

