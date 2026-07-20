import assert from "node:assert/strict";
import { test } from "node:test";
import { withAuthorizationUsing } from "../src/authorization/api";
import { authorizeServerActionWith } from "../src/authorization/actions";
import {
  createAuthorization,
  type AuthorizationDependencies
} from "../src/authorization/core";
import {
  OwnershipNotFoundError,
  UnauthenticatedError,
  UnauthorizedError
} from "../src/authorization/errors";
import { authorizeRoute } from "../src/authorization/routes";

type Fixture = {
  sessionUserId?: string | null;
  user?: { id: string; role: string; isActive: boolean } | null;
  ownerships?: Array<{ studentId: string; operatorId: string }>;
};

function service(fixture: Fixture = {}) {
  const ownershipQueries: Array<{ studentId: string; operatorId: string }> = [];
  const dependencies: AuthorizationDependencies = {
    async resolveSessionUserId() {
      return fixture.sessionUserId === undefined ? "operator-1" : fixture.sessionUserId;
    },
    async findActiveUser(userId) {
      if (fixture.user === undefined) {
        return { id: userId, role: "OPERATOR", isActive: true };
      }
      return fixture.user;
    },
    async findOwnedStudent(studentId, operatorId) {
      ownershipQueries.push({ studentId, operatorId });
      return fixture.ownerships?.some(
        (ownership) =>
          ownership.studentId === studentId && ownership.operatorId === operatorId
      )
        ? { id: studentId }
        : null;
    }
  };
  return { authorization: createAuthorization(dependencies), ownershipQueries };
}

test("Platform Admin passes admin authorization and is not an implicit Operator", async () => {
  const { authorization } = service({
    sessionUserId: "admin-1",
    user: { id: "admin-1", role: "PLATFORM_ADMIN", isActive: true }
  });

  assert.equal((await authorization.requirePlatformAdmin()).id, "admin-1");
  assert.equal(await authorization.currentRole(), "PLATFORM_ADMIN");
  await assert.rejects(authorization.requireOperator(), UnauthorizedError);
});

test("Operator passes Operator authorization and cannot use admin routes", async () => {
  const { authorization } = service();

  assert.equal((await authorization.requireOperator()).id, "operator-1");
  assert.equal((await authorization.currentOperator()).role, "OPERATOR");
  await assert.rejects(authorizeRoute(authorization, "admin"), UnauthorizedError);
});

test("ownership succeeds only through a database query scoped by Student and current Operator", async () => {
  const { authorization, ownershipQueries } = service({
    ownerships: [{ studentId: "student-1", operatorId: "operator-1" }]
  });

  assert.equal(await authorization.canAccessStudent("student-1"), true);
  assert.equal(await authorization.canManageStudent("student-1"), true);
  assert.equal((await authorization.requireOwnership("student-1")).id, "operator-1");
  assert.deepEqual(ownershipQueries, [
    { studentId: "student-1", operatorId: "operator-1" },
    { studentId: "student-1", operatorId: "operator-1" },
    { studentId: "student-1", operatorId: "operator-1" }
  ]);
});

test("ownership failure masks missing and cross-Operator Students as 404", async () => {
  const { authorization } = service({
    ownerships: [{ studentId: "student-1", operatorId: "operator-2" }]
  });

  assert.equal(await authorization.canAccessStudent("student-1"), false);
  await assert.rejects(authorization.requireOwnership("student-1"), OwnershipNotFoundError);
  await assert.rejects(
    authorization.requireOwnership("student-1", { maskExistence: false }),
    UnauthorizedError
  );
});

test("anonymous requests fail with 401", async () => {
  const { authorization } = service({ sessionUserId: null });
  await assert.rejects(authorization.requireAuthenticatedUser(), (error) => {
    assert.ok(error instanceof UnauthenticatedError);
    assert.equal(error.status, 401);
    return true;
  });
});

test("inactive and deleted users fail closed as unauthenticated", async () => {
  for (const user of [
    { id: "operator-1", role: "OPERATOR", isActive: false },
    null
  ]) {
    const { authorization } = service({ user });
    await assert.rejects(authorization.requireAuthenticatedUser(), UnauthenticatedError);
  }
});

test("invalid persisted roles fail closed instead of gaining a default role", async () => {
  const { authorization } = service({
    user: { id: "operator-1", role: "SUPERUSER", isActive: true }
  });
  await assert.rejects(authorization.requireAuthenticatedUser(), UnauthenticatedError);
});

test("route helper protects authenticated, admin, and Operator route classes", async () => {
  const { authorization } = service();
  assert.equal((await authorizeRoute(authorization, "authenticated")).id, "operator-1");
  assert.equal((await authorizeRoute(authorization, "operator")).role, "OPERATOR");
  await assert.rejects(authorizeRoute(authorization, "admin"), UnauthorizedError);
});

test("Server Action helper applies the shared role and ownership policies", async () => {
  const { authorization } = service({
    ownerships: [{ studentId: "student-1", operatorId: "operator-1" }]
  });
  assert.equal(
    (await authorizeServerActionWith(authorization, {
      role: "owner",
      studentId: "student-1"
    })).id,
    "operator-1"
  );
  await assert.rejects(
    authorizeServerActionWith(authorization, { role: "admin" }),
    UnauthorizedError
  );
});

test("future API wrapper returns stable JSON 401/403/404 responses and invokes authorized handlers", async () => {
  const request = new Request("https://cash.example.com/api/operator/students/student-1");
  const anonymous = service({ sessionUserId: null }).authorization;
  const anonymousHandler = withAuthorizationUsing(
    () => anonymous,
    { role: "authenticated" },
    async () => Response.json({ ok: true })
  );
  const anonymousResponse = await anonymousHandler(request);
  assert.equal(anonymousResponse.status, 401);
  assert.equal(anonymousResponse.headers.get("cache-control"), "no-store");
  assert.equal((await anonymousResponse.json()).error.code, "UNAUTHENTICATED");

  const operator = service({
    ownerships: [{ studentId: "student-1", operatorId: "operator-1" }]
  }).authorization;
  const ownedHandler = withAuthorizationUsing(
    () => operator,
    { role: "owner", studentId: () => "student-1" },
    async (_request, context) => Response.json({ actorId: context.authorization.id })
  );
  const ownedResponse = await ownedHandler(request);
  assert.equal(ownedResponse.status, 200);
  assert.deepEqual(await ownedResponse.json(), { actorId: "operator-1" });

  const maskedHandler = withAuthorizationUsing(
    () => operator,
    { role: "owner", studentId: () => "another-student" },
    async () => Response.json({ ok: true })
  );
  const maskedResponse = await maskedHandler(request);
  assert.equal(maskedResponse.status, 404);
  assert.equal((await maskedResponse.json()).error.code, "RESOURCE_NOT_FOUND");
});
