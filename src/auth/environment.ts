export type AuthenticationEnvironment = {
  databaseUrl: string;
  googleClientId: string;
  googleClientSecret: string;
  nextAuthSecret: string;
  nextAuthUrl: string;
  production: boolean;
};

export class AuthenticationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationConfigurationError";
  }
}

function required(environment: NodeJS.ProcessEnv, name: string): string {
  const value = environment[name]?.trim();
  if (!value) {
    throw new AuthenticationConfigurationError(`${name} is required`);
  }
  return value;
}

export function loadAuthenticationEnvironment(
  environment: NodeJS.ProcessEnv = process.env
): AuthenticationEnvironment {
  const databaseUrl = required(environment, "DATABASE_URL");
  const googleClientId = required(environment, "GOOGLE_CLIENT_ID");
  const googleClientSecret = required(environment, "GOOGLE_CLIENT_SECRET");
  const nextAuthSecret = required(environment, "NEXTAUTH_SECRET");
  const nextAuthUrl = required(environment, "NEXTAUTH_URL");
  const production = environment.NODE_ENV === "production";

  if (!databaseUrl.startsWith("file:")) {
    throw new AuthenticationConfigurationError("DATABASE_URL must use the approved SQLite file: URL");
  }
  if (nextAuthSecret.length < 32) {
    throw new AuthenticationConfigurationError("NEXTAUTH_SECRET must contain at least 32 characters");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(nextAuthUrl);
  } catch {
    throw new AuthenticationConfigurationError("NEXTAUTH_URL must be an absolute URL");
  }

  const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]"]);
  if (production && parsedUrl.protocol !== "https:" && !localHostnames.has(parsedUrl.hostname)) {
    throw new AuthenticationConfigurationError("NEXTAUTH_URL must use HTTPS in production except on localhost");
  }
  if (!production && parsedUrl.protocol !== "https:" && !localHostnames.has(parsedUrl.hostname)) {
    throw new AuthenticationConfigurationError("Non-HTTPS NEXTAUTH_URL is permitted only for localhost development");
  }
  if (parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
    throw new AuthenticationConfigurationError("NEXTAUTH_URL must be an origin without a path, query, or fragment");
  }

  return {
    databaseUrl,
    googleClientId,
    googleClientSecret,
    nextAuthSecret,
    nextAuthUrl: parsedUrl.origin,
    production
  };
}
