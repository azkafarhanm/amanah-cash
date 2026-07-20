export type AuthorizationErrorCode =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "RESOURCE_NOT_FOUND";

export class AuthorizationError extends Error {
  constructor(
    public readonly status: 401 | 403 | 404,
    public readonly code: AuthorizationErrorCode,
    message: string
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class UnauthenticatedError extends AuthorizationError {
  constructor() {
    super(401, "UNAUTHENTICATED", "Authentication is required");
  }
}

export class UnauthorizedError extends AuthorizationError {
  constructor() {
    super(403, "UNAUTHORIZED", "You are not authorized to perform this operation");
  }
}

export class OwnershipNotFoundError extends AuthorizationError {
  constructor() {
    super(404, "RESOURCE_NOT_FOUND", "Resource not found");
  }
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}
