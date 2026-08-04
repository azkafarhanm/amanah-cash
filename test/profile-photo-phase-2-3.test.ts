import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const source = (path: string) => readFile(path, "utf8");

test("StudentAvatar renders a photo only when a complete reference exists and otherwise preserves initials", async () => {
  const [studentAvatar, avatar] = await Promise.all([
    source("src/components/students/student-avatar.tsx"),
    source("src/components/ui/avatar.tsx")
  ]);
  assert.match(studentAvatar, /if \(!input\.photoObjectKey \|\| !input\.photoUpdatedAt\) return null/);
  assert.match(studentAvatar, /photo=\{photoUrl/);
  assert.match(studentAvatar, /name=\{name\}/);
  assert.match(studentAvatar, /fallback=\{\{ initials: studentInitials\(name\), background: studentAvatarBackground\(name\) \}\}/);
  assert.match(avatar, /fallback\?\.initials \?\? initialsFor\(fallbackName\)/);
  assert.match(avatar, /\{photo.*\? \(/);
  assert.match(avatar, /event\.currentTarget\.hidden = true/);
});

test("Student avatar sizes reserve exact 40, 56, 64, and 72 pixel circles with a stronger Student-only border", async () => {
  const [component, avatarStyles, studentStyles] = await Promise.all([
    source("src/components/students/student-avatar.tsx"),
    source("src/components/ui/avatar.module.css"),
    source("src/components/students/student-avatar.module.css")
  ]);
  assert.match(component, /compact: "md"/);
  assert.match(component, /list: "studentList"/);
  assert.match(component, /picker: "studentList"/);
  assert.match(component, /dashboard: "studentDashboard"/);
  assert.match(component, /detail: "studentDetail"/);
  assert.match(avatarStyles, /\.md[\s\S]*width: var\(--size-10\)/);
  assert.match(avatarStyles, /\.studentList[\s\S]*width: var\(--size-14\)/);
  assert.match(avatarStyles, /\.studentDashboard[\s\S]*width: var\(--space-16\)/);
  assert.match(avatarStyles, /\.studentDetail[\s\S]*width: calc\(var\(--size-14\) \+ var\(--space-4\)\)/);
  assert.match(studentStyles, /border: var\(--border-width-emphasis\)/);
});

test("Phase 2.3 uses the shared StudentAvatar in every approved Student identity surface", async () => {
  const files = await Promise.all([
    source("src/components/students/student-list.tsx"),
    source("src/components/students/student-detail-header.tsx"),
    source("src/components/transactions/workspace/workspace-student-picker.tsx"),
    source("src/components/dashboard/recent-students.tsx"),
    source("src/components/dashboard/recent-activity.tsx"),
    source("src/app/(app)/(operator)/operator/page.tsx"),
    source("src/app/(app)/(admin)/admin/page.tsx")
  ]);
  for (const file of files) assert.match(file, /StudentAvatar/);
  assert.match(files[0], /size="list"/);
  assert.match(files[1], /size="detail"/);
  assert.match(files[2], /size="picker"/);
  assert.match(files[3], /size="dashboard"/);
  assert.match(files[4], /size="compact"/);
});

test("Student photo metadata is added to existing projections without per-row page queries", async () => {
  const [studentService, dashboard, pickerApi] = await Promise.all([
    source("src/students/service.ts"),
    source("src/dashboard/read-service.ts"),
    source("src/app/api/operator/students/route.ts")
  ]);
  assert.match(studentService, /photoObjectKey: true, photoUpdatedAt: true/);
  assert.match(dashboard, /studentPhotoObjectKey: transaction\.student\.photoObjectKey/);
  assert.match(dashboard, /photoObjectKey: student\.photoObjectKey/);
  assert.match(pickerApi, /studentManagement\(\)\.list/);
  assert.doesNotMatch(pickerApi, /photoObjectKey/);
});

test("Student media reads reuse existing admin and owner authorization policies", async () => {
  const [operatorRoute, adminRoute] = await Promise.all([
    source("src/app/api/operator/students/[id]/photo/content/route.ts"),
    source("src/app/api/admin/students/[id]/photo/content/route.ts")
  ]);
  assert.match(operatorRoute, /role: "owner"/);
  assert.match(adminRoute, /role: "admin"/);
  assert.match(operatorRoute, /studentPhotoResponse/);
  assert.match(adminRoute, /studentPhotoResponse/);
});
