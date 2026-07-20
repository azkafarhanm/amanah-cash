import type { Adapter, AdapterSession, AdapterUser } from "next-auth/adapters";

type SessionPersistence = {
  deleteManyForUser(userId: string): Promise<void>;
};

export function createAuthenticationAdapter({
  baseAdapter,
  sessions,
  now = () => new Date()
}: {
  baseAdapter: Adapter;
  sessions: SessionPersistence;
  now?: () => Date;
}): Adapter {
  if (!baseAdapter.getSessionAndUser || !baseAdapter.deleteSession) {
    throw new Error("The configured Auth.js adapter must support database sessions");
  }

  return {
    ...baseAdapter,
    async createUser(): Promise<AdapterUser> {
      throw new Error("Amanah Cash users must be pre-provisioned");
    },
    async getSessionAndUser(sessionToken) {
      const result = await baseAdapter.getSessionAndUser!(sessionToken);
      if (!result) return null;

      const active = (result.user as AdapterUser & { isActive?: boolean }).isActive === true;
      if (!active) {
        await sessions.deleteManyForUser(result.user.id);
        return null;
      }

      if (result.session.expires.getTime() <= now().getTime()) {
        await baseAdapter.deleteSession!(sessionToken);
        return null;
      }

      return result;
    },
    async createSession(session): Promise<AdapterSession> {
      if (!baseAdapter.createSession) {
        throw new Error("The configured Auth.js adapter cannot create database sessions");
      }
      return baseAdapter.createSession(session);
    },
    async deleteSession(sessionToken) {
      const deleted = await baseAdapter.deleteSession!(sessionToken);
      return deleted === undefined ? null : deleted;
    }
  };
}
