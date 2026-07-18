export function createGetSystemStatus({ database }) {
  return function getSystemStatus() {
    const databaseConnected = database.isConnected();

    return {
      application: "amanah-cash",
      status: databaseConnected ? "ready" : "unavailable",
      database: databaseConnected ? "connected" : "disconnected"
    };
  };
}
