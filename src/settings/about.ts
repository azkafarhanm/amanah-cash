import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import packageMetadata from "../../package.json";

export const APPLICATION_VERSION = packageMetadata.version;

export type ChangelogRelease = {
  version: string;
  date?: string;
  groups: Array<{ title: string; items: string[] }>;
};

export async function releasedChangelog(): Promise<ChangelogRelease[]> {
  const source = await readFile(resolve(process.cwd(), "CHANGELOG.md"), "utf8");
  const releases: ChangelogRelease[] = [];
  let release: ChangelogRelease | undefined;
  let group: ChangelogRelease["groups"][number] | undefined;

  for (const line of source.split(/\r?\n/)) {
    const releaseMatch = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?$/.exec(line);
    if (releaseMatch) {
      if (releaseMatch[1] === "Unreleased") {
        release = undefined;
        group = undefined;
        continue;
      }
      release = { version: releaseMatch[1], date: releaseMatch[2], groups: [] };
      releases.push(release);
      group = undefined;
      continue;
    }

    const groupMatch = /^### (.+)$/.exec(line);
    if (groupMatch && release) {
      group = { title: groupMatch[1], items: [] };
      release.groups.push(group);
      continue;
    }

    const itemMatch = /^- (.+)$/.exec(line);
    if (itemMatch && release) {
      if (!group) {
        group = { title: "Perubahan", items: [] };
        release.groups.push(group);
      }
      group.items.push(itemMatch[1]);
    }
  }

  return releases.filter((item) => item.groups.some((entry) => entry.items.length));
}
