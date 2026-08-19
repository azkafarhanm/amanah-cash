import dns from "node:dns";
import net from "node:net";
import { URL } from "node:url";
import pg from "pg";

const { Client } = pg;

function sanitizeUrl(rawUrl: string): { host: string; port: number; sanitized: string } {
  try {
    const parsed = new URL(rawUrl);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      sanitized: `${parsed.protocol}//${parsed.username}:***@${parsed.hostname}:${parsed.port || 5432}${parsed.pathname}?${parsed.searchParams.toString()}`
    };
  } catch (err) {
    throw new Error(`Invalid URL format: ${(err as Error).message}`);
  }
}

async function testTcp(ip: string, port: number, timeoutMs = 5000): Promise<{ ok: boolean; duration: number; error?: string }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(timeoutMs);

    socket.connect(port, ip, () => {
      const duration = Date.now() - start;
      socket.destroy();
      resolve({ ok: true, duration });
    });

    socket.on("error", (err) => {
      socket.destroy();
      resolve({ ok: false, duration: Date.now() - start, error: err.message });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ ok: false, duration: timeoutMs, error: "ETIMEDOUT (Connection timed out)" });
    });
  });
}

async function main() {
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!directUrl) {
    console.error("ERROR: DIRECT_URL or DATABASE_URL must be provided.");
    console.error("Usage: DIRECT_URL=\"postgresql://...\" npx tsx scripts/diagnose-neon-connection.ts");
    process.exit(1);
  }

  const { host, port, sanitized } = sanitizeUrl(directUrl);

  console.log("===============================================================");
  console.log("=== NEON POSTGRESQL NETWORK & CONNECTIVITY DIAGNOSTIC ===");
  console.log("===============================================================");
  console.log(`Target: ${sanitized}`);
  console.log(`Hostname: ${host}`);
  console.log(`Port: ${port}`);

  // 1. DNS Resolution
  console.log("\n1. DNS Resolution (A vs AAAA)...");
  let ipv4Addresses: string[] = [];
  let ipv6Addresses: string[] = [];

  try {
    ipv4Addresses = await dns.promises.resolve4(host);
    console.log(`  ✔ IPv4 (A) Records: ${ipv4Addresses.join(", ")}`);
  } catch (err) {
    console.log(`  ✖ IPv4 (A) Resolution failed: ${(err as Error).message}`);
  }

  try {
    ipv6Addresses = await dns.promises.resolve6(host);
    console.log(`  ✔ IPv6 (AAAA) Records: ${ipv6Addresses.join(", ")}`);
  } catch (err) {
    console.log(`  ℹ IPv6 (AAAA) Records: None or not returned (${(err as Error).message})`);
  }

  // 2. TCP Socket Connectivity Test
  console.log("\n2. Direct TCP Socket Connectivity Test (Port " + port + ")...");
  for (const ip of ipv4Addresses) {
    console.log(`  Testing IPv4: ${ip}:${port}...`);
    const res = await testTcp(ip, port);
    if (res.ok) {
      console.log(`    ✔ SUCCESS connected in ${res.duration}ms`);
    } else {
      console.log(`    ✖ FAILED: ${res.error} (${res.duration}ms)`);
    }
  }

  for (const ip of ipv6Addresses) {
    console.log(`  Testing IPv6: [${ip}]:${port}...`);
    const res = await testTcp(ip, port);
    if (res.ok) {
      console.log(`    ✔ SUCCESS connected in ${res.duration}ms`);
    } else {
      console.log(`    ✖ FAILED: ${res.error} (${res.duration}ms)`);
    }
  }

  // 3. Test Node.js default dns.lookup vs ipv4first
  console.log("\n3. Testing Node.js default lookup order...");
  const defaultLookup = await new Promise<{ address: string; family: number }>((resolve, reject) => {
    dns.lookup(host, (err, address, family) => {
      if (err) reject(err);
      else resolve({ address, family });
    });
  }).catch((err) => ({ address: "FAILED: " + err.message, family: 0 }));

  console.log(`  Default dns.lookup returns: ${defaultLookup.address} (IPv${defaultLookup.family})`);

  // 4. Test TLS/SSL PostgreSQL Connection (Read-only SELECT 1)
  console.log("\n4. Testing PostgreSQL Client Connection (read-only)...");
  
  // Test with current DNS settings
  console.log("  Attempting connection with default settings...");
  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    const res = await client.query("SELECT version(), current_database(), current_schema();");
    console.log(`  ✔ SUCCESS! Connected to Neon:`);
    console.log(`    Database: ${res.rows[0].current_database}`);
    console.log(`    Version: ${res.rows[0].version.split(",")[0]}`);
    console.log(`    Schema: ${res.rows[0].current_schema}`);
    await client.end();
  } catch (err) {
    console.log(`  ✖ Connection FAILED: ${(err as Error).message}`);
    
    // Now try with ipv4first
    console.log("\n  Attempting fallback with dns.setDefaultResultOrder('ipv4first')...");
    dns.setDefaultResultOrder("ipv4first");
    
    const clientIpv4 = new Client({
      connectionString: directUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });

    try {
      await clientIpv4.connect();
      const res = await clientIpv4.query("SELECT version(), current_database(), current_schema();");
      console.log(`  ✔ SUCCESS with ipv4first! Connected to Neon:`);
      console.log(`    Database: ${res.rows[0].current_database}`);
      console.log(`    Version: ${res.rows[0].version.split(",")[0]}`);
      await clientIpv4.end();
      console.log("\n  >>> ROOT CAUSE CONFIRMED: WSL DNS was defaulting to unreachable IPv6 (AAAA) records. Setting --dns-result-order=ipv4first solves it!");
    } catch (fallbackErr) {
      console.log(`  ✖ Fallback also failed: ${(fallbackErr as Error).message}`);
    }
  }

  // 5. Compare Direct vs Pooled Endpoint Structure
  console.log("\n5. Hostname Analysis (Direct vs Pooled)...");
  const isPooled = host.includes("-pooler") || port === 6543;
  if (isPooled) {
    console.log(`  ℹ The endpoint is a POOLED connection (${host}).`);
    console.log(`    Note: DIRECT_URL for migrations is recommended to be the unpooled endpoint.`);
  } else {
    console.log(`  ✔ The endpoint is a DIRECT connection (${host}).`);
  }

  console.log("\n===============================================================");
  console.log("=== DIAGNOSTIC COMPLETE ===");
  console.log("===============================================================");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
