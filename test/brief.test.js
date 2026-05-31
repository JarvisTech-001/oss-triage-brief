import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { buildIssueBrief, buildPullRequestBrief, buildReleaseBrief } from "../src/brief.js";
import { runCli } from "../src/cli.js";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

describe("buildIssueBrief", () => {
  it("creates a focused issue triage brief", () => {
    const brief = buildIssueBrief({
      repo: "example/project",
      number: 42,
      title: "Crash when reviewing a pull request",
      body: "Steps: open a PR, start review, see crash.",
      labels: ["bug", "needs-triage"],
    });

    assert.match(brief, /^# OSS Maintainer Brief/);
    assert.match(brief, /Repository: example\/project/);
    assert.match(brief, /Issue: #42/);
    assert.match(brief, /Labels: bug, needs-triage/);
    assert.match(brief, /Triage this issue and propose the smallest safe next step\./);
    assert.match(brief, /Classification: bug, feature, question, docs, or maintenance\./);
  });

  it("uses an explicit placeholder when the issue body is blank", () => {
    const brief = buildIssueBrief({
      repo: "example/project",
      title: "Document review workflow",
      body: "   ",
    });

    assert.match(brief, /No issue body provided\./);
  });

  it("fails fast with the invalid repo value", () => {
    assert.throws(
      () =>
        buildIssueBrief({
          repo: "",
          title: "Document review workflow",
        }),
      /repo must be a non-empty string; received ""/
    );
  });
});

describe("buildPullRequestBrief", () => {
  it("creates a focused pull request review brief", () => {
    const brief = buildPullRequestBrief({
      repo: "example/project",
      number: 18,
      title: "Add release checklist",
      body: "Adds a release checklist command.",
      base: "main",
      head: "release-checklist",
      changedFiles: ["src/cli.js", "test/brief.test.js"],
    });

    assert.match(brief, /^# OSS Maintainer Brief/);
    assert.match(brief, /Pull request: #18/);
    assert.match(brief, /Base branch: main/);
    assert.match(brief, /Head branch: release-checklist/);
    assert.match(brief, /Changed files:\n- src\/cli\.js\n- test\/brief\.test\.js/);
    assert.match(brief, /Review this pull request for maintainer acceptance\./);
  });

  it("includes risk focus and diff summary when provided", () => {
    const brief = buildPullRequestBrief({
      repo: "example/project",
      number: 23,
      title: "Harden JSON parsing",
      body: "Adds stricter parser errors.",
      base: "main",
      head: "json-errors",
      risk: "security",
      diff: [
        "diff --git a/src/cli.js b/src/cli.js",
        "index 1111111..2222222 100644",
        "--- a/src/cli.js",
        "+++ b/src/cli.js",
        "@@ -1,2 +1,3 @@",
        "-old parser",
        "+new parser",
        "+clear error",
      ].join("\n"),
    });

    assert.match(brief, /Review focus: security/);
    assert.match(brief, /## Diff Summary/);
    assert.match(brief, /- Files touched: 1/);
    assert.match(brief, /- Additions: 2/);
    assert.match(brief, /- Deletions: 1/);
    assert.match(brief, /- src\/cli\.js/);
  });
});

describe("buildReleaseBrief", () => {
  it("creates a focused release checklist brief", () => {
    const brief = buildReleaseBrief({
      repo: "example/project",
      version: "0.2.0",
      changes: "Add GitHub JSON input and release briefs.",
      checks: ["npm run check", "npm pack --dry-run"],
    });

    assert.match(brief, /^# OSS Maintainer Brief/);
    assert.match(brief, /Release: 0\.2\.0/);
    assert.match(brief, /Planned Changes/);
    assert.match(brief, /- npm run check\n- npm pack --dry-run/);
    assert.match(brief, /Prepare this release for maintainer approval\./);
  });
});

describe("runCli", () => {
  it("prints an issue brief from command line flags", () => {
    const writes = [];
    const code = runCli(
      [
        "issue",
        "--repo",
        "example/project",
        "--number",
        "7",
        "--title",
        "Needs release checklist",
        "--body",
        "Release notes are missing.",
        "--label",
        "maintenance",
      ],
      {
        stdout: { write: (value) => writes.push(value) },
        stderr: { write: () => {} },
      }
    );

    assert.equal(code, 0);
    assert.match(writes.join(""), /Issue: #7/);
    assert.match(writes.join(""), /Release notes are missing\./);
  });

  it("prints a pull request brief from command line flags", () => {
    const writes = [];
    const code = runCli(
      [
        "pr",
        "--repo",
        "example/project",
        "--number",
        "12",
        "--title",
        "Add review command",
        "--body",
        "Adds a review command for maintainers.",
        "--base",
        "main",
        "--head",
        "review-command",
        "--changed-file",
        "src/cli.js",
      ],
      {
        stdout: { write: (value) => writes.push(value) },
        stderr: { write: () => {} },
      }
    );

    assert.equal(code, 0);
    assert.match(writes.join(""), /Pull request: #12/);
    assert.match(writes.join(""), /Changed files:\n- src\/cli\.js/);
  });

  it("prints an issue brief from GitHub JSON on stdin", () => {
    const writes = [];
    const code = runCli(["issue", "--from-json"], {
      stdinText: JSON.stringify({
        url: "https://github.com/example/project/issues/19",
        title: "CLI should read GitHub issue JSON",
        body: "Generated by gh issue view.",
        labels: [{ name: "enhancement" }, { name: "roadmap" }],
      }),
      stdout: { write: (value) => writes.push(value) },
      stderr: { write: () => {} },
    });

    assert.equal(code, 0);
    assert.match(writes.join(""), /Repository: example\/project/);
    assert.match(writes.join(""), /Issue: #19/);
    assert.match(writes.join(""), /Labels: enhancement, roadmap/);
  });

  it("prints a pull request brief from GitHub JSON on stdin", () => {
    const writes = [];
    const code = runCli(["pr", "--from-json"], {
      stdinText: JSON.stringify({
        url: "https://github.com/example/project/pull/22",
        title: "Add JSON input",
        body: "Reads gh JSON output.",
        baseRefName: "main",
        headRefName: "json-input",
        files: [{ path: "src/cli.js" }, { path: "test/brief.test.js" }],
      }),
      stdout: { write: (value) => writes.push(value) },
      stderr: { write: () => {} },
    });

    assert.equal(code, 0);
    assert.match(writes.join(""), /Repository: example\/project/);
    assert.match(writes.join(""), /Pull request: #22/);
    assert.match(writes.join(""), /Base branch: main/);
    assert.match(writes.join(""), /Head branch: json-input/);
    assert.match(writes.join(""), /Changed files:\n- src\/cli\.js\n- test\/brief\.test\.js/);
  });

  it("prints a release brief from command line flags", () => {
    const writes = [];
    const code = runCli(
      [
        "release",
        "--repo",
        "example/project",
        "--version",
        "0.2.0",
        "--changes",
        "Add JSON input and release briefs.",
        "--check",
        "npm run check",
      ],
      {
        stdout: { write: (value) => writes.push(value) },
        stderr: { write: () => {} },
      }
    );

    assert.equal(code, 0);
    assert.match(writes.join(""), /Release: 0\.2\.0/);
    assert.match(writes.join(""), /Add JSON input and release briefs\./);
    assert.match(writes.join(""), /- npm run check/);
  });

  it("prints a focused PR risk brief with diff input", () => {
    const writes = [];
    const code = runCli(
      [
        "pr",
        "--repo",
        "example/project",
        "--number",
        "24",
        "--title",
        "Harden parser",
        "--body",
        "Adds stricter parser errors.",
        "--base",
        "main",
        "--head",
        "parser-hardening",
        "--risk",
        "security",
        "--diff",
        "diff --git a/src/cli.js b/src/cli.js\n--- a/src/cli.js\n+++ b/src/cli.js\n@@ -1 +1,2 @@\n-old\n+new\n+safe",
      ],
      {
        stdout: { write: (value) => writes.push(value) },
        stderr: { write: () => {} },
      }
    );

    assert.equal(code, 0);
    assert.match(writes.join(""), /Review focus: security/);
    assert.match(writes.join(""), /Changed files:\n- src\/cli\.js/);
    assert.match(writes.join(""), /- Additions: 2/);
  });

  it("returns a non-zero code when required flags are missing", () => {
    const errors = [];
    const code = runCli(["issue", "--repo", "example/project"], {
      stdout: { write: () => {} },
      stderr: { write: (value) => errors.push(value) },
    });

    assert.equal(code, 1);
    assert.match(errors.join(""), /--title must be a non-empty string/);
  });
});

describe("package metadata", () => {
  it("keeps the published CLI entry executable", () => {
    assert.equal(packageJson.bin["oss-triage-brief"], "src/cli.js");
  });
});
