export type GoogleIdentityProfile = {
  email?: string | null;
  email_verified?: boolean | null;
};

export type AdmissionUser = {
  id: string;
  email: string;
  isActive: boolean;
};

export type AdmissionUserRepository = {
  findByNormalizedEmail(email: string): Promise<AdmissionUser | null>;
};

export type AdmissionDecision =
  | { allowed: true; user: AdmissionUser; normalizedEmail: string }
  | { allowed: false; reason: "INVALID_PROVIDER" | "UNVERIFIED_EMAIL" | "UNKNOWN_OR_INACTIVE" };

export function normalizeGoogleEmail(email: string): string {
  return email.trim().toLocaleLowerCase("en-US");
}

export function isGoogleAccountBindingValid(
  admittedUserId: string,
  linkedUserId: string | null
): boolean {
  return linkedUserId === null || linkedUserId === admittedUserId;
}

export async function evaluateGoogleAdmission({
  provider,
  profile,
  users
}: {
  provider: string | undefined;
  profile: GoogleIdentityProfile | undefined;
  users: AdmissionUserRepository;
}): Promise<AdmissionDecision> {
  if (provider !== "google") {
    return { allowed: false, reason: "INVALID_PROVIDER" };
  }

  const normalizedEmail = profile?.email ? normalizeGoogleEmail(profile.email) : "";
  if (!normalizedEmail || profile?.email_verified !== true) {
    return { allowed: false, reason: "UNVERIFIED_EMAIL" };
  }

  const user = await users.findByNormalizedEmail(normalizedEmail);
  if (!user?.isActive) {
    return { allowed: false, reason: "UNKNOWN_OR_INACTIVE" };
  }

  return { allowed: true, user, normalizedEmail };
}
