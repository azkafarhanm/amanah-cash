import type { DatabaseSync } from "node:sqlite";

export type OpenDatabaseOptions = {
  databasePath: string;
  migrationsPath: string;
};

export type OpenDatabaseResult = {
  connection: DatabaseSync;
  isConnected(): boolean;
  close(): void;
};

export function openDatabase(options: OpenDatabaseOptions): OpenDatabaseResult;
