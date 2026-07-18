import { createGetSystemStatus } from "./application/get-system-status.js";
import { loadConfig } from "./config.js";
import { openDatabase } from "./persistence/database.js";
import { createServer } from "./presentation/server.js";

const config = loadConfig();
const database = openDatabase(config);
const getSystemStatus = createGetSystemStatus({ database });
const server = createServer({ getSystemStatus, publicPath: config.publicPath });

server.listen(config.port, config.host, () => {
  console.log(`Amanah Cash listening on http://${config.host}:${config.port}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
